PAYDAY KINGDOM — MVP Spec & Build Plan  
  
## The Pitch (One Sentence)  
  
A gamified personal budget app where your payday spawns voxel heroes that slay your bills, and your island grows more beautiful the longer you stay on budget — designed to screenshot and flex.  
  
-----  
  
## The Feeling  
  
Animal Crossing gave people a cozy world they could control when the real world felt scary. Payday Kingdom does the same for your money. Every bill paid is a monster slain. Every month survived grows your kingdom. Your financial discipline becomes a beautiful, shareable little world.  
  
-----  
  
## Tech Stack  
  
|Layer               |Choice                                    |Why                                                                       |  
|--------------------|------------------------------------------|--------------------------------------------------------------------------|  
|**Framework**       |React + Vite                              |Fast dev, hot reload, artifact-friendly                                   |  
|**3D Rendering**    |Three.js                                  |Industry standard, massive community, voxel-friendly                      |  
|**Voxel Style**     |Procedural geometry (BoxGeometry)         |No external assets needed for MVP, BernieBot can generate programmatically|  
|**State Management**|Zustand                                   |Lightweight, simple, perfect for game state                               |  
|**Data Persistence**|localStorage (MVP)                        |Zero backend, instant, good enough for v1                                 |  
|**Styling**         |Tailwind CSS                              |Rapid UI for the budget entry panels                                      |  
|**Screenshot**      |html2canvas or Three.js renderer.toDataURL|Share-to-social functionality                                             |  
|**Deployment**      |Vercel or GitHub Pages                    |Free, instant, shareable URL                                              |  
  
-----  
  
## Core Game Loop  
  
```  
Enter Income → Enter Bills → Payday Triggers →  
Hero Spawns → Hero Fights Bill Monsters →  
Bills Defeated → Island Grows → XP Earned →  
Level Up → Hero Gets Cooler Gear →  
Screenshot & Share → Come Back Next Month  
```  
  
-----  
  
## MVP Scope (What’s IN)  
  
- Manual income & bill entry (no bank integrations)  
- Single voxel island scene rendered in Three.js  
- Hero character that visually “fights” bill monsters  
- Island evolution: barren → growing → lush (based on months/XP)  
- Hero leveling: bronze → silver → gold armor  
- Screenshot/export button  
- Satisfying animations (spawn, fight, victory)  
- Mobile-responsive layout  
  
## MVP Scope (What’s OUT)  
  
- Plaid / bank API integration  
- Multiplayer / friend comparison  
- Backend / user accounts  
- Real AI agents  
- Complex RPG mechanics  
- App store deployment  
- Notification system  
  
-----  
  
## Ticket Breakdown — BernieBot Execution Plan  
  
### Naming Convention  
  
`PK-XXX` — Payday Kingdom tickets, numbered sequentially.  
  
### Chunking Rules  
  
- 3 tickets per day  
- Each ticket is self-contained and testable  
- Each ticket builds on the previous day’s work  
- Estimated 7-8 working days to MVP  
  
-----  
  
## 📅 DAY 1 — Project Skeleton & Scene  
  
### PK-001: Project Scaffolding  
  
**Type:** Setup  
**Description:** Initialize a React + Vite project with Three.js, Zustand, and Tailwind CSS. Set up folder structure, basic routing, and a placeholder landing screen.  
  
**Folder Structure:**  
  
```  
payday-kingdom/  
├── src/  
│   ├── components/  
│   │   ├── ui/           # Budget entry forms, HUD  
│   │   ├── scene/        # Three.js scene components  
│   │   └── shared/       # Reusable bits  
│   ├── store/            # Zustand stores  
│   │   ├── gameStore.js  # XP, level, island state  
│   │   └── budgetStore.js # Income, bills, history  
│   ├── utils/  
│   │   ├── voxelBuilder.js  # Helper to create voxel meshes  
│   │   └── constants.js     # Colors, sizes, XP curves  
│   ├── assets/  
│   ├── App.jsx  
│   └── main.jsx  
├── public/  
├── package.json  
└── vite.config.js  
```  
  
**Acceptance Criteria:**  
  
- `npm run dev` starts without errors  
- Blank page renders with “Payday Kingdom” title  
- All dependencies installed and importable  
- Tailwind utility classes work  
  
-----  
  
### PK-002: Basic Three.js Island Scene  
  
**Type:** 3D / Visual  
**Description:** Create a Three.js canvas that renders a flat isometric-style island base. Green platform floating on a dark background. Camera positioned at a 45° isometric angle. Orbit controls enabled for mouse interaction.  
  
**Technical Details:**  
  
- Canvas fills 60% of viewport (right side), budget UI fills left 40%  
- Island base: flat rectangular platform made of green BoxGeometry blocks (8x8 grid of cubes)  
- Slight elevation variations for organic feel (random Y offset 0-0.2 per block)  
- Water plane beneath the island (blue, semi-transparent)  
- Ambient light + directional light for soft shadows  
- Camera: PerspectiveCamera, positioned at isometric angle  
- OrbitControls: zoom limited, rotation limited to keep isometric feel  
- Background: gradient or solid dark green (#1a3a1a)  
  
**Acceptance Criteria:**  
  
- Green voxel island visible and centered  
- Water visible beneath  
- Mouse can orbit (limited) and zoom (limited)  
- Renders at 60fps on modern browser  
- Responsive to container resize  
  
-----  
  
### PK-003: Voxel Builder Utility  
  
**Type:** Utility / Core  
**Description:** Create a reusable utility module that generates common voxel objects from simple parameters. This is the LEGO brick system everything else builds on.  
  
**Functions to implement:**  
  
```javascript  
// Creates a single voxel cube at position  
createVoxel(x, y, z, color, size = 1)  
  
// Creates a tree (trunk + leaf cluster) at position  
createTree(x, z, style = 'pine' | 'oak' | 'round')  
  
// Creates a simple building shape  
createBuilding(x, z, width, height, depth, color)  
  
// Creates a character (stacked cubes: legs, body, head)  
createCharacter(x, z, armorColor, hasShield = false)  
  
// Creates a monster (stacked cubes: body, horns/spikes)  
createMonster(x, z, color, size = 'small' | 'medium' | 'large')  
  
// Creates a rock cluster  
createRocks(x, z, count = 3)  
  
// Group helper: wraps meshes in a Three.js Group  
createGroup(meshes)  
```  
  
**Color Palette:**  
  
```javascript  
const COLORS = {  
  grass: ['#4ade80', '#22c55e', '#16a34a'],  
  water: '#3b82f6',  
  wood: '#92400e',  
  stone: '#9ca3af',  
  leaf: ['#15803d', '#166534', '#14532d'],  
  gold: '#fbbf24',  
  silver: '#d1d5db',  
  bronze: '#b45309',  
  monster: {  
    rent: '#ef4444',      // Red  
    electric: '#eab308',  // Yellow  
    phone: '#8b5cf6',     // Purple  
    insurance: '#f97316', // Orange  
    generic: '#6b7280',   // Gray  
  },  
  hero: {  
    skin: '#fcd34d',  
    base: '#60a5fa',  
  }  
};  
```  
  
**Acceptance Criteria:**  
  
- Each function returns a Three.js Mesh or Group  
- Trees look recognizably tree-like from isometric view  
- Characters are ~3-5 cubes tall, readable silhouette  
- Monsters are visually distinct from heroes  
- All functions accept position parameters  
- Colors match the defined palette  
  
-----  
  
## 📅 DAY 2 — Budget System & State  
  
### PK-004: Zustand Budget Store  
  
**Type:** State Management  
**Description:** Create the budget state management layer. Handles income, bills, and pay cycle tracking. Persists to localStorage.  
  
**State Shape:**  
  
```javascript  
{  
  income: 0,                    // Monthly income amount  
  bills: [  
    {  
      id: 'uuid',  
      name: 'Rent',  
      amount: 1200,  
      category: 'housing',      // housing, utilities, food, transport, entertainment, other  
      icon: 'rent',             // maps to monster type  
      isPaid: false,  
      dueDay: 1,                // day of month  
    }  
  ],  
  paydayDate: 1,                // day of month  
  currentMonth: '2026-02',      // tracks current active month  
  history: [                    // past months  
    { month: '2026-01', totalBills: 2400, totalPaid: 2400, surplus: 600 }  
  ],  
}  
```  
  
**Actions:**  
  
```javascript  
setIncome(amount)  
addBill({ name, amount, category, dueDay })  
removeBill(id)  
updateBill(id, updates)  
markBillPaid(id)  
triggerPayday()              // resets month, marks all unpaid  
resetMonth()  
getSurplus()                 // computed: income - total bills  
getMonthsCompleted()         // computed: history.length  
```  
  
**Acceptance Criteria:**  
  
- State persists across page refreshes (localStorage)  
- All actions work correctly  
- Computed values calculate properly  
- Adding/removing bills updates totals immediately  
  
-----  
  
### PK-005: Budget Entry UI  
  
**Type:** UI Component  
**Description:** Left panel UI for entering income and managing bills. Clean, minimal, slightly gamified aesthetic.  
  
**Layout:**  
  
```  
┌──────────────────────────────┐  
│  💰 Your Kingdom Treasury    │  
│                              │  
│  Monthly Income              │  
│  ┌──────────────────────┐    │  
│  │ $ 4,500              │    │  
│  └──────────────────────┘    │  
│                              │  
│  📋 Bills (Monsters to Slay) │  
│                              │  
│  🔴 Rent         $1,200  ✕   │  
│  🟡 Electric     $  150  ✕   │  
│  🟣 Phone        $   85  ✕   │  
│  🟠 Insurance    $  200  ✕   │  
│                              │  
│  [+ Add Bill]                │  
│                              │  
│  ─────────────────────────   │  
│  Surplus: $2,865             │  
│  Months Survived: 3          │  
│                              │  
│  [⚔️ TRIGGER PAYDAY]        │  
│                              │  
└──────────────────────────────┘  
```  
  
**Styling Notes:**  
  
- Dark theme (slate-900 background)  
- Pixel/retro font for headings (Google Fonts: “Press Start 2P” or “VT323”)  
- Smooth sans-serif for numbers/data  
- Color-coded bill categories matching monster colors  
- “Trigger Payday” button is large, glowing, exciting  
- Subtle hover animations on bills  
- Mobile: this panel slides up from bottom as a sheet  
  
**Acceptance Criteria:**  
  
- Can input monthly income  
- Can add bills with name, amount, category  
- Can remove bills  
- Surplus calculates live  
- Month counter shows history length  
- Payday button is prominent and satisfying to look at  
- Responsive: works on mobile viewport  
  
-----  
  
### PK-006: Connect Budget Store to Scene  
  
**Type:** Integration  
**Description:** Wire the Zustand budget store to the Three.js scene. When bills exist, render monsters on the island. When income is set, show a treasure chest or gold pile.  
  
**Mapping Rules:**  
  
- Each bill → one monster on the island, sized proportional to bill amount  
  - < $100 → small monster  
  - $100-500 → medium monster  
  - $500+ → large monster  
- Monster color matches bill category  
- Monsters positioned in a semi-circle on the island  
- Income → gold pile near center of island, size scales with amount  
- If no data entered → island shows a “?” block in the center  
  
**Acceptance Criteria:**  
  
- Adding a bill instantly spawns a monster on the island  
- Removing a bill removes the monster  
- Monster sizes correspond to bill amounts  
- Monster colors match categories  
- Scene updates reactively with store changes  
  
-----  
  
## 📅 DAY 3 — The Hero & Battle System  
  
### PK-007: Hero Character & Leveling  
  
**Type:** Game Logic + Visual  
**Description:** Create the hero character that spawns on payday. Hero appearance changes based on level (months survived).  
  
**Level Progression:**  
  
```  
Level 1 (Month 1):    Peasant - brown tunic, no weapon  
Level 2 (Month 2):    Recruit - leather armor, wooden sword  
Level 3 (Month 3):    Soldier - bronze armor, iron sword  
Level 5 (Month 5):    Knight - silver armor, steel sword, shield  
Level 8 (Month 8):    Champion - gold armor, flame sword, shield, cape  
Level 12 (Month 12):  Legend - diamond armor, lightning sword, wings  
```  
  
**Zustand Game Store:**  
  
```javascript  
{  
  level: 1,  
  xp: 0,  
  totalBillsSlain: 0,  
  heroVisible: false,  
  heroPosition: { x: 0, z: 0 },  
  armorTier: 'peasant',       // computed from level  
}  
```  
  
**XP Rules:**  
  
- Each bill slain = bill amount as XP (paying $1200 rent = 1200 XP)  
- Level thresholds: 1000, 3000, 6000, 10000, 20000, 50000  
- Level up triggers a brief celebration animation  
  
**Acceptance Criteria:**  
  
- Hero renders on island when `heroVisible = true`  
- Visual appearance matches current level tier  
- XP accumulates correctly when bills are slain  
- Level transitions change hero appearance instantly  
- Hero is clearly distinguishable from monsters  
  
-----  
  
### PK-008: Battle Animation Sequence  
  
**Type:** Animation / Core Experience  
**Description:** When the user clicks “Trigger Payday,” execute the battle sequence. This is THE core dopamine moment of the entire app.  
  
**Sequence (all animated):**  
  
```  
1. HERO SPAWN (0.5s)  
   - Hero drops from above onto island center  
   - Landing impact: small particle burst (white cubes scatter)  
   - Brief pose (0.3s hold)  
  
2. BATTLE PHASE (0.5s per monster)  
   - Hero slides toward first monster  
   - Quick slash animation (hero rotates 360°)  
   - Monster flashes white → explodes into colored particles  
   - "+$XXX" text floats up from monster position (bill amount)  
   - XP counter ticks up in the HUD  
   - Repeat for each monster, hero moves to next  
  
3. VICTORY (1s)  
   - All monsters gone  
   - Hero returns to center  
   - Victory pose (jumps up)  
   - "PAYDAY COMPLETE" text appears  
   - XP bar fills, level up triggers if threshold met  
   - Island growth animation triggers (see PK-009)  
  
4. LEVEL UP (if applicable, 1.5s)  
   - Screen flash  
   - Hero armor transforms (color change with particle burst)  
   - "LEVEL UP!" text with fanfare  
   - New armor tier name shown briefly  
```  
  
**Animation Tech:**  
  
- Use Three.js Tween (or simple requestAnimationFrame lerping)  
- Particle system: array of small BoxGeometry meshes with velocity + gravity  
- Text: HTML overlay positioned via CSS, not 3D text (simpler, crisper)  
  
**Acceptance Criteria:**  
  
- Full sequence plays when “Trigger Payday” is clicked  
- Each monster death is visually satisfying  
- Bill amounts float up as “+$” values  
- Victory sequence feels rewarding  
- Level up is distinct and exciting  
- Sequence doesn’t break if there are 1 bill or 10 bills  
- Button is disabled during animation  
- Budget store updates after sequence completes (bills marked paid, XP added)  
  
-----  
  
### PK-009: Island Growth System  
  
**Type:** Visual / Progression  
**Description:** The island visually evolves based on cumulative months survived. This is the long-term reward loop — your kingdom literally grows from your financial discipline.  
  
**Growth Stages:**  
  
```  
Stage 0 (Start):     Barren island - just grass platform, maybe 1 dead tree  
Stage 1 (Month 1):   Sprout - 2-3 small trees appear, some flowers (colored blocks)  
Stage 2 (Month 2):   Settlement - a small hut appears, more trees, a path  
Stage 3 (Month 3):   Village - hut upgrades to house, well appears, garden  
Stage 4 (Month 5):   Town - second building, fence, pond with blue blocks  
Stage 5 (Month 8):   Castle - main building becomes castle tower, walls, bridge  
Stage 6 (Month 12):  Kingdom - full castle, multiple buildings, fountain, clouds, flags  
```  
  
**Implementation:**  
  
- Each stage is a function that adds/modifies objects in the scene  
- Objects from previous stages remain (additive growth)  
- When advancing a stage, new objects animate in (scale from 0 to 1)  
- Store `islandStage` in gameStore, computed from `monthsCompleted`  
  
**Acceptance Criteria:**  
  
- Island visually changes at each stage threshold  
- New objects appear with a satisfying scale-in animation  
- Previous objects remain (nothing disappears on upgrade)  
- Visual quality increases noticeably at each stage  
- Stage 6 island looks genuinely impressive and screenshot-worthy  
  
-----  
  
## 📅 DAY 4 — Polish & Juice  
  
### PK-010: Sound Effects & Audio Feedback  
  
**Type:** Audio / Polish  
**Description:** Add satisfying sound effects for key interactions. Use the Web Audio API or Tone.js to generate retro-style synth sounds procedurally (no audio files needed).  
  
**Sound Events:**  
  
```  
- bill_add:      Short "blip" (rising pitch)  
- bill_remove:   Short "bloop" (falling pitch)  
- payday_start:  Trumpet fanfare (3 ascending notes)  
- hero_spawn:    Impact thud + sparkle  
- monster_slay:  Slash + explosion pop  
- xp_tick:       Rapid coin-like "ding ding ding"  
- level_up:      Ascending arpeggio (major chord)  
- victory:       Triumphant 4-note melody  
- island_grow:   Magical shimmer (rising filtered noise)  
```  
  
**Implementation:**  
  
- Use Tone.js (already available in artifact dependencies)  
- Create a `SoundManager` class/module  
- All sounds are procedurally generated (synth-based)  
- Global mute toggle in UI  
- Sounds should feel 8-bit/retro to match voxel aesthetic  
  
**Acceptance Criteria:**  
  
- Each sound event fires at the correct moment  
- Sounds feel retro and satisfying, not annoying  
- Mute button works and persists in localStorage  
- No audio plays until first user interaction (browser autoplay policy)  
- Sounds don’t overlap awkwardly during rapid sequences  
  
-----  
  
### PK-011: HUD & Stats Overlay  
  
**Type:** UI Component  
**Description:** In-game heads-up display overlaying the 3D scene. Shows key stats and progress.  
  
**HUD Layout (overlay on 3D scene):**  
  
```  
┌─────────────────────────────────────┐  
│ ⚔️ Lv.3 Soldier    XP: 4,200/6,000 │  
│ ████████████░░░░░░░ 70%             │  
│                                     │  
│                                     │  
│                                     │  
│              [3D SCENE]             │  
│                                     │  
│                                     │  
│                                     │  
│ 🏰 Village (Stage 3)    Month #3   │  
│ Bills Slain: 12   Total Saved: $8k  │  
└─────────────────────────────────────┘  
```  
  
**Styling:**  
  
- Semi-transparent dark background on text areas  
- Pixel font for level/XP  
- XP bar: gradient fill (green → gold as it fills)  
- Positioned absolute over the Three.js canvas  
- Minimal — shouldn’t obscure the island  
  
**Acceptance Criteria:**  
  
- HUD displays current level, XP, XP bar  
- Island stage name shown  
- Month counter visible  
- Total bills slain lifetime counter  
- Total money “saved” (surplus) shown  
- Updates reactively as game state changes  
- Doesn’t block island interaction (pointer-events: none on non-interactive areas)  
  
-----  
  
### PK-012: Responsive Layout & Mobile  
  
**Type:** UI / Responsive  
**Description:** Make the entire app work beautifully on mobile. This is critical for the screenshot-and-share use case — most sharing happens from phones.  
  
**Desktop Layout (>768px):**  
  
```  
┌─────────────────┬──────────────────────────┐  
│                  │                          │  
│   Budget Panel   │      3D Island Scene     │  
│   (40% width)    │      (60% width)         │  
│                  │      + HUD overlay        │  
│                  │                          │  
└─────────────────┴──────────────────────────┘  
```  
  
**Mobile Layout (<768px):**  
  
```  
┌──────────────────────────┐  
│                          │  
│     3D Island Scene      │  
│     (full width, 60vh)   │  
│     + HUD overlay        │  
│                          │  
├──────────────────────────┤  
│   Budget Panel           │  
│   (full width, scroll)   │  
│   [⚔️ TRIGGER PAYDAY]   │  
└──────────────────────────┘  
```  
  
**Touch Considerations:**  
  
- Touch-friendly orbit controls (single finger rotate, pinch zoom)  
- Large tap targets on buttons (min 44px)  
- Bottom sheet budget panel with handle to drag up/down  
- Payday button always visible without scrolling  
  
**Acceptance Criteria:**  
  
- Seamless layout switch at 768px breakpoint  
- 3D scene renders crisp on retina displays (devicePixelRatio)  
- Touch controls work for orbit  
- No horizontal scroll on any viewport  
- Payday button accessible without scrolling on mobile  
- Budget entry form usable on phone keyboard  
  
-----  
  
## 📅 DAY 5 — Shareability & Identity  
  
### PK-013: Screenshot & Share System  
  
**Type:** Feature / Viral Loop  
**Description:** THE growth mechanism. Users capture their island and share it. Make this as frictionless as possible.  
  
**Features:**  
  
- “📸 Capture Kingdom” button in the HUD  
- Click → hide UI → render scene at 2x resolution → restore UI  
- Generated image includes:  
  - The 3D island scene (beautiful, centered)  
  - A subtle banner at bottom: “My Payday Kingdom — Lv.5 Knight | Month 5 | paydaykingdom.app”  
  - Hero and island in their current glory  
- Options after capture:  
  - Download as PNG  
  - Copy to clipboard (navigator.clipboard API)  
  - Share via Web Share API (mobile: opens native share sheet)  
  
**Watermark/Banner Design:**  
  
```  
┌─────────────────────────────────┐  
│                                 │  
│         [Island Scene]          │  
│                                 │  
│                                 │  
├─────────────────────────────────┤  
│ 🏰 Payday Kingdom              │  
│ Lv.5 Knight · Month 5 · $12k   │  
│ paydaykingdom.app               │  
└─────────────────────────────────┘  
```  
  
**Technical Approach:**  
  
- Use `renderer.domElement.toDataURL('image/png')` for the 3D scene  
- Composite with a Canvas 2D overlay for the banner  
- Generate final image as a blob for download/share  
  
**Acceptance Criteria:**  
  
- One-click screenshot capture  
- Image is high quality (2x render resolution)  
- Banner is clean and includes level, stage, and URL  
- Download works on all browsers  
- Web Share API works on mobile (graceful fallback on desktop)  
- Copy to clipboard works on desktop  
- Capturing doesn’t visibly disrupt the UI (fast enough)  
  
-----  
  
### PK-014: Kingdom Naming & Customization  
  
**Type:** Feature / Identity  
**Description:** Let users name their kingdom and pick a banner color. Small touch, big ownership feeling.  
  
**Features:**  
  
- On first launch: “Name Your Kingdom” modal  
  - Text input with placeholder: “e.g., Fort Savings, Castle Coinsworth…”  
  - Banner color picker (6 preset colors: red, blue, green, purple, gold, black)  
- Kingdom name appears:  
  - In the HUD header  
  - On the screenshot banner  
  - On a tiny flag/banner object on the island (matching chosen color)  
- Editable later via a settings gear icon  
  
**Acceptance Criteria:**  
  
- First-time user sees naming modal before anything else  
- Name persists in localStorage  
- Name appears in HUD and screenshots  
- Flag object appears on island in chosen color  
- Can edit name/color from settings  
  
-----  
  
### PK-015: Onboarding Flow  
  
**Type:** UX / First-Time Experience  
**Description:** Guide new users through setup in a way that feels like starting a new game, not filling out a boring form.  
  
**Flow:**  
  
```  
Screen 1: "Welcome, brave soul."  
          "In Payday Kingdom, your financial discipline  
           builds a thriving world."  
          [Begin Your Journey →]  
  
Screen 2: "Name Your Kingdom"  
          [Kingdom Name Input]  
          [Banner Color Selection]  
          [Continue →]  
  
Screen 3: "How much treasure arrives each month?"  
          "Enter your monthly income"  
          [$ Income Input]  
          [Continue →]  
  
Screen 4: "What monsters threaten your realm?"  
          "Add your monthly bills"  
          [Bill Entry Form - at least 1 required]  
          [+ Add Another Monster]  
          [Forge My Kingdom →]  
  
Screen 5: [Camera zooms into island from far away]  
          "Your Kingdom Awaits."  
          [Reveal - island appears with monsters on it]  
          [Ready for Payday? ⚔️]  
```  
  
**Styling:**  
  
- Full-screen dark overlay with centered text  
- Cinematic feel (slow fade transitions)  
- Pixel font for headings, clean font for instructions  
- Each step has a subtle background animation (floating voxel cubes)  
  
**Acceptance Criteria:**  
  
- Flow only appears on first visit (tracked in localStorage)  
- Each step validates input before allowing “Continue”  
- Data flows into Zustand stores correctly  
- Final reveal transitions smoothly into the main app  
- Can be skipped entirely with a “Skip” link (for returning users on new devices)  
- After completion, all entered data visible in the budget panel and scene  
  
-----  
  
## 📅 DAY 6 — Content & Social Proof  
  
### PK-016: Bill Category Icons & Monster Designs  
  
**Type:** Visual / Content  
**Description:** Create distinct, recognizable monster designs for each bill category. These are the villains of the story — they need personality.  
  
**Monster Designs (all built from voxels/BoxGeometry):**  
  
```  
🏠 Housing (Rent/Mortgage):  Large red golem, boxy, heavy  
⚡ Utilities (Electric/Gas):  Yellow electric slime, sparky particles  
📱 Phone/Internet:            Purple floating eye, antenna on top  
🚗 Transportation:            Orange mechanical spider  
🍔 Food/Groceries:            Green blob with mouth  
💊 Health/Insurance:           White/blue ghost shape  
🎮 Entertainment:             Pink jester/imp, small and bouncy  
📋 Other:                     Gray generic goblin  
```  
  
**Each monster should:**  
  
- Have a subtle idle animation (bobbing, rotating, particle emit)  
- Scale with bill amount (3 size tiers)  
- Have a distinct death animation matching their theme  
  - Housing golem: crumbles into blocks  
  - Electric slime: zaps and dissolves  
  - Phone eye: static effect and fades  
  - etc.  
  
**Acceptance Criteria:**  
  
- Each category has a visually distinct monster  
- Monsters are recognizable at the isometric camera distance  
- Idle animations run smoothly  
- Death animations are unique per category  
- Sizes scale correctly with bill amounts  
  
-----  
  
### PK-017: Achievement System  
  
**Type:** Feature / Retention  
**Description:** Milestone achievements that give users reasons to keep coming back and things to screenshot/share.  
  
**Achievement List:**  
  
```  
🏅 First Blood         - Slay your first bill  
⚔️ Monster Hunter      - Slay 10 bills total  
🏰 Kingdom Builder     - Reach Island Stage 3  
💰 Dragon's Hoard      - Accumulate $10,000 surplus  
👑 Royal Guard         - Reach Hero Level 5  
🌟 Legend of the Realm - Reach Hero Level 12  
📅 Ironclad            - Survive 6 consecutive months  
💎 Diamond Discipline  - Survive 12 consecutive months  
🎯 Perfect Month       - Pay all bills with 50%+ surplus  
🗡️ Overkill            - Slay a $1,000+ bill monster  
```  
  
**UI:**  
  
- Achievement toast notification when unlocked (slides in from top)  
- Achievements page accessible from a trophy icon in HUD  
- Locked achievements show as silhouette/mystery  
- Unlocked achievements show with date earned  
- Share button per achievement (generates specific share image)  
  
**Acceptance Criteria:**  
  
- Achievements trigger at correct thresholds  
- Toast notification is visible and dismisses automatically  
- Achievement list page works  
- Locked vs unlocked visual distinction is clear  
- Shareable achievement cards generate correctly  
  
-----  
  
### PK-018: Landing Page  
  
**Type:** Marketing / Growth  
**Description:** A beautiful landing page at the root URL that sells the concept before users enter the app.  
  
**Sections:**  
  
```  
1. HERO SECTION  
   - Animated voxel island (Three.js, slowly rotating)  
   - "Your Budget. Your Kingdom."  
   - "Turn boring bills into epic battles. Watch your world grow."  
   - [Start Your Kingdom →] CTA button  
  
2. HOW IT WORKS  
   - 3 steps with icons:  
     1. "Enter your income and bills"  
     2. "Trigger payday and watch the battle"  
     3. "Level up and grow your kingdom"  
  
3. SCREENSHOT SHOWCASE  
   - Grid of example kingdom screenshots at different stages  
   - "From humble beginnings to legendary kingdoms"  
  
4. SHARE TEASE  
   - "Flex your kingdom on social"  
   - Mock social media post with kingdom screenshot  
   - "Join 0 kingdom builders" (counter, starts at 0, who cares)  
  
5. FOOTER  
   - "Built with 🗡️ by Skyframe Innovations"  
   - GitHub link  
   - "No bank access required. Your data stays in your browser."  
```  
  
**Acceptance Criteria:**  
  
- Page loads fast (<2s)  
- Animated voxel island catches attention  
- CTA leads to onboarding flow  
- Mobile responsive  
- Privacy message clearly visible (no bank data)  
- Clean, professional, fun  
  
-----  
  
## 📅 DAY 7 — Integration & Launch Prep  
  
### PK-019: End-to-End Testing & Bug Fixing  
  
**Type:** QA  
**Description:** Full walkthrough of the app from onboarding to month 3. Fix all bugs, polish all rough edges.  
  
**Test Scenarios:**  
  
1. Fresh user: onboarding → enter income → add 5 bills → trigger payday → verify battle → verify island growth → screenshot  
1. Returning user: data persists → add new bill → trigger month 2 → level up → verify hero change  
1. Edge cases: 0 income, 0 bills, 1 bill, 20 bills, very large amounts ($50k), very small amounts ($1)  
1. Mobile: full flow on 375px viewport  
1. Screenshot: verify image quality, banner text, sharing options  
  
**Acceptance Criteria:**  
  
- All 5 scenarios pass without errors  
- No console errors or warnings  
- Performance: 60fps on scene, <2s initial load  
- localStorage correctly persists all state  
  
-----  
  
### PK-020: GitHub Repo & README  
  
**Type:** Packaging / Launch  
**Description:** Prepare the repository for public launch. The README is a marketing document — it should make developers want to star, fork, and share.  
  
**README Structure:**  
  
```markdown  
# 🏰 Payday Kingdom  
> Turn your boring budget into an epic voxel adventure  
  
[Hero screenshot of a Stage 6 kingdom]  
  
## What is this?  
One paragraph pitch.  
  
## Demo  
Link to deployed app.  
  
## Screenshots  
4 screenshots showing progression from Stage 0 to Stage 6.  
  
## How It Works  
Brief explanation of the game loop.  
  
## Tech Stack  
Badges for React, Three.js, Zustand, Tailwind, Vite.  
  
## Run Locally  
npm install → npm run dev  
  
## Roadmap  
- [ ] AI Agent integration (agents as NPCs)  
- [ ] Multiplayer kingdom visits  
- [ ] Plaid integration for auto-import  
- [ ] Mobile app (React Native)  
- [ ] Seasonal events (holiday island themes)  
  
## Built By  
Skyframe Innovations LLC  
Link to Dan's socials  
  
## License  
MIT  
```  
  
**Acceptance Criteria:**  
  
- README renders beautifully on GitHub  
- Screenshots are real (from test runs)  
- Demo link works  
- Local dev instructions work from fresh clone  
- Roadmap teases the AI Agent evolution  
- License file present  
  
-----  
  
### PK-021: Deploy to Vercel  
  
**Type:** DevOps / Launch  
**Description:** Deploy the app to Vercel with a custom domain (or Vercel subdomain for MVP).  
  
**Steps:**  
  
1. Connect GitHub repo to Vercel  
1. Configure build: `npm run build`  
1. Set up domain: `paydaykingdom.vercel.app` (or custom if available)  
1. Verify build succeeds  
1. Test deployed version on desktop + mobile  
1. Set up Vercel Analytics (free tier) for basic traffic tracking  
  
**Acceptance Criteria:**  
  
- App accessible at public URL  
- All features work in production build  
- Mobile works on real devices  
- Analytics tracking pageviews  
  
-----  
  
## 📅 Summary: Daily Ticket Schedule  
  
|Day|Tickets               |Focus                                      |  
|---|----------------------|-------------------------------------------|  
|1  |PK-001, PK-002, PK-003|Project setup, scene, voxel toolkit        |  
|2  |PK-004, PK-005, PK-006|Budget system, UI, store-to-scene wiring   |  
|3  |PK-007, PK-008, PK-009|Hero, battle animation, island growth      |  
|4  |PK-010, PK-011, PK-012|Sound, HUD, responsive/mobile              |  
|5  |PK-013, PK-014, PK-015|Screenshot/share, naming, onboarding       |  
|6  |PK-016, PK-017, PK-018|Monster designs, achievements, landing page|  
|7  |PK-019, PK-020, PK-021|Testing, README, deploy                    |  
  
-----  
  
## 🔮 Post-MVP Roadmap (The Animal Crossing Vision)  
  
Once the MVP is live and generating content/buzz:  
  
1. **AI Agent NPCs** — Your actual AI agents (BernieBot, etc.) show up as villagers on your island, doing tasks and reporting status  
1. **Friend Visits** — Share a code, visit each other’s kingdoms, leave gifts  
1. **Seasonal Events** — Holiday-themed island decorations, limited-time monsters  
1. **Plaid Integration** — Auto-import bills and income  
1. **Recurring Payday** — Auto-trigger on your actual payday  
1. **Custom Monsters** — Design your own bill monsters  
1. **Kingdom Marketplace** — Earn coins to buy decorations  
1. **Leaderboards** — Anonymous financial discipline rankings  
1. **Mobile App** — React Native wrapper  
  
-----  
  
*Built with 🗡️ for people who deserve to feel good about their money.*  
*Skyframe Innovations LLC — 2026*  