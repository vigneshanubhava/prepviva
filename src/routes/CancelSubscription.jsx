import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Icon, Modal, Select, Spinner, VisuallyHidden } from '../components/ui/index.js'
import { CANCEL_REASONS, CANCEL_REASON_OTHER } from '../data/account.js'
import styles from './CancelSubscription.module.css'

/**
 * Cancel subscription — artboards 27-32 of the cancel flow section (1:6543).
 *
 *   27 (1:6928)  the modal, no reason chosen, confirm disabled
 *   28 (1:7374)  a reason chosen, confirm live
 *   29 (1:7820)  "Other" chosen, the message box open
 *   30 (1:8267)  confirming — spinner in the button, everything else disabled
 *   31 (1:8713)  confirmed — the button settles on a green tick
 *   32 (1:9513)  the confirmation dialog, over an already-cancelled screen
 *
 * The four in-modal artboards are one component's states, not four screens.
 * Copy is corrected from the docs: Figma's "untill", "canceling" and its $49
 * belong to the B2B template.
 */

// How long the mock cancellation takes, and how long the tick sits before the
// confirmation dialog replaces it. Both are prototype timing, not real work.
const WORKING_MS = 1100
const SETTLE_MS = 900

/** Closing is deliberately inert while the cancellation is under way. */
function noop() {}

export default function CancelSubscription({ open, summary, onConfirm, onClose }) {
  const [step, setStep] = useState('form')   // form | working | done | confirmed
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const dialogRef = useRef(null)
  const confirmRef = useRef(onConfirm)
  confirmRef.current = onConfirm

  const other = reason === CANCEL_REASON_OTHER

  // A fresh open starts from the top: the artboards have no "resume" state.
  useEffect(() => {
    if (open) {
      setStep('form')
      setReason('')
      setNote('')
    }
  }, [open])

  useEffect(() => {
    if (step === 'working') {
      const timer = setTimeout(() => setStep('done'), WORKING_MS)
      return () => clearTimeout(timer)
    }
    if (step === 'done') {
      const timer = setTimeout(() => {
        // The mutation lands with the confirmation dialog, so the billing
        // screen behind it already shows the cancelled state — as artboard 32.
        confirmRef.current?.({ reason, note: other ? note : '' })
        setStep('confirmed')
      }, SETTLE_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [step, reason, note, other])

  function submit(event) {
    event.preventDefault()
    if (!reason) return
    // Confirming disables the button that was clicked, which would drop focus
    // to <body> and take it out of the dialog. Park it on the heading instead.
    dialogRef.current?.closest('[role="dialog"]')?.querySelector('h2')?.focus()
    setStep('working')
  }

  const busy = step === 'working' || step === 'done'

  return (
    <>
      {/* Nothing can interrupt the cancellation once it is under way. */}
      <Modal
        open={open && step !== 'confirmed'}
        onClose={busy ? noop : onClose}
        closeOnScrim={!busy}
        title="Cancel subscription"
        closeLabel="Close without cancelling"
        className={styles.panel}
        scrimClassName={styles.scrim}
      >
        <form className={styles.form} onSubmit={submit} ref={dialogRef}>
          {/* Figma: "Your Starter subscription will be cancelled but will remain
              active untill the end of your billing period on Nov 20, 2025" */}
          <p className={styles.lede}>
            Your {summary.plan.name} subscription will be cancelled, but stays active until{' '}
            <span className={styles.strong}>{summary.accessEndsLabel}</span> — the end of the
            period you have already paid for.{' '}
            {summary.trialing ? (
              <>
                The <span className={styles.strong}>{summary.amountLabel}</span> due that day will
                not be taken.
              </>
            ) : (
              <>
                No further payment of{' '}
                <span className={styles.strong}>{summary.amountLabel}</span> will be taken.
              </>
            )}
          </p>

          <div className={styles.reason}>
            {/* Figma: "Help us understand your reason for canceling:" */}
            <Select
              label="Help us understand why you are cancelling"
              size="sm"
              placeholder="Select a reason"
              options={CANCEL_REASONS}
              value={reason}
              disabled={busy}
              onChange={(event) => setReason(event.target.value)}
              fieldClassName={styles.field}
              className={styles.select}
            />

            {other ? (
              <span className={styles.note}>
                <VisuallyHidden as="label" htmlFor="cancel-note">
                  Tell us more about why you are cancelling
                </VisuallyHidden>
                {/* Figma: "Enter your message" */}
                <textarea
                  id="cancel-note"
                  className={styles.textarea}
                  placeholder="Tell us what happened"
                  value={note}
                  disabled={busy}
                  onChange={(event) => setNote(event.target.value)}
                />
              </span>
            ) : null}
          </div>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="sm"
              className={styles.back}
              disabled={busy}
              onClick={onClose}
            >
              Go back
            </Button>

            {step === 'done' ? (
              <Button
                variant="danger"
                size="sm"
                className={`${styles.confirm} ${styles.settled}`}
                disabled
              >
                <Icon name="checkCircle" size="14px" />
                <VisuallyHidden>Subscription cancelled</VisuallyHidden>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="danger"
                size="sm"
                className={`${styles.confirm} ${busy ? styles.working : ''}`}
                disabled={!reason || busy}
              >
                {step === 'working' ? (
                  <Spinner size="sm" label="Cancelling your subscription" />
                ) : (
                  'Cancel subscription'
                )}
              </Button>
            )}
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------- 32 (1:9513) done */}
      <Modal
        open={open && step === 'confirmed'}
        onClose={onClose}
        showClose={false}
        label="Subscription cancelled"
        className={styles.dialog}
        scrimClassName={styles.dialogScrim}
      >
        <div className={styles.doneBody}>
          <span className={styles.mark} aria-hidden="true">
            <Icon name="check" size="18px" strokeWidth={2.5} />
          </span>

          {/* Not a Modal title: the artboard puts the heading under the tick,
              inside the body, at 20px/28 rather than in a header row. */}
          <h2 className={styles.doneTitle} tabIndex={-1}>
            Your subscription has been cancelled.
          </h2>

          <p className={styles.doneText}>
            You can keep using everything until{' '}
            <span className={styles.strong}>{summary.accessEndsLabel}</span>. Your{' '}
            {summary.credits.remaining} remaining credits stay usable until then. If you would
            like to keep your access beyond that date, you can renew any time.
          </p>

          <Button variant="primary" size="sm" className={styles.got} onClick={onClose}>
            Got it
          </Button>

          {/* Not on the artboard. 34 (14:10022) is the email this cancellation
              sends, and no email is really sent, so it needs a way in — the
              same clearly-marked affordance the magic-link flow uses. */}
          <Link
            className={styles.proto}
            to="/billing/canceled-email"
            state={{ accessEnds: summary.accessEnds.toISOString(), reason }}
          >
            <span className={styles.protoTag}>Prototype only</span>
            View the confirmation email
          </Link>
        </div>
      </Modal>
    </>
  )
}
