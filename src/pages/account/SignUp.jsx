import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import PasswordField from '@/components/common/PasswordField'
import { useCustomerAuth } from '@/context/customer-auth-context'
import { useSeo } from '@/hooks/useSeo'

const EMPTY = { name: '', email: '', password: '', password_confirmation: '' }

export default function SignUp() {
  useSeo({
    title: 'Create an account',
    description: 'Keep your orders in one place and track them any time.',
    path: '/sign-up',
    noindex: true,
  })

  const { signUp, isSignedIn } = useCustomerAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (isSignedIn) return <Navigate to="/account" replace />

  const field = (name) => ({
    value: form[name],
    disabled: isSubmitting,
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  })

  const submit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')
    setFieldErrors({})

    try {
      await signUp(form)
      navigate('/account', { replace: true })
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.errors ?? {})
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <PageHero
        eyebrow="Your account"
        title="Keep your ritual in one place."
        lead="An account keeps every order together, so you can look one up whenever you like."
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          <Reveal className="form-card">
            <form onSubmit={submit}>
              <label>
                Full name
                <input type="text" required autoComplete="name" {...field('name')} />
              </label>
              {fieldErrors.name && <p className="form-card__error">{fieldErrors.name}</p>}

              <label>
                Email address
                <input type="email" required autoComplete="email" {...field('email')} />
              </label>
              {fieldErrors.email && <p className="form-card__error">{fieldErrors.email}</p>}

              <label>
                Password
                <PasswordField autoComplete="new-password" required {...field('password')} />
              </label>
              {fieldErrors.password ? (
                <p className="form-card__error">{fieldErrors.password}</p>
              ) : (
                <p className="form-card__hint">At least 8 characters.</p>
              )}

              <label>
                Confirm password
                <PasswordField
                  autoComplete="new-password"
                  required
                  {...field('password_confirmation')}
                />
              </label>

              <button type="submit" className="btn btn--terracotta" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Creating your account…' : 'Create account'}</span>
              </button>

              {error && Object.keys(fieldErrors).length === 0 && (
                <p className="form-card__error" role="alert">
                  {error}
                </p>
              )}
            </form>

            <p className="form-card__hint form-card__foot">
              Already have an account? <Link to="/sign-in">Sign in</Link>.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
