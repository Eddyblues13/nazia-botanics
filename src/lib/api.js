const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, errors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
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
export const createOrder = (order) => request('/orders', { method: 'POST', body: order })
export const fetchOrder = (reference, signal) =>
  request(`/orders/${encodeURIComponent(reference)}`, { signal })

/* forms */
export const sendContactMessage = (message) => request('/contact', { method: 'POST', body: message })
export const joinWaitlist = (signup) => request('/waitlist', { method: 'POST', body: signup })
export const subscribeToNewsletter = (email, source = 'popup') =>
  request('/newsletter', { method: 'POST', body: { email, source } })
