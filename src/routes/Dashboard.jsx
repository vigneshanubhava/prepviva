import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import { Icon } from '../components/ui/index.js'
import CreditNotice from '../components/CreditNotice.jsx'
import TrackSwitcher from '../components/TrackSwitcher.jsx'
import { DimBars, Heatmap, Sparkline } from '../components/TrackCharts.jsx'
import { useAccount } from '../data/AccountProvider.jsx'
import { usePrototype } from '../data/PrototypeProvider.jsx'
import {
  RUBRIC,
  TRACK,
  TRACK_IDS,
  creditLevel,
  daysToInterview,
  formatDuration,
  formatScore,
  globalTotals,
  lastSessionAgo,
  primaryTrack,
  resolveTrack,
  tierOf,
} from '../data/dashboard.js'
import { practicePlan } from '../data/practice.js'
import styles from './Dashboard.module.css'

/**
 * The dashboard — the screen the magic link signs you into.
 *
 * It has two jobs only: get the candidate into the next session, and show
 * progress. The behaviour is the reference prototype's
 * (`../interview-prototype/src/features/dashboard/Dashboard.jsx`) and is not
 * changed here. The surface is the mock this build was asked to match: a light
 * page, white cards with a soft edge, outlined glyph tiles and one filled brand
 * pill per card — the same tokens, type scale and radii as the rest of the app.
 *
 * Two rules the layout exists to keep:
 *   - **quality is per track.** The three tracks are marked against different
 *     rubrics on different scales, so everything under the track chips
 *     rescopes when they change and nothing is ever blended;
 *   - **a score off one data point is a lie.** `tier` decides how much of the
 *     view a track has earned — one session shows its result, not a readiness
 *     figure or a trend.
 */

export default function Dashboard() {
  const { account, summary } = useAccount()

  /* Which of the four candidate states to render. The prototype controls panel
     in the header switches it; `?state=cold` still seeds it on first load. */
  const { history: stateName, state: d } = usePrototype()

  const profile = account.profile
  const primary = primaryTrack(d, profile)

  /* null means "wherever the last session was". The selection self-heals if
     the state changes under it and the chosen track stops being visible. */
  const [selected, setSelected] = useState(null)
  const activeId = resolveTrack(d, selected, primary)

  const track = TRACK[activeId]
  const t = d.tracks[activeId]
  const rubric = RUBRIC[activeId]
  const tier = tierOf(t.sessions)
  const totals = globalTotals(d)
  const balance = summary.credits.remaining
  const level = creditLevel(balance)

  const isCold = totals.sessions === 0
  const isLapsed = stateName === 'lapsed'
  const idle = lastSessionAgo(t)
  const days = daysToInterview(d, profile)
  const firstName = account.name.split(' ')[0]

  const sorted = useMemo(() => [...t.dims].sort((a, b) => b.v - a.v), [t.dims])
  const weakest = sorted[sorted.length - 1]

  /* The card's sentence and the price on its button both come from the plan
     its button would start, so what it promises is what runs. A lapsed track
     is picked up rather than retargeted — "same setup" is the promise there. */
  const plan = useMemo(
    () =>
      practicePlan({
        trackId: activeId,
        dims: t.dims,
        profile,
        intent: isLapsed ? 'repeat' : 'target',
      }),
    [activeId, t.dims, profile, isLapsed],
  )

  return (
    <AppLayout>
      {/* The screen paints its own page tint across the whole content column —
          see .page in the stylesheet, which bleeds out through AppLayout's
          padding the way Billing's banner does. */}
      <div className={styles.page}>
        {/* A balance that is fine is not news — the notice says nothing until
            it changes what the candidate can do. Shared with /practice. */}
        <CreditNotice className={styles.notice} />

        {/* ------------------------------------------------------------ head */}
        <header className={styles.head} data-track={activeId}>
          <div className={styles.headMain}>
            <h1 className={styles.h1}>
              {isLapsed ? `Welcome back, ${firstName}` : `Good morning, ${firstName}`}
              <span className={styles.wave} aria-hidden="true"> 👋</span>
            </h1>

            <p className={styles.lede}>
              Your <span className={styles.ledeStrong}>{TRACK[primary].name}</span> interview is in{' '}
              <span className={styles.ledeStrong}>{days} days</span>. Everything on the cards below
              is scoped to the track you pick here; the four figures under them count every track.
            </p>

            {/* ---- track switcher — the one control that rescopes the screen */}
            {/* the one control that rescopes everything below it */}
            <TrackSwitcher
              className={styles.switcher}
              state={d}
              active={activeId}
              primary={primary}
              onChange={setSelected}
            />
          </div>

          <div className={styles.headActions}>
            <Link className={`${styles.headBtn} ${styles.headBtnPrimary}`} to="/practice">
              <Icon name="microphone" size="16px" strokeWidth={1.5} />
              Start a session
            </Link>
            <Link className={styles.headBtn} to="/performance">
              <Icon name="trendUp" size="16px" strokeWidth={1.5} />
              Performance
            </Link>
          </div>
        </header>

        {/* ---- COLD: one job, and no charts to draw it with ---------------- */}
        {isCold ? (
          <>
            <div className={styles.cards} data-track={primary}>
              <section className={`${styles.card} ${styles.cardWide} ${styles.cardAction}`}>
                <div className={styles.cardHead}>
                  <div>
                    <p className={styles.eyebrow}>First session</p>
                    <h2 className={styles.cardTitle}>Start your first interview</h2>
                  </div>
                  <span className={styles.cardTile} aria-hidden="true">
                    <Icon name="microphone" size="18px" strokeWidth={1.5} />
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardCopy}>
                    Pick a track, choose how long, and you will be in front of an examiner in about
                    two minutes. Guided mode gives you tips after each question and lets you retry —
                    a good place to begin.
                  </p>
                  <Link className={styles.cardCta} to="/practice">
                    Choose an interview
                    <Icon name="chevronRight" size="16px" strokeWidth={1.5} />
                  </Link>
                </div>
              </section>
            </div>

            {/* ---- the three things worth knowing before the first go ---- */}
            <div className={styles.reassure}>
              <section className={styles.tile}>
                <span className={styles.tileIcon} data-tone="brand" aria-hidden="true">
                  <Icon name="upload" size="18px" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className={styles.tileTitle}>
                    {profile.resume ? 'Your CV is in' : 'Add your CV when you are ready'}
                  </h2>
                  <p className={styles.tileBody}>
                    {profile.resume
                      ? 'Questions will reference your actual experience.'
                      : 'Without one the questions stay general — you can attach it from Settings.'}
                  </p>
                </div>
              </section>

              <section className={styles.tile}>
                <span className={styles.tileIcon} data-tone="success" aria-hidden="true">
                  <Icon name="lock" size="18px" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className={styles.tileTitle}>Nothing is graded</h2>
                  <p className={styles.tileBody}>Scores are for you. Nobody else sees them.</p>
                </div>
              </section>

              <section className={styles.tile}>
                <span className={styles.tileIcon} data-tone="warning" aria-hidden="true">
                  <Icon name="sparkle" size="18px" strokeWidth={1.5} />
                </span>
                <div>
                  <h2 className={styles.tileTitle}>{balance} credits ready</h2>
                  <p className={styles.tileBody}>
                    {summary.credits.remainingInPlainTerms} on your {summary.plan.name} plan.
                  </p>
                </div>
              </section>
            </div>
          </>
        ) : (
          <>
            {/* ---- the track-scoped row: action, result, consistency ------- */}
            <div className={styles.cards} data-track={activeId}>
              {tier === 'empty' ? (
                <section className={`${styles.card} ${styles.cardWide} ${styles.cardAction}`}>
                  <div className={styles.cardHead}>
                    <div>
                      <p className={styles.eyebrow}>Not started</p>
                      <h2 className={styles.cardTitle}>No {track.name} sessions yet</h2>
                    </div>
                    <span className={styles.cardTile} aria-hidden="true">
                      <Icon name={track.icon} size="18px" strokeWidth={1.5} />
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.cardCopy}>
                      This track is marked against its own rubric ({rubric.scaleShort}), so nothing
                      carries over from your other practice. Your first session sets the baseline.
                    </p>
                    <Link className={styles.cardCta} to={`/practice/${activeId}`}>
                      Start a {track.stream} session
                      <Icon name="chevronRight" size="16px" strokeWidth={1.5} />
                    </Link>
                  </div>
                </section>
              ) : (
                <>
                  {/* -- practise this next -- */}
                  <section
                    className={`${styles.card} ${styles.cardAction}`}
                    aria-labelledby="next-card"
                  >
                    <div className={styles.cardHead}>
                      <div>
                        <p className={styles.eyebrow}>
                          {isLapsed ? 'Pick up where you left off' : 'Practice next'}
                        </p>
                        <h2 className={styles.cardTitle} id="next-card">
                          {isLapsed ? track.name : weakest?.k}
                        </h2>
                      </div>
                      <span className={styles.cardTile} aria-hidden="true">
                        <Icon name="microphone" size="18px" strokeWidth={1.5} />
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.cardCopy}>
                        {isLapsed
                          ? `Your last ${track.stream} session scored ${formatScore(t.recent[0].s, rubric.scaleMax)}${rubric.unit}, ${idle} days ago. Same setup, ready when you are.`
                          : tier === 'single'
                            ? `Your lowest area in your first session, at ${formatScore(weakest.v, rubric.scaleMax)}${rubric.unit}. One session is not a pattern — a second will tell you whether it holds.`
                            : `Your lowest ${track.stream} area, at ${formatScore(weakest.v, rubric.scaleMax)}${rubric.unit}. ${plan.shapeLabel} would move it fastest.`}
                      </p>
                      {/* Straight into the configurator with this plan
                          applied — it is where the setup can still be
                          changed, not a form to fill in from scratch. */}
                      <Link
                        className={styles.cardCta}
                        to={`/practice/${activeId}`}
                        state={{ plan }}
                      >
                        Start &middot; {plan.cost} credits
                        <Icon name="chevronRight" size="16px" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </section>

                  {/* -- readiness, withheld until there is more than one point -- */}
                  <section className={styles.card} aria-labelledby="readiness-card">
                    {tier === 'single' ? (
                      <>
                        <div className={styles.cardHead}>
                          <div>
                            <p className={styles.eyebrow}>Your first result</p>
                            <h2 className={styles.cardTitle} id="readiness-card">
                              {t.recent[0].n}
                            </h2>
                          </div>
                          <span className={styles.cardTile} aria-hidden="true">
                            <Icon name="trendUp" size="18px" strokeWidth={1.5} />
                          </span>
                        </div>

                        <div className={styles.cardBody}>
                          <p className={styles.statRow}>
                            <span className={styles.stat}>
                              {formatScore(t.recent[0].s, rubric.scaleMax)}
                            </span>
                            <span className={styles.statUnit}>{rubric.unit || '/100'}</span>
                          </p>
                          <p className={styles.cardMeta}>
                            {t.recent[0].d} &middot; two more sessions to see a trend.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.cardHead}>
                          <div>
                            <p className={styles.eyebrow}>{track.stream} readiness</p>
                            <h2 className={styles.cardTitle} id="readiness-card">
                              {track.name}
                            </h2>
                          </div>
                          <span className={styles.cardTile} aria-hidden="true">
                            <Icon name="trendUp" size="18px" strokeWidth={1.5} />
                          </span>
                        </div>

                        <div className={styles.cardBody}>
                          <div className={styles.statSpark}>
                            <p className={styles.statRow}>
                              <span className={styles.stat}>{t.readiness}</span>
                              {t.delta != null ? (
                                <span className={styles.delta}>
                                  <Icon name="trendUp" size="14px" strokeWidth={1.5} />
                                  {t.delta}
                                </span>
                              ) : null}
                            </p>
                            <Sparkline
                              points={t.history}
                              label={`${track.name} readiness across ${t.history.length} sessions`}
                            />
                          </div>
                          <p className={styles.cardMeta}>
                            {tier === 'early'
                              ? `Across your ${t.sessions} ${track.stream} sessions — these shift a lot at first.`
                              : `${track.name} only, across your last ${t.history.length} sessions. Not a prediction of your result.`}
                          </p>
                        </div>
                      </>
                    )}
                  </section>

                  {/* -- consistency -- */}
                  <section className={styles.card} aria-labelledby="weeks-card">
                    <div className={styles.cardHead}>
                      <div>
                        <p className={styles.eyebrow}>Last 12 weeks</p>
                        <h2 className={styles.cardTitle} id="weeks-card">
                          {isLapsed
                            ? `Last session ${idle} days ago`
                            : `${t.sessions} ${track.stream} session${t.sessions === 1 ? '' : 's'}`}
                        </h2>
                      </div>
                      <span className={styles.cardTile} aria-hidden="true">
                        <Icon name="history" size="18px" strokeWidth={1.5} />
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <Heatmap
                        density={t.sessions}
                        seed={TRACK_IDS.indexOf(activeId)}
                        label={`${track.name} practice over the last 12 weeks`}
                      />
                      <p className={styles.cardMeta}>
                        This track only. No streak to keep — practise when it helps.
                      </p>
                    </div>
                  </section>
                </>
              )}
            </div>

            {/* ---- the global band. Deliberately outside the track scope --- */}
            <div className={styles.band}>
              <p className={styles.bandNote}>
                <span className={styles.eyebrow}>All tracks combined</span>
                <span className={styles.bandHint}>&middot; not affected by the track chips</span>
              </p>

              <div className={styles.bandRow}>
                <div className={styles.bandCell}>
                  <span className={styles.bandTile} data-tone="brand" aria-hidden="true">
                    <Icon name="graduationCap" size="18px" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className={styles.bandFigure}>{totals.sessions}</p>
                    <p className={styles.bandLabel}>
                      Sessions <span className={styles.bandSub}>completed</span>
                    </p>
                  </div>
                </div>

                <div className={styles.bandCell}>
                  <span className={styles.bandTile} data-tone="success" aria-hidden="true">
                    <Icon name="clock" size="18px" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className={styles.bandFigure}>{formatDuration(totals.minutes)}</p>
                    <p className={styles.bandLabel}>
                      Practised <span className={styles.bandSub}>total time</span>
                    </p>
                  </div>
                </div>

                <div className={styles.bandCell}>
                  <span className={styles.bandTile} data-tone="warning" aria-hidden="true">
                    <Icon name="sparkle" size="18px" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className={styles.bandFigure} data-low={level !== 'healthy' || undefined}>
                      {balance}
                    </p>
                    <p className={styles.bandLabel}>
                      Credits <span className={styles.bandSub}>remaining</span>
                    </p>
                  </div>
                </div>

                <div className={styles.bandCell}>
                  <span className={styles.bandTile} data-tone="info" aria-hidden="true">
                    <Icon name="calendar" size="18px" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className={styles.bandFigure}>{summary.chargeDateLabel}</p>
                    <p className={styles.bandLabel}>
                      {summary.canceled ? 'Access ends' : 'Renews'}{' '}
                      <span className={styles.bandSub}>
                        {summary.canceled ? 'nothing renews' : 'next top-up'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- scoped again: competencies and the sessions behind them - */}
            {tier !== 'empty' ? (
              <div className={styles.detail} data-track={activeId}>
                <section className={styles.panel} aria-labelledby="competency-panel">
                  <div className={styles.panelHead}>
                    <div>
                      <h2 className={styles.panelTitle} id="competency-panel">
                        {track.stream} competencies
                      </h2>
                      <p className={styles.panelSub}>{rubric.scaleLabel}</p>
                    </div>
                    <Link className={styles.panelLink} to="/performance">
                      Open performance
                      <Icon name="arrowRight" size="14px" strokeWidth={1.5} />
                    </Link>
                  </div>

                  <DimBars dims={t.dims} scaleMax={rubric.scaleMax} />

                  {t.sessions < 4 ? (
                    <p className={styles.panelNote}>
                      {t.sessions === 1
                        ? 'From a single session — one result is not a pattern.'
                        : `Based on ${t.sessions} sessions — these will shift a lot at first.`}
                    </p>
                  ) : null}
                </section>

                <section className={styles.panel} aria-labelledby="recent-panel">
                  <div className={styles.panelHead}>
                    <h2 className={styles.panelTitle} id="recent-panel">
                      Recent {track.stream} sessions
                    </h2>
                    <Link className={styles.panelLink} to="/sessions">
                      See all
                    </Link>
                  </div>

                  <ul className={styles.sessions}>
                    {t.recent.slice(0, 4).map((r, i) => (
                      <li key={`${r.n}-${r.ago}`} className={styles.session}>
                        {/* the per-track index is what the report needs to find
                            the attempt before this one */}
                        <Link
                          className={styles.sessionLink}
                          to={`/sessions/${activeId}/${i}`}
                          title="Open the full report"
                        >
                          <span className={styles.sessionTile} aria-hidden="true">
                            <Icon name="microphone" size="16px" strokeWidth={1.5} />
                          </span>
                          <span className={styles.sessionText}>
                            <span className={styles.sessionName}>{r.n}</span>
                            <span className={styles.sessionMeta}>
                              {r.d} &middot; {r.m} min
                            </span>
                          </span>
                          <span className={styles.sessionScore}>
                            {formatScore(r.s, rubric.scaleMax)}
                          </span>
                          <Icon name="chevronRight" size="14px" strokeWidth={1.5} />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {t.recent.length > 4 ? (
                    <p className={styles.panelNote}>
                      {t.recent.length - 4} older {track.stream} session
                      {t.recent.length - 4 === 1 ? '' : 's'} on the performance page.
                    </p>
                  ) : null}
                </section>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppLayout>
  )
}
