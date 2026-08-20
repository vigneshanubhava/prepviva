import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import PageHero, { HeroAction } from '../components/PageHero.jsx'
import TrackSwitcher from '../components/TrackSwitcher.jsx'
import { DimBars, TrendChart } from '../components/TrackCharts.jsx'
import { Icon } from '../components/ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { usePrototype } from '../data/PrototypeProvider.jsx'
import {
  RUBRIC,
  TRACK,
  formatScore,
  primaryTrack,
  resolveTrack,
  tierOf,
  visibleTracks,
} from '../data/dashboard.js'
import styles from './Performance.module.css'

/**
 * Performance — the same switcher and the same scoping rule as the dashboard,
 * with room for the whole history rather than a summary of it.
 *
 * Ported from the reference prototype's `features/performance/Performance.jsx`,
 * including the part that is easy to drop and shouldn't be: **the compare view
 * carries a warning it cannot be used without.** Two tracks are marked on
 * different scales by different examiners against different competencies, so a
 * longer bar is not a better performance. The view exists to show the *shape*
 * of two profiles, never to rank them.
 */

/* One row per session, newest first, with the change against the one before
   it — the column the dashboard has no room for. */
function SessionTable({ trackId, track, rubric }) {
  const rows = track.recent

  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.numCol}>#</th>
            <th scope="col">Session</th>
            <th scope="col">When</th>
            <th scope="col">Length</th>
            <th scope="col" className={styles.right}>Score {rubric.scaleShort}</th>
            <th scope="col" className={styles.right}>Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const previous = rows[i + 1]
            const change = previous ? row.s - previous.s : null
            return (
              <tr key={`${row.n}-${row.ago}`}>
                <td className={styles.numCol}>{rows.length - i}</td>
                <td>
                  <Link className={styles.tableLink} to={`/sessions/${trackId}/${i}`}>
                    {row.n}
                  </Link>
                </td>
                <td className={styles.nowrap}>{row.d}</td>
                <td className={styles.nowrap}>{row.m} min</td>
                <td className={`${styles.right} ${styles.score}`}>
                  {formatScore(row.s, rubric.scaleMax)}
                </td>
                <td
                  className={`${styles.right} ${styles.change}`}
                  data-direction={change == null ? undefined : change > 0 ? 'up' : change < 0 ? 'down' : 'flat'}
                >
                  {change == null
                    ? '—'
                    : `${change > 0 ? '+' : ''}${formatScore(change, rubric.scaleMax)}`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className={styles.tableNote}>
        {rubric.scaleLabel}. Session 1 is your oldest on this track.
      </p>
    </div>
  )
}

/* One side of the compare view. Deliberately identical in structure to the
   other, so the eye reads the order of the bars rather than their length. */
function CompareColumn({ state, trackId }) {
  const meta = TRACK[trackId]
  const track = state.tracks[trackId]
  const rubric = RUBRIC[trackId]

  return (
    <section className={styles.compareCol} data-track={trackId}>
      <div className={styles.compareHead}>
        <span className={styles.compareTile} aria-hidden="true">
          <Icon name={meta.icon} size="18px" strokeWidth={1.5} />
        </span>
        <div>
          <h3 className={styles.compareTitle}>{meta.name}</h3>
          <p className={styles.compareScale}>{rubric.scaleLabel}</p>
        </div>
      </div>

      <p className={styles.compareStat}>
        <span className={styles.compareFigure}>{track.readiness ?? '—'}</span>
        <span className={styles.compareUnit}>
          readiness &middot; {track.sessions} session{track.sessions === 1 ? '' : 's'}
        </span>
      </p>

      <DimBars dims={track.dims} scaleMax={rubric.scaleMax} columns={1} />

      {track.sessions < 4 ? (
        <p className={styles.thin}>
          {track.sessions === 1
            ? 'From a single session — one result is not a pattern.'
            : `Based on ${track.sessions} sessions — these will shift a lot at first.`}
        </p>
      ) : null}
    </section>
  )
}

export default function Performance() {
  const { account } = useAccount()
  const { state } = usePrototype()

  const primary = primaryTrack(state, account.profile)
  const [selected, setSelected] = useState(null)
  const activeId = resolveTrack(state, selected, primary)

  const meta = TRACK[activeId]
  const track = state.tracks[activeId]
  const rubric = RUBRIC[activeId]
  const tier = tierOf(track.sessions)

  /* a track earns a place in the compare view by having been practised */
  const comparable = visibleTracks(state, primary).filter((id) => state.tracks[id].sessions > 0)
  const canCompare = comparable.length >= 2

  const [compare, setCompare] = useState(false)
  const [against, setAgainst] = useState(null)

  const aId = comparable.includes(activeId) ? activeId : comparable[0]
  const bId = comparable.includes(against) && against !== aId
    ? against
    : comparable.find((id) => id !== aId)
  /* Boolean(), not the bare chain: `&&` returns its last operand, so this was
     the *track id* whenever the compare view was on — which made
     `showCompare === view.value` false for both buttons at once, leaving the
     switch with nothing marked and `aria-pressed="false"` on the view actually
     being shown. */
  const showCompare = Boolean(compare && canCompare && aId && bId)

  const sorted = [...track.dims].sort((a, b) => b.v - a.v)

  return (
    <AppLayout>
      <div className={styles.page} data-track={activeId}>
        <PageHero
          icon="trendUp"
          title="Performance"
          lede="Each track is marked against its own rubric on its own scale. Nothing here is averaged across tracks."
          actions={
            /* The view switch rides the band rather than sitting under it: it
               scopes the whole screen, which is what the band names. */
            canCompare ? (
              <span className={styles.views} role="group" aria-label="View">
                {[
                  { value: false, label: 'Single track', icon: 'trendUp' },
                  { value: true, label: 'Compare two', icon: 'users' },
                ].map((view) => (
                  <HeroAction
                    key={String(view.value)}
                    icon={view.icon}
                    on={showCompare === view.value}
                    aria-pressed={showCompare === view.value}
                    onClick={() => setCompare(view.value)}
                  >
                    {view.label}
                  </HeroAction>
                ))}
              </span>
            ) : null
          }
        />

        {!showCompare ? (
          <TrackSwitcher
            className={styles.switcher}
            state={state}
            active={activeId}
            primary={primary}
            onChange={setSelected}
          />
        ) : null}

        {showCompare ? (
          <>
            {/* the label this view exists to carry */}
            <section className={styles.warning}>
              <span className={styles.warningTile} aria-hidden="true">
                <Icon name="alertTriangle" size="18px" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className={styles.warningTitle}>
                  These two scales are different. Do not read across.
                </h2>
                <p className={styles.warningBody}>
                  {TRACK[aId].name} is marked {RUBRIC[aId].scaleShort} and {TRACK[bId].name} is
                  marked {RUBRIC[bId].scaleShort}, against different competency axes set by
                  different examiners. A bar that looks longer is not a better performance. This
                  view is here to show the <strong>shape</strong> of each profile — where you are
                  strong and weak <em>within</em> a track — not to rank one against the other.
                </p>
              </div>
            </section>

            <div className={styles.againstRow}>
              <span className={styles.eyebrow}>Compare with</span>
              {comparable
                .filter((id) => id !== aId)
                .map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={styles.against}
                    data-track={id}
                    data-on={id === bId || undefined}
                    aria-pressed={id === bId}
                    onClick={() => setAgainst(id)}
                  >
                    {TRACK[id].name}
                  </button>
                ))}
            </div>

            <div className={styles.compare}>
              <CompareColumn state={state} trackId={aId} />
              <CompareColumn state={state} trackId={bId} />
            </div>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Reading this</h2>
              <p className={styles.panelBody}>
                Look at the order of the bars, not their length. If communication sits at the top of
                both columns and handling pressure sits at the bottom of both, that is a pattern
                worth acting on. If a competency is strong on one track and weak on the other, the
                rubrics are probably asking for different things — check what the weaker one
                actually rewards before changing anything.
              </p>
            </section>
          </>
        ) : tier === 'empty' ? (
          <section className={styles.panel}>
            <p className={styles.eyebrow}>Not started</p>
            <h2 className={styles.panelHeading}>No {meta.name} sessions yet</h2>
            <p className={styles.panelBody}>
              This track is marked against its own rubric ({rubric.scaleShort}), so nothing carries
              over from your other practice. Your first session sets the baseline.
            </p>
            <Link className={styles.cta} to={`/practice/${activeId}`}>
              Start a {meta.stream} session
              <Icon name="arrowRight" size="16px" strokeWidth={1.5} />
            </Link>
          </section>
        ) : (
          <>
            {/* readiness over time */}
            <section className={styles.panel}>
              <div className={styles.panelHead}>
                <div>
                  <p className={styles.eyebrow}>{meta.name} &middot; readiness over time</p>
                  <p className={styles.panelSub}>
                    A 0–100 readiness index, one point per session, derived from this track&rsquo;s
                    rubric only.
                  </p>
                </div>

                {tier !== 'single' ? (
                  <p className={styles.readiness}>
                    <span className={styles.readinessFigure}>{track.readiness}</span>
                    {track.delta != null ? (
                      <span className={styles.delta}>
                        <Icon name="trendUp" size="15px" strokeWidth={1.5} />
                        {track.delta}
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>

              {tier === 'single' ? (
                <div className={styles.single}>
                  <p className={styles.singleTitle}>
                    One session so far — {track.recent[0].n}, scored{' '}
                    {formatScore(track.recent[0].s, rubric.scaleMax)}
                    {rubric.unit} {track.recent[0].d.toLowerCase()}.
                  </p>
                  <p className={styles.singleBody}>Two more sessions to see a trend.</p>
                  <Link className={styles.cta} to={`/practice/${activeId}`}>
                    Book the next one
                    <Icon name="arrowRight" size="16px" strokeWidth={1.5} />
                  </Link>
                </div>
              ) : (
                <>
                  <TrendChart
                    points={track.history}
                    label={`${meta.name} readiness across ${track.history.length} sessions`}
                  />
                  {tier === 'early' ? (
                    <p className={styles.thin}>
                      Only {track.sessions} points — these will shift a lot at first.
                    </p>
                  ) : null}
                </>
              )}
            </section>

            <div className={styles.detail}>
              <section className={styles.panel}>
                <p className={styles.eyebrow}>Full competency breakdown</p>
                <p className={styles.panelSub}>{rubric.scaleLabel}</p>

                <div className={styles.bars}>
                  <DimBars dims={track.dims} scaleMax={rubric.scaleMax} columns={1} />
                </div>

                <div className={styles.ends}>
                  <div>
                    <p className={styles.eyebrow}>Strongest</p>
                    <p className={styles.endValue}>{sorted[0]?.k}</p>
                  </div>
                  <div>
                    <p className={styles.eyebrow}>Work on next</p>
                    <p className={styles.endValue}>{sorted[sorted.length - 1]?.k}</p>
                  </div>
                </div>

                {track.sessions < 4 ? (
                  <p className={styles.thin}>
                    {track.sessions === 1
                      ? 'From a single session — one result is not a pattern.'
                      : `Based on ${track.sessions} sessions — these will shift a lot at first.`}
                  </p>
                ) : null}
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHead}>
                  <p className={styles.eyebrow}>Session by session</p>
                  <p className={styles.panelCount}>{track.sessions} on this track</p>
                </div>

                <SessionTable trackId={activeId} track={track} rubric={rubric} />
              </section>
            </div>

            {!canCompare ? (
              <section className={styles.hint}>
                <p className={styles.eyebrow}>Compare tracks</p>
                <p className={styles.panelBody}>
                  Available once you have sessions on two tracks. It puts two profiles side by side
                  to show the shape of each — the scores themselves are not comparable.
                </p>
              </section>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  )
}
