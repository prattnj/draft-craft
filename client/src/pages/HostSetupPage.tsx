import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useGameStore } from '@/store/gameStore'
import { DraftSettings } from '@/types/game'
import { BUILTIN_BANK_NAMES, getCustomBanks } from '@/data/banks'
import { BUILTIN_CATEGORY_NAMES, getCustomCategories } from '@/data/categories'

const DEFAULT_SETTINGS: DraftSettings = {
  snakeDraft: true,
  timerSeconds: null,
  allowSwaps: false,
  roundCount: null,
}

export default function HostSetupPage() {
  const navigate = useNavigate()
  const { send } = useSocket()
  const { room, error, setError } = useGameStore()

  const [bankId, setBankId] = useState('famous-people')
  const [categoryId, setCategoryId] = useState('none')
  const [settings, setSettings] = useState<DraftSettings>(DEFAULT_SETTINGS)
  const [timerInput, setTimerInput] = useState('')
  const [roundInput, setRoundInput] = useState('10')

  const customBanks = getCustomBanks()
  const customCategories = getCustomCategories()

  const isNone = categoryId === 'none' || customCategories.find(c => c.id === categoryId)?.isNone

  const handleCreate = () => {
    setError(null)

    const customBank = customBanks.find(b => b.id === bankId)
    const customCategory = customCategories.find(c => c.id === categoryId)

    const finalSettings: DraftSettings = {
      ...settings,
      timerSeconds: timerInput ? parseInt(timerInput) : null,
      roundCount: isNone ? parseInt(roundInput) || 10 : null,
    }

    send({
      type: 'create_room',
      bankId,
      categoryId,
      settings: finalSettings,
      ...(customBank ? { customBank } : {}),
      ...(customCategory ? { customCategory } : {}),
    })
  }

  if (room) {
    navigate('/room')
    return null
  }

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <button className="btn-ghost mb-6 -ml-2" onClick={() => navigate('/')}>← Back</button>
      <h1 className="text-3xl font-bold mb-8">Host a Game</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Draftee Bank</label>
          <select className="input" value={bankId} onChange={e => setBankId(e.target.value)}>
            <optgroup label="Built-in">
              {BUILTIN_BANK_NAMES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </optgroup>
            {customBanks.length > 0 && (
              <optgroup label="Custom">
                {customBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </optgroup>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Category / Positions</label>
          <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <optgroup label="Built-in">
              {BUILTIN_CATEGORY_NAMES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
            {customCategories.length > 0 && (
              <optgroup label="Custom">
                {customCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            )}
          </select>
        </div>

        {isNone && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Picks per player</label>
            <input
              className="input"
              type="number"
              min={1}
              max={30}
              value={roundInput}
              onChange={e => setRoundInput(e.target.value)}
            />
          </div>
        )}

        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-300">Settings</h3>

          <Toggle
            label="Snake Draft"
            description="Draft order reverses each round"
            checked={settings.snakeDraft}
            onChange={v => setSettings(s => ({ ...s, snakeDraft: v }))}
          />

          <Toggle
            label="Allow Position Swaps"
            description="Players can swap their drafted positions"
            checked={settings.allowSwaps}
            onChange={v => setSettings(s => ({ ...s, allowSwaps: v }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Pick Timer (seconds)</label>
            <p className="text-xs text-gray-500 mb-2">Leave blank for no timer</p>
            <input
              className="input"
              type="number"
              min={5}
              max={300}
              placeholder="No timer"
              value={timerInput}
              onChange={e => setTimerInput(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button className="btn-primary w-full text-lg py-4" onClick={handleCreate}>
          Create Room
        </button>
      </div>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-medium text-gray-200">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-gray-700'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  )
}
