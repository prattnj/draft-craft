import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import HostSetupPage from '@/pages/HostSetupPage'
import RoomPage from '@/pages/RoomPage'
import JoinPage from '@/pages/JoinPage'
import PastDraftsPage from '@/pages/PastDraftsPage'
import EditBanksPage from '@/pages/EditBanksPage'
import EditCategoriesPage from '@/pages/EditCategoriesPage'

export default function App() {
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
