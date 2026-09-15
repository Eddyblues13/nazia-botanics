import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CartContext } from './cart-context'

const STORE_KEY = 'nb:cart'

/* localStorage throws in Safari private mode — never let that break the page. */
const readStored = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

/** One line per product + size, so picking the same size twice bumps the qty. */
const lineKey = (productId, size) => `${productId}::${size}`

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStored)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(cart))
    } catch {
      /* ignore — the cart just won't survive a refresh */
    }
  }, [cart])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const announce = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  /**
   * `size` is a { label, price } from the product, and `product` the item it
   * belongs to. The price is snapshotted for display only — the server prices
   * the order again from its own catalog when it is placed.
   */
  const addToCart = useCallback(
    (size, product) => {
      const productId = product?.id ?? 'botanical-growth-oil'
      const key = lineKey(productId, size.label)

      setCart((lines) => {
        const existing = lines.find((line) => line.key === key)

        if (existing) {
          return lines.map((line) =>
            line.key === key ? { ...line, qty: Math.min(line.qty + 1, 99) } : line
          )
        }

        return [
          ...lines,
          {
            key,
            productId,
            name: product?.name ?? 'Botanical Growth Oil',
            // Snapshotted so the cart shows a thumbnail without refetching the
            // catalog; the shop copy wins when it has since changed.
            image: product?.image ?? null,
            size: size.label,
            price: size.price,
            qty: 1,
          },
        ]
      })

      announce(`Added the ${size.label} ${product?.name ?? 'Growth Oil'} to your ritual.`)
    },
    [announce]
  )

  const setQty = useCallback((key, qty) => {
    setCart((lines) =>
      qty < 1
        ? lines.filter((line) => line.key !== key)
        : lines.map((line) => (line.key === key ? { ...line, qty: Math.min(qty, 99) } : line))
    )
  }, [])

  const removeLine = useCallback(
    (key) => {
      setCart((lines) => lines.filter((line) => line.key !== key))
      announce('Removed from your ritual.')
    },
    [announce]
  )

  const clearCart = useCallback(() => setCart([]), [])

  const value = useMemo(() => {
    const count = cart.reduce((sum, line) => sum + line.qty, 0)
    const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0)

    return {
      cart,
      count,
      subtotal,
      isEmpty: cart.length === 0,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toast,
      // What /api/orders expects — the server re-prices every line from here.
      orderItems: cart.map((line) => ({
        product_id: line.productId,
        size: line.size,
        qty: line.qty,
      })),
    }
  }, [cart, toast, addToCart, setQty, removeLine, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
