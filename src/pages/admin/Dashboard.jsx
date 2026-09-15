import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { formatDateTime, formatNaira } from '@/lib/format'
import {
  Badge,
  EmptyState,
  ErrorState,
  Panel,
  Spinner,
  StatCard,
  TableWrap,
} from '@/components/admin/ui'

/**
 * Profit is only as trustworthy as the share of revenue that has a cost behind
 * it, so the hint always states that coverage rather than presenting a margin
 * built on a handful of costed lines as the whole story.
 */
function profitHint(stats) {
  if (stats.profit_coverage === 0 || stats.profit_coverage === null) {
    return 'Add a cost to your sizes to track profit'
  }
  const margin = `${stats.profit_margin}% margin`
  return stats.profit_coverage >= 99.5
    ? `${margin} · cost of ${formatNaira(stats.cost_total)}`
    : `${margin} · based on ${stats.profit_coverage}% of revenue`
}

export default function Dashboard() {
  const fetcher = useCallback((signal) => fetchDashboard(signal), [])
  const { data, status, error, reload } = useAsyncData(fetcher)

  if (status === 'loading' && !data) return <Spinner label="Loading your dashboard" />
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />

  const stats = data.data

  const revenueHint =
    stats.revenue_change === null
      ? 'No figure to compare against yet'
      : `${stats.revenue_change > 0 ? '+' : ''}${stats.revenue_change}% vs last month`

  return (
    <>
      <div className="ad-stats">
        <StatCard
          label="Revenue this month"
          value={formatNaira(stats.revenue_this_month)}
          hint={revenueHint}
          trend={stats.revenue_change}
        />
        <StatCard
          label="Revenue all time"
          value={formatNaira(stats.revenue_total)}
          hint={`${stats.orders_total} orders placed`}
        />
        <StatCard
          label="Profit"
          value={stats.profit_coverage === 0 || stats.profit_coverage === null
            ? '—'
            : formatNaira(stats.profit_total)}
          hint={profitHint(stats)}
        />
        <StatCard
          label="Awaiting confirmation"
          value={stats.orders_pending}
          hint={`${stats.orders_this_month} orders this month`}
        />
        <StatCard
          label="On the waitlist"
          value={stats.waitlist_total}
          hint={`${stats.waitlist_waiting} still to invite`}
        />
        <StatCard
          label="Newsletter"
          value={stats.subscribers_total}
          hint="Active subscribers"
        />
        <StatCard
          label="Needs your attention"
          value={stats.messages_unhandled + stats.reviews_pending}
          hint={`${stats.messages_unhandled} messages · ${stats.reviews_pending} reviews`}
        />
      </div>

      <div className="ad-grid-2">
        <Panel
          title="Recent orders"
          action={
            <Link to="/admin/orders" className="ad-btn ad-btn--ghost ad-btn--sm">
              View all
            </Link>
          }
          bodyFlush
        >
          {stats.recent_orders.length === 0 ? (
            <EmptyState title="No orders yet" hint="They'll appear here the moment one lands." />
          ) : (
            <TableWrap head={['Reference', 'Customer', 'Total', 'Status']}>
              {stats.recent_orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link className="link-arrow" to={`/admin/orders/${order.id}`}>
                      {order.reference}
                    </Link>
                  </td>
                  <td>{order.customer_name}</td>
                  <td className="ad-mono">{formatNaira(order.subtotal)}</td>
                  <td>
                    <Badge status={order.status} />
                  </td>
                </tr>
              ))}
            </TableWrap>
          )}
        </Panel>

        <Panel title="Best sellers" bodyFlush>
          {stats.best_sellers.length === 0 ? (
            <EmptyState title="Nothing sold yet" hint="Sales by size will show up here." />
          ) : (
            <TableWrap head={['Product', 'Size', 'Units', 'Revenue']}>
              {stats.best_sellers.map((row) => (
                <tr key={`${row.slug}-${row.size}`}>
                  <td>{row.name}</td>
                  <td>{row.size}</td>
                  <td className="ad-mono">{row.units_sold}</td>
                  <td className="ad-mono">{formatNaira(row.revenue)}</td>
                </tr>
              ))}
            </TableWrap>
          )}
        </Panel>
      </div>

      <div className="ad-grid-2">
        <Panel
          title="Latest messages"
          action={
            <Link to="/admin/messages" className="ad-btn ad-btn--ghost ad-btn--sm">
              View all
            </Link>
          }
          bodyFlush
        >
          {stats.recent_messages.length === 0 ? (
            <EmptyState title="No messages" hint="The contact form is quiet." />
          ) : (
            <TableWrap head={['From', 'Message', 'Received']}>
              {stats.recent_messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.name}</td>
                  <td>{message.message.slice(0, 60)}…</td>
                  <td>{formatDateTime(message.received_at)}</td>
                </tr>
              ))}
            </TableWrap>
          )}
        </Panel>

        <Panel
          title="Newest waitlist signups"
          action={
            <Link to="/admin/waitlist" className="ad-btn ad-btn--ghost ad-btn--sm">
              View all
            </Link>
          }
          bodyFlush
        >
          {stats.recent_signups.length === 0 ? (
            <EmptyState title="Nobody waiting" hint="Signups from /waitlist land here." />
          ) : (
            <TableWrap head={['Email', 'Phone', 'Joined']}>
              {stats.recent_signups.map((signup) => (
                <tr key={signup.id}>
                  <td>{signup.email}</td>
                  <td>{signup.phone ?? '—'}</td>
                  <td>{formatDateTime(signup.joined_at)}</td>
                </tr>
              ))}
            </TableWrap>
          )}
        </Panel>
      </div>
    </>
  )
}
