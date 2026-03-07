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
      // Fallback — just download
      handleDownload()
    }
  }, [activeBlob, handleDownload])

  const handleShare = useCallback(async () => {
    if (!activeBlob) return
    try {
      const file = new File([activeBlob], filename, { type: 'image/png' })
      await navigator.share({
        title: 'My Payday Kingdom',
        text: 'Check out my kingdom!',
        files: [file],
      })
    } catch {
      // User cancelled or unsupported
    }
  }, [activeBlob, filename])

  const handleStoryToggle = useCallback(async () => {
    if (storyMode) {
      setStoryMode(false)
      return
    }
    if (storyBlob) {
      setStoryMode(true)
      return
    }
    // Generate story mode capture
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="glass-panel border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-pixel text-xs text-amber-400">Capture Kingdom</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white text-xl leading-none px-2 py-1 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Preview */}
        <div className="p-5 flex justify-center bg-black/30">
          {activeUrl ? (
            <img
              src={activeUrl}
              alt="Kingdom capture"
              className={`rounded-lg shadow-lg max-h-64 object-contain ${storyMode ? 'max-w-48' : 'w-full'}`}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 font-sans text-sm">
              Generating...
            </div>
          )}
        </div>

        {/* Story mode toggle */}
        <div className="px-6 py-3 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={handleStoryToggle}
            disabled={generating}
            className={`text-xs font-sans px-3 py-1.5 rounded-lg border transition-colors ${
              storyMode
                ? 'border-amber-400 text-amber-400 bg-amber-400/10'
                : 'border-slate-600 text-slate-400 hover:border-slate-500'
            } ${generating ? 'opacity-50' : ''}`}
          >
            {generating ? 'Generating...' : 'Story Mode (9:16)'}
          </button>
          <span className="text-xs text-slate-600 font-sans">
            {storyMode ? 'Portrait for Instagram Stories' : 'Standard landscape'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="px-6 py-5 border-t border-white/10 flex gap-3">
          {isMobile && canShare ? (
            // Mobile: Share as primary action
            <>
              <button
                onClick={handleShare}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-sans text-sm font-bold py-2.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Share
              </button>
              <button
                onClick={handleDownload}
                className="bg-white/10 hover:bg-white/15 text-slate-300 font-sans text-sm py-2.5 px-4 rounded-2xl transition-all active:scale-[0.98] border border-white/10"
              >
                Save
              </button>
            </>
          ) : (
            // Desktop: Download, Copy, Share
            <>
              <button
                onClick={handleDownload}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-sans text-sm font-bold py-2.5 rounded-2xl transition-all active:scale-[0.98]"
              >
                Download
              </button>
              <button
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/15 text-slate-300 font-sans text-sm py-2.5 px-4 rounded-2xl transition-all active:scale-[0.98] min-w-20 border border-white/10"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {canShare && (
                <button
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/15 text-slate-300 font-sans text-sm py-2.5 px-4 rounded-2xl transition-all active:scale-[0.98] border border-white/10"
                >
                  Share
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
