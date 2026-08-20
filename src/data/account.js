/**
 * The signed-in account, mocked in memory. No backend and no storage — the
 * brief rules both out — so this module is the single source of truth for what
 * the signed-in screens display.
 *
 * Every figure here is derived from plans.js and trial.js rather than typed in,
 * so the trial date and the charge amount can never drift apart.
 *
 * The brief also asks for a "Prototype controls" panel that can force any state
 * (trial day, plan, payment status, credits). That panel is not built yet; this
 * shape is what it will drive.
 */
import { PLANS, formatGBP } from './plans.js'
import {
  CREDITS_PER_PANEL,
  TRIAL_CREDITS,
  TRIAL_DAYS,
  addDays,
  creditsInPlainTerms,
  daysLeftInTrial,
  firstChargeDate,
  formatDate,
} from './trial.js'

/**
 * How long the account has been open. Two states are worth knowing about:
 *
 *   5   days + status 'trialing' -> artboard 19 (1:5133): mid-trial, one £0
 *                                   invoice, trial credits, "9 days left".
 *   250 days + status 'active'   -> artboard 21 (1:13303): a paying subscriber
 *                                   with a run of monthly invoices.
 *
 * Flip these two lines to switch between them; every figure on the screen
 * follows. This is the pair the Prototype controls panel will drive.
 */
const DAYS_ELAPSED = 250

/**
 * Has the first-run wizard been through? Seeded false so the prototype opens
 * on the state it describes — the wizard runs once per session and finishing
 * or skipping it stands until reload. The Prototype controls panel will drive
 * this the same way it drives the two above.
 */
const ONBOARDED = false

export const ACCOUNT = {
  name: 'Oliver Davies',
  email: 'oliver.davies@example.com',
  planId: 'starter',
  period: 'monthly',             // monthly | annual
  status: 'active',              // trialing | active | past_due | canceled
  signedUpOn: addDays(new Date(), -DAYS_ELAPSED),
  creditsUsed: 7,
  /**
   * Set by cancelSubscription(). Seeding `status: 'canceled'` here instead
   * gives artboards 33 (1:9718) and 36 (1:16360) — the billing screen a user
   * lands on after cancelling — without walking the flow; the three fields
   * below then fall back to sensible values.
   */
  /**
   * When the current billing period started. Null means it has never moved off
   * the trial's end, which is where billing begins. Changing plan restarts it,
   * which is what stops the next renewal from being read off the signup date.
   */
  periodStart: null,
  canceledOn: null,
  canceledFrom: null,            // the status the account held before cancelling
  accessEnds: null,              // the period already paid for, still usable
  cancelReason: null,
  cancelNote: null,
  /**
   * A downgrade takes effect at the end of the period already paid for, so it
   * is held here until then: { planId, period, effectiveOn }. An upgrade lands
   * immediately and never sets this.
   */
  pendingChange: null,
  /**
   * Saved cards. Figma's Manage-cards panel lists twelve payment *brands*
   * (Discover, Amex, Apple Pay, GPay, PayPal, UnionPay, JCB, Cartes Bancaires,
   * eftpos) with an okaxis UPI handle — that is the template's brand catalogue,
   * not a user's wallet, and checkout already dropped the wallet methods.
   * These are the two cards on this account, which is also what makes both row
   * states on the artboard reachable: the default one, and one you can promote
   * or remove.
   */
  /**
   * First-run setup — the /welcome/setup page. `onboarded` covers both finishing
   * it and setting up later; neither should ask again this session.
   */
  onboarded: ONBOARDED,
  /**
   * What first-run setup collects. The shape follows the reference prototype's
   * onboarding record (`interview-prototype/src/features/onboarding/`), so the
   * two can be compared field by field.
   */
  profile: {
    phone: null,
    linkedin: null,       // a profile URL, collected in Settings rather than setup
    track: null,           // 'nhs' | 'university' | 'postgraduate'
    role: null,            // the role, course or stage within that track
    dateState: null,       // 'has-date' | 'waiting' | 'no-date'
    interviewDate: null,   // ISO day, when there is one
    experience: null,      // 'first' | 'some' | 'experienced'
    worries: [],           // what a first session gets weighted towards
    resume: null,          // { name, size } — no backend, so the file itself is not kept
  },
  cards: [
    { id: 'card-visa', brand: 'Visa', last4: '3256', expires: '06/28', default: true },
    { id: 'card-mc', brand: 'Mastercard', last4: '6715', expires: '11/27', default: false },
  ],
}

/**
 * When the next payment lands. During the trial that is the first charge, day
 * 15. Afterwards it is the next monthly anniversary of that first charge.
 */
export function nextChargeDate(account = ACCOUNT) {
  const first = firstChargeDate(account.signedUpOn)
  if (account.status === 'trialing' || account.canceledFrom === 'trialing') return first

  // Anniversaries run from the start of the current period, which a plan change
  // resets — reading them off the signup date would put the next renewal 14 days
  // out (the trial's length) rather than a month after the change.
  const due = new Date(account.periodStart || first)
  const now = new Date()
  const annual = account.period === 'annual'
  while (due <= now) {
    if (annual) due.setFullYear(due.getFullYear() + 1)
    else due.setMonth(due.getMonth() + 1)
  }
  return due
}

/**
 * The reasons offered in the cancel modal (artboards 27-29). Figma shows only
 * "Not using it enough" and "Other (please specify)"; the rest are the reasons
 * a candidate actually leaves this product — interviews sat, price, missing
 * practice — rather than the template's B2B churn list.
 */
export const CANCEL_REASONS = [
  { value: 'not-using', label: 'Not using it enough' },
  { value: 'interviews-done', label: "I've finished my interviews" },
  { value: 'too-expensive', label: 'Too expensive' },
  { value: 'not-enough-credits', label: 'Not enough credits for the price' },
  { value: 'missing', label: 'Missing something I need' },
  { value: 'elsewhere', label: 'Practising somewhere else' },
  { value: 'other', label: 'Other (please specify)' },
]

/** The free-text box only appears for this one. */
export const CANCEL_REASON_OTHER = 'other'

/**
 * When access runs out on a cancelled subscription: the end of the period
 * already paid for, which is the day the next charge would have landed. On a
 * trial that is day 15, the day the first charge would have been taken.
 */
export function accessEndsOn(account = ACCOUNT) {
  return account.accessEnds || nextChargeDate(account)
}

/**
 * Cancel — nothing is charged again, but the period already paid for stays
 * usable. Returns a new account rather than mutating ACCOUNT: the brief rules
 * out storage, so the Billing screen holds the live copy in component state
 * and this resets on reload.
 */
export function cancelSubscription(account = ACCOUNT, { reason, note } = {}) {
  return {
    ...account,
    status: 'canceled',
    canceledFrom: account.status,
    canceledOn: new Date(),
    accessEnds: accessEndsOn(account),
    cancelReason: reason || null,
    cancelNote: note ? note.trim() : null,
  }
}

/**
 * Renew, from the banner, the plan card or the hero menu (artboard 33). The
 * subscription goes back to what it was: still inside the 14 days means the
 * trial resumes and the first charge lands on the same day it always would.
 */
export function renewSubscription(account = ACCOUNT) {
  const wasTrialing = account.canceledFrom === 'trialing'
  return {
    ...account,
    status: wasTrialing && daysLeftInTrial(account.signedUpOn) > 0 ? 'trialing' : 'active',
    canceledFrom: null,
    canceledOn: null,
    accessEnds: null,
    cancelReason: null,
    cancelNote: null,
  }
}

/**
 * Where a plan sits in the ladder — PLANS is ordered Starter, Core Prep,
 * Intensive, so the index is the tier. Used to decide whether a change is an
 * upgrade (charged now) or a downgrade (scheduled for the period end).
 */
export function planRank(planId) {
  return PLANS.findIndex((p) => p.id === planId)
}

/** What the account pays for a plan on a given period. */
export function priceFor(plan, period = 'monthly') {
  return period === 'annual' ? plan.price.annual : plan.price.monthly
}

/**
 * Which direction a change goes. The product sells one billing period, so the
 * ladder is the only axis: moving up a tier is an upgrade, moving down is a
 * downgrade, staying put is the current plan.
 */
export function changeKind(account, planId) {
  const from = planRank(account.planId)
  const to = planRank(planId)
  if (to > from) return 'upgrade'
  if (to < from) return 'downgrade'
  return 'same'
}

/**
 * An upgrade takes effect straight away: the unused part of the period already
 * paid for is credited against the new plan, so only the difference is taken
 * today. Nothing here pretends to be Stripe — it is the arithmetic a user needs
 * to see before they agree to it.
 */
export function prorate(account = ACCOUNT, planId, period = 'monthly') {
  const from = currentPlan(account)
  const to = PLANS.find((p) => p.id === planId) || from

  const renews = nextChargeDate(account)
  const periodDays = account.period === 'annual' ? 365 : 30
  const daysLeft = Math.max(
    0,
    Math.min(periodDays, Math.ceil((renews.getTime() - Date.now()) / 86400000)),
  )

  const oldPrice = priceFor(from, account.period)
  const newPrice = priceFor(to, period)
  // Credit only what has actually been paid for — a trial has been paid nothing.
  const credit = account.status === 'trialing' ? 0 : Math.round((oldPrice * daysLeft) / periodDays)
  const dueToday = Math.max(0, newPrice - credit)

  const nextRenewal = new Date()
  if (period === 'annual') nextRenewal.setFullYear(nextRenewal.getFullYear() + 1)
  else nextRenewal.setMonth(nextRenewal.getMonth() + 1)

  return {
    plan: to,
    period,
    daysLeft,
    credit,
    creditLabel: formatGBP(credit),
    newPrice,
    newPriceLabel: formatGBP(newPrice),
    dueToday,
    dueTodayLabel: formatGBP(dueToday),
    nextRenewal,
    nextRenewalLabel: formatDate(nextRenewal),
    // A downgrade does not cut the paid period short, so it lands here instead.
    effectiveOn: renews,
    effectiveOnLabel: formatDate(renews),
    periodLabel: period === 'annual' ? 'a year' : 'a month',
  }
}

/**
 * Upgrade — effective now. The billing period restarts today, which is what
 * the proration above charges for, and any scheduled downgrade is dropped.
 */
export function changePlan(account = ACCOUNT, { planId, period = 'monthly' } = {}) {
  const trialing = account.status === 'trialing'
  return {
    ...account,
    planId,
    period,
    status: trialing ? 'trialing' : 'active',
    // A paid change restarts the billing period today. A trial keeps its own
    // clock: upgrading mid-trial does not end the trial or start a charge.
    periodStart: trialing ? account.periodStart : new Date(),
    creditsUsed: 0,          // the new allowance starts fresh
    pendingChange: null,
  }
}

/**
 * Downgrade — the period already paid for is not cut short, so the change is
 * held until it ends. Nothing is charged today.
 */
export function scheduleChange(account = ACCOUNT, { planId, period = 'monthly' } = {}) {
  return {
    ...account,
    pendingChange: {
      planId,
      period,
      effectiveOn: nextChargeDate(account),
    },
  }
}

/** Drop a scheduled downgrade and stay on the current plan. */
export function keepCurrentPlan(account = ACCOUNT) {
  return { ...account, pendingChange: null }
}

/**
 * First-run setup, finished. The name it collects is the account's name —
 * one source for it, the same rule every other figure follows — and the phone
 * and CV land on `profile`. No backend and no storage: the file's name and size
 * are kept so the screen can state what was attached, the bytes are not.
 */
export function completeOnboarding(account = ACCOUNT, details = {}) {
  const { name, phone, track, role, dateState, interviewDate, experience, worries, resume } =
    details
  return {
    ...account,
    name: name?.trim() || account.name,
    onboarded: true,
    profile: {
      ...account.profile,
      phone: phone?.trim() || null,
      track: track || null,
      role: role || null,
      dateState: dateState || null,
      interviewDate: interviewDate || null,
      experience: experience || null,
      worries: worries || [],
      resume: resume ? { name: resume.name, size: resume.size } : account.profile.resume,
    },
  }
}

/**
 * The CV, attached later than setup — from the practice screen's gate, which is
 * where the rule is actually enforced. No backend and no storage, so the name
 * and size are kept and the bytes are not, exactly as setup does it.
 */
export function attachResume(account = ACCOUNT, file) {
  if (!file) return account
  return {
    ...account,
    profile: { ...account.profile, resume: { name: file.name, size: file.size } },
  }
}

/**
 * Your details, edited in Settings rather than collected by setup.
 *
 * The name is the account's, not a second copy of it — the header, the avatar
 * and the dashboard greeting all read the one field, so renaming here renames
 * everywhere. Email is deliberately not writable: it is the address the magic
 * link is sent to, and changing it would need a round trip this prototype has
 * no backend for. The screen says that rather than offering a field that lies.
 */
export function updateDetails(account = ACCOUNT, { name, phone, linkedin } = {}) {
  return {
    ...account,
    name: name?.trim() || account.name,
    profile: {
      ...account.profile,
      phone: phone?.trim() || null,
      linkedin: linkedin?.trim() || null,
    },
  }
}

/**
 * The answers first-run setup collected, edited afterwards — the gap
 * doc/HANDOFF.md named. Same fields, same shape, same writer contract as
 * `completeOnboarding`, so a profile edited here is indistinguishable from one
 * that came out of the wizard.
 *
 * Changing the track moves the dashboard's primary track with it, which is the
 * whole point: a candidate who switches from a university course to an NHS post
 * should not have to keep reading a screen scoped to the wrong one.
 */
export function updateInterviewProfile(account = ACCOUNT, details = {}) {
  const { track, role, dateState, interviewDate, experience, worries } = details
  return {
    ...account,
    profile: {
      ...account.profile,
      track: track || null,
      role: role || null,
      dateState: dateState || null,
      // a date only means anything against "I have a date"
      interviewDate: dateState === 'has-date' ? interviewDate || null : null,
      experience: experience || null,
      worries: worries || [],
    },
  }
}

/**
 * The CV, taken off the account. Practice gates on it, so this genuinely locks
 * the practice screens again — which is why the button that calls it says so.
 */
export function removeResume(account = ACCOUNT) {
  return { ...account, profile: { ...account.profile, resume: null } }
}

/**
 * Starting a session spends its credits. Capped at the allowance so a balance
 * can reach zero but never go under it — the configurator refuses to start a
 * session it cannot pay for, and this is the backstop.
 */
export function spendCredits(account = ACCOUNT, credits = 0) {
  const { allowance } = billingSummary(account).credits
  return { ...account, creditsUsed: Math.min(allowance, account.creditsUsed + Math.max(0, credits)) }
}

/** Skipped, or dismissed. Nothing is collected; it does not ask again. */
export function dismissOnboarding(account = ACCOUNT) {
  return { ...account, onboarded: true }
}

/* ── prototype controls ─────────────────────────────────────────────────────
   doc/BRIEF.md asks for a panel that can force any state — trial day, plan,
   payment status, credits — because most of the interesting screens cannot be
   reached by using the app normally: you cannot run out of credits on demand,
   and you certainly cannot cancel a subscription four times in a demo.

   These are the writers behind it. They are deliberately blunt — no proration,
   no invoices, no dates negotiated with anything — because they are answering
   "show me this state", not "the user did this". The flows themselves
   (`changePlan`, `cancelSubscription`) stay the honest path.
   ────────────────────────────────────────────────────────────────────────── */

/** How long the account has been open, and what that makes it. */
export const PROTOTYPE_PHASES = [
  { value: 'trial-start', label: 'Day 1', days: 0, status: 'trialing', hint: 'Trial just started' },
  { value: 'trial-end', label: 'Day 12', days: 11, status: 'trialing', hint: 'Trial nearly over' },
  { value: 'first-charge', label: 'Just paid', days: TRIAL_DAYS + 1, status: 'active', hint: 'First charge taken' },
  { value: 'long-standing', label: '8 mo', days: 250, status: 'active', hint: '8 months in — a run of invoices' },
]

/** What is left in the balance, named by what it stops you doing. */
export const PROTOTYPE_CREDITS = [
  { value: 'full', label: 'Full', hint: 'The whole allowance' },
  { value: 'low', label: 'Low', hint: 'Not enough for a full panel' },
  { value: 'critical', label: 'Last few', hint: 'Below the cheapest session' },
  { value: 'empty', label: 'None', hint: 'Blocked', tone: 'warn' },
]

const CREDITS_LEFT = { full: Infinity, low: CREDITS_PER_PANEL - 1, critical: 2, empty: 0 }

/** Clearing every field a cancellation left behind. */
function uncancelled(account) {
  return {
    ...account,
    canceledOn: null,
    canceledFrom: null,
    accessEnds: null,
    cancelReason: null,
    cancelNote: null,
  }
}

export function forcePhase(account = ACCOUNT, value) {
  const phase = PROTOTYPE_PHASES.find((p) => p.value === value)
  if (!phase) return account
  return {
    ...uncancelled(account),
    signedUpOn: addDays(new Date(), -phase.days),
    // the period is read off the signup date again; a plan change would move it
    periodStart: null,
    pendingChange: null,
    status: phase.status,
  }
}

export function forcePlan(account = ACCOUNT, planId) {
  if (!PLANS.some((plan) => plan.id === planId)) return account
  return { ...account, planId, pendingChange: null }
}

/**
 * trialing · active · canceled. A trial that has already run out is moved back
 * inside its 14 days rather than left as a contradiction, and cancelling goes
 * through the real writer so the dates it derives are the ones the screens read.
 */
export function forceStatus(account = ACCOUNT, status) {
  if (status === 'canceled') {
    return account.status === 'canceled'
      ? account
      : cancelSubscription(account, { reason: 'prototype' })
  }

  const base = uncancelled(account)
  if (status !== 'trialing') return { ...base, status }

  const expired = daysLeftInTrial(base.signedUpOn) <= 0
  return {
    ...base,
    status: 'trialing',
    signedUpOn: expired ? addDays(new Date(), -5) : base.signedUpOn,
    periodStart: null,
  }
}

export function forceCredits(account = ACCOUNT, level) {
  const { allowance } = billingSummary(account).credits
  const left = Math.min(allowance, CREDITS_LEFT[level] ?? allowance)
  return { ...account, creditsUsed: allowance - left }
}

/** The CV the practice screen gates on, on or off the account. */
export function forceCv(account = ACCOUNT, attached) {
  return {
    ...account,
    profile: {
      ...account.profile,
      resume: attached ? account.profile.resume || { name: 'oliver-davies-cv.pdf', size: 184320 } : null,
    },
  }
}

/** Which of the credit steps the balance is currently sitting on. */
export function creditLevelOf(account = ACCOUNT) {
  const { remaining } = billingSummary(account).credits
  if (remaining <= 0) return 'empty'
  if (remaining <= CREDITS_LEFT.critical) return 'critical'
  if (remaining <= CREDITS_LEFT.low) return 'low'
  return 'full'
}

/** Which phase the account's age puts it in, for the panel's own selection. */
export function phaseOf(account = ACCOUNT) {
  const age = Math.round((Date.now() - account.signedUpOn.getTime()) / 86400000)
  const trialing = account.status === 'trialing' || account.canceledFrom === 'trialing'
  const candidates = PROTOTYPE_PHASES.filter((p) => (p.status === 'trialing') === trialing)
  return (candidates.length ? candidates : PROTOTYPE_PHASES).reduce((best, p) =>
    Math.abs(p.days - age) < Math.abs(best.days - age) ? p : best,
  ).value
}

/** Every billing anniversary that has already been charged, oldest first. */
function pastChargeDates(account = ACCOUNT) {
  // Deliberately anchored to the signup date, not periodStart: invoices already
  // issued do not move when the plan changes.
  const dates = []
  const cursor = new Date(firstChargeDate(account.signedUpOn))
  const now = new Date()
  const annual = account.period === 'annual'
  while (cursor <= now) {
    dates.push(new Date(cursor))
    if (annual) cursor.setFullYear(cursor.getFullYear() + 1)
    else cursor.setMonth(cursor.getMonth() + 1)
  }
  return dates
}

/** The card the next payment will be taken from. */
export function defaultCard(account = ACCOUNT) {
  return account.cards.find((c) => c.default) || account.cards[0]
}

export function currentPlan(account = ACCOUNT) {
  return PLANS.find((p) => p.id === account.planId) || PLANS[0]
}

/**
 * Everything a trial screen needs to state both the date and the amount, which
 * doc/BRIEF.md requires on every trial-related screen.
 */
export function billingSummary(account = ACCOUNT) {
  const plan = currentPlan(account)
  const canceled = account.status === 'canceled'
  // A trial that was cancelled is still a trial until the 14 days are up, so
  // the credits card keeps counting against the 3 trial credits, not the plan's.
  const trialing = account.status === 'trialing' || account.canceledFrom === 'trialing'

  const allowance = trialing ? TRIAL_CREDITS : plan.credits
  const used = Math.min(account.creditsUsed, allowance)
  const remaining = allowance - used

  const charge = nextChargeDate(account)
  const accessEnds = accessEndsOn(account)
  const annual = account.period === 'annual'
  const amount = priceFor(plan, account.period)

  const pending = account.pendingChange
  const pendingPlan = pending ? PLANS.find((p) => p.id === pending.planId) : null

  return {
    plan,
    trialing,
    canceled,
    period: account.period,
    annual,
    // "per month" / "per year" — the card states the cadence next to the figure.
    periodLabel: annual ? 'per year' : 'per month',
    amount,
    amountLabel: formatGBP(amount),
    // A downgrade waiting for the month already paid for to end — artboards 54
    // and 55. Both screens name it from here rather than each deciding.
    pending: pending
      ? {
          ...pending,
          plan: pendingPlan,
          periodLabel: pending.period === 'annual' ? 'per year' : 'per month',
          amountLabel: formatGBP(priceFor(pendingPlan, pending.period)),
          effectiveOnLabel: formatDate(pending.effectiveOn),
          title: 'Downgrade scheduled',
          revertLabel: 'Revert downgrade',
        }
      : null,
    chargeDate: charge,
    chargeDateLabel: formatDate(charge),
    // On a cancelled subscription there is no next charge — only the date the
    // access already paid for runs out. Every screen still states both.
    accessEnds,
    accessEndsLabel: formatDate(accessEnds),
    daysLeft: daysLeftInTrial(account.signedUpOn),
    trialDays: TRIAL_DAYS,
    credits: {
      allowance,
      used,
      remaining,
      percentUsed: allowance === 0 ? 0 : Math.round((used / allowance) * 100),
      remainingInPlainTerms: creditsInPlainTerms(remaining),
      allowanceInPlainTerms: creditsInPlainTerms(allowance),
    },
    card: defaultCard(account),
  }
}

/**
 * Invoices, derived from how long the account has been open.
 *
 * The opening invoice is always the £0 trial one. A paying account then has one
 * invoice per monthly anniversary, the most recent still awaiting payment —
 * which is the run artboard 21 shows, and what makes the Paid, Unpaid and Free
 * status tags all reachable. Figma's five $2,500 "Platinum" rows belong to the
 * template product.
 */
export function invoices(account = ACCOUNT) {
  const plan = currentPlan(account)
  const annual = account.period === 'annual'
  const price = priceFor(plan, account.period)

  const rows = [
    {
      id: 'inv-001',
      // Reference only. The screen renders the "Invoice #" prefix, so no
      // hash-plus-digits literal sits in the source to trip the no-hex audit.
      reference: '001',
      issued: account.signedUpOn,
      due: firstChargeDate(account.signedUpOn),
      status: 'free',
      statusLabel: 'Free',
      planName: `${plan.name} (trial)`,
      amount: 0,
      duration: `${TRIAL_DAYS} days`,
    },
  ]

  if (account.status !== 'trialing') {
    const charges = pastChargeDates(account)
    charges.forEach((issued, index) => {
      const last = index === charges.length - 1
      const due = new Date(issued)
      due.setDate(due.getDate() + 14)
      rows.push({
        id: `inv-${index + 2}`,
        reference: String(index + 2).padStart(3, '0'),
        issued,
        due,
        status: last ? 'unpaid' : 'paid',
        statusLabel: last ? 'Unpaid' : 'Paid',
        planName: plan.name,
        amount: price,
        duration: annual ? '1 year' : '1 month',
      })
    })
  }

  return rows
    .map((row) => ({
      ...row,
      amountLabel: formatGBP(row.amount),
      issuedLabel: formatDate(row.issued),
      dueLabel: formatDate(row.due),
    }))
    .reverse()   // newest first, as the artboard shows
}

/**
 * Transactions — the card charges behind the invoices. There is no Figma
 * artboard for this tab, so it follows the invoice table's own conventions.
 *
 * They reconcile with `invoices()` deliberately: every paid invoice has one
 * successful charge on its issue date, the trial invoice has none (nothing was
 * taken), and the newest invoice is still unpaid so no charge exists for it
 * yet. One older charge failed and was retried the next day, which is why both
 * a failed and a succeeded row appear for the same month while its invoice
 * still reads Paid.
 */
const RETRY_INDEX = 2   // the month whose first attempt was declined

export function transactions(account = ACCOUNT) {
  const annual = account.period === 'annual'
  const card = defaultCard(account)
  const method = card ? `${card.brand} •••• ${card.last4}` : 'No card on file'

  const paid = invoices(account).filter((row) => row.status === 'paid')

  const rows = []
  paid.forEach((invoice, index) => {
    rows.push({
      id: `txn-${invoice.reference}`,
      reference: invoice.reference,
      date: invoice.issued,
      description: `${invoice.planName} — ${annual ? 'annual' : 'monthly'}`,
      method,
      amount: invoice.amount,
      status: 'succeeded',
      statusLabel: 'Succeeded',
    })

    if (index === RETRY_INDEX) {
      const failed = new Date(invoice.issued)
      failed.setDate(failed.getDate() - 1)
      rows.push({
        id: `txn-${invoice.reference}-retry`,
        reference: invoice.reference,
        date: failed,
        description: `${invoice.planName} — ${annual ? 'annual' : 'monthly'} (card declined)`,
        method,
        amount: invoice.amount,
        status: 'failed',
        statusLabel: 'Failed',
      })
    }
  })

  return rows
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((row) => ({
      ...row,
      amountLabel: formatGBP(row.amount),
      dateLabel: formatDate(row.date),
    }))
}
