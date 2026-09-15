import { ApiError } from './api'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/+$/, '')

const TOKEN_KEY = 'nb-admin-token'

/* localStorage throws in Safari private mode — never let that break the app. */
export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore — the session then lasts only as long as the tab */
  }
}

export const clearToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

// Set by AdminAuthProvider so an expired or revoked token drops the session
// wherever the 401 happens to surface.
let onUnauthorized = null
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

const queryString = (params) =>
  params
    ? `?${new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      )}`
    : ''

async function request(path, { method = 'GET', body, signal, params } = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}/admin${path}${queryString(params)}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    throw new ApiError("Can't reach the server — check your connection and try again.")
  }

  if (response.status === 401) {
    clearToken()
    onUnauthorized?.()
    throw new ApiError('Your session has expired. Please sign in again.', { status: 401 })
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Something went wrong (${response.status}).`, {
      status: response.status,
      errors: payload?.errors ?? {},
    })
  }

  return payload
}

/**
 * CSV exports come back as a file rather than JSON, so they bypass `request`
 * and are handed to the browser as a download.
 */
async function download(path, fallbackName) {
  const response = await fetch(`${BASE_URL}/admin${path}`, {
    headers: {
      Accept: 'text/csv',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  })

  if (!response.ok) {
    throw new ApiError(`Could not build that export (${response.status}).`, {
      status: response.status,
    })
  }

  const blob = await response.blob()
  const name = response.headers
    .get('Content-Disposition')
    ?.match(/filename="?([^";]+)"?/)?.[1]

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name ?? fallbackName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/* auth */
export const adminLogin = (credentials) => request('/login', { method: 'POST', body: credentials })
export const adminMe = (signal) => request('/me', { signal })
export const adminLogout = () => request('/logout', { method: 'POST' })
export const adminUpdatePassword = (body) => request('/password', { method: 'PUT', body })

/* dashboard */
export const fetchDashboard = (signal) => request('/dashboard', { signal })

/* products */
export const fetchAdminProducts = (params, signal) => request('/products', { params, signal })
export const fetchAdminProduct = (slug, signal) => request(`/products/${slug}`, { signal })
export const createProduct = (body) => request('/products', { method: 'POST', body })
export const updateProduct = (slug, body) => request(`/products/${slug}`, { method: 'PUT', body })
export const deleteProduct = (slug) => request(`/products/${slug}`, { method: 'DELETE' })
export const toggleProduct = (slug) => request(`/products/${slug}/toggle`, { method: 'PATCH' })

/* journal */
export const fetchAdminArticles = (params, signal) => request('/articles', { params, signal })
export const fetchAdminArticle = (slug, signal) => request(`/articles/${slug}`, { signal })
export const createArticle = (body) => request('/articles', { method: 'POST', body })
export const updateArticle = (slug, body) => request(`/articles/${slug}`, { method: 'PUT', body })
export const deleteArticle = (slug) => request(`/articles/${slug}`, { method: 'DELETE' })
export const toggleArticle = (slug) => request(`/articles/${slug}/toggle`, { method: 'PATCH' })

/* uploads */
export const createUploadSignature = () => request('/uploads/signature', { method: 'POST' })

/* orders */
export const fetchAdminOrders = (params, signal) => request('/orders', { params, signal })
export const fetchAdminOrder = (id, signal) => request(`/orders/${id}`, { signal })
export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status`, { method: 'PATCH', body: { status } })
export const deleteOrder = (id) => request(`/orders/${id}`, { method: 'DELETE' })

/* messages */
export const fetchMessages = (params, signal) => request('/messages', { params, signal })
export const toggleMessageHandled = (id) => request(`/messages/${id}/handled`, { method: 'PATCH' })
export const deleteMessage = (id) => request(`/messages/${id}`, { method: 'DELETE' })

/* reviews */
export const fetchAdminReviews = (params, signal) => request('/reviews', { params, signal })
export const toggleReview = (id) => request(`/reviews/${id}/toggle`, { method: 'PATCH' })
export const deleteReview = (id) => request(`/reviews/${id}`, { method: 'DELETE' })

/* waitlist */
export const fetchWaitlist = (params, signal) => request('/waitlist', { params, signal })
export const toggleWaitlistInvited = (id) => request(`/waitlist/${id}/invited`, { method: 'PATCH' })
export const deleteWaitlistSignup = (id) => request(`/waitlist/${id}`, { method: 'DELETE' })
export const exportWaitlist = () => download('/waitlist/export', 'nazia-waitlist.csv')

/* newsletter */
export const fetchSubscribers = (params, signal) => request('/subscribers', { params, signal })
export const deleteSubscriber = (id) => request(`/subscribers/${id}`, { method: 'DELETE' })
export const exportSubscribers = () => download('/subscribers/export', 'nazia-newsletter.csv')

/* team */
export const fetchTeam = (signal) => request('/team', { signal })
export const createTeamMember = (body) => request('/team', { method: 'POST', body })
export const updateTeamMember = (id, body) => request(`/team/${id}`, { method: 'PUT', body })
export const deleteTeamMember = (id) => request(`/team/${id}`, { method: 'DELETE' })
