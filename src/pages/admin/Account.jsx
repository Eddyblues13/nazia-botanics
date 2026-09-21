import { useState } from 'react'
import { adminUpdatePassword, adminUpdateProfile } from '@/lib/adminApi'
import { useAdminAuth } from '@/context/admin-auth-context'
import { formatDateTime } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, Field, Panel } from '@/components/admin/ui'
import PasswordInput from '@/components/admin/PasswordInput'

const BLANK = { current_password: '', password: '', password_confirmation: '' }

export default function Account() {
  const { admin, setAdmin } = useAdminAuth()
  const toast = useToast()

  const [form, setForm] = useState(BLANK)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Only the edits are held locally; everything else is read from the admin in
  // context. The admin arrives a tick after mount, and deriving it this way
  // means the form fills when it lands without an effect to keep in sync.
  const [draft, setDraft] = useState(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileErrors, setProfileErrors] = useState({})

  const profile = draft ?? { name: admin?.name ?? '', email: admin?.email ?? '' }

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))
  const setProfileField = (name, value) => setDraft({ ...profile, [name]: value })

  const saveProfile = async (e) => {
    e.preventDefault()
    if (isSavingProfile) return

    setIsSavingProfile(true)
    setProfileErrors({})

    try {
      const payload = await adminUpdateProfile(profile)
      // Refreshed in context too, so the name in the sidebar changes with it.
      setAdmin(payload.data)
      // Dropping the draft hands the form back to the saved values.
      setDraft(null)
      toast.success('Profile updated.')
    } catch (err) {
      setProfileErrors(err.errors ?? {})
      toast.error(err.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    setFieldErrors({})

    try {
      await adminUpdatePassword(form)
      setForm(BLANK)
      toast.success('Password updated — every other session was signed out.')
    } catch (err) {
      setFieldErrors(err.errors ?? {})
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Panel title="Your details">
        <form className="ad-form" onSubmit={saveProfile}>
          <div className="ad-row">
            <Field label="Name" error={profileErrors.name}>
              <input
                type="text"
                required
                value={profile.name}
                disabled={isSavingProfile}
                onChange={(e) => setProfileField('name', e.target.value)}
              />
            </Field>

            <Field
              label="Email address"
              hint="This is also what you sign in with."
              error={profileErrors.email}
            >
              <input
                type="email"
                required
                value={profile.email}
                disabled={isSavingProfile}
                onChange={(e) => setProfileField('email', e.target.value)}
              />
            </Field>
          </div>

          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving…' : 'Save details'}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Your account">
        <dl className="ad-dl">
          <div>
            <dt>Role</dt>
            <dd>
              <Badge status={admin?.role} />
            </dd>
          </div>
          <div>
            <dt>Last signed in</dt>
            <dd>{formatDateTime(admin?.last_login_at)}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Change your password">
        <form className="ad-form" onSubmit={submit}>
          <Field label="Current password" error={fieldErrors.current_password}>
            <PasswordInput
              required
              autoComplete="current-password"
              value={form.current_password}
              onChange={(e) => set('current_password', e.target.value)}
            />
          </Field>

          <div className="ad-row">
            <Field label="New password" hint="At least 8 characters." error={fieldErrors.password}>
              <PasswordInput
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </Field>

            <Field label="Confirm new password">
              <PasswordInput
                required
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={(e) => set('password_confirmation', e.target.value)}
              />
            </Field>
          </div>

          <p className="ad-field__hint">
            Changing your password signs out every other device you are signed in on.
          </p>

          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={isSaving}>
              {isSaving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </Panel>
    </>
  )
}
