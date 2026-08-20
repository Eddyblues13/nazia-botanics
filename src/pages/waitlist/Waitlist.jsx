import { useState } from 'react'
import { motion } from 'framer-motion'
import logo from '@/assets/logo.png'
import { social } from '@/data'
import { joinWaitlist } from '@/services/waitlistService'

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
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" aria-hidden="true">
    <path d="M12 21c0-6 .5-10 5-14-5 .3-9 2.6-9 8.5C8 18.2 9.6 20 12 21z" fill="currentColor" opacity="0.9" />
    <path d="M12 21C12 14 9 9 4 6c.8 6.5 2.8 11.4 8 15z" fill="currentColor" opacity="0.55" />
  </svg>
)

export default function Waitlist() {
  const [form, setForm] = useState({ email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <main className="wl">
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

      {/* Form half. */}
      <section className="wl__panel">
        <motion.div
          className="wl__card"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {done ? (
            <div className="wl__done">
              <span className="wl__check">✓</span>
              <h2>You&apos;re on the list</h2>
              <p>
                Thank you. We&apos;ll reach out to <strong>{form.email}</strong> as
                soon as the next batch is ready.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate={false}>
              <h2 className="wl__card-title">Save my place</h2>

              <label className="wl__field">
                <span className="wl__label">Email Address</span>
                <input
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
          )}
        </motion.div>
      </section>
    </main>
  )
}
