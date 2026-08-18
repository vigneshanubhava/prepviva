import { PLANS, TRIAL } from '../data/plans.js'
import PlanCard from '../components/PlanCard.jsx'
import styles from './Pricing.module.css'

/**
 * 02 Website - Pricing Page Public (14:11391).
 *
 * The card itself is the shared PlanCard — Manage plan draws the same one.
 * This page owns the hero, the grid and the footnote.
 *
 * Monthly only, on request: the annual toggle and the "billed annually" line
 * were removed here. plan.price.annual is still in the data, and Manage plan
 * uses it.
 */
export default function Pricing() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <h1 className={styles.h1}>
              Choose the practice rhythm that fits your interview date.
            </h1>
            <p className={styles.heroSub}>
              Every plan includes all three tracks. One credit is about ten minutes of practice, so
              30 credits is roughly five full panel interviews.
            </p>
          </div>
        </section>

        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              badge={plan.recommended ? { label: 'Recommended' } : null}
              cta={{ label: TRIAL.cta, to: `/signup?plan=${plan.id}` }}
              note={TRIAL.underCta}
            />
          ))}
        </div>

        <p className={styles.footnote}>
          One credit is about ten minutes of practice. Your card is collected at signup but not
          charged during the trial — cancel any time before day 15 and you won't be charged.
        </p>
      </div>
    </main>
  )
}
