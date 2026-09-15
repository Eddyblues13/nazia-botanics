import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '@/components/common/Reveal'
import ProductVisual from '@/components/product/ProductVisual'
import { useCart } from '@/context/cart-context'
import { useShop } from '@/context/shop-context'
import { formatNaira } from '@/lib/format'
import { ritualGuideLink } from '@/data'

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

export default function ProductSpotlight() {
  const { addToCart } = useCart()
  const { product, loading } = useShop()
  const cardRef = useRef(null)

  // Only the chosen label is held in state — the size itself is derived from
  // whichever product is current. The bundled product stands in until the
  // catalog arrives, and this re-points at the real one without an effect.
  const [label, setLabel] = useState(null)
  const size = product.sizes.find((s) => s.label === label) ?? product.sizes.at(-1)

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
            className={`bottle-card ${product.image ? 'bottle-card--photo' : ''}`}
            onMouseMove={handleMove}
            onMouseLeave={reset}
          >
            <ProductVisual product={product} sizeLabel={size.label} priority />
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
                onClick={() => setLabel(s.label)}
              >
                {s.label}
              </button>
            ))}
          </Reveal>

          <Reveal delay={0.3} className="spotlight__buy">
            <button
              className="btn btn--terracotta"
              onClick={() => addToCart(size, product)}
              disabled={loading}
            >
              <span>Add to Cart — {formatNaira(size.price)}</span>
            </button>
            <p className="spotlight__note">
              New to oiling? <Link to={ritualGuideLink}>See the 5-Minute Ritual Guide →</Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
