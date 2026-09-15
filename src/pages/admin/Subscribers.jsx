import { useCallback, useState } from 'react'
import { deleteSubscriber, exportSubscribers, fetchSubscribers } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { formatDateTime } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { IconDownload } from '@/components/admin/icons'
import {
  Badge,
  EmptyState,
  ErrorState,
  Pagination,
  Panel,
  Spinner,
  TableWrap,
} from '@/components/admin/ui'

export default function Subscribers() {
  const fetcher = useCallback((params, signal) => fetchSubscribers(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    source: '',
  })
  const [isExporting, setIsExporting] = useState(false)
  const toast = useToast()

  const remove = async (subscriber) => {
    if (!window.confirm(`Remove ${subscriber.email} from the list?`)) return

    try {
      await deleteSubscriber(subscriber.id)
      toast.success('Subscriber removed.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const exportCsv = async () => {
    setIsExporting(true)
    try {
      await exportSubscribers()
      toast.success('Export downloaded.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Panel
      title={`Newsletter${meta ? ` · ${meta.subscribed_count ?? 0} active` : ''}`}
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Email"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.source} onChange={(e) => setFilter('source', e.target.value)}>
            <option value="">Every source</option>
            <option value="popup">Popup</option>
            <option value="footer">Footer</option>
            <option value="waitlist">Waitlist</option>
          </select>
          <button className="ad-btn ad-btn--sm" onClick={exportCsv} disabled={isExporting}>
            <IconDownload width={15} height={15} />
            {isExporting ? 'Building…' : 'Export CSV'}
          </button>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading subscribers" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No subscribers yet" hint="The popup and footer forms both feed this list." />
      ) : (
        <>
          <TableWrap head={['Email', 'Source', 'Subscribed', 'Status', '']}>
            {rows.map((subscriber) => (
              <tr key={subscriber.id}>
                <td>
                  <a className="link-arrow" href={`mailto:${subscriber.email}`}>
                    {subscriber.email}
                  </a>
                </td>
                <td>{subscriber.source}</td>
                <td>{formatDateTime(subscriber.subscribed_at)}</td>
                <td>
                  <Badge status={subscriber.unsubscribed_at ? 'cancelled' : 'active'} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(subscriber)}
                    >
                      Remove
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
