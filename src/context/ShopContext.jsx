import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '@/lib/api'
import { product as fallbackProduct } from '@/data'
import { ShopContext } from './shop-context'

/**
 * The catalog is one ritual oil, so it is fetched once and held in memory —
 * the spotlight, the shop page and the cart all read it from here.
 *
 * If the API cannot be reached the bundled copy of the product is used, so the
 * storefront still renders something to buy rather than an empty page.
 */
export function ShopProvider({ children }) {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setStatus('loading')
    setError(null)
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    fetchProducts(controller.signal)
      .then((payload) => {
        if (!active) return
        setProducts(payload?.data ?? [])
        setStatus('ready')
      })
      .catch((err) => {
        if (!active || err?.name === 'AbortError') return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [attempt])

  const value = useMemo(() => {
    const live = products[0] ?? null

    return {
      products,
      // Never null: the bundled product stands in until the fetch lands.
      product: live ?? { id: 'botanical-growth-oil', ...fallbackProduct },
      isFallback: live === null,
      status,
      error,
      loading: status === 'loading',
      reload,
      getProduct: (id) => products.find((p) => p.id === id) ?? null,
    }
  }, [products, status, error, reload])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
