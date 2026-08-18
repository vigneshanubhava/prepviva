import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Spinner } from '../components/ui/index.js'
import logoMark from '../assets/signup/logo-mark.png'
import styles from './GeneratingLink.module.css'

/**
 * Between the magic-link email and the screen it signs you in to.
 *
 * Figma has no artboard for it — the email links straight to the app — but a
 * sign-in that lands instantly reads as a page swap rather than a sign-in. It
 * borrows artboard 12's treatment (1:6287), which is the same moment on the way
 * out: the logo tile, one line, and a spinner. Mock: nothing is verified, this
 * resolves on a timer.
 */
const SIGNING_MS = 1600

/** Where signing in lands. Billing until the dashboard is built. */
const LANDING = '/billing'

export default function SigningIn() {
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => {
    const id = setTimeout(
      () => navigate(state?.to || LANDING, { replace: true, state: { email: state?.email } }),
      SIGNING_MS,
    )
    return () => clearTimeout(id)
  }, [navigate, state])

  return (
    <main className={styles.page}>
      <div className={styles.panel} role="status" aria-live="polite">
        <div className={styles.group}>
          <span className={styles.tile}>
            <img className={styles.mark} src={logoMark} alt="" />
          </span>

          <p className={styles.message}>
            <span className={styles.spinner}>
              <Spinner size="sm" label="" />
            </span>
            Signing you in&hellip;
          </p>
        </div>
      </div>
    </main>
  )
}
