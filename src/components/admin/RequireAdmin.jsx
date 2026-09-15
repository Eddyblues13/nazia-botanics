import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Spinner } from './ui'

/**
 * Holds the route while a stored token is being validated, so a refresh inside
 * the dashboard doesn't bounce through the login screen.
 */
export default function RequireAdmin({ children, ownerOnly = false }) {
  const { checking, authenticated, isOwner } = useAdminAuth()
  const location = useLocation()

  if (checking) {
    return (
      <div className="ad-login">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (ownerOnly && !isOwner) {
    return <Navigate to="/admin" replace />
  }

  return children
}
