import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/home/Home'
import Shop from '@/pages/shop/Shop'
import Journal from '@/pages/journal/Journal'
import Article from '@/pages/journal/Article'
import OurStory from '@/pages/our-story/OurStory'
import Account from '@/pages/account/Account'
import Contact from '@/pages/contact/Contact'
import Waitlist from '@/pages/waitlist/Waitlist'
import Privacy from '@/pages/legal/Privacy'
import Terms from '@/pages/legal/Terms'
import NotFound from '@/pages/NotFound'
import '@/styles/App.css'

export default function App() {
  return (
    <Routes>
      {/* Standalone: no header, footer or newsletter popup. */}
      <Route path="waitlist" element={<Waitlist />} />

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:id" element={<Article />} />
        <Route path="our-story" element={<OurStory />} />
        <Route path="account" element={<Account />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
