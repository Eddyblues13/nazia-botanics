import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { fetchOrder } from '@/lib/api'

/**
 * Orders are placed without an account — the reference on the confirmation is
 * what a customer tracks with, so this page looks one up rather than pretending
 * to sign anyone in.
 */
export default function Account() {
  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    const trimmed = reference.trim().toUpperCase()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      await fetchOrder(trimmed)
      navigate(`/order/${trimmed}`)
    } catch (err) {
      setError(
        err.status === 404
          ? "We couldn't find an order with that reference. Check it and try again."
          : err.message
      )
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <PageHero
        eyebrow="My Account"
        title="Track your ritual."
        lead="Enter the reference from your order confirmation to see where it is."
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          <Reveal className="form-card">
            <form onSubmit={submit}>
              <h3>Find my order</h3>
              <p className="form-card__hint">
                Your reference looks like <strong>NB-260915-AB12</strong> — it is on the
                confirmation we showed you at checkout.
              </p>
              <label>
                Order reference
                <input
                  type="text"
                  required
                  placeholder="NB-000000-0000"
                  value={reference}
                  disabled={isSubmitting}
                  onChange={(e) => setReference(e.target.value)}
                />
              </label>
              <button type="submit" className="btn" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Looking…' : 'Find my order'}</span>
              </button>
              {error && (
                <p className="form-card__error" role="alert">
                  {error}
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
