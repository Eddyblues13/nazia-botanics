import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { createOrder, fetchDeliveryZones } from '@/lib/api'
import { useCart } from '@/context/cart-context'
import { useCustomerAuth } from '@/context/customer-auth-context'
import { formatNaira } from '@/lib/format'
import { useSeo } from '@/hooks/useSeo'

const EMPTY = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  delivery_address: '',
  delivery_state: '',
  note: '',
}

export default function Checkout() {
  useSeo({
    title: "Checkout",
    description: "Complete your order.",
    path: "/checkout",
    noindex: true,
  })

  const { cart, subtotal, isEmpty, orderItems, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const navigate = useNavigate()

  // A signed-in customer starts with their name and email already filled; the
  // draft takes over the moment they change anything.
  const [form, setForm] = useState(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [zones, setZones] = useState([])
  const [zonesFailed, setZonesFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    fetchDeliveryZones(controller.signal)
      .then((payload) => setZones(payload.data ?? []))
      .catch((err) => {
        if (err.name !== 'AbortError') setZonesFailed(true)
      })

    return () => controller.abort()
  }, [])

  // The fee shown is the zone's; the server charges from the same table, so
  // what is quoted here is what is taken.
  const zone = useMemo(
    () => zones.find((z) => z.state === form.delivery_state) ?? null,
    [zones, form.delivery_state]
  )
  const deliveryFee = zone?.fee ?? 0
  const total = subtotal + deliveryFee

  if (isEmpty) return <Navigate to="/cart" replace />

  const prefilled = {
    ...form,
    customer_name: form.customer_name || (customer?.name ?? ''),
    customer_email: form.customer_email || (customer?.email ?? ''),
  }

  const field = (name) => ({
    value: prefilled[name],
    disabled: isSubmitting,
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  })

  const submit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      const payload = await createOrder({ ...prefilled, items: orderItems })

      // The cart is only cleared once the order is safely recorded.
      clearCart()

      const authorizationUrl = payload.payment?.authorization_url

      if (authorizationUrl) {
        // Hand the customer to Paystack. `replace` so the back button returns
        // them to the shop rather than re-submitting the order.
        window.location.replace(authorizationUrl)
        return
      }

      // No payment URL came back; the order exists, so show it rather than
      // leaving them on a form that looks like it failed.
      navigate(`/order/${payload.data.reference}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.errors ?? {})
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <PageHero
        eyebrow="Checkout"
        title="Almost yours."
        lead="Tell us where it's going and we'll confirm your order personally."
      />

      <section className="section">
        <div className="container cart-layout">
          <Reveal className="form-card">
            <form onSubmit={submit}>
              <h3>Delivery details</h3>

              <label>
                Full name
                <input type="text" required placeholder="Your name" {...field('customer_name')} />
              </label>
              {fieldErrors.customer_name && (
                <p className="form-card__error">{fieldErrors.customer_name}</p>
              )}

              <label>
                Phone number
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  placeholder="080 0000 0000"
                  {...field('customer_phone')}
                />
              </label>
              {fieldErrors.customer_phone && (
                <p className="form-card__error">{fieldErrors.customer_phone}</p>
              )}

              <label>
                Email address
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  {...field('customer_email')}
                />
              </label>
              {fieldErrors.customer_email && (
                <p className="form-card__error">{fieldErrors.customer_email}</p>
              )}

              <label>
                Delivery address
                <textarea
                  required
                  rows={3}
                  placeholder="Street, area, city and state"
                  {...field('delivery_address')}
                />
              </label>
              {fieldErrors.delivery_address && (
                <p className="form-card__error">{fieldErrors.delivery_address}</p>
              )}

              <label>
                State
                <select required {...field('delivery_state')}>
                  <option value="">Choose your state</option>
                  {zones.map((z) => (
                    <option key={z.state} value={z.state}>
                      {z.state} — {formatNaira(z.fee)} · {z.delivery_period}
                    </option>
                  ))}
                </select>
              </label>
              {zonesFailed && (
                <p className="form-card__error">
                  We could not load delivery areas. Please refresh and try again.
                </p>
              )}
              {fieldErrors.delivery_state && (
                <p className="form-card__error">{fieldErrors.delivery_state}</p>
              )}

              <label>
                Anything we should know? <span className="form-card__optional">(optional)</span>
                <textarea rows={2} placeholder="Landmark, delivery window…" {...field('note')} />
              </label>

              <button type="submit" className="btn btn--terracotta" disabled={isSubmitting}>
                <span>
                  {isSubmitting ? 'Taking you to Paystack…' : `Pay ${formatNaira(total)}`}
                </span>
              </button>

              {error && (
                <p className="form-card__error" role="alert">
                  {error}
                </p>
              )}
            </form>
          </Reveal>

          <Reveal className="cart-summary" delay={0.1}>
            <h3>Your ritual</h3>
            {cart.map((line) => (
              <div className="cart-summary__row" key={line.key}>
                <span>
                  {line.name} · {line.size} × {line.qty}
                </span>
                <strong>{formatNaira(line.price * line.qty)}</strong>
              </div>
            ))}
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <strong>{formatNaira(subtotal)}</strong>
            </div>
            <div className="cart-summary__row">
              <span>Delivery{zone ? ` · ${zone.state}` : ''}</span>
              <strong>{zone ? formatNaira(deliveryFee) : '—'}</strong>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <strong>{formatNaira(total)}</strong>
            </div>
            <p className="cart-summary__note">
              {zone
                ? `Arrives in ${zone.delivery_period}.`
                : 'Choose your state to see delivery.'}
            </p>
            <Link to="/cart" className="link-arrow cart-summary__back">
              ← Back to cart
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
