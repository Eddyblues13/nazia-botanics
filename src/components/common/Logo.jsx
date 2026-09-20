import { Link } from 'react-router-dom'
import markDark from '@/assets/icon-dark.svg'
import markCream from '@/assets/icon-cream.svg'

/**
 * The brand mark: the leafed N on its own, in the two colourways it ships in —
 * deep green for light surfaces and cream for dark ones (the footer).
 *
 * The monogram is used rather than the stacked lockup with the wordmark, so the
 * name is carried by the page itself instead of being repeated in the mark.
 */
export default function Logo({ compact = false, variant = 'dark' }) {
  const src = variant === 'cream' ? markCream : markDark

  return (
    <Link
      to="/"
      className={`brand ${compact ? 'brand--compact' : ''}`}
      aria-label="Nazia Botanics — home"
    >
      <img className="brand__mark" src={src} alt="Nazia Botanics" />
    </Link>
  )
}
