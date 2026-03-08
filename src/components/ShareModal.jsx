import { useState, useCallback } from 'react'
import useGameStore from '../lib/gameState'
import { captureKingdom } from '../lib/captureUtils'

export default function ShareModal({ imageBlob, imageUrl, onClose, sceneData }) {
  const [copied, setCopied] = useState(false)
  const [storyMode, setStoryMode] = useState(false)
  const [storyBlob, setStoryBlob] = useState(null)
  const [storyUrl, setStoryUrl] = useState(null)
  const [generating, setGenerating] = useState(false)

  const kingdomName = useGameStore(s => s.kingdomName)
  const monthsCompleted = useGameStore(s => s.monthsCompleted)
  const level = useGameStore(s => s.level)
  const totalBillsSlain = useGameStore(s => s.totalBillsSlain)

  const activeBlob = storyMode && storyBlob ? storyBlob : imageBlob
  const activeUrl = storyMode && storyUrl ? storyUrl : imageUrl

  const filename = `${(kingdomName || 'kingdom').toLowerCase().replace(/\s+/g, '-')}-month-${monthsCompleted}.png`

  const handleDownload = useCallback(() => {
    if (!activeBlob) return
    const url = URL.createObjectURL(activeBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [activeBlob, filename])

  const handleCopy = useCallback(async () => {
    if (!activeBlob) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': activeBlob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      handleDownload()
    }
  }, [activeBlob, handleDownload])

  const handleShare = useCallback(async () => {
    if (!activeBlob) return
    try {
      const file = new File([activeBlob], filename, { type: 'image/png' })
      await navigator.share({
        title: 'My Payday Kingdom',
        text: `Check out ${kingdomName || 'my kingdom'}! Lv.${level} with ${totalBillsSlain} bills slain.`,
        files: [file],
      })
    } catch {
      // User cancelled or unsupported
    }
  }, [activeBlob, filename, kingdomName, level, totalBillsSlain])

  const handleStoryToggle = useCallback(async () => {
    if (storyMode) {
      setStoryMode(false)
      return
    }
    if (storyBlob) {
      setStoryMode(true)
      return
    }
    setGenerating(true)
    const result = await captureKingdom(sceneData, { storyMode: true })
    if (result) {
      setStoryBlob(result.blob)
      setStoryUrl(result.dataUrl)
    }
    setStoryMode(true)
    setGenerating(false)
  }, [storyMode, storyBlob, sceneData])

  const canShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="glass-panel border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div>
            <h2 className="font-pixel text-sm text-emerald-400 text-shadow-heading">Capture Kingdom</h2>
            <p className="font-sans text-xs text-slate-500 mt-1.5">Share your realm with the world</p>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-lg px-4 py-2 hover:text-white hover:border-slate-400 transition-all text-shadow-label"
          >
            Close
          </button>
        </div>

        {/* Preview */}
        <div className="p-8 flex justify-center bg-black/30">
          {activeUrl ? (
            <img
              src={activeUrl}
              alt="Kingdom capture"
              className={`rounded-xl shadow-lg shadow-black/40 max-h-72 object-contain ${storyMode ? 'max-w-48' : 'w-full'}`}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 font-sans text-sm">
              Generating...
            </div>
          )}
        </div>

        {/* Kingdom stats bar */}
        <div className="px-8 py-4 border-t border-white/10 flex items-center gap-4">
          <span className="font-sans text-xs text-slate-400">
            <span className="text-white font-bold">{kingdomName}</span> · Month {monthsCompleted}
          </span>
          <div className="flex-1" />
          <span className="font-sans text-xs text-slate-500">Lv.{level} · {totalBillsSlain} slain</span>
        </div>

        {/* Mode toggle */}
        <div className="px-8 py-4 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={handleStoryToggle}
            disabled={generating}
            className={`font-pixel text-xs px-4 py-2 rounded-lg border transition-all ${
              storyMode
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-slate-600 text-slate-400 hover:border-slate-500'
            } ${generating ? 'opacity-50' : ''}`}
            style={{ fontSize: '0.55rem' }}
          >
            {generating ? 'Generating...' : 'Story Mode (9:16)'}
          </button>
          <span className="text-xs text-slate-600 font-sans">
            {storyMode ? 'Portrait for Instagram Stories' : 'Standard landscape'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="px-8 py-6 border-t border-white/10 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-pixel text-xs py-3.5 rounded-2xl transition-all active:scale-[0.98] text-shadow-label"
          >
            Download
          </button>
          <button
            onClick={handleCopy}
            className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-2xl px-5 py-3.5 hover:text-white hover:border-slate-400 transition-all text-shadow-label min-w-24"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {canShare && (
            <button
              onClick={handleShare}
              className="font-pixel text-xs text-slate-400 border border-slate-600 rounded-2xl px-5 py-3.5 hover:text-white hover:border-slate-400 transition-all text-shadow-label"
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
