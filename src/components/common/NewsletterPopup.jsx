import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { social } from '@/data'
import { subscribeToNewsletter } from '@/services/newsletterService'

const SHOW_AFTER_MS = 30_000 // dwell time before we interrupt anyone
const REMIND_AFTER_DAYS = 30
const STORE_KEY = 'nb:newsletter'

/* localStorage throws in Safari private mode — never let that break the page. */
const readState = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORE_KEY)) || null
  } catch {
    return null
  }
}
const writeState = (status) => {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ status, at: Date.now() }))
  } catch {
    /* ignore — the popup just reappears next session */
  }
}

/* Subscribers never see it again; dismissers get a month of quiet. */
const isSuppressed = () => {
  const saved = readState()
  if (!saved) return false
  if (saved.status === 'subscribed') return true
  return Date.now() - saved.at < REMIND_AFTER_DAYS * 86_400_000
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])'

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const inputRef = useRef(null)

  const close = useCallback((status) => {
    setOpen(false)
    writeState(status)
  }, [])

  // Count only time the tab is actually visible, so a backgrounded tab
  // doesn't "earn" the popup while nobody is looking.
  useEffect(() => {
    if (isSuppressed()) return
    let visibleMs = 0
    let last = Date.now()
    const id = setInterval(() => {
      const now = Date.now()
      if (!document.hidden) visibleMs += now - last
      last = now
      if (visibleMs >= SHOW_AFTER_MS) {
        setOpen(true)
        clearInterval(id)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Escape to close, Tab trapped inside, focus restored on the way out.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    inputRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close('dismissed')
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus?.()
    }
  }, [open, close])

  // Lock the page behind the dialog, compensating for the scrollbar so the
  // layout doesn't jump on desktop.
  useEffect(() => {
    if (!open) return
    const { body, documentElement: html } = document
    const gap = window.innerWidth - html.clientWidth
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
    }
  }, [open])

  const submit = async (e) => {
    e.preventDefault()
    if (!email || isSubmitting) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await subscribeToNewsletter(email)
      if (res.success) {
        setDone(true)
        writeState('subscribed')
        setTimeout(() => setOpen(false), 3200)
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
    <AnimatePresence>
      {open && (
        <motion.div
          className="np"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="np__backdrop"
            onClick={() => close('dismissed')}
            aria-hidden="true"
          />

          <motion.div
            className="np__card"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="np-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              className="np__close"
              onClick={() => close('dismissed')}
              aria-label="Close"
            >
              ✕
            </button>

            {done ? (
              <div className="np__done">
                <span className="np__check">✓</span>
                <h2 id="np-title">Thank you for joining our community! 🌿</h2>
                <p>Look out for our weekly wellness rituals in your inbox.</p>
              </div>
            ) : (
              <>
                <p className="eyebrow np__eyebrow">The Nazia List</p>
                <h2 id="np-title" className="np__title">
                  First dibs on every small batch.
                </h2>
                <p className="np__text">
                  Early access to new blends, slow-living rituals, and a little
                  something off your first order.
                </p>

                <form className="np__form" onSubmit={submit}>
                  <input
                    ref={inputRef}
                    type="email"
                    required
                    placeholder="Enter your email address"
                    aria-label="Email address"
                    value={email}
                    disabled={isSubmitting}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className="btn btn--terracotta" disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Joining list...' : 'Join the list'}</span>
                  </button>
                </form>
                {error && <p style={{ color: '#e57373', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>}

                <a
                  className="np__social"
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Nazia Botanics on Instagram, ${social.handle}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                </a>

                <button className="np__decline" onClick={() => close('dismissed')}>
                  Maybe later
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
