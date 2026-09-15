import { subscribeToNewsletter as postSubscriber } from '@/lib/api'

/**
 * Subscribes an email to the newsletter.
 *
 * @param {string} subscriberEmail - The subscriber's email address.
 * @param {'popup'|'footer'|'waitlist'} [source] - Which surface it came from.
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function subscribeToNewsletter(subscriberEmail, source = 'popup') {
  try {
    const payload = await postSubscriber(subscriberEmail, source)
    return { success: true, message: payload?.message }
  } catch (err) {
    console.error('[Newsletter] Failed to save subscriber:', err)
    return {
      success: false,
      message: err?.message ?? 'We could not add you to the list. Please try again.',
    }
  }
}
