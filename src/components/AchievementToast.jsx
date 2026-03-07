import { useState, useEffect, useRef } from 'react'
import { ACHIEVEMENT_DEFS } from '../lib/achievements'
import useGameStore from '../lib/gameState'

export default function AchievementToast({ queue, onDone }) {
  const [current, setCurrent] = useState(null)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)
  const isBattling = useGameStore(s => s.isBattling)

  // Dismiss immediately when payday triggers
  useEffect(() => {
    if (isBattling && current) {
      clearTimeout(timerRef.current)
      setVisible(false)
      setTimeout(() => {
        setCurrent(null)
        onDone(current.id)
      }, 200)
    }
  }, [isBattling])

  useEffect(() => {
    if (queue.length === 0 || current) return

    const id = queue[0]
    const ach = ACHIEVEMENT_DEFS.find(a => a.id === id)
    if (!ach) {
      onDone(id)
      return
    }

    setCurrent(ach)
    requestAnimationFrame(() => setVisible(true))

    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(null)
        onDone(id)
      }, 400)
    }, 3000)

    return () => clearTimeout(timerRef.current)
  }, [queue, current, onDone])

  if (!current) return null

  return (
    <div
      className="absolute top-4 left-1/2 z-50 pointer-events-none"
      style={{
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s',
      }}
    >
      <div className="bg-slate-900 border-2 border-amber-400 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg shadow-amber-400/20">
        <span className="text-3xl">{current.icon}</span>
        <div>
          <div className="font-pixel text-xs text-amber-400">Achievement Unlocked!</div>
          <div className="font-sans text-sm text-white font-bold mt-0.5">{current.name}</div>
        </div>
      </div>
    </div>
  )
}
