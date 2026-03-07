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

    // Try Web Share API first
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

    // Fallback: download
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
        className="glass-panel border border-white/10 rounded-3xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="font-pixel text-sm text-amber-400">Achievements</h2>
            <p className="font-sans text-xs text-slate-500 mt-1">
              {unlockedCount} / {ACHIEVEMENT_DEFS.length} unlocked
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none px-2 py-1 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Achievement list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {ACHIEVEMENT_DEFS.map(ach => {
            const unlocked = !!achievements[ach.id]
            const unlockedDate = unlocked
              ? new Date(achievements[ach.id]).toLocaleDateString()
              : null

            return (
              <div
                key={ach.id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all border ${
                  unlocked
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/[0.02] border-transparent opacity-50'
                }`}
              >
                {/* Icon */}
                <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>
                  {unlocked ? ach.icon : '🔒'}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-sans text-sm font-bold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                    {unlocked ? ach.name : '???'}
                  </div>
                  <div className="font-sans text-xs text-slate-400 mt-0.5">
                    {unlocked ? ach.desc : 'Keep playing to discover...'}
                  </div>
                  {unlockedDate && (
                    <div className="font-sans text-xs text-slate-600 mt-0.5">
                      Earned {unlockedDate}
                    </div>
                  )}
                </div>

                {/* Share button */}
                {unlocked && (
                  <button
                    onClick={() => handleShare(ach)}
                    className="text-slate-500 hover:text-amber-400 text-sm transition-colors shrink-0 px-2 py-1"
                    title="Share achievement"
                  >
                    Share
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
