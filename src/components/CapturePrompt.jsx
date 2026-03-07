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
        className="bg-slate-900/90 border border-slate-600 hover:border-amber-400 rounded-xl px-4 py-2 font-sans text-xs text-slate-300 hover:text-amber-400 transition-colors shadow-lg flex items-center gap-2"
      >
        <span>📸</span>
        <span>Capture this victory?</span>
      </button>
    </div>
  )
}
