import { Bank } from '@/types/game'

export const BUILTIN_BANK_NAMES = [
  { id: 'famous-people', name: 'Famous People' },
  { id: 'nba-players', name: 'NBA Players' },
  { id: 'us-cities', name: 'US Cities' },
  { id: 'rock-bands', name: 'Rock Bands' },
  { id: 'us-presidents', name: 'US Presidents' },
  { id: 'bible-characters', name: 'Bible Characters' },
  { id: 'movie-characters', name: 'Movie Characters' },
  { id: 'nfl-players', name: 'NFL Players' },
  { id: 'countries', name: 'Countries' },
]

const STORAGE_KEY = 'draftcraft_custom_banks'

export function getCustomBanks(): Bank[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function saveCustomBank(bank: Bank) {
  const banks = getCustomBanks().filter(b => b.id !== bank.id)
  banks.push(bank)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banks))
}

export function deleteCustomBank(id: string) {
  const banks = getCustomBanks().filter(b => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banks))
}
