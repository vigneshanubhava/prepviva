import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  ChipGroup,
  ChoiceCards,
  FileDrop,
  Icon,
  Input,
  Select,
  StepProgress,
  useToast,
} from '../components/ui/index.js'
import AuthShell from '../components/AuthShell.jsx'
import { useAccount } from '../data/AccountProvider.jsx'
import {
  CV_MAX_MB,
  CV_TYPES,
  DATE_STATES,
  EXPERIENCE,
  TRACKS,
  WORRIES,
  focusFromWorries,
  focusNoun,
  trackById,
} from '../data/onboarding.js'
import { formatDate } from '../data/trial.js'
import styles from './Onboarding.module.css'

/**
 * First-run setup — a full page, not a modal.
 *
 * The flow is the sibling `interview-prototype`'s onboarding
 * (`src/features/onboarding/`): about you, track and role, interview date and
 * experience, what worries you, one real question, then the CV. Its shell is a
 * bare centred column; this one is `AuthShell`, the banner-and-card composition
 * every other out-of-app screen in PrepViva uses (1:2167, 1:2230, 1:3169), so
 * setup looks like the rest of this app rather than like the reference.
 *
 * The progress row, the choice cards, the chips and the CV drop zone were this
 * screen's own parts and are now `StepProgress`, `ChoiceCards`, `ChipGroup` and
 * `FileDrop` in the component library, shown in every state at /kitchen-sink.
 * The onboarding modal on artboards 15-17 is not used: a six-step form does not
 * belong in a 594px dialog, and the request was a page.
 *
 * Only the name is required. Everything after it can be skipped — the reference
 * calls the CV "deferred-required", asked for here and enforced before a first
 * session, which is a screen that does not exist yet.
 */

const STEPS = ['about', 'track', 'date', 'worries', 'question', 'cv']

/**
 * Where setup lets you out — finished or skipped, the same place. The dashboard
 * is where the magic link signs you in, and the track this flow collects is the
 * one it opens on, so setup hands straight over to it.
 */
const LANDING = '/dashboard'

export default function Onboarding() {
  const { account, onboard, skipOnboarding } = useAccount()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [draft, setDraft] = useState(() => ({
    name: account.name || '',
    phone: account.profile?.phone || '',
    track: account.profile?.track || null,
    role: account.profile?.role || '',
    dateState: account.profile?.dateState || 'has-date',
    interviewDate: account.profile?.interviewDate || '',
    experience: account.profile?.experience || null,
    worries: account.profile?.worries || [],
    resume: account.profile?.resume || null,
  }))

  const headingRef = useRef(null)

  const current = STEPS[step]
  const track = trackById(draft.track)
  const last = step === STEPS.length - 1

  /**
   * Each step is a new screen inside one route, so focus goes to its heading —
   * the reference does the same, and without it a keyboard user is left on the
   * button they just pressed while the page underneath has changed.
   */
  useEffect(() => {
    headingRef.current?.focus()
  }, [step])

  const set = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: null } : e))
  }

  const preview = useMemo(
    () => focusFromWorries(draft.track, draft.worries),
    [draft.track, draft.worries],
  )

  function validate() {
    if (current === 'about') {
      const next = {}
      if (draft.name.trim().length < 2) {
        next.name = 'Enter the name you would give an interviewer.'
      }
      // The phone is asked for, not demanded: a number that is there has to be
      // a number, an empty one is a skip.
      if (draft.phone.trim() && !/^\+?\d{10,14}$/.test(draft.phone.replace(/[\s()-]/g, ''))) {
        next.phone = 'That does not look like a phone number — try 07700 900123.'
      }
      if (Object.keys(next).length) {
        setErrors(next)
        return false
      }
    }

    if (current === 'track' && !draft.track) {
      setErrors({ track: "Choose what you're practising for." })
      return false
    }

    if (current === 'date' && draft.dateState === 'has-date' && draft.interviewDate) {
      const chosen = new Date(`${draft.interviewDate}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (Number.isNaN(chosen.getTime())) {
        setErrors({ interviewDate: 'Enter the date as a day, month and year.' })
        return false
      }
      if (chosen < today) {
        setErrors({ interviewDate: 'That date has passed. Pick the next one you are sitting.' })
        return false
      }
    }

    return true
  }

  function finish(details) {
    onboard(details)
    toast({
      tone: 'success',
      title: `You're all set, ${firstName(details.name || draft.name)}`,
      body: summarise(details),
    })
    navigate(LANDING)
  }

  function next() {
    if (!validate()) return
    if (!last) {
      setStep((s) => s + 1)
      return
    }
    finish(draft)
  }

  function back() {
    setErrors({})
    setStep((s) => Math.max(0, s - 1))
  }

  /** Skip leaves this step's answers as they are and moves on. */
  function skip() {
    setErrors({})
    if (!last) {
      setStep((s) => s + 1)
      return
    }
    finish(draft)
  }

  /** Setting up later means the app, with nothing kept. */
  function later() {
    skipOnboarding()
    navigate(LANDING)
  }

  return (
    <AuthShell tone="signup" gap="apart" cardClassName={styles.shellCard}>
      <div className={styles.body}>
        <StepProgress
          step={step}
          total={STEPS.length}
          label={TITLES[current].title(draft, track)}
        />

        <div className={styles.step}>
          <h1 className={styles.h1} ref={headingRef} tabIndex={-1}>
            {TITLES[current].title(draft, track)}
          </h1>
          <p className={styles.lede}>{TITLES[current].lede(draft, track)}</p>

          {/* ------------------------------------------------ 1. about you */}
          {current === 'about' ? (
            <div className={styles.fields}>
              <Input
                label="Full name"
                required
                value={draft.name}
                error={errors.name}
                hint="The name your interviewer will use."
                autoComplete="name"
                onChange={(event) => set('name', event.target.value)}
                fieldClassName={styles.field}
              />
              <Input
                label="Mobile number"
                optional
                type="tel"
                placeholder="07700 900123"
                value={draft.phone}
                error={errors.phone}
                hint="Session reminders only. Nothing else, ever."
                autoComplete="tel"
                onChange={(event) => set('phone', event.target.value)}
                fieldClassName={styles.field}
              />
            </div>
          ) : null}

          {/* --------------------------------------------- 2. track + role */}
          {current === 'track' ? (
            <div className={styles.fields}>
              <ChoiceCards
                legend="Choose one"
                name="track"
                value={draft.track}
                error={errors.track}
                onChange={(value) => {
                  set('track', value)
                  set('role', '')
                }}
                options={TRACKS.map((entry) => ({
                  value: entry.id,
                  label: entry.label,
                  detail: entry.blurb,
                  icon: entry.icon,
                  accent: entry.accent,
                }))}
              />

              {track ? (
                <Select
                  label={track.subLabel}
                  placeholder="Select one"
                  value={draft.role}
                  options={track.sub.map((option) => ({ value: option, label: option }))}
                  onChange={(event) => set('role', event.target.value)}
                  fieldClassName={styles.field}
                />
              ) : null}
            </div>
          ) : null}

          {/* ---------------------------------------- 3. date + experience */}
          {current === 'date' ? (
            <div className={styles.fields}>
              <ChoiceCards
                legend="Where are you up to?"
                name="dateState"
                value={draft.dateState}
                onChange={(value) => set('dateState', value)}
                options={DATE_STATES.map((entry) => ({ value: entry.value, label: entry.label }))}
                layout="row"
              />

              {draft.dateState === 'has-date' ? (
                <Input
                  label="Interview date"
                  type="date"
                  value={draft.interviewDate}
                  error={errors.interviewDate}
                  hint={`Today is ${formatDate(new Date())}.`}
                  onChange={(event) => set('interviewDate', event.target.value)}
                  fieldClassName={styles.field}
                />
              ) : null}

              <ChoiceCards
                legend="Interviewed before?"
                caption="Sets your starting difficulty. Changeable any time."
                name="experience"
                value={draft.experience}
                onChange={(value) => set('experience', value)}
                options={EXPERIENCE.map((entry) => ({
                  value: entry.value,
                  label: entry.label,
                  detail: entry.detail,
                }))}
                layout="row"
              />
            </div>
          ) : null}

          {/* ----------------------------------------------- 4. worries */}
          {current === 'worries' ? (
            <div className={styles.fields}>
              <ChipGroup
                legend="Choose any that apply"
                name="worries"
                options={WORRIES}
                value={draft.worries}
                onChange={(next) => set('worries', next)}
              />

              {/* The answers have to visibly do something, or the step reads as
                  a survey — the reference makes the same point. */}
              {preview.length ? (
                <div className={styles.preview}>
                  <p className={styles.previewTitle}>
                    <Icon name="sparkle" size="16px" />
                    Your first interview will open on these {focusNoun(draft.track)}
                  </p>
                  <p className={styles.previewList}>
                    {preview.map((item) => (
                      <span key={item} className={styles.previewItem}>
                        {item}
                      </span>
                    ))}
                  </p>
                  <p className={styles.previewNote}>
                    Pre-selected, not fixed — you can change them when you set the interview up.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* --------------------------------------------- 5. one question */}
          {current === 'question' ? (
            <div className={styles.fields}>
              <blockquote className={styles.quote}>
                <p className={styles.quoteEyebrow}>Examiner</p>
                <p className={styles.quoteText}>
                  &ldquo;{(track || TRACKS[0]).question}&rdquo;
                </p>
              </blockquote>
              <p className={styles.quoteAfter}>
                {draft.experience === 'first'
                  ? 'In guided mode you get tips after each question and one retry — a good place to start.'
                  : 'You answer out loud, on camera, and get scored feedback on structure, evidence and delivery.'}
              </p>
            </div>
          ) : null}

          {/* ---------------------------------------------------- 6. the CV */}
          {current === 'cv' ? (
            <div className={styles.fields}>
              <FileDrop
                label="CV or résumé"
                hint={`${CV_TYPES.join(', ')} — up to ${CV_MAX_MB}MB`}
                accept={CV_TYPES}
                maxMB={CV_MAX_MB}
                file={draft.resume}
                error={errors.resume}
                onSelect={(meta) => set('resume', meta)}
                onReject={(message) => setErrors({ resume: `${message} Try exporting it as a PDF.` })}
              />

              {/* Purpose, retention and deletion, on the screen that asks for
                  the document — the reference's GDPR line. */}
              <p className={styles.fine}>
                Your CV is read only to personalise your questions. It is never shared, and you can
                delete it any time from Settings.
              </p>

              {!draft.resume ? (
                <p className={styles.warn}>
                  <Icon name="alertTriangle" size="16px" />
                  You can skip this, but a CV is needed before your first interview starts.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* ---- footer ---- */}
        <div className={styles.footer}>
          <Button
            variant="primary"
            size="md"
            className={styles.next}
            iconRight={<Icon name="chevronRight" size="16px" />}
            onClick={next}
          >
            {last ? (draft.resume ? 'Finish setup' : 'Continue without a CV') : 'Continue'}
          </Button>

          <div className={styles.footerLinks}>
            {step > 0 ? (
              <Button variant="secondary" size="md" className={styles.secondary} onClick={back}>
                Back
              </Button>
            ) : null}

            {SKIPPABLE.includes(current) ? (
              <Button variant="secondary" size="md" className={styles.secondary} onClick={skip}>
                Skip this step
              </Button>
            ) : null}

            <Button variant="secondary" size="md" className={styles.secondary} onClick={later}>
              Set up later
            </Button>
          </div>
        </div>
      </div>
    </AuthShell>
  )
}

/**
 * Which steps offer a Skip of their own. The first two are what the app needs to
 * set anything up; the question step has nothing to fill in; and on the CV step
 * the primary button already reads "Continue without a CV", so a second way to
 * skip would only ask the same thing twice.
 */
const SKIPPABLE = ['date', 'worries']

const TITLES = {
  about: {
    title: (draft) => (firstName(draft.name) ? `Welcome, ${firstName(draft.name)}` : 'Welcome'),
    lede: () =>
      'Two details before your first interview. This takes about a minute, and you can change any of it later.',
  },
  track: {
    title: () => "What are you practising for?",
    lede: () =>
      'This sets up your interviews — you can try the other tracks whenever you like.',
  },
  date: {
    title: () => 'When is your interview?',
    lede: () => "We count down to it and pace your practice. Skip if you don't know yet.",
  },
  worries: {
    title: () => 'What worries you most?',
    lede: () => "Pick as many as you like. We'll weight your first interview towards them.",
  },
  question: {
    title: () => "Here's one you'll face",
    lede: (draft, track) =>
      `A real question from ${(track || TRACKS[0]).label} interviews at your level.`,
  },
  cv: {
    title: () => 'Add your CV',
    lede: () =>
      'Your interviewer asks about your actual audits, placements and publications — not generic examples.',
  },
}

function firstName(full) {
  return (full || '').trim().split(' ')[0] || ''
}

/** The toast states what was actually kept, like every other one in the app. */
function summarise({ track, role, interviewDate, resume, phone }) {
  const parts = []
  const chosen = trackById(track)
  if (chosen) parts.push(role ? `${chosen.label} · ${role}` : chosen.label)
  if (interviewDate) parts.push(`interview on ${formatDate(new Date(`${interviewDate}T00:00:00`))}`)
  if (resume) parts.push(resume.name)
  if (phone?.trim()) parts.push(`reminders to ${phone.trim()}`)
  return parts.length ? `Saved: ${parts.join(' · ')}.` : 'You can finish setting up any time from Settings.'
}
