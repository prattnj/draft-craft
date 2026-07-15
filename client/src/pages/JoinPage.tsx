import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useGameStore } from '@/store/gameStore'

export default function JoinPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { send } = useSocket()
  const { room, error, setError } = useGameStore()

  const [code, setCode] = useState(params.get('code') ?? '')
  const [name, setName] = useState('')

  useEffect(() => {
    if (room) navigate('/room')
  }, [room, navigate])

  const handleJoin = () => {
    if (!code.trim()) { setError('Enter a room code'); return }
    if (!name.trim()) { setError('Enter your name'); return }
    setError(null)
    send({ type: 'join_room', code: code.trim(), playerName: name.trim() })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6 max-w-sm mx-auto w-full">
      <button className="btn-ghost self-start -ml-2" onClick={() => navigate('/')}>← Back</button>

      <div className="text-center">
        <h1 className="text-3xl font-bold mb-1">Join Game</h1>
        <p className="text-gray-500 text-sm">Enter the room code shown on the host's screen</p>
      </div>

      <div className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Room Code</label>
          <input
            className="input text-center text-2xl font-bold tracking-widest uppercase"
            placeholder="ABCD"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
            maxLength={4}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
          <input
            className="input"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button className="btn-primary w-full text-lg py-4" onClick={handleJoin}>
          Join Room
        </button>
      </div>
    </div>
  )
}
