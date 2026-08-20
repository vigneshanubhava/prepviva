import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AvatarUpload,
  Badge,
  Button,
  ChipGroup,
  ChoiceCards,
  FileDrop,
  Icon,
  Input,
  Modal,
  RadioGroup,
  SegmentedControl,
  Select,
  Spinner,
  Switch,
  useToast,
} from '../components/ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { useTheme } from '../theme/ThemeProvider.jsx'
import { ACCOUNT } from '../data/account.js'
import {
  CV_MAX_MB,
  CV_TYPES,
  PHOTO_MAX_MB,
  PHOTO_TYPES,
  DATE_STATES,
  EXPERIENCE,
  TRACKS,
  WORRIES,
  trackById,
} from '../data/onboarding.js'
import {
  CAMERAS,
  DIAGNOSTIC_CHECKS,
  DIAGNOSTIC_STEP_MS,
  LATENCY_BANDS,
  LATENCY_SAMPLES,
  MICROPHONES,
  NOTIFICATIONS,
  RETENTION,
  SPEAKERS,
  STALE_SESSION_DAYS,
  exportPayload,
  lastActiveLabel,
  latencyBand,
  passwordChangedLabel,
} from '../data/settings.js'
import { formatDate } from '../data/trial.js'
import { Disclosure, Panel, Row, Rows, SaveBar, SectionHead } from './SettingsParts.jsx'
import { useDraft } from './settingsDraft.js'
import styles from './Settings.module.css'

/**
 * The seven settings sections. One file, because they share the same anatomy —
 * a head, panels of rows, and a save bar over one draft — and splitting them
 * into seven files would hide that they are the same screen seven times.
 *
 * Each section owns its own draft and its own save. Nothing here saves on
 * keystroke: an answer you can change is an answer you can change back, and a
 * form that writes as you type has no Discard.
 */

/* ── 1. Profile ──────────────────────────────────────────────────────────── */

const PHONE = /^[+\d][\d\s()-]{6,}$/
const LINKEDIN = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i

export function ProfileSection() {
  const { account, summary, saveDetails, savePhoto, removePhoto } = useAccount()
  const { toast } = useToast()

  const committed = useMemo(
    () => ({
      name: account.name,
      phone: account.profile.phone || '',
      linkedin: account.profile.linkedin || '',
    }),
    [account.name, account.profile.phone, account.profile.linkedin],
  )

  const { draft, dirty, set, reset } = useDraft(committed)
  const [errors, setErrors] = useState({})
  const [photoError, setPhotoError] = useState(null)

  function save() {
    const found = {}
    if (!draft.name.trim()) found.name = 'Your name is on every report — it cannot be blank.'
    if (draft.phone.trim() && !PHONE.test(draft.phone.trim()))
      found.phone = 'Digits, spaces and brackets only, with the country code if you have one.'
    if (draft.linkedin.trim() && !LINKEDIN.test(draft.linkedin.trim()))
      found.linkedin = 'A full profile address, starting https://linkedin.com/in/'

    setErrors(found)
    if (Object.keys(found).length > 0) return

    saveDetails(draft)
    toast({ tone: 'success', title: 'Details saved', body: 'Your account now reads the new details.' })
  }

  return (
    <>
      <SectionHead
        title="Profile"
        blurb="Who you are on this account, and how we reach you about a session."
      />

      <Panel icon="userCheck" title="Your details" sub="Shown on your reports and in the app header.">
        <div className={styles.identity}>
          <div className={styles.identityHead}>
            <div className={styles.identityText}>
              <p className={styles.identityName}>{account.name}</p>
              <p className={styles.identityMeta}>
                {summary.plan.name} &middot; member since {formatDate(account.signedUpOn)}
              </p>
            </div>

            <Badge tone={summary.canceled ? 'danger' : summary.trialing ? 'warning' : 'success'}>
              {summary.canceled ? 'Cancelled' : summary.trialing ? 'On trial' : 'Active'}
            </Badge>
          </div>

          {/* Named buttons rather than the menu's camera badge: this is the
              screen with room to say what each one does, and the only one
              where deleting the photograph has to be possible. Same file
              dialog and the same two checks behind both. */}
          <AvatarUpload
            actions
            className={styles.identityPhoto}
            name={account.name}
            src={account.avatar?.url}
            size="xl"
            accept={PHOTO_TYPES}
            maxMB={PHOTO_MAX_MB}
            onSelect={(file) => {
              setPhotoError(null)
              return savePhoto(file).then(() => toast({ tone: 'success', title: 'Photo updated' }))
            }}
            onRemove={() => {
              setPhotoError(null)
              removePhoto()
              toast({ tone: 'success', title: 'Photo removed' })
            }}
            onReject={(message) => setPhotoError(message)}
          />

          {photoError ? (
            <p className={styles.identityError} role="alert">
              <Icon name="alertCircle" size="14px" strokeWidth={1.6} />
              {photoError}
            </p>
          ) : null}
        </div>

        <div className={styles.fields}>
          <Input
            label="Full name"
            required
            value={draft.name}
            error={errors.name}
            onChange={(event) => set({ name: event.target.value })}
          />

          <Input
            label="Mobile number"
            optional
            type="tel"
            placeholder="+44 7700 900000"
            hint="Only used for session reminders, and only while they are switched on."
            value={draft.phone}
            error={errors.phone}
            onChange={(event) => set({ phone: event.target.value })}
          />

          <Input
            label="Email"
            readOnly
            value={account.email}
            hint="Your sign-in link goes here. Changing it needs a verified swap, which this prototype has no backend for."
            fieldClassName={styles.wide}
          />

          <Input
            label="LinkedIn profile"
            optional
            placeholder="https://linkedin.com/in/your-profile"
            hint="Used to pull context into your practice questions."
            value={draft.linkedin}
            error={errors.linkedin}
            onChange={(event) => set({ linkedin: event.target.value })}
            fieldClassName={styles.wide}
          />
        </div>

        <Disclosure>
          JPG, PNG or WEBP, up to {PHOTO_MAX_MB}MB. Your photo is prepared in this browser — squared
          to 256px and kept on this device. Without one, your initials stand in throughout PrepViva.
        </Disclosure>
      </Panel>

      <SaveBar dirty={dirty} onSave={save} onDiscard={reset} />
    </>
  )
}

/* ── 2. Interview profile ────────────────────────────────────────────────── */

export function InterviewSection() {
  const { account, saveInterviewProfile, attachCv, detachCv } = useAccount()
  const { toast } = useToast()
  const profile = account.profile

  const committed = useMemo(
    () => ({
      track: profile.track || '',
      role: profile.role || '',
      dateState: profile.dateState || '',
      interviewDate: profile.interviewDate || '',
      experience: profile.experience || '',
      worries: profile.worries || [],
    }),
    [profile],
  )

  const { draft, dirty, set, reset } = useDraft(committed)
  const [cvError, setCvError] = useState(null)

  const track = trackById(draft.track)
  const roles = track ? track.sub : []

  function save() {
    saveInterviewProfile(draft)
    toast({
      tone: 'success',
      title: 'Interview profile saved',
      body: 'Your dashboard and your next session follow these answers.',
    })
  }

  return (
    <>
      <SectionHead
        title="Interview profile"
        blurb="The answers first-run setup collected. They decide which track your dashboard opens on, and what a new session is weighted towards."
      />

      <Panel
        icon="graduationCap"
        title="Track and role"
        sub="Changing the track changes the rubric you are marked against — and the track the dashboard opens on."
      >
        <ChoiceCards
          legend="Which interview are you preparing for?"
          layout="row"
          value={draft.track}
          onChange={(value) => {
            const next = trackById(value)
            // the role belongs to a track; keep it only if the new track offers it
            set({ track: value, role: next?.sub.includes(draft.role) ? draft.role : '' })
          }}
          options={TRACKS.map((item) => ({
            value: item.id,
            label: item.label,
            detail: item.blurb,
            icon: item.icon,
            accent: item.accent,
          }))}
        />

        {track ? (
          <Select
            label={track.subLabel}
            placeholder="Select one"
            value={draft.role}
            onChange={(event) => set({ role: event.target.value })}
            options={roles.map((role) => ({ value: role, label: role }))}
            fieldClassName={styles.half}
          />
        ) : null}
      </Panel>

      <Panel icon="calendar" title="Your interview" sub="What we count down to, and how hard we push.">
        <ChoiceCards
          legend="Do you have a date?"
          layout="row"
          value={draft.dateState}
          onChange={(value) => set({ dateState: value })}
          options={DATE_STATES.map((item) => ({ value: item.value, label: item.label }))}
        />

        {draft.dateState === 'has-date' ? (
          <Input
            label="Interview date"
            type="date"
            value={draft.interviewDate || ''}
            onChange={(event) => set({ interviewDate: event.target.value })}
            fieldClassName={styles.half}
          />
        ) : null}

        <ChoiceCards
          legend="How much interview practice have you had?"
          caption="Sets the examiner and the mode a new session starts on."
          layout="row"
          value={draft.experience}
          onChange={(value) => set({ experience: value })}
          options={EXPERIENCE.map((item) => ({
            value: item.value,
            label: item.label,
            detail: item.detail,
          }))}
        />
      </Panel>

      <Panel
        icon="sparkle"
        title="What you want to work on"
        sub="Each one points at a focus area your next session opens on."
      >
        <ChipGroup
          legend="Pick as many as apply"
          options={WORRIES}
          value={draft.worries}
          onChange={(next) => set({ worries: next })}
        />
      </Panel>

      <Panel
        icon="briefcase"
        title="Your CV"
        sub="Practice is gated on it — the questions are meant to reference your own experience."
      >
        <FileDrop
          label="CV or résumé"
          hint={`${CV_TYPES.join(', ')} — up to ${CV_MAX_MB}MB`}
          accept={CV_TYPES}
          maxMB={CV_MAX_MB}
          file={profile.resume}
          error={cvError}
          onSelect={(meta) => {
            setCvError(null)
            if (meta) {
              attachCv(meta)
              toast({ tone: 'success', title: 'CV replaced', body: meta.name })
            } else {
              detachCv()
              toast({
                tone: 'warning',
                title: 'CV removed',
                body: 'Practice is locked until you attach one again.',
              })
            }
          }}
          onReject={(message) => setCvError(`${message} Try exporting it as a PDF.`)}
        />

        <Disclosure>
          The CV saves the moment you attach it — the save bar does not cover it. Only its name
          and size are kept; this prototype never reads the file.
        </Disclosure>
      </Panel>

      <SaveBar dirty={dirty} onSave={save} onDiscard={reset} />
    </>
  )
}

/* ── 3. Devices ──────────────────────────────────────────────────────────── */

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

/** The connection strip: one bar per sample, coloured by the band it falls in. */
function LatencyStrip({ samples }) {
  const peak = Math.max(...samples)
  const mid = median(samples)

  return (
    <div
      className={styles.meter}
      role="img"
      aria-label={`Round-trip time across the last ${samples.length} samples. Median ${mid} milliseconds, worst ${peak}.`}
    >
      {samples.map((ms, index) => (
        <span
          key={`${ms}-${index}`}
          className={styles.meterBar}
          data-band={latencyBand(ms)}
          style={{ blockSize: `${Math.round((ms / peak) * 100)}%` }}
        />
      ))}
    </div>
  )
}

/**
 * The diagnostics run. Each check resolves in turn on a timer, to a verdict
 * fixed in `settings.js` — the screen is showing the shape of a device report,
 * and a machine that passed and failed the same check on consecutive runs would
 * be showing a random number instead.
 */
function useDiagnostics() {
  const [done, setDone] = useState([])
  const [running, setRunning] = useState(false)
  const [finishedAt, setFinishedAt] = useState(null)
  const timers = useRef([])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function run() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setDone([])
    setFinishedAt(null)
    setRunning(true)

    DIAGNOSTIC_CHECKS.forEach((check, index) => {
      timers.current.push(
        setTimeout(() => setDone((list) => [...list, check.id]), DIAGNOSTIC_STEP_MS * (index + 1)),
      )
    })
    timers.current.push(
      setTimeout(() => {
        setRunning(false)
        setFinishedAt(new Date())
      }, DIAGNOSTIC_STEP_MS * (DIAGNOSTIC_CHECKS.length + 0.4)),
    )
  }

  return { done, running, finishedAt, run }
}

const CHECK_TONE = { pass: 'success', warn: 'warning', fail: 'danger' }
const CHECK_ICON = { pass: 'checkCircle', warn: 'alertTriangle', fail: 'alertCircle' }

export function DevicesSection() {
  const { settings, saveSettings } = useAccount()
  const { toast } = useToast()
  const { done, running, finishedAt, run } = useDiagnostics()

  const committed = useMemo(() => ({ ...settings.devices }), [settings.devices])
  const { draft, dirty, set, reset } = useDraft(committed)

  const mid = median(LATENCY_SAMPLES)
  const band = latencyBand(mid)
  const bandLabel = { good: 'Good', fair: 'Usable', poor: 'Too slow' }[band]
  const warnings = DIAGNOSTIC_CHECKS.filter(
    (check) => done.includes(check.id) && check.status !== 'pass',
  )

  function save() {
    saveSettings({ devices: draft })
    toast({ tone: 'success', title: 'Device preferences saved' })
  }

  return (
    <>
      <SectionHead
        title="Devices"
        blurb="What a session uses to see and hear you, and a check you can run before one starts."
      />

      <Panel icon="microphone" title="Input and output" sub="Applied the next time a session opens.">
        <div className={styles.fields}>
          <Select
            label="Microphone"
            value={draft.microphone}
            onChange={(event) => set({ microphone: event.target.value })}
            options={MICROPHONES}
          />
          <Select
            label="Camera"
            value={draft.camera}
            onChange={(event) => set({ camera: event.target.value })}
            options={CAMERAS}
          />
          <Select
            label="Speakers"
            value={draft.speaker}
            onChange={(event) => set({ speaker: event.target.value })}
            options={SPEAKERS}
          />
        </div>

        <Rows className={styles.tightRows}>
          <Row
            title="Mirror my video"
            hint="Flips your own preview left to right. What the examiner sees never changes."
            htmlFor="device-mirror"
          >
            <Switch
              id="device-mirror"
              checked={draft.mirror}
              onChange={(event) => set({ mirror: event.target.checked })}
            />
          </Row>

          <Row
            title="Noise suppression"
            hint="Filters steady background noise. Leave it off if you practise with headphones in a quiet room."
            htmlFor="device-noise"
          >
            <Switch
              id="device-noise"
              checked={draft.noiseSuppression}
              onChange={(event) => set({ noiseSuppression: event.target.checked })}
            />
          </Row>

          <Row
            title="Check devices before each session"
            hint="Runs the diagnostics below automatically, before the first question."
            htmlFor="device-autocheck"
          >
            <Switch
              id="device-autocheck"
              checked={draft.autoCheck}
              onChange={(event) => set({ autoCheck: event.target.checked })}
            />
          </Row>
        </Rows>

        <Disclosure>
          This prototype never opens your microphone or camera, so these are named choices rather
          than devices it found.
        </Disclosure>
      </Panel>

      <Panel
        icon="wifi"
        title="Connection"
        sub="Round-trip time to the interview server. Anything under 100&nbsp;ms is comfortable."
        actions={<Badge tone={{ good: 'success', fair: 'warning', poor: 'danger' }[band]}>{bandLabel}</Badge>}
      >
        <div className={styles.meterHead}>
          <p className={styles.meterFigure}>
            <span className={styles.meterValue}>{mid}</span>
            <span className={styles.meterUnit}>ms median</span>
          </p>
          <ul className={styles.legend}>
            {LATENCY_BANDS.map((item) => (
              <li key={item.id} className={styles.legendItem}>
                <span className={styles.legendDot} data-band={item.id} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <LatencyStrip samples={LATENCY_SAMPLES} />
      </Panel>

      <Panel
        icon="activity"
        title="Diagnostics"
        sub="Four checks, in the order a session needs them."
        actions={
          <Button variant="secondary" size="sm" loading={running} onClick={run}>
            {finishedAt ? 'Run again' : 'Run diagnostics'}
          </Button>
        }
        footer={
          finishedAt ? (
            <p className={styles.footNote}>
              Last run at{' '}
              {finishedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {warnings.length > 0
                ? ` — ${warnings.length} thing${warnings.length === 1 ? '' : 's'} worth fixing before a real session.`
                : ' — everything passed.'}
            </p>
          ) : null
        }
      >
        <Rows className={styles.tightRows}>
          {DIAGNOSTIC_CHECKS.map((check) => {
            const settled = done.includes(check.id)
            const pending = running && !settled
            return (
              <div key={check.id} className={styles.check} data-state={settled ? check.status : undefined}>
                <span className={styles.checkTile} aria-hidden="true">
                  <Icon name={check.icon} size="16px" strokeWidth={1.5} />
                </span>

                <div className={styles.checkText}>
                  <p className={styles.checkLabel}>{check.label}</p>
                  <p className={styles.checkDetail}>{settled ? check.result : check.detail}</p>
                </div>

                <span className={styles.checkVerdict}>
                  {pending ? (
                    <>
                      <Spinner size="sm" label="" />
                      <span className={styles.checkPending}>Checking</span>
                    </>
                  ) : settled ? (
                    <Badge tone={CHECK_TONE[check.status]} dot={false}>
                      <Icon name={CHECK_ICON[check.status]} size="13px" strokeWidth={1.8} />
                      {check.status === 'pass' ? 'Pass' : check.status === 'warn' ? 'Check' : 'Failed'}
                    </Badge>
                  ) : (
                    <span className={styles.checkIdle}>Not run</span>
                  )}
                </span>
              </div>
            )
          })}
        </Rows>
      </Panel>

      <SaveBar dirty={dirty} onSave={save} onDiscard={reset} />
    </>
  )
}

/* ── 4. Preferences ──────────────────────────────────────────────────────── */

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function PreferencesSection() {
  const { settings, saveSettings } = useAccount()
  const { theme, setTheme, resolved } = useTheme()
  const { toast } = useToast()

  const committed = useMemo(() => ({ ...settings.notifications }), [settings.notifications])
  const { draft, dirty, set, reset } = useDraft(committed)

  const on = NOTIFICATIONS.filter((item) => draft[item.id]).length

  function save() {
    saveSettings({ notifications: draft })
    toast({ tone: 'success', title: 'Notification preferences saved' })
  }

  return (
    <>
      <SectionHead
        title="Preferences"
        blurb="How the app looks, and what it is allowed to tell you about."
      />

      <Panel
        icon="contrast"
        title="Appearance"
        sub="Applies immediately — this is the same setting as the one under your avatar."
      >
        <Rows className={styles.tightRows}>
          <Row
            title="Theme"
            hint={
              theme === 'system'
                ? `Following your system, which is currently ${resolved}.`
                : `Pinned to ${theme}, whatever your system does.`
            }
          >
            <SegmentedControl label="Theme" value={theme} onChange={setTheme} options={THEMES} />
          </Row>
        </Rows>
      </Panel>

      <Panel
        icon="bell"
        title="Notifications"
        sub="Nothing here is marketing except the last one."
        actions={
          <span className={styles.countMeta}>
            {on} of {NOTIFICATIONS.length} on
          </span>
        }
      >
        <Rows>
          {NOTIFICATIONS.map((item) => (
            <Row key={item.id} title={item.label} hint={item.detail} htmlFor={`notify-${item.id}`}>
              <span className={styles.switchRow}>
                <span className={styles.channel}>{item.channel}</span>
                <Switch
                  id={`notify-${item.id}`}
                  checked={Boolean(draft[item.id])}
                  onChange={(event) => set({ [item.id]: event.target.checked })}
                />
              </span>
            </Row>
          ))}
        </Rows>
      </Panel>

      <SaveBar dirty={dirty} onSave={save} onDiscard={reset} />
    </>
  )
}

/* ── 5. Sign-in and security ─────────────────────────────────────────────── */

function ChangePasswordDialog({ open, onClose, onDone }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setValues({ current: '', next: '', confirm: '' })
      setErrors({})
    }
  }, [open])

  function submit() {
    const found = {}
    if (!values.current) found.current = 'Enter your current password.'
    if (values.next.length < 8) found.next = 'At least 8 characters.'
    else if (values.next === values.current) found.next = 'That is the password you already have.'
    if (values.confirm !== values.next) found.confirm = 'The two do not match.'

    setErrors(found)
    if (Object.keys(found).length > 0) return
    onDone()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change your password"
      description="Sign-in links keep working either way — a password is the fallback when you cannot reach your email."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Change password</Button>
        </>
      }
    >
      <div className={styles.dialogFields}>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={values.current}
          error={errors.current}
          onChange={(event) => setValues((v) => ({ ...v, current: event.target.value }))}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters. A passphrase beats a short scramble."
          value={values.next}
          error={errors.next}
          onChange={(event) => setValues((v) => ({ ...v, next: event.target.value }))}
        />
        <Input
          label="Repeat the new password"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          error={errors.confirm}
          onChange={(event) => setValues((v) => ({ ...v, confirm: event.target.value }))}
        />
      </div>
    </Modal>
  )
}

function RegisterPasskeyDialog({ open, onClose, onDone }) {
  const [name, setName] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setName('')
      setError(null)
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register a passkey"
      description="Name it after the device you are on, so you can tell two apart later."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!name.trim()) {
                setError('Give it a name you will recognise.')
                return
              }
              onDone(name.trim())
            }}
          >
            Register
          </Button>
        </>
      }
    >
      <Input
        label="Passkey name"
        placeholder="Work laptop"
        value={name}
        error={error}
        onChange={(event) => {
          setName(event.target.value)
          setError(null)
        }}
      />
      <p className={styles.dialogNote}>
        This prototype records a named entry only. No WebAuthn credential is created, and nothing
        is stored on your device.
      </p>
    </Modal>
  )
}

export function SecuritySection() {
  const { account, settings, changePassword, registerPasskey, removePasskey } = useAccount()
  const { toast } = useToast()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [passkeyOpen, setPasskeyOpen] = useState(false)

  return (
    <>
      <SectionHead
        title="Sign-in and security"
        blurb="How you get into this account, and what to do if that ever needs changing."
      />

      <Panel icon="mail" title="Sign-in link" sub="The way you normally get in.">
        <Rows className={styles.tightRows}>
          <Row title="Magic link" hint={`Sent to ${account.email} and valid for 15 minutes.`}>
            <Badge tone="success">Enabled</Badge>
          </Row>
        </Rows>
      </Panel>

      <Panel
        icon="lock"
        title="Password"
        sub="The fallback for when you cannot reach your email."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
            Change password
          </Button>
        }
      >
        <Rows className={styles.tightRows}>
          <Row title="Current password" hint={passwordChangedLabel(settings)}>
            <span className={styles.mask} aria-hidden="true">
              ••••••••••
            </span>
          </Row>
        </Rows>
      </Panel>

      <Panel
        icon="key"
        title="Passkeys"
        sub="Sign in with the fingerprint, face or PIN the device already uses."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setPasskeyOpen(true)}>
            Register a passkey
          </Button>
        }
      >
        {settings.passkeys.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyTile} aria-hidden="true">
              <Icon name="key" size="20px" strokeWidth={1.5} />
            </span>
            <p className={styles.emptyTitle}>No passkeys yet</p>
            <p className={styles.emptyBody}>
              A passkey is faster than waiting for an email, and it cannot be phished. Register one
              per device you practise on.
            </p>
          </div>
        ) : (
          <Rows className={styles.tightRows}>
            {settings.passkeys.map((key) => (
              <Row key={key.id} title={key.name} hint={`Registered ${key.createdLabel}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    removePasskey(key.id)
                    toast({ tone: 'warning', title: 'Passkey removed', body: key.name })
                  }}
                >
                  Remove
                </Button>
              </Row>
            ))}
          </Rows>
        )}
      </Panel>

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onDone={() => {
          setPasswordOpen(false)
          changePassword()
          toast({ tone: 'success', title: 'Password changed', body: 'Other devices stay signed in.' })
        }}
      />

      <RegisterPasskeyDialog
        open={passkeyOpen}
        onClose={() => setPasskeyOpen(false)}
        onDone={(name) => {
          setPasskeyOpen(false)
          registerPasskey(name)
          toast({ tone: 'success', title: 'Passkey registered', body: name })
        }}
      />
    </>
  )
}

/* ── 6. Active sessions ──────────────────────────────────────────────────── */

export function SessionsSection() {
  const { settings, revokeSession, revokeOtherSessions } = useAccount()
  const { toast } = useToast()
  const others = settings.sessions.filter((item) => !item.current)

  return (
    <>
      <SectionHead
        title="Active sessions"
        blurb="Every device signed in to this account. Revoking one signs it out the next time it asks for anything."
      />

      <Panel
        icon="monitor"
        title="Signed-in devices"
        sub={`${settings.sessions.length} active — ${others.length} besides this one.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            disabled={others.length === 0}
            onClick={() => {
              revokeOtherSessions()
              toast({
                tone: 'success',
                title: 'Other devices signed out',
                body: 'This one stays signed in.',
              })
            }}
          >
            Sign out other devices
          </Button>
        }
      >
        <Rows>
          {settings.sessions.map((item) => {
            const stale = !item.current && item.daysAgo >= STALE_SESSION_DAYS
            return (
              <div key={item.id} className={styles.session}>
                <span className={styles.sessionTile} aria-hidden="true">
                  <Icon name={item.icon} size="17px" strokeWidth={1.5} />
                </span>

                <div className={styles.sessionText}>
                  <p className={styles.sessionDevice}>
                    {item.device}
                    {item.current ? <Badge tone="brand">This device</Badge> : null}
                    {stale ? <Badge tone="warning">Inactive</Badge> : null}
                  </p>
                  <p className={styles.sessionMeta}>
                    {item.where} &middot; {item.method} &middot; {lastActiveLabel(item.daysAgo)}
                  </p>
                </div>

                {item.current ? (
                  <span className={styles.sessionCurrent}>Current session</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      revokeSession(item.id)
                      toast({ tone: 'success', title: 'Device signed out', body: item.device })
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            )
          })}
        </Rows>

        <Disclosure>
          Don&rsquo;t recognise one? Revoke it, then change your password — a sign-in link that was
          forwarded can be used by whoever received it.
        </Disclosure>
      </Panel>
    </>
  )
}

/* ── 7. Data and privacy ─────────────────────────────────────────────────── */

function DeleteAccountDialog({ open, onClose, onDone, email }) {
  const [typed, setTyped] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open) {
      setTyped('')
      setError(null)
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete your account"
      description="Your reports, recordings, session history and interview profile go with it. This cannot be undone."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep my account
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (typed.trim().toLowerCase() !== email.toLowerCase()) {
                setError('That is not the email on this account.')
                return
              }
              onDone()
            }}
          >
            Delete account
          </Button>
        </>
      }
    >
      <Input
        label="Type your email address to confirm"
        placeholder={email}
        value={typed}
        error={error}
        onChange={(event) => {
          setTyped(event.target.value)
          setError(null)
        }}
      />
      <p className={styles.dialogNote}>
        There is no backend behind this prototype: confirming clears the account held in memory and
        returns you to the pricing page. A reload brings the demo account back.
      </p>
    </Modal>
  )
}

export function DataSection() {
  const { account, summary, settings, saveSettings, setAccount } = useAccount()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const committed = useMemo(() => ({ retention: settings.retention }), [settings.retention])
  const { draft, dirty, set, reset } = useDraft(committed)

  function save() {
    saveSettings({ retention: draft.retention })
    toast({ tone: 'success', title: 'Retention updated' })
  }

  function download() {
    const payload = exportPayload(account, settings, summary)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prepviva-account-export.json'
    link.click()
    URL.revokeObjectURL(url)
    toast({ tone: 'success', title: 'Export downloaded', body: 'prepviva-account-export.json' })
  }

  return (
    <>
      <SectionHead
        title="Data and privacy"
        blurb="What is kept from a session, how to take a copy of it, and how to end the account."
      />

      <Panel
        icon="clock"
        title="Recording retention"
        sub="How long a session's video and audio are kept. Reports and scores are kept either way."
      >
        <RadioGroup
          legend="Keep recordings for"
          value={draft.retention}
          onChange={(event) => set({ retention: event.target.value })}
          options={RETENTION.map((item) => ({
            value: item.value,
            label: item.label,
            description: item.detail,
          }))}
        />
      </Panel>

      <Panel
        icon="download"
        title="Your data"
        sub="Everything this account holds, as one JSON file."
        actions={
          <Button variant="secondary" size="sm" iconLeft={<Icon name="download" size="15px" />} onClick={download}>
            Download my data
          </Button>
        }
      >
        <p className={styles.copy}>
          Your details, your interview profile, your preferences, your passkeys and the devices
          signed in to this account. The file is built in the browser when you ask for it, so
          nothing is sent anywhere to produce it.
        </p>
      </Panel>

      <Panel
        icon="alertTriangle"
        tone="danger"
        title="Delete this account"
        sub="Ends the subscription and removes everything above."
        actions={
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        }
      >
        <Rows className={styles.tightRows}>
          <Row
            title="Before you do"
            hint="Cancelling your plan keeps the account and the reports; deleting removes both. If you only want the billing to stop, cancel instead."
          >
            <Button variant="ghost" size="sm" as={Link} to="/billing">
              Go to billing
            </Button>
          </Row>
        </Rows>
      </Panel>

      <DeleteAccountDialog
        open={deleteOpen}
        email={account.email}
        onClose={() => setDeleteOpen(false)}
        onDone={() => {
          setDeleteOpen(false)
          navigate('/pricing')
          setAccount(ACCOUNT)
          toast({
            tone: 'info',
            title: 'Account deleted',
            body: 'The prototype account resets on reload.',
          })
        }}
      />

      <SaveBar dirty={dirty} onSave={save} onDiscard={reset} />
    </>
  )
}
