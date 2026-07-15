import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import { playTrack } from '@/hooks/useAudio'
import { initSounds, soundDraftStart, soundComplete, soundPickMade } from '@/sounds'
import HomePage from '@/pages/HomePage'
import HostSetupPage from '@/pages/HostSetupPage'
import RoomPage from '@/pages/RoomPage'
import JoinPage from '@/pages/JoinPage'
import PastDraftsPage from '@/pages/PastDraftsPage'
import EditBanksPage from '@/pages/EditBanksPage'
import EditCategoriesPage from '@/pages/EditCategoriesPage'

const HOME_TRACK = '/audio/home.mp3'
const GAMEPLAY_TRACK = '/audio/gameplay.mp3'

export default function App() {
  const location = useLocation()
  const room = useGameStore(s => s.room)

  const prevPhase = useRef(room?.phase)
  const prevTotalPicks = useRef(0)

  useEffect(() => { initSounds() }, [])

  // Background music
  useEffect(() => {
    const isDrafting = location.pathname === '/room' && room?.phase === 'drafting'
    playTrack(isDrafting ? GAMEPLAY_TRACK : HOME_TRACK)
  }, [location.pathname, room?.phase])

  // Phase transition sounds
  useEffect(() => {
    const phase = room?.phase
    if (prevPhase.current === 'lobby' && phase === 'drafting') soundDraftStart()
    if (prevPhase.current === 'drafting' && phase === 'complete') soundComplete()
    prevPhase.current = phase
  }, [room?.phase])

  // Pick-made sound (fires for any player's pick)
  useEffect(() => {
    const total = room?.players.reduce((n, p) => n + p.picks.length, 0) ?? 0
    if (total > prevTotalPicks.current) soundPickMade()
    prevTotalPicks.current = total
  }, [room?.players])

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/host" element={<HostSetupPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/room" element={<RoomPage />} />
      <Route path="/past-drafts" element={<PastDraftsPage />} />
      <Route path="/edit-banks" element={<EditBanksPage />} />
      <Route path="/edit-categories" element={<EditCategoriesPage />} />
    </Routes>
  )
}
