import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductSpotlight from './components/ProductSpotlight'
import WhySection from './components/WhySection'
import Reviews from './components/Reviews'
import Journal from './components/Journal'
import FounderBanner from './components/FounderBanner'
import Footer from './components/Footer'
import './App.css'

export default function App() {
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
    <>
      <Header cartCount={cart.length} />
      <main>
        <Hero />
        <ProductSpotlight onAdd={addToCart} />
        <WhySection />
        <Reviews />
        <Journal />
        <FounderBanner />
      </main>
      <Footer />

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="toast__check">✓</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
