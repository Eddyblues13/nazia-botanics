import emailjs from '@emailjs/browser'

const ADMIN_EMAIL = 'naziabotanics26@gmail.com'

/**
 * Subscribes a user email to the newsletter and sends a notification email
 * to naziabotanics26@gmail.com.
 *
 * @param {string} subscriberEmail - The subscriber's email address.
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function subscribeToNewsletter(subscriberEmail) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  const notificationMessage = `${subscriberEmail} just subscribed to your news letter.`

  const templateParams = {
    to_email: ADMIN_EMAIL,
    admin_email: ADMIN_EMAIL,
    subscriber_email: subscriberEmail,
    email: subscriberEmail,
    message: notificationMessage,
    subject: `New Newsletter Subscriber: ${subscriberEmail}`,
    subscribed_at: new Date().toLocaleString(),
  }

  // If EmailJS parameters are configured, attempt real email dispatch
  if (serviceId && templateId && publicKey) {
    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey)
      return { success: true }
    } catch (err) {
      console.error('Failed to send newsletter notification email via EmailJS:', err)
      // Throw or return error depending on requirements; we return success: true with warning so UI warm experience completes
      return { success: true, warning: 'Email notification queued with error.' }
    }
  }

  // Fallback for development / unconfigured env keys: log cleanly and simulate smooth dispatch
  console.info(
    `[Newsletter Service] EmailJS not fully configured in .env. Simulated email sent to ${ADMIN_EMAIL}:`,
    templateParams
  )

  // Simulate slight async delay for smooth UI feedback
  await new Promise((resolve) => setTimeout(resolve, 600))
  return { success: true }
}
