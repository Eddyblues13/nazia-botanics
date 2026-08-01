import { useCallback, useRef, useState } from 'react'
import { CartContext } from './cart-context'

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const addToCart = useCallback((size) => {
    setCart((c) => [...c, size])
    setToast(`Added the ${size.label} Growth Oil to your ritual.`)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  return (
    <CartContext.Provider value={{ cart, addToCart, toast }}>
      {children}
    </CartContext.Provider>
  )
}
