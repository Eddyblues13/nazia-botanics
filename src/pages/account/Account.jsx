import { useState } from 'react'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'

export default function Account() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!email) return
    setSent(true)
  }

  return (
    <main className="page">
      <PageHero
        eyebrow="My Account"
        title="Welcome back to the ritual."
        lead="Sign in to track your orders and manage your ritual reminders."
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          <Reveal className="form-card">
            {sent ? (
              <div className="form-card__done">
                <span className="form-card__check">✓</span>
                <h3>Check your inbox</h3>
                <p>
                  We've sent a sign-in link to your email. It expires in 15
                  minutes — no passwords to remember.
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3>Sign in with email</h3>
                <p className="form-card__hint">
                  We'll send you a secure one-time link — no password needed.
                </p>
                <label>
                  Email address
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button type="submit" className="btn"><span>Send sign-in link</span></button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </main>
  )
}
