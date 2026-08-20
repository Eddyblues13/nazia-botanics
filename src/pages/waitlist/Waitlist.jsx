import { useState } from 'react'
import { motion } from 'framer-motion'
import { joinWaitlist } from '@/services/waitlistService'

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
      <motion.div
        className="wl__card"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {done ? (
          <div className="wl__done">
            <span className="wl__check">✓</span>
            <h1>You&apos;re on the list</h1>
            <p>
              Thank you. We&apos;ll reach out to <strong>{form.email}</strong> as
              soon as the next batch is ready.
            </p>
          </div>
        ) : (
          <>
            <h1 className="wl__title">Nourish your scalp, protect your ends.</h1>
            <p className="wl__lead">
              Be the first to access small-batch botanical haircare handcrafted
              with pure herbal infusion.
            </p>

            <form onSubmit={submit}>
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
            </form>
          </>
        )}
      </motion.div>
    </main>
  )
}
