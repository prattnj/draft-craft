import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { saveDraft } from '@/data/drafts'

export default function HostComplete() {
  const { room } = useGameStore()
  const navigate = useNavigate()
  const saved = useRef(false)

  useEffect(() => {
    if (room && !saved.current) {
      saved.current = true
      saveDraft(room)
    }
  }, [room])

  if (!room) return null

  const { players, category } = room

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Draft Complete!</h1>
          <p className="text-gray-400">{room.bankName} → {category.name}</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/')}>Home</button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 4)}, minmax(0, 1fr))` }}>
        {players.map(player => (
          <div key={player.id} className="card p-4 flex flex-col gap-2">
            <h3 className="font-bold text-lg mb-1">{player.name}</h3>

            {category.isNone ? (
              <ol className="space-y-1">
                {player.picks.map((pk, i) => (
                  <li key={pk.positionId} className="text-sm flex gap-2">
                    <span className="text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
                    <span>{pk.drafteeeName}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="space-y-1">
                {category.positions.map(pos => {
                  const pick = player.picks.find(pk => pk.positionId === pos.id)
                  return (
                    <div key={pos.id} className="flex gap-2 text-sm">
                      <span className="text-gray-500 shrink-0 text-xs">{pos.label}</span>
                      <span className={pick ? '' : 'text-gray-600'}>{pick ? pick.drafteeeName : '—'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm">Results saved to Past Drafts</p>
    </div>
  )
}
