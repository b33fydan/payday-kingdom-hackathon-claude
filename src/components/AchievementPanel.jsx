import { useCallback } from 'react'
import useGameStore from '../lib/gameState'
import { ACHIEVEMENT_DEFS, generateAchievementCard } from '../lib/achievements'

export default function AchievementPanel({ onClose }) {
  const achievements = useGameStore(s => s.achievements)
  const kingdomName = useGameStore(s => s.kingdomName)

  const handleShare = useCallback(async (ach) => {
    const blob = await generateAchievementCard(ach, kingdomName)
    if (!blob) return

    const url = URL.createObjectURL(blob)

    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], `${ach.id}-achievement.png`, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Achievement Unlocked: ${ach.name}`,
            text: `I just unlocked "${ach.name}" in Payday Kingdom!`,
            files: [file],
          })
          URL.revokeObjectURL(url)
          return
        }
      } catch {
        // Fall through to download
      }
    }

    const a = document.createElement('a')
    a.href = url
    a.download = `${ach.id}-achievement.png`
    a.click()
    URL.revokeObjectURL(url)
  }, [kingdomName])

  const unlockedCount = ACHIEVEMENT_DEFS.filter(a => achievements[a.id]).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="glass-panel border border-white/10 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="font-pixel text-sm text-emerald-400 text-shadow-heading">Kingdom Achievements</h2>
            <p className="font-sans text-xs text-slate-400 mt-1">
              {unlockedCount} of {ACHIEVEMENT_DEFS.length} trophies unlocked
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-lg px-4 py-2 hover:text-white hover:border-slate-400 transition-all text-shadow-label"
          >
            Close
          </button>
        </div>

        {/* Achievement grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ACHIEVEMENT_DEFS.map(ach => {
              const unlocked = !!achievements[ach.id]
              const unlockedDate = unlocked
                ? new Date(achievements[ach.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : null

              return (
                <div
                  key={ach.id}
                  className={`panel-card transition-all ${unlocked ? '' : 'opacity-60'}`}
                  style={{ padding: '1rem 1.25rem' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      unlocked ? 'bg-amber-400/10' : 'bg-white/5'
                    }`}>
                      <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-40'}`}>
                        {unlocked ? ach.icon : '🔒'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-sans text-sm font-bold text-shadow-label ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                            {unlocked ? ach.name : 'Locked Achievement'}
                          </p>
                          {unlockedDate && (
                            <p className="font-sans text-xs text-slate-500 mt-0.5">{unlockedDate}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-sans text-xs text-slate-400 mt-1">
                        {unlocked ? ach.desc : 'Silhouette only until earned.'}
                      </p>

                      {/* Share button */}
                      <div className="mt-3">
                        {unlocked ? (
                          <button
                            onClick={() => handleShare(ach)}
                            className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-lg px-3 py-1.5 hover:text-amber-400 hover:border-amber-400/50 transition-all text-shadow-label"
                            style={{ fontSize: '0.55rem' }}
                          >
                            Share Card
                          </button>
                        ) : (
                          <span className="font-pixel text-xs text-slate-600" style={{ fontSize: '0.5rem' }}>
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
