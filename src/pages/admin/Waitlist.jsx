import { useCallback, useState } from 'react'
import {
  deleteWaitlistSignup,
  exportWaitlist,
  fetchWaitlist,
  toggleWaitlistInvited,
} from '@/lib/adminApi'
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

export default function Waitlist() {
  const fetcher = useCallback((params, signal) => fetchWaitlist(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })
  const [isExporting, setIsExporting] = useState(false)
  const toast = useToast()

  const toggle = async (signup) => {
    try {
      await toggleWaitlistInvited(signup.id)
      toast.success(signup.invited_at ? 'Moved back to waiting.' : 'Marked as invited.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (signup) => {
    if (!window.confirm(`Remove ${signup.email} from the waitlist?`)) return

    try {
      await deleteWaitlistSignup(signup.id)
      toast.success('Signup removed.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const exportCsv = async () => {
    setIsExporting(true)
    try {
      await exportWaitlist()
      toast.success('Export downloaded.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Panel
      title={`Waitlist${meta ? ` · ${meta.waiting_count ?? 0} waiting` : ''}`}
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Email or phone"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            <option value="waiting">Still waiting</option>
            <option value="invited">Invited</option>
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
        <Spinner label="Loading the waitlist" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="Nobody here yet" hint="Signups from the /waitlist page land here." />
      ) : (
        <>
          <TableWrap head={['Email', 'Phone', 'Joined', 'Status', '']}>
            {rows.map((signup) => (
              <tr key={signup.id}>
                <td>
                  <a className="link-arrow" href={`mailto:${signup.email}`}>
                    {signup.email}
                  </a>
                </td>
                <td>{signup.phone ?? '—'}</td>
                <td>{formatDateTime(signup.joined_at)}</td>
                <td>
                  <Badge status={signup.invited_at ? 'delivered' : 'pending'} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <button
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      onClick={() => toggle(signup)}
                    >
                      {signup.invited_at ? 'Mark waiting' : 'Mark invited'}
                    </button>
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(signup)}
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
