import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * Falls back to a no-op rather than throwing, so a panel rendered outside the
 * dashboard shell (a login screen, a test) still works.
 */
const NOOP = { success: () => {}, error: () => {}, dismiss: () => {} }

export function useToast() {
  return useContext(ToastContext) ?? NOOP
}
