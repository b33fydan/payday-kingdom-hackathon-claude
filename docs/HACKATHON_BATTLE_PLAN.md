# PAYDAY KINGDOM — 48-Hour Hackathon Battle Plan

## Strategy: Hybrid Build
**Phase 1** (Hours 0–6): One-shot the working core with Claude Code
**Phase 2** (Hours 6–24): Targeted tickets for the three juice features
**Phase 3** (Hours 24–40): Polish, edge cases, demo prep
**Phase 4** (Hours 40–48): Deploy, test, record demo, submit

---

## ⚡ PHASE 1 — THE ONE-SHOT (Hours 0–6)

### Prompt for Claude Code:

```
Create a new React + Vite project called "payday-kingdom" with Three.js and Tailwind CSS. This is a gamified budget app where your payday spawns a voxel hero that slays your bill monsters on an island.

## ARCHITECTURE
Use this file structure:
src/
  App.jsx              — layout shell, state orchestration
  components/
    Scene.jsx          — Three.js canvas, island, monsters, hero, all animations
    BudgetPanel.jsx    — income/bill entry, surplus calc, payday button
    HUD.jsx            — overlay stats on 3D scene
    Onboarding.jsx     — first-time 4-step modal
  lib/
    voxelBuilder.js    — factory functions for voxel meshes
    constants.js       — colors, XP thresholds, categories, island stages
    gameState.js       — Zustand store (budget + game state combined)

## STATE (Zustand, persisted to localStorage)
{
  kingdomName: '',
  bannerColor: '#3b82f6',
  income: 0,
  bills: [{ id, name, amount, category, isPaid }],
  paydayDate: 1,
  xp: 0,
  level: 1,
  totalBillsSlain: 0,
  monthsCompleted: 0,
  islandStage: 0,
  heroVisible: false,
  isBattling: false,
  hasOnboarded: false,
  history: []
}

Actions: setIncome, addBill, removeBill, triggerPayday (marks bills paid, adds XP, increments months, computes island stage), resetMonth, setKingdomName, setBannerColor, completeOnboarding

## 3D SCENE REQUIREMENTS
- 8x8 grid of green BoxGeometry cubes (slight random Y offset 0-0.2) as island base
- Blue semi-transparent water plane beneath
- PerspectiveCamera at isometric angle (azimuth ~45°, polar ~55°)
- OrbitControls with limited rotation and zoom
- Ambient light (0xffffff, 0.6) + DirectionalLight (0xffffff, 0.8) from upper-right
- Dark background (#0f172a)

## VOXEL BUILDER (voxelBuilder.js)
Factory functions that return Three.js Mesh or Group:
- createVoxel(x, y, z, color, size) — single cube
- createTree(x, z, style) — trunk (brown) + canopy (green cubes), styles: 'pine' (tall narrow), 'oak' (bushy), 'round'
- createBuilding(x, z, w, h, d, color) — box with optional roof
- createHero(level) — stacked cubes: legs (2 small), body, head, weapon. Colors by level:
  - 1: skin=#fcd34d, tunic=#92400e (peasant)
  - 2: skin=#fcd34d, armor=#b45309 (bronze)
  - 3: skin=#fcd34d, armor=#d1d5db (silver)
  - 5+: skin=#fcd34d, armor=#fbbf24 (gold)
- createMonster(category, size) — body cube + horns/spikes on top. Size: 'small'|'medium'|'large'. Colors by category:
  - housing: #ef4444 (red golem — wide, heavy, 2 horn cubes)
  - utilities: #eab308 (yellow slime — rounded stack, spark cubes floating around)
  - phone: #8b5cf6 (purple floating eye — sphere-ish stack with antenna cube on top)
  - transport: #f97316 (orange spider — body with 4 leg cubes extending out)
  - food: #22c55e (green blob — 3 stacked cubes getting smaller, mouth gap)
  - insurance: #3b82f6 (blue ghost — tapered stack, semi-transparent material)
  - entertainment: #ec4899 (pink imp — small bouncy, jester hat cube on top)
  - other: #6b7280 (gray goblin — generic humanoid stack)
- createRocks(x, z) — cluster of 2-3 gray cubes

Monster sizing: <$100 = small (scale 0.6), $100-500 = medium (scale 1.0), $500+ = large (scale 1.4)

## BILL MONSTERS ON ISLAND
- Each bill in the store renders as a monster on the island
- Monsters positioned in a semicircle around island center (evenly spaced by angle)
- Each monster has idle animation: gentle Y bobbing (sin wave, amplitude 0.1, speed varies per monster)
- Monsters appear/disappear reactively when bills are added/removed (scale-in animation from 0 to 1 over 0.3s)

## BATTLE ANIMATION (This is the ENTIRE product — make it incredible)
When triggerPayday() is called:
1. HERO SPAWN (0.5s): Hero drops from Y=10 to Y=0 at island center. On landing, spawn 12-15 small white cubes that scatter outward with gravity (particle burst). Brief 0.3s pose hold.
2. BATTLE PHASE (0.6s per monster): Hero lerps position to each monster sequentially. At arrival: hero does a 360° Y-rotation (slash). Monster mesh turns white (material color = 0xffffff) for 0.1s, then explodes — spawn 8-10 small cubes in the monster's color that fly outward with gravity and fade opacity to 0. Simultaneously, create an HTML div overlay positioned at the monster's screen-space coordinates showing "+$XXX" in green, animating upward and fading out over 0.8s. Update XP in store after each kill.
3. VICTORY (1s): Hero lerps back to center. Hero jumps (Y position up 1.5 then back down). Show "PAYDAY COMPLETE" as a large centered HTML overlay that fades in and out. XP bar in HUD animates to new value.
4. LEVEL UP (if threshold crossed, 1.5s): Flash screen white briefly (CSS overlay, opacity 0→0.5→0 over 0.5s). Hero mesh color transitions to new armor tier. Show "LEVEL UP! → [Tier Name]" overlay text. Tier names: Lv1=Peasant, Lv2=Recruit, Lv3=Soldier, Lv5=Knight, Lv8=Champion.
5. After full sequence: set isBattling=false, update monthsCompleted, compute new islandStage, trigger island growth.

XP thresholds: [1000, 3000, 6000, 10000, 20000, 50000]
"Trigger Payday" button MUST be disabled during isBattling=true.

## ISLAND GROWTH
islandStage computed from monthsCompleted:
- 0 months: barren — just grass platform, 1 dead tree (brown, no leaves)
- 1 month: sprout — add 2-3 small trees, 4-5 tiny colored flower cubes scattered
- 2 months: settlement — add a small brown hut (createBuilding), dirt path (row of darker cubes), more trees
- 3 months: village — hut upgrades to larger house, add well (gray cylinder or cube stack), garden area
- 5 months: town — second building, wooden fence line, small pond (blue cubes, flat)
- 8+ months: castle — main building becomes tall castle tower with battlements, stone walls, flag on top in bannerColor

When stage advances, new objects scale-animate from 0 to 1 over 0.5s. Previous stage objects STAY (additive).

## BUDGET PANEL (BudgetPanel.jsx)
Left side (desktop) / bottom (mobile). Dark theme (bg-slate-900).
- Header: "💰 [Kingdom Name] Treasury" in Press Start 2P font
- Monthly Income input ($ formatted)
- Bill list with category color dots, name, amount, remove button
- Add Bill form: name input, amount input, category dropdown (housing, utilities, phone, transport, food, insurance, entertainment, other)
- Surplus line: income minus total bills
- Months Survived counter
- Big "⚔️ TRIGGER PAYDAY" button — make it glow. Use an animated gradient border (CSS animation cycling through gold/orange/red) with a pulse scale animation on hover. This button should make you WANT to click it.

## HUD (HUD.jsx)
Overlay on 3D scene, pointer-events: none except on buttons.
- Top-left: "⚔️ Lv.X [TierName]" + XP bar (gradient green→gold fill)
- Bottom-left: "🏰 [Stage Name] | Month #X"
- Bottom-right: "Bills Slain: XX"
- Top-right: "📸 Capture" button (pointer-events: auto)
- Font: Press Start 2P for labels, system sans for numbers
- Semi-transparent dark bg (bg-black/50) on text areas, rounded

## ONBOARDING (Onboarding.jsx)
Only shows when hasOnboarded === false. Full-screen dark overlay (bg-slate-950/95).
Step 1: "Welcome, brave soul." / "Your financial discipline builds a thriving world." / [Begin Your Journey →]
Step 2: "Name Your Kingdom" / text input (placeholder: "Fort Savings, Castle Coinsworth...") / 6 color swatches for banner color / [Continue →]
Step 3: "How much treasure arrives each month?" / income input / [Continue →]
Step 4: "What monsters threaten your realm?" / bill entry (at least 1 required) / [+ Add Another Monster] / [Forge My Kingdom →]
On completion: set hasOnboarded=true, data flows into store, transition to main app.
Pixel font headings, smooth transitions between steps (fade or slide).

## SCREENSHOT SYSTEM
"📸 Capture" button in HUD:
1. Temporarily hide all HTML overlays
2. Render Three.js scene at 2x resolution (renderer.setSize with pixelRatio * 2, render, capture, restore)
3. Use renderer.domElement.toDataURL('image/png')
4. Composite onto a new Canvas2D: scene image on top, dark banner bar on bottom with text: "🏰 [Kingdom Name] · Lv.X [Tier] · Month X · paydaykingdom.app" in white
5. Convert to blob, trigger download as "[kingdomName]-kingdom.png"
6. If navigator.share available, also show "Share" option using Web Share API

## LAYOUT
Desktop (>768px): flex row — BudgetPanel 40% width | Scene+HUD 60% width
Mobile (<768px): flex column — Scene+HUD 60vh on top | BudgetPanel below, scrollable
Google Fonts: import "Press Start 2P" in index.css

## CRITICAL
- `npm run dev` must work immediately
- The battle animation is everything. If it doesn't feel SATISFYING, nothing else matters.
- All state persists to localStorage via Zustand persist middleware
- Scene must render at 60fps
- Responsive at 375px, 768px, 1440px
```

### After one-shot completes, verify:
- [ ] `npm run dev` runs clean
- [ ] Can add income + bills
- [ ] Monsters appear on island
- [ ] "Trigger Payday" runs full battle sequence
- [ ] XP accumulates, level changes hero appearance
- [ ] Island grows after months
- [ ] Screenshot downloads a PNG
- [ ] Onboarding works on fresh localStorage

**If something's broken**, fix with targeted CC prompts like:
- "The battle animation isn't playing — debug Scene.jsx and fix the animation sequence"
- "Monsters aren't positioned correctly — they should be in a semicircle around the island center"

---

## 🎨 PHASE 2 — JUICE TICKETS (Hours 6–24)

Run these as separate Claude Code prompts AFTER the core is working.

---

### TICKET J-001: Unique Monster Designs & Death Animations

```
In the existing payday-kingdom project, upgrade the monster designs in voxelBuilder.js. Each bill category needs a visually DISTINCT monster built from BoxGeometry cubes, and each needs a UNIQUE death animation.

MONSTER DESIGNS (all procedural BoxGeometry, no external assets):

🏠 Housing (housing): RED GOLEM
- Wide, heavy body (2x1x2 cube), stubby legs (2 small cubes), flat head, two horn cubes on top
- Idle: slow side-to-side rock (rotation Z oscillation)
- Death: crumbles — body splits into 6-8 individual cubes that fall downward with slight random X/Z spread, bouncing once before fading

⚡ Utilities (utilities): ELECTRIC SLIME
- 3 cubes stacked (large bottom, medium middle, small top) in yellow
- 2-3 tiny bright yellow "spark" cubes orbiting around it (rotating group)
- Idle: squish animation (scale Y oscillates 0.8-1.2 while X/Z inverse)
- Death: sparks fly outward rapidly, body dissolves top-down (each cube shrinks to 0 sequentially from top)

📱 Phone (phone): PURPLE FLOATING EYE
- Spherical-ish: 3x3 arrangement of purple cubes forming a ball, one white cube in center (eye), thin antenna cube on top
- Idle: floats (Y bobbing higher amplitude than others) + slow rotation
- Death: static effect — rapidly toggle visibility 5x, then scatter all cubes outward with random velocity

🚗 Transport (transport): ORANGE MECHANICAL SPIDER
- Central body cube, 4 leg cubes extending diagonally outward and down
- Idle: legs animate up/down alternating (walking motion)
- Death: legs fold inward (rotate to center), body shrinks to 0 with a pop (small orange particle burst)

🍔 Food (food): GREEN BLOB
- 3 cubes stacked getting slightly smaller toward top, with a gap/indent in the middle front (mouth)
- 2 tiny white cubes as eyes on top cube
- Idle: jiggle (random small rotation perturbations on all axes)
- Death: melts — squashes flat (scale Y to 0.1 while X/Z scale to 2.0), then fades opacity to 0

💊 Insurance (insurance): BLUE GHOST
- Tapered stack: wide base cube, medium middle, small top with a point cube
- Use MeshStandardMaterial with opacity: 0.7, transparent: true
- Idle: slow drift (slight X/Z sinusoidal movement) + Y bob
- Death: rises upward while fading opacity to 0 (ascending ghost)

🎮 Entertainment (entertainment): PINK IMP
- Small body, big head (proportionally), tiny legs, jester hat (2 small cubes angled on top of head)
- Idle: bouncing in place (Y position quick sine, amplitude 0.3, higher frequency than others)
- Death: spins rapidly (Y rotation accelerating), shrinks to 0, pops into sparkle particles (pink + white cubes)

📋 Other (other): GRAY GOBLIN
- Generic humanoid: 2 leg cubes, body cube, head cube, 2 tiny arm cubes
- Idle: shifting weight (subtle X position oscillation)
- Death: standard explosion — all cubes scatter outward with gravity

IMPORTANT:
- Keep the createMonster(category, size) API — size still scales the whole group
- Each monster type must be VISUALLY RECOGNIZABLE from the isometric camera distance
- Death animations are called during the battle sequence instead of the generic "explode into colored particles"
- All death animations should take 0.4-0.6s
- After death animation completes, fully remove the mesh from the scene
```

---

### TICKET J-002: Achievement System

```
Add an achievement system to the existing payday-kingdom project.

## ACHIEVEMENTS (10 total)
Store in Zustand alongside existing game state:
achievements: [
  { id: 'first_blood', name: 'First Blood', desc: 'Slay your first bill', icon: '🏅', condition: totalBillsSlain >= 1 },
  { id: 'monster_hunter', name: 'Monster Hunter', desc: 'Slay 10 bills total', icon: '⚔️', condition: totalBillsSlain >= 10 },
  { id: 'kingdom_builder', name: 'Kingdom Builder', desc: 'Reach Island Stage 3', icon: '🏰', condition: islandStage >= 3 },
  { id: 'dragons_hoard', name: "Dragon's Hoard", desc: 'Accumulate $10,000 surplus', icon: '💰', condition: computed total surplus from history >= 10000 },
  { id: 'royal_guard', name: 'Royal Guard', desc: 'Reach Level 5', icon: '👑', condition: level >= 5 },
  { id: 'legend', name: 'Legend of the Realm', desc: 'Reach Level 8', icon: '🌟', condition: level >= 8 },
  { id: 'ironclad', name: 'Ironclad', desc: 'Survive 6 months', icon: '📅', condition: monthsCompleted >= 6 },
  { id: 'diamond', name: 'Diamond Discipline', desc: 'Survive 12 months', icon: '💎', condition: monthsCompleted >= 12 },
  { id: 'perfect_month', name: 'Perfect Month', desc: 'Pay all bills with 50%+ surplus', icon: '🎯', condition: checked after payday },
  { id: 'overkill', name: 'Overkill', desc: 'Slay a $1,000+ bill', icon: '🗡️', condition: any single bill >= 1000 slain }
]

Store unlocked achievements as: unlockedAchievements: { [id]: timestamp }

## ACHIEVEMENT CHECK
After every payday sequence completes, run achievement checks. For each newly unlocked achievement, queue a toast notification.

## TOAST NOTIFICATION
- Slides in from the top of the screen, positioned over the 3D scene
- Dark bg with gold border, pixel font
- Shows: icon + "Achievement Unlocked!" + achievement name
- Auto-dismisses after 3 seconds with slide-up animation
- If multiple unlock simultaneously, queue them with 0.5s delay between each

## ACHIEVEMENTS PANEL
- Trophy icon button (🏆) in the HUD, next to the capture button
- Opens a modal/overlay listing all 10 achievements
- Unlocked: full color, shows icon + name + desc + date earned
- Locked: grayscale/dimmed, shows "???" for name, silhouetted icon, hint text for desc
- Close button (X) in corner

## ACHIEVEMENT SHARE CARDS
Each unlocked achievement has a small "Share" button that:
1. Generates a PNG card (400x200) using Canvas 2D:
   - Dark background with gold gradient border
   - Achievement icon (emoji rendered large)
   - "ACHIEVEMENT UNLOCKED" header
   - Achievement name + description
   - "[Kingdom Name] · paydaykingdom.app" footer
2. Triggers download or Web Share API

## PERSISTENCE
All unlocked achievements persist in localStorage via Zustand persist.
Achievement checks must be idempotent — don't re-trigger toasts for already-unlocked achievements.
```

---

### TICKET J-003: Screenshot & Share System Polish

```
Upgrade the screenshot/share system in the existing payday-kingdom project. The current basic implementation needs to become THE viral growth mechanism.

## ENHANCED CAPTURE FLOW
When user clicks "📸 Capture Kingdom":

1. PREPARATION (instant):
   - Hide all HTML overlays (HUD, panels)
   - Set Three.js renderer to 2x resolution (multiply current size by 2, set pixelRatio to window.devicePixelRatio * 2)
   - Position camera to a beauty-shot angle (slightly lower, centered on island)

2. RENDER & CAPTURE:
   - renderer.render(scene, camera)
   - Grab dataURL: renderer.domElement.toDataURL('image/png')
   - Restore original renderer size and pixelRatio
   - Restore all overlays

3. COMPOSITE FINAL IMAGE (Canvas 2D):
   - Create canvas: scene width x (scene height + 120px banner)
   - Draw scene image at top
   - Draw banner bar at bottom (120px height):
     - Background: linear gradient from #1e293b to #0f172a
     - Left side: "🏰" emoji + Kingdom name in white, 20px bold font
     - Center: "Lv.X [TierName] · Month X · $XX,XXX saved"
     - Right side: "paydaykingdom.app" in smaller gray text
     - Thin gold line (1px, #fbbf24) at top of banner separating it from scene
   - If any achievements were recently unlocked, show small gold badge icons in the banner

4. SHOW SHARE MODAL:
   After composite, show a modal with:
   - Preview of the generated image (scaled to fit)
   - Three action buttons:
     - "💾 Download" — triggers blob download as "[kingdomName]-month-[X].png"
     - "📋 Copy" — navigator.clipboard.write() with the image blob (show "Copied!" confirmation)
     - "📤 Share" — navigator.share() with the image file (only show if Web Share API available)
   - Close button (X)

## ADDITIONAL SHARE TRIGGERS
Besides the manual capture button, automatically offer screenshot after:
- Completing a payday battle (show "📸 Capture this victory?" prompt, small and non-intrusive, auto-dismisses after 5s)
- Unlocking an achievement (the achievement toast has a small camera icon that captures)
- Reaching a new island stage

## MOBILE OPTIMIZATION
- On mobile, the share button should use navigator.share() as primary action (opens native share sheet)
- Image should be optimized for Instagram Stories aspect ratio option (1080x1920): offer "Story Mode" toggle in share modal that re-renders the scene in portrait with larger banner

## QUALITY
- Final image must be crisp — minimum 1080px wide
- Use preserveDrawingBuffer: true on the WebGL renderer (set this during initialization) so toDataURL always works
- Banner text must be anti-aliased and readable at any size
```

---

## ✨ PHASE 3 — POLISH (Hours 24–40)

### TICKET P-001: Sound Effects (if time permits)
```
Add procedural retro sound effects using Tone.js to the existing payday-kingdom project.

Create a SoundManager module (src/lib/soundManager.js) that generates all sounds procedurally:
- bill_add: rising "blip" — Tone.Synth, triangle wave, C5→E5 in 0.1s
- bill_remove: falling "bloop" — Tone.Synth, triangle wave, E5→C4 in 0.15s
- payday_start: 3-note trumpet fanfare — Tone.Synth, square wave, C4→E4→G4, 0.15s each
- hero_spawn: thud + sparkle — Tone.MembraneSynth low hit + Tone.MetalSynth high ping
- monster_slay: slash + pop — Tone.NoiseSynth white noise burst (0.05s) + Tone.Synth square wave descending
- xp_tick: rapid coin dings — Tone.Synth, sine wave, repeated C6 notes, 0.05s each
- level_up: major arpeggio — Tone.Synth, C4→E4→G4→C5, 0.2s each, slight delay between
- victory: triumphant melody — 4-note phrase, C5→E5→G5→C6
- island_grow: shimmer — Tone.NoiseSynth with filter sweep from 200Hz→2000Hz over 1s

Integration:
- Add mute toggle button (🔊/🔇) in HUD, state persists in localStorage
- All sounds respect mute state
- No audio until first user interaction (call Tone.start() on first click)
- Sounds must not overlap awkwardly — use Tone.Transport or simple debouncing

Keep all sounds short, 8-bit feeling, satisfying. If a sound is annoying, make it quieter or shorter.
```

### TICKET P-002: Visual Polish Pass
```
Polish the visual quality of the existing payday-kingdom project:

1. PARTICLES: Add ambient floating particles in the scene — tiny white cubes that slowly drift upward around the island, very subtle, adds life
2. SHADOWS: Enable shadow mapping on the renderer. DirectionalLight casts shadows. Island base and buildings receive shadows. Soft shadow quality.
3. FOG: Add subtle distance fog (THREE.FogExp2, color matching background, low density) for depth
4. WATER: Animate the water plane — use a simple vertex shader or just animate Y position with a sine wave for gentle waves
5. HERO IDLE: When hero is visible but not battling, add a subtle breathing animation (scale Y oscillation 0.98-1.02)
6. PAYDAY BUTTON: Add screen-shake effect (CSS transform on the scene container) when the hero lands and when monsters explode
7. COLOR GRADING: Add a subtle vignette effect (CSS box-shadow inset on the scene container)
```

### TICKET P-003: Edge Cases & Hardening
```
Fix edge cases in the existing payday-kingdom project:

1. 0 bills: "Trigger Payday" should still work — hero spawns, does victory pose immediately, "No monsters to slay! Your realm is at peace." message
2. 0 income: Allow it but show a warning "Your treasury is empty, brave soul"
3. 20+ bills: Monsters should still fit — reduce spacing in semicircle, allow overflow to second row if >12
4. Large amounts ($50,000+): Format all currency with commas, ensure monster scaling doesn't break scene
5. Small amounts ($1): Small monster should still be visible
6. Rapid payday clicks: Button must be truly disabled during animation, no double-triggers
7. localStorage full: Wrap persist in try/catch, show warning if storage fails
8. Browser resize during animation: Scene should handle resize without breaking animation state
9. First payday with no history: monthsCompleted should go from 0→1 correctly
```

---

## 🚀 PHASE 4 — SHIP IT (Hours 40–48)

### Deploy
```
# In project root
npx vercel --prod
```
Or push to GitHub and connect to Vercel dashboard.

### Demo Checklist
- [ ] Fresh user flow: onboarding → add bills → trigger payday → battle → screenshot
- [ ] Returning user: data persists, month 2 works, level up triggers
- [ ] Mobile: full flow on phone
- [ ] Screenshot: image looks good, banner is readable
- [ ] Achievement: at least "First Blood" triggers and shows toast
- [ ] Share: download works, Web Share works on mobile

### Hackathon Submission Notes
**Pitch the CREATIVITY angle hard:**
- "Personal finance meets RPG — your budget is your battlefield"
- "Every bill is a monster. Every payday is a battle. Every month builds your kingdom."
- "Designed to screenshot and flex — financial discipline becomes social content"
- Zero backend, zero bank access, 100% browser-based, privacy-first

---

## ⏰ TIME BUDGET (48 hours)

| Phase | Hours | What |
|-------|-------|------|
| Phase 1: Core one-shot | 0–6 | Working app with full game loop |
| Fix/debug core | 6–8 | Patch whatever CC got wrong |
| J-001: Monster designs | 8–12 | 8 unique monsters + death anims |
| J-002: Achievements | 12–16 | 10 achievements + toasts + panel |
| J-003: Screenshot polish | 16–20 | Share modal + auto-prompts |
| P-001: Sound (stretch) | 20–24 | Retro audio |
| P-002: Visual polish | 24–30 | Shadows, particles, water |
| P-003: Edge cases | 30–36 | Hardening |
| Buffer / freestyle | 36–40 | Whatever needs love |
| Deploy + demo | 40–48 | Ship, test, submit |

**The golden rule: if the battle animation doesn't make you smile by Hour 8, stop everything and fix it. That moment IS the product.**
