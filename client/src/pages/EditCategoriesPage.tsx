import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Category } from '@/types/game'
import { BUILTIN_CATEGORY_NAMES, getCustomCategories, saveCustomCategory, deleteCustomCategory } from '@/data/categories'

export default function EditCategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>(getCustomCategories)
  const [editing, setEditing] = useState<Category | null>(null)
  const [newName, setNewName] = useState('')
  const [newPosLabel, setNewPosLabel] = useState('')

  const refresh = () => setCategories(getCustomCategories())

  const handleCreate = () => {
    if (!newName.trim()) return
    const cat: Category = { id: uuidv4(), name: newName.trim(), positions: [], isCustom: true }
    saveCustomCategory(cat)
    setNewName('')
    setEditing(cat)
    refresh()
  }

  const handleDeleteCat = (id: string) => {
    deleteCustomCategory(id)
    if (editing?.id === id) setEditing(null)
    refresh()
  }

  const handleAddPosition = () => {
    if (!editing || !newPosLabel.trim()) return
    const lines = newPosLabel.split('\n').map(l => l.trim()).filter(Boolean)
    const updated: Category = {
      ...editing,
      positions: [...editing.positions, ...lines.map(label => ({ id: uuidv4(), label }))],
    }
    saveCustomCategory(updated)
    setEditing(updated)
    setNewPosLabel('')
    refresh()
  }

  const handleRemovePos = (posId: string) => {
    if (!editing) return
    const updated: Category = { ...editing, positions: editing.positions.filter(p => p.id !== posId) }
    saveCustomCategory(updated)
    setEditing(updated)
    refresh()
  }

  const handleRename = (name: string) => {
    if (!editing) return
    const updated: Category = { ...editing, name }
    saveCustomCategory(updated)
    setEditing(updated)
    refresh()
  }

  const handleToggleNone = (isNone: boolean) => {
    if (!editing) return
    const updated: Category = { ...editing, isNone }
    saveCustomCategory(updated)
    setEditing(updated)
    refresh()
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <button className="btn-ghost mb-6 -ml-2" onClick={() => navigate('/')}>← Back</button>
      <h1 className="text-3xl font-bold mb-2">Categories</h1>
      <p className="text-gray-500 text-sm mb-6">Define roles/positions that players draft into.</p>

      {/* Built-in */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Built-in</h2>
        <div className="space-y-1">
          {BUILTIN_CATEGORY_NAMES.map(c => (
            <div key={c.id} className="card px-4 py-2.5 text-sm text-gray-400">{c.name}</div>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Custom</h2>
        {categories.length === 0 && <p className="text-gray-600 text-sm mb-3">No custom categories yet</p>}
        <div className="space-y-1">
          {categories.map(c => (
            <div key={c.id} className="card px-4 py-2.5 flex items-center gap-3">
              <span className="flex-1 text-sm font-medium">{c.name}</span>
              <span className="text-gray-600 text-xs">{c.isNone ? 'ordered list' : `${c.positions.length} positions`}</span>
              <button className="btn-ghost text-xs py-1 px-2" onClick={() => setEditing(c)}>Edit</button>
              <button className="btn-ghost text-xs py-1 px-2 text-red-400" onClick={() => handleDeleteCat(c.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* Create */}
      <div className="card p-4 flex gap-3">
        <input
          className="input flex-1 text-sm py-2"
          placeholder="New category name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button className="btn-primary text-sm py-2 px-4" onClick={handleCreate}>Create</button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="mt-6 card p-5 space-y-4">
          <input
            className="input font-bold text-lg"
            value={editing.name}
            onChange={e => handleRename(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-200 text-sm">Ordered list (no positions)</div>
              <div className="text-xs text-gray-500">Use when there are no specific roles</div>
            </div>
            <button
              onClick={() => handleToggleNone(!editing.isNone)}
              className={`relative w-12 h-6 rounded-full transition-colors ${editing.isNone ? 'bg-brand-600' : 'bg-gray-700'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${editing.isNone ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {!editing.isNone && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Add positions (one per line)</label>
                <textarea
                  className="input text-sm resize-none"
                  rows={3}
                  placeholder="QB&#10;RB&#10;WR"
                  value={newPosLabel}
                  onChange={e => setNewPosLabel(e.target.value)}
                />
                <button className="btn-secondary text-sm py-2 mt-2 w-full" onClick={handleAddPosition}>
                  Add Positions
                </button>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-400 mb-2">Positions ({editing.positions.length})</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {editing.positions.map((pos, i) => (
                    <div key={pos.id} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-5 text-xs">{i + 1}.</span>
                      <span className="flex-1 text-gray-300">{pos.label}</span>
                      <button className="text-gray-600 hover:text-red-400 text-xs" onClick={() => handleRemovePos(pos.id)}>✕</button>
                    </div>
                  ))}
                  {editing.positions.length === 0 && <p className="text-gray-600 text-sm">No positions yet</p>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
