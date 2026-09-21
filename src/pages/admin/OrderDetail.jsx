import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAdminOrder, updateOrderStatus } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDateTime, formatNaira } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, ErrorState, Panel, Spinner, TableWrap } from '@/components/admin/ui'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function OrderDetail() {
  const { id } = useParams()
  const fetcher = useCallback((signal) => fetchAdminOrder(id, signal), [id])
  const { data, status, error, reload, setData } = useAsyncData(fetcher)
  const toast = useToast()

  if (status === 'loading' && !data) return <Spinner label="Loading order" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const order = data.data

  const changeStatus = async (next) => {
    try {
      const payload = await updateOrderStatus(order.reference, next)
      setData(payload)
      toast.success(`Marked ${next}.`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      {/* Only rendered on paper — the screen already has the admin chrome. */}
      <div className="ad-receipt-head" aria-hidden="true">
        <h1>Nazia Botanics</h1>
        <p>Receipt · {order.reference}</p>
        <p>{formatDateTime(order.placed_at)}</p>
      </div>

      <Panel
        title={order.reference}
        action={
          <div className="ad-actions">
            <Badge status={order.status} />
            <select
              value={order.status}
              aria-label="Order status"
              onChange={(e) => changeStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ad-btn ad-btn--sm"
              onClick={() => window.print()}
            >
              Print receipt
            </button>
            <Link to="/admin/orders" className="ad-btn ad-btn--ghost ad-btn--sm">
              Back to orders
            </Link>
          </div>
        }
      >
        <dl className="ad-dl">
          <div>
            <dt>Customer</dt>
            <dd>{order.customer_name}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{order.customer_phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{order.customer_email ?? '—'}</dd>
          </div>
          <div>
            <dt>Placed</dt>
            <dd>{formatDateTime(order.placed_at)}</dd>
          </div>
          <div>
            <dt>Delivery address</dt>
            <dd>{order.delivery_address}</dd>
          </div>
          <div>
            <dt>Delivery area</dt>
            <dd>
              {order.delivery_state
                ? `${order.delivery_state} · ${formatNaira(order.delivery_fee)} · ${order.delivery_period}`
                : '—'}
            </dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>
              {order.payment_status === 'paid'
                ? `${formatNaira(order.amount_paid)} paid${
                    order.payment_channel ? ` by ${order.payment_channel}` : ''
                  } · ${formatDateTime(order.paid_at)}`
                : (order.payment_status ?? 'unpaid')}
            </dd>
          </div>
          <div>
            <dt>Paystack reference</dt>
            <dd className="ad-mono">{order.payment_reference ?? '—'}</dd>
          </div>
          <div>
            <dt>Note</dt>
            <dd>{order.note ?? '—'}</dd>
          </div>
        </dl>
      </Panel>

      {order.profit_total !== null && order.profit_total !== undefined && (
        <Panel title="Margin" className="ad-noprint">
          <dl className="ad-dl">
            <div>
              <dt>Cost of goods</dt>
              <dd className="ad-mono">{formatNaira(order.cost_total)}</dd>
            </div>
            <div>
              <dt>Profit</dt>
              <dd className="ad-mono">{formatNaira(order.profit_total)}</dd>
            </div>
            <div>
              <dt>Margin</dt>
              <dd className="ad-mono">
                {order.subtotal > 0
                  ? `${((order.profit_total / order.subtotal) * 100).toFixed(0)}%`
                  : '—'}
              </dd>
            </div>
            {!order.fully_costed && (
              <div>
                <dt>Note</dt>
                <dd>Some lines have no recorded cost, so this covers part of the order.</dd>
              </div>
            )}
          </dl>
        </Panel>
      )}

      <Panel title="Items" bodyFlush>
        <TableWrap head={['Product', 'Size', 'Qty', 'Unit', 'Line total']}>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.size}</td>
              <td className="ad-mono">{item.qty}</td>
              <td className="ad-mono">{formatNaira(item.unit_price)}</td>
              <td className="ad-mono">{formatNaira(item.line_total)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4}>Subtotal</td>
            <td className="ad-mono">{formatNaira(order.subtotal)}</td>
          </tr>
          <tr>
            <td colSpan={4}>Delivery</td>
            <td className="ad-mono">{formatNaira(order.delivery_fee ?? 0)}</td>
          </tr>
          <tr>
            <td colSpan={4}>
              <strong>{order.payment_status === 'paid' ? 'Paid' : 'Total'}</strong>
            </td>
            <td className="ad-mono">
              <strong>{formatNaira(order.total ?? order.subtotal)}</strong>
            </td>
          </tr>
        </TableWrap>
      </Panel>
    </>
  )
}
