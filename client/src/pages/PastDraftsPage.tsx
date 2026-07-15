import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPastDrafts, deleteDraft } from '@/data/drafts'
import { SavedDraft } from '@/types/game'

export default function PastDraftsPage() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<SavedDraft[]>(getPastDrafts)
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    deleteDraft(id)
    setDrafts(getPastDrafts())
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <button className="btn-ghost mb-6 -ml-2" onClick={() => navigate('/')}>← Back</button>
      <h1 className="text-3xl font-bold mb-6">Past Drafts</h1>

      {drafts.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-xl mb-2">No past drafts</p>
          <p className="text-sm">Completed drafts appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(draft => (
            <div key={draft.id} className="card overflow-hidden">
              <button
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition"
                onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
              >
                <div>
                  <div className="font-semibold">{draft.bankName} → {draft.categoryName}</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {new Date(draft.savedAt).toLocaleDateString()} · {draft.players.length} players
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{expanded === draft.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === draft.id && (
                <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(draft.players.length, 3)}, minmax(0, 1fr))` }}>
                    {draft.players.map((player, i) => (
                      <div key={i}>
                        <h3 className="font-bold mb-2 text-sm">{player.name}</h3>
                        <ol className="space-y-1">
                          {player.picks.map((pk, j) => (
                            <li key={j} className="text-xs flex gap-2">
                              <span className="text-gray-500 shrink-0">{pk.positionLabel}</span>
                              <span className="text-gray-300">{pk.drafteeeName}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn-ghost text-red-400 hover:text-red-300 text-sm mt-4"
                    onClick={() => handleDelete(draft.id)}
                  >
                    Delete this draft
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
