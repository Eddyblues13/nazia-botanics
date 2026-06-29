import { useRef, useState } from 'react'
import Reveal from './Reveal'
import { product, ritualGuideLink, formatNaira } from '../data'

function HighlightIcon({ type }) {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'sprout')
    return (
      <svg {...common}><path d="M12 20v-7" /><path d="M12 13c0-3 2.5-5 5.5-5-.2 3-2.5 5-5.5 5Z" /><path d="M12 14c0-3-2.5-5-5.5-5 .2 3 2.5 5 5.5 5Z" /></svg>
    )
  if (type === 'strand')
    return (
      <svg {...common}><path d="M8 3c0 4 8 5 8 9s-8 5-8 9" /><path d="M16 3c0 4-8 5-8 9s8 5 8 9" /></svg>
    )
  return (
    <svg {...common}><circle cx="12" cy="12" r="3.2" /><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" /></svg>
  )
}

export default function ProductSpotlight({ onAdd }) {
  const [size, setSize] = useState(product.sizes[1])
  const cardRef = useRef(null)

  // Subtle 3D tilt toward the cursor.
  const handleMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(px * 10).toFixed(2)}deg`)
  }
  const reset = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <section className="section spotlight" id="shop">
      <div className="container spotlight__grid">
        <Reveal className="spotlight__visual">
          <div
            ref={cardRef}
            className="bottle-card"
            onMouseMove={handleMove}
            onMouseLeave={reset}
          >
            <div className="bottle-card__glow" />
            <div className="bottle-card__bottle">
              <div className="bottle-card__cap" />
              <div className="bottle-card__neck" />
              <div className="bottle-card__body">
                <div className="bottle-card__oil" />
                <div className="bottle-card__label">
                  <span className="bottle-card__brand">Nazia</span>
                  <span className="bottle-card__type">Growth Oil</span>
                  <span className="bottle-card__size">{size.label}</span>
                </div>
              </div>
            </div>
            <span className="bottle-card__sprig" aria-hidden="true">🌿</span>
            <span className="bottle-card__bloom" aria-hidden="true">🌺</span>
          </div>
        </Reveal>

        <div className="spotlight__info">
          <Reveal as="p" className="eyebrow">Product Spotlight</Reveal>
          <Reveal as="h2" delay={0.05} className="spotlight__name">
            {product.name}
          </Reveal>
          <Reveal as="p" delay={0.1} className="spotlight__tagline">
            {product.tagline}
          </Reveal>

          <Reveal delay={0.15} className="spotlight__price">
            {formatNaira(size.price)}
            <span>/ {size.label}</span>
          </Reveal>

          <Reveal delay={0.2} className="spotlight__highlights">
            {product.highlights.map((h) => (
              <div className="highlight" key={h.title}>
                <span className="highlight__icon">
                  <HighlightIcon type={h.icon} />
                </span>
                <span>
                  <strong>{h.title}</strong>
                  <em>{h.detail}</em>
                </span>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.25} className="spotlight__sizes">
            {product.sizes.map((s) => (
              <button
                key={s.label}
                className={`pill ${size.label === s.label ? 'pill--active' : ''}`}
                onClick={() => setSize(s)}
              >
                {s.label}
              </button>
            ))}
          </Reveal>

          <Reveal delay={0.3} className="spotlight__buy">
            <button className="btn btn--terracotta" onClick={() => onAdd?.(size)}>
              <span>Add to Cart — {formatNaira(size.price)}</span>
            </button>
            <p className="spotlight__note">
              New to oiling? <a href={ritualGuideLink}>See the 5-Minute Ritual Guide →</a>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
