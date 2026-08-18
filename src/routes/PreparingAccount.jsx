import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner } from '../components/ui/index.js'
import AuthShell from '../components/AuthShell.jsx'
import styles from './Welcome.module.css'

/** 09 Signup - Preparing Account Loading (1:2167). Mock: resolves on a timer. */
export default function PreparingAccount() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => {
    const id = setTimeout(
      () => navigate(`/signup/welcome?plan=${params.get('plan') || 'core-prep'}`, {
        replace: true,
        state,
      }),
      2200,
    )
    return () => clearTimeout(id)
  }, [navigate, params, state])

  return (
    <AuthShell tone="welcome" gap="lg">
      <div className={styles.body} role="status" aria-live="polite">
        <div className={styles.spinnerRow}>
          <span className={styles.spinner}>
            <Spinner size="lg" label="" />
          </span>
          <h1 className={`${styles.h1} ${styles.loadingHeading}`}>
            We&rsquo;re preparing your PrepViva account&hellip;
          </h1>
        </div>
        <p className={styles.lede}>This will only take a minute — sit tight!</p>
      </div>
    </AuthShell>
  )
}
