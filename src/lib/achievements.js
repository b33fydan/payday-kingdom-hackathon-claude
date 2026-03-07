export const ACHIEVEMENT_DEFS = [
  {
    id: 'first_blood',
    name: 'First Blood',
    desc: 'Slay your first bill',
    icon: '🏅',
    check: (state) => state.totalBillsSlain >= 1,
  },
  {
    id: 'monster_hunter',
    name: 'Monster Hunter',
    desc: 'Slay 10 bills total',
    icon: '⚔️',
    check: (state) => state.totalBillsSlain >= 10,
  },
  {
    id: 'kingdom_builder',
    name: 'Kingdom Builder',
    desc: 'Reach Island Stage 3',
    icon: '🏰',
    check: (state) => state.islandStage >= 3,
  },
  {
    id: 'dragons_hoard',
    name: "Dragon's Hoard",
    desc: 'Accumulate $10,000 surplus',
    icon: '💰',
    check: (state) => {
      const totalSurplus = state.history.reduce((sum, h) => sum + (h.surplus || 0), 0)
      return totalSurplus >= 10000
    },
  },
  {
    id: 'royal_guard',
    name: 'Royal Guard',
    desc: 'Reach Level 5',
    icon: '👑',
    check: (state) => state.level >= 5,
  },
  {
    id: 'legend',
    name: 'Legend of the Realm',
    desc: 'Reach Level 8',
    icon: '🌟',
    check: (state) => state.level >= 8,
  },
  {
    id: 'ironclad',
    name: 'Ironclad',
    desc: 'Survive 6 months',
    icon: '📅',
    check: (state) => state.monthsCompleted >= 6,
  },
  {
    id: 'diamond',
    name: 'Diamond Discipline',
    desc: 'Survive 12 months',
    icon: '💎',
    check: (state) => state.monthsCompleted >= 12,
  },
  {
    id: 'perfect_month',
    name: 'Perfect Month',
    desc: 'Pay all bills with 50%+ surplus',
    icon: '🎯',
    check: (state) => {
      if (state.history.length === 0) return false
      const latest = state.history[state.history.length - 1]
      if (!latest || latest.totalBills === 0) return false
      return latest.surplus >= latest.totalBills * 0.5
    },
  },
  {
    id: 'overkill',
    name: 'Overkill',
    desc: 'Slay a $1,000+ bill',
    icon: '🗡️',
    check: (state, battleResult) => {
      if (battleResult && battleResult.unpaidBills) {
        return battleResult.unpaidBills.some(b => b.amount >= 1000)
      }
      return state.bills.some(b => b.isPaid && b.amount >= 1000)
    },
  },
]

// Check all achievements, return array of newly unlocked IDs
export function checkAchievements(state, battleResult = null) {
  const newlyUnlocked = []
  for (const ach of ACHIEVEMENT_DEFS) {
    // Skip already unlocked
    if (state.achievements[ach.id]) continue
    if (ach.check(state, battleResult)) {
      newlyUnlocked.push(ach.id)
    }
  }
  return newlyUnlocked
}

// Generate a share card PNG for an achievement (returns a Promise<Blob>)
export function generateAchievementCard(achievement, kingdomName) {
  return new Promise((resolve) => {
    const w = 400
    const h = 200
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    // Gold gradient border
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.strokeRect(4, 4, w - 8, h - 8)

    // Inner border
    ctx.strokeStyle = '#b45309'
    ctx.lineWidth = 1
    ctx.strokeRect(8, 8, w - 16, h - 16)

    // Icon
    ctx.font = '48px serif'
    ctx.textAlign = 'center'
    ctx.fillText(achievement.icon, 60, 110)

    // Header
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('ACHIEVEMENT UNLOCKED', 110, 55)

    // Achievement name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 18px system-ui, sans-serif'
    ctx.fillText(achievement.name, 110, 85)

    // Description
    ctx.fillStyle = '#94a3b8'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(achievement.desc, 110, 110)

    // Footer
    ctx.fillStyle = '#475569'
    ctx.font = '11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${kingdomName || 'Kingdom'} · paydaykingdom.app`, w / 2, h - 20)

    canvas.toBlob(resolve, 'image/png')
  })
}
