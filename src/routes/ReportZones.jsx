import { Link } from 'react-router-dom'
import { Icon } from '../components/ui/index.js'
import { DimBars } from '../components/TrackCharts.jsx'
import styles from './Report.module.css'

/**
 * The six zones of a session report, in reading order:
 *
 *   1 Verdict      how did I do?
 *   2 Headline     the gist in 30 seconds
 *   3 Scorecard    where I stand, by dimension
 *   4 Answer lab   what I said, and what I should have said
 *   5 Coaching     how to get better
 *   6 Path forward am I ready? what next?
 *
 * Ported from the reference prototype's `features/report/zones.jsx`. Two of its
 * rules are load-bearing and kept:
 *
 *   - **placeholder content is tagged wherever it appears.** Everything under
 *     narratives, voice, ethics and the answer lab is sample copy standing in
 *     for analysis a backend would produce, and a reader must never mistake it
 *     for something written about their own session.
 *   - **the zones are never hidden behind tabs.** A report split across tabs is
 *     a report someone finishes having never read the action plan. The links at
 *     the top jump; they do not filter.
 */

/* ---------------------------------------------------------------- primitives */

export function Placeholder({ note }) {
  return (
    <span className={styles.placeholder} title={note}>
      <Icon name="info" size="12px" strokeWidth={2} />
      Sample content
    </span>
  )
}

function ZoneHead({ n, title, question, id }) {
  return (
    <div className={styles.zoneHead}>
      <span className={styles.zoneNumber} aria-hidden="true">
        {n}
      </span>
      <h2 className={styles.zoneTitle} id={id}>
        {title}
      </h2>
      <span className={styles.zoneQuestion}>{question}</span>
    </div>
  )
}

function ToneList({ title, items, tone }) {
  if (!items?.length) return null
  return (
    <div className={styles.toneList}>
      <p className={styles.toneTitle} data-tone={tone}>
        <Icon name={tone === 'success' ? 'checkCircle' : 'alertTriangle'} size="14px" strokeWidth={2} />
        {title}
      </p>
      <ul className={styles.toneItems}>
        {items.map((item) => (
          <li key={item} className={styles.toneItem} data-tone={tone}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bar({ label, value, max, tone }) {
  return (
    <p className={styles.bar}>
      <span className={styles.barLabel}>{label}</span>
      <span className={styles.barTrack}>
        <span className={styles.barFill} data-tone={tone} style={{ inlineSize: `${(value / max) * 100}%` }} />
      </span>
      <span className={styles.barValue}>
        {value}
        <span className={styles.barMax}>/{max}</span>
      </span>
    </p>
  )
}

/**
 * The score, drawn as a ring with the readiness benchmark marked on it — the
 * one place the two numbers can be compared at a glance rather than by
 * arithmetic.
 */
function ScoreRing({ score, scaleMax, benchmark, tone }) {
  const size = 148
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const angle = (benchmark / scaleMax) * 360 - 90
  const rad = (angle * Math.PI) / 180
  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      className={styles.ring}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Scored ${score} out of ${scaleMax}. The readiness benchmark is ${benchmark}.`}
    >
      <circle className={styles.ringTrack} cx={cx} cy={cy} r={r} strokeWidth={stroke} fill="none" />
      <circle
        className={styles.ringFill}
        data-tone={tone}
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${(score / scaleMax) * c} ${c}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      {/* the benchmark, as a notch on the track */}
      <line
        className={styles.ringMark}
        x1={cx + Math.cos(rad) * (r - stroke / 2 - 2)}
        y1={cy + Math.sin(rad) * (r - stroke / 2 - 2)}
        x2={cx + Math.cos(rad) * (r + stroke / 2 + 2)}
        y2={cy + Math.sin(rad) * (r + stroke / 2 + 2)}
        strokeWidth="2"
      />
      <text className={styles.ringScore} x={cx} y={cy + 4} textAnchor="middle">
        {score}
      </text>
      <text className={styles.ringScale} x={cx} y={cy + 24} textAnchor="middle">
        of {scaleMax}
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------ 1 · the verdict */

export function ZoneVerdict({ report }) {
  const { score, scaleMax, band, rank, readiness, trend, meta } = report

  const facts = [
    { k: 'Date', v: meta.date },
    { k: 'Track', v: meta.track },
    { k: 'Stream', v: meta.stream },
    { k: 'Mode', v: meta.mode },
    { k: 'Questions', v: meta.questions },
    { k: 'Duration', v: meta.duration },
  ]

  return (
    <section className={styles.zone} id="verdict" aria-labelledby="verdict-h">
      <ZoneHead n={1} title="Verdict" question="How did I do?" id="verdict-h" />

      <div className={styles.panel} data-tone={band.tone}>
        <div className={styles.verdict}>
          <ScoreRing score={score} scaleMax={scaleMax} benchmark={readiness.benchmark} tone={band.tone} />

          <div className={styles.verdictBody}>
            <div className={styles.judgements}>
              <span className={styles.band} data-tone={band.tone}>
                {band.label}
              </span>
              <span className={styles.pill}>Rank &middot; {rank}</span>
              <span className={styles.pill} data-tone={readiness.tone} data-filled="true">
                <Icon
                  name={readiness.ready ? 'checkCircle' : 'alertTriangle'}
                  size="12px"
                  strokeWidth={2}
                />
                {readiness.label}
              </span>
              {trend ? (
                <span className={styles.pill} data-direction={trend.direction}>
                  <Icon name="trendUp" size="12px" strokeWidth={2} />
                  {trend.label}
                </span>
              ) : (
                <span className={styles.pill}>First session on this track</span>
              )}
            </div>

            {/* the gap, stated rather than left to arithmetic */}
            <p className={styles.gap}>
              <strong>{readiness.gapLabel}</strong>
              {readiness.gap > 0
                ? ` — the benchmark for a ready verdict on this station type is ${readiness.benchmark}.`
                : ` — you are at or above the ${readiness.benchmark} needed for a ready verdict.`}
            </p>

            <dl className={styles.facts}>
              {facts.map((fact) => (
                <div key={fact.k} className={styles.fact}>
                  <dt>{fact.k}</dt>
                  <dd>{fact.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- 2 · the headline */

export function ZoneHeadline({ report }) {
  const { narratives, placeholder } = report

  return (
    <section className={styles.zone} id="headline" aria-labelledby="headline-h">
      <ZoneHead n={2} title="Headline" question="The gist in 30 seconds" id="headline-h" />

      <div className={styles.headlineGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Executive summary</h3>
            <Placeholder note={placeholder.note} />
          </div>
          <p className={styles.prose}>{narratives.summary}</p>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Key insights</h3>
            <Placeholder note={placeholder.note} />
          </div>

          <ul className={styles.insights}>
            {narratives.insights.map((insight) => (
              <li key={insight.title} className={styles.insight} data-tone={insight.tone}>
                <p className={styles.insightTitle}>
                  <Icon
                    name={insight.tone === 'success' ? 'checkCircle' : 'alertTriangle'}
                    size="14px"
                    strokeWidth={2}
                  />
                  {insight.title}
                </p>
                <p className={styles.insightBody}>{insight.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- 3 · the scorecard */

export function ZoneScorecard({ report }) {
  const { competencies, rubric, voice, ethics, placeholder, track } = report
  const unscored = ethics.domains.every((domain) => domain.v == null)

  return (
    <section className={styles.zone} id="scorecard" aria-labelledby="scorecard-h">
      <ZoneHead n={3} title="Scorecard" question="Where I stand, by dimension" id="scorecard-h" />

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h3 className={styles.panelTitle}>{track.stream} competencies</h3>
            <p className={styles.panelSub}>{rubric.scaleLabel}</p>
          </div>
        </div>

        <DimBars dims={competencies} scaleMax={rubric.scaleMax} />

        <p className={styles.note}>
          These are your scores on this track overall, not this session alone — a single session
          moves them, it does not replace them.
        </p>
      </div>

      <div className={styles.scoreGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Voice and delivery</h3>
              <p className={styles.panelSub}>How it sounded, not what was in it</p>
            </div>
            <Placeholder note={placeholder.note} />
          </div>

          <p className={styles.statRow}>
            <span className={styles.stat}>{voice.overall}</span>
            <span className={styles.statUnit}>of {voice.scaleMax} overall</span>
          </p>

          <div className={styles.bars}>
            {voice.metrics.map((metric) => (
              <Bar key={metric.k} label={metric.k} value={metric.v} max={voice.scaleMax} tone="accent" />
            ))}
          </div>

          <dl className={styles.qualities}>
            {voice.qualities.map((quality) => (
              <div key={quality.k} className={styles.quality}>
                <dt>{quality.k}</dt>
                <dd>{quality.v}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.prose}>{voice.narrative}</p>

          <div className={styles.toneGrid}>
            <ToneList title="Strengths" items={voice.strengths} tone="success" />
            <ToneList title="To improve" items={voice.toImprove} tone="warning" />
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Ethics marking</h3>
              <p className={styles.panelSub}>The four domains an ethics station is marked on</p>
            </div>
            <Placeholder note={placeholder.note} />
          </div>

          {unscored ? (
            /* Nothing was scored here, so the four cards would be four empty
               boxes. One line that says why is more honest and less noise. */
            <p className={styles.unscored}>
              <Icon name="minus" size="14px" strokeWidth={2} />
              Not scored in this session — {ethics.domains.map((d) => d.k.toLowerCase()).join(', ')}.
            </p>
          ) : (
            <div className={styles.bars}>
              {ethics.domains.map((domain) => (
                <Bar
                  key={domain.k}
                  label={domain.k}
                  value={domain.v ?? 0}
                  max={ethics.scaleMax}
                  tone="accent"
                />
              ))}
            </div>
          )}

          <ul className={styles.notes}>
            {ethics.notes.map((entry) => (
              <li key={entry.body} className={styles.toneItem} data-tone={entry.tone}>
                {entry.body}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- 4 · the answer lab */

export function ZoneAnswerLab({ report }) {
  const { questions, placeholder } = report

  return (
    <section className={styles.zone} id="answers" aria-labelledby="answers-h">
      <ZoneHead
        n={4}
        title="Answer lab"
        question="What I said, and what I should have said"
        id="answers-h"
      />

      {questions.length === 0 ? (
        <div className={styles.panel}>
          <p className={styles.note}>No per-question breakdown was recorded for this session.</p>
        </div>
      ) : (
        questions.map((question) => (
          <article key={question.id} className={styles.panel}>
            <div className={styles.questionHead}>
              <div>
                <p className={styles.eyebrow}>
                  Question {question.n} &middot; {question.topic}
                </p>
                <h3 className={styles.questionPrompt}>{question.prompt}</h3>
              </div>
              <div className={styles.questionScore}>
                <span className={styles.questionFigure}>{question.score}</span>
                <span className={styles.questionMeta}>of 100 &middot; {question.timeSpent}</span>
              </div>
            </div>

            <div className={styles.answerBlock}>
              <div className={styles.panelHead}>
                <h4 className={styles.answerTitle}>Your answer</h4>
                <Placeholder note={placeholder.note} />
              </div>
              <p className={styles.answer}>{question.answer}</p>
            </div>

            <div className={styles.toneGrid}>
              <ToneList title="What worked" items={question.worked} tone="success" />
              <ToneList title="What was missed" items={question.missed} tone="warning" />
            </div>

            <div className={styles.modelBlock}>
              <div className={styles.panelHead}>
                <h4 className={styles.answerTitle}>
                  <Icon name="sparkle" size="14px" strokeWidth={2} />
                  A stronger answer
                </h4>
                <Placeholder note={placeholder.note} />
              </div>
              <p className={styles.answer}>{question.model}</p>
            </div>
          </article>
        ))
      )}
    </section>
  )
}

/* ----------------------------------------------------------- 5 · the coaching */

export function ZoneCoaching({ report }) {
  const { narratives, placeholder } = report

  return (
    <section className={styles.zone} id="coaching" aria-labelledby="coaching-h">
      <ZoneHead n={5} title="Coaching" question="How to get better" id="coaching-h" />

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>What to work on</h3>
          <Placeholder note={placeholder.note} />
        </div>
        <p className={styles.prose}>{narratives.feedback}</p>
      </div>

      <div className={styles.coachGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>{narratives.framework.title}</h3>
              <p className={styles.panelSub}>{narratives.framework.subtitle}</p>
            </div>
            <Placeholder note={placeholder.note} />
          </div>

          <ol className={styles.steps}>
            {narratives.framework.steps.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Action plan</h3>
              <p className={styles.panelSub}>P1 first — the rest will keep</p>
            </div>
            <Placeholder note={placeholder.note} />
          </div>

          <ul className={styles.actions}>
            {narratives.actions.map((action) => (
              <li key={action.title} className={styles.action}>
                <span className={styles.priority} data-priority={action.priority}>
                  {action.priority}
                </span>
                <div>
                  <p className={styles.actionTitle}>{action.title}</p>
                  <p className={styles.actionBody}>{action.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- 6 · the path forward */

export function ZonePathForward({ report }) {
  const { narratives, readiness, estimate, placeholder, trackId, track } = report

  return (
    <section className={styles.zone} id="next" aria-labelledby="next-h">
      <ZoneHead n={6} title="Path forward" question="Am I ready? What next?" id="next-h" />

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Where this leaves you</h3>
          <Placeholder note={placeholder.note} />
        </div>
        <p className={styles.prose}>{narratives.recommendation}</p>

        <div className={styles.nextGrid}>
          <div className={styles.nextCell}>
            <p className={styles.eyebrow}>Readiness gap</p>
            <p className={styles.nextFigure} data-tone={readiness.ready ? 'success' : 'warning'}>
              {readiness.gap > 0 ? `${readiness.gap} pts` : 'None'}
            </p>
            <p className={styles.nextMeta}>Benchmark {readiness.benchmark} of 100</p>
          </div>

          <div className={styles.nextCell}>
            <p className={styles.eyebrow}>Estimated practice</p>
            <p className={styles.nextFigure}>
              {estimate.sessions === 0 ? '—' : `${estimate.sessions} session${estimate.sessions === 1 ? '' : 's'}`}
            </p>
            <p className={styles.nextMeta}>
              {estimate.sessions === 0
                ? estimate.label
                : `At about ${estimate.gainPerSession} points a focused session`}
            </p>
          </div>

          <div className={styles.nextCell}>
            <p className={styles.eyebrow}>Next step</p>
            <p className={styles.nextFigure}>Same station type</p>
            <p className={styles.nextMeta}>So the comparison means something</p>
          </div>
        </div>

        <Link className={styles.cta} to={`/practice/${trackId}`}>
          Book another {track.stream} session
          <Icon name="arrowRight" size="16px" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  )
}
