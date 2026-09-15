import { useCallback } from 'react'
import { deleteReview, fetchAdminReviews, toggleReview } from '@/lib/adminApi'
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

export default function Reviews() {
  const fetcher = useCallback((params, signal) => fetchAdminReviews(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })
  const toast = useToast()

  const toggle = async (review) => {
    try {
      await toggleReview(review.id)
      toast.success(review.is_approved ? 'Hidden from the homepage.' : 'Now live on the homepage.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (review) => {
    if (!window.confirm(`Delete the review from ${review.name}?`)) return

    try {
      await deleteReview(review.id)
      toast.success('Review deleted.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Panel
      title="Reviews"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Name, location or text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            <option value="pending">Awaiting approval</option>
            <option value="approved">Published</option>
          </select>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading reviews" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="No reviews here" hint="Submissions appear for approval before going live." />
      ) : (
        <>
          <TableWrap head={['Reviewer', 'Rating', 'Review', 'Submitted', 'Status', '']}>
            {rows.map((review) => (
              <tr key={review.id}>
                <td>
                  {review.name}
                  <br />
                  <span className="ad-field__hint">{review.location ?? '—'}</span>
                </td>
                <td aria-label={`${review.rating} out of 5`}>{'★'.repeat(review.rating)}</td>
                <td style={{ maxWidth: '38ch' }}>{review.text}</td>
                <td>{formatDateTime(review.submitted_at)}</td>
                <td>
                  <Badge status={review.is_approved ? 'approved' : 'pending'} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <button
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      onClick={() => toggle(review)}
                    >
                      {review.is_approved ? 'Hide' : 'Approve'}
                    </button>
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(review)}
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
