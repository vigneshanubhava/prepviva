/**
 * The dashboard's practice history, and the rules for what may be shown.
 *
 * Ported from the reference prototype (`../interview-prototype`,
 * `src/data/dashboardData.js` + `src/domain/rubric.js`), which owns the product
 * thinking here. Nothing about the behaviour is new: the three tracks score
 * against different rubrics on different scales, so a single blended readiness
 * number would be meaningless — everything about **quality** is per track, and
 * only **volume** (sessions, minutes, credits, renewal) is global.
 *
 * Two things are PrepViva's rather than the reference's:
 *   - tracks are keyed by the ids first-run setup already uses (`onboarding.js`
 *     TRACKS: nhs / university / postgraduate), so the track a candidate picked
 *     in setup is the track the dashboard opens on;
 *   - a session's price comes from `trial.js` (1 credit ≈ 10 minutes) rather
 *     than being typed in, the same rule every other figure on the app follows.
 *
 * `cold | warm | established | lapsed` are the four candidate states the screen
 * has to render. The Prototype controls panel doc/BRIEF.md asks for is not
 * built, so `/dashboard?state=cold` selects one meanwhile.
 */
import { TRACKS } from './onboarding.js'
import { CREDITS_PER_PANEL, MINUTES_PER_CREDIT } from './trial.js'

export const TRACK_IDS = TRACKS.map((t) => t.id)

/** Track identity — the setup card's label, glyph and accent, plus the words
 *  this screen needs: what one session of it is called, and what it is scored
 *  against. `stream` is the noun the prose uses ("Clinical readiness"). */
const STREAMS = {
  nhs: { stream: 'Clinical', session: 'NHS panel · Clinical' },
  university: { stream: 'MMI', session: 'MMI circuit · 4 stations' },
  postgraduate: { stream: 'Training', session: 'Specialty panel · Portfolio' },
}

export const TRACK = Object.fromEntries(
  TRACKS.map((t) => [t.id, { ...t, ...STREAMS[t.id], name: `${t.label} ${STREAMS[t.id].stream}` }]),
)

/**
 * Each track scores against its own rubric on its own scale, so a number only
 * means something next to the rubric it came from.
 */
export const RUBRIC = {
  nhs: {
    scaleMax: 100,
    scaleShort: '0–100',
    scaleLabel: 'NHS values panel rubric — each competency scored 0–100',
    unit: '',
    dims: [
      'Communication & Clarity',
      'Teamwork & Collaboration',
      'Integrity & NHS Values',
      'Quality Improvement',
      'Clinical Judgment',
      'Handling Pressure',
    ],
  },
  university: {
    scaleMax: 10,
    scaleShort: '0–10',
    scaleLabel: 'MMI station average — each station scored 0–10',
    unit: '/10',
    dims: [
      'Ethical Reasoning',
      'Communication / Role Play',
      'Motivation for Medicine',
      'Reflection on Experience',
      'Teamwork & Leadership',
      'Critical Thinking',
    ],
  },
  postgraduate: {
    scaleMax: 12,
    scaleShort: '0–12',
    scaleLabel: 'Specialty recruitment rubric — each domain scored 0–12',
    unit: '/12',
    dims: [
      'Portfolio & Evidence',
      'Clinical Scenario Handling',
      'Management & Leadership',
      'Teaching & Presentation',
      'Specialty Fit & Motivation',
      'Judgement Under Pressure',
    ],
  },
}

/** 1 credit ≈ 10 minutes of practice (trial.js). One definition of the price,
 *  because the card's sentence and its button have to agree. */
export function creditsFor(minutes) {
  return Math.ceil(minutes / MINUTES_PER_CREDIT)
}

/* six values in, six named dimensions out — every track keeps the same axis
   count, so the competency list lines up whichever track is on screen */
const dimsFor = (id, ...vals) => RUBRIC[id].dims.map((k, i) => ({ k, v: vals[i] }))
const noTrack = () => ({
  sessions: 0,
  minutes: 0,
  readiness: null,
  delta: null,
  history: [],
  dims: [],
  recent: [],
})

/**
 * `history` is the 0–100 readiness index, one point per session, oldest first.
 * `recent[].s` is the raw rubric score on that track's own scale — the two are
 * deliberately not the same number.
 */
export const HISTORY = {
  cold: {
    label: 'Cold',
    note: 'No sessions yet',
    daysToInterview: 41,
    primary: 'nhs',
    tracks: { nhs: noTrack(), university: noTrack(), postgraduate: noTrack() },
  },

  warm: {
    label: 'Warm',
    note: '1–3 sessions',
    daysToInterview: 34,
    primary: 'nhs',
    tracks: {
      nhs: {
        sessions: 2,
        minutes: 95,
        readiness: 61,
        delta: null,
        history: [58, 61],
        dims: dimsFor('nhs', 71, 68, 64, 60, 58, 55),
        recent: [
          { n: TRACK.nhs.session, s: 66, ago: 4, d: '4 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 62, ago: 7, d: '7 days ago', m: 35 },
        ],
      },
      /* one session only — the state that must not show a readiness score
         or a trend, because a score off one data point is a lie */
      university: {
        sessions: 1,
        minutes: 40,
        readiness: null,
        delta: null,
        history: [],
        dims: dimsFor('university', 7.2, 7.0, 6.9, 6.6, 6.4, 6.1),
        recent: [{ n: TRACK.university.session, s: 6.8, ago: 1, d: 'Yesterday', m: 40 }],
      },
      postgraduate: noTrack(),
    },
  },

  established: {
    label: 'Established',
    note: '4+ sessions',
    daysToInterview: 23,
    primary: 'nhs',
    tracks: {
      nhs: {
        sessions: 9,
        minutes: 465,
        readiness: 72,
        delta: 8,
        history: [58, 61, 63, 64, 67, 69, 70, 71, 72],
        dims: dimsFor('nhs', 84, 79, 76, 70, 61, 58),
        recent: [
          { n: TRACK.nhs.session, s: 74, ago: 1, d: 'Yesterday', m: 60 },
          { n: TRACK.nhs.session, s: 71, ago: 6, d: '6 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 70, ago: 9, d: '9 days ago', m: 45 },
          { n: TRACK.nhs.session, s: 69, ago: 13, d: '13 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 67, ago: 17, d: '17 days ago', m: 45 },
          { n: TRACK.nhs.session, s: 64, ago: 22, d: '22 days ago', m: 30 },
          { n: TRACK.nhs.session, s: 63, ago: 28, d: '28 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 61, ago: 34, d: '34 days ago', m: 45 },
          { n: TRACK.nhs.session, s: 58, ago: 41, d: '41 days ago', m: 60 },
        ],
      },
      /* deliberately thin — nine NHS sessions against two MMI ones is the
         asymmetry the per-track split exists to handle */
      university: {
        sessions: 2,
        minutes: 80,
        readiness: 63,
        delta: null,
        history: [59, 63],
        dims: dimsFor('university', 7.6, 7.1, 7.0, 6.7, 6.3, 5.9),
        recent: [
          { n: TRACK.university.session, s: 7.1, ago: 3, d: '3 days ago', m: 40 },
          { n: TRACK.university.session, s: 6.6, ago: 11, d: '11 days ago', m: 40 },
        ],
      },
      postgraduate: noTrack(),
    },
  },

  lapsed: {
    label: 'Lapsed',
    note: '14+ days idle',
    daysToInterview: 12,
    primary: 'nhs',
    tracks: {
      nhs: {
        sessions: 6,
        minutes: 315,
        readiness: 69,
        delta: 4,
        history: [58, 61, 64, 66, 67, 69],
        dims: dimsFor('nhs', 80, 74, 71, 66, 62, 57),
        recent: [
          { n: TRACK.nhs.session, s: 69, ago: 19, d: '19 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 67, ago: 24, d: '24 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 66, ago: 29, d: '29 days ago', m: 45 },
          { n: TRACK.nhs.session, s: 64, ago: 36, d: '36 days ago', m: 60 },
          { n: TRACK.nhs.session, s: 61, ago: 44, d: '44 days ago', m: 45 },
          { n: TRACK.nhs.session, s: 58, ago: 51, d: '51 days ago', m: 45 },
        ],
      },
      university: {
        sessions: 2,
        minutes: 70,
        readiness: 60,
        delta: null,
        history: [57, 60],
        dims: dimsFor('university', 7.0, 6.8, 6.5, 6.2, 6.0, 5.6),
        recent: [
          { n: TRACK.university.session, s: 6.4, ago: 22, d: '22 days ago', m: 40 },
          { n: 'MMI circuit · 3 stations', s: 6.0, ago: 31, d: '31 days ago', m: 30 },
        ],
      },
      postgraduate: noTrack(),
    },
  },
}

export const HISTORY_STATES = Object.keys(HISTORY)

/** A URL that names a state the fixtures don't have falls back to the one the
 *  screen is normally demonstrated in. */
export function resolveState(name) {
  return HISTORY[name] ? name : 'established'
}

/* ── track selection rules ──────────────────────────────────────────────────
   A track earns a place in the switcher by having been used. The primary track
   is the one exception: it shows at zero so there is somewhere to start.
   ────────────────────────────────────────────────────────────────────────── */

/** The primary track is the one setup collected, when it collected one. */
export function primaryTrack(d, profile) {
  return profile?.track && TRACK_IDS.includes(profile.track) ? profile.track : d.primary
}

export function visibleTracks(d, primary = d.primary) {
  return TRACK_IDS.filter((id) => d.tracks[id].sessions > 0 || id === primary)
}

export function lastSessionAgo(t) {
  return t.recent.length ? t.recent[0].ago : Infinity
}

/** The default is the track of the most recent session, not the primary one —
 *  you land where you left off. */
export function defaultTrack(d, primary = d.primary) {
  let best = null
  let bestAgo = Infinity
  visibleTracks(d, primary).forEach((id) => {
    const ago = lastSessionAgo(d.tracks[id])
    if (ago < bestAgo) {
      bestAgo = ago
      best = id
    }
  })
  return best || primary
}

/** Self-healing: a selection that is no longer visible — because the state
 *  changed under it — falls back to the default. */
export function resolveTrack(d, selected, primary = d.primary) {
  return visibleTracks(d, primary).includes(selected) ? selected : defaultTrack(d, primary)
}

/** Global figures are the sum across tracks, never an average. */
export function globalTotals(d) {
  return TRACK_IDS.reduce(
    (acc, id) => ({
      sessions: acc.sessions + d.tracks[id].sessions,
      minutes: acc.minutes + d.tracks[id].minutes,
    }),
    { sessions: 0, minutes: 0 },
  )
}

/** How much of the quality view a track has earned. */
export function tierOf(n) {
  if (n === 0) return 'empty'
  if (n === 1) return 'single'
  if (n <= 3) return 'early'
  return 'full'
}

/** A 0–100 rubric reads as a whole number; a 0–10 one needs its decimal. */
export const formatScore = (v, max) => (max === 100 ? String(Math.round(v)) : v.toFixed(1))

/** "7h 45m" — practice time, in the unit people count it in. */
export function formatDuration(minutes) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** Days until the interview: setup's date when it has one, the fixture's
 *  otherwise. Never negative — a date that has passed reads as 0. */
export function daysToInterview(d, profile) {
  if (!profile?.interviewDate) return d.daysToInterview
  const ms = new Date(profile.interviewDate).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / 86400000))
}

/* ── credits ────────────────────────────────────────────────────────────────
   healthy · low · critical · empty — the ladder the notice above the dashboard
   renders against. Set against what a session actually costs (trial.js: a full
   panel is 6 credits), not at round numbers.
   ────────────────────────────────────────────────────────────────────────── */
export const MIN_SESSION_CREDITS = 3

export function creditLevel(balance) {
  if (balance <= 0) return 'empty'
  if (balance < MIN_SESSION_CREDITS) return 'critical'
  if (balance <= CREDITS_PER_PANEL + 2) return 'low'
  return 'healthy'
}
