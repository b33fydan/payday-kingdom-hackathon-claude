import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import useGameStore from '../lib/gameState'
import {
  createVoxel, createTree, createBuilding, createCastle, createHero,
  createMonster, createRocks, createFlower, createWell, createFence, createParticles,
  createCloud, createFish, playDeathAnimation
} from '../lib/voxelBuilder'
import { getMonsterSize, MONSTER_COLORS, formatCurrency } from '../lib/constants'
import { playPaydayStart, playHeroSpawn, playMonsterSlay, playXPTick, playVictory, playLevelUp } from '../lib/soundManager'

export default function Scene({ onSceneReady }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const monsterMeshesRef = useRef({})
  const heroMeshRef = useRef(null)
  const islandObjectsRef = useRef([])
  const particlesRef = useRef([])
  const ambientParticlesRef = useRef([])
  const cloudsRef = useRef([])
  const fishRef = useRef([])
  const waterRef = useRef(null)
  const animFrameRef = useRef(null)
  const clockRef = useRef(new THREE.Clock())
  const overlayContainerRef = useRef(null)

  const bills = useGameStore(s => s.bills)
  const islandStage = useGameStore(s => s.islandStage)
  const level = useGameStore(s => s.level)
  const heroVisible = useGameStore(s => s.heroVisible)
  const bannerColor = useGameStore(s => s.bannerColor)

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    scene.fog = new THREE.FogExp2(0x0f172a, 0.025)
    sceneRef.current = scene

    // Camera — isometric-ish angle
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(13.5, 11.5, 13.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 6
    controls.maxDistance = 34
    controls.maxPolarAngle = Math.PI / 2.2
    controls.target.set(0, 0.5, 0)
    controlsRef.current = controls

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)

    const directional = new THREE.DirectionalLight(0xffffff, 0.8)
    directional.position.set(5, 8, 3)
    directional.castShadow = true
    directional.shadow.mapSize.width = 1024
    directional.shadow.mapSize.height = 1024
    directional.shadow.camera.near = 0.5
    directional.shadow.camera.far = 30
    directional.shadow.camera.left = -13
    directional.shadow.camera.right = 13
    directional.shadow.camera.top = 13
    directional.shadow.camera.bottom = -13
    scene.add(directional)

    // Island base — 8x8 grid
    buildIsland(scene)

    // Water plane
    const waterGeom = new THREE.PlaneGeometry(34, 34)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.5,
    })
    const water = new THREE.Mesh(waterGeom, waterMat)
    water.rotation.x = -Math.PI / 2
    water.position.y = -0.3
    water.receiveShadow = true
    scene.add(water)
    waterRef.current = water

    // Spawn ambient floating particles
    spawnAmbientParticles(scene)

    // Spawn floating clouds
    spawnClouds(scene)

    // Spawn fish in water
    spawnFish(scene)

    // Notify parent
    if (onSceneReady) {
      onSceneReady({ scene, renderer, camera })
    }

    // Handle resize
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate)
      const delta = clockRef.current.getDelta()
      const time = clockRef.current.getElapsedTime()

      controls.update()

      // Animate monsters (idle bobbing)
      Object.values(monsterMeshesRef.current).forEach((mesh, i) => {
        if (mesh && mesh.parent) {
          mesh.position.y = mesh.userData.baseY + Math.sin(time * (1.5 + i * 0.3)) * 0.1
          // Category-specific idle
          if (mesh.userData.category === 'utilities') {
            // Squish
            mesh.scale.y = mesh.userData.baseScale * (1 + Math.sin(time * 3) * 0.1)
            mesh.scale.x = mesh.userData.baseScale * (1 - Math.sin(time * 3) * 0.05)
            mesh.scale.z = mesh.userData.baseScale * (1 - Math.sin(time * 3) * 0.05)
            // Rotate sparks
            mesh.children.forEach(c => {
              if (c.userData.type === 'sparks') c.rotation.y = time * 2
            })
          } else if (mesh.userData.category === 'entertainment') {
            mesh.position.y = mesh.userData.baseY + Math.sin(time * 4) * 0.2
          } else if (mesh.userData.category === 'housing') {
            mesh.rotation.z = Math.sin(time * 1.2) * 0.05
          } else if (mesh.userData.category === 'phone') {
            mesh.rotation.y = time * 0.5
          } else if (mesh.userData.category === 'insurance') {
            mesh.position.x = mesh.userData.baseX + Math.sin(time * 0.8) * 0.15
          } else if (mesh.userData.category === 'food') {
            mesh.rotation.x = Math.sin(time * 2) * 0.03
            mesh.rotation.z = Math.cos(time * 2.5) * 0.03
          } else if (mesh.userData.category === 'transport') {
            // Walking motion — alternate legs up/down
            mesh.children.forEach((child, ci) => {
              if (child.userData && child.userData.type === 'leg') {
                child.position.y += Math.sin(time * 4 + ci * Math.PI) * 0.003
              }
            })
          } else if (mesh.userData.category === 'other') {
            // Shifting weight
            mesh.position.x = mesh.userData.baseX + Math.sin(time * 1.5) * 0.08
          }
        }
      })

      // Animate particles
      const aliveParticles = []
      particlesRef.current.forEach(p => {
        p.userData.life -= delta * 1.5
        if (p.userData.life <= 0) {
          scene.remove(p)
          return
        }
        p.userData.velocity.y += p.userData.gravity * delta
        p.position.add(p.userData.velocity.clone().multiplyScalar(delta))
        p.material.opacity = p.userData.life
        p.material.transparent = true
        aliveParticles.push(p)
      })
      particlesRef.current = aliveParticles

      // Hero breathing when idle
      if (heroMeshRef.current && !useGameStore.getState().isBattling) {
        heroMeshRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02
      }

      // Water gentle wave
      if (waterRef.current) {
        waterRef.current.position.y = -0.3 + Math.sin(time * 0.8) * 0.06
      }

      // Ambient particles — drift upward and recycle
      ambientParticlesRef.current.forEach(p => {
        p.position.y += p.userData.speed * delta
        p.position.x += Math.sin(time + p.userData.drift) * 0.003
        p.position.z += Math.cos(time * 0.7 + p.userData.drift) * 0.003
        if (p.position.y > 9) {
          p.position.y = -0.5
          p.position.x = (Math.random() - 0.5) * 16
          p.position.z = (Math.random() - 0.5) * 16
        }
      })

      // Clouds — slow drift
      cloudsRef.current.forEach(c => {
        c.position.x += c.userData.speed * delta
        if (c.position.x > 18) c.position.x = -18
      })

      // Fish — swim in circles
      fishRef.current.forEach(f => {
        const a = time * f.userData.speed + f.userData.phase
        f.position.x = f.userData.cx + Math.cos(a) * f.userData.radius
        f.position.z = f.userData.cz + Math.sin(a) * f.userData.radius
        f.rotation.y = a + Math.PI / 2
      })

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Ambient floating particles — tiny white cubes drifting upward
  function spawnAmbientParticles(scene) {
    const count = 20
    for (let i = 0; i < count; i++) {
      const size = 0.04 + Math.random() * 0.04
      const p = createVoxel(0, 0, 0, 0xffffff, size)
      p.material = p.material.clone()
      p.material.transparent = true
      p.material.opacity = 0.3 + Math.random() * 0.3
      p.position.set(
        (Math.random() - 0.5) * 16,
        Math.random() * 8,
        (Math.random() - 0.5) * 16
      )
      p.userData.speed = 0.15 + Math.random() * 0.2
      p.userData.drift = Math.random() * Math.PI * 2
      scene.add(p)
      ambientParticlesRef.current.push(p)
    }
  }

  // Floating clouds in the sky
  function spawnClouds(scene) {
    for (let i = 0; i < 6; i++) {
      const cloud = createCloud(
        (Math.random() - 0.5) * 30,
        6 + Math.random() * 4,
        (Math.random() - 0.5) * 20
      )
      cloud.userData.speed = 0.3 + Math.random() * 0.4
      scene.add(cloud)
      cloudsRef.current.push(cloud)
    }
  }

  // Fish swimming in the water around the island
  function spawnFish(scene) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const radius = 8 + Math.random() * 3
      const cx = Math.cos(angle) * radius * 0.3
      const cz = Math.sin(angle) * radius * 0.3
      const fish = createFish(cx, cz)
      fish.userData.cx = cx
      fish.userData.cz = cz
      fish.userData.radius = 1.5 + Math.random() * 2
      fish.userData.speed = 0.4 + Math.random() * 0.3
      fish.userData.phase = Math.random() * Math.PI * 2
      scene.add(fish)
      fishRef.current.push(fish)
    }
  }

  // Build the 13x13 island grid
  function buildIsland(scene) {
    const grassColors = [0x4ade80, 0x22c55e, 0x16a34a]
    for (let x = -6; x <= 6; x++) {
      for (let z = -6; z <= 6; z++) {
        const color = grassColors[Math.floor(Math.random() * grassColors.length)]
        const yOffset = Math.random() * 0.2
        const block = createVoxel(x, -0.5 + yOffset, z, color, 1)
        block.castShadow = true
        block.receiveShadow = true
        scene.add(block)
      }
    }
  }

  // Update island decorations when stage changes
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Remove old island objects
    islandObjectsRef.current.forEach(obj => scene.remove(obj))
    islandObjectsRef.current = []

    const TREE_SCALE = 0.9
    const BUILDING_SCALE = 0.8

    const add = (obj, scaleFactor = 1) => {
      obj.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true } })
      scene.add(obj)
      islandObjectsRef.current.push(obj)
      // Scale-in animation
      obj.scale.set(0, 0, 0)
      const baseX = (obj.userData.targetScaleX || 1) * scaleFactor
      const baseY = (obj.userData.targetScaleY || 1) * scaleFactor
      const baseZ = (obj.userData.targetScaleZ || 1) * scaleFactor
      const start = performance.now()
      const anim = () => {
        const t = Math.min((performance.now() - start) / 500, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        obj.scale.set(baseX * ease, baseY * ease, baseZ * ease)
        if (t < 1) requestAnimationFrame(anim)
      }
      requestAnimationFrame(anim)
    }

    // Stage 0: barren — dead tree
    if (islandStage >= 0) {
      add(createTree(-3.4, -3.4, 'pine'), TREE_SCALE)
      add(createRocks(4.2, 2.6))
    }

    // Stage 1: sprout
    if (islandStage >= 1) {
      add(createTree(-4.2, 2.6, 'round'), TREE_SCALE)
      add(createTree(2.6, -4.2, 'pine'), TREE_SCALE)
      add(createTree(5, 3.4, 'oak'), TREE_SCALE)
      // Extra trees: 2 large pines, 3 bushes
      add(createTree(-5.2, -1, 'pine'), TREE_SCALE * 1.3)
      add(createTree(4.5, -2.5, 'pine'), TREE_SCALE * 1.3)
      add(createTree(-1.5, -5, 'round'), TREE_SCALE)
      add(createTree(1, 5.2, 'round'), TREE_SCALE)
      add(createTree(-3, 4.8, 'oak'), TREE_SCALE)
      for (let i = 0; i < 5; i++) {
        add(createFlower(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ))
      }
    }

    // Stage 2: settlement
    if (islandStage >= 2) {
      add(createBuilding(-2.6, 2.6, 1.2, 1.5, 1.2), BUILDING_SCALE)
      // Dirt path
      for (let i = -4; i <= 4; i++) {
        add(createVoxel(i * 0.5, 0.01, 0, 0x78716c, 0.4))
      }
      add(createTree(3.4, -1.7, 'oak'), TREE_SCALE)
    }

    // Stage 3: village
    if (islandStage >= 3) {
      add(createBuilding(-2.6, 2.6, 1.8, 2.2, 1.8), BUILDING_SCALE)
      add(createWell(2.6, 1.7), BUILDING_SCALE)
      for (let i = 0; i < 4; i++) {
        add(createFlower(
          1.7 + Math.random() * 3.4,
          -1.7 + Math.random() * 3.4
        ))
      }
    }

    // Stage 4: town
    if (islandStage >= 4) {
      add(createBuilding(3.4, -3.4, 1.2, 1.8, 1.2, 0x78716c), BUILDING_SCALE)
      add(createFence(-5, -1.7, 5), BUILDING_SCALE)
      // Rock slab
      add(createRocks(-3.5, 3))
    }

    // Stage 5: castle
    if (islandStage >= 5) {
      add(createCastle(0, 3.4, new THREE.Color(bannerColor).getHex()), BUILDING_SCALE)
      add(createRocks(-5, 4.2))
      add(createFence(1.7, -5, 6), BUILDING_SCALE)
    }
  }, [islandStage, bannerColor])

  // Update monsters when bills change
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    // Remove old monster meshes
    Object.values(monsterMeshesRef.current).forEach(mesh => {
      if (mesh) scene.remove(mesh)
    })
    monsterMeshesRef.current = {}

    // Place new monsters in semicircle
    const unpaidBills = bills.filter(b => !b.isPaid)
    const count = unpaidBills.length
    if (count === 0) return

    const radius = 5.8
    const maxPerRow = 12
    const rows = count > maxPerRow * 2 ? 3 : count > maxPerRow ? 2 : 1
    const billsPerRow = Math.ceil(count / rows)

    unpaidBills.forEach((bill, i) => {
      const row = Math.floor(i / billsPerRow)
      const indexInRow = i % billsPerRow
      const totalInRow = Math.min(billsPerRow, count - row * billsPerRow)
      const angleSpread = Math.PI * 0.8
      const startAngle = -angleSpread / 2
      const angleStep = totalInRow > 1 ? angleSpread / (totalInRow - 1) : 0
      const angle = startAngle + angleStep * indexInRow
      const r = radius + row * 1.5

      const x = Math.sin(angle) * r
      const z = -Math.cos(angle) * r

      const sizeLabel = getMonsterSize(bill.amount)
      const monster = createMonster(bill.category, sizeLabel)
      monster.position.set(x, 0, z)
      monster.userData.baseY = 0
      monster.userData.baseX = x
      monster.userData.baseScale = monster.scale.y
      monster.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true } })
      monster.userData.billId = bill.id
      monster.userData.category = bill.category

      // Scale-in animation
      monster.scale.set(0, 0, 0)
      const targetScale = monster.userData.baseScale
      const start = performance.now()
      const anim = () => {
        const t = Math.min((performance.now() - start) / 300, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        const s = targetScale * ease
        monster.scale.set(s, s, s)
        if (t < 1) requestAnimationFrame(anim)
      }
      requestAnimationFrame(anim)

      scene.add(monster)
      monsterMeshesRef.current[bill.id] = monster
    })
  }, [bills])

  // Battle animation sequence
  const runBattleAnimation = useCallback(async (battleResult) => {
    const scene = sceneRef.current
    if (!scene) return

    const { unpaidBills, newLevel, oldLevel, newXP, leveledUp } = battleResult

    // Helper: wait ms
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

    // Helper: lerp value over time
    const animateValue = (duration, onUpdate) => {
      return new Promise(resolve => {
        const start = performance.now()
        const step = () => {
          const t = Math.min((performance.now() - start) / duration, 1)
          onUpdate(t)
          if (t < 1) requestAnimationFrame(step)
          else resolve()
        }
        requestAnimationFrame(step)
      })
    }

    // 1. HERO SPAWN — remove any existing hero first
    if (heroMeshRef.current) {
      scene.remove(heroMeshRef.current)
      heroMeshRef.current = null
    }
    const hero = createHero(oldLevel)
    hero.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true } })
    hero.position.set(0, 10, 0)
    hero.rotation.y = Math.PI
    scene.add(hero)
    heroMeshRef.current = hero

    playPaydayStart()

    // Drop hero
    await animateValue(500, (t) => {
      const ease = t * t * (3 - 2 * t) // smoothstep
      hero.position.y = 10 - ease * 10
    })

    // Landing particles + shake
    const landingParticles = createParticles(new THREE.Vector3(0, 0.2, 0), 0xffffff, 12)
    landingParticles.forEach(p => scene.add(p))
    particlesRef.current.push(...landingParticles)
    playHeroSpawn()
    screenShake(5, 300)

    await wait(300)

    // 0 bills — peaceful payday
    if (unpaidBills.length === 0) {
      await animateValue(500, (t) => {
        hero.position.y = Math.sin(t * Math.PI) * 1.5
      })
      showOverlayText('No monsters to slay! Your realm is at peace.', 2000)
      playVictory()
      await wait(2000)
      useGameStore.getState().completeBattle(battleResult)
      return
    }

    // 2. BATTLE PHASE — fight each monster
    for (let i = 0; i < unpaidBills.length; i++) {
      const bill = unpaidBills[i]
      const monsterMesh = monsterMeshesRef.current[bill.id]
      if (!monsterMesh) continue

      const monsterPos = monsterMesh.position.clone()

      // Lerp hero to monster
      const startPos = hero.position.clone()
      await animateValue(400, (t) => {
        const ease = t * t * (3 - 2 * t)
        hero.position.lerpVectors(startPos, new THREE.Vector3(monsterPos.x * 0.7, 0, monsterPos.z * 0.7), ease)
      })

      // Hero slash (360 Y rotation)
      await animateValue(200, (t) => {
        hero.rotation.y = t * Math.PI * 2
      })
      hero.rotation.y = 0

      // Monster flash white briefly before death
      monsterMesh.traverse(child => {
        if (child.isMesh) {
          child.userData.origColor = child.material.color.getHex()
          child.material.color.setHex(0xffffff)
        }
      })
      await wait(100)

      // Restore original colors before death animation
      monsterMesh.traverse(child => {
        if (child.isMesh && child.userData.origColor !== undefined) {
          child.material.color.setHex(child.userData.origColor)
        }
      })

      // Play category-specific death animation
      playMonsterSlay()
      screenShake(3, 200)
      await playDeathAnimation(scene, monsterMesh, bill.category, particlesRef)
      delete monsterMeshesRef.current[bill.id]

      // Show floating +$XXX text
      showFloatingText(monsterPos, `+${formatCurrency(bill.amount)}`)
      playXPTick()

      await wait(200)
    }

    // 3. VICTORY
    // Hero returns to center
    const returnStart = hero.position.clone()
    await animateValue(400, (t) => {
      const ease = t * t * (3 - 2 * t)
      hero.position.lerpVectors(returnStart, new THREE.Vector3(0, 0, 0), ease)
    })

    // Victory jump
    await animateValue(500, (t) => {
      hero.position.y = Math.sin(t * Math.PI) * 1.5
    })

    // Show "PAYDAY COMPLETE" overlay
    showOverlayText('PAYDAY COMPLETE!', 1500)
    playVictory()

    await wait(1000)

    // 4. LEVEL UP
    if (leveledUp) {
      // Flash screen
      showScreenFlash()

      // Update hero colors
      scene.remove(hero)
      const newHero = createHero(newLevel)
      newHero.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true } })
      newHero.position.set(0, 0, 0)
      newHero.rotation.y = Math.PI
      scene.add(newHero)
      heroMeshRef.current = newHero

      const constants = await import('../lib/constants')
      showOverlayText(`LEVEL UP! → ${constants.getTierName(newLevel)}`, 2000)
      playLevelUp()

      await wait(1500)
    }

    // 5. Complete battle
    useGameStore.getState().completeBattle(battleResult)
  }, [])

  // Expose battle runner
  useEffect(() => {
    window.__runBattleAnimation = runBattleAnimation
  }, [runBattleAnimation])

  // Show floating damage text
  function showFloatingText(worldPos, text) {
    const container = overlayContainerRef.current
    if (!container || !cameraRef.current || !rendererRef.current) return

    const vector = worldPos.clone()
    vector.project(cameraRef.current)

    const rect = rendererRef.current.domElement.getBoundingClientRect()
    const x = (vector.x * 0.5 + 0.5) * rect.width
    const y = (-vector.y * 0.5 + 0.5) * rect.height

    const div = document.createElement('div')
    div.className = 'float-text font-pixel'
    div.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      color: #4ade80;
      font-size: 14px;
      pointer-events: none;
      z-index: 20;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
      transform: translateX(-50%);
    `
    div.textContent = text
    container.appendChild(div)
    setTimeout(() => div.remove(), 800)
  }

  // Show overlay text
  function showOverlayText(text, duration = 1500) {
    const container = overlayContainerRef.current
    if (!container) return

    const div = document.createElement('div')
    div.className = 'font-pixel'
    div.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fbbf24;
      font-size: 20px;
      text-align: center;
      pointer-events: none;
      z-index: 30;
      text-shadow: 0 0 10px rgba(251,191,36,0.5), 0 2px 4px rgba(0,0,0,0.8);
      opacity: 0;
      transition: opacity 0.3s;
    `
    div.textContent = text
    container.appendChild(div)

    requestAnimationFrame(() => { div.style.opacity = '1' })
    setTimeout(() => {
      div.style.opacity = '0'
      setTimeout(() => div.remove(), 300)
    }, duration - 300)
  }

  // Screen-shake via CSS transform on the container
  function screenShake(intensity = 4, duration = 300) {
    const container = containerRef.current
    if (!container) return
    const start = performance.now()
    const shake = () => {
      const t = (performance.now() - start) / duration
      if (t >= 1) {
        container.style.transform = ''
        return
      }
      const decay = 1 - t
      const x = (Math.random() - 0.5) * 2 * intensity * decay
      const y = (Math.random() - 0.5) * 2 * intensity * decay
      container.style.transform = `translate(${x}px, ${y}px)`
      requestAnimationFrame(shake)
    }
    requestAnimationFrame(shake)
  }

  // Screen flash effect
  function showScreenFlash() {
    const container = overlayContainerRef.current
    if (!container) return

    const div = document.createElement('div')
    div.className = 'screen-flash'
    div.style.cssText = `
      position: absolute;
      inset: 0;
      background: white;
      pointer-events: none;
      z-index: 40;
    `
    container.appendChild(div)
    setTimeout(() => div.remove(), 500)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div ref={overlayContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
      <div className="scene-vignette absolute inset-0 z-10" />
    </div>
  )
}
