/**
 * Plans, prices and copy come from doc/PLAN-MODEL-AND-COPY.md — NOT from the Figma,
 * which carries prices, credits and features from a different (B2B) product.
 *
 * Credits are always stated twice: the number, and what it buys.
 */

export const BILLING_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual', note: 'Save 20%' },
]

const TRACKS = 'All three tracks: NHS, university and postgraduate'

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    /* Icon/PlanIcon glyph. Figma's briefcase / users / office-block were the
       B2B template's; these read as a practice product — practise aloud, sit a
       full panel, top tier. Every surface that shows a plan reads this. */
    icon: 'microphone',
    price: { monthly: 29, annual: 278 },
    credits: 12,
    inPlainTerms: 'about 2 full panel interviews',
    features: [
      '12 credits a month — about 2 full panel interviews',
      TRACKS,
      'Scores and a written summary after every session',
      'Recordings kept for 30 days',
      'Standard processing',
    ],
  },
  {
    id: 'core-prep',
    name: 'Core Prep',
    icon: 'users',
    recommended: true,
    price: { monthly: 59, annual: 566 },
    credits: 30,
    inPlainTerms: 'about 5 full panel interviews',
    features: [
      '30 credits a month — about 5 full panel interviews',
      TRACKS,
      'Detailed feedback with model answers',
      'Recordings kept for 90 days',
      'Standard processing',
    ],
  },
  {
    id: 'intensive',
    name: 'Intensive',
    icon: 'trophy',
    price: { monthly: 99, annual: 950 },
    credits: 60,
    inPlainTerms: 'about 10 full panel interviews',
    features: [
      '60 credits a month — about 10 full panel interviews',
      TRACKS,
      'Detailed feedback with model answers',
      'Recordings kept for 12 months',
      'Priority processing',
    ],
  },
]

export const TRIAL = {
  cta: 'Start 14-day trial',
  underCta: '3 credits included. No charge for 14 days.',
}

export const formatGBP = (amount) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
