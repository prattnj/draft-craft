import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import HostLobby from '@/components/HostLobby'
import HostDraft from '@/components/HostDraft'
import HostComplete from '@/components/HostComplete'
import PlayerLobby from '@/components/PlayerLobby'
import PlayerDraft from '@/components/PlayerDraft'
import PlayerComplete from '@/components/PlayerComplete'

export default function RoomPage() {
  const navigate = useNavigate()
  const { room, myId } = useGameStore()

  useEffect(() => {
    if (!room) navigate('/')
  }, [room, navigate])

  if (!room || !myId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Connecting...</div>
      </div>
    )
  }

  const isHost = room.hostId === myId

  if (room.phase === 'lobby') {
    return isHost ? <HostLobby /> : <PlayerLobby />
  }
  if (room.phase === 'drafting') {
    return isHost ? <HostDraft /> : <PlayerDraft />
  }
  return isHost ? <HostComplete /> : <PlayerComplete />
}
