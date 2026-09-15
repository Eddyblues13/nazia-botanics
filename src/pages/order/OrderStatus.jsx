import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import { fetchOrder } from '@/lib/api'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDateTime, formatNaira } from '@/lib/format'

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

  const order = data?.data

  return (
    <main className="page">
      <PageHero
        eyebrow="Your Order"
        title={order ? `Thank you, ${order.customer_name.split(' ')[0]}.` : 'Your order'}
        lead={order ? STATUS_COPY[order.status] : 'Looking up your order…'}
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
                <span className={`status-pill status-pill--${order.status}`}>{order.status}</span>
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
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Subtotal</span>
                  <strong>{formatNaira(order.subtotal)}</strong>
                </div>
              </div>

              <div className="order-card__delivery">
                <p className="eyebrow">Delivering to</p>
                <p>{order.delivery_address}</p>
                <p className="form-card__hint">{order.customer_phone}</p>
              </div>

              <Link to="/shop" className="btn btn--ghost"><span>Back to the shop</span></Link>
            </Reveal>
          )}
        </div>
      </section>
    </main>
  )
}
