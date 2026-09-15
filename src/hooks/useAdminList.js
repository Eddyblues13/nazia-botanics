import { useCallback, useMemo, useState } from 'react'
import { useAsyncData } from './useAsyncData'

/**
 * Filter + pagination state for the dashboard's table pages.
 *
 * `fetcher` takes (params, signal) — the admin API client's list functions
 * already have that shape, so a page passes one straight in. Changing any
 * filter resets to page one, since page 3 of the old result set is meaningless
 * against a new one.
 */
export function useAdminList(fetcher, initialFilters = {}) {
  const [filters, setFilters] = useState({ ...initialFilters, page: 1 })

  const params = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null)),
    [filters]
  )

  const load = useCallback((signal) => fetcher(params, signal), [fetcher, params])
  const query = useAsyncData(load)

  const setFilter = useCallback((name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }, [])

  const setPage = useCallback((page) => {
    setFilters((current) => ({ ...current, page }))
  }, [])

  return {
    ...query,
    rows: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    filters,
    setFilter,
    setPage,
  }
}
