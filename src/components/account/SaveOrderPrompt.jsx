import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { claimOrder } from '@/lib/api'
import { useCustomerAuth } from '@/context/customer-auth-context'

/**
 * Shown on an order page, to connect that order to an account.
 *
 * Checkout never asks anyone to register, so this is the moment it is worth
 * offering: the customer is looking at the order they just placed and already
 * has the one thing needed to claim it. Signed out, it points at sign-up and
 * remembers where to come back to.
 *
 * It only appears where it can actually work — an order already on an account
 * has nothing to offer, and one placed with a different email would only fail.
 */
export default function SaveOrderPrompt({ order }) {
  const { customer, isSignedIn } = useCustomerAuth()
  const location = useLocation()

  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  if (!order || saved) {
    return saved ? (
      <p className="order-claim order-claim--done">
        Saved to your account. <Link to="/account">See all your orders</Link>.
      </p>
    ) : null
  }

  if (!isSignedIn) {
    return (
      <div className="order-claim">
        <p>
          <strong>Keep this order in one place.</strong> Create an account and it will be
          waiting here whenever you want to check on it.
        </p>
        <div className="order-claim__actions">
          <Link
            to="/sign-up"
            state={{ from: location.pathname }}
            className="btn btn--ghost btn--sm"
          >
            <span>Create an account</span>
          </Link>
          <Link to="/sign-in" state={{ from: location.pathname }} className="link-arrow">
            or sign in
          </Link>
        </div>
      </div>
    )
  }

  // Claiming needs the account's email to match the one on the order, so there
  // is no point offering it when it cannot succeed.
  const sameEmail =
    order.customer_email && customer?.email &&
    order.customer_email.toLowerCase() === customer.email.toLowerCase()

  if (!sameEmail) return null

  const save = async () => {
    if (isSaving) return

    setIsSaving(true)
    setError('')

    try {
      await claimOrder(order.reference)
      setSaved(true)
    } catch (err) {
      setError(err.errors?.reference ?? err.message)
      setIsSaving(false)
    }
  }

  return (
    <div className="order-claim">
      <p>
        <strong>Save this order to your account</strong> so you can find it again without the
        reference.
      </p>
      <div className="order-claim__actions">
        <button className="btn btn--ghost btn--sm" onClick={save} disabled={isSaving}>
          <span>{isSaving ? 'Saving…' : 'Save to my account'}</span>
        </button>
      </div>
      {error && (
        <p className="form-card__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
