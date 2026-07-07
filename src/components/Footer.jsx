import { useState } from 'react'
import Logo from './Logo'
import { social } from '../data'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email) return
    setDone(true)
    setEmail('')
  }

  return (
    <footer className="footer" id="footer">
      <div className="container footer__grid">
        <div className="footer__signup">
          <Logo variant="text" />
          <h3>Join our community for weekly wellness rituals.</h3>
          {done ? (
            <p className="footer__thanks">Welcome to the ritual — check your inbox. 🌿</p>
          ) : (
            <form className="footer__form" onSubmit={submit}>
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn"><span>Subscribe</span></button>
            </form>
          )}
        </div>

        <nav className="footer__links" aria-label="Footer">
          <div>
            <h4>Shop</h4>
            <a href="#shop">Growth Oil</a>
            <a href="#shop">Gift Sets</a>
            <a href="#account">Founding Circle</a>
          </div>
          <div>
            <h4>Learn</h4>
            <a href="#journal">The Journal</a>
            <a href="#story">Our Story</a>
            <a href="#journal">Ritual Guide</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#footer">Contact</a>
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
