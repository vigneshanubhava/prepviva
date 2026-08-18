import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/index.js'
import AppLayout from '../components/AppLayout.jsx'
import PlanCard from '../components/PlanCard.jsx'
import CancelSubscription from './CancelSubscription.jsx'
import PlanChange from './PlanChange.jsx'
import { useAccount } from '../data/AccountProvider.jsx'
import { changeKind, prorate } from '../data/account.js'
import { PLANS } from '../data/plans.js'
import styles from './ManagePlan.module.css'

/**
 * 40 Manage Plan (1:9922) and its variants — 44 (1:11825) with Core Prep
 * current, 45 (1:11952), 48 (1:11505), 50 (1:14567), 51 (1:14576) and
 * 54 (1:14729). They are one screen: what changes is which card is the current
 * plan, and whether a downgrade is already scheduled — 54 puts that notice
 * inside the card being moved to, where that card's call to action would
 * otherwise sit.
 *
 * Figma's Annual / Monthly toggle is gone: the product sells monthly only, so
 * there is nothing to switch between and the artboards' annual column (45, 48,
 * 50, 51) collapses into the one set of cards.
 *
 * The cards are the shared PlanCard, the same one the public pricing page
 * draws. Only the badge and the call to action differ here, and both are
 * decided by where a plan sits relative to the current one.
 *
 * Figma's "Custom pricing / Contact Sales" third tier and its Editors /
 * viewers / concurrent sessions features are the B2B template's; the real
 * three plans come from plans.js.
 */

export default function ManagePlan() {
  const { account, summary, upgrade, schedule, keepPlan, cancel, setNotice } = useAccount()
  const navigate = useNavigate()

  const [change, setChange] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  const pending = account.pendingChange

  const cards = useMemo(
    () =>
      PLANS.map((plan) => {
        const kind = changeKind(account, plan.id)
        return {
          plan,
          kind,
          current: kind === 'same',
          // The card a scheduled downgrade lands in — artboard 54 puts the
          // notice there, where that card's button would be.
          scheduled: Boolean(pending && pending.planId === plan.id),
        }
      }),
    [account, pending],
  )

  function open(plan, kind) {
    setChange({ plan, kind, quote: prorate(account, plan.id) })
  }

  /** Upgrades land now; a downgrade waits for the period already paid for. */
  function confirm() {
    if (!change) return
    const patch = { planId: change.plan.id }
    if (isScheduled(change.kind)) schedule(patch)
    else upgrade(patch)
  }

  /**
   * An upgrade has already been charged and its credits are live, so it goes
   * where the new plan, its credits and its next charge are — artboard 43
   * (1:10758) shows the toast landing on Billing.
   *
   * A scheduled downgrade goes nowhere: artboard 54 (1:14729) is this same
   * screen with the notice now in the card, which is the answer to "when does
   * this happen, and can I undo it".
   */
  function done() {
    const applied = change
    setChange(null)
    if (!applied || isScheduled(applied.kind)) return
    setNotice(`Successfully updated the plan to ${applied.plan.name}`)
    navigate('/billing')
  }

  /**
   * Artboard 54's "Revert Downgrade" — the scheduled change is dropped.
   *
   * The button deletes itself doing it, which would drop focus to <body>. The
   * card's call to action comes back in its place, so focus goes there.
   */
  const revertedTo = useRef(null)

  function revert() {
    revertedTo.current = pending?.planId ?? null
    keepPlan()
  }

  useEffect(() => {
    if (pending || !revertedTo.current) return
    const id = revertedTo.current
    revertedTo.current = null
    // The CTA is back unless that card is now the current plan, whose button is
    // disabled and cannot hold focus — the card's heading takes it instead.
    const cta = document.getElementById(`plan-cta-${id}`)
    if (cta && !cta.disabled) cta.focus()
    else document.getElementById(`plan-${id}`)?.focus()
  }, [pending])

  return (
    <AppLayout>
      <div className={styles.stack}>
        <Link className={styles.back} to="/billing">
          <Icon name="chevronLeft" size="16px" />
          Back
        </Link>

        {/* ---- header card (1:9933) ---- */}
        <section className={styles.panel} aria-labelledby="manage-heading">
          <span className={styles.panelIcon} aria-hidden="true">
            <Icon name="upload" size="24px" strokeWidth={1.5} />
          </span>
          <div>
            <h1 className={styles.h1} id="manage-heading">
              Manage your plan
            </h1>
            {/* Figma: "PrepViva pricing planare design to meet your needs as you grow" */}
            <p className={styles.lede}>
              Change plan whenever you like. An upgrade starts today; a downgrade waits until
              the month you have paid for runs out.
            </p>
          </div>
        </section>

        {/* ---- the three plans ---- */}
        <div className={styles.grid}>
          {cards.map(({ plan, kind, current, scheduled }) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              badge={
                current
                  ? { label: 'Current plan', tone: 'current' }
                  : plan.recommended
                    ? { label: 'Recommended' }
                    : null
              }
              cta={
                current
                  ? { id: `plan-cta-${plan.id}`, label: 'Current plan', variant: 'current', disabled: true }
                  : {
                      id: `plan-cta-${plan.id}`,
                      label: ctaLabel(kind, plan),
                      onClick: () => open(plan, kind),
                    }
              }
              note={current && !scheduled ? currentNote(summary) : null}
              footer={
                scheduled ? (
                  /* 54 (1:14729) — the notice takes the card's button. */
                  <div className={styles.schedule}>
                    <Icon name="clock" size="16px" className={styles.scheduleIcon} />
                    <div className={styles.scheduleText}>
                      <p className={styles.scheduleTitle}>{summary.pending.title}</p>
                      <p className={styles.scheduleMeta}>
                        Plan will take effect from{' '}
                        <strong>{summary.pending.effectiveOnLabel}</strong>
                      </p>
                      <button
                        type="button"
                        className={styles.revert}
                        onClick={revert}
                      >
                        {summary.pending.revertLabel}
                      </button>
                    </div>
                  </div>
                ) : null
              }
            />
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={() => setCancelOpen(true)}>
            Cancel subscription
          </button>
          <p className={styles.help}>
            For any billing question, write to us at{' '}
            <a className={styles.helpLink} href="mailto:billing@prepviva.com">
              billing@prepviva.com
            </a>
          </p>
        </div>
      </div>

      <PlanChange
        open={Boolean(change)}
        change={change}
        summary={summary}
        onConfirm={confirm}
        onClose={() => setChange(null)}
        onDone={done}
      />

      {/* The same modal Billing opens — artboard 40 puts its entry point here too. */}
      <CancelSubscription
        open={cancelOpen}
        summary={summary}
        onConfirm={cancel}
        onClose={() => setCancelOpen(false)}
      />
    </AppLayout>
  )
}

/** A downgrade waits for the period already paid for; an upgrade lands now. */
function isScheduled(kind) {
  return kind === 'downgrade'
}

function ctaLabel(kind, plan) {
  if (kind === 'downgrade') return `Downgrade to ${plan.name}`
  return `Upgrade to ${plan.name}`
}

/** The current card states what is actually being paid and when. */
function currentNote(summary) {
  return summary.canceled
    ? `Cancelled — access until ${summary.accessEndsLabel}`
    : `${summary.amountLabel} ${summary.periodLabel}, next on ${summary.chargeDateLabel}`
}
