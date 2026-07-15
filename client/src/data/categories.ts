import { Category } from '@/types/game'

export const BUILTIN_CATEGORY_NAMES = [
  { id: 'none', name: 'None (Ordered List)' },
  { id: 'football-team', name: 'Football Team' },
  { id: 'basketball-team', name: 'Basketball Team' },
  { id: 'baseball-team', name: 'Baseball Team' },
  { id: 'medieval-court', name: 'Medieval Court' },
  { id: 'wild-west-town', name: 'Wild West Town' },
  { id: 'pirate-ship', name: 'Pirate Ship' },
  { id: 'superhero-team', name: 'Superhero Team' },
  { id: 'heist-crew', name: 'Heist Crew' },
  { id: 'space-crew', name: 'Space Crew' },
]

const STORAGE_KEY = 'draftcraft_custom_categories'

export function getCustomCategories(): Category[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function saveCustomCategory(cat: Category) {
  const cats = getCustomCategories().filter(c => c.id !== cat.id)
  cats.push(cat)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
}

export function deleteCustomCategory(id: string) {
  const cats = getCustomCategories().filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
}
