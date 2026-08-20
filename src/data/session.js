/**
 * Keeping the prototype's state across a refresh.
 *
 * doc/BRIEF.md originally ruled out storage of any kind, and everything lived
 * in memory: a reload put the account back to `ACCOUNT`, which meant back to
 * `onboarded: false` and out to first-run setup. That was asked to change on
 * 2026-08-20 — a refresh should not throw away the state you set up.
 *
 * **sessionStorage, not localStorage.** It is scoped to the tab: close it and
 * the prototype is factory-fresh for the next person who opens it, which keeps
 * the demo repeatable without anyone having to clear anything.
 *
 * **A hard refresh cannot be told apart from a normal one.** No web API
 * distinguishes ⌘⇧R from ⌘R — `PerformanceNavigationTiming.type` reports
 * "reload" for both — and sessionStorage survives either. The ways back to a
 * clean slate are closing the tab and `Reset` in the prototype controls panel.
 *
 * Dates are the one thing JSON cannot carry: `JSON.stringify` writes them as
 * strings and nothing turns them back. Rather than a blanket reviver — which
 * would also convert `profile.interviewDate`, a date *input's* string value
 * that must stay a string — each field that really is a Date is named below.
 */
const KEY = 'prepviva:session'

/** Bump when a shape changes, so a stale record is dropped rather than revived. */
const VERSION = 1

const ACCOUNT_DATES = ['signedUpOn', 'periodStart', 'canceledOn', 'accessEnds']

function toDate(value) {
  return value ? new Date(value) : value
}

function reviveAccount(account) {
  const next = { ...account }
  ACCOUNT_DATES.forEach((key) => {
    next[key] = toDate(next[key])
  })
  if (next.pendingChange) {
    next.pendingChange = {
      ...next.pendingChange,
      effectiveOn: toDate(next.pendingChange.effectiveOn),
    }
  }
  return next
}

function reviveSettings(settings) {
  return {
    ...settings,
    passkeys: (settings.passkeys || []).map((key) => ({ ...key, createdOn: toDate(key.createdOn) })),
  }
}

const REVIVE = { account: reviveAccount, settings: reviveSettings }

function readAll() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.version === VERSION ? parsed.state : null
  } catch {
    // private mode, a full quota, a half-written record — start clean
    return null
  }
}

/** What was kept for `slice`, revived, or `fallback` if there is nothing. */
export function load(slice, fallback) {
  const all = readAll()
  const kept = all?.[slice]
  if (kept == null) return fallback
  const revive = REVIVE[slice]
  return revive ? revive(kept) : kept
}

/** Write one slice back, leaving the others alone. */
export function save(slice, value) {
  try {
    const all = readAll() || {}
    sessionStorage.setItem(KEY, JSON.stringify({ version: VERSION, state: { ...all, [slice]: value } }))
  } catch {
    // over quota (a large photo) or storage disabled: the session still works,
    // it just will not survive the next refresh
  }
}

/** Everything back to how it opens. Used by the prototype panel's Reset. */
export function clear() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}
