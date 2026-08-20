import emailjs from '@emailjs/browser'

const ADMIN_EMAIL = 'naziabotanics26@gmail.com'
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${ADMIN_EMAIL}`

/* EmailJS is the preferred route, but it only exists once the keys are in .env. */
const emailjsConfig = () => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_WAITLIST_TEMPLATE_ID
    || import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  if (!serviceId || !templateId || !publicKey) return null
  return { serviceId, templateId, publicKey }
}

/**
 * Adds an email to the product waitlist and notifies naziabotanics26@gmail.com.
 *
 * Tries EmailJS first when it is configured, then falls back to FormSubmit so a
 * signup is never silently dropped. Unlike the newsletter service, a failure
 * here is reported honestly so the form can tell the visitor to try again.
 *
 * @param {string} email - The subscriber's email address.
 * @param {string} [name] - Optional first name, for a warmer notification.
 * @returns {Promise<{ success: boolean, via?: string, message?: string }>}
 */
export async function joinWaitlist(email, name = '') {
  const submittedAt = new Date().toLocaleString()
  const who = name ? `${name} (${email})` : email

  const config = emailjsConfig()
  if (config) {
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        {
          to_email: ADMIN_EMAIL,
          admin_email: ADMIN_EMAIL,
          name: name || 'Waitlist signup',
          email,
          subscriber_email: email,
          subject: `New waitlist signup: ${email}`,
          message: `${who} just joined the Nazia Botanics waitlist.`,
          subscribed_at: submittedAt,
        },
        config.publicKey
      )
      return { success: true, via: 'emailjs' }
    } catch (err) {
      // Fall through to FormSubmit rather than losing the signup.
      console.error('[Waitlist] EmailJS send failed, falling back to FormSubmit:', err)
    }
  }

  try {
    const res = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: name || 'Waitlist signup',
        email,
        _subject: `New waitlist signup: ${email}`,
        _template: 'table',
        message: `${who} just joined the Nazia Botanics waitlist on ${submittedAt}.`,
      }),
    })

    if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`)

    const data = await res.json().catch(() => ({}))
    // FormSubmit reports its own failures in the body with a 200 status.
    if (data.success === 'false' || data.success === false) {
      throw new Error(data.message || 'FormSubmit rejected the submission')
    }

    return { success: true, via: 'formsubmit' }
  } catch (err) {
    console.error('[Waitlist] Failed to deliver signup:', err)
    return {
      success: false,
      message: 'We could not save your place just now. Please try again.',
    }
  }
}
