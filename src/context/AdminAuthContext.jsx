import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  adminLogin,
  adminLogout,
  adminMe,
  clearToken,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from '@/lib/adminApi'
import { AdminAuthContext } from './admin-auth-context'

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  // "checking" until the stored token has been validated against the server.
  const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'guest'))

  const signOutLocally = useCallback(() => {
    clearToken()
    setAdmin(null)
    setStatus('guest')
  }, [])

  // Any 401 from the admin API tears the session down, wherever it fires.
  useEffect(() => {
    setUnauthorizedHandler(signOutLocally)
    return () => setUnauthorizedHandler(null)
  }, [signOutLocally])

  useEffect(() => {
    if (!getToken()) return

    const controller = new AbortController()

    adminMe(controller.signal)
      .then((payload) => {
        setAdmin(payload.data)
        setStatus('authenticated')
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        signOutLocally()
      })

    return () => controller.abort()
  }, [signOutLocally])

  const login = useCallback(async (credentials) => {
    const payload = await adminLogin(credentials)
    setToken(payload.token)
    setAdmin(payload.admin)
    setStatus('authenticated')
    return payload.admin
  }, [])

  const logout = useCallback(async () => {
    try {
      await adminLogout()
    } catch {
      // Revoking server-side is best effort — the local session goes either way.
    }
    signOutLocally()
  }, [signOutLocally])

  const value = useMemo(
    () => ({
      admin,
      status,
      isOwner: admin?.role === 'owner',
      checking: status === 'checking',
      authenticated: status === 'authenticated',
      login,
      logout,
      setAdmin,
    }),
    [admin, status, login, logout]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
