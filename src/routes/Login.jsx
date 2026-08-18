import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/index.js'
import AuthShell from '../components/AuthShell.jsx'
import styles from './Login.module.css'

/**
 * 11 Login - Email Entry (1:3169).
 *
 * Magic link is the primary path (PLAN-MODEL-AND-COPY.md §4). Nothing is sent:
 * the address is carried forward in router state and the next three screens
 * simulate the round trip.
 */
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const value = email.trim()
    if (!value) {
      setError('Enter your email address')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    navigate('/login/sending', { state: { email: value } })
  }

  return (
    <AuthShell tone="welcome" gap="apart">
      <div className={styles.body}>
        <div className={styles.headings}>
          <h1 className={styles.h1}>Login</h1>
          <p className={styles.lede}>Enter your email to log in and get started with PrepViva.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              Email address
            </label>

            <span className={styles.control}>
              <span className={styles.controlIcon}>
                <Icon name="mail" size="18px" strokeWidth={1.5} />
              </span>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError('')
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-email-err' : undefined}
              />
            </span>

            {error ? (
              <span className={styles.error} id="login-email-err" role="alert">
                <Icon name="alertCircle" size="0.875rem" />
                {error}
              </span>
            ) : null}
          </div>

          <button type="submit" className={styles.continue}>
            Continue
          </button>

          {/* Password login stays available as the secondary path — §4. */}
          <p className={styles.alt}>
            Prefer a password?{' '}
            <Link className={styles.altLink} to="/login/password">
              Sign in with a password
            </Link>
          </p>
        </form>
      </div>

      <p className={styles.footer}>
        Don&rsquo;t have an account?{' '}
        <Link className={styles.footerLink} to="/pricing">
          Sign up
        </Link>{' '}
        Here
      </p>
    </AuthShell>
  )
}
