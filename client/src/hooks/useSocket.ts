import { useCallback } from 'react'
import { ClientMessage, ServerMessage } from '@/types/game'
import { useGameStore } from '@/store/gameStore'

// In dev, Vite proxies /ws → localhost:3014. In production, set VITE_WS_URL explicitly.
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined
  ?? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`

// Module-level singleton — survives React navigation/unmounts
let _ws: WebSocket | null = null

function onMessage(ev: MessageEvent) {
  const msg: ServerMessage = JSON.parse(ev.data)
  const store = useGameStore.getState()
  switch (msg.type) {
    case 'room_state':
      store.setRoom(msg.state)
      break
    case 'your_id':
      store.setMyId(msg.playerId)
      break
    case 'error':
      store.setError(msg.message)
      break
    case 'auto_pick_prompt':
      store.setAutoPick(msg)
      break
  }
}

function ensureConnected(): WebSocket {
  if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) {
    return _ws
  }
  const ws = new WebSocket(WS_URL)
  ws.onmessage = onMessage
  ws.onclose = () => { _ws = null }
  _ws = ws
  return ws
}

export function useSocket() {
  const send = useCallback((msg: ClientMessage) => {
    const ws = ensureConnected()
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    } else {
      ws.addEventListener('open', () => ws.send(JSON.stringify(msg)), { once: true })
    }
  }, [])

  return { send }
}
