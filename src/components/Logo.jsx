import logo from '../assets/logo.png'

// Image mark for light backgrounds; variant="text" keeps the wordmark
// for dark surfaces (footer) where the brown line art wouldn't read.
export default function Logo({ compact = false, variant = 'image' }) {
  if (variant === 'text') {
    return (
      <a href="#top" className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Nazia Botanics — home">
        <span className="brand__leaf" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M12 21c0-6 .5-10 5-14-5 .3-9 2.6-9 8.5C8 18.2 9.6 20 12 21z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M12 21C12 14 9 9 4 6c.8 6.5 2.8 11.4 8 15z"
              fill="currentColor"
              opacity="0.55"
            />
          </svg>
        </span>
        <span className="brand__text">
          <span className="brand__name">Nazia</span>
          <span className="brand__sub">Botanics</span>
        </span>
      </a>
    )
  }

  return (
    <a href="#top" className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Nazia Botanics — home">
      <img className="brand__mark" src={logo} alt="Nazia Botanics" />
    </a>
  )
}
