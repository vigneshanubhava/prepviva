/**
 * What first-run setup asks, and what the answers are for.
 *
 * The flow itself is not invented here — it is the onboarding in the sibling
 * `interview-prototype` (`src/features/onboarding/`): track and role, interview
 * date and experience, what worries you, one real question, then the CV. That
 * prototype owns the product thinking; this file is the same substance in
 * PrepViva's own data shape, so a screen never hard-codes a track or a chip.
 *
 * Two deliberate differences, both from doc/BRIEF.md and the request:
 *   - the account already exists by the time this runs (signup collects name,
 *     email and card), so its step 0 becomes "about you" — the name to confirm
 *     and the mobile number to reach;
 *   - the reference keeps the phone prompt out of onboarding on purpose, asking
 *     after the first session instead. It is asked here because that is what
 *     this build was asked for; the reference's reasoning is in
 *     `PhonePrompt.jsx` if it ever needs revisiting.
 */

export const TRACKS = [
  {
    id: 'nhs',
    label: 'NHS',
    icon: 'briefcase',
    // The token layer already names a colour per track — see --track-* .
    accent: 'nhs',
    blurb: 'A job or post in the NHS',
    subLabel: "What's your role?",
    sub: [
      'Doctor',
      'Nurse',
      'Allied health professional',
      'Mental health professional',
      'Healthcare assistant or support worker',
      'Non-clinical role',
    ],
    question:
      'Tell me about a time you had to challenge a senior colleague about patient safety.',
  },
  {
    id: 'university',
    label: 'University',
    icon: 'graduationCap',
    accent: 'uni',
    blurb: 'Applying to study',
    subLabel: 'Which course?',
    sub: [
      'Medicine',
      'Dentistry',
      'Veterinary medicine',
      'Pharmacy',
      'Nursing',
      'Physiotherapy',
    ],
    question:
      "A friend on your course tells you they've been drinking before placements. What do you do?",
  },
  {
    id: 'postgraduate',
    label: 'Postgraduate',
    icon: 'trophy',
    accent: 'pg',
    blurb: 'Specialty or core training',
    subLabel: 'Which stage?',
    sub: ['Core training', 'ST1 and run-through', 'Higher specialty'],
    question:
      "Walk me through your most significant quality improvement project — and what you'd do differently.",
  },
]

export const DATE_STATES = [
  { value: 'has-date', label: 'I have a date' },
  { value: 'waiting', label: 'Applied, waiting to hear' },
  { value: 'no-date', label: 'No date yet — preparing early' },
]

export const EXPERIENCE = [
  { value: 'first', label: 'First time', detail: 'Guided mode, gentle examiner' },
  { value: 'some', label: 'Done a few', detail: 'Guided mode, realistic examiner' },
  { value: 'experienced', label: 'Experienced', detail: 'Timed mode, realistic examiner' },
]

export const WORRIES = [
  'Freezing up',
  'Structuring my answers',
  'Clinical questions',
  'Ethical scenarios',
  'Not having enough examples',
  'Running out of time',
  'Body language',
  'Sounding rehearsed',
]

/**
 * What the worries actually do: each one points at the focus area a first
 * session will open on, per track. The vocabulary differs by track — a panel's
 * "focus areas" and a circuit's "stations" are not the same words for the same
 * slot — which is why this is a map rather than one list.
 *
 * **Every value here must be one of that track's focus items in
 * `practice.js`, spelled exactly.** The configurator pre-selects from this, so
 * a name that does not match is silently dropped — which is the right failure,
 * but it makes setup's promise quietly untrue. This file does not import the
 * config (the config imports the dashboard, which imports this), so the match
 * is by convention and by the test below it.
 */
const WORRY_FOCUS = {
  'Freezing up': {
    nhs: 'Handling Pressure / Resilience',
    university: 'Situational Judgement',
    postgraduate: 'Judgement Under Pressure',
  },
  'Structuring my answers': {
    nhs: 'Communication & Clarity',
    university: 'Communication / Role Play',
    postgraduate: 'Communication / Role Play',
  },
  'Clinical questions': {
    nhs: 'Clinical Judgment & Decision-Making',
    university: 'Health Awareness / Current Issues',
    postgraduate: 'Clinical Scenario',
  },
  'Ethical scenarios': {
    nhs: 'Integrity & NHS Values',
    university: 'Ethical Scenario',
    postgraduate: 'Ethical Scenario',
  },
  'Not having enough examples': {
    nhs: 'Quality Improvement & Learning',
    university: 'Work Experience Reflection',
    postgraduate: 'Portfolio Review',
  },
  'Running out of time': {
    nhs: 'Handling Pressure / Resilience',
    university: 'Situational Judgement',
    postgraduate: 'Judgement Under Pressure',
  },
  'Body language': {
    nhs: 'Communication & Clarity',
    university: 'Communication / Role Play',
    postgraduate: 'Presentation',
  },
  'Sounding rehearsed': {
    nhs: 'Compassion & Empathy',
    university: 'Empathy & Reflection',
    postgraduate: 'Motivation & Specialty Fit',
  },
}

/** What a track calls the things a session is weighted towards. */
export function focusNoun(trackId) {
  return trackId === 'university' ? 'stations' : 'focus areas'
}

/**
 * The focus areas a set of worries pre-selects, in the order they were worried
 * about, deduped and capped. Shown on the worries step so the answers visibly
 * do something rather than reading as a survey.
 */
export function focusFromWorries(trackId, worries = [], limit = 6) {
  const out = []
  worries.forEach((worry) => {
    const focus = WORRY_FOCUS[worry]?.[trackId]
    if (focus && !out.includes(focus)) out.push(focus)
  })
  return out.slice(0, limit)
}

export function trackById(id) {
  return TRACKS.find((track) => track.id === id) || null
}

/** The CV rules, stated once — the step's copy reads them from here. */
/** The profile photograph, held in the browser and never sent anywhere. */
export const PHOTO_TYPES = ['.png', '.jpg', '.jpeg', '.webp']
export const PHOTO_MAX_MB = 5

export const CV_TYPES = ['.pdf', '.doc', '.docx']
export const CV_MAX_MB = 5
