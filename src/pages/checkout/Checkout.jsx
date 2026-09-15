import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { createOrder } from '@/lib/api'
import { useCart } from '@/context/cart-context'
import { formatNaira } from '@/lib/format'

const EMPTY = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  delivery_address: '',
  note: '',
}

export default function Checkout() {
  const { cart, subtotal, isEmpty, orderItems, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (isEmpty) return <Navigate to="/cart" replace />

  const field = (name) => ({
    value: form[name],
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
      const payload = await createOrder({ ...form, items: orderItems })
      // The cart is only cleared once the order is safely recorded.
      clearCart()
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
                Email address <span className="form-card__optional">(optional)</span>
                <input type="email" placeholder="you@example.com" {...field('customer_email')} />
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
                Anything we should know? <span className="form-card__optional">(optional)</span>
                <textarea rows={2} placeholder="Landmark, delivery window…" {...field('note')} />
              </label>

              <button type="submit" className="btn btn--terracotta" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Placing your order…' : 'Place order'}</span>
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
            <div className="cart-summary__row cart-summary__row--total">
              <span>Subtotal</span>
              <strong>{formatNaira(subtotal)}</strong>
            </div>
            <p className="cart-summary__note">
              We confirm delivery cost with you before anything ships.
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
