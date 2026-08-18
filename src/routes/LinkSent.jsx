import { Link, useLocation } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import styles from './LinkSent.module.css'

/**
 * The envelope-and-tick mark from the artboard (image 27, 94px).
 * Figma exports it as a PNG with the green baked in, which would not follow the
 * theme — inlined in currentColor and coloured from --welcome-success instead.
 */
function SentMark() {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* the letter, standing behind the envelope */}
      <rect x="18" y="6" width="28" height="28" rx="2.5" />
      <polyline points="25 19.5 30 24.5 40 14" />
      {/* the open envelope */}
      <path d="M4 27v25a4 4 0 0 0 4 4h48a4 4 0 0 0 4-4V27l-14-9" />
      <path d="M4 27l14-9" />
      <path d="M4.8 28.6 32 45l27.2-16.4" />
      {/* sparkles */}
      <path d="M53 9v6M50 12h6" />
      <path d="M12.5 12v4M10.5 14h4" />
      <path d="M57.5 34.5c1.6 2 1.6 4 0 6" />
      <path d="M6.5 34.5c-1.6 2-1.6 4 0 6" />
      <path d="M20 58.5c1.8 1.6 3.8 1.6 5.6 0" />
    </svg>
  )
}

/** 13 Login - Sign-In Link Sent Confirmation (1:5516). */
export default function LinkSent() {
  const { state } = useLocation()
  const email = state?.email || 'oliver.davies@example.com'

  return (
    <AuthShell tone="welcome" gap="lg">
      <div className={styles.body}>
        <div className={styles.headings}>
          <span className={styles.markWrap}>
            <SentMark />
          </span>
          <h1 className={styles.h1}>Sign-in link sent</h1>
        </div>

        <div className={styles.copy}>
          {/* Figma reads "Please chick on the link" — corrected. */}
          <p className={styles.para}>
            We have sent a magic link to <span className={styles.strong}>{email}</span>. Please
            click on the link to continue.
          </p>
          <p className={styles.para}>
            Didn&rsquo;t receive the link? Go back to the{' '}
            <Link className={styles.link} to="/login">
              sign in
            </Link>{' '}
            page and try again.
          </p>
        </div>

        {/* Not part of the artboard. The brief requires a clearly-marked way to
            reach the email screen, because no email is actually sent. */}
        <aside className={styles.mock} aria-labelledby="mock-heading">
          <p className={styles.mockEyebrow} id="mock-heading">
            Prototype only
          </p>
          <p className={styles.mockBody}>
            No email was sent. Open the simulated inbox to see the message and follow the link.
          </p>
          <Link className={styles.mockBtn} to="/login/email" state={{ email }}>
            Open the email
          </Link>
        </aside>
      </div>
    </AuthShell>
  )
}
