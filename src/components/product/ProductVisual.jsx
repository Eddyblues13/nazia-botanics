import { optimizedUrl, srcSetFor } from '@/lib/cloudinary'

/**
 * Renders the product photography an admin uploaded, and the hand-built CSS
 * bottle when there is none — so the storefront looks finished before the
 * first photo is ever uploaded, and switches to the real thing the moment one
 * is.
 *
 * Cloudinary-hosted images are served through `f_auto,q_auto` at a width the
 * browser picks; anything else (a pasted URL) is passed through untouched.
 *
 * `sizes` should describe the slot the image occupies — the default matches
 * the spotlight, which is roughly half the page on desktop.
 *
 * `fallback` picks what stands in when there is no photo: the full CSS bottle
 * for hero-sized slots, or a compact monogram for thumbnails, where the bottle
 * would be illegible.
 */
export default function ProductVisual({
  product,
  sizeLabel,
  className = '',
  sizes = '(min-width: 900px) 42vw, 90vw',
  width = 900,
  priority = false,
  fallback = 'bottle',
}) {
  if (product?.image) {
    return (
      <img
        src={optimizedUrl(product.image, { width })}
        srcSet={srcSetFor(product.image)}
        sizes={sizes}
        alt={product.name}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`product-photo ${className}`}
      />
    )
  }

  if (fallback === 'mark') {
    return (
      <span className="product-mark" aria-hidden="true">
        🌿
      </span>
    )
  }

  return (
    <>
      <div className="bottle-card__glow" />
      <div className="bottle-card__bottle">
        <div className="bottle-card__cap" />
        <div className="bottle-card__neck" />
        <div className="bottle-card__body">
          <div className="bottle-card__oil" />
          <div className="bottle-card__label">
            <span className="bottle-card__brand">Nazia</span>
            <span className="bottle-card__type">Growth Oil</span>
            {sizeLabel && <span className="bottle-card__size">{sizeLabel}</span>}
          </div>
        </div>
      </div>
      <span className="bottle-card__sprig" aria-hidden="true">🌿</span>
      <span className="bottle-card__bloom" aria-hidden="true">🌺</span>
    </>
  )
}
