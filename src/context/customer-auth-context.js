import { createContext, useContext } from 'react'

export const CustomerAuthContext = createContext(null)

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used inside <CustomerAuthProvider>')
  return ctx
}
