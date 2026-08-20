import { Link } from 'react-router-dom'
import { Banner } from './ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { creditLevel, MIN_SESSION_CREDITS } from '../data/dashboard.js'
import { CREDITS_PER_PANEL } from '../data/trial.js'
import styles from './CreditNotice.module.css'

/**
 * The whole low-balance ladder, in one place, so the dashboard and the practice
 * screens warn at the same point in the same words.
 *
 *   healthy   nothing at all — a balance that is fine is not news
 *   low       you can still practise, just not a full panel
 *   critical  below the cheapest session; the next start would fail
 *   empty     blocked, and the copy leads with what is *not* lost
 *
 * The thresholds are `creditLevel()` in data/dashboard.js. Nothing here decides
 * what "low" means.
 */
const COPY = {
  low: {
    tone: 'warning',
    title: (b) => `${b} credits left`,
    body: () =>
      `Enough for a shorter session, but not a full ${CREDITS_PER_PANEL}-credit panel. Worth topping up before your next one.`,
    cta: 'Top up',
  },
  critical: {
    tone: 'warning',
    title: (b) => `Only ${b} credit${b === 1 ? '' : 's'} left`,
    body: () =>
      `The shortest session costs ${MIN_SESSION_CREDITS}, so there is not enough here to start anything. Adding credits takes about a minute.`,
    cta: 'Add credits',
  },
  empty: {
    tone: 'danger',
    title: () => 'You are out of credits',
    body: () =>
      'Your reports, your history and your CV are all still here — you just cannot start a new session until you top up.',
    cta: 'See plans',
  },
}

export default function CreditNotice({ className = '' }) {
  const { summary } = useAccount()
  const balance = summary.credits.remaining
  const copy = COPY[creditLevel(balance)]

  if (!copy) return null

  return (
    <Banner
      className={`${styles.notice} ${className}`}
      tone={copy.tone}
      title={copy.title(balance)}
      actions={
        <Link className={styles.btn} to="/billing/manage-plan">
          {copy.cta}
        </Link>
      }
    >
      {copy.body(balance)}
    </Banner>
  )
}
