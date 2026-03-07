// Color palette
export const COLORS = {
  grass: [0x4ade80, 0x22c55e, 0x16a34a],
  water: 0x3b82f6,
  wood: 0x92400e,
  stone: 0x9ca3af,
  leaf: [0x15803d, 0x166534, 0x14532d],
  gold: 0xfbbf24,
  silver: 0xd1d5db,
  bronze: 0xb45309,
  heroSkin: 0xfcd34d,
  heroBase: 0x60a5fa,
  background: 0x0f172a,
}

export const MONSTER_COLORS = {
  housing: 0xef4444,
  utilities: 0xeab308,
  phone: 0x8b5cf6,
  transport: 0xf97316,
  food: 0x22c55e,
  insurance: 0x3b82f6,
  entertainment: 0xec4899,
  other: 0x6b7280,
}

export const MONSTER_COLOR_HEX = {
  housing: '#ef4444',
  utilities: '#eab308',
  phone: '#8b5cf6',
  transport: '#f97316',
  food: '#22c55e',
  insurance: '#3b82f6',
  entertainment: '#ec4899',
  other: '#6b7280',
}

export const BILL_CATEGORIES = [
  { id: 'housing', label: 'Housing', emoji: '🏠' },
  { id: 'utilities', label: 'Utilities', emoji: '⚡' },
  { id: 'phone', label: 'Phone', emoji: '📱' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'food', label: 'Food', emoji: '🍔' },
  { id: 'insurance', label: 'Insurance', emoji: '💊' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎮' },
  { id: 'other', label: 'Other', emoji: '📋' },
]

export const XP_THRESHOLDS = [1000, 3000, 6000, 10000, 20000, 50000]

export const TIER_NAMES = {
  1: 'Peasant',
  2: 'Recruit',
  3: 'Soldier',
  5: 'Knight',
  8: 'Champion',
  12: 'Legend',
}

export function getTierName(level) {
  const tiers = [12, 8, 5, 3, 2, 1]
  for (const t of tiers) {
    if (level >= t) return TIER_NAMES[t]
  }
  return 'Peasant'
}

export function getLevelFromXP(xp) {
  let level = 1
  for (const threshold of XP_THRESHOLDS) {
    if (xp >= threshold) level++
    else break
  }
  return level
}

export function getXPProgress(xp, level) {
  const prevThreshold = level > 1 ? XP_THRESHOLDS[level - 2] : 0
  const nextThreshold = XP_THRESHOLDS[level - 1] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  if (level > XP_THRESHOLDS.length) return 1
  const progress = (xp - prevThreshold) / (nextThreshold - prevThreshold)
  return Math.min(Math.max(progress, 0), 1)
}

// Island stage thresholds: monthsCompleted -> stage
export const ISLAND_STAGES = [
  { months: 0, stage: 0, name: 'Barren Wasteland' },
  { months: 1, stage: 1, name: 'Sprouting Grounds' },
  { months: 2, stage: 2, name: 'Settlement' },
  { months: 3, stage: 3, name: 'Village' },
  { months: 5, stage: 4, name: 'Town' },
  { months: 8, stage: 5, name: 'Castle' },
]

export function getIslandStage(monthsCompleted) {
  let stage = 0
  for (const s of ISLAND_STAGES) {
    if (monthsCompleted >= s.months) stage = s.stage
  }
  return stage
}

export function getIslandStageName(stage) {
  const s = ISLAND_STAGES.find(s => s.stage === stage)
  return s ? s.name : 'Barren Wasteland'
}

export function getMonsterSize(amount) {
  if (amount < 100) return 'small'
  if (amount <= 500) return 'medium'
  return 'large'
}

export function getMonsterScale(size) {
  if (size === 'small') return 0.6
  if (size === 'medium') return 1.0
  return 1.4
}

export function formatCurrency(amount) {
  return '$' + Math.round(amount).toLocaleString('en-US')
}

export const HERO_COLORS = {
  1: { skin: 0xfcd34d, armor: 0x92400e },  // peasant - brown tunic
  2: { skin: 0xfcd34d, armor: 0xb45309 },  // recruit - bronze
  3: { skin: 0xfcd34d, armor: 0xd1d5db },  // soldier - silver
  5: { skin: 0xfcd34d, armor: 0xfbbf24 },  // knight+ - gold
}

export function getHeroColors(level) {
  const tiers = [5, 3, 2, 1]
  for (const t of tiers) {
    if (level >= t) return HERO_COLORS[t]
  }
  return HERO_COLORS[1]
}
