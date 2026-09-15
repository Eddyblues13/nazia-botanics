import { useState } from 'react'
import { adminUpdatePassword } from '@/lib/adminApi'
import { useAdminAuth } from '@/context/admin-auth-context'
import { formatDateTime } from '@/lib/format'
import { useToast } from '@/components/admin/toast-context'
import { Badge, Field, Panel } from '@/components/admin/ui'

const BLANK = { current_password: '', password: '', password_confirmation: '' }

export default function Account() {
  const { admin } = useAdminAuth()
  const toast = useToast()

  const [form, setForm] = useState(BLANK)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }))

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
      <Panel title="Your account">
        <dl className="ad-dl">
          <div>
            <dt>Name</dt>
            <dd>{admin?.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{admin?.email}</dd>
          </div>
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
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.current_password}
              onChange={(e) => set('current_password', e.target.value)}
            />
          </Field>

          <div className="ad-row">
            <Field label="New password" hint="At least 8 characters." error={fieldErrors.password}>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </Field>

            <Field label="Confirm new password">
              <input
                type="password"
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
