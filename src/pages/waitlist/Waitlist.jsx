import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import logo from '@/assets/logo.png'
import { social } from '@/data'
import { joinWaitlist } from '@/services/waitlistService'

const PHONE_QUERY = '(max-width: 899px)'

const fade = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.12 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
}

/* Drawn from the page copy — edit freely, nothing here is load-bearing. */
const PERKS = [
  'First access to every small batch',
  'Handcrafted with pure herbal infusion',
  'Launch news only — no daily mail',
]

const Leaf = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path
      d="M19 5c0 8-4.6 12-9.2 12A4.8 4.8 0 0 1 5 12.2C5 7.6 9.9 5 19 5Z"
      fill="currentColor"
    />
    <path
      d="M17 7 7.5 16.5"
      stroke="var(--ink)"
      strokeWidth="1.3"
      strokeLinecap="round"
      opacity="0.55"
    />
  </svg>
)

/* Phones get the form as a sheet; desktop keeps it inline beside the pitch. */
function usePhoneViewport() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY)
    const onChange = (e) => setIsPhone(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isPhone
}

export default function Waitlist() {
  const [form, setForm] = useState({ email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const isPhone = usePhoneViewport()
  const [sheetOpen, setSheetOpen] = useState(true)
  const sheetRef = useRef(null)
  const firstFieldRef = useRef(null)
  // The sheet is open on arrival; focusing then would throw up the keyboard
  // before anyone has read the pitch. Only focus a sheet the visitor reopened.
  const reopenedRef = useRef(false)

  const closeSheet = useCallback(() => setSheetOpen(false), [])
  const openSheet = useCallback(() => {
    reopenedRef.current = true
    setSheetOpen(true)
  }, [])

  // Escape closes the sheet.
  useEffect(() => {
    if (!isPhone || !sheetOpen) return
    if (reopenedRef.current) firstFieldRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeSheet()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isPhone, sheetOpen, closeSheet])

  // Lock the page behind the sheet so the pitch doesn't scroll under it.
  useEffect(() => {
    if (!isPhone || !sheetOpen) return
    const { body } = document
    const prev = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prev
    }
  }, [isPhone, sheetOpen])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.phone || isSubmitting) return
    setIsSubmitting(true)
    setError('')
    try {
      const res = await joinWaitlist({ email: form.email, phone: form.phone })
      if (res.success) {
        setDone(true)
      } else {
        setError(res.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // One form body, rendered either inline (desktop) or inside the sheet (phone).
  const formBody = done ? (
    <div className="wl__done">
      <span className="wl__check">✓</span>
      <h2>You&apos;re on the list</h2>
      <p>
        Thank you. We&apos;ll reach out to <strong>{form.email}</strong> as soon
        as the next batch is ready.
      </p>
    </div>
  ) : (
    <form onSubmit={submit}>
      <h2 className="wl__card-title">Save my place</h2>

      <label className="wl__field">
        <span className="wl__label">Email Address</span>
        <input
          ref={firstFieldRef}
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          value={form.email}
          disabled={isSubmitting}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>

      <label className="wl__field">
        <span className="wl__label">Phone Number</span>
        <input
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="Enter your phone number"
          value={form.phone}
          disabled={isSubmitting}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </label>

      <button type="submit" className="wl__submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving your place…' : 'Join the waitlist'}
      </button>

      {error && (
        <p className="wl__error" role="alert">
          {error}
        </p>
      )}

      <p className="wl__fineprint">
        We&apos;ll only use these to tell you when a batch drops.
      </p>
    </form>
  )

  return (
    <main className={`wl ${isPhone ? 'wl--phone' : ''}`}>
      {/* Editorial half — the pitch. */}
      <section className="wl__aside">
        <div className="wl__aside-inner">
          <motion.img
            className="wl__logo"
            src={logo}
            alt="Nazia Botanics"
            variants={fade}
            initial="hidden"
            animate="show"
            custom={0}
          />

          <motion.p className="wl__eyebrow" variants={fade} initial="hidden" animate="show" custom={1}>
            The Waitlist
          </motion.p>

          <motion.h1 className="wl__title" variants={fade} initial="hidden" animate="show" custom={2}>
            Nourish your scalp, protect your ends.
          </motion.h1>

          <motion.p className="wl__lead" variants={fade} initial="hidden" animate="show" custom={3}>
            Be the first to access small-batch botanical haircare handcrafted
            with pure herbal infusion.
          </motion.p>

          <motion.ul className="wl__perks" variants={fade} initial="hidden" animate="show" custom={4}>
            {PERKS.map((perk) => (
              <li key={perk}>
                <span className="wl__perk-icon"><Leaf /></span>
                {perk}
              </li>
            ))}
          </motion.ul>

          <motion.a
            className="wl__social"
            href={social.instagram}
            target="_blank"
            rel="noreferrer"
            variants={fade}
            initial="hidden"
            animate="show"
            custom={5}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            {social.handle}
          </motion.a>
        </div>
      </section>

      {isPhone ? (
        <>
          {/* Reopen bar, shown once the sheet has been dismissed. */}
          <AnimatePresence>
            {!sheetOpen && (
              <motion.div
                className="wl__dock"
                initial={{ y: 90 }}
                animate={{ y: 0 }}
                exit={{ y: 90 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <button className="wl__submit" onClick={openSheet}>
                  {done ? 'View confirmation' : 'Join the waitlist'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                className="wl__modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28 }}
              >
                <div className="wl__backdrop" onClick={closeSheet} aria-hidden="true" />
                <motion.div
                  className="wl__sheet"
                  ref={sheetRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Join the waitlist"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
                >
                  <button className="wl__grab" onClick={closeSheet} aria-label="Close">
                    <span />
                  </button>
                  <div className="wl__sheet-body">{formBody}</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <section className="wl__panel">
          <motion.div
            className="wl__card"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {formBody}
          </motion.div>
        </section>
      )}
    </main>
  )
}
