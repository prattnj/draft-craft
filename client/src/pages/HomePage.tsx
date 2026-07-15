import { useNavigate } from 'react-router-dom'
import { getPastDrafts } from '@/data/drafts'

export default function HomePage() {
  const navigate = useNavigate()
  const pastCount = getPastDrafts().length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-br from-brand-300 to-brand-500 bg-clip-text text-transparent mb-2">
          DraftCraft
        </h1>
        <p className="text-gray-400 text-lg">The party drafting game</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button className="btn-primary text-lg py-4" onClick={() => navigate('/host')}>
          Host a Game
        </button>
        <button className="btn-secondary text-lg py-4" onClick={() => navigate('/join')}>
          Join a Game
        </button>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <button className="btn-ghost text-sm" onClick={() => navigate('/past-drafts')}>
          Past Drafts {pastCount > 0 && <span className="badge bg-gray-700 text-gray-300">{pastCount}</span>}
        </button>
        <button className="btn-ghost text-sm" onClick={() => navigate('/edit-banks')}>
          Edit Banks
        </button>
        <button className="btn-ghost text-sm" onClick={() => navigate('/edit-categories')}>
          Edit Categories
        </button>
      </div>
    </div>
  )
}
