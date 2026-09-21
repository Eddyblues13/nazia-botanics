import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import App from './App.jsx'
import ScrollToTop from '@/components/common/ScrollToTop'
import { CartProvider } from '@/context/CartContext'
import { ShopProvider } from '@/context/ShopContext'
import { JournalProvider } from '@/context/JournalContext'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { CustomerAuthProvider } from '@/context/CustomerAuthProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <CustomerAuthProvider>
          <ShopProvider>
            <JournalProvider>
              <CartProvider>
                <ScrollToTop />
                <App />
              </CartProvider>
            </JournalProvider>
          </ShopProvider>
        </CustomerAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
