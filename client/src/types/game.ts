export interface BankItem {
  id: string
  name: string
}

export interface Bank {
  id: string
  name: string
  items: BankItem[]
  isCustom?: boolean
}

export interface CategoryPosition {
  id: string
  label: string
}

export interface Category {
  id: string
  name: string
  positions: CategoryPosition[]
  isCustom?: boolean
  isNone?: boolean
}

export interface PreDraftItem {
  drafteeId: string
  positionId: string
  positionLabel: string
}

export interface PlayerPick {
  positionId: string
  positionLabel: string
  drafteeId: string
  drafteeeName: string
}

export interface Player {
  id: string
  name: string
  picks: PlayerPick[]
  preDraft: PreDraftItem[]
  watchlist: string[]
  connected: boolean
}

export interface DraftSettings {
  snakeDraft: boolean
  timerSeconds: number | null
  allowSwaps: boolean
  roundCount: number | null
}

export type RoomPhase = 'lobby' | 'drafting' | 'complete'

export interface DraftState {
  currentPickIndex: number
  pickOrder: string[]
  timerExpiresAt: number | null
  pendingAutoPick: boolean
}

export interface RoomState {
  code: string
  phase: RoomPhase
  hostId: string
  players: Player[]
  bankId: string
  bankName: string
  availableDraftees: BankItem[]
  category: Category
  settings: DraftSettings
  draft: DraftState | null
  createdAt: number
}

export type ServerMessage =
  | { type: 'room_state'; state: RoomState }
  | { type: 'your_id'; playerId: string }
  | { type: 'error'; message: string }
  | { type: 'auto_pick_prompt'; pick: PreDraftItem; drafteeeName: string }

export type ClientMessage =
  | { type: 'create_room'; bankId: string; categoryId: string; settings: DraftSettings; customBank?: Bank; customCategory?: Category }
  | { type: 'join_room'; code: string; playerName: string }
  | { type: 'start_draft' }
  | { type: 'make_pick'; drafteeId: string; positionId: string }
  | { type: 'pre_draft_add'; drafteeId: string; positionId: string }
  | { type: 'pre_draft_remove'; index: number }
  | { type: 'pre_draft_reorder'; from: number; to: number }
  | { type: 'watchlist_add'; drafteeId: string }
  | { type: 'watchlist_remove'; drafteeId: string }
  | { type: 'swap_picks'; positionIdA: string; positionIdB: string }
  | { type: 'confirm_auto_pick' }
  | { type: 'skip_auto_pick' }
  | { type: 'end_draft' }

export interface SavedDraft {
  id: string
  savedAt: number
  bankName: string
  categoryName: string
  players: { name: string; picks: PlayerPick[] }[]
}
