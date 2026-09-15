import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { deleteOrder, fetchAdminOrders, updateOrderStatus } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { formatDateTime, formatNaira } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import {
  Badge,
  EmptyState,
  ErrorState,
  Pagination,
  Panel,
  Spinner,
  TableWrap,
} from '@/components/admin/ui'

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function Orders() {
  const fetcher = useCallback((params, signal) => fetchAdminOrders(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })
  const toast = useToast()

  const changeStatus = async (order, next) => {
    try {
      await updateOrderStatus(order.reference, next)
      toast.success(`${order.reference} marked ${next}.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (order) => {
    if (!window.confirm(`Delete order ${order.reference}? This cannot be undone.`)) return

    try {
      await deleteOrder(order.reference)
      toast.success('Order deleted.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Panel
      title="Orders"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Reference, name, phone or email"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading orders" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No orders here" hint="Try clearing the filters above." />
      ) : (
        <>
          <TableWrap head={['Reference', 'Customer', 'Items', 'Total', 'Placed', 'Status', '']}>
            {rows.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link className="link-arrow" to={`/admin/orders/${order.reference}`}>
                    {order.reference}
                  </Link>
                </td>
                <td>
                  {order.customer_name}
                  <br />
                  <span className="ad-field__hint">{order.customer_phone}</span>
                </td>
                <td className="ad-mono">{order.items_count}</td>
                <td className="ad-mono">{formatNaira(order.subtotal)}</td>
                <td>{formatDateTime(order.placed_at)}</td>
                <td>
                  <Badge status={order.status} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <select
                      value={order.status}
                      aria-label={`Status for ${order.reference}`}
                      onChange={(e) => changeStatus(order, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(order)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </TableWrap>
          <Pagination meta={meta} onPage={setPage} />
        </>
      )}
    </Panel>
  )
}
