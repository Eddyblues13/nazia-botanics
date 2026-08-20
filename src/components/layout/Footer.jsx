import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '@/components/common/Logo'
import { social } from '@/data'
import { subscribeToNewsletter } from '@/services/newsletterService'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!email || isSubmitting) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await subscribeToNewsletter(email)
      if (res.success) {
        setDone(true)
        setEmail('')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="footer" id="footer">
      <div className="container footer__grid">
        <div className="footer__signup">
          <Logo variant="text" />
          <h3>Join our community for weekly wellness rituals.</h3>
          {done ? (
            <div className="footer__thanks">
              <p>✨ <strong>Thank you for joining our community!</strong></p>
              <p>Look out for our weekly wellness rituals in your inbox. 🌿</p>
            </div>
          ) : (
            <form className="footer__form" onSubmit={submit}>
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
              </button>
            </form>
          )}
          {error && <p className="footer__error" style={{ color: '#e57373', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}
        </div>

        <nav className="footer__links" aria-label="Footer">
          <div>
            <h4>Shop</h4>
            <Link to="/shop">Growth Oil</Link>
            <Link to="/shop">Gift Sets</Link>
            <Link to="/waitlist">Join the Waitlist</Link>
          </div>
          <div>
            <h4>Learn</h4>
            <Link to="/journal">The Journal</Link>
            <Link to="/our-story">Our Story</Link>
            <Link to="/journal/scalp-massage-ritual">Ritual Guide</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </nav>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} Nazia Botanics. Rooted in care.</p>
        <a href={social.instagram} target="_blank" rel="noreferrer" className="footer__social">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          {social.handle}
        </a>
      </div>
    </footer>
  )
}
