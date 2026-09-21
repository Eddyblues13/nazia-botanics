import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import PageHero from '@/components/common/PageHero'
import Reveal from '@/components/common/Reveal'
import PasswordField from '@/components/common/PasswordField'
import { useCustomerAuth } from '@/context/customer-auth-context'
import { useSeo } from '@/hooks/useSeo'

export default function SignIn() {
  useSeo({
    title: 'Sign in',
    description: 'Sign in to see your past orders and track what is on its way.',
    path: '/sign-in',
    noindex: true,
  })

  const { signIn, isSignedIn } = useCustomerAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Where the customer was headed before being asked to sign in.
  const next = location.state?.from ?? '/account'

  if (isSignedIn) return <Navigate to={next} replace />

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
      await signIn(form)
      navigate(next, { replace: true })
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
        title="Welcome back."
        lead="Sign in to see everything you've ordered and where it has got to."
      />

      <section className="section">
        <div className="container form-wrap form-wrap--single">
          <Reveal className="form-card">
            <form onSubmit={submit}>
              <label>
                Email address
                <input type="email" required autoComplete="email" {...field('email')} />
              </label>
              {fieldErrors.email && <p className="form-card__error">{fieldErrors.email}</p>}

              <label>
                Password
                <PasswordField autoComplete="current-password" {...field('password')} required />
              </label>
              {fieldErrors.password && <p className="form-card__error">{fieldErrors.password}</p>}

              <button type="submit" className="btn btn--terracotta" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
              </button>

              {error && !fieldErrors.email && (
                <p className="form-card__error" role="alert">
                  {error}
                </p>
              )}
            </form>

            <p className="form-card__hint form-card__foot">
              New here? <Link to="/sign-up">Create an account</Link>. You can also{' '}
              <Link to="/account">track an order</Link> with its reference, without signing in.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
