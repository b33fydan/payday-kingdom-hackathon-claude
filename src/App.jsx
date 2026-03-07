import { useState, useEffect, useCallback, useRef } from 'react'
import Scene from './components/Scene'
import BudgetPanel from './components/BudgetPanel'
import HUD from './components/HUD'
import Onboarding from './components/Onboarding'
import AchievementToast from './components/AchievementToast'
import AchievementPanel from './components/AchievementPanel'
import ShareModal from './components/ShareModal'
import CapturePrompt from './components/CapturePrompt'
import useGameStore from './lib/gameState'
import { checkAchievements } from './lib/achievements'
import { captureKingdom } from './lib/captureUtils'
import { playAchievement, playIslandGrow, initAudio } from './lib/soundManager'

export default function App() {
  const hasOnboarded = useGameStore(s => s.hasOnboarded)
  const [sceneData, setSceneData] = useState(null)
  const [showAchievements, setShowAchievements] = useState(false)
  const [toastQueue, setToastQueue] = useState([])
  const prevBattlingRef = useRef(false)
  const prevStageRef = useRef(useGameStore.getState().islandStage)

  // Share modal state
  const [shareModal, setShareModal] = useState(null) // { blob, dataUrl }
  const [capturePrompt, setCapturePrompt] = useState(false)

  // Watch for battle completion
  const isBattling = useGameStore(s => s.isBattling)
  const islandStage = useGameStore(s => s.islandStage)

  useEffect(() => {
    // Detect battle completion
    if (prevBattlingRef.current && !isBattling) {
      const state = useGameStore.getState()
      const newlyUnlocked = checkAchievements(state, state.lastBattleResult)

      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(id => state.unlockAchievement(id))
        setToastQueue(prev => [...prev, ...newlyUnlocked])
        playAchievement()
      }

      // Show capture prompt after battle
      setCapturePrompt(true)
    }
    prevBattlingRef.current = isBattling
  }, [isBattling])

  // Watch for island stage advancement
  useEffect(() => {
    if (islandStage > prevStageRef.current) {
      setCapturePrompt(true)
      playIslandGrow()
    }
    prevStageRef.current = islandStage
  }, [islandStage])

  const handleToastDone = useCallback((id) => {
    setToastQueue(prev => prev.filter(q => q !== id))
  }, [])

  // Shared capture handler — opens ShareModal with result
  const handleCapture = useCallback(async () => {
    setCapturePrompt(false)
    const result = await captureKingdom(sceneData)
    if (result) {
      setShareModal({ blob: result.blob, dataUrl: result.dataUrl })
    }
  }, [sceneData])

  // Init audio context on first user interaction
  useEffect(() => {
    const handler = () => {
      initAudio()
      document.removeEventListener('click', handler)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Onboarding overlay */}
      {!hasOnboarded && <Onboarding />}

      {/* Achievement panel modal */}
      {showAchievements && (
        <AchievementPanel onClose={() => setShowAchievements(false)} />
      )}

      {/* Share modal */}
      {shareModal && (
        <ShareModal
          imageBlob={shareModal.blob}
          imageUrl={shareModal.dataUrl}
          sceneData={sceneData}
          onClose={() => setShareModal(null)}
        />
      )}

      {/* Scene + HUD */}
      <div className="w-full md:w-[60%] h-[60vh] md:h-full relative order-1 md:order-2">
        <Scene onSceneReady={setSceneData} />
        <AchievementToast queue={toastQueue} onDone={handleToastDone} />
        <HUD
          sceneData={sceneData}
          onOpenAchievements={() => setShowAchievements(true)}
          onCapture={handleCapture}
        />
        {/* Capture prompt — overlays the scene */}
        <CapturePrompt
          visible={capturePrompt}
          onCapture={handleCapture}
          onDismiss={() => setCapturePrompt(false)}
        />
      </div>

      {/* Budget Panel */}
      <div className="w-full md:w-[40%] h-[40vh] md:h-full order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/5">
        <BudgetPanel />
      </div>
    </div>
  )
}
