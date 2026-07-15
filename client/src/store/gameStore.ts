import { create } from 'zustand'
import { RoomState, PreDraftItem } from '@/types/game'

interface AutoPickPrompt {
  pick: PreDraftItem
  drafteeeName: string
}

interface GameStore {
  room: RoomState | null
  myId: string | null
  error: string | null
  autoPick: AutoPickPrompt | null
  setRoom: (room: RoomState) => void
  setMyId: (id: string) => void
  setError: (err: string | null) => void
  setAutoPick: (ap: AutoPickPrompt | null) => void
  clearRoom: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  myId: null,
  error: null,
  autoPick: null,
  setRoom: (room) => set({ room, autoPick: room.draft?.pendingAutoPick ? undefined : null }),
  setMyId: (myId) => set({ myId }),
  setError: (error) => set({ error }),
  setAutoPick: (autoPick) => set({ autoPick }),
  clearRoom: () => set({ room: null, myId: null, autoPick: null, error: null }),
}))
