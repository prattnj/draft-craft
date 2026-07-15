import { SavedDraft, RoomState } from '@/types/game'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'draftcraft_past_drafts'

export function saveDraft(room: RoomState) {
  const draft: SavedDraft = {
    id: uuidv4(),
    savedAt: Date.now(),
    bankName: room.bankName,
    categoryName: room.category.name,
    players: room.players.map(p => ({ name: p.name, picks: p.picks })),
  }
  const all = getPastDrafts()
  all.unshift(draft)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50)))
}

export function getPastDrafts(): SavedDraft[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function deleteDraft(id: string) {
  const all = getPastDrafts().filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
