import * as THREE from 'three'
import { MONSTER_COLORS, getMonsterScale, getHeroColors } from './constants'

// Basic voxel cube
export function createVoxel(x, y, z, color, size = 1) {
  const geometry = new THREE.BoxGeometry(size, size, size)
  const material = new THREE.MeshStandardMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

// Tree variations
export function createTree(x, z, style = 'oak') {
  const group = new THREE.Group()
  group.position.set(x, 0, z)

  const trunkColor = 0x92400e
  const leafColors = [0x15803d, 0x166534, 0x14532d]

  if (style === 'pine') {
    // Tall narrow pine
    group.add(createVoxel(0, 0.5, 0, trunkColor, 0.3))
    group.add(createVoxel(0, 1.0, 0, trunkColor, 0.3))
    group.add(createVoxel(0, 1.5, 0, leafColors[0], 0.8))
    group.add(createVoxel(0, 2.0, 0, leafColors[1], 0.6))
    group.add(createVoxel(0, 2.5, 0, leafColors[2], 0.4))
  } else if (style === 'round') {
    // Short round tree
    group.add(createVoxel(0, 0.4, 0, trunkColor, 0.3))
    group.add(createVoxel(0, 0.9, 0, leafColors[0], 0.9))
    group.add(createVoxel(0, 1.4, 0, leafColors[1], 0.7))
  } else {
    // Oak - bushy
    group.add(createVoxel(0, 0.5, 0, trunkColor, 0.3))
    group.add(createVoxel(0, 1.0, 0, trunkColor, 0.3))
    const leaf = leafColors[Math.floor(Math.random() * leafColors.length)]
    group.add(createVoxel(0, 1.5, 0, leaf, 1.0))
    group.add(createVoxel(0.4, 1.5, 0, leaf, 0.6))
    group.add(createVoxel(-0.4, 1.5, 0, leaf, 0.6))
    group.add(createVoxel(0, 1.5, 0.4, leaf, 0.6))
    group.add(createVoxel(0, 2.0, 0, leaf, 0.6))
  }

  return group
}

// Building
export function createBuilding(x, z, w = 1.5, h = 2, d = 1.5, color = 0x92400e) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)

  // Walls
  const wallGeom = new THREE.BoxGeometry(w, h, d)
  const wallMat = new THREE.MeshStandardMaterial({ color })
  const walls = new THREE.Mesh(wallGeom, wallMat)
  walls.position.y = h / 2
  walls.castShadow = true
  walls.receiveShadow = true
  group.add(walls)

  // Roof
  const roofGeom = new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xb45309 })
  const roof = new THREE.Mesh(roofGeom, roofMat)
  roof.position.y = h + 0.15
  roof.castShadow = true
  group.add(roof)

  // Door
  const doorGeom = new THREE.BoxGeometry(0.4, 0.7, 0.05)
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03 })
  const door = new THREE.Mesh(doorGeom, doorMat)
  door.position.set(0, 0.35, d / 2 + 0.03)
  group.add(door)

  return group
}

// Castle tower
export function createCastle(x, z, bannerColor = 0x3b82f6) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)

  // Main tower
  const towerGeom = new THREE.BoxGeometry(2, 4, 2)
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af })
  const tower = new THREE.Mesh(towerGeom, towerMat)
  tower.position.y = 2
  tower.castShadow = true
  tower.receiveShadow = true
  group.add(tower)

  // Battlements
  for (let bx = -0.75; bx <= 0.75; bx += 0.5) {
    for (let bz = -0.75; bz <= 0.75; bz += 0.5) {
      if (Math.abs(bx) === 0.75 || Math.abs(bz) === 0.75) {
        if ((Math.abs(bx) + Math.abs(bz)) % 1 === 0) {
          const battlement = createVoxel(bx, 4.25, bz, 0x9ca3af, 0.4)
          group.add(battlement)
        }
      }
    }
  }

  // Random protruding blocks for depth/imperfection
  const stoneColors = [0x9ca3af, 0x6b7280, 0x78716c]
  for (let i = 0; i < 8; i++) {
    const side = Math.floor(Math.random() * 4)
    const bSize = 0.2 + Math.random() * 0.25
    const by = 0.5 + Math.random() * 3.2
    let bx = 0, bz = 0
    if (side === 0) { bx = 1.05 + Math.random() * 0.15; bz = (Math.random() - 0.5) * 1.6 }
    else if (side === 1) { bx = -1.05 - Math.random() * 0.15; bz = (Math.random() - 0.5) * 1.6 }
    else if (side === 2) { bz = 1.05 + Math.random() * 0.15; bx = (Math.random() - 0.5) * 1.6 }
    else { bz = -1.05 - Math.random() * 0.15; bx = (Math.random() - 0.5) * 1.6 }
    const sc = stoneColors[Math.floor(Math.random() * stoneColors.length)]
    group.add(createVoxel(bx, by, bz, sc, bSize))
  }

  // Flag pole
  const poleGeom = new THREE.BoxGeometry(0.1, 1.5, 0.1)
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x92400e })
  const pole = new THREE.Mesh(poleGeom, poleMat)
  pole.position.set(0, 5.25, 0)
  group.add(pole)

  // Flag
  const flagGeom = new THREE.BoxGeometry(0.6, 0.4, 0.05)
  const flagMat = new THREE.MeshStandardMaterial({ color: bannerColor })
  const flag = new THREE.Mesh(flagGeom, flagMat)
  flag.position.set(0.35, 5.7, 0)
  group.add(flag)

  return group
}

// Hero
export function createHero(level = 1) {
  const group = new THREE.Group()
  const colors = getHeroColors(level)

  // Legs
  group.add(createVoxel(-0.15, 0.2, 0, colors.armor, 0.25))
  group.add(createVoxel(0.15, 0.2, 0, colors.armor, 0.25))

  // Body
  group.add(createVoxel(0, 0.55, 0, colors.armor, 0.45))

  // Head
  group.add(createVoxel(0, 0.9, 0, colors.skin, 0.35))

  // Eyes (tiny dark cubes)
  group.add(createVoxel(-0.08, 0.92, 0.18, 0x000000, 0.06))
  group.add(createVoxel(0.08, 0.92, 0.18, 0x000000, 0.06))

  // Weapon (sword on right side)
  const swordColor = level >= 5 ? 0xfbbf24 : level >= 3 ? 0xd1d5db : 0x92400e
  group.add(createVoxel(0.4, 0.55, 0, swordColor, 0.1))
  group.add(createVoxel(0.4, 0.75, 0, swordColor, 0.1))
  group.add(createVoxel(0.4, 0.95, 0, 0xd1d5db, 0.1))
  group.add(createVoxel(0.4, 1.1, 0, 0xd1d5db, 0.08))

  group.userData.type = 'hero'
  return group
}

// Monsters by category
export function createMonster(category, sizeLabel = 'medium') {
  const group = new THREE.Group()
  const color = MONSTER_COLORS[category] || MONSTER_COLORS.other
  const scale = getMonsterScale(sizeLabel)

  switch (category) {
    case 'housing':
      createHousingMonster(group, color)
      break
    case 'utilities':
      createUtilitiesMonster(group, color)
      break
    case 'phone':
      createPhoneMonster(group, color)
      break
    case 'transport':
      createTransportMonster(group, color)
      break
    case 'food':
      createFoodMonster(group, color)
      break
    case 'insurance':
      createInsuranceMonster(group, color)
      break
    case 'entertainment':
      createEntertainmentMonster(group, color)
      break
    default:
      createOtherMonster(group, color)
      break
  }

  group.scale.set(scale, scale, scale)
  group.userData.type = 'monster'
  group.userData.category = category
  return group
}

function createHousingMonster(group, color) {
  // RED GOLEM — wide, heavy, imposing
  // Wide body (2x1x2 proportions)
  const bodyGeom = new THREE.BoxGeometry(0.9, 0.6, 0.8)
  const bodyMat = new THREE.MeshStandardMaterial({ color })
  const body = new THREE.Mesh(bodyGeom, bodyMat)
  body.position.y = 0.55
  body.castShadow = true
  group.add(body)
  // Stubby legs
  group.add(createVoxel(-0.25, 0.12, 0, color, 0.3))
  group.add(createVoxel(0.25, 0.12, 0, color, 0.3))
  // Flat head
  const headGeom = new THREE.BoxGeometry(0.6, 0.35, 0.55)
  const headMat = new THREE.MeshStandardMaterial({ color })
  const head = new THREE.Mesh(headGeom, headMat)
  head.position.y = 1.05
  head.castShadow = true
  group.add(head)
  // Two horn cubes
  group.add(createVoxel(-0.2, 1.35, 0, 0xb91c1c, 0.15))
  group.add(createVoxel(0.2, 1.35, 0, 0xb91c1c, 0.15))
  group.add(createVoxel(-0.2, 1.48, 0, 0x991b1b, 0.1))
  group.add(createVoxel(0.2, 1.48, 0, 0x991b1b, 0.1))
  // Angry eyes
  group.add(createVoxel(-0.12, 1.08, 0.28, 0xfde047, 0.08))
  group.add(createVoxel(0.12, 1.08, 0.28, 0xfde047, 0.08))
  // Fists (arm cubes)
  group.add(createVoxel(-0.55, 0.45, 0, 0xdc2626, 0.22))
  group.add(createVoxel(0.55, 0.45, 0, 0xdc2626, 0.22))
}

function createUtilitiesMonster(group, color) {
  // ELECTRIC SLIME — 3 cubes stacked (large→medium→small) + orbiting sparks
  group.add(createVoxel(0, 0.3, 0, color, 0.7))        // bottom (large)
  group.add(createVoxel(0, 0.75, 0, color, 0.5))       // middle (medium)
  group.add(createVoxel(0, 1.1, 0, color, 0.35))       // top (small)
  // Dripping details on bottom
  group.add(createVoxel(-0.25, 0.05, 0.15, color, 0.15))
  group.add(createVoxel(0.2, 0.05, -0.2, color, 0.12))
  // Beady eyes
  group.add(createVoxel(-0.08, 1.15, 0.18, 0x000000, 0.06))
  group.add(createVoxel(0.08, 1.15, 0.18, 0x000000, 0.06))
  // Spark cubes orbiting (in a sub-group for rotation)
  const sparkGroup = new THREE.Group()
  sparkGroup.add(createVoxel(0.55, 0.7, 0, 0xfde047, 0.12))
  sparkGroup.add(createVoxel(-0.35, 0.9, 0.4, 0xfde047, 0.12))
  sparkGroup.add(createVoxel(0.1, 0.5, -0.55, 0xfde047, 0.12))
  sparkGroup.userData.type = 'sparks'
  group.add(sparkGroup)
}

function createPhoneMonster(group, color) {
  // PURPLE FLOATING EYE — sphere-ish 3x3 arrangement
  const cubeSize = 0.28
  // Build ball shape
  const positions = [
    // Core cross
    [0, 0.6, 0], [-0.3, 0.6, 0], [0.3, 0.6, 0],
    [0, 0.6, -0.3], [0, 0.6, 0.3],
    [0, 0.9, 0], [0, 0.3, 0],
    // Extra cubes for rounder shape
    [-0.2, 0.85, 0], [0.2, 0.85, 0],
    [-0.2, 0.35, 0], [0.2, 0.35, 0],
  ]
  positions.forEach(([px, py, pz]) => {
    group.add(createVoxel(px, py, pz, color, cubeSize))
  })
  // Big white eye in center front
  group.add(createVoxel(0, 0.6, 0.16, 0xffffff, 0.2))
  // Pupil
  group.add(createVoxel(0, 0.6, 0.27, 0x1e1b4b, 0.1))
  // Antenna on top
  group.add(createVoxel(0, 1.12, 0, color, 0.08))
  group.add(createVoxel(0, 1.25, 0, color, 0.08))
  group.add(createVoxel(0, 1.38, 0, 0xc084fc, 0.12))
}

function createTransportMonster(group, color) {
  // ORANGE MECHANICAL SPIDER — body + 4 articulated legs
  // Central body
  const bodyGeom = new THREE.BoxGeometry(0.5, 0.35, 0.5)
  const bodyMat = new THREE.MeshStandardMaterial({ color })
  const body = new THREE.Mesh(bodyGeom, bodyMat)
  body.position.y = 0.5
  body.castShadow = true
  group.add(body)
  // Top plate / carapace
  group.add(createVoxel(0, 0.72, 0, 0xea580c, 0.4))
  // 4 legs — upper + lower segments for each
  const legPositions = [
    { dx: -1, dz: -1 }, { dx: 1, dz: -1 },
    { dx: -1, dz: 1 },  { dx: 1, dz: 1 },
  ]
  legPositions.forEach(({ dx, dz }) => {
    // Upper leg (attached to body)
    const upper = createVoxel(dx * 0.3, 0.4, dz * 0.3, color, 0.15)
    upper.userData.type = 'leg'
    group.add(upper)
    // Lower leg (touching ground)
    const lower = createVoxel(dx * 0.5, 0.15, dz * 0.5, color, 0.15)
    lower.userData.type = 'leg'
    group.add(lower)
    // Foot
    group.add(createVoxel(dx * 0.6, 0.05, dz * 0.6, 0xea580c, 0.1))
  })
  // Eyes
  group.add(createVoxel(-0.1, 0.6, 0.26, 0xff0000, 0.08))
  group.add(createVoxel(0.1, 0.6, 0.26, 0xff0000, 0.08))
}

function createFoodMonster(group, color) {
  // GREEN BLOB — 3 stacked cubes getting smaller, mouth gap, white eyes
  group.add(createVoxel(0, 0.3, 0, color, 0.7))          // bottom (widest)
  group.add(createVoxel(0, 0.75, 0, color, 0.55))         // middle
  group.add(createVoxel(0, 1.12, 0, color, 0.42))         // top (smallest)
  // Drip details on sides
  group.add(createVoxel(-0.3, 0.08, 0.15, 0x16a34a, 0.12))
  group.add(createVoxel(0.25, 0.08, -0.1, 0x16a34a, 0.12))
  // White eyes on top cube
  group.add(createVoxel(-0.1, 1.22, 0.22, 0xffffff, 0.12))
  group.add(createVoxel(0.1, 1.22, 0.22, 0xffffff, 0.12))
  // Pupils
  group.add(createVoxel(-0.1, 1.22, 0.29, 0x000000, 0.05))
  group.add(createVoxel(0.1, 1.22, 0.29, 0x000000, 0.05))
  // Mouth gap (darker indent in front middle)
  group.add(createVoxel(0, 0.65, 0.38, 0x14532d, 0.25))
}

function createInsuranceMonster(group, color) {
  // BLUE GHOST — tapered transparent stack, drifting
  const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.7 })
  // Wide wispy base
  const b0 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.8), mat.clone())
  b0.position.y = 0.12
  group.add(b0)
  // Body layers tapering up
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), mat.clone())
  b1.position.y = 0.35
  group.add(b1)
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.5), mat.clone())
  b2.position.y = 0.7
  group.add(b2)
  const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.35), mat.clone())
  b3.position.y = 1.0
  group.add(b3)
  // Point on top
  const b4 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.25, 0.15), mat.clone())
  b4.position.y = 1.25
  group.add(b4)
  // Ghostly tail wisps at base
  const wispMat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.4 })
  const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), wispMat)
  w1.position.set(-0.35, 0.05, 0.2)
  group.add(w1)
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), wispMat.clone())
  w2.position.set(0.3, 0.05, -0.25)
  group.add(w2)
  // Eyes — glowing white
  group.add(createVoxel(-0.12, 0.75, 0.26, 0xffffff, 0.1))
  group.add(createVoxel(0.12, 0.75, 0.26, 0xffffff, 0.1))
}

function createEntertainmentMonster(group, color) {
  // PINK IMP — small body, big head, tiny legs, jester hat
  // Tiny legs
  group.add(createVoxel(-0.1, 0.08, 0, color, 0.14))
  group.add(createVoxel(0.1, 0.08, 0, color, 0.14))
  // Small body
  group.add(createVoxel(0, 0.3, 0, color, 0.3))
  // Big head (proportionally large)
  group.add(createVoxel(0, 0.65, 0, color, 0.45))
  // Jester hat — two angled points
  const hatL = createVoxel(-0.2, 0.98, 0, 0xfbbf24, 0.13)
  hatL.rotation.z = 0.3
  group.add(hatL)
  const hatR = createVoxel(0.2, 0.98, 0, 0xfbbf24, 0.13)
  hatR.rotation.z = -0.3
  group.add(hatR)
  // Hat bells (tiny tips)
  group.add(createVoxel(-0.28, 1.08, 0, 0xfde047, 0.06))
  group.add(createVoxel(0.28, 1.08, 0, 0xfde047, 0.06))
  // Big mischievous eyes
  group.add(createVoxel(-0.1, 0.7, 0.24, 0xffffff, 0.1))
  group.add(createVoxel(0.1, 0.7, 0.24, 0xffffff, 0.1))
  group.add(createVoxel(-0.1, 0.7, 0.3, 0x000000, 0.05))
  group.add(createVoxel(0.1, 0.7, 0.3, 0x000000, 0.05))
  // Grin
  group.add(createVoxel(0, 0.55, 0.24, 0xffffff, 0.12))
  // Tiny arms
  group.add(createVoxel(-0.22, 0.3, 0, color, 0.08))
  group.add(createVoxel(0.22, 0.3, 0, color, 0.08))
}

function createOtherMonster(group, color) {
  // GRAY GOBLIN — generic humanoid with arms and weapon
  // Legs
  group.add(createVoxel(-0.12, 0.15, 0, color, 0.2))
  group.add(createVoxel(0.12, 0.15, 0, color, 0.2))
  // Body
  group.add(createVoxel(0, 0.45, 0, color, 0.35))
  // Head
  group.add(createVoxel(0, 0.78, 0, color, 0.28))
  // Ears
  group.add(createVoxel(-0.2, 0.85, 0, 0x4b5563, 0.08))
  group.add(createVoxel(0.2, 0.85, 0, 0x4b5563, 0.08))
  // Arms
  group.add(createVoxel(-0.28, 0.42, 0, color, 0.12))
  group.add(createVoxel(0.28, 0.42, 0, color, 0.12))
  // Held club in right hand
  group.add(createVoxel(0.28, 0.58, 0, 0x92400e, 0.08))
  group.add(createVoxel(0.28, 0.7, 0, 0x92400e, 0.08))
  // Red glowing eyes
  group.add(createVoxel(-0.06, 0.82, 0.15, 0xff0000, 0.06))
  group.add(createVoxel(0.06, 0.82, 0.15, 0xff0000, 0.06))
}

// Fish — small voxel fish for water
export function createFish(x, z) {
  const group = new THREE.Group()
  const fishColors = [0xf97316, 0xfbbf24, 0xef4444, 0xfb923c, 0xfcd34d]
  const color = fishColors[Math.floor(Math.random() * fishColors.length)]
  group.position.set(x, -0.2, z)
  // Body
  group.add(createVoxel(0, 0, 0, color, 0.18))
  group.add(createVoxel(0.1, 0, 0, color, 0.14))
  // Tail
  group.add(createVoxel(-0.15, 0, 0, color, 0.1))
  group.add(createVoxel(-0.22, 0.04, 0, color, 0.06))
  group.add(createVoxel(-0.22, -0.04, 0, color, 0.06))
  // Eye
  group.add(createVoxel(0.15, 0.03, 0.06, 0x000000, 0.03))
  return group
}

// Floating cloud
export function createCloud(x, y, z) {
  const group = new THREE.Group()
  group.position.set(x, y, z)
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 })
  // Random cloud shape from overlapping cubes
  const count = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    const w = 0.8 + Math.random() * 1.2
    const h = 0.3 + Math.random() * 0.3
    const d = 0.6 + Math.random() * 0.8
    const geom = new THREE.BoxGeometry(w, h, d)
    const mesh = new THREE.Mesh(geom, mat.clone())
    mesh.position.set(
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.8
    )
    group.add(mesh)
  }
  return group
}

// Rocks cluster
export function createRocks(x, z) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  group.add(createVoxel(0, 0.15, 0, 0x9ca3af, 0.35))
  group.add(createVoxel(0.2, 0.1, 0.15, 0x6b7280, 0.25))
  group.add(createVoxel(-0.15, 0.1, -0.1, 0x78716c, 0.2))
  return group
}

// Flowers (tiny colored cubes)
export function createFlower(x, z) {
  const colors = [0xef4444, 0xfbbf24, 0xec4899, 0x8b5cf6, 0xffffff]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  // Stem
  group.add(createVoxel(0, 0.1, 0, 0x22c55e, 0.05))
  // Petal
  group.add(createVoxel(0, 0.2, 0, color, 0.1))
  return group
}

// Well (for village stage)
export function createWell(x, z) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  // Base ring of stone cubes
  const stoneColor = 0x9ca3af
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
    const wx = Math.cos(angle) * 0.3
    const wz = Math.sin(angle) * 0.3
    group.add(createVoxel(wx, 0.2, wz, stoneColor, 0.2))
  }
  // Water inside
  const waterGeom = new THREE.BoxGeometry(0.3, 0.05, 0.3)
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 })
  const water = new THREE.Mesh(waterGeom, waterMat)
  water.position.y = 0.15
  group.add(water)
  // Roof posts
  group.add(createVoxel(-0.25, 0.5, 0, 0x92400e, 0.08))
  group.add(createVoxel(0.25, 0.5, 0, 0x92400e, 0.08))
  // Roof
  group.add(createVoxel(0, 0.75, 0, 0x92400e, 0.6))
  return group
}

// Fence section
export function createFence(x, z, length = 3) {
  const group = new THREE.Group()
  group.position.set(x, 0, z)
  for (let i = 0; i < length; i++) {
    // Post
    group.add(createVoxel(i * 0.5, 0.2, 0, 0x92400e, 0.1))
    group.add(createVoxel(i * 0.5, 0.4, 0, 0x92400e, 0.1))
    // Rail
    if (i < length - 1) {
      const rail = createVoxel(i * 0.5 + 0.25, 0.35, 0, 0x92400e, 0.08)
      rail.scale.x = 3
      group.add(rail)
    }
  }
  return group
}

// ==========================================
// DEATH ANIMATIONS — unique per category
// Each returns a Promise that resolves when the animation is done.
// The caller must pass the scene so we can add/remove meshes.
// ==========================================

export function playDeathAnimation(scene, monsterMesh, category, particlesRef) {
  const pos = monsterMesh.position.clone()
  const color = MONSTER_COLORS[category] || MONSTER_COLORS.other

  switch (category) {
    case 'housing':   return deathHousing(scene, monsterMesh, pos, color, particlesRef)
    case 'utilities': return deathUtilities(scene, monsterMesh, pos, color, particlesRef)
    case 'phone':     return deathPhone(scene, monsterMesh, pos, color, particlesRef)
    case 'transport': return deathTransport(scene, monsterMesh, pos, color, particlesRef)
    case 'food':      return deathFood(scene, monsterMesh, pos, color, particlesRef)
    case 'insurance': return deathInsurance(scene, monsterMesh, pos, color, particlesRef)
    case 'entertainment': return deathEntertainment(scene, monsterMesh, pos, color, particlesRef)
    default:          return deathOther(scene, monsterMesh, pos, color, particlesRef)
  }
}

function animateValue(duration, onUpdate) {
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

// HOUSING: Crumbles — body splits into cubes that fall with gravity & bounce
function deathHousing(scene, monster, pos, color, particlesRef) {
  // Collect child world positions, then remove monster
  const cubeData = []
  monster.traverse(child => {
    if (child.isMesh) {
      const worldPos = new THREE.Vector3()
      child.getWorldPosition(worldPos)
      cubeData.push({ pos: worldPos, color: child.material.color.getHex(), size: 0.18 })
    }
  })
  scene.remove(monster)

  // Spawn falling debris cubes
  const debris = cubeData.slice(0, 8).map(d => {
    const cube = createVoxel(d.pos.x, d.pos.y, d.pos.z, d.color, d.size)
    cube.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      Math.random() * 0.5,
      (Math.random() - 0.5) * 1.5
    )
    cube.userData.bounced = false
    scene.add(cube)
    return cube
  })

  return animateValue(600, (t) => {
    debris.forEach(d => {
      d.userData.velocity.y -= 0.3
      d.position.add(d.userData.velocity.clone().multiplyScalar(0.016))
      // Bounce once
      if (d.position.y < 0.05 && !d.userData.bounced) {
        d.userData.bounced = true
        d.userData.velocity.y = Math.abs(d.userData.velocity.y) * 0.3
      }
      d.position.y = Math.max(d.position.y, 0.02)
      d.material.opacity = 1 - t * 0.8
      d.material.transparent = true
    })
    if (t >= 1) debris.forEach(d => scene.remove(d))
  })
}

// UTILITIES: Sparks fly outward, body dissolves top-down (cubes shrink to 0 sequentially)
function deathUtilities(scene, monster, pos, color, particlesRef) {
  // Fling spark particles outward fast
  const sparkParticles = createParticles(pos.clone().setY(pos.y + 0.7), 0xfde047, 8, 0.1)
  sparkParticles.forEach(p => {
    p.userData.velocity.multiplyScalar(2.5)
    scene.add(p)
  })
  if (particlesRef) particlesRef.current.push(...sparkParticles)

  // Dissolve body top-down
  const meshes = []
  monster.traverse(child => {
    if (child.isMesh) meshes.push(child)
  })
  // Sort by Y position descending (top first)
  meshes.sort((a, b) => {
    const ay = new THREE.Vector3(); a.getWorldPosition(ay)
    const by = new THREE.Vector3(); b.getWorldPosition(by)
    return by.y - ay.y
  })

  return animateValue(500, (t) => {
    meshes.forEach((m, i) => {
      const delay = i / meshes.length
      const localT = Math.max(0, (t - delay * 0.5) / 0.5)
      if (localT > 0) {
        const s = Math.max(0, 1 - localT)
        m.scale.set(s, s, s)
      }
    })
    if (t >= 1) scene.remove(monster)
  })
}

// PHONE: Static effect — rapidly toggle visibility 5x, then scatter all cubes outward
function deathPhone(scene, monster, pos, color, particlesRef) {
  let flickerCount = 0
  const flickerInterval = setInterval(() => {
    monster.visible = !monster.visible
    flickerCount++
    if (flickerCount >= 10) clearInterval(flickerInterval)
  }, 40)

  return new Promise(resolve => {
    setTimeout(() => {
      clearInterval(flickerInterval)
      monster.visible = true

      // Scatter cubes outward
      const cubes = []
      monster.traverse(child => {
        if (child.isMesh) {
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)
          cubes.push({ pos: worldPos, color: child.material.color.getHex() })
        }
      })
      scene.remove(monster)

      const scattered = cubes.map(c => {
        const cube = createVoxel(c.pos.x, c.pos.y, c.pos.z, c.color, 0.15)
        cube.userData.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 6,
          Math.random() * 4 + 1,
          (Math.random() - 0.5) * 6
        )
        cube.userData.gravity = -12
        cube.userData.life = 1.0
        scene.add(cube)
        return cube
      })
      if (particlesRef) particlesRef.current.push(...scattered)

      resolve()
    }, 400)
  })
}

// TRANSPORT: Legs fold inward, body shrinks with orange particle pop
function deathTransport(scene, monster, pos, color, particlesRef) {
  const legs = []
  const body = []
  monster.traverse(child => {
    if (child.isMesh) {
      if (child.userData.type === 'leg') legs.push(child)
      else body.push(child)
    }
  })

  return animateValue(500, (t) => {
    // First half: legs fold in
    if (t < 0.6) {
      const legT = t / 0.6
      legs.forEach(leg => {
        leg.position.x *= (1 - legT * 0.05)
        leg.position.z *= (1 - legT * 0.05)
        leg.position.y = leg.position.y * (1 - legT * 0.3)
      })
    }
    // Second half: body shrinks to 0
    if (t > 0.4) {
      const bodyT = (t - 0.4) / 0.6
      const s = Math.max(0, 1 - bodyT)
      monster.scale.set(s, s, s)
    }
    if (t >= 1) {
      scene.remove(monster)
      // Orange particle pop
      const popParticles = createParticles(pos.clone().setY(pos.y + 0.5), color, 10, 0.08)
      popParticles.forEach(p => scene.add(p))
      if (particlesRef) particlesRef.current.push(...popParticles)
    }
  })
}

// FOOD: Melts — squashes flat (scaleY→0.1, scaleX/Z→2.0), then fades
function deathFood(scene, monster, pos, color, particlesRef) {
  const origScale = monster.scale.clone()

  return animateValue(500, (t) => {
    const squashT = Math.min(t / 0.7, 1)
    const ease = squashT * squashT
    monster.scale.y = origScale.y * (1 - ease * 0.9)
    monster.scale.x = origScale.x * (1 + ease * 1.0)
    monster.scale.z = origScale.z * (1 + ease * 1.0)
    monster.position.y = pos.y - ease * 0.3

    // Fade out in last 30%
    if (t > 0.7) {
      const fadeT = (t - 0.7) / 0.3
      monster.traverse(child => {
        if (child.isMesh) {
          child.material.opacity = 1 - fadeT
          child.material.transparent = true
        }
      })
    }
    if (t >= 1) scene.remove(monster)
  })
}

// INSURANCE: Ghost rises upward while fading to 0
function deathInsurance(scene, monster, pos, color, particlesRef) {
  const startY = monster.position.y

  return animateValue(600, (t) => {
    const ease = t * t
    monster.position.y = startY + ease * 3
    monster.traverse(child => {
      if (child.isMesh) {
        child.material.opacity = Math.max(0, 0.7 - t * 0.9)
        child.material.transparent = true
      }
    })
    if (t >= 1) scene.remove(monster)
  })
}

// ENTERTAINMENT: Spins rapidly, shrinks to 0, pops into pink+white sparkles
function deathEntertainment(scene, monster, pos, color, particlesRef) {
  return animateValue(500, (t) => {
    // Accelerating spin
    const spinSpeed = t * t * 25
    monster.rotation.y = spinSpeed

    // Shrink
    const s = Math.max(0, 1 - t * 1.2)
    monster.scale.set(s, s, s)

    if (t >= 0.85 && monster.parent) {
      scene.remove(monster)
      // Pink + white sparkle pop
      const colors = [color, 0xffffff, color, 0xfde047]
      const sparkles = []
      for (let i = 0; i < 12; i++) {
        const c = colors[i % colors.length]
        const p = createVoxel(pos.x, pos.y + 0.5, pos.z, c, 0.07)
        p.userData.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          Math.random() * 4 + 2,
          (Math.random() - 0.5) * 5
        )
        p.userData.gravity = -8
        p.userData.life = 0.8
        scene.add(p)
        sparkles.push(p)
      }
      if (particlesRef) particlesRef.current.push(...sparkles)
    }
    if (t >= 1 && monster.parent) scene.remove(monster)
  })
}

// OTHER (Goblin): Standard explosion — all cubes scatter with gravity
function deathOther(scene, monster, pos, color, particlesRef) {
  const cubeData = []
  monster.traverse(child => {
    if (child.isMesh) {
      const worldPos = new THREE.Vector3()
      child.getWorldPosition(worldPos)
      cubeData.push({ pos: worldPos, color: child.material.color.getHex() })
    }
  })
  scene.remove(monster)

  const scattered = cubeData.map(c => {
    const cube = createVoxel(c.pos.x, c.pos.y, c.pos.z, c.color, 0.12)
    cube.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      Math.random() * 3 + 1,
      (Math.random() - 0.5) * 4
    )
    cube.userData.gravity = -9.8
    cube.userData.life = 0.8
    scene.add(cube)
    return cube
  })
  if (particlesRef) particlesRef.current.push(...scattered)

  return animateValue(400, () => {})
}

// Particle burst helper — returns array of small cube meshes
export function createParticles(position, color, count = 10, size = 0.08) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const p = createVoxel(0, 0, 0, color, size)
    p.position.copy(position)
    // Random velocity
    p.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      Math.random() * 3 + 1,
      (Math.random() - 0.5) * 4
    )
    p.userData.gravity = -9.8
    p.userData.life = 1.0
    particles.push(p)
  }
  return particles
}
