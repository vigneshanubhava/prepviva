/**
 * What a practice session can be configured to be.
 *
 * Ported from the reference prototype (`../interview-prototype`,
 * `src/domain/branches.js`), which owns the product thinking here. The claim
 * that config makes is worth keeping: **these objects are the only difference
 * between a panel and a circuit** — every step of the configurator is rendered
 * by shared code, so adding a track is a config entry, not a screen.
 *
 * Tracks are keyed by the ids first-run setup and the dashboard already use
 * (`onboarding.js` TRACKS: nhs / university / postgraduate). Identity — label,
 * glyph, accent, the stream noun — comes from `dashboard.js` rather than being
 * restated here.
 *
 * One deliberate difference from the reference: it prices a circuit per station
 * at a flat rate, which would contradict this app's own rule that 1 credit is
 * about 10 minutes of practice (`trial.js`). Everything here is priced from
 * minutes, so a longer station costs what it takes, and the dashboard's
 * recommendation and this screen can never quote different numbers.
 */
import { TRACK, creditsFor } from './dashboard.js'
import { focusFromWorries as worriesToFocus } from './onboarding.js'

/* ── the two settings every shape has ────────────────────────────────────── */
export const MODES = [
  {
    value: 'guided',
    label: 'Guided',
    detail: 'Tips after each question. One retry each. The timer pauses for tips.',
  },
  {
    value: 'timed',
    label: 'Timed',
    detail: 'Full simulation. Fixed timings, no retries, no hints.',
  },
]

export const DIFFICULTY = [
  { value: 'gentle', label: 'Gentle', detail: 'Warm. Accepts short answers.' },
  { value: 'realistic', label: 'Realistic', detail: 'Matches a real panel.' },
  { value: 'tough', label: 'Tough', detail: 'Interrupts. Challenges. Probes deep.' },
]

/**
 * The per-track configuration. `shape` decides how format and focus are read:
 * a **panel** is one conversation of a chosen length, weighted towards focus
 * areas; a **circuit** is a run of stations, where each station *is* one of the
 * things picked, in the order they are picked.
 */
export const PRACTICE = {
  nhs: {
    id: 'nhs',
    shape: 'panel',
    context: [
      {
        key: 'roleType',
        label: 'Role type',
        required: true,
        type: 'select',
        options: [
          'Doctor',
          'Nurse',
          'Allied health professional',
          'Mental health professional',
          'Healthcare assistant or support worker',
        ],
      },
      {
        key: 'band',
        label: 'Band or grade',
        required: true,
        type: 'select',
        // an answer only means something once the role is known
        gatedBy: 'roleType',
        gatePrompt: 'Choose a role first',
        optionsBy: {
          Doctor: [
            'Foundation (FY1/FY2)',
            'Core trainee (CT1–CT3)',
            'Specialty registrar (ST1–ST8)',
            'Specialty doctor / SAS',
            'Consultant',
          ],
          Nurse: ['Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b'],
          'Allied health professional': ['Band 5', 'Band 6', 'Band 7', 'Band 8a'],
          'Mental health professional': ['Band 5', 'Band 6', 'Band 7', 'Band 8a'],
          'Healthcare assistant or support worker': ['Band 2', 'Band 3', 'Band 4'],
        },
      },
      {
        key: 'trust',
        label: 'Trust or location',
        required: false,
        type: 'text',
        placeholder: "e.g. Guy's and St Thomas'",
      },
    ],
    format: { lengths: [30, 45, 60], defaultLength: 45 },
    focus: {
      title: 'Focus areas',
      noun: 'focus areas',
      min: 3,
      max: 6,
      priorityCopy: 'Higher-ranked areas get more of the interview.',
      items: [
        'Compassion & Empathy',
        'Teamwork & Collaboration',
        'Integrity & NHS Values',
        'Clinical Judgment & Decision-Making',
        'Communication & Clarity',
        'Handling Pressure / Resilience',
        'Quality Improvement & Learning',
        'Equality, Diversity & Inclusion',
      ],
    },
  },

  university: {
    id: 'university',
    shape: 'circuit',
    context: [
      {
        key: 'course',
        label: 'Course',
        required: true,
        type: 'select',
        options: [
          'Medicine',
          'Dentistry',
          'Veterinary medicine',
          'Pharmacy',
          'Nursing',
          'Physiotherapy',
          'Other healthcare',
        ],
      },
      {
        key: 'university',
        label: 'University',
        required: false,
        type: 'text',
        placeholder: 'e.g. Imperial College London',
      },
      {
        key: 'cycle',
        label: 'Application cycle',
        required: false,
        type: 'select',
        options: ['2026 entry', '2027 entry'],
      },
    ],
    format: {
      stations: [3, 4, 5, 6],
      defaultStations: 4,
      stationLengths: [
        { value: 5, label: 'Standard' },
        { value: 10, label: 'Extended' },
      ],
      defaultStationLength: 5,
    },
    focus: {
      title: 'Stations',
      noun: 'stations',
      priorityCopy: "This is the order you'll face them in.",
      items: [
        'Ethical Scenario',
        'Communication / Role Play',
        'Motivation for Medicine',
        'Work Experience Reflection',
        'Teamwork & Leadership',
        'Situational Judgement',
        'Critical Thinking / Problem Solving',
        'Data Interpretation',
        'Health Awareness / Current Issues',
        'Empathy & Reflection',
      ],
    },
  },

  postgraduate: {
    id: 'postgraduate',
    shape: 'circuit',
    context: [
      {
        key: 'pathway',
        label: 'Training pathway',
        required: true,
        type: 'select',
        options: ['Core training', 'ST1 and run-through', 'Higher specialty'],
      },
      {
        key: 'programme',
        label: 'Programme or specialty',
        required: true,
        type: 'select',
        gatedBy: 'pathway',
        gatePrompt: 'Choose a pathway first',
        optionsBy: {
          'Core training': [
            'Internal Medicine Training (IMT)',
            'Core Surgical Training',
            'Anaesthetics',
            'ACCS Emergency Medicine',
          ],
          'ST1 and run-through': [
            'Paediatrics',
            'Obstetrics & Gynaecology',
            'Ophthalmology',
            'Clinical Radiology',
            'Neurosurgery',
            'Public Health',
          ],
          'Higher specialty': [
            'Trauma & Orthopaedics',
            'ENT',
            'General Surgery',
            'Urology',
            'Cardiology',
            'Gastroenterology',
            'Respiratory Medicine',
            'Geriatric Medicine',
          ],
        },
      },
      { key: 'deanery', label: 'Region or deanery', required: false, type: 'text', placeholder: 'e.g. London' },
    ],
    format: {
      stations: [2, 3, 4, 5, 6],
      defaultStations: 4,
      stationLengths: [
        { value: 5, label: 'Short' },
        { value: 8, label: 'Standard' },
        { value: 11, label: 'Extended' },
      ],
      defaultStationLength: 8,
    },
    focus: {
      title: 'Stations',
      noun: 'stations',
      priorityCopy: "This is the order you'll face them in.",
      items: [
        'Portfolio Review',
        'Clinical Scenario',
        'Ethical Scenario',
        'Communication / Role Play',
        'Management & Leadership',
        'Teaching Station',
        'Presentation',
        'Motivation & Specialty Fit',
        'Quality Improvement / Audit',
        'Judgement Under Pressure',
      ],
    },
  },
}

export const PRACTICE_IDS = Object.keys(PRACTICE)

/** Config plus the identity the rest of the app already knows the track by. */
export function trackConfig(id) {
  return PRACTICE[id] ? { ...PRACTICE[id], ...TRACK[id] } : null
}

export const isCircuit = (config) => config?.shape === 'circuit'

/** How long a configured session runs. One definition; the price follows it. */
export function minutesOf(config, format = {}) {
  if (!config) return 0
  return isCircuit(config)
    ? (format.stations || 0) * (format.stationLength || 0)
    : format.duration || 0
}

/** What it costs. `creditsFor` is the app's one credits-per-minute rule. */
export function costOf(config, format) {
  return creditsFor(minutesOf(config, format))
}

/** The cheapest and dearest this track can be, for the range shown at step 1. */
export function costRange(config) {
  if (!config) return ''
  const costs = isCircuit(config)
    ? config.format.stations.map((n) =>
        costOf(config, { stations: n, stationLength: config.format.defaultStationLength }),
      )
    : config.format.lengths.map((v) => costOf(config, { duration: v }))
  return `${Math.min(...costs)}–${Math.max(...costs)}`
}

/** How many things step 3 wants: one per station, or the panel's own range. */
export function focusTarget(config, format) {
  return isCircuit(config) ? format.stations || 0 : config.focus.max
}

/** The format a track starts on before anything is chosen. */
export function defaultFormat(config) {
  return isCircuit(config)
    ? {
        stations: config.format.defaultStations,
        stationLength: config.format.defaultStationLength,
        mode: 'guided',
        difficulty: 'realistic',
      }
    : { duration: config.format.defaultLength, mode: 'guided', difficulty: 'realistic' }
}

/**
 * First-run setup asked what worries the candidate, and promised those answers
 * would weight the first session. `onboarding.js` owns that mapping — the same
 * one its worries step previews — and this filters it down to areas this track
 * actually offers, so a name that ever drifts is dropped rather than
 * pre-selecting something the candidate never chose.
 */
export function focusFromWorries(trackId, worries = [], cap = 6) {
  const items = PRACTICE[trackId]?.focus.items || []
  return worriesToFocus(trackId, worries, cap).filter((area) => items.includes(area))
}

/* ── the recommendation the dashboard hands over ────────────────────────────
   A rubric scores "Handling Pressure"; the panel offers "Handling Pressure /
   Resilience". Two vocabularies for one thing, so the weakest dimension can be
   turned into the focus area that practises it. An unmatched dimension is
   dropped rather than pre-selecting an area that is not the weak one.
   ────────────────────────────────────────────────────────────────────────── */
const DIM_FOCUS = {
  nhs: {
    'Communication & Clarity': 'Communication & Clarity',
    'Teamwork & Collaboration': 'Teamwork & Collaboration',
    'Integrity & NHS Values': 'Integrity & NHS Values',
    'Quality Improvement': 'Quality Improvement & Learning',
    'Clinical Judgment': 'Clinical Judgment & Decision-Making',
    'Handling Pressure': 'Handling Pressure / Resilience',
  },
  university: {
    'Ethical Reasoning': 'Ethical Scenario',
    'Communication / Role Play': 'Communication / Role Play',
    'Motivation for Medicine': 'Motivation for Medicine',
    'Reflection on Experience': 'Work Experience Reflection',
    'Teamwork & Leadership': 'Teamwork & Leadership',
    'Critical Thinking': 'Critical Thinking / Problem Solving',
  },
  postgraduate: {
    'Portfolio & Evidence': 'Portfolio Review',
    'Clinical Scenario Handling': 'Clinical Scenario',
    'Management & Leadership': 'Management & Leadership',
    'Teaching & Presentation': 'Teaching Station',
    'Specialty Fit & Motivation': 'Motivation & Specialty Fit',
    'Judgement Under Pressure': 'Judgement Under Pressure',
  },
}

/** Weakest first, mapped to focus areas, padded from the top of the list. */
function focusByWeakness(config, dims, slots) {
  const map = DIM_FOCUS[config.id] || {}
  const picked = []
  ;[...dims]
    .sort((a, b) => a.v - b.v)
    .forEach((dim) => {
      const area = map[dim.k]
      if (area && config.focus.items.includes(area) && !picked.includes(area)) picked.push(area)
    })
  config.focus.items.forEach((item) => {
    if (!picked.includes(item)) picked.push(item)
  })
  return picked.slice(0, slots)
}

/** What first-run setup answered that the configurator would otherwise ask
 *  again. Only an answer the field itself offers carries over. */
function recoverContext(config, profile) {
  const ctx = {}
  const first = config.context[0]
  if (first && profile?.role && (first.options || []).includes(profile.role)) {
    ctx[first.key] = profile.role
  }
  return ctx
}

/** The format the recommendation recommends. A panel's middle length, a
 *  circuit's default size — the shape the dashboard's sentence describes. */
function recommendedFormat(config) {
  return isCircuit(config)
    ? {
        stations: config.format.defaultStations,
        stationLength: config.format.defaultStationLength,
        mode: 'guided',
        difficulty: 'realistic',
      }
    : { duration: config.format.defaultLength, mode: 'guided', difficulty: 'realistic' }
}

/**
 * The session the dashboard's "practise this next" card offers — the sentence
 * it makes, the price on its button, and the configuration its button applies.
 * All three read from one object, so what the card promises is what starts.
 *
 * `intent` is 'target' for the usual recommendation — the recommended format,
 * weighted onto the weakest areas — or 'repeat' for picking a lapsed track back
 * up, where "the same setup as last time" is the whole promise being made.
 */
export function practicePlan({ trackId, dims = [], profile = null, intent = 'target' }) {
  const config = trackConfig(trackId)
  if (!config) return null

  const format = recommendedFormat(config)
  const ctx = recoverContext(config, profile)
  const slots = isCircuit(config) ? format.stations : config.focus.min
  const weakest = [...dims].sort((a, b) => a.v - b.v)[0] || null

  const picked = dims.length
    ? focusByWeakness(config, dims, slots)
    : focusFromWorries(trackId, profile?.worries || [], slots)

  return {
    trackId,
    intent,
    ctx,
    format,
    picked,
    minutes: minutesOf(config, format),
    cost: costOf(config, format),
    /* the sentence the card makes about what it would run */
    shapeLabel: isCircuit(config)
      ? `A ${format.stations}-station circuit weighted here`
      : `A ${format.duration}-minute panel weighted here`,
    /* the weakness the plan is built around; a repeat targets nothing new */
    target: intent === 'repeat' ? null : weakest?.k || null,
    /* required answers the app could not recover — the candidate still has to
       give these, and the configurator says which */
    missing: config.context.filter((f) => f.required && !ctx[f.key]).map((f) => f.label),
  }
}

/**
 * What a configured session says it is, as rows.
 *
 * It lives here rather than in the Ready step because two screens state the
 * same thing — the confirmation you agree to, and the room you land in once
 * the credits are spent — and a second copy is a second chance for the two to
 * describe different sessions. `step` is which step owns the answer, for the
 * Edit link the confirmation carries and the room does not.
 */
export function summaryRows({ config, ctx, format, picked, circuit }) {
  return [
    ...config.context.filter((f) => ctx[f.key]).map((f) => ({ k: f.label, v: ctx[f.key], step: 1 })),
    {
      k: circuit ? 'Circuit' : 'Length',
      v: circuit
        ? `${format.stations} stations \u00d7 ${format.stationLength} min`
        : `${format.duration} minutes`,
      step: 2,
    },
    { k: 'Mode', v: MODES.find((m) => m.value === format.mode)?.label, step: 2 },
    { k: 'Examiner', v: DIFFICULTY.find((d) => d.value === format.difficulty)?.label, step: 2 },
    { k: circuit ? 'Stations' : 'Focus areas', v: picked.join(' \u00b7 '), step: 3 },
  ]
}
