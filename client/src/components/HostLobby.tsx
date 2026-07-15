import { useGameStore } from '@/store/gameStore'
import { useSocket } from '@/hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import QRCode from '@/components/QRCode'

export default function HostLobby() {
  const { room } = useGameStore()
  const { send } = useSocket()
  const navigate = useNavigate()

  if (!room) return null

  const joinUrl = `${location.origin}/join?code=${room.code}`

  return (
    <div className="min-h-screen p-8 flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold">DraftCraft</h1>
          <p className="text-gray-400 mt-1">{room.bankName} → {room.category.name}</p>
        </div>
        <button className="btn-ghost text-sm" onClick={() => { navigate('/'); }}>Leave</button>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-gray-400 mb-2 text-lg">Room Code</p>
          <div className="text-8xl font-extrabold tracking-widest text-brand-400 font-mono">
            {room.code}
          </div>
          <p className="text-gray-500 text-sm mt-3">Players go to <span className="text-brand-400">{location.origin}/join</span></p>
        </div>

        <QRCode value={joinUrl} size={180} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Players <span className="text-gray-500 font-normal text-base">({room.players.length}/8)</span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {room.players.map(p => (
            <div key={p.id} className="card px-4 py-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.connected ? 'bg-green-500' : 'bg-gray-600'}`} />
              <span className="font-medium truncate">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <button
          className="btn-primary text-xl py-5 w-full"
          onClick={() => send({ type: 'start_draft' })}
          disabled={room.players.length < 2}
        >
          Start Draft
        </button>
        {room.players.length < 2 && (
          <p className="text-center text-gray-500 text-sm mt-2">Waiting for at least 2 players…</p>
        )}
      </div>
    </div>
  )
}
