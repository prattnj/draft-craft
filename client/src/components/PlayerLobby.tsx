import { useGameStore } from '@/store/gameStore'

export default function PlayerLobby() {
  const { room, myId } = useGameStore()
  if (!room) return null

  const me = room.players.find(p => p.id === myId)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 text-center">
      <div>
        <h1 className="text-4xl font-extrabold text-brand-400 tracking-widest font-mono">{room.code}</h1>
        <p className="text-gray-400 mt-1">Room Code</p>
      </div>

      <div>
        <p className="text-gray-300 text-lg">
          You're in, <span className="font-bold text-white">{me?.name}</span>!
        </p>
        <p className="text-gray-500 mt-1">Waiting for the host to start…</p>
      </div>

      <div className="w-full max-w-xs">
        <h2 className="text-sm font-medium text-gray-400 mb-3">Players ({room.players.length})</h2>
        <div className="space-y-2">
          {room.players.map(p => (
            <div key={p.id} className="card px-4 py-2.5 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${p.connected ? 'bg-green-500' : 'bg-gray-600'}`} />
              <span className={`font-medium ${p.id === myId ? 'text-brand-300' : ''}`}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-500 text-sm">{room.bankName} → {room.category.name}</p>
      </div>
    </div>
  )
}
