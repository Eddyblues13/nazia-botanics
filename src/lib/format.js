const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** Prices are whole naira throughout — ₦15,000, never ₦15,000.00. */
export const formatNaira = (amount) => naira.format(amount ?? 0)

const dateTime = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '—')

const date = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' })

export const formatDate = (iso) => (iso ? date.format(new Date(iso)) : '—')
