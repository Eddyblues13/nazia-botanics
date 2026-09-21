import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { claimOrder, fetchMyOrders, fetchOrder } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useCustomerAuth } from '@/context/customer-auth-context'
import { formatDateTime, formatNaira } from '@/lib/format'
import { useSeo } from '@/hooks/useSeo'

/**
 * Two ways in, on purpose.
 *
 * Signed in, this is a list of everything ordered on the account. Signed out,
 * it still looks an order up by its reference — checkout never required an
 * account, so a guest must not be locked out of tracking what they bought.
 */
function OrderList() {
  const fetcher = useCallback((signal) => fetchMyOrders(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)

  if (status === 'loading' && !data) {
    return <p className="form-card__hint">Looking up your orders…</p>
  }

  if (status === 'error') {
    return (
      <>
        <p className="form-card__error">{error}</p>
        <button className="btn btn--ghost" onClick={reload}>
          <span>Try again</span>
        </button>
      </>
    )
  }

  const orders = data?.data ?? []

  if (orders.length === 0) {
    return (
      <>
        <p className="form-card__hint">You haven&apos;t ordered anything yet.</p>
        <Link to="/shop" className="btn">
          <span>Visit the shop</span>
        </Link>
      </>
    )
  }

  return (
    <ul className="order-list">
      {orders.map((order) => (
        <li key={order.reference}>
          <Link to={`/order/${order.reference}`} className="order-list__row">
            <span className="order-list__ref">
              <strong>{order.reference}</strong>
              <span className="order-list__date">{formatDateTime(order.placed_at)}</span>
            </span>
            <span className="order-list__meta">
              <span className={`status-pill status-pill--${
                order.payment_status === 'paid' ? order.status : order.payment_status
              }`}>
                {order.payment_status === 'paid' ? order.status : order.payment_status}
              </span>
              <strong>{formatNaira(order.total ?? order.subtotal)}</strong>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Account() {
  useSeo({
    title: 'Your account',
    description: 'Track an order or see everything you have bought.',
    path: '/account',
    noindex: true,
  })

  const { customer, isSignedIn, signOut } = useCustomerAuth()

  const [reference, setReference] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [claimed, setClaimed] = useState('')
  // Bumped after a successful claim so the list above refetches.
  const [listKey, setListKey] = useState(0)
  const navigate = useNavigate()

  const claim = async (e) => {
    e.preventDefault()
    const trimmed = reference.trim().toUpperCase()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    setError('')
    setClaimed('')

    try {
      await claimOrder(trimmed)
      setReference('')
      setClaimed(`${trimmed} was added to your account.`)
      setListKey((n) => n + 1)
    } catch (err) {
      setError(err.errors?.reference ?? err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
        title={isSignedIn ? `Hello, ${customer.name.split(' ')[0]}.` : 'Track your ritual.'}
        lead={
          isSignedIn
            ? 'Everything you have ordered, and where each one has got to.'
            : 'Sign in to see your orders, or look one up with its reference.'
        }
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          {isSignedIn ? (
            <>
              <Reveal className="form-card">
                <h3>Your orders</h3>
                <OrderList key={listKey} />
              </Reveal>

              <Reveal className="form-card" delay={0.05}>
                <form onSubmit={claim}>
                  <h3>Add an earlier order</h3>
                  <p className="form-card__hint">
                    Ordered before you had an account? Enter the reference from that
                    confirmation and it will join the list above. It has to be an order
                    placed with <strong>{customer.email}</strong>.
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
                    <span>{isSubmitting ? 'Adding…' : 'Add to my account'}</span>
                  </button>
                  {error && (
                    <p className="form-card__error" role="alert">
                      {error}
                    </p>
                  )}
                  {claimed && <p className="form-card__hint">{claimed}</p>}
                </form>
              </Reveal>

              <Reveal className="form-card" delay={0.1}>
                <h3>Signed in as {customer.email}</h3>
                <p className="form-card__hint">
                  Orders you place while signed in are kept here automatically.
                </p>
                <button className="btn btn--ghost" onClick={signOut}>
                  <span>Sign out</span>
                </button>
              </Reveal>
            </>
          ) : (
            <>
              <Reveal className="form-card">
                <h3>Sign in</h3>
                <p className="form-card__hint">
                  Keep every order in one place, and skip retyping your details.
                </p>
                <div className="form-card__pair">
                  <Link to="/sign-in" className="btn">
                    <span>Sign in</span>
                  </Link>
                  <Link to="/sign-up" className="btn btn--ghost">
                    <span>Create an account</span>
                  </Link>
                </div>
              </Reveal>

              <Reveal className="form-card" delay={0.1}>
                <form onSubmit={submit}>
                  <h3>Or track an order</h3>
                  <p className="form-card__hint">
                    Your reference looks like <strong>NB-260915-AB12</strong> — it is on the
                    confirmation we showed you at checkout. No account needed.
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
            </>
          )}
        </div>
      </section>
    </main>
  )
}
