import { Link, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { Icon } from '../components/ui/index.js'
import { usePrototype } from '../data/PrototypeProvider.jsx'
import { TRACK_IDS } from '../data/dashboard.js'
import { buildReport } from '../data/report.js'
import {
  ZoneAnswerLab,
  ZoneCoaching,
  ZoneHeadline,
  ZonePathForward,
  ZoneScorecard,
  ZoneVerdict,
} from './ReportZones.jsx'
import styles from './Report.module.css'

/**
 * One session's report — `/sessions/:trackId/:index`.
 *
 * Addressed by track and position rather than held in state by whichever screen
 * opened it: the fixtures are static, so the URL is enough to rebuild the whole
 * report, and a link to one survives a reload.
 *
 * **One view, all six zones, always, in reading order.** The reference
 * prototype tried a Full report / Section-wise toggle and removed it: splitting
 * a report across tabs means a reader can finish it having never seen the
 * answer lab or the action plan. The links below the header jump to a zone;
 * they never hide one.
 */

const JUMPS = [
  { id: 'verdict', label: 'Verdict' },
  { id: 'headline', label: 'Headline' },
  { id: 'scorecard', label: 'Scorecard' },
  { id: 'answers', label: 'Answer lab' },
  { id: 'coaching', label: 'Coaching' },
  { id: 'next', label: 'Path forward' },
]

export default function Report() {
  const { trackId, index } = useParams()
  const { state } = usePrototype()

  const track = TRACK_IDS.includes(trackId) ? state.tracks[trackId] : null
  const i = Number(index)
  const session = Number.isInteger(i) ? track?.recent?.[i] : null

  /* A URL can outlive the thing it points at — switching practice history in
     the prototype panel alone can delete a session out from under a link. */
  if (!session) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <section className={styles.missing}>
            <span className={styles.missingTile} aria-hidden="true">
              <Icon name="alertCircle" size="20px" strokeWidth={1.5} />
            </span>
            <h1 className={styles.missingTitle}>That report is not here</h1>
            <p className={styles.missingBody}>
              The session may belong to a different practice history than the one currently
              selected in the prototype controls.
            </p>
            <Link className={styles.missingCta} to="/sessions">
              Back to my sessions
              <Icon name="arrowRight" size="16px" strokeWidth={1.5} />
            </Link>
          </section>
        </div>
      </AppLayout>
    )
  }

  const report = buildReport({ trackId, session, index: i, track })

  return (
    <AppLayout>
      <div className={styles.page} data-track={trackId}>
        <header className={styles.head}>
          <div className={styles.headMain}>
            <Link className={styles.back} to="/sessions" aria-label="Back to my sessions">
              <Icon name="arrowLeft" size="16px" strokeWidth={1.5} />
            </Link>

            <div>
              <p className={styles.crumb}>
                <span>{report.track.name}</span>
                <span aria-hidden="true">·</span>
                <span>{report.meta.relative}</span>
                <span aria-hidden="true">·</span>
                <span className={styles.code}>{report.code}</span>
              </p>
              <h1 className={styles.h1}>{report.sessionName}</h1>
            </div>
          </div>

          <div className={styles.headActions}>
            <span className={styles.status}>
              <Icon name="checkCircle" size="14px" strokeWidth={2} />
              Complete
            </span>
            {/* Real, and the only export this prototype can honestly offer:
                the browser's own print-to-PDF. */}
            <button type="button" className={styles.print} onClick={() => window.print()}>
              <Icon name="download" size="16px" strokeWidth={1.5} />
              Print or save as PDF
            </button>
          </div>
        </header>

        <nav className={styles.jumps} aria-label="Report sections">
          {JUMPS.map((jump) => (
            <a key={jump.id} className={styles.jump} href={`#${jump.id}`}>
              {jump.label}
            </a>
          ))}
        </nav>

        <ZoneVerdict report={report} />
        <ZoneHeadline report={report} />
        <ZoneScorecard report={report} />
        <ZoneAnswerLab report={report} />
        <ZoneCoaching report={report} />
        <ZonePathForward report={report} />

        <p className={styles.foot}>
          <Icon name="info" size="14px" strokeWidth={1.5} />
          <span>
            Scores, dates, the readiness call and the competency breakdown come from this session
            and this track. Everything tagged &ldquo;sample content&rdquo; is placeholder copy
            standing in for analysis the backend does not produce yet.
          </span>
        </p>
      </div>
    </AppLayout>
  )
}
