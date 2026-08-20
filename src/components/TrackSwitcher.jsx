import { Icon } from './ui/index.js'
import { TRACK, TRACK_IDS, visibleTracks } from '../data/dashboard.js'
import styles from './TrackSwitcher.module.css'

/**
 * The one control that rescopes every quality figure on a screen, shared by the
 * dashboard and the performance page so it behaves identically in both.
 *
 * A track earns a place in it by having been used. The primary track is the one
 * exception: it shows at zero so there is somewhere to start — and the note
 * underneath says which tracks are missing and why, rather than leaving a
 * candidate to wonder where their third one went.
 */
export default function TrackSwitcher({ state, active, primary, onChange, className = '' }) {
  const visible = visibleTracks(state, primary)
  const hidden = TRACK_IDS.filter((id) => !visible.includes(id))

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={styles.switcher} role="group" aria-label="Practice track">
        {visible.map((id) => {
          const meta = TRACK[id]
          const sessions = state.tracks[id].sessions
          const on = id === active
          return (
            <button
              key={id}
              type="button"
              className={styles.chip}
              data-accent={meta.accent}
              data-on={on || undefined}
              aria-pressed={on}
              onClick={() => onChange(id)}
            >
              <Icon name={meta.icon} size="14px" strokeWidth={1.5} />
              <span className={styles.chipLabel}>{meta.name}</span>
              <span className={styles.chipCount}>{sessions === 0 ? 'new' : sessions}</span>
            </button>
          )
        })}
      </div>

      {hidden.length > 0 ? (
        <p className={styles.hiddenNote}>
          <Icon name="info" size="14px" strokeWidth={1.5} />
          <span>
            {hidden.map((id) => TRACK[id].name).join(' · ')}
            {hidden.length > 1 ? ' are' : ' is'} not shown — no sessions on
            {hidden.length > 1 ? ' those tracks' : ' that track'} yet.
          </span>
        </p>
      ) : null}
    </div>
  )
}
