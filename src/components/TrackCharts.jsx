import Icon from '../components/ui/Icon.jsx'
import { formatScore } from '../data/dashboard.js'
import styles from './TrackCharts.module.css'

/**
 * The track charts — shared by the dashboard, the performance page and the
 * report.
 *
 * Hand-drawn rather than pulled from a charting library: each shows a single
 * series with no axes to configure, and a dependency would cost more than it
 * saves. Ported from the reference prototype's `features/tracks/charts.jsx`.
 *
 * None of them takes a colour. They inherit `--dash-accent` from the section
 * they sit in, which the screen sets from the track on show — so a chart can
 * never pick a colour of its own, and both themes resolve without a prop.
 */

/** The readiness trend, at the size that fits beside a figure. */
export function Sparkline({ points, label }) {
  if (!points || points.length < 2) return null

  const w = 132
  const h = 34
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const y = (p) => h - ((p - min) / span) * (h - 6) - 3
  const path = points.map((p, i) => `${(i / (points.length - 1)) * w},${y(p)}`).join(' ')

  return (
    <svg
      className={styles.spark}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={label || `Readiness over the last ${points.length} sessions`}
    >
      <polyline
        points={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={y(points[points.length - 1])} r="3.5" fill="currentColor" />
    </svg>
  )
}

/**
 * Twelve weeks of practice, one column per week.
 *
 * The pattern is derived from the session count rather than from real dates —
 * the fixtures carry a count, not a diary — but it is deterministic, so a track
 * always draws the same map. `seed` keeps two tracks from drawing the same one.
 */
export function Heatmap({ weeks = 12, density, seed = 0, label }) {
  const level = (w, d) => {
    const s = (w * 7 + d + seed * 5) % 11
    const active =
      density > 0 &&
      s % (density > 8 ? 3 : 5) === 0 &&
      w > weeks - Math.min(weeks, Math.max(density, 2))
    if (!active) return 0
    return s % 3 === 0 ? 2 : 1
  }

  return (
    <div className={styles.heat} role="img" aria-label={label || 'Practice over the last 12 weeks'}>
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className={styles.heatWeek}>
          {Array.from({ length: 7 }).map((_, d) => (
            <span key={d} className={styles.heatCell} data-level={level(w, d)} />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Competency bars, normalised to whatever scale the track is marked on.
 *
 * Strongest first. The top two read as strengths and the bottom two as the
 * things to work on, which is the only judgement the bars make — everything
 * between them stays in the track's own accent. The row's glyph says the same
 * thing as its bar colour, for anyone the colour alone does not reach.
 */
const TONE_ICON = { strong: 'trendUp', mid: 'minus', weak: 'alertTriangle' }

export function DimBars({ dims, scaleMax, columns = 2 }) {
  const sorted = [...dims].sort((a, b) => b.v - a.v)

  return (
    <ul className={styles.bars} data-columns={columns}>
      {sorted.map((dim, i) => {
        const tone = i < 2 ? 'strong' : i >= sorted.length - 2 ? 'weak' : 'mid'
        return (
          <li key={dim.k} className={styles.bar}>
            <span className={styles.barTile} data-tone={tone} aria-hidden="true">
              <Icon name={TONE_ICON[tone]} size="14px" strokeWidth={1.5} />
            </span>
            <span className={styles.barLabel}>{dim.k}</span>
            <span className={styles.barTrack}>
              <span
                className={styles.barFill}
                data-tone={tone}
                style={{ inlineSize: `${(dim.v / scaleMax) * 100}%` }}
              />
            </span>
            <span className={styles.barScore}>{formatScore(dim.v, scaleMax)}</span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The readiness trend at full size, for the performance page: one point per
 * session, with the axis labelled so the numbers mean something. The dashboard
 * gets the same series as a Sparkline, which has no axis to read.
 */
export function TrendChart({ points, label }) {
  if (!points || points.length < 2) return null

  const W = 620
  const H = 190
  const padL = 34
  const padR = 12
  const padT = 14
  const padB = 26

  /* round the axis out to whole fives so the labels are readable numbers
     rather than whatever the data happened to reach */
  const lo = Math.max(0, Math.floor((Math.min(...points) - 6) / 5) * 5)
  const hi = Math.min(100, Math.ceil((Math.max(...points) + 6) / 5) * 5)
  const span = hi - lo || 1

  const x = (i) => padL + (i / (points.length - 1)) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - lo) / span) * (H - padT - padB)
  const line = points.map((p, i) => `${x(i)},${y(p)}`).join(' ')
  const area = `${padL},${y(lo)} ${line} ${W - padR},${y(lo)}`
  const ticks = [lo, lo + span / 2, hi]

  return (
    <svg
      className={styles.trend}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label || `Readiness across ${points.length} sessions`}
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line className={styles.grid} x1={padL} x2={W - padR} y1={y(tick)} y2={y(tick)} />
          <text className={styles.axis} x={padL - 8} y={y(tick) + 3.5} textAnchor="end">
            {Math.round(tick)}
          </text>
        </g>
      ))}

      <polygon className={styles.area} points={area} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <circle
          key={i}
          className={styles.point}
          data-last={i === points.length - 1 || undefined}
          cx={x(i)}
          cy={y(p)}
          r={i === points.length - 1 ? 4.5 : 2.75}
        />
      ))}

      {points.map((_, i) => (
        <text key={i} className={styles.axis} x={x(i)} y={H - 8} textAnchor="middle">
          {i + 1}
        </text>
      ))}
    </svg>
  )
}
