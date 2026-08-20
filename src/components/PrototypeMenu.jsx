import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { usePrototype } from '../data/PrototypeProvider.jsx'
import {
  ACCOUNT,
  PROTOTYPE_CREDITS,
  PROTOTYPE_PHASES,
  creditLevelOf,
  forceCredits,
  forceCv,
  forcePhase,
  forcePlan,
  forceStatus,
  phaseOf,
} from '../data/account.js'
import { clear as clearSession } from '../data/session.js'
import { HISTORY, HISTORY_STATES } from '../data/dashboard.js'
import { PLANS } from '../data/plans.js'
import styles from './PrototypeMenu.module.css'

/**
 * Prototype controls — the panel doc/BRIEF.md asks for, behind the gear in the
 * header. The reference prototype keeps the same thing in its sidebar
 * (`../interview-prototype/src/app/dev/ScenarioPanel.jsx`).
 *
 * It exists because most of the interesting screens cannot be reached by using
 * the app normally: you cannot run out of credits on demand, you cannot age an
 * account eight months, and you certainly cannot cancel a subscription four
 * times in a demo. Without it those states can only be seen by editing
 * `account.js` mid-presentation.
 *
 * Every control writes real state — the same fields the flows write — so the
 * screens cannot tell a forced state from an earned one. **Delete this
 * component and its button in `AppHeader` before any of this ships.**
 */

/* Both sides of a choice named and on screen at once, the selected one lit. An
   on/off switch makes you infer the other side; this does not. One tab stop per
   row, arrow keys inside it. */
function Choice({ caption, hint, value, options, onChange }) {
  const refs = useRef([])
  const at = Math.max(0, options.findIndex((option) => option.value === value))

  function onKeyDown(event) {
    const last = options.length - 1
    let next = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = at >= last ? 0 : at + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = at <= 0 ? last : at - 1
    if (next === null) return
    event.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div className={styles.row}>
      <p className={styles.caption}>{caption}</p>

      <div
        className={styles.choice}
        role="radiogroup"
        aria-label={caption}
        onKeyDown={onKeyDown}
        style={{ '--proto-cols': options.length }}
      >
        {options.map((option, i) => {
          const on = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={on}
              /* roving tabindex: the whole group is one stop */
              tabIndex={on ? 0 : -1}
              ref={(el) => {
                refs.current[i] = el
              }}
              className={styles.option}
              data-on={on || undefined}
              data-tone={option.tone}
              title={option.hint}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}

export default function PrototypeMenu() {
  const [open, setOpen] = useState(false)
  const { account, summary, setAccount } = useAccount()
  const { history, setHistory } = usePrototype()
  const navigate = useNavigate()

  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) panelRef.current?.querySelector('[role="radio"][tabindex="0"]')?.focus()
  }, [open])

  const status = summary.canceled ? 'canceled' : summary.trialing ? 'trialing' : 'active'

  function runSetup() {
    setOpen(false)
    setAccount((a) => ({ ...a, onboarded: false }))
    navigate('/welcome/setup')
  }

  /**
   * Back to how the prototype opens — and the way back now that state survives
   * a refresh. It clears the tab's stored session as well as the live state,
   * or the next reload would restore what was just thrown away.
   */
  function reset() {
    clearSession()
    setAccount(ACCOUNT)
    setHistory('established')
  }

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.trigger}
        aria-label="Prototype controls"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="settings" size="1.25rem" strokeWidth={2} />
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Prototype controls" ref={panelRef}>
          <div className={styles.head}>
            <p className={styles.eyebrow}>Prototype only</p>
            <p className={styles.lede}>
              Force any state. Every screen reads these the way it reads a real one.
            </p>
          </div>

          <Choice
            caption="Practice history"
            hint={HISTORY[history].note}
            value={history}
            onChange={setHistory}
            options={HISTORY_STATES.map((key) => ({
              value: key,
              label: HISTORY[key].label,
              hint: HISTORY[key].note,
            }))}
          />

          <Choice
            caption="Account age"
            value={phaseOf(account)}
            onChange={(value) => setAccount((a) => forcePhase(a, value))}
            options={PROTOTYPE_PHASES}
          />

          <Choice
            caption="Subscription"
            hint={
              summary.canceled
                ? `Access until ${summary.accessEndsLabel}`
                : summary.trialing
                  ? `${summary.daysLeft} days left, then ${summary.amountLabel}`
                  : `Renews ${summary.chargeDateLabel}`
            }
            value={status}
            onChange={(value) => setAccount((a) => forceStatus(a, value))}
            options={[
              { value: 'trialing', label: 'Trial' },
              { value: 'active', label: 'Active' },
              { value: 'canceled', label: 'Cancelled', tone: 'warn' },
            ]}
          />

          <Choice
            caption="Plan"
            value={account.planId}
            onChange={(value) => setAccount((a) => forcePlan(a, value))}
            options={PLANS.map((plan) => ({
              value: plan.id,
              label: plan.name,
              hint: `${plan.credits} credits a month`,
            }))}
          />

          <Choice
            caption="Credits"
            hint={`${summary.credits.remaining} of ${summary.credits.allowance} left — ${summary.credits.remainingInPlainTerms}`}
            value={creditLevelOf(account)}
            onChange={(value) => setAccount((a) => forceCredits(a, value))}
            options={PROTOTYPE_CREDITS}
          />

          <Choice
            caption="CV on the account"
            hint="Practice is gated on it"
            value={account.profile.resume ? 'attached' : 'missing'}
            onChange={(value) => setAccount((a) => forceCv(a, value === 'attached'))}
            options={[
              { value: 'attached', label: 'Attached' },
              { value: 'missing', label: 'Missing', tone: 'warn' },
            ]}
          />

          <div className={styles.actions}>
            <button type="button" className={styles.action} onClick={runSetup}>
              Run first-run setup
            </button>
            <button type="button" className={styles.action} onClick={reset}>
              Reset
            </button>
          </div>

          <p className={styles.foot}>
            State lives in memory only — a reload puts everything back.
          </p>
        </div>
      ) : null}
    </span>
  )
}
