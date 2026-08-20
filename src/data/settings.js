/**
 * What Settings owns, and what it is allowed to say.
 *
 * doc/HANDOFF.md left Settings as the one named gap: first-run setup collects a
 * track, a role, a date, experience, worries and a CV, its own copy says they
 * can be changed "in Settings", and there was no Settings. So the account half
 * of this screen edits `account.profile` through `account.js` — this file holds
 * everything else the screen needs that the account has no field for.
 *
 * Two rules, both the ones the rest of the prototype already follows:
 *
 *   - **nothing here pretends to reach a device or a server.** There is no
 *     backend, so the device lists are named options rather than a
 *     `enumerateDevices()` call that would need a permission prompt to return
 *     anything but blanks, and the diagnostics run is a fixed script rather
 *     than a random number dressed as a measurement. The screen says so where
 *     it matters instead of implying otherwise.
 *   - **derived beats typed.** Session and passkey dates are offsets from now,
 *     so "2 days ago" is true whenever the prototype is opened.
 */
import { addDays, formatDate } from './trial.js'

/* ── notifications ───────────────────────────────────────────────────────── */

/**
 * One row per thing the product would send. `channel` names where it lands,
 * because "on" means nothing until you know what it turns on.
 */
export const NOTIFICATIONS = [
  {
    id: 'reminders',
    label: 'Session reminders',
    detail: 'An hour before a session you have booked, and again if you miss it.',
    channel: 'Email · mobile',
  },
  {
    id: 'reports',
    label: 'Report ready',
    detail: 'When a session has finished marking and the report can be read.',
    channel: 'Email',
  },
  {
    id: 'summary',
    label: 'Weekly summary',
    detail: 'What you practised that week, and which competencies moved.',
    channel: 'Email',
  },
  {
    id: 'balance',
    label: 'Low credit balance',
    detail: 'When what is left will not cover a full session.',
    channel: 'Email · in-app',
  },
  {
    id: 'product',
    label: 'Product updates',
    detail: 'New tracks and question banks. No more than once a month.',
    channel: 'Email',
  },
]

/* ── recordings ──────────────────────────────────────────────────────────── */

/**
 * How long a session's video and audio are kept. The report is derived from the
 * recording at marking time and is kept either way — which is the distinction
 * the copy has to make, or "delete my recordings" reads as "delete my scores".
 */
export const RETENTION = [
  { value: '30', label: '30 days', detail: 'Long enough to rewatch a session before the next one.' },
  { value: '90', label: '90 days', detail: 'A full application cycle.' },
  { value: '365', label: '12 months', detail: 'Keeps last year’s attempts for comparison.' },
  {
    value: 'off',
    label: 'Don’t keep recordings',
    detail: 'Discarded as soon as marking finishes. Reports and scores are kept.',
  },
]

/* ── devices ─────────────────────────────────────────────────────────────── */

export const MICROPHONES = [
  { value: 'system', label: 'System default' },
  { value: 'built-in', label: 'Built-in microphone' },
  { value: 'headset', label: 'Headset microphone (Bluetooth)' },
  { value: 'usb', label: 'USB condenser microphone' },
]

export const CAMERAS = [
  { value: 'system', label: 'System default' },
  { value: 'built-in', label: 'Built-in camera' },
  { value: 'external', label: 'External webcam (USB)' },
]

export const SPEAKERS = [
  { value: 'system', label: 'System default' },
  { value: 'built-in', label: 'Built-in speakers' },
  { value: 'headset', label: 'Headset (Bluetooth)' },
]

/**
 * The connection strip. Fixed samples, not random ones: a latency chart that
 * redrew itself differently on every render would be a moving decoration
 * claiming to be a measurement. Milliseconds, oldest first.
 */
export const LATENCY_SAMPLES = [
  38, 41, 36, 44, 39, 37, 52, 46, 40, 35, 33, 38, 42, 61, 48, 39, 36, 34, 37, 43, 45, 40, 38, 36,
]

export const LATENCY_BANDS = [
  { id: 'good', label: 'Under 100 ms', tone: 'success' },
  { id: 'fair', label: '100–200 ms', tone: 'warning' },
  { id: 'poor', label: 'Over 200 ms', tone: 'danger' },
]

export function latencyBand(ms) {
  if (ms > 200) return 'poor'
  if (ms > 100) return 'fair'
  return 'good'
}

/**
 * The diagnostics run. Each check has one scripted outcome — the point of the
 * screen is the shape of the report, and a random verdict would make the same
 * machine pass and fail on consecutive runs.
 */
export const DIAGNOSTIC_CHECKS = [
  {
    id: 'microphone',
    label: 'Microphone',
    detail: 'Input level, sample rate and background noise',
    icon: 'microphone',
    status: 'pass',
    result: 'Speech detected, peaking at a healthy level',
  },
  {
    id: 'camera',
    label: 'Camera',
    detail: 'Resolution, frame rate and lighting',
    icon: 'camera',
    status: 'warn',
    result: 'Working, but the room is darker than examiners prefer',
  },
  {
    id: 'network',
    label: 'Connection',
    detail: 'Round-trip time to the interview server',
    icon: 'wifi',
    status: 'pass',
    result: 'Stable, well inside the range a live session needs',
  },
  {
    id: 'browser',
    label: 'Browser',
    detail: 'Media permissions and codec support',
    icon: 'monitor',
    status: 'pass',
    result: 'Supported, with nothing blocking media access',
  },
]

/** How long each check appears to take. One after another, not all at once. */
export const DIAGNOSTIC_STEP_MS = 700

/* ── sessions and passkeys ───────────────────────────────────────────────── */

/**
 * Signed-in devices. Offsets from now rather than dates, so the list reads the
 * same on any day the prototype is opened. The stale one is deliberate: a
 * session list with nothing worth revoking never demonstrates why it exists.
 */
export const SIGNED_IN_SESSIONS = [
  {
    id: 'session-current',
    device: 'Chrome on macOS',
    icon: 'monitor',
    where: 'Bengaluru, India',
    method: 'Magic link',
    daysAgo: 0,
    current: true,
  },
  {
    id: 'session-phone',
    device: 'Safari on iPhone',
    icon: 'smartphone',
    where: 'Bengaluru, India',
    method: 'Magic link',
    daysAgo: 2,
    current: false,
  },
  {
    id: 'session-old',
    device: 'Chrome on Windows',
    icon: 'monitor',
    where: 'London, United Kingdom',
    method: 'Magic link',
    daysAgo: 26,
    current: false,
  },
]

/** "Active now" / "2 days ago" / a date once it is old enough to need one. */
export function lastActiveLabel(daysAgo) {
  if (daysAgo === 0) return 'Active now'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 14) return `${daysAgo} days ago`
  return formatDate(addDays(new Date(), -daysAgo))
}

/** A session unused for this long is worth pointing at. */
export const STALE_SESSION_DAYS = 14

/* ── the live settings record ────────────────────────────────────────────── */

/**
 * Seeded so every state on the screen is one click from being seen: product
 * updates off against four things on, a stale session to revoke, and no
 * passkeys, which is the empty state the passkey card exists to explain.
 *
 * `passwordChangedDaysAgo` is an offset for the same reason the sessions are.
 */
export const SETTINGS = {
  notifications: {
    reminders: true,
    reports: true,
    summary: true,
    balance: true,
    product: false,
  },
  retention: '90',
  devices: {
    microphone: 'system',
    camera: 'system',
    speaker: 'system',
    mirror: true,
    noiseSuppression: true,
    autoCheck: true,
  },
  passkeys: [],
  sessions: SIGNED_IN_SESSIONS,
  passwordChangedDaysAgo: 96,
}

export function passwordChangedLabel(settings = SETTINGS) {
  const days = settings.passwordChangedDaysAgo
  if (days === 0) return 'Changed today'
  if (days === 1) return 'Changed yesterday'
  if (days < 60) return `Changed ${days} days ago`
  return `Changed on ${formatDate(addDays(new Date(), -days))}`
}

/** A passkey, registered on the device that is asking. */
export function makePasskey(name) {
  return {
    id: `passkey-${Date.now()}`,
    name,
    createdOn: new Date(),
    createdLabel: formatDate(new Date()),
  }
}

/**
 * What "Download my data" hands over. Everything the prototype holds about the
 * account and nothing it does not — no invented server-side history, because
 * there is no server.
 */
export function exportPayload(account, settings, summary) {
  return {
    exportedOn: new Date().toISOString(),
    note: 'PrepViva prototype export. Generated in the browser from in-memory state; there is no backend behind it.',
    account: {
      name: account.name,
      email: account.email,
      plan: summary.plan.name,
      status: account.status,
      creditsUsed: account.creditsUsed,
      creditAllowance: summary.credits.allowance,
    },
    interviewProfile: account.profile,
    preferences: {
      notifications: settings.notifications,
      recordingRetention: settings.retention,
      devices: settings.devices,
    },
    security: {
      passkeys: settings.passkeys.map((key) => ({ name: key.name, createdOn: key.createdLabel })),
      signedInDevices: settings.sessions.map((s) => ({
        device: s.device,
        location: s.where,
        lastActive: lastActiveLabel(s.daysAgo),
      })),
    },
  }
}
