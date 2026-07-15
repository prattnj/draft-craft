import { useGameStore } from '@/store/gameStore'
import { useSocket } from '@/hooks/useSocket'
import Timer from './Timer'

export default function HostDraft() {
  const { room } = useGameStore()
  const { send } = useSocket()

  if (!room || !room.draft) return null

  const { players, draft, category, settings } = room
  const currentPickerId = draft.pickOrder[draft.currentPickIndex]
  const currentPicker = players.find(p => p.id === currentPickerId)
  const round = Math.floor(draft.currentPickIndex / players.length) + 1
  const totalRounds = category.isNone ? (settings.roundCount ?? 10) : category.positions.length
  const pickInRound = (draft.currentPickIndex % players.length) + 1

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Round {round}/{totalRounds} · Pick {pickInRound}/{players.length}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{room.bankName} → {category.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {draft.timerExpiresAt && <Timer expiresAt={draft.timerExpiresAt} />}
          <button className="btn-danger text-sm" onClick={() => send({ type: 'end_draft' })}>
            End Draft
          </button>
        </div>
      </div>

      {/* Current picker banner */}
      {currentPicker && (
        <div className="card p-5 border-brand-700 bg-brand-900/20">
          <p className="text-gray-400 text-sm mb-1">Now picking…</p>
          <p className="text-3xl font-extrabold text-brand-300">{currentPicker.name}</p>
          {draft.pendingAutoPick && (
            <p className="text-yellow-400 text-sm mt-1">⚡ Auto-pick prompt sent</p>
          )}
        </div>
      )}

      {/* Draft board - all players' picks */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 4)}, minmax(0, 1fr))` }}>
        {players.map(player => {
          const isCurrent = player.id === currentPickerId
          return (
            <div
              key={player.id}
              className={`card p-4 flex flex-col gap-2 transition-all ${isCurrent ? 'ring-2 ring-brand-500 bg-brand-900/10' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isCurrent && <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />}
                <span className="font-semibold truncate">{player.name}</span>
                <span className="text-gray-500 text-xs ml-auto">{player.picks.length}/{totalRounds}</span>
              </div>

              {category.isNone ? (
                <ol className="space-y-1">
                  {player.picks.map((pk, i) => (
                    <li key={pk.positionId} className="text-sm flex gap-2">
                      <span className="text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
                      <span className="truncate">{pk.drafteeeName}</span>
                    </li>
                  ))}
                  {Array.from({ length: totalRounds - player.picks.length }).map((_, i) => (
                    <li key={`empty-${i}`} className="text-sm text-gray-700">—</li>
                  ))}
                </ol>
              ) : (
                <div className="space-y-1">
                  {category.positions.map(pos => {
                    const pick = player.picks.find(pk => pk.positionId === pos.id)
                    return (
                      <div key={pos.id} className="flex gap-2 text-sm">
                        <span className="text-gray-500 shrink-0 text-xs">{pos.label}</span>
                        <span className={pick ? 'truncate' : 'text-gray-700'}>
                          {pick ? pick.drafteeeName : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recently available count */}
      <p className="text-gray-500 text-sm text-center">
        {room.availableDraftees.length} draftees remaining in the pool
      </p>
    </div>
  )
}
