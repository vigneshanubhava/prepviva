import { Link, useLocation } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { isSignedInPath } from '../data/nav.js'
import styles from './NotBuilt.module.css'

/**
 * Prototype scaffolding, not product UI. Every link in a built screen has to land
 * somewhere; this catches the ones whose screen has not been built yet so the
 * prototype never dead-ends on a blank route.
 *
 * A destination the left nav owns (Dashboard, Practice, My Sessions,
 * Performance, Settings) keeps the signed-in shell, so the nav stays put and
 * the prototype still feels like the app. Anything else — /terms,
 * /login/password — is out of the app and gets the bare card.
 */
export default function NotBuilt() {
  const { pathname } = useLocation()
  const inApp = isSignedInPath(pathname)

  const card = (
    <div className={styles.card}>
      <p className={styles.eyebrow}>Prototype only</p>
      <h1 className={styles.title}>This screen isn&rsquo;t built yet</h1>
      <p className={styles.body}>
        <span className={styles.path}>{pathname}</span> has no screen behind it. It&rsquo;s linked
        from a screen that is built, so it lands here rather than on a blank page.
      </p>
      <div className={styles.links}>
        <Link className={styles.link} to="/pricing">
          Pricing
        </Link>
        <Link className={styles.link} to="/signup">
          Signup
        </Link>
        <Link className={styles.link} to="/billing">
          Billing
        </Link>
        <Link className={styles.link} to="/kitchen-sink">
          Kitchen sink
        </Link>
      </div>
    </div>
  )

  if (inApp) {
    return (
      <AppLayout>
        <div className={styles.inApp}>{card}</div>
      </AppLayout>
    )
  }

  return <main className={styles.page}>{card}</main>
}
