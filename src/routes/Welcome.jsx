import { Link, useLocation, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { PLANS, formatGBP } from '../data/plans.js'
import { TRIAL_CREDITS, TRIAL_DAYS, firstChargeDate, formatDate } from '../data/trial.js'
import styles from './Welcome.module.css'

/** 10 Signup - Welcome (1:2230). */
export default function Welcome() {
  const [params] = useSearchParams()
  const { state } = useLocation()
  const plan = PLANS.find((p) => p.id === params.get('plan')) || PLANS[1]
  const email = state?.email || 'oliver.davies@example.com'
  const charge = formatDate(firstChargeDate())

  return (
    <AuthShell tone="welcome" gap="lg">
      <div className={styles.body}>
        <h1 className={`${styles.h1} ${styles.successHeading}`}>
          You&rsquo;re in!
          <br />
          Your {TRIAL_DAYS}-day trial is live — {TRIAL_CREDITS} credits ready to use.
        </h1>

        <div className={styles.actions}>
          {/* Figma said "15-day free trial" and named no date or amount. The trial
              is 14 days, and doc/BRIEF.md requires the date and the amount here. */}
          <p className={styles.lede}>
            Welcome to PrepViva. Your account <span className={styles.medium}>{email}</span> is
            active on the <span className={styles.strong}>{plan.name} plan</span> with a{' '}
            {TRIAL_DAYS}-day trial. You won&rsquo;t be charged until {charge}, when the first
            payment of {formatGBP(plan.price.monthly)} is taken — cancel any time before then.
          </p>

          <Link className={styles.cta} to="/login" state={{ email }}>
            Login
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
