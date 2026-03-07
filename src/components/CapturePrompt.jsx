import { useState, useEffect } from 'react'

export default function CapturePrompt({ visible, onCapture, onDismiss }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      // Auto-dismiss after 5s
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onDismiss, 300)
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div
      className="absolute bottom-16 left-1/2 z-30 pointer-events-auto"
      style={{
        transform: show
          ? 'translate(-50%, 0)'
          : 'translate(-50%, 20px)',
        opacity: show ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
    >
      <button
        onClick={() => {
          setShow(false)
          onCapture()
        }}
        className="glass-panel border border-white/15 hover:border-amber-400/50 rounded-2xl px-5 py-2.5 font-sans text-xs text-slate-300 hover:text-amber-400 transition-all shadow-xl shadow-black/30 flex items-center gap-2"
      >
        <span>📸</span>
        <span>Capture this victory?</span>
      </button>
    </div>
  )
}
