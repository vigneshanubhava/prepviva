/**
 * Trial rules from doc/BRIEF.md and doc/PLAN-MODEL-AND-COPY.md:
 * 14 days, 3 free credits, card collected at signup but NOT charged during the
 * trial, first charge on day 15.
 *
 * Every trial-related screen must state both the date and the amount, so these
 * helpers exist to stop either being hard-coded into a screen.
 */
export const TRIAL_DAYS = 14
export const TRIAL_CREDITS = 3

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Day 1 is the signup day, so the first charge lands 14 days later (day 15). */
export function firstChargeDate(signupDate = new Date()) {
  return addDays(signupDate, TRIAL_DAYS)
}

/** Whole days remaining, floored at 0 so an expired trial never reads negative. */
export function daysLeftInTrial(signupDate) {
  const end = firstChargeDate(signupDate)
  const ms = end.getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

/** 1 credit ~ 10 minutes of practice; ~6 credits is one full panel interview. */
export const MINUTES_PER_CREDIT = 10
export const CREDITS_PER_PANEL = 6

/**
 * Credits are always stated twice — the number and what it buys
 * (PLAN-MODEL-AND-COPY.md §1). Small balances read better in minutes than in
 * fractions of an interview.
 */
export function creditsInPlainTerms(credits) {
  if (credits <= 0) return 'no practice left'
  const panels = credits / CREDITS_PER_PANEL
  if (panels < 1) return `about ${credits * MINUTES_PER_CREDIT} minutes of practice`
  const rounded = Math.round(panels)
  return `about ${rounded} full panel interview${rounded === 1 ? '' : 's'}`
}

/** dd mmm yyyy — e.g. "13 Aug 2026". Short enough to sit on one table line. */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
