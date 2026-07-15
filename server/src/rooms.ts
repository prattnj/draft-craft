import { RoomState, Player, ClientMessage, ServerMessage, DraftState, PreDraftItem, Category } from './types'
import { BANKS, CATEGORIES } from './data'
import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'

const rooms = new Map<string, RoomState>()
const socketToPlayer = new Map<WebSocket, { roomCode: string; playerId: string }>()
const playerToSocket = new Map<string, WebSocket>()
const timerTimeouts = new Map<string, NodeJS.Timeout>()

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return rooms.has(code) ? generateCode() : code
}

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
}

function broadcast(roomCode: string, msg: ServerMessage, exclude?: string) {
  const room = rooms.get(roomCode)
  if (!room) return
  for (const player of room.players) {
    if (player.id === exclude) continue
    const ws = playerToSocket.get(player.id)
    if (ws) send(ws, msg)
  }
}

function broadcastState(roomCode: string) {
  const room = rooms.get(roomCode)
  if (!room) return
  // Send to host (not in players[])
  const hostWs = playerToSocket.get(room.hostId)
  if (hostWs) send(hostWs, { type: 'room_state', state: room })
  // Send to all players
  for (const player of room.players) {
    const ws = playerToSocket.get(player.id)
    if (ws) send(ws, { type: 'room_state', state: room })
  }
}

function buildPickOrder(playerIds: string[], totalRounds: number, snake: boolean): string[] {
  const order: string[] = []
  for (let round = 0; round < totalRounds; round++) {
    const roundOrder = snake && round % 2 === 1 ? [...playerIds].reverse() : [...playerIds]
    order.push(...roundOrder)
  }
  return order
}

function currentPickerId(room: RoomState): string | null {
  if (!room.draft) return null
  return room.draft.pickOrder[room.draft.currentPickIndex] ?? null
}

function isComplete(room: RoomState): boolean {
  if (!room.draft) return false
  return room.draft.currentPickIndex >= room.draft.pickOrder.length
}

function clearTimer(roomCode: string) {
  const t = timerTimeouts.get(roomCode)
  if (t) { clearTimeout(t); timerTimeouts.delete(roomCode) }
}

function startTimer(roomCode: string) {
  const room = rooms.get(roomCode)
  if (!room?.settings.timerSeconds || !room.draft) return
  clearTimer(roomCode)
  const expiresAt = Date.now() + room.settings.timerSeconds * 1000
  room.draft.timerExpiresAt = expiresAt
  const t = setTimeout(() => {
    autoPickOrSkip(roomCode)
  }, room.settings.timerSeconds * 1000)
  timerTimeouts.set(roomCode, t)
}

function autoPickOrSkip(roomCode: string) {
  const room = rooms.get(roomCode)
  if (!room || room.phase !== 'drafting') return
  const pickerId = currentPickerId(room)
  if (!pickerId) return
  const picker = room.players.find(p => p.id === pickerId)
  if (!picker) return
  if (picker.preDraft.length > 0) {
    const next = picker.preDraft.find(pd => room.availableDraftees.some(d => d.id === pd.drafteeId))
    if (next) {
      applyPick(room, pickerId, next.drafteeId, next.positionId)
      picker.preDraft = picker.preDraft.filter(pd => pd !== next)
      advanceDraft(roomCode)
      return
    }
  }
  // skip turn
  advanceDraft(roomCode)
}

function applyPick(room: RoomState, playerId: string, drafteeId: string, positionId: string) {
  const draftee = room.availableDraftees.find(d => d.id === drafteeId)
  if (!draftee) return false
  const player = room.players.find(p => p.id === playerId)
  if (!player) return false

  let posLabel = positionId
  if (room.category.isNone) {
    posLabel = `Pick ${player.picks.length + 1}`
    positionId = `pick-${player.picks.length + 1}`
  } else {
    const pos = room.category.positions.find(p => p.id === positionId)
    if (!pos) return false
    if (player.picks.some(pk => pk.positionId === positionId)) return false
    posLabel = pos.label
  }

  player.picks.push({ positionId, positionLabel: posLabel, drafteeId, drafteeeName: draftee.name })
  room.availableDraftees = room.availableDraftees.filter(d => d.id !== drafteeId)

  // clear pre-drafts pointing at this draftee for all players
  for (const p of room.players) {
    p.preDraft = p.preDraft.filter(pd => pd.drafteeId !== drafteeId)
    p.watchlist = p.watchlist.filter(id => id !== drafteeId)
  }
  return true
}

function advanceDraft(roomCode: string) {
  const room = rooms.get(roomCode)
  if (!room || !room.draft) return
  clearTimer(roomCode)
  room.draft.timerExpiresAt = null
  room.draft.pendingAutoPick = false
  room.draft.currentPickIndex++

  if (isComplete(room)) {
    room.phase = 'complete'
    broadcastState(roomCode)
    return
  }

  const pickerId = currentPickerId(room)!
  const picker = room.players.find(p => p.id === pickerId)!

  const firstValid = picker.preDraft.find(pd => room.availableDraftees.some(d => d.id === pd.drafteeId))
  if (firstValid) {
    room.draft.pendingAutoPick = true
    broadcastState(roomCode)
    const ws = playerToSocket.get(pickerId)
    if (ws) {
      const draftee = room.availableDraftees.find(d => d.id === firstValid.drafteeId)!
      send(ws, { type: 'auto_pick_prompt', pick: firstValid, drafteeeName: draftee.name })
    }
    startTimer(roomCode)
    return
  }

  broadcastState(roomCode)
  startTimer(roomCode)
}

export function handleConnection(ws: WebSocket) {
  ws.on('message', (raw) => {
    let msg: ClientMessage
    try { msg = JSON.parse(raw.toString()) } catch { return }
    handleMessage(ws, msg)
  })

  ws.on('close', () => {
    const info = socketToPlayer.get(ws)
    if (!info) return
    socketToPlayer.delete(ws)
    playerToSocket.delete(info.playerId)
    const room = rooms.get(info.roomCode)
    if (!room) return
    const player = room.players.find(p => p.id === info.playerId)
    if (player) player.connected = false
    broadcastState(info.roomCode)
  })
}

function handleMessage(ws: WebSocket, msg: ClientMessage) {
  switch (msg.type) {
    case 'create_room': {
      let bank = BANKS.find(b => b.id === msg.bankId)
      let category = CATEGORIES.find(c => c.id === msg.categoryId)

      if (msg.customBank) bank = msg.customBank
      if (msg.customCategory) category = msg.customCategory

      if (!bank || !category) {
        send(ws, { type: 'error', message: 'Invalid bank or category' })
        return
      }

      const code = generateCode()
      const hostId = uuidv4()

      const room: RoomState = {
        code,
        phase: 'lobby',
        hostId,
        players: [],
        bankId: bank.id,
        bankName: bank.name,
        availableDraftees: [...bank.items],
        category,
        settings: msg.settings,
        draft: null,
        createdAt: Date.now(),
      }

      rooms.set(code, room)
      socketToPlayer.set(ws, { roomCode: code, playerId: hostId })
      playerToSocket.set(hostId, ws)

      send(ws, { type: 'your_id', playerId: hostId })
      send(ws, { type: 'room_state', state: room })
      break
    }

    case 'join_room': {
      const code = msg.code.toUpperCase().trim()
      const room = rooms.get(code)
      if (!room) { send(ws, { type: 'error', message: 'Room not found' }); return }
      if (room.phase !== 'lobby') { send(ws, { type: 'error', message: 'Draft already in progress' }); return }
      if (room.players.length >= 8) {
        send(ws, { type: 'error', message: 'Room is full (max 8 players)' }); return
      }
      if (!msg.playerName?.trim()) { send(ws, { type: 'error', message: 'Name required' }); return }

      const playerId = uuidv4()
      room.players.push({
        id: playerId,
        name: msg.playerName.trim(),
        picks: [],
        preDraft: [],
        watchlist: [],
        connected: true,
      })

      socketToPlayer.set(ws, { roomCode: code, playerId })
      playerToSocket.set(playerId, ws)

      send(ws, { type: 'your_id', playerId })
      broadcastState(code)
      break
    }

    case 'start_draft': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      if (room.hostId !== info.playerId) { send(ws, { type: 'error', message: 'Only the host can start' }); return }
      if (room.players.length < 2) { send(ws, { type: 'error', message: 'Need at least 2 players' }); return }
      if (room.phase !== 'lobby') return

      const playerIds = room.players.map(p => p.id)
      const shuffled = [...playerIds].sort(() => Math.random() - 0.5)

      const totalPositions = room.category.isNone
        ? (room.settings.roundCount ?? 10)
        : room.category.positions.length

      const pickOrder = buildPickOrder(shuffled, totalPositions, room.settings.snakeDraft)

      const draft: DraftState = {
        currentPickIndex: 0,
        pickOrder,
        timerExpiresAt: null,
        pendingAutoPick: false,
      }

      room.draft = draft
      room.phase = 'drafting'

      broadcastState(info.roomCode)
      startTimer(info.roomCode)
      break
    }

    case 'make_pick': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room || room.phase !== 'drafting' || !room.draft) return
      if (currentPickerId(room) !== info.playerId) {
        send(ws, { type: 'error', message: 'Not your turn' }); return
      }
      if (room.draft.pendingAutoPick) return

      const ok = applyPick(room, info.playerId, msg.drafteeId, msg.positionId)
      if (!ok) { send(ws, { type: 'error', message: 'Invalid pick' }); return }
      advanceDraft(info.roomCode)
      break
    }

    case 'confirm_auto_pick': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room || !room.draft?.pendingAutoPick) return
      if (currentPickerId(room) !== info.playerId) return
      const picker = room.players.find(p => p.id === info.playerId)!
      const first = picker.preDraft.find(pd => room.availableDraftees.some(d => d.id === pd.drafteeId))
      if (!first) { room.draft.pendingAutoPick = false; broadcastState(info.roomCode); return }
      picker.preDraft = picker.preDraft.filter(pd => pd !== first)
      applyPick(room, info.playerId, first.drafteeId, first.positionId)
      advanceDraft(info.roomCode)
      break
    }

    case 'skip_auto_pick': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room || !room.draft?.pendingAutoPick) return
      if (currentPickerId(room) !== info.playerId) return
      const picker = room.players.find(p => p.id === info.playerId)!
      const first = picker.preDraft.find(pd => room.availableDraftees.some(d => d.id === pd.drafteeId))
      if (first) picker.preDraft = picker.preDraft.filter(pd => pd !== first)
      room.draft.pendingAutoPick = false
      broadcastState(info.roomCode)
      startTimer(info.roomCode)
      break
    }

    case 'pre_draft_add': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      const player = room.players.find(p => p.id === info.playerId)
      if (!player) return
      if (!room.availableDraftees.some(d => d.id === msg.drafteeId)) {
        send(ws, { type: 'error', message: 'Draftee not available' }); return
      }
      const posLabel = room.category.isNone
        ? 'Next available'
        : room.category.positions.find(p => p.id === msg.positionId)?.label ?? msg.positionId
      player.preDraft.push({ drafteeId: msg.drafteeId, positionId: msg.positionId, positionLabel: posLabel })
      broadcastState(info.roomCode)
      break
    }

    case 'pre_draft_remove': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      const player = room.players.find(p => p.id === info.playerId)
      if (!player) return
      player.preDraft.splice(msg.index, 1)
      broadcastState(info.roomCode)
      break
    }

    case 'pre_draft_reorder': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      const player = room.players.find(p => p.id === info.playerId)
      if (!player) return
      const [item] = player.preDraft.splice(msg.from, 1)
      player.preDraft.splice(msg.to, 0, item)
      broadcastState(info.roomCode)
      break
    }

    case 'watchlist_add': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      const player = room.players.find(p => p.id === info.playerId)
      if (!player || player.watchlist.includes(msg.drafteeId)) return
      player.watchlist.push(msg.drafteeId)
      send(ws, { type: 'room_state', state: room })
      break
    }

    case 'watchlist_remove': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      const player = room.players.find(p => p.id === info.playerId)
      if (!player) return
      player.watchlist = player.watchlist.filter(id => id !== msg.drafteeId)
      send(ws, { type: 'room_state', state: room })
      break
    }

    case 'swap_picks': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room?.settings.allowSwaps) return
      if (room.category.isNone) return
      const player = room.players.find(p => p.id === info.playerId)
      if (!player) return
      const a = player.picks.find(pk => pk.positionId === msg.positionIdA)
      const b = player.picks.find(pk => pk.positionId === msg.positionIdB)
      if (!a || !b) return
      const tmpId = a.positionId; const tmpLabel = a.positionLabel
      a.positionId = b.positionId; a.positionLabel = b.positionLabel
      b.positionId = tmpId; b.positionLabel = tmpLabel
      broadcastState(info.roomCode)
      break
    }

    case 'end_draft': {
      const info = socketToPlayer.get(ws)
      if (!info) return
      const room = rooms.get(info.roomCode)
      if (!room) return
      if (room.hostId !== info.playerId) return
      clearTimer(info.roomCode)
      room.phase = 'complete'
      broadcastState(info.roomCode)
      break
    }
  }
}

export function getRooms() { return rooms }
