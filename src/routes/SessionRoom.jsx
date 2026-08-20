import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { Icon } from '../components/ui/index.js'
import { trackConfig } from '../data/practice.js'
import styles from './SessionRoom.module.css'

/**
 * Where Start lands — `/practice/:trackId/room`.
 *
 * The interview room itself is not built: there is no model behind this
 * prototype to ask the questions and no recording to make. That was previously
 * handled by bouncing back to the dashboard with a toast, which read as the
 * flow failing rather than ending. This is the same admission with somewhere to
 * stand: it says plainly that the room is where the session *will* run, and it
 * repeats the configuration that was just paid for, so nothing about the
 * session is lost at the one point the prototype cannot continue.
 *
 * The credits are already spent by the time this renders — the configurator
 * spends them on Start, so the balance in the nav has moved. Saying so here is
 * the honest version of a screen that otherwise looks like nothing happened.
 */
export default function SessionRoom() {
  const { trackId } = useParams()
  const { state } = useLocation()
  const config = trackConfig(trackId)

  // reached by URL rather than by finishing the configurator
  if (!config) return <Navigate to="/practice" replace />
  if (!state?.summary) return <Navigate to={`/practice/${trackId}`} replace />

  const { summary, cost, left } = state

  return (
    <AppLayout>
      <div className={styles.page} data-track={config.id}>
        <header className={styles.head}>
          <p className={styles.crumb}>
            <span>{config.label}</span>
            <span aria-hidden="true">›</span>
            <span className={styles.crumbTrack}>{config.stream}</span>
          </p>
          <h1 className={styles.h1}>Your mock interview</h1>
        </header>

        {/* The room, as a held frame rather than a broken one. */}
        <section className={styles.stage} aria-labelledby="room-heading">
          <span className={styles.stageTile} aria-hidden="true">
            <Icon name="microphone" size="26px" strokeWidth={1.5} />
          </span>

          <h2 className={styles.stageTitle} id="room-heading">
            Your mock interview screen will appear here
          </h2>

          <p className={styles.stageBody}>
            This is the room: your examiner on camera, the question you are being asked, and the
            timer running against the length you chose. It is the one part of PrepViva this
            prototype does not build — there is no interviewer behind it to ask the questions and
            nothing to record.
          </p>

          <p className={styles.stageMeta}>
            Everything up to this point is real: the session is configured, priced and paid for.
          </p>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>What you booked</h2>

          <dl className={styles.summary}>
            {summary.map((row) => (
              <div key={row.k} className={styles.row}>
                <dt className={styles.key}>{row.k}</dt>
                <dd className={styles.value}>{row.v}</dd>
              </div>
            ))}
            <div className={styles.row}>
              <dt className={styles.key}>Credits</dt>
              <dd className={styles.value}>
                {cost} used &middot; {left} left in your balance
              </dd>
            </div>
          </dl>
        </section>

        <div className={styles.actions}>
          <Link className={styles.primary} to="/dashboard">
            Back to the dashboard
            <Icon name="arrowRight" size="16px" strokeWidth={1.5} />
          </Link>
          <Link className={styles.secondary} to="/sessions">
            See past sessions and their reports
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
