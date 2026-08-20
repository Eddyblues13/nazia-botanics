import { useState } from 'react'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { social } from '@/data'
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
    <main className="page">
      <PageHero
        eyebrow="The Waitlist"
        title="Nourish your scalp, protect your ends."
        lead="Be the first to access small-batch botanical haircare handcrafted with pure herbal infusion."
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          <Reveal className="form-card">
            {done ? (
              <div className="form-card__done">
                <span className="form-card__check">✓</span>
                <h3>You're on the list 🌿</h3>
                <p>
                  Thank you. We'll email {form.email} as soon as the next batch
                  is ready.
                </p>
                <p className="form-aside__note">
                  In the meantime, we share every step on{' '}
                  <a href={social.instagram} target="_blank" rel="noreferrer">
                    {social.handle}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label>
                  Email Address
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={form.email}
                    disabled={isSubmitting}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label>
                  Phone Number
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
                <button type="submit" className="btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Saving your place...' : 'Join the waitlist'}</span>
                </button>
                {error && (
                  <p className="form-card__error" role="alert">
                    {error}
                  </p>
                )}
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </main>
  )
}
