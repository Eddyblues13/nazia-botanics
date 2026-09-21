import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearCustomerToken,
  fetchCustomer,
  getCustomerToken,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  setCustomerToken,
} from '@/lib/api'
import { CustomerAuthContext } from './customer-auth-context'

/**
 * The signed-in shopper, if there is one.
 *
 * Nothing on the storefront requires an account — the catalog, the cart and
 * checkout all work signed out — so a failure here never blocks the page. A
 * token that no longer works just means signed out.
 */
export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null)
  const [status, setStatus] = useState(getCustomerToken() ? 'loading' : 'guest')

  useEffect(() => {
    if (!getCustomerToken()) return

    const controller = new AbortController()

    fetchCustomer(controller.signal)
      .then((payload) => {
        setCustomer(payload.data)
        setStatus('signed-in')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        // Expired, revoked, or the account is gone.
        clearCustomerToken()
        setCustomer(null)
        setStatus('guest')
      })

    return () => controller.abort()
  }, [])

  const signIn = useCallback(async (credentials) => {
    const payload = await loginCustomer(credentials)
    setCustomerToken(payload.token)
    setCustomer(payload.user)
    setStatus('signed-in')
    return payload.user
  }, [])

  const signUp = useCallback(async (details) => {
    const payload = await registerCustomer(details)
    setCustomerToken(payload.token)
    setCustomer(payload.user)
    setStatus('signed-in')
    return payload.user
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logoutCustomer()
    } catch {
      // The token is being thrown away regardless; a failed call to revoke it
      // server-side must not leave someone stuck signed in.
    }
    clearCustomerToken()
    setCustomer(null)
    setStatus('guest')
  }, [])

  const value = useMemo(
    () => ({ customer, status, isSignedIn: status === 'signed-in', signIn, signUp, signOut, setCustomer }),
    [customer, status, signIn, signUp, signOut]
  )

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}
