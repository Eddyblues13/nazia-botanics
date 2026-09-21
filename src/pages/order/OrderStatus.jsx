import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { fetchOrder, verifyPayment } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDateTime, formatNaira } from '@/lib/format'

const PAYMENT_COPY = {
  pending: 'Waiting for your payment to clear.',
  failed: 'That payment did not go through.',
  unpaid: 'This order has not been paid for.',
}

const STATUS_COPY = {
  pending: 'We have your order and will confirm it shortly.',
  confirmed: "Confirmed — we're preparing your bottles now.",
  shipped: 'On its way to you.',
  delivered: 'Delivered. Enjoy the ritual.',
  cancelled: 'This order was cancelled.',
}

export default function OrderStatus() {
  const { reference } = useParams()

  const fetcher = useCallback((signal) => fetchOrder(reference, signal), [reference])
  const { data, status, error, reload } = useAsyncData(fetcher)

  const [checking, setChecking] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [verified, setVerified] = useState(null)
  // Paystack sends the customer back here; without this the check would run
  // again on every re-render.
  const asked = useRef(false)

  const order = verified ?? data?.data

  useEffect(() => {
    if (asked.current || !order || order.payment_status === 'paid') return

    asked.current = true
    setChecking(true)

    verifyPayment(reference)
      .then((payload) => setVerified(payload.data))
      .catch((err) => {
        // A 402 means Paystack says it did not succeed, which is an answer,
        // not a failure to get one.
        setPaymentError(err.message)
        if (err.status === 402 && err.data?.data) setVerified(err.data.data)
      })
      .finally(() => setChecking(false))
  }, [order, reference])

  return (
    <main className="page">
      <PageHero
        eyebrow="Your Order"
        title={order ? `Thank you, ${order.customer_name.split(' ')[0]}.` : 'Your order'}
        lead={
          checking
            ? 'Confirming your payment…'
            : order
              ? order.payment_status === 'paid'
                ? STATUS_COPY[order.status]
                : (PAYMENT_COPY[order.payment_status] ?? STATUS_COPY[order.status])
              : 'Looking up your order…'
        }
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          {status === 'error' && (
            <Reveal className="form-card">
              <h3>We couldn&apos;t find that order</h3>
              <p className="form-card__hint">{error}</p>
              <button className="btn btn--ghost" onClick={reload}>
                <span>Try again</span>
              </button>
            </Reveal>
          )}

          {order && (
            <Reveal className="form-card order-card">
              <div className="order-card__head">
                <div>
                  <p className="eyebrow">Reference</p>
                  <h3>{order.reference}</h3>
                </div>
                <span
                  className={`status-pill status-pill--${
                    order.payment_status === 'paid' ? order.status : order.payment_status
                  }`}
                >
                  {order.payment_status === 'paid' ? order.status : order.payment_status}
                </span>
              </div>

              <p className="form-card__hint">
                Placed {formatDateTime(order.placed_at)}. Keep this reference — you can
                quote it any time you reach out.
              </p>

              <div className="order-card__lines">
                {order.items?.map((item, i) => (
                  <div className="cart-summary__row" key={i}>
                    <span>
                      {item.name} · {item.size} × {item.qty}
                    </span>
                    <strong>{formatNaira(item.line_total)}</strong>
                  </div>
                ))}
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <strong>{formatNaira(order.subtotal)}</strong>
                </div>
                <div className="cart-summary__row">
                  <span>Delivery{order.delivery_state ? ` · ${order.delivery_state}` : ''}</span>
                  <strong>{formatNaira(order.delivery_fee)}</strong>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>{order.payment_status === 'paid' ? 'Paid' : 'Total'}</span>
                  <strong>{formatNaira(order.total)}</strong>
                </div>
              </div>

              {order.payment_status !== 'paid' && (
                <p className="form-card__error" role="alert">
                  {paymentError || PAYMENT_COPY[order.payment_status]}
                </p>
              )}

              <div className="order-card__delivery">
                <p className="eyebrow">Delivering to</p>
                <p>{order.delivery_address}</p>
                <p className="form-card__hint">{order.customer_phone}</p>
                {order.delivery_period && (
                  <p className="form-card__hint">Arrives in {order.delivery_period}.</p>
                )}
              </div>

              <Link to="/shop" className="btn btn--ghost"><span>Back to the shop</span></Link>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  )
}
