import useGameStore from '../lib/gameState'
import { getTierName, getXPProgress, getIslandStageName } from '../lib/constants'
import { useState, useRef, useEffect } from 'react'

export default function HUD({ sceneData, onOpenAchievements, onCapture }) {
  const level = useGameStore(s => s.level)
  const xp = useGameStore(s => s.xp)
  const islandStage = useGameStore(s => s.islandStage)
  const monthsCompleted = useGameStore(s => s.monthsCompleted)
  const totalBillsSlain = useGameStore(s => s.totalBillsSlain)
  const soundMuted = useGameStore(s => s.soundMuted)
  const toggleMute = useGameStore(s => s.toggleMute)

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const tierName = getTierName(level)
  const xpProgress = getXPProgress(xp, level)
  const stageName = getIslandStageName(islandStage)

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div id="hud-overlay" className="absolute inset-0 pointer-events-none z-20 p-3 md:p-4">
      {/* Top-left: Level + XP */}
      <div className="absolute top-3 left-3 glass-panel rounded-2xl px-4 py-3">
        <div className="font-pixel text-xs text-amber-400 text-shadow-heading">
          Lv.{level} {tierName}
        </div>
        <div className="w-32 h-2 bg-white/10 rounded-full mt-1.5 overflow-hidden">
          <div
            className="xp-bar-fill h-full rounded-full transition-all duration-700"
            style={{ width: `${xpProgress * 100}%` }}
          />
        </div>
        <div className="font-sans text-xs text-slate-400 mt-1 text-shadow-label">
          {xp.toLocaleString()} XP
        </div>
      </div>

      {/* Top-right: Gear menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="pointer-events-auto glass-panel hover:bg-white/15 rounded-2xl w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white transition-all text-lg"
          title="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.062 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>

        {menuOpen && (
          <div className="pointer-events-auto absolute top-12 right-0 glass-panel rounded-2xl shadow-xl shadow-black/30 overflow-hidden w-48 border border-white/10">
            <button
              onClick={() => { setMenuOpen(false); onOpenAchievements() }}
              className="w-full text-left px-4 py-3 text-sm font-sans text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
            >
              <span>🏆</span> Achievements
            </button>
            <button
              onClick={() => { setMenuOpen(false); onCapture() }}
              className="w-full text-left px-4 py-3 text-sm font-sans text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
            >
              <span>📸</span> Capture
            </button>
            <button
              onClick={toggleMute}
              className="w-full text-left px-4 py-3 text-sm font-sans text-slate-200 hover:bg-white/10 flex items-center gap-2.5 transition-colors"
            >
              <span>{soundMuted ? '🔇' : '🔊'}</span> {soundMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom-left: Stage */}
      <div className="absolute bottom-3 left-3 glass-panel rounded-2xl px-4 py-3">
        <div className="font-pixel text-xs text-slate-300 text-shadow-heading">
          {stageName}
        </div>
        <div className="font-sans text-xs text-slate-400 mt-0.5 text-shadow-label">
          Month #{monthsCompleted}
        </div>
      </div>

      {/* Bottom-right: Bills slain */}
      <div className="absolute bottom-3 right-3 glass-panel rounded-2xl px-4 py-3">
        <div className="font-sans text-xs text-slate-400 text-shadow-label">
          Bills Slain
        </div>
        <div className="font-pixel text-sm text-amber-400 mt-0.5 text-shadow-heading">
          {totalBillsSlain}
        </div>
      </div>
    </div>
  )
}
