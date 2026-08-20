import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import PageHero from '../components/PageHero.jsx'
import { Icon } from '../components/ui/index.js'
import { usePrototype } from '../data/PrototypeProvider.jsx'
import { RUBRIC, TRACK, formatScore } from '../data/dashboard.js'
import { allSessions } from '../data/report.js'
import styles from './Sessions.module.css'

/**
 * My Sessions — every past session across every track, newest first, each one a
 * way into its report.
 *
 * Ported from the reference prototype's `features/sessions/SessionList.jsx`.
 * The per-track index travels in the link because that is how a report finds
 * the previous attempt to compare itself against; a flat list position would
 * point at the wrong one as soon as two tracks interleave.
 */
export default function Sessions() {
  const { state } = usePrototype()
  const rows = allSessions(state)

  return (
    <AppLayout>
      <div className={styles.page}>
        <PageHero
          icon="history"
          title="My sessions"
          lede={
            rows.length === 0
              ? 'No sessions yet — your first one will appear here, with its full report.'
              : `${rows.length} completed session${rows.length === 1 ? '' : 's'} across every track. Open any one for its full report.`
          }
        />

        {rows.length === 0 ? (
          <section className={styles.empty}>
            <span className={styles.emptyTile} aria-hidden="true">
              <Icon name="history" size="20px" strokeWidth={1.5} />
            </span>
            <h2 className={styles.emptyTitle}>Nothing to look back on yet</h2>
            <p className={styles.emptyBody}>
              Every session you finish is kept here with its scores, the questions you were asked
              and what to do differently.
            </p>
            <Link className={styles.emptyCta} to="/practice">
              Start your first session
              <Icon name="arrowRight" size="16px" strokeWidth={1.5} />
            </Link>
          </section>
        ) : (
          <ul className={styles.list}>
            {rows.map(({ trackId, session, index }) => {
              const meta = TRACK[trackId]
              const rubric = RUBRIC[trackId]
              return (
                <li key={`${trackId}-${index}`}>
                  <Link
                    className={styles.row}
                    data-track={trackId}
                    to={`/sessions/${trackId}/${index}`}
                    aria-label={`Report for ${session.n}, ${session.d}`}
                  >
                    <span className={styles.rowTile} aria-hidden="true">
                      <Icon name={meta.icon} size="18px" strokeWidth={1.5} />
                    </span>

                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>{session.n}</span>
                      <span className={styles.rowMeta}>
                        {session.d} &middot; {session.m} min &middot; {meta.name}
                      </span>
                    </span>

                    <span className={styles.rowScore}>
                      <span className={styles.rowFigure}>
                        {formatScore(session.s, rubric.scaleMax)}
                      </span>
                      <span className={styles.rowScale}>{rubric.scaleShort}</span>
                    </span>

                    <Icon name="chevronRight" size="16px" strokeWidth={1.5} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {rows.length > 0 ? (
          <p className={styles.foot}>
            <Icon name="info" size="14px" strokeWidth={1.5} />
            <span>
              Each track is marked against its own rubric on its own scale, so the scores in this
              list are not comparable across tracks.
            </span>
          </p>
        ) : null}
      </div>
    </AppLayout>
  )
}
