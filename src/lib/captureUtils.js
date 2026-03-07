import useGameStore from './gameState'
import { getTierName } from './constants'

// Capture the Three.js scene and composite with banner bar
// Returns { blob, dataUrl } or null on failure
export async function captureKingdom(sceneData, options = {}) {
  if (!sceneData) return null
  const { renderer, scene, camera } = sceneData
  const { storyMode = false } = options

  const state = useGameStore.getState()
  const { kingdomName, level, monthsCompleted, achievements } = state
  const tierName = getTierName(level)

  // Hide HUD
  const hudEl = document.getElementById('hud-overlay')
  if (hudEl) hudEl.style.display = 'none'

  // Save original size
  const origW = renderer.domElement.width
  const origH = renderer.domElement.height

  let renderW, renderH
  if (storyMode) {
    // Portrait 1080x1920 for Instagram Stories
    renderW = 1080
    renderH = 1920 - 160 // Leave room for banner
  } else {
    // Landscape at 2x, min 1080px wide
    const scale = Math.max(2, 1080 / origW)
    renderW = Math.round(origW * scale)
    renderH = Math.round(origH * scale)
  }

  // Render at target res
  renderer.setSize(renderW, renderH, false)
  if (storyMode) {
    camera.aspect = renderW / renderH
    camera.updateProjectionMatrix()
  }
  renderer.render(scene, camera)

  const sceneDataUrl = renderer.domElement.toDataURL('image/png')

  // Restore original
  renderer.setSize(origW, origH, false)
  if (storyMode) {
    camera.aspect = origW / origH
    camera.updateProjectionMatrix()
  }
  renderer.render(scene, camera)
  if (hudEl) hudEl.style.display = ''

  // Composite
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const bannerH = storyMode ? 160 : 120
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height + bannerH
      const ctx = canvas.getContext('2d')

      // Scene image
      ctx.drawImage(img, 0, 0)

      // Banner background
      const grad = ctx.createLinearGradient(0, img.height, 0, img.height + bannerH)
      grad.addColorStop(0, '#1e293b')
      grad.addColorStop(1, '#0f172a')
      ctx.fillStyle = grad
      ctx.fillRect(0, img.height, canvas.width, bannerH)

      // Gold separator line
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(0, img.height, canvas.width, 2)

      const textScale = storyMode ? 1.5 : 1
      const leftPad = 20 * textScale

      // Kingdom name
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.round(20 * textScale)}px system-ui, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText(`🏰 ${kingdomName || 'Kingdom'}`, leftPad, img.height + 40 * textScale)

      // Stats line
      ctx.fillStyle = '#94a3b8'
      ctx.font = `${Math.round(16 * textScale)}px system-ui, sans-serif`
      ctx.fillText(
        `Lv.${level} ${tierName} · Month ${monthsCompleted}`,
        leftPad,
        img.height + 70 * textScale
      )

      // Recent achievement badges (small gold text)
      const recentAchs = Object.entries(achievements)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
      if (recentAchs.length > 0) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = `${Math.round(12 * textScale)}px system-ui, sans-serif`
        // We don't have achievement defs here, just show count
        ctx.fillText(
          `${Object.keys(achievements).length} achievement${Object.keys(achievements).length !== 1 ? 's' : ''} unlocked`,
          leftPad,
          img.height + 92 * textScale
        )
      }

      // Brand footer (right-aligned)
      ctx.fillStyle = '#64748b'
      ctx.font = `${Math.round(14 * textScale)}px system-ui, sans-serif`
      ctx.textAlign = 'right'
      ctx.fillText('paydaykingdom.app', canvas.width - leftPad, img.height + 70 * textScale)

      canvas.toBlob((blob) => {
        const dataUrl = canvas.toDataURL('image/png')
        resolve({ blob, dataUrl })
      }, 'image/png')
    }
    img.onerror = () => resolve(null)
    img.src = sceneDataUrl
  })
}
