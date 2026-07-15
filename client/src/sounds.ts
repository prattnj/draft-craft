let _ctx: AudioContext | null = null

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.25,
  startTime?: number,
  freqEnd?: number,
) {
  const c = ctx()
  const t = startTime ?? c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.start(t)
  osc.stop(t + dur + 0.01)
}

// Short quiet tick for button presses
export function soundClick() {
  tone(700, 0.04, 'sine', 0.12)
}

// Ascending two-note chime — your turn
export function soundYourTurn() {
  const c = ctx()
  tone(523, 0.25, 'sine', 0.28, c.currentTime)
  tone(784, 0.4, 'sine', 0.32, c.currentTime + 0.18)
}

// Satisfying descending pop — pick confirmed
export function soundPickMade() {
  const c = ctx()
  tone(420, 0.18, 'sine', 0.28, c.currentTime, 160)
}

// Soft bell — player joined lobby
export function soundPlayerJoined() {
  tone(880, 0.45, 'sine', 0.18)
}

// C-E-G arpeggio — draft starting
export function soundDraftStart() {
  const c = ctx()
  tone(523, 0.22, 'sine', 0.28, c.currentTime)
  tone(659, 0.22, 'sine', 0.28, c.currentTime + 0.13)
  tone(784, 0.45, 'sine', 0.32, c.currentTime + 0.26)
}

// Two quick gentle pulses — auto-pick prompt
export function soundAutoPick() {
  const c = ctx()
  tone(660, 0.09, 'sine', 0.2, c.currentTime)
  tone(660, 0.09, 'sine', 0.2, c.currentTime + 0.16)
}

// Victory fanfare — draft complete
export function soundComplete() {
  const c = ctx()
  tone(523, 0.18, 'sine', 0.22, c.currentTime)
  tone(659, 0.18, 'sine', 0.22, c.currentTime + 0.1)
  tone(784, 0.18, 'sine', 0.22, c.currentTime + 0.2)
  tone(1047, 0.55, 'sine', 0.28, c.currentTime + 0.32)
}

// Short descending buzz — error
export function soundError() {
  tone(280, 0.18, 'sawtooth', 0.12, undefined, 180)
}

// Attach a global quiet click to every non-disabled button
export function initSounds() {
  document.addEventListener('mousedown', (e) => {
    const btn = (e.target as HTMLElement).closest('button')
    if (btn && !btn.disabled) soundClick()
  })
}
