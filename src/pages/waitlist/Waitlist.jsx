import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { joinWaitlist } from '@/services/waitlistService'

export default function Waitlist() {
  const [form, setForm] = useState({ email: '', phone: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(true)
  const firstFieldRef = useRef(null)
  // Open on arrival; focusing then would raise the phone keyboard over the
  // write-up before it can be read. Only focus a modal the visitor reopened.
  const reopenedRef = useRef(false)

  const close = useCallback(() => setOpen(false), [])
  const reopen = useCallback(() => {
    reopenedRef.current = true
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    if (reopenedRef.current) firstFieldRef.current?.focus({ preventScroll: true })
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const { body } = document
    const prev = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prev
    }
  }, [open])

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
      {/* The write-up owns the screen; the form floats over it. */}
      <motion.div
        className="wl__intro"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="wl__eyebrow">The Waitlist</p>
        <h1 className="wl__title">Nourish your scalp, protect your ends.</h1>
        <p className="wl__lead">
          Be the first to access small-batch botanical haircare handcrafted with
          pure herbal infusion.
        </p>
      </motion.div>

      <AnimatePresence>
        {!open && (
          <motion.div
            className="wl__dock"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button className="wl__submit" onClick={reopen}>
              {done ? 'View confirmation' : 'Join the waitlist'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="wl__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="wl__veil" onClick={close} aria-hidden="true" />

            <motion.div
              className="wl__dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Join the waitlist"
              initial={{ y: 60, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            >
              <button className="wl__grab" onClick={close} aria-label="Close">
                <span />
              </button>

              {done ? (
                <div className="wl__done">
                  <span className="wl__check">✓</span>
                  <h2>You&apos;re on the list</h2>
                  <p>
                    Thank you. We&apos;ll reach out to <strong>{form.email}</strong>{' '}
                    as soon as the next batch is ready.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit}>
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
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
