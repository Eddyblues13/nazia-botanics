import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'
import NewsletterPopup from '@/components/common/NewsletterPopup'
import { useCart } from '@/context/cart-context'

export default function Layout() {
  const { cart, toast } = useCart()

  return (
    <>
      <Header cartCount={cart.length} />
      <Outlet />
      <Footer />
      <NewsletterPopup />

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
