import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Bank } from '@/types/game'
import { BUILTIN_BANK_NAMES, getCustomBanks, saveCustomBank, deleteCustomBank } from '@/data/banks'

export default function EditBanksPage() {
  const navigate = useNavigate()
  const [banks, setBanks] = useState<Bank[]>(getCustomBanks)
  const [editing, setEditing] = useState<Bank | null>(null)
  const [newName, setNewName] = useState('')
  const [newItemText, setNewItemText] = useState('')

  const refresh = () => setBanks(getCustomBanks())

  const handleCreate = () => {
    if (!newName.trim()) return
    const bank: Bank = { id: uuidv4(), name: newName.trim(), items: [], isCustom: true }
    saveCustomBank(bank)
    setNewName('')
    setEditing(bank)
    refresh()
  }

  const handleDeleteBank = (id: string) => {
    deleteCustomBank(id)
    if (editing?.id === id) setEditing(null)
    refresh()
  }

  const handleAddItem = () => {
    if (!editing || !newItemText.trim()) return
    const lines = newItemText.split('\n').map(l => l.trim()).filter(Boolean)
    const updated: Bank = {
      ...editing,
      items: [
        ...editing.items,
        ...lines.map(name => ({ id: uuidv4(), name })),
      ],
    }
    saveCustomBank(updated)
    setEditing(updated)
    setNewItemText('')
    refresh()
  }

  const handleRemoveItem = (itemId: string) => {
    if (!editing) return
    const updated: Bank = { ...editing, items: editing.items.filter(i => i.id !== itemId) }
    saveCustomBank(updated)
    setEditing(updated)
    refresh()
  }

  const handleRenameBank = (name: string) => {
    if (!editing) return
    const updated: Bank = { ...editing, name }
    saveCustomBank(updated)
    setEditing(updated)
    refresh()
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <button className="btn-ghost mb-6 -ml-2" onClick={() => navigate('/')}>← Back</button>
      <h1 className="text-3xl font-bold mb-2">Draftee Banks</h1>
      <p className="text-gray-500 text-sm mb-6">Built-in banks are read-only. Create custom banks to add your own.</p>

      {/* Built-in list */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Built-in</h2>
        <div className="space-y-1">
          {BUILTIN_BANK_NAMES.map(b => (
            <div key={b.id} className="card px-4 py-2.5 text-sm text-gray-400">{b.name}</div>
          ))}
        </div>
      </div>

      {/* Custom banks */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Custom</h2>
        {banks.length === 0 && <p className="text-gray-600 text-sm mb-3">No custom banks yet</p>}
        <div className="space-y-1">
          {banks.map(b => (
            <div key={b.id} className="card px-4 py-2.5 flex items-center gap-3">
              <span className="flex-1 text-sm font-medium">{b.name}</span>
              <span className="text-gray-600 text-xs">{b.items.length} items</span>
              <button className="btn-ghost text-xs py-1 px-2" onClick={() => setEditing(b)}>Edit</button>
              <button className="btn-ghost text-xs py-1 px-2 text-red-400" onClick={() => handleDeleteBank(b.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* Create new */}
      <div className="card p-4 flex gap-3">
        <input
          className="input flex-1 text-sm py-2"
          placeholder="New bank name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button className="btn-primary text-sm py-2 px-4" onClick={handleCreate}>Create</button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="mt-6 card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <input
              className="input flex-1 font-bold text-lg"
              value={editing.name}
              onChange={e => handleRenameBank(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Add items (one per line)</label>
            <textarea
              className="input text-sm resize-none"
              rows={4}
              placeholder="Name 1&#10;Name 2&#10;Name 3"
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
            />
            <button className="btn-secondary text-sm py-2 mt-2 w-full" onClick={handleAddItem}>
              Add Items
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Items ({editing.items.length})</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {editing.items.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 text-gray-300">{item.name}</span>
                  <button className="text-gray-600 hover:text-red-400 text-xs" onClick={() => handleRemoveItem(item.id)}>✕</button>
                </div>
              ))}
              {editing.items.length === 0 && <p className="text-gray-600 text-sm">No items yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
