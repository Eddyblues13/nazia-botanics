import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { deleteArticle, fetchAdminArticles, toggleArticle } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { formatDate } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { IconPlus } from '@/components/admin/icons'
import {
  Badge,
  EmptyState,
  ErrorState,
  Pagination,
  Panel,
  Spinner,
  TableWrap,
} from '@/components/admin/ui'

export default function Journal() {
  const fetcher = useCallback((params, signal) => fetchAdminArticles(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })
  const toast = useToast()

  const toggle = async (article) => {
    try {
      await toggleArticle(article.slug)
      toast.success(`${article.title} is now ${article.is_published ? 'a draft' : 'published'}.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (article) => {
    if (!window.confirm(`Delete "${article.title}"?`)) return

    try {
      await deleteArticle(article.slug)
      toast.success('Article deleted.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Panel
      title="Journal"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Title, slug or tag"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <Link to="/admin/journal/new" className="ad-btn ad-btn--sm">
            <IconPlus width={15} height={15} />
            New article
          </Link>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading the journal" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No articles yet"
          hint="Write the first one and it appears in the journal."
          action={
            <Link to="/admin/journal/new" className="ad-btn ad-btn--sm">
              New article
            </Link>
          }
        />
      ) : (
        <>
          <TableWrap head={['Title', 'Tag', 'Read', 'Updated', 'Status', '']}>
            {rows.map((article) => (
              <tr key={article.id}>
                <td>
                  <Link className="link-arrow" to={`/admin/journal/${article.slug}/edit`}>
                    {article.title}
                  </Link>
                  <br />
                  <span className="ad-field__hint">/journal/{article.slug}</span>
                </td>
                <td>{article.tag}</td>
                <td className="ad-mono">{article.minutes} min</td>
                <td>{formatDate(article.updated_at)}</td>
                <td>
                  <Badge status={article.is_published ? 'published' : 'inactive'} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <button
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      onClick={() => toggle(article)}
                    >
                      {article.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(article)}
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
