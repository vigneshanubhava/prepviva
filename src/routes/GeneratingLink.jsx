import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Spinner } from '../components/ui/index.js'
import logoMark from '../assets/signup/logo-mark.png'
import styles from './GeneratingLink.module.css'

/**
 * 12 Login - Generating Secure Link Loading (1:6287).
 * Mock: nothing is generated and no email is sent — this resolves on a timer.
 *
 * Adapted: the artboard has a spinner, but it is stranded in the top-left
 * corner rather than in the centred group. It sits with the message here, since
 * a loading screen with no moving part reads as a stalled one.
 */
export default function GeneratingLink() {
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => {
    const id = setTimeout(() => navigate('/login/link-sent', { replace: true, state }), 1800)
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
            Generating your secure login link&hellip;
          </p>
        </div>
      </div>
    </main>
  )
}
