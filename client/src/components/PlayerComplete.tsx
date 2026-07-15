import { useGameStore } from '@/store/gameStore'

export default function PlayerComplete() {
  const { room, myId } = useGameStore()
  if (!room) return null

  const me = room.players.find(p => p.id === myId)
  const category = room.category

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">Draft Complete!</h1>
        <p className="text-gray-400 text-sm">{room.bankName} → {category.name}</p>
      </div>

      {me && (
        <div className="card p-5">
          <h2 className="font-bold text-lg mb-3">Your Team — {me.name}</h2>
          {category.isNone ? (
            <ol className="space-y-2">
              {me.picks.map((pk, i) => (
                <li key={pk.positionId} className="flex gap-3 text-sm">
                  <span className="text-gray-500 w-5">{i + 1}.</span>
                  <span className="font-medium">{pk.drafteeeName}</span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-2">
              {category.positions.map(pos => {
                const pick = me.picks.find(pk => pk.positionId === pos.id)
                return (
                  <div key={pos.id} className="flex gap-3 text-sm">
                    <span className="text-gray-400 shrink-0 text-xs">{pos.label}</span>
                    <span className={pick ? 'font-medium' : 'text-gray-600'}>{pick?.drafteeeName ?? '—'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-3 text-gray-300">All Teams</h2>
        <div className="space-y-3">
          {room.players.filter(p => p.id !== myId).map(player => (
            <div key={player.id} className="card p-4">
              <h3 className="font-bold mb-2">{player.name}</h3>
              {category.isNone ? (
                <ol className="space-y-1">
                  {player.picks.map((pk, i) => (
                    <li key={pk.positionId} className="flex gap-2 text-sm">
                      <span className="text-gray-500 w-5">{i + 1}.</span>
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
                        <span className="text-gray-400 shrink-0 text-xs">{pos.label}</span>
                        <span className={pick ? '' : 'text-gray-600'}>{pick?.drafteeeName ?? '—'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
