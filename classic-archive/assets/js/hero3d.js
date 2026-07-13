/**
 * Interactive WebGL hero — a wavy point-field ("signal grid") that drifts and
 * reacts to the cursor. Evokes data / forecasting, on-theme for a quant + ML
 * engineer. Degrades silently to the CSS hero on reduced-motion, no-WebGL, or
 * a failed CDN load (the canvas simply stays empty behind the overlay).
 */
const canvas = document.getElementById('hero-canvas')
const hero = document.getElementById('hero')
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch (e) {
    return false
  }
}

if (canvas && hero && !reduce && hasWebGL()) {
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
    .then((THREE) => initHero(THREE))
    .catch(() => { /* keep the CSS fallback hero */ })
}

function initHero(THREE) {
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch (e) {
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x07070a, 0.09)

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
  camera.position.set(0, 2.1, 9)
  camera.lookAt(0, 0, -2)

  // Point grid on a tilted plane
  const small = window.innerWidth < 760
  const COLS = small ? 64 : 116
  const ROWS = small ? 42 : 72
  const GAP = 0.34
  const count = COLS * ROWS
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const base = new Float32Array(count * 2)
  const accent = new THREE.Color(0xff5c33)
  const warm = new THREE.Color(0xf6f3ec)
  let i = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = (c - COLS / 2) * GAP
      const z = (r - ROWS / 2) * GAP
      positions[i * 3] = x
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = z
      base[i * 2] = x
      base[i * 2 + 1] = z
      const t = Math.min(1, Math.hypot(x, z) / 13)
      const col = warm.clone().lerp(accent, Math.pow(t, 1.4) * 0.92)
      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
      i++
    }
  }
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const points = new THREE.Points(geom, mat)
  points.rotation.x = -0.34
  points.position.y = -1.8 // sit the field lower in the viewport
  scene.add(points)

  // Pointer parallax (eased)
  let tx = 0, ty = 0, cx = 0, cy = 0
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect()
    tx = (e.clientX - r.left) / r.width - 0.5
    ty = (e.clientY - r.top) / r.height - 0.5
  })
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0 })

  function resize() {
    const w = hero.clientWidth
    const h = hero.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  const pos = geom.attributes.position.array
  let t = 0
  let running = true
  let rafId = null

  function loop() {
    if (rafId) return
    const tick = () => {
      if (!running) { rafId = null; return }
      t += 0.012
      for (let k = 0; k < count; k++) {
        const x = base[k * 2]
        const z = base[k * 2 + 1]
        pos[k * 3 + 1] = Math.sin(x * 0.5 + t) * 0.5 + Math.cos(z * 0.45 + t * 0.8) * 0.42
      }
      geom.attributes.position.needsUpdate = true
      cx += (tx - cx) * 0.05
      cy += (ty - cy) * 0.05
      points.rotation.z = cx * 0.25
      points.rotation.x = -0.34 + cy * 0.18
      camera.position.x = cx * 1.6
      camera.lookAt(0, 0, -2)
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  // Pause when the hero scrolls out of view or the tab is hidden
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting && !document.hidden
      if (running) loop()
    }, { threshold: 0 }).observe(hero)
  }
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden
    if (running) loop()
  })

  loop()
}
