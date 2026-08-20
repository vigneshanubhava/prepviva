/**
 * What the bell has to say.
 *
 * Nothing here is a stored feed — there is no backend to hold one. Every item
 * is **derived from the state the app is already in**, which is the same rule
 * `billingSummary()` and the dashboard follow: a low-balance notice appears
 * because the balance is actually low, and it leaves when it is topped up. A
 * hard-coded list would keep announcing a report that no longer exists the
 * moment the prototype panel switches practice history.
 *
 * Two consequences worth keeping:
 *
 *   - **the notification preferences in Settings actually govern it.** Each
 *     item names the preference that owns it, and an item whose switch is off
 *     is not built. Turning "Low credit balance" off in Settings empties that
 *     row out of the bell, which is what the switch promised.
 *   - **times are labels, not timestamps.** A derived item has no moment it
 *     arrived; inventing one would be the only dishonest thing on the panel.
 *     What each row carries instead is the fact that makes it true — the
 *     session's own day, the charge date, the days left.
 */
import { TRACK, creditLevel, daysToInterview, formatDuration, globalTotals } from './dashboard.js'
import { allSessions } from './report.js'

/**
 * `pref` is the switch in Settings that owns the item; null means the item is
 * a blocker rather than a preference — you cannot turn off being told that
 * practice is locked.
 */
export function buildNotifications({ account, summary, settings, state }) {
  const on = (pref) => pref == null || Boolean(settings.notifications[pref])
  const items = []

  /* ---- blockers: the app cannot do its job until these are fixed ---- */

  if (!account.profile.resume) {
    items.push({
      id: 'cv-missing',
      pref: null,
      tone: 'warning',
      icon: 'briefcase',
      title: 'Practice is locked until you add a CV',
      body: 'Your interviewer reads it before the session so the questions are about your own experience.',
      when: 'Needs you',
      to: '/practice',
      action: 'Add your CV',
    })
  }

  const level = creditLevel(summary.credits.remaining)
  if (level !== 'healthy' && on('balance')) {
    const empty = level === 'empty'
    items.push({
      id: `credits-${level}`,
      pref: 'balance',
      tone: empty ? 'danger' : 'warning',
      icon: 'sparkle',
      title: empty
        ? 'You are out of credits'
        : `${summary.credits.remaining} credit${summary.credits.remaining === 1 ? '' : 's'} left`,
      body: empty
        ? 'A session cannot start until you top up or change plan.'
        : `That is ${summary.credits.remainingInPlainTerms} — not enough for a full panel.`,
      when: 'Needs you',
      to: '/billing/manage-plan',
      action: empty ? 'Top up' : 'See plans',
    })
  }

  /* ---- the things that have happened ---- */

  const [latest] = allSessions(state)
  if (latest && on('reports')) {
    items.push({
      id: `report-${latest.trackId}-${latest.index}`,
      pref: 'reports',
      tone: 'success',
      icon: 'checkCircle',
      title: `Your ${TRACK[latest.trackId].name} report is ready`,
      body: `${latest.session.n} — ${latest.session.m} minutes, marked against this track's own rubric.`,
      when: latest.session.d,
      to: `/sessions/${latest.trackId}/${latest.index}`,
      action: 'Read the report',
    })
  }

  /* ---- the things that are coming ---- */

  if (account.profile.dateState === 'has-date' && on('reminders')) {
    const days = daysToInterview(state, account.profile)
    items.push({
      id: 'interview-countdown',
      pref: 'reminders',
      tone: 'brand',
      icon: 'calendar',
      title: days === 0 ? 'Your interview is today' : `Your interview is ${days} days away`,
      body: 'Book the practice you want behind you before then.',
      when: days === 0 ? 'Today' : `${days} days`,
      to: '/practice',
      action: 'Start a session',
    })
  }

  if (summary.trialing && on('reminders')) {
    items.push({
      id: 'trial-ending',
      pref: 'reminders',
      tone: 'info',
      icon: 'creditCard',
      title: `Your trial ends on ${summary.chargeDateLabel}`,
      body: `${summary.amountLabel} ${summary.periodLabel} is taken that day, on your ${summary.plan.name} plan.`,
      when: summary.chargeDateLabel,
      to: '/billing',
      action: 'See billing',
    })
  }

  /* ---- the round-up ---- */

  const totals = globalTotals(state)
  if (totals.sessions > 0 && on('summary')) {
    items.push({
      id: 'practice-summary',
      pref: 'summary',
      tone: 'info',
      icon: 'trendUp',
      title: `${totals.sessions} session${totals.sessions === 1 ? '' : 's'}, ${formatDuration(totals.minutes)} of practice`,
      body: 'Volume is counted across every track; the scores are not, because each track has its own rubric.',
      when: 'All time',
      to: '/performance',
      action: 'See performance',
    })
  }

  if (on('product')) {
    items.push({
      id: 'product-update',
      pref: 'product',
      tone: 'brand',
      icon: 'sparkle',
      title: 'Device checks before a session',
      body: 'Settings can now run your microphone, camera and connection through a check before the first question.',
      when: 'This month',
      to: '/settings/devices',
      action: 'Open devices',
    })
  }

  return items
}

/** How many of them have not been read. Drives the dot on the bell. */
export function unreadCount(items, read) {
  return items.filter((item) => !read.includes(item.id)).length
}
