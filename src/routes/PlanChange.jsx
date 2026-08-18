import { useEffect, useRef, useState } from 'react'
import { Button, Icon, Modal, Spinner } from '../components/ui/index.js'
import BrandMark from './BrandMark.jsx'
import { PlanIcon } from '../components/PlanCard.jsx'
import { formatGBP } from '../data/plans.js'
import styles from './PlanChange.module.css'

/**
 * The plan-change modal and its confirmation — artboards 41, 42 and 52 of the
 * upgrade flow (1:9921), plus the downgrade modal (1:14889).
 *
 *   41 (1:10052)  Upgrade to Core Prep
 *   52 (1:14889)  Downgrade to Starter — adds a current -> new block and the
 *                 impact line, and schedules rather than charging
 *   42 (1:10230)  Upgrade successful
 *   53 (1:15085)  Downgrade scheduled — the same confirmation dialog, stating
 *                 when the new plan takes over and that it can be reverted
 *
 * Artboards 46 and 47 (switch to annually) are gone with the period toggle:
 * the product sells monthly only.
 *
 * One component: the artboards differ in title, in whether money moves today,
 * and in whether the change lands now or at the end of the period.
 *
 * Figma's "54 days (includes 24 days converted from the remaining time on your
 * current plan)" and its Isotopes Terms of Service belong to the template. The
 * figures here come from prorate() in account.js, so what the modal promises is
 * what the account actually does.
 */

const WORKING_MS = 900

const TITLES = {
  upgrade: (plan) => `Upgrade to ${plan.name}`,
  downgrade: (plan) => `Downgrade to ${plan.name}`,
}

/**
 * onClose runs when the modal is dismissed without changing anything; onDone
 * runs after the confirmation is acknowledged. They are separate because
 * dismissing must not do what finishing does — closing the modal used to
 * navigate away as if the plan had changed.
 */
export default function PlanChange({ open, change, summary, onConfirm, onClose, onDone }) {
  const [step, setStep] = useState('form')   // form | working | done
  const dialogRef = useRef(null)
  const confirmRef = useRef(onConfirm)
  confirmRef.current = onConfirm

  useEffect(() => {
    if (open) setStep('form')
  }, [open])

  useEffect(() => {
    if (step !== 'working') return undefined
    const timer = setTimeout(() => {
      confirmRef.current?.()
      setStep('done')
    }, WORKING_MS)
    return () => clearTimeout(timer)
  }, [step])

  if (!change) return null

  const { kind, quote, plan } = change
  // A downgrade waits for the month already paid for; an upgrade lands today.
  const scheduled = kind === 'downgrade'
  const title = (TITLES[kind] || TITLES.upgrade)(plan)

  function submit() {
    // Confirming disables the button that was clicked, which would drop focus
    // to <body> and out of the dialog. Park it on the heading first.
    dialogRef.current?.closest('[role="dialog"]')?.querySelector('h2')?.focus()
    setStep('working')
  }

  return (
    <>
      <Modal
        open={open && step !== 'done'}
        onClose={step === 'working' ? noop : onClose}
        closeOnScrim={step !== 'working'}
        showClose={false}
        label={title}
        className={styles.panel}
        scrimClassName={styles.scrim}
      >
        <div className={styles.body} ref={dialogRef}>
          <div className={styles.head}>
            <h2 className={styles.title} tabIndex={-1}>
              <span className={styles.titleIcon} aria-hidden="true">
                <Icon name="upload" size="24px" strokeWidth={1.5} />
              </span>
              {title}
            </h2>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              disabled={step === 'working'}
              aria-label="Close without changing plan"
            >
              <Icon name="x" size="24px" />
            </button>
          </div>

          {/* 52 (1:14889) shows what you are leaving beside what you are moving
              to; the upgrade artboards show only the destination. */}
          {scheduled ? (
            <div className={styles.swap}>
              <div className={styles.swapSide}>
                <p className={styles.swapLabel}>Current plan</p>
                <div className={styles.swapPlan}>
                  <PlanIcon icon={summary.plan.icon} />
                  <div>
                    <p className={styles.planName}>{summary.plan.name}</p>
                    <p className={styles.planSub}>Monthly subscription</p>
                  </div>
                </div>
              </div>

              <span className={styles.swapArrow} aria-hidden="true">
                <Icon name="chevronRight" size="20px" />
              </span>

              <div className={styles.swapSide}>
                <p className={styles.swapLabel}>New plan</p>
                <div className={styles.swapPlan}>
                  <PlanIcon icon={plan.icon} />
                  <div>
                    <p className={styles.planName}>{plan.name}</p>
                    <p className={styles.planSub}>Monthly subscription</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.block}>
              <p className={styles.planName}>{plan.name} plan</p>
              <p className={styles.planSub}>Monthly subscription</p>
            </div>
          )}

          {/* ---- upcoming charges (1:10194) ---- */}
          <div className={styles.charges}>
            <h3 className={styles.chargesTitle}>Upcoming charges</h3>

            <ol className={styles.timeline}>
              <li className={styles.event}>
                <span className={styles.dot} aria-hidden="true" />
                <p className={styles.when}>Today</p>
                <p className={styles.amount}>
                  <span className={styles.amountFigure}>
                    {scheduled ? formatGBP(0) : quote.dueTodayLabel}
                  </span>
                </p>
                <p className={styles.detail}>
                  {scheduled ? (
                    <>
                      Nothing to pay. You keep {summary.plan.name} and its{' '}
                      {summary.credits.allowance} credits until{' '}
                      {quote.effectiveOnLabel}.
                    </>
                  ) : quote.credit > 0 ? (
                    <>
                      {quote.newPriceLabel} for {plan.name}, less {quote.creditLabel} for the{' '}
                      {quote.daysLeft} days left on {summary.plan.name}.
                    </>
                  ) : (
                    <>
                      {plan.name} starts today with {plan.credits} credits —{' '}
                      {plan.inPlainTerms}.
                    </>
                  )}
                </p>
              </li>

              <li className={styles.event}>
                <span className={`${styles.dot} ${styles.dotEnd}`} aria-hidden="true" />
                <p className={styles.when}>
                  Starting {scheduled ? quote.effectiveOnLabel : quote.nextRenewalLabel}
                </p>
                <p className={styles.amount}>
                  <span className={styles.amountFigure}>{quote.newPriceLabel}</span>
                  <span className={styles.amountUnit}>/monthly</span>
                </p>
                <p className={styles.detail}>
                  {scheduled
                    ? `${plan.name} takes over — ${plan.credits} credits a month, ${plan.inPlainTerms}.`
                    : `Renews automatically at ${quote.newPriceLabel} ${quote.periodLabel} until you cancel.`}
                </p>
              </li>
            </ol>
          </div>

          {/* ---- card on file (1:10211) ---- */}
          <div className={styles.card}>
            <div className={styles.cardText}>
              <p className={styles.cardLabel}>Card details:</p>
              {summary.card ? (
                <p className={styles.cardLine}>
                  <BrandMark brand={summary.card.brand} className={styles.brand} />
                  {summary.card.brand} &bull;&bull;&bull;&bull; {summary.card.last4}
                </p>
              ) : (
                <p className={styles.cardLine}>No card on file</p>
              )}
            </div>
            <span className={styles.cardChevron} aria-hidden="true">
              <Icon name="chevronRight" size="20px" />
            </span>
          </div>

          {/* 52 carries a red "Impact message here" placeholder. This says what
              actually changes, which is the only reason to show the strip. */}
          {scheduled ? (
            <p className={styles.impact}>
              {plan.credits} credits a month instead of {summary.credits.allowance}, and
              recordings kept for {retentionOf(plan)} instead of {retentionOf(summary.plan)}.
            </p>
          ) : null}

          {/* Figma cites the Isotopes Terms of Service — the template's. */}
          <p className={styles.legal}>
            {scheduled
              ? `Nothing is charged today. ${plan.name} starts on ${quote.effectiveOnLabel}, and you can revert it before then.`
              : `Your subscription renews automatically until you cancel. We will tell you before any price changes, and you can cancel at any time from this screen.`}
          </p>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="sm"
              className={styles.submit}
              disabled={step === 'working'}
              onClick={submit}
            >
              {step === 'working' ? (
                <Spinner size="sm" label="Updating your plan" />
              ) : scheduled ? (
                'Downgrade'
              ) : (
                'Subscribe'
              )}
            </Button>

            {scheduled ? (
              <Button
                variant="secondary"
                size="sm"
                className={styles.close2}
                disabled={step === 'working'}
                onClick={onClose}
              >
                Close
              </Button>
            ) : null}
          </div>
        </div>
      </Modal>

      {/* ------------------------------------ 42 (1:10230) / 47 (1:11366) done */}
      <Modal
        open={open && step === 'done'}
        onClose={onDone || onClose}
        showClose={false}
        label={scheduled ? 'Downgrade scheduled' : `${plan.name} confirmed`}
        className={styles.dialog}
        scrimClassName={styles.dialogScrim}
      >
        <div className={styles.doneBody}>
          <span className={styles.mark} aria-hidden="true">
            <Icon name="check" size="18px" strokeWidth={2.5} />
          </span>

          {/* 53 (1:15219): "Downgrade scheduled: Core Prep -> Starter." */}
          <h2 className={styles.doneTitle} tabIndex={-1}>
            {scheduled
              ? `Downgrade scheduled: ${summary.plan.name} → ${plan.name}`
              : `You are on ${plan.name}`}
          </h2>

          {/* Figma: "Congratulation! You have successful scribed to monthly
              teams plan." */}
          <p className={styles.doneText}>
            {scheduled ? (
              <>
                You keep {summary.plan.name} and its {summary.credits.allowance} credits until{' '}
                <strong>{quote.effectiveOnLabel}</strong>. After that {plan.name} takes over at{' '}
                <strong>
                  {quote.newPriceLabel} {quote.periodLabel}
                </strong>
                , with {plan.credits} credits a month. You can revert it any time before then
                from Manage plan or Billing.
              </>
            ) : (
              <>
                {quote.dueToday > 0 ? (
                  <>
                    <strong>{quote.dueTodayLabel}</strong> has been taken today.{' '}
                  </>
                ) : null}
                Your {plan.credits} credits are ready now — {plan.inPlainTerms}. It renews at{' '}
                <strong>
                  {quote.newPriceLabel} {quote.periodLabel}
                </strong>{' '}
                on <strong>{quote.nextRenewalLabel}</strong>.
              </>
            )}
          </p>

          {/* 53 labels it "Got it"; the upgrade artboards say Done. */}
          <Button variant="primary" size="sm" className={styles.done} onClick={onDone || onClose}>
            {scheduled ? 'Got it' : 'Done'}
          </Button>
        </div>
      </Modal>
    </>
  )
}

/** Closing is inert while the change is being applied. */
function noop() {}

/** The retention line a plan advertises, for the downgrade's impact strip. */
function retentionOf(plan) {
  const line = plan.features.find((f) => f.startsWith('Recordings kept for'))
  return line ? line.replace('Recordings kept for ', '') : 'the same period'
}
