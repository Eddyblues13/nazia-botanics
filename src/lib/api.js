const FALLBACK_URL = 'http://localhost:8000/api'

/**
 * Resolves the API base URL from the environment.
 *
 * A value with no scheme — "api.example.com/api" instead of
 * "https://api.example.com/api" — is the one mistake that fails silently and
 * confusingly: fetch treats it as a *relative* path, so a login POST from
 * /admin lands on https://your-site.com/admin/api.example.com/api/admin/login
 * and the SPA host answers 405. The scheme is added back here rather than
 * leaving that to be rediscovered from a stack trace.
 *
 * A leading "/" is left alone — that is a deliberate same-origin path.
 */
function resolveBaseUrl(raw) {
  const value = (raw ?? FALLBACK_URL).trim().replace(/\/+$/, '')

  if (value === '') return FALLBACK_URL
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value

  const fixed = `https://${value}`
  if (import.meta.env.DEV) {
    console.warn(
      `VITE_API_URL is missing a scheme ("${value}"). Using "${fixed}". ` +
        'Set it to the full URL, including https://, to silence this.'
    )
  }
  return fixed
}

export const BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_URL)

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {}, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    // The response body, for the cases where a rejection still carries
    // something worth showing — a declined payment comes back 402 with the
    // order attached.
    this.data = data
    // Laravel's { field: [message] } validation bag, flattened to first message.
    this.errors = Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [
        field,
        Array.isArray(messages) ? messages[0] : messages,
      ])
    )
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause
    throw new ApiError("We can't reach the studio right now — check your connection and try again.")
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `Something went wrong (${response.status}).`, {
      status: response.status,
      errors: payload?.errors ?? {},
      data: payload,
    })
  }

  return payload
}

/* catalog */
export const fetchProducts = (signal) => request('/products', { signal })
export const fetchProduct = (id, signal) =>
  request(`/products/${encodeURIComponent(id)}`, { signal })

/* journal */
export const fetchArticles = (signal) => request('/articles', { signal })
export const fetchArticle = (id, signal) =>
  request(`/articles/${encodeURIComponent(id)}`, { signal })

/* community */
export const fetchReviews = (signal) => request('/reviews', { signal })
export const submitReview = (review) => request('/reviews', { method: 'POST', body: review })

/* orders */
export const fetchDeliveryZones = (signal) => request('/delivery-zones', { signal })

export const createOrder = (order) => request('/orders', { method: 'POST', body: order })

/**
 * Asks the server to check a payment with Paystack.
 *
 * Called when the customer lands back on their order page. Returning here
 * proves nothing on its own — the server is the one that asks Paystack what
 * really happened.
 */
export const verifyPayment = (reference) =>
  request(`/orders/${encodeURIComponent(reference)}/verify-payment`, { method: 'POST' })
export const fetchOrder = (reference, signal) =>
  request(`/orders/${encodeURIComponent(reference)}`, { signal })

/* forms */
export const sendContactMessage = (message) => request('/contact', { method: 'POST', body: message })
export const joinWaitlist = (signup) => request('/waitlist', { method: 'POST', body: signup })
export const subscribeToNewsletter = (email, source = 'popup') =>
  request('/newsletter', { method: 'POST', body: { email, source } })
