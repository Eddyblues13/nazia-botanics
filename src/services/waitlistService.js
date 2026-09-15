import { joinWaitlist as postWaitlist } from '@/lib/api'

/**
 * Adds a signup to the product waitlist.
 *
 * Signups are stored by the API, where the team reads and exports them from
 * the dashboard. A failure is reported honestly so the form can ask the
 * visitor to try again rather than pretending the place was saved.
 *
 * @param {{ email: string, phone?: string }} signup - The subscriber's details.
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function joinWaitlist({ email, phone = '' }) {
  try {
    const payload = await postWaitlist({ email, phone })
    return { success: true, message: payload?.message }
  } catch (err) {
    console.error('[Waitlist] Failed to save signup:', err)
    return {
      success: false,
      message: err?.message ?? 'We could not save your place just now. Please try again.',
    }
  }
}
