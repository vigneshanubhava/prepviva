import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import PageHero from '../components/PageHero.jsx'
import CreditNotice from '../components/CreditNotice.jsx'
import { Banner, Button, FileDrop, Icon } from '../components/ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { TRACK_IDS } from '../data/dashboard.js'
import { CV_MAX_MB, CV_TYPES } from '../data/onboarding.js'
import { costRange, isCircuit, trackConfig } from '../data/practice.js'
import styles from './Practice.module.css'

/**
 * Practice — where a session is chosen, before it is configured.
 *
 * Two jobs, in this order, both from the reference prototype
 * (`../interview-prototype/src/app/routes/PracticeRoute.jsx`):
 *
 *   1. **the CV gate.** Practice is unreachable without a CV: the questions are
 *      supposed to reference real experience, and without one they cannot. Setup
 *      lets the CV be skipped, so this is where the rule is actually enforced —
 *      and it explains why rather than just refusing.
 *   2. **the track picker.** One card per track, each naming its shape, because
 *      a panel and a circuit are configured differently from the very next
 *      screen.
 *
 * The credit wall sits above both: a candidate with no credits should learn it
 * before configuring a session they cannot start.
 */
/* The band names the screen, not the state it is in: a page title that renames
   itself mid-flow makes the nav item and the heading disagree. Both states show
   this one. */
const LEDE =
  'Set up a mock interview — pick a track, then the length, what the examiner leans on and how hard they push. Nothing starts until you confirm it.'

export default function Practice() {
  const navigate = useNavigate()
  const location = useLocation()
  const { account, attachCv } = useAccount()

  /* Set when a start was refused for want of a CV, so the gate leads with the
     reason rather than a generic prompt. */
  const blocked = location.state?.cvBlock ?? null

  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  function saveCv() {
    if (!file) {
      setError('Attach your CV to carry on.')
      return
    }
    attachCv(file)
    /* clear the bounce message so a later visit does not re-accuse them of
       something they have already fixed */
    navigate('/practice', { replace: true, state: null })
  }

  if (!account.profile.resume) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <PageHero icon="microphone" title="Practice" lede={LEDE} />

          {blocked ? (
            <Banner className={styles.blocked} tone="warning" title="That session could not start">
              {blocked}
            </Banner>
          ) : null}

          {/* The gate is a state of this screen, not a screen of its own, so it
              explains itself here rather than renaming the page above it. */}
          <section className={styles.gate} aria-labelledby="cv-gate">
            <div className={styles.gateHead}>
              <span className={styles.gateTile} aria-hidden="true">
                <Icon name="briefcase" size="20px" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className={styles.gateTitle} id="cv-gate">
                  Add your CV to start practising
                </h2>
                <p className={styles.gateBody}>
                  Your interviewer reads it before the session and asks about what is actually on
                  it — the posts you have held, the projects you ran, the gaps. Without it the
                  questions stay generic, which is the one thing a mock interview cannot afford to
                  be.
                </p>
              </div>
            </div>

            <FileDrop
              label="CV or résumé"
              hint={`${CV_TYPES.join(', ')} — up to ${CV_MAX_MB}MB`}
              accept={CV_TYPES}
              maxMB={CV_MAX_MB}
              file={file}
              error={error}
              onSelect={(meta) => {
                setFile(meta)
                setError(null)
              }}
              onReject={(message) => setError(`${message} Try exporting it as a PDF.`)}
            />

            <p className={styles.gateNote}>
              It stays on your account — you will not be asked for it again. You can replace or
              remove it in Settings.
            </p>

            <div className={styles.gateActions}>
              <Button onClick={saveCv}>Save and choose a session</Button>
              <Link className={styles.gateBack} to="/dashboard">
                Back to the dashboard
              </Link>
            </div>
          </section>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={styles.page}>
        <CreditNotice className={styles.notice} />

        <PageHero icon="microphone" title="Practice" lede={LEDE} />

        <div className={styles.tracks}>
          {TRACK_IDS.map((id) => {
            const config = trackConfig(id)
            const circuit = isCircuit(config)
            return (
              <Link
                key={id}
                className={styles.track}
                data-track={id}
                to={`/practice/${id}`}
                aria-label={`Configure a ${config.name} session`}
              >
                <span className={styles.trackTile} aria-hidden="true">
                  <Icon name={config.icon} size="20px" strokeWidth={1.5} />
                </span>

                <h2 className={styles.trackTitle}>{config.name}</h2>
                <p className={styles.trackBlurb}>{config.blurb}</p>

                <p className={styles.trackMeta}>
                  <span className={styles.trackShape}>{circuit ? 'Circuit' : 'Panel'}</span>
                  <span className={styles.trackCost}>{costRange(config)} credits</span>
                </p>

                <p className={styles.trackShapeNote}>
                  {circuit
                    ? 'A run of short stations, one after another. You pick which, and their order.'
                    : 'One conversation with a panel, weighted towards the areas you pick.'}
                </p>

                <span className={styles.trackGo}>
                  Configure
                  <Icon name="arrowRight" size="14px" strokeWidth={1.5} />
                </span>
              </Link>
            )
          })}
        </div>

        <p className={styles.foot}>
          <Icon name="info" size="14px" strokeWidth={1.5} />
          <span>
            Every session is scored against its own track's rubric, so nothing carries over
            between them. Your CV is read for all three.
          </span>
        </p>
      </div>
    </AppLayout>
  )
}
