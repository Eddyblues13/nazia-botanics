import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/home/Home'
import Shop from '@/pages/shop/Shop'
import Cart from '@/pages/cart/Cart'
import Checkout from '@/pages/checkout/Checkout'
import OrderStatus from '@/pages/order/OrderStatus'
import Journal from '@/pages/journal/Journal'
import Article from '@/pages/journal/Article'
import OurStory from '@/pages/our-story/OurStory'
import Account from '@/pages/account/Account'
import Contact from '@/pages/contact/Contact'
import Waitlist from '@/pages/waitlist/Waitlist'
import Privacy from '@/pages/legal/Privacy'
import Terms from '@/pages/legal/Terms'
import NotFound from '@/pages/NotFound'
import RequireAdmin from '@/components/admin/RequireAdmin'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminLogin from '@/pages/admin/Login'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminOrders from '@/pages/admin/Orders'
import AdminOrderDetail from '@/pages/admin/OrderDetail'
import AdminProducts from '@/pages/admin/Products'
import AdminProductForm from '@/pages/admin/ProductForm'
import AdminJournal from '@/pages/admin/Journal'
import AdminArticleForm from '@/pages/admin/ArticleForm'
import AdminMessages from '@/pages/admin/Messages'
import AdminReviews from '@/pages/admin/Reviews'
import AdminWaitlist from '@/pages/admin/Waitlist'
import AdminSubscribers from '@/pages/admin/Subscribers'
import AdminTeam from '@/pages/admin/Team'
import AdminAccount from '@/pages/admin/Account'
import '@/styles/App.css'
import '@/styles/admin.css'

export default function App() {
  return (
    <Routes>
      {/* Standalone: no header, footer or newsletter popup. */}
      <Route path="waitlist" element={<Waitlist />} />

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:reference" element={<OrderStatus />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:id" element={<Article />} />
        <Route path="our-story" element={<OurStory />} />
        <Route path="account" element={<Account />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* The dashboard deliberately renders none of the storefront chrome. */}
      <Route path="admin/login" element={<AdminLogin />} />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:slug/edit" element={<AdminProductForm />} />
        <Route path="journal" element={<AdminJournal />} />
        <Route path="journal/new" element={<AdminArticleForm />} />
        <Route path="journal/:slug/edit" element={<AdminArticleForm />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="waitlist" element={<AdminWaitlist />} />
        <Route path="subscribers" element={<AdminSubscribers />} />
        <Route
          path="team"
          element={
            <RequireAdmin ownerOnly>
              <AdminTeam />
            </RequireAdmin>
          }
        />
        <Route path="account" element={<AdminAccount />} />
      </Route>
    </Routes>
  )
}
