import * as Tone from 'tone'
import useGameStore from './gameState'

let initialized = false
let synth = null
let membraneSynth = null
let metalSynth = null
let noiseSynth = null

function isMuted() {
  return useGameStore.getState().soundMuted
}

async function ensureStarted() {
  if (!initialized) {
    await Tone.start()
    initialized = true
  }
}

function getSynth() {
  if (!synth) {
    synth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
      volume: -12,
    }).toDestination()
  }
  return synth
}

function getMembraneSynth() {
  if (!membraneSynth) {
    membraneSynth = new Tone.MembraneSynth({
      volume: -10,
    }).toDestination()
  }
  return membraneSynth
}

function getMetalSynth() {
  if (!metalSynth) {
    metalSynth = new Tone.MetalSynth({
      volume: -18,
      envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
    }).toDestination()
  }
  return metalSynth
}

function getNoiseSynth() {
  if (!noiseSynth) {
    noiseSynth = new Tone.NoiseSynth({
      volume: -16,
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.02 },
    }).toDestination()
  }
  return noiseSynth
}

// Rising blip when adding a bill
export async function playBillAdd() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'triangle'
  const now = Tone.now()
  s.triggerAttackRelease('C5', '0.05', now)
  s.triggerAttackRelease('E5', '0.05', now + 0.06)
}

// Falling bloop when removing a bill
export async function playBillRemove() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'triangle'
  const now = Tone.now()
  s.triggerAttackRelease('E5', '0.05', now)
  s.triggerAttackRelease('C4', '0.08', now + 0.06)
}

// 3-note trumpet fanfare for payday start
export async function playPaydayStart() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'square'
  const now = Tone.now()
  s.triggerAttackRelease('C4', '0.12', now)
  s.triggerAttackRelease('E4', '0.12', now + 0.15)
  s.triggerAttackRelease('G4', '0.18', now + 0.3)
}

// Thud + sparkle when hero lands
export async function playHeroSpawn() {
  if (isMuted()) return
  await ensureStarted()
  const now = Tone.now()
  getMembraneSynth().triggerAttackRelease('C2', '0.15', now)
  getMetalSynth().triggerAttackRelease('C6', '0.08', now + 0.08)
}

// Slash + pop for each monster kill
export async function playMonsterSlay() {
  if (isMuted()) return
  await ensureStarted()
  const now = Tone.now()
  getNoiseSynth().triggerAttackRelease('0.04', now)
  const s = getSynth()
  s.oscillator.type = 'square'
  s.triggerAttackRelease('A4', '0.06', now + 0.04)
  s.triggerAttackRelease('E3', '0.08', now + 0.08)
}

// Rapid coin dings for XP
export async function playXPTick() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'sine'
  const now = Tone.now()
  for (let i = 0; i < 4; i++) {
    s.triggerAttackRelease('C6', '0.03', now + i * 0.05)
  }
}

// Major arpeggio for level up
export async function playLevelUp() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'square'
  const notes = ['C4', 'E4', 'G4', 'C5']
  const now = Tone.now()
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, '0.15', now + i * 0.18)
  })
}

// Triumphant 4-note phrase for victory
export async function playVictory() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'square'
  const notes = ['C5', 'E5', 'G5', 'C6']
  const now = Tone.now()
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, '0.15', now + i * 0.2)
  })
}

// Shimmer for island growth
export async function playIslandGrow() {
  if (isMuted()) return
  await ensureStarted()
  const n = getNoiseSynth()
  const filter = new Tone.Filter({ frequency: 200, type: 'lowpass' }).toDestination()
  n.disconnect()
  n.connect(filter)
  n.triggerAttackRelease('0.8')
  filter.frequency.rampTo(2000, 0.8)
  // Reconnect after done
  setTimeout(() => {
    n.disconnect()
    n.toDestination()
    filter.dispose()
  }, 1200)
}

// Achievement unlock jingle
export async function playAchievement() {
  if (isMuted()) return
  await ensureStarted()
  const s = getSynth()
  s.oscillator.type = 'square'
  const notes = ['E5', 'G5', 'B5', 'E6']
  const now = Tone.now()
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, '0.12', now + i * 0.12)
  })
}

// Initialize audio context on first user interaction
export async function initAudio() {
  await ensureStarted()
}
