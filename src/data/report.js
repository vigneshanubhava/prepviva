/**
 * The session report — what is derived, and what is still standing in.
 *
 * Ported from the reference prototype (`../interview-prototype/src/features/
 * report/`: `reportModel.js` + `fixtures.js`). Its most important convention is
 * kept: **anything the app genuinely computes is separated from anything a
 * backend would have to produce.** Everything under NARRATIVES, VOICE, ETHICS
 * and QUESTIONS is placeholder copy, marked as such, and the report tags it on
 * screen — a reviewer must never be left thinking a paragraph was written about
 * their actual session.
 *
 * Real, derived here: the score, its band and rank, the readiness call and gap,
 * the practice estimate, the trend against the previous attempt, the date, the
 * session code, the duration, and the competency scores.
 */
import { RUBRIC, TRACK, formatScore } from './dashboard.js'
import { formatDate } from './trial.js'

/** The one number everything else hangs off. Raise it and the gap, the
 *  readiness call, the ring's marker and the practice estimate all move. */
export const REPORT = {
  /** score at or above which a candidate is called ready */
  benchmark: 65,
  /** points a focused session typically adds — drives the estimate */
  gainPerSession: 6,
  /** report scores are normalised to this scale, whatever the track's own is */
  scaleMax: 100,
}

/* how the score is described … */
const BANDS = [
  { min: 80, label: 'Strong', tone: 'success' },
  { min: 65, label: 'Solid', tone: 'success' },
  { min: 40, label: 'Developing', tone: 'warning' },
  { min: 0, label: 'Needs work', tone: 'danger' },
]

/* … and the coarser judgement shown beside it */
const RANKS = [
  { min: 85, label: 'Exemplary' },
  { min: 70, label: 'Proficient' },
  { min: 50, label: 'Competent' },
  { min: 25, label: 'Developing' },
  { min: 0, label: 'Emerging' },
]

const pick = (table, score) => table.find((row) => score >= row.min) || table[table.length - 1]

export const bandFor = (score) => pick(BANDS, score)
export const rankFor = (score) => pick(RANKS, score).label

export function readinessFor(score, benchmark = REPORT.benchmark) {
  const gap = Math.max(0, Math.round(benchmark - score))
  return {
    ready: score >= benchmark,
    label: score >= benchmark ? 'Ready' : 'Not yet ready',
    tone: score >= benchmark ? 'success' : 'warning',
    gap,
    benchmark,
    gapLabel:
      gap > 0
        ? `${gap} point${gap === 1 ? '' : 's'} to readiness`
        : 'At or above the readiness benchmark',
  }
}

export function practiceEstimate(gap, gainPerSession = REPORT.gainPerSession) {
  if (gap <= 0) return { sessions: 0, label: 'You are at the benchmark now' }
  const sessions = Math.max(1, Math.ceil(gap / gainPerSession))
  return {
    sessions,
    gainPerSession,
    label: `about ${sessions} focused session${sessions === 1 ? '' : 's'}`,
  }
}

/** Null on a first session — the indicator is skipped rather than shown as
 *  zero, which would read as "no progress" instead of "nothing to compare". */
export function trendFor(score, previous) {
  if (previous == null) return null
  const delta = Math.round(score - previous)
  if (delta === 0) return { delta: 0, direction: 'flat', label: 'same as last session' }
  return {
    delta,
    direction: delta > 0 ? 'up' : 'down',
    label: `${delta > 0 ? '+' : ''}${delta} vs last session`,
  }
}

/** Every track is marked on its own scale; a report is always 0–100. */
export const toReportScore = (raw, scaleMax) => Math.round((raw / (scaleMax || 100)) * REPORT.scaleMax)

/** Sessions carry a day offset, not a date. A report is a document someone may
 *  read months later, so it gets a real one. */
export function dateFromAgo(ago) {
  const date = new Date()
  date.setDate(date.getDate() - (ago || 0))
  return date
}

/**
 * A stable identifier for the session, derived rather than random so the code
 * survives a re-render and a reload. No I, O, 0 or 1 — they are misread when
 * someone reads a code down a phone.
 */
export function sessionCode(trackId, index) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seed = `${trackId}#${index}`

  // FNV-1a to fold the seed, then xorshift32 per character: a simpler
  // multiply-and-divide leaves adjacent sessions differing by one leading
  // character, which reads as broken rather than as an identifier.
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }

  let out = ''
  for (let i = 0; i < 8; i += 1) {
    h ^= (h << 13) >>> 0
    h >>>= 0
    h ^= h >>> 17
    h ^= (h << 5) >>> 0
    h >>>= 0
    out += alphabet[h % alphabet.length]
  }
  return out
}

/* ══════════════════════════════════════════════════════════════════════════
   PLACEHOLDER CONTENT
   Everything below stands in for analysis a backend would produce. It is in
   one block so there is a single place to delete from once the real payload
   exists, and every screen that shows it tags it.
   ══════════════════════════════════════════════════════════════════════════ */

export const PLACEHOLDER = {
  label: 'Sample content',
  note: 'Placeholder copy — not generated from this session.',
}

export const NARRATIVES = {
  summary:
    'You approached this station with professional composure and a calm, measured tone throughout, ' +
    'which reads well to a panel and is a genuine asset. Your answers stayed courteous under ' +
    'questioning and you never became defensive. The substance did not match the delivery, though. ' +
    'Responses stayed largely generic — describing what a good candidate should do in the abstract ' +
    'rather than what you specifically did, saw or decided. Concrete examples from your own ' +
    'placements, audits and team experiences were largely absent, and several examiner prompts ' +
    'inviting you to go deeper were acknowledged but not taken up. On ethical content you ' +
    'referenced UK guidance correctly but did not structure your reasoning around a recognised ' +
    'framework, so key territory went uncovered. The foundations are there; the evidence is not yet.',

  insights: [
    {
      tone: 'success',
      title: 'Professional composure',
      body:
        'You held a calm, courteous register throughout and did not become flustered when ' +
        'challenged. That is a real strength and a good platform to build on.',
    },
    {
      tone: 'warning',
      title: 'Lack of specificity',
      body:
        'Answers described good practice in general terms rather than drawing on your own ' +
        'placements, audits or patients. Panels score evidence, not intentions.',
    },
    {
      tone: 'warning',
      title: 'Missed prompts',
      body:
        'The examiner opened the door several times with follow-up prompts. You acknowledged them ' +
        'but did not expand, leaving available marks on the table.',
    },
  ],

  feedback:
    'The thing to hold on to is that your manner is not the problem — it is already close to where ' +
    'it needs to be. What is missing is evidence. Every claim you make about yourself needs a ' +
    'specific moment attached to it: a patient, a ward, a decision, an outcome, something you would ' +
    'do differently. Before your next session, write out six short stories from your own experience ' +
    '— one for teamwork, one for a mistake, one for ethics, one for pressure, one for leadership, ' +
    'one for quality improvement. Two or three sentences each, with the outcome and the reflection. ' +
    'You are not short of material; you are short of retrieval practice under pressure. And when an ' +
    'examiner asks a follow-up, that is an invitation, not a challenge — answer it directly.',

  framework: {
    title: 'Good answer framework',
    subtitle: 'A reference structure for ethics stations',
    steps: [
      {
        title: 'Recognise the issue',
        body: 'Name the ethical tension explicitly — what is in conflict, and for whom.',
      },
      {
        title: 'Gather the relevant facts',
        body: 'State what more you would need to know, and who you would ask, before acting.',
      },
      {
        title: 'Apply a framework',
        body:
          'Work through the four pillars — autonomy, beneficence, non-maleficence, justice — and ' +
          'reference GMC duties, capacity and confidentiality where they bear on the case.',
      },
      {
        title: 'Weigh the options',
        body: 'Give at least two courses of action and say honestly what each costs.',
      },
      {
        title: 'Commit and safety-net',
        body:
          'Choose a course, justify it, then say who you would escalate to and what would make you ' +
          'change your mind.',
      },
    ],
  },

  /* P1 is what to do first — a list of five equal actions is a list nobody
     starts. */
  actions: [
    {
      priority: 'P1',
      title: 'Build a six-story evidence bank',
      body:
        'Write out six specific experiences — teamwork, error, ethics, pressure, leadership, ' +
        'quality improvement — with outcome and reflection. Two to three sentences each.',
    },
    {
      priority: 'P1',
      title: 'Learn the four pillars cold',
      body:
        'Be able to name and apply autonomy, beneficence, non-maleficence and justice without ' +
        'hesitating, and practise saying them out loud against a real case.',
    },
    {
      priority: 'P2',
      title: 'Answer every follow-up prompt directly',
      body:
        'Record yourself and count how many prompts you expanded on versus acknowledged. Aim to ' +
        'expand on all of them.',
    },
    {
      priority: 'P2',
      title: 'Practise the five-step structure on three stations',
      body:
        'Use the framework above as a spine until the shape becomes automatic rather than ' +
        'something you have to remember.',
    },
    {
      priority: 'P3',
      title: 'Tighten pace and filler words',
      body:
        'Your delivery is calm but padded. Re-run two answers aiming for the same content in fewer ' +
        'words, then compare the recordings.',
    },
  ],

  /* Refers back to the verdict rather than revealing it again. */
  recommendation:
    'As the score at the top of this report reflects, this session sits below the readiness ' +
    'threshold — but the gap is a content gap, not a temperament one, and that is the easier of the ' +
    'two to close. Your composure under questioning is already at interview standard. What stands ' +
    'between you and a ready verdict is specific evidence from your own experience and a reliable ' +
    'structure for reasoning. Both are learnable in weeks rather than months, and both respond ' +
    'quickly to deliberate practice. Work through the P1 items first, then book another session on ' +
    'the same station type so the comparison means something.',
}

export const VOICE = {
  overall: 5,
  scaleMax: 10,
  metrics: [
    { k: 'Confidence', v: 5 },
    { k: 'Clarity', v: 6 },
  ],
  qualities: [
    { k: 'Tone', v: 'Calm, measured' },
    { k: 'Pace', v: 'Slightly slow' },
    { k: 'Filler words', v: 'Frequent' },
  ],
  narrative:
    'Your voice carries authority and you never sounded rushed, which works in your favour on a ' +
    'panel. The pace drifts slow when you are searching for content, and that is where filler ' +
    'creeps in — the hesitation is audible and reads as uncertainty even when you are simply ' +
    'thinking.',
  strengths: [
    'Calm, measured tone that holds up under questioning',
    'Clear articulation — every word was intelligible',
    'No defensiveness when challenged',
  ],
  toImprove: [
    'Reduce filler words while thinking — a short silence is stronger',
    'Lift the pace slightly when recalling examples',
    'Vary emphasis to signal the important part of an answer',
  ],
}

/** All four domains unscored, which is what drives the collapsed treatment.
 *  Give any domain a numeric `v` and the full four-card layout appears. */
export const ETHICS = {
  scaleMax: 10,
  domains: [
    { k: 'Communication', v: null },
    { k: 'Structure', v: null },
    { k: 'Ethical awareness', v: null },
    { k: 'Reasoning', v: null },
  ],
  notes: [
    { tone: 'success', body: 'UK guidance used correctly' },
    { tone: 'warning', body: 'Missed GMC duties, four pillars, capacity and confidentiality' },
  ],
}

/**
 * The per-question sets, keyed by track so a circuit's stations differ from a
 * panel's questions. Scores are on the report's own 0–100 scale.
 */
export const QUESTIONS = {
  nhs: [
    {
      id: 'q1',
      n: 1,
      topic: 'Integrity & NHS Values',
      timeSpent: '1m 10s',
      score: 32,
      prompt: 'Tell me about a time you had to challenge a senior colleague about patient safety.',
      answer:
        'I think patient safety is the most important thing in the NHS, so if I saw something ' +
        'unsafe I would definitely raise it. It is important to be professional about it and not ' +
        'accuse anyone. I would probably speak to them privately first, and if that did not work I ' +
        'would escalate to someone more senior. Patient safety has to come first.',
      worked: ['Correct instinct — escalation was mentioned', 'Professional, non-accusatory framing'],
      missed: [
        'No actual example — this describes what you would do, not what you did',
        'No named outcome or reflection',
        'Did not reference the duty to raise concerns or local escalation routes',
      ],
      model:
        'On my FY1 respiratory placement I noticed a registrar had prescribed enoxaparin at ' +
        'treatment dose for a patient whose creatinine had risen sharply overnight. I checked the ' +
        'renal dosing guidance to be sure I was right, then caught him between ward rounds and said ' +
        'I wanted to check the dose against the new bloods rather than telling him he was wrong. He ' +
        'had not seen the morning results and changed it immediately. I logged it as a near miss ' +
        'because the system had let a stale result drive a prescription, and that fed into a ' +
        'pharmacy-led review of renal dosing alerts. What I took from it is that raising a concern ' +
        'well is mostly about timing and framing.',
    },
    {
      id: 'q2',
      n: 2,
      topic: 'Clinical Judgment & Decision-Making',
      timeSpent: '1m 05s',
      score: 24,
      prompt: 'A patient refuses a treatment you believe they need. How do you approach this?',
      answer:
        'I would respect their decision because patients have autonomy. I would explain the risks ' +
        'clearly and make sure they understood, and document everything. If they still refused, ' +
        'that is their right. I might ask a senior for advice.',
      worked: ['Autonomy named correctly', 'Documentation mentioned'],
      missed: [
        'Capacity never assessed — the central issue in this scenario',
        'No exploration of why the patient is refusing',
        'Four pillars not used as a structure',
        'No safety-net or follow-up plan',
      ],
      model:
        'My first question is whether this is an informed refusal by a patient with capacity, so I ' +
        'would assess capacity for this specific decision — can they understand, retain, weigh and ' +
        'communicate. Assuming they can, the refusal stands even if I disagree, and my job shifts ' +
        'to making sure it is genuinely informed. I would explore what is driving it: a previous ' +
        'bad experience, a misunderstanding of the risk, fear of side effects. Often the refusal is ' +
        'to a detail rather than the whole treatment, and there is an alternative that gets most of ' +
        'the benefit. I would document the discussion and the capacity assessment, keep the door ' +
        'open explicitly, involve a senior, and escalate for a formal assessment if capacity were ' +
        'genuinely in doubt.',
    },
    {
      id: 'q3',
      n: 3,
      topic: 'Quality Improvement & Learning',
      timeSpent: '45s',
      score: 28,
      prompt: 'Describe a quality improvement project you have been involved in.',
      answer:
        'I have been involved in audit work during my training. I think quality improvement is ' +
        'really valuable because it helps improve patient care. I helped collect data for an audit ' +
        'and we presented the findings to the department.',
      worked: ['Understands the purpose of QI', 'Some genuine involvement indicated'],
      missed: [
        'No topic, no numbers, no outcome',
        'No description of your specific contribution',
        'Second cycle never mentioned — audit without re-measurement is not improvement',
        'The examiner prompted for detail and the answer did not expand',
      ],
      model:
        'I led a re-audit of VTE risk assessment completion on a 28-bed surgical ward, where ' +
        'baseline compliance was 61% against a 95% standard. I sampled 80 admissions over four ' +
        'weeks, then looked at why it was being missed rather than just reporting the number — it ' +
        'was almost entirely post-take admissions at night, where the assessment sat on a separate ' +
        'page of the clerking proforma. I moved it onto the front sheet and ran two teaching ' +
        'sessions at the night handover. On re-audit eight weeks later compliance was 89%. It is ' +
        'short of the standard, and I would want a third cycle with an electronic prompt, but the ' +
        'lesson was that the fix was a form-design problem, not a knowledge problem.',
    },
  ],

  university: [
    {
      id: 'q1',
      n: 1,
      topic: 'Ethical Scenario',
      timeSpent: '4m 20s',
      score: 41,
      prompt: "A friend on your course tells you they have been drinking before placements. What do you do?",
      answer:
        'I would be really concerned about this because it affects patient safety. I would talk to ' +
        'my friend first and encourage them to get help. If they did not, I would have to tell ' +
        'someone because patients come first.',
      worked: ['Identified the patient-safety dimension', 'Recognised escalation is necessary'],
      missed: [
        'Did not weigh the duty to a friend against the duty to patients explicitly',
        'No mention of university or professional fitness-to-practise routes',
        'Support options for the friend not explored',
      ],
      model:
        'There are two duties in tension here and I would say so: my loyalty to a friend, and the ' +
        'safety of patients they are in contact with. Patient safety wins, but that does not mean ' +
        'going straight over their head. I would talk to them first, privately and without ' +
        'accusation, and try to understand what is driving it — this is very often a symptom of ' +
        'something else, and treating it as a disciplinary matter first can make them hide it. I ' +
        'would tell them honestly that I cannot keep this to myself if it continues, and point them ' +
        'at occupational health, their GP and the university support service. If nothing changed I ' +
        'would raise it with my personal tutor. Reporting is the last step, not the first, but it ' +
        'is not optional.',
    },
    {
      id: 'q2',
      n: 2,
      topic: 'Motivation for Medicine',
      timeSpent: '4m 05s',
      score: 52,
      prompt: 'Why medicine, and why now?',
      answer:
        'I have always wanted to help people and I am interested in science. I did work experience ' +
        'at a hospital which confirmed it for me. I think medicine combines both of those things.',
      worked: ['Clear, sincere delivery', 'Work experience referenced'],
      missed: [
        '"Helping people" applies to many careers — nothing here is specific to medicine',
        'No specific moment from the work experience',
        'No acknowledgement of the difficult parts of the job',
      ],
      model:
        'The honest answer changed after my work experience. I went in expecting to be drawn to the ' +
        'diagnostic side, and what actually stayed with me was a consultant spending twenty minutes ' +
        'with a family explaining a poor prognosis — no new information after the first two ' +
        'minutes, just staying in a difficult room. That is the part of the job I cannot get ' +
        'elsewhere: sustained responsibility for someone at their worst, with real scientific ' +
        'reasoning underneath it. I have also seen the parts that are hard, and I have tested that ' +
        'by volunteering on a stroke ward for a year rather than a fortnight.',
    },
  ],

  postgraduate: [
    {
      id: 'q1',
      n: 1,
      topic: 'Portfolio Review',
      timeSpent: '7m 30s',
      score: 44,
      prompt:
        'Walk me through your most significant quality improvement project — and what you would do differently.',
      answer:
        'I completed an audit on documentation standards which showed compliance was below the ' +
        'standard. I presented it at the departmental meeting and we agreed some changes. It was a ' +
        'useful project and I learned a lot about the audit process.',
      worked: ['Genuine project with a real finding', 'Presented to the department'],
      missed: [
        'No baseline figure, no target, no re-measurement',
        'The "what I would do differently" half of the question went unanswered',
        'Your specific role versus the team\'s not distinguished',
      ],
      model:
        'The one I would point to is a re-audit of WHO checklist completion in theatres, where ' +
        'baseline documented completion was 72% against a 100% standard. I mapped where it was ' +
        'failing — almost all of it was the sign-out step at the end of long lists — then worked ' +
        'with the theatre team leads on a laminated prompt and a named responsible person per list. ' +
        'Re-audit at three months was 94%. What I would do differently: I designed the intervention ' +
        'before I had spoken to the scrub nurses, and their view — that sign-out collided with ' +
        'turnover pressure — was the thing that actually mattered. I would now do the qualitative ' +
        'work before the fix, and build the third cycle into the plan from the start.',
    },
  ],
}

/**
 * Assemble one report from a session row and its track.
 *
 *   session — an entry from HISTORY[state].tracks[id].recent
 *   index   — its position in that array (0 = most recent)
 *   track   — the whole track, for the previous attempt and the competencies
 */
export function buildReport({ trackId, session, index, track }) {
  const meta = TRACK[trackId]
  const rubric = RUBRIC[trackId]

  const score = toReportScore(session.s, rubric.scaleMax)
  const band = bandFor(score)
  const readiness = readinessFor(score)
  const previous = track?.recent?.[index + 1]

  return {
    id: `${trackId}-${index}`,
    code: sessionCode(trackId, index),
    trackId,
    track: meta,
    rubric,

    /* zone 1 — the verdict */
    score,
    scaleMax: REPORT.scaleMax,
    band,
    rank: rankFor(score),
    readiness,
    estimate: practiceEstimate(readiness.gap),
    trend: trendFor(score, previous ? toReportScore(previous.s, rubric.scaleMax) : null),
    sessionName: session.n,
    meta: {
      date: formatDate(dateFromAgo(session.ago)),
      relative: session.d,
      track: meta.label,
      stream: meta.stream,
      // sessions do not record their mode yet
      mode: session.mode || 'Guided',
      questions: (QUESTIONS[trackId] || []).length || 3,
      duration: `${session.m} min`,
    },

    /* zone 3 — real, on the track's own scale */
    competencies: track?.dims || [],
    rawScore: formatScore(session.s, rubric.scaleMax),

    /* the rest is placeholder copy, tagged wherever it is shown */
    narratives: NARRATIVES,
    voice: VOICE,
    ethics: ETHICS,
    questions: QUESTIONS[trackId] || [],
    placeholder: PLACEHOLDER,
  }
}

/** Every session across every track, newest first. The per-track index travels
 *  with each row because that is how a report finds the previous attempt. */
export function allSessions(state) {
  return Object.entries(state.tracks)
    .flatMap(([trackId, track]) =>
      (track.recent || []).map((session, index) => ({ trackId, session, index, track })),
    )
    .sort((a, b) => a.session.ago - b.session.ago)
}
