# CLAUDE.md — Payday Kingdom (Hackathon Build)

## What This Is
A gamified personal budget app where your payday spawns a voxel hero that slays your bill monsters, and your island grows more beautiful the longer you stay on budget. Built for a 48-hour hackathon. Judged on CREATIVITY.

## Tech Stack (Non-Negotiable)
- React 18 + Vite
- Three.js (procedural BoxGeometry voxels — NO external 3D assets, NO GLTF, NO model files)
- Zustand with localStorage persist middleware (with try/catch storage adapter for quota safety)
- Tailwind CSS
- Google Fonts: "Press Start 2P" for pixel headings, system sans-serif for data/numbers
- Tone.js for procedural retro sound effects
- NO backend. NO API calls. NO database. Everything runs in-browser.

## Architecture
```
src/
  App.jsx              — layout shell, orchestration, achievement checking, capture/share wiring, audio init
  components/
    Scene.jsx          — Three.js canvas, 13x13 island, monsters, hero, battle animations, clouds, fish, ambient particles
    BudgetPanel.jsx    — income/bill entry UI, surplus calc, payday trigger button, sound on add/remove
    HUD.jsx            — stats overlay on 3D scene, gear menu (achievements + capture + mute toggle)
    Onboarding.jsx     — first-time 4-step modal flow
    AchievementToast.jsx — slide-in toast (upper center of scene), auto-dismisses on payday trigger
    AchievementPanel.jsx — modal listing all 10 achievements + share cards
    ShareModal.jsx     — capture preview with Download/Copy/Share + Story Mode
    CapturePrompt.jsx  — auto-dismiss "Capture this victory?" after battle/stage-up
  lib/
    voxelBuilder.js    — factory functions for voxels, 8 unique monsters + death anims, hero, buildings, clouds, fish
    constants.js       — color palette, XP thresholds, bill categories, island stage definitions
    gameState.js       — single Zustand store (budget + game state combined), localStorage with try/catch
    achievements.js    — 10 achievement definitions, check function, PNG share card generator
    captureUtils.js    — shared captureKingdom() for scene->composited PNG (normal + story mode)
    soundManager.js    — Tone.js procedural sound effects (10 sounds, lazy init, mute-aware)
```

## Core Design Rules
1. **Everything is voxels.** All visual objects are built from Three.js BoxGeometry. No imported models, no sprites, no external textures.
2. **The battle animation is the product.** If "Trigger Payday" doesn't feel satisfying, nothing else matters. Prioritize animation quality over feature count.
3. **Screenshot-first design.** The island must look GOOD from the default isometric camera angle. Every visual decision should ask "would someone screenshot this?"
4. **Dark theme always.** Base bg: slate-900 (#0f172a). UI elements use slate-800/700 for contrast. Gold (#fbbf24) for accents.
5. **Retro-meets-modern aesthetic.** Pixel font for headings/labels, clean sans-serif for numbers and data. Voxel 3D with modern lighting.

## Color Palette
```
Grass:     #4ade80, #22c55e, #16a34a
Water:     #3b82f6
Wood:      #92400e
Stone:     #9ca3af
Leaf:      #15803d, #166534, #14532d
Gold:      #fbbf24
Silver:    #d1d5db
Bronze:    #b45309
Hero skin: #fcd34d
Hero base: #60a5fa
Background:#0f172a

Monster colors by bill category:
  housing:       #ef4444 (red)
  utilities:     #eab308 (yellow)
  phone:         #8b5cf6 (purple)
  transport:     #f97316 (orange)
  food:          #22c55e (green)
  insurance:     #3b82f6 (blue)
  entertainment: #ec4899 (pink)
  other:         #6b7280 (gray)
```

## State Shape (Zustand)
```js
{
  kingdomName: '',
  bannerColor: '#3b82f6',
  income: 0,
  bills: [{ id, name, amount, category, isPaid }],
  xp: 0,
  level: 1,
  totalBillsSlain: 0,
  monthsCompleted: 0,
  islandStage: 0,       // computed from monthsCompleted: 0->0, 1->1, 2->2, 3->3, 5->4, 8->5
  heroVisible: false,
  isBattling: false,
  lastBattleResult: null, // stored for achievement checks post-battle
  hasOnboarded: false,
  achievements: {},      // { [id]: unlockedTimestamp }
  history: [],           // past month records
  soundMuted: false,
}
```

## XP & Leveling
- Each bill slain = bill dollar amount as XP
- Level thresholds: [1000, 3000, 6000, 10000, 20000, 50000]
- Tier names: Lv1=Peasant, Lv2=Recruit, Lv3=Soldier, Lv5=Knight, Lv8=Champion, Lv12=Legend

## Layout
- Desktop (>768px): BudgetPanel 40% left | Scene+HUD 60% right
- Mobile (<768px): Scene+HUD 60vh top | BudgetPanel below, scrollable

## Three.js Scene Defaults
- 13x13 green voxel grid island (+/-6) with random Y offset 0-0.2 per block
- Blue semi-transparent water plane (34x34) beneath with gentle sine wave animation
- PerspectiveCamera at (13.5, 11.5, 13.5) isometric angle
- OrbitControls with clamped rotation and zoom (maxDistance: 34)
- AmbientLight(0xffffff, 0.6) + DirectionalLight(0xffffff, 0.8) from upper-right with shadow mapping
- FogExp2(0x0f172a, 0.025) for depth
- preserveDrawingBuffer: true on WebGLRenderer (required for screenshot)
- 6 floating clouds drifting across the sky
- 5 fish swimming in circular paths in the water
- 20 ambient floating white particle cubes drifting upward
- Hero spawns facing camera (rotation.y = PI)

## Important Constraints
- NO localStorage/sessionStorage in any artifact if this code is tested in Claude artifacts (but fine for the actual Vite app)
- Button "Trigger Payday" MUST be disabled during isBattling === true (triple-guarded: button disabled, handler check, store check)
- All currency formatted with commas ($1,200 not $1200)
- Monster sizing: <$100 small (0.6 scale), $100-500 medium (1.0), $500+ large (1.4)
- Max 3 rows of monsters (12 per row, 3rd row for >24 bills)
- Trees scaled 0.9x, buildings/castle/well/fence scaled 0.8x
- Castle has 8 random protruding stone blocks for depth
- Screen-shake on hero landing (intensity 5) and monster kills (intensity 3)

## Sound Effects (Tone.js — soundManager.js)
All procedural, lazy-initialized, mute-aware. Tone.start() on first user click.
- billAdd: rising triangle blip C5->E5
- billRemove: falling triangle bloop E5->C4
- paydayStart: 3-note square fanfare C4->E4->G4
- heroSpawn: membrane thud + metal sparkle
- monsterSlay: white noise slash + descending square
- xpTick: rapid sine coin dings (C6 x4)
- victory: 4-note triumph C5->E5->G5->C6
- levelUp: major arpeggio C4->E4->G4->C5
- islandGrow: noise with filter sweep 200->2000Hz
- achievement: bright arpeggio E5->G5->B5->E6

## Build Progress
- [x] Phase 1: Core one-shot — full working app with game loop
- [x] TICKET J-001: 8 unique monster designs + category-specific death animations
- [x] TICKET J-002: Achievement system (10 achievements, toasts, panel, share cards)
- [x] TICKET J-003: Screenshot & share system (ShareModal, captureUtils, CapturePrompt, Story Mode)
- [x] Bug fix: Hero stacking (old hero removed before spawning new one)
- [x] Map scaled up twice (8x8->10x10->13x13, camera/water/radius all adjusted)
- [x] UI: Gear menu in top-right (achievements + capture + mute), toast in upper center of scene
- [x] TICKET P-001: Sound effects (Tone.js) — 10 procedural sounds wired into all actions
- [x] TICKET P-002: Visual polish — ambient particles, fog, water anim, screen-shake, shadows, vignette, clouds
- [x] TICKET P-003: Edge cases — 0 bills peaceful payday, 0 income warning, 3-row monsters, localStorage try/catch, rapid click guard
- [x] Polish: 5 extra trees (2 large pines, 3 bushes), hero faces camera, 5 swimming fish, castle depth blocks, blue block fix
- [ ] TICKET P-004: Deploy to Vercel — NOT STARTED
- [ ] Demo prep & submission — NOT STARTED

## Reference Docs
- See `docs/HACKATHON_BATTLE_PLAN.md` for the full phased build plan and individual ticket prompts
- See `docs/PAYDAY_KINGDM_MVP_SPEC.md` for the original detailed spec (reference for edge cases and design details)
