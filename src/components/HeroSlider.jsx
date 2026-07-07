import { Suspense, lazy, useEffect, useRef, useState } from 'react'

// 3D canvas is heavy — load it lazily so first paint stays instant.
const BottleScene = lazy(() => import('../three/BottleScene'))

// Three takes on the same 3D bottle: full view, label close-up, high angle.
const VARIANTS = [
  { bg: 'blush', camY: 0.5, zoom: 7.6, aimY: -0.15, petals: ['#9c4f56', '#95a075'], label: 'Bottle full view' },
  { bg: 'cream', camY: -0.1, zoom: 5.4, aimY: -0.2, petals: ['#b5893a', '#95a075'], label: 'Label close-up' },
  { bg: 'sand', camY: 2.6, zoom: 6.6, aimY: -0.3, petals: ['#9c4f56', '#b5893a'], label: 'Bottle from above' },
]

const INTERVAL = 3200
const TRANSITION_MS = 650
const MAX_TILT = 7 // degrees

export default function HeroSlider() {
  const [index, setIndex] = useState(0)
  // keep the outgoing scene mounted while it slides away, then release its WebGL context
  const [ghost, setGhost] = useState(null)
  const [paused, setPaused] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const frameRef = useRef(null)

  const go = (next) => {
    setIndex((current) => {
      if (next === current) return current
      setGhost(current)
      return next
    })
  }

  useEffect(() => {
    if (ghost === null) return
    const t = setTimeout(() => setGhost(null), TRANSITION_MS)
    return () => clearTimeout(t)
  }, [ghost, index])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => go((index + 1) % VARIANTS.length), INTERVAL)
    return () => clearInterval(t)
  }, [paused, index])

  const onMove = (e) => {
    const rect = frameRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -ny * MAX_TILT * 2, y: nx * MAX_TILT * 2 })
  }

  const onLeave = () => {
    setPaused(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      className="hero-slider"
      ref={frameRef}
      onMouseEnter={() => setPaused(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-roledescription="carousel"
      aria-label="Product gallery"
    >
      <div
        className="hero-slider__frame"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <div
          className="hero-slider__track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {VARIANTS.map((v, i) => (
            <div
              key={i}
              className={`hero-slider__slide hero-slider__slide--scene hero-slider__slide--${v.bg}`}
              aria-hidden={i !== index}
              aria-label={v.label}
            >
              {i === index || i === ghost ? (
                <Suspense fallback={<div className="hero-slider__scene-fallback" aria-hidden="true" />}>
                  <BottleScene camY={v.camY} zoom={v.zoom} aimY={v.aimY} petals={v.petals} />
                </Suspense>
              ) : (
                <div className="hero-slider__scene-fallback" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <div className="hero-slider__sheen" aria-hidden="true" />
      </div>

      <div className="hero-slider__dots">
        {VARIANTS.map((v, i) => (
          <button
            key={i}
            className={i === index ? 'is-active' : ''}
            aria-label={`Go to slide ${i + 1}: ${v.label}`}
            aria-current={i === index}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  )
}
