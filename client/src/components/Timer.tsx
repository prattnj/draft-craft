import { useState, useEffect } from 'react'

export default function Timer({ expiresAt }: { expiresAt: number | null }) {
  const [secs, setSecs] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) { setSecs(null); return }
    const tick = () => setSecs(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [expiresAt])

  if (secs === null) return null

  const urgent = secs <= 5

  return (
    <div className={`flex items-center gap-2 font-mono text-2xl font-bold ${urgent ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
      {secs}s
    </div>
  )
}
