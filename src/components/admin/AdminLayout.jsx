import { useCallback, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@/context/admin-auth-context'
import { fetchDashboard } from '@/lib/adminApi'
import { useAsyncData } from '@/hooks/useAsyncData'
import { ToastProvider } from './ToastProvider'
import {
  IconClose,
  IconDashboard,
  IconJournal,
  IconList,
  IconLogout,
  IconTruck,
  IconMail,
  IconMenu,
  IconOrders,
  IconProduct,
  IconStar,
  IconStore,
  IconUserCog,
  IconUsers,
} from './icons'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: IconOrders, badge: 'orders_pending' },
  { to: '/admin/products', label: 'Products', icon: IconProduct },
  { to: '/admin/journal', label: 'Journal', icon: IconJournal },
  { to: '/admin/messages', label: 'Messages', icon: IconMail, badge: 'messages_unhandled' },
  { to: '/admin/reviews', label: 'Reviews', icon: IconStar, badge: 'reviews_pending' },
  { to: '/admin/waitlist', label: 'Waitlist', icon: IconList, badge: 'waitlist_waiting' },
  { to: '/admin/subscribers', label: 'Subscribers', icon: IconMail },
  { to: '/admin/delivery', label: 'Delivery', icon: IconTruck },
  { to: '/admin/team', label: 'Team', icon: IconUsers, ownerOnly: true },
  { to: '/admin/account', label: 'Account', icon: IconUserCog },
]

export default function AdminLayout() {
  const { admin, isOwner, logout } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  // The sidebar badges come from the same summary the dashboard renders, so
  // the counts a manager sees in the nav match the page they land on.
  const fetcher = useCallback((signal) => fetchDashboard(signal), [])
  const { data } = useAsyncData(fetcher)
  const counts = data?.data ?? {}

  const links = NAV.filter((link) => !link.ownerOnly || isOwner)

  const signOut = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <ToastProvider>
      <div className="ad">
        {open && (
          <button className="ad__backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
        )}

        <aside className={`ad__sidebar ${open ? 'ad__sidebar--open' : ''}`}>
          <div className="ad__brand">
            <Link to="/admin" onClick={() => setOpen(false)}>
              Nazia <em>Admin</em>
            </Link>
            <button className="ad__close" onClick={() => setOpen(false)} aria-label="Close menu">
              <IconClose />
            </button>
          </div>

          <nav className="ad__nav">
            {links.map((link) => {
              const count = link.badge ? counts[link.badge] : 0

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `ad__link ${isActive ? 'ad__link--active' : ''}`}
                >
                  <link.icon />
                  {link.label}
                  {count > 0 && <span className="ad__link-badge">{count}</span>}
                </NavLink>
              )
            })}
          </nav>

          <div className="ad__foot">
            <div className="ad__who">
              <strong>{admin?.name}</strong>
              <span>{admin?.role}</span>
            </div>
            <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={signOut}>
              <IconLogout width={15} height={15} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="ad__main">
          <header className="ad__topbar">
            <button className="ad__burger" onClick={() => setOpen(true)} aria-label="Open menu">
              <IconMenu />
            </button>
            <h1>Nazia Botanics</h1>
            <div className="ad__topbar-actions">
              <Link to="/" className="ad-btn ad-btn--ghost ad-btn--sm">
                <IconStore width={15} height={15} />
                View store
              </Link>
            </div>
          </header>

          <main className="ad__content">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
