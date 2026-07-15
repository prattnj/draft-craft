// Module-level singletons so tracks persist across navigation
const tracks: Record<string, HTMLAudioElement> = {}

function getTrack(src: string): HTMLAudioElement {
  if (!tracks[src]) {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.4
    tracks[src] = audio
  }
  return tracks[src]
}

let currentSrc: string | null = null

export function playTrack(src: string) {
  if (currentSrc === src) return
  if (currentSrc) getTrack(currentSrc).pause()
  currentSrc = src
  const track = getTrack(src)
  track.play().catch(() => {
    // Browser blocked autoplay — retry on next user interaction
    const retry = () => { track.play().catch(() => {}); document.removeEventListener('click', retry) }
    document.addEventListener('click', retry, { once: true })
  })
}

export function pauseAll() {
  if (currentSrc) getTrack(currentSrc).pause()
  currentSrc = null
}
