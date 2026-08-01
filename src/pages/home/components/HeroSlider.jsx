import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

// 3D canvas is heavy — load it lazily so first paint stays instant.
const BottleScene = lazy(() => import('../three/BottleScene'))

// Three takes on the same 3D bottle: full view, label close-up, high angle.
const VARIANTS = [
  { bg: 'blush', camY: 0.5, zoom: 7.6, aimY: -0.15, petals: ['#9c4f56', '#95a075'], label: 'Bottle full view' },
  { bg: 'cream', camY: -0.1, zoom: 5.4, aimY: -0.2, petals: ['#b5893a', '#95a075'], label: 'Label close-up' },
  { bg: 'sand', camY: 2.6, zoom: 6.6, aimY: -0.3, petals: ['#9c4f56', '#b5893a'], label: 'Bottle from above' },
]

const INTERVAL = 4200
const MAX_TILT = 7 // degrees

/* One-off probe so we never load 250kB of three.js on a device that can't run it. */
function detectWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    // release the probe context immediately — they are a limited resource
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Phones and low-core machines get the cheaper render path. */
const wantsLite = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(max-width: 920px)').matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4)

export default function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [inView, setInView] = useState(true)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  // scene lifecycle: does the device support it, has it painted, did it die
  const [supported] = useState(detectWebGL)
  const [ready, setReady] = useState(false)
  const [lost, setLost] = useState(false)
  const frameRef = useRef(null)

  const reduced = prefersReducedMotion()
  const lite = wantsLite()
  const live = supported && ready && !lost
  const variant = VARIANTS[index]

  // Stop the render loop whenever the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const node = frameRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onVisibility = () => setInView(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const running = inView && !hovered && !reduced
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setIndex((i) => (i + 1) % VARIANTS.length), INTERVAL)
    return () => clearInterval(t)
  }, [running])

  const onMove = (e) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -ny * MAX_TILT * 2, y: nx * MAX_TILT * 2 })
  }

  const onLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  const handleReady = useCallback(() => setReady(true), [])
  const handleLost = useCallback(() => setLost(true), [])
  const handleRestored = useCallback(() => setLost(false), [])

  return (
    <div
      className="hero-slider"
      ref={frameRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-roledescription="carousel"
      aria-label="Product gallery"
    >
      <div
        className="hero-slider__frame"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        {VARIANTS.map((v, i) => (
          <div
            key={v.bg}
            className={`hero-slider__bg hero-slider__bg--${v.bg} ${i === index ? 'is-active' : ''}`}
            aria-hidden="true"
          />
        ))}

        {/* Always-present CSS bottle. The canvas fades in over it when — and only
            when — WebGL actually paints, so the hero is never an empty box. */}
        <div className="hero-slider__poster" aria-hidden={live || undefined}>
          <div className="poster-bottle">
            <div className="poster-bottle__cap" />
            <div className="poster-bottle__neck" />
            <div className="poster-bottle__body">
              <div className="poster-bottle__oil" />
              <div className="poster-bottle__label">
                <span className="poster-bottle__brand">Nazia</span>
                <span className="poster-bottle__type">Growth Oil</span>
              </div>
            </div>
          </div>
          <span className="poster-bottle__sprig" aria-hidden="true">🌿</span>
        </div>

        {supported && (
          <div className={`hero-slider__canvas ${live ? 'is-live' : ''}`}>
            <Suspense fallback={null}>
              <BottleScene
                camY={variant.camY}
                zoom={variant.zoom}
                aimY={variant.aimY}
                petals={variant.petals}
                lite={lite}
                paused={!inView || lost}
                onReady={handleReady}
                onLost={handleLost}
                onRestored={handleRestored}
              />
            </Suspense>
          </div>
        )}

        <div className="hero-slider__sheen" aria-hidden="true" />
      </div>

      <div className="hero-slider__dots">
        {VARIANTS.map((v, i) => (
          <button
            key={v.bg}
            className={i === index ? 'is-active' : ''}
            aria-label={`Go to slide ${i + 1}: ${v.label}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}
