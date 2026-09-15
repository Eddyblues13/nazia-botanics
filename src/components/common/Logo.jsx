import { Link } from 'react-router-dom'
import logoDark from '@/assets/logo-dark.svg'
import logoCream from '@/assets/logo-cream.svg'

/**
 * The full brand mark, in the two colourways it ships in: deep green for light
 * surfaces and cream for dark ones (the footer).
 *
 * `variant="cream"` picks the light-on-dark artwork. The footer used to fall
 * back to a hand-built leaf and wordmark because the old mark went invisible on
 * the dark background; the cream export makes that unnecessary.
 */
export default function Logo({ compact = false, variant = 'dark' }) {
  const src = variant === 'cream' ? logoCream : logoDark

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
