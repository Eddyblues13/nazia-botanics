import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Field, Spinner } from '@/components/admin/ui'

export default function AdminLogin() {
  const { login, authenticated, checking } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (checking) {
    return (
      <div className="ad-login">
        <Spinner label="Checking your session" />
      </div>
    )
  }

  // Bounce straight back to wherever the guard interrupted.
  if (authenticated) return <Navigate to={location.state?.from?.pathname ?? '/admin'} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await login(form)
      navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.errors ?? {})
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ad-login">
      <div className="ad-login__card">
        <h1>Nazia Admin</h1>
        <p>Sign in to manage the shop, the journal and your community.</p>

        <form className="ad-form" onSubmit={submit}>
          <Field label="Email address" error={fieldErrors.email}>
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="you@naziabotanics.com"
              value={form.email}
              disabled={isSubmitting}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Password" error={fieldErrors.password}>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              disabled={isSubmitting}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          <div className="ad-actions">
            <button type="submit" className="ad-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          {error && !Object.keys(fieldErrors).length && (
            <p className="ad-field__error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
