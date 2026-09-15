import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, fetchAdminProducts, toggleProduct } from '@/lib/adminApi'
import { useAdminList } from '@/hooks/useAdminList'
import { formatNaira } from '@/lib/format'
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

export default function Products() {
  const fetcher = useCallback((params, signal) => fetchAdminProducts(params, signal), [])
  const { rows, meta, status, error, reload, filters, setFilter, setPage } = useAdminList(fetcher, {
    search: '',
    status: '',
  })
  const toast = useToast()

  const toggle = async (product) => {
    try {
      await toggleProduct(product.slug)
      toast.success(`${product.name} is now ${product.is_active ? 'hidden' : 'live'}.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return

    try {
      const payload = await deleteProduct(product.slug)
      toast.success(payload.message)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Panel
      title="Products"
      action={
        <div className="ad-toolbar">
          <div className="ad-toolbar__search">
            <input
              type="search"
              placeholder="Name, slug or tagline"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            <option value="active">Live</option>
            <option value="inactive">Hidden</option>
          </select>
          <Link to="/admin/products/new" className="ad-btn ad-btn--sm">
            <IconPlus width={15} height={15} />
            New product
          </Link>
        </div>
      }
      bodyFlush
    >
      {status === 'loading' && !rows.length ? (
        <Spinner label="Loading products" />
      ) : status === 'error' ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No products yet"
          hint="Add the first oil and it appears on the storefront straight away."
          action={
            <Link to="/admin/products/new" className="ad-btn ad-btn--sm">
              New product
            </Link>
          }
        />
      ) : (
        <>
          <TableWrap head={['Name', 'Sizes', 'From', 'Sold', 'Status', '']}>
            {rows.map((product) => (
              <tr key={product.id}>
                <td>
                  <Link className="link-arrow" to={`/admin/products/${product.slug}/edit`}>
                    {product.name}
                  </Link>
                  <br />
                  <span className="ad-field__hint">{product.tagline}</span>
                </td>
                <td>{product.sizes.map((s) => s.label).join(', ')}</td>
                <td className="ad-mono">{formatNaira(product.price_from)}</td>
                <td className="ad-mono">{product.units_sold}</td>
                <td>
                  <Badge status={product.is_active ? 'active' : 'inactive'} />
                </td>
                <td>
                  <div className="ad-table__actions">
                    <button
                      className="ad-btn ad-btn--ghost ad-btn--sm"
                      onClick={() => toggle(product)}
                    >
                      {product.is_active ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      className="ad-btn ad-btn--danger ad-btn--sm"
                      onClick={() => remove(product)}
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
