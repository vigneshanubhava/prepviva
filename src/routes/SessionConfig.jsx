import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { Button, Icon, useToast } from '../components/ui/index.js'
import {
  OrderPanel,
  StepContext,
  StepFocus,
  StepFormat,
  StepReady,
  SummaryRail,
} from './SessionSteps.jsx'
import { useAccount } from '../data/AccountProvider.jsx'
import {
  costOf,
  costRange,
  defaultFormat,
  focusFromWorries,
  focusTarget,
  isCircuit,
  minutesOf,
  trackConfig,
} from '../data/practice.js'
import styles from './SessionConfig.module.css'

/**
 * The session configurator — `/practice/:trackId`.
 *
 * Four steps: Context, Format, Focus, Ready. It owns everything the candidate
 * is choosing; `data/practice.js` owns what those choices are. Ported from the
 * reference prototype's `ConfigWizard`, in this app's own components and
 * surface.
 *
 * It is addressed by track rather than held in the parent's state, so a
 * half-configured session survives a refresh — and so the dashboard's
 * recommendation card can hand a whole configuration over in router state
 * instead of the candidate re-answering what the app already knows.
 */

const STEPS = ['Context', 'Format', 'Focus', 'Ready']

/** The configuration a track starts on: a plan wholesale, or the defaults with
 *  focus pre-selected from what setup said worried them. */
function initialState(config, plan, worries) {
  if (plan) {
    /* consent is never pre-ticked, whatever else is */
    return { ctx: plan.ctx, format: plan.format, picked: plan.picked, consent: false }
  }

  const format = defaultFormat(config)
  const cap = focusTarget(config, format)

  return {
    ctx: {},
    format,
    picked: worries?.length ? focusFromWorries(config.id, worries, cap) : [],
    consent: false,
  }
}

export default function SessionConfig() {
  const { trackId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { account, summary, spend } = useAccount()
  const { toast } = useToast()

  const config = trackConfig(trackId)
  const plan = location.state?.plan ?? null
  const profile = account.profile
  const balance = summary.credits.remaining

  const [state, setState] = useState(() => (config ? initialState(config, plan, profile.worries) : null))
  const [step, setStep] = useState(1)
  const [reached, setReached] = useState(1)

  /* Re-seed when the track or the incoming plan changes. Both arrive from the
     URL, so this is a navigation rather than a render-time surprise. */
  useEffect(() => {
    if (!config) return
    setState(initialState(config, plan, profile.worries))
    /* A plan that recovered everything lands on Ready to confirm. One that
       could not lands on the step that owns the missing answer — with every
       step after it still filled in. */
    const landing = !plan ? 1 : plan.missing.length ? 1 : plan.cost > balance ? 2 : 4
    setStep(landing)
    setReached(plan ? 4 : 1)
    // balance is deliberately not a dependency: re-seeding on a spend would
    // throw away a configuration mid-flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, plan])

  const circuit = isCircuit(config)
  const cost = useMemo(() => costOf(config, state?.format || {}), [config, state?.format])

  if (!config) return <Navigate to="/practice" replace />
  /* The CV rule is enforced on the practice screen, which is also where it can
     be fixed — a session cannot be configured around a CV that is not there. */
  if (!profile.resume) return <Navigate to="/practice" replace />
  if (!state) return null

  const { ctx, format, picked, consent } = state
  const patch = (next) => setState((s) => ({ ...s, ...next }))
  const target = focusTarget(config, format)
  const affordable = cost > 0 && cost <= balance

  function go(n) {
    setStep(n)
    setReached((m) => Math.max(m, n))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* Dropping the station count has to trim the circuit too, or step 3 keeps
     stations that no longer have a slot. */
  function setStations(n) {
    setState((s) => ({
      ...s,
      format: { ...s.format, stations: n },
      picked: s.picked.length > n ? s.picked.slice(0, n) : s.picked,
    }))
  }

  function toggle(item) {
    setState((s) => {
      if (s.picked.includes(item)) return { ...s, picked: s.picked.filter((x) => x !== item) }
      const cap = circuit ? s.format.stations : config.focus.max
      if (s.picked.length >= cap) return s
      return { ...s, picked: [...s.picked, item] }
    })
  }

  function move(i, direction) {
    setState((s) => {
      const next = [...s.picked]
      const j = i + direction
      if (j < 0 || j >= next.length) return s
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...s, picked: next }
    })
  }

  /**
   * Starting spends the credits. The interview room is not built in this
   * prototype, so this lands back on the dashboard — where the spend is
   * visible in the same figures the session was priced against.
   */
  function start() {
    spend(cost)
    toast({
      tone: 'success',
      title: `${config.name} session started`,
      body: `${cost} credits used — ${balance - cost} left. The interview room is not built in this prototype, so you are back on the dashboard.`,
    })
    navigate('/dashboard')
  }

  const contextValid = config.context.filter((f) => f.required).every((f) => ctx[f.key])
  const focusValid = circuit ? picked.length === target : picked.length >= config.focus.min
  const canContinue =
    step === 1 ? contextValid : step === 2 ? affordable : step === 3 ? focusValid : consent

  /* Why the button is off, said out loud — a disabled button with no reason is
     the thing this flow is most likely to strand someone on. */
  const blockedBecause = canContinue
    ? null
    : step === 1
      ? 'Answer the required fields to carry on.'
      : step === 2
        ? `This session needs ${cost} credits and you have ${balance}.`
        : step === 3
          ? circuit
            ? `Pick ${target - picked.length} more station${target - picked.length === 1 ? '' : 's'}.`
            : `Pick at least ${config.focus.min - picked.length} more.`
          : 'Agree to the recording to start.'

  const meter =
    step === 1
      ? { label: 'This track costs', value: `${costRange(config)} credits` }
      : step === 2
        ? { label: 'This session', value: `${cost} credits`, live: true }
        : { label: 'Locked in', value: `${cost} credits` }

  return (
    <AppLayout>
      <div className={styles.page} data-track={config.id}>
        <header className={styles.head}>
          <div className={styles.headMain}>
            <Link className={styles.back} to="/practice" aria-label="Back to the track picker">
              <Icon name="arrowLeft" size="16px" strokeWidth={1.5} />
            </Link>
            <div>
              <p className={styles.crumb}>
                <span>{config.label}</span>
                <span aria-hidden="true">›</span>
                <span className={styles.crumbTrack}>{config.stream}</span>
              </p>
              <h1 className={styles.h1}>{STEPS[step - 1]}</h1>
            </div>
          </div>

          <p className={styles.meter} data-live={meter.live || undefined}>
            <span className={styles.meterLabel}>{meter.label}</span>
            <span className={styles.meterValue}>{meter.value}</span>
            <span className={styles.meterBalance}>{balance} in your balance</span>
          </p>
        </header>

        {/* the stepper — a step already reached can be jumped back to */}
        <ol className={styles.stepper}>
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = n < step
            return (
              <li key={label} className={styles.stepperItem}>
                <button
                  type="button"
                  className={styles.stepperBtn}
                  data-on={n === step || undefined}
                  data-done={done || undefined}
                  disabled={n > reached}
                  aria-current={n === step ? 'step' : undefined}
                  onClick={() => go(n)}
                >
                  <span className={styles.stepperMark}>
                    {done ? <Icon name="check" size="12px" strokeWidth={3} /> : n}
                  </span>
                  {label}
                </button>
              </li>
            )
          })}
        </ol>

        <div className={styles.body}>
          <div className={styles.work}>
            {/* Pre-filled answers nobody typed have to say where they came
                from, or the configurator looks like it invented a grade and a
                set of focus areas on its own. */}
            {plan ? (
              <p className={styles.prefill}>
                <Icon name="sparkle" size="16px" strokeWidth={1.5} />
                <span>
                  {plan.intent === 'repeat'
                    ? 'Set up the same as your last session on this track.'
                    : `Filled in from your ${config.stream} scores — weighted towards ${plan.target || 'your weakest areas'}.`}
                  {plan.missing.length
                    ? ` Still needed: ${plan.missing.join(', ').toLowerCase()}.`
                    : ' Change anything before you start.'}
                </span>
              </p>
            ) : null}

            {step === 1 ? (
              <StepContext
                config={config}
                ctx={ctx}
                setCtx={(fn) => patch({ ctx: typeof fn === 'function' ? fn(ctx) : fn })}
              />
            ) : null}

            {step === 2 ? (
              <StepFormat
                config={config}
                format={format}
                setFormat={(fn) => patch({ format: typeof fn === 'function' ? fn(format) : fn })}
                setStations={setStations}
                cost={cost}
                balance={balance}
                affordable={affordable}
              />
            ) : null}

            {step === 3 ? (
              <>
                <StepFocus
                  config={config}
                  picked={picked}
                  toggle={toggle}
                  target={target}
                  circuit={circuit}
                  hint={
                    !plan && profile.worries?.length && picked.length
                      ? 'Pre-selected from what you said worries you. Change any of them.'
                      : null
                  }
                />
                {/* the rail carries this on a wide screen */}
                <OrderPanel
                  className={styles.orderInline}
                  config={config}
                  picked={picked}
                  move={move}
                  circuit={circuit}
                />
              </>
            ) : null}

            {step === 4 ? (
              <StepReady
                config={config}
                ctx={ctx}
                format={format}
                picked={picked}
                cost={cost}
                balance={balance}
                consent={consent}
                setConsent={(value) => patch({ consent: value })}
                onEdit={go}
                circuit={circuit}
                resume={profile.resume}
              />
            ) : null}

            <div className={styles.actions}>
              <Button
                variant="ghost"
                onClick={() => (step === 1 ? navigate('/practice') : go(step - 1))}
                iconLeft={<Icon name="arrowLeft" size="16px" strokeWidth={1.5} />}
              >
                Back
              </Button>

              <div className={styles.actionsEnd}>
                {blockedBecause ? <p className={styles.blocked}>{blockedBecause}</p> : null}
                <Button
                  disabled={!canContinue}
                  onClick={() => (step === 4 ? start() : go(step + 1))}
                  iconRight={<Icon name="arrowRight" size="16px" strokeWidth={1.5} />}
                >
                  {step === 4 ? `Start · ${cost} credits` : 'Continue'}
                </Button>
              </div>
            </div>

            <p className={styles.foot}>
              {minutesOf(config, format)} minutes of practice, priced at 1 credit per 10 minutes.
            </p>
          </div>

          <SummaryRail
            config={config}
            ctx={ctx}
            format={format}
            picked={picked}
            step={step}
            circuit={circuit}
            move={move}
          />
        </div>
      </div>
    </AppLayout>
  )
}
