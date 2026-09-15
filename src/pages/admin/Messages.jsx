import { useCallback } from 'react'
import { deleteMessage, fetchMessages, toggleMessageHandled } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { formatDateTime } from '@/lib/format'
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

export default function Messages() {
  const fetcher = useCallback((params, signal) => fetchMessages(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })
  const toast = useToast()

  const toggle = async (message) => {
    try {
      await toggleMessageHandled(message.id)
      toast.success(message.handled_at ? 'Marked unhandled.' : 'Marked handled.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (message) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return

    try {
      await deleteMessage(message.id)
      toast.success('Message deleted.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Panel
      title="Messages"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Name, email or message"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            <option value="unhandled">Needs a reply</option>
            <option value="handled">Handled</option>
          </select>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading messages" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No messages here" hint="The contact form is quiet." />
      ) : (
        <>
          <TableWrap head={['From', 'Message', 'Received', 'Status', '']}>
            {rows.map((message) => (
              <tr key={message.id}>
                <td>
                  {message.name}
                  <br />
                  <a className="ad-field__hint" href={`mailto:${message.email}`}>
                    {message.email}
                  </a>
                </td>
                <td style={{ maxWidth: '38ch', whiteSpace: 'pre-line' }}>{message.message}</td>
                <td>{formatDateTime(message.received_at)}</td>
                <td>
                  <Badge status={message.handled_at ? 'delivered' : 'pending'} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <a
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      href={`mailto:${message.email}?subject=Re:%20your%20message%20to%20Nazia%20Botanics`}
                    >
                      Reply
                    </a>
                    <button
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      onClick={() => toggle(message)}
                    >
                      {message.handled_at ? 'Reopen' : 'Mark handled'}
                    </button>
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(message)}
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
