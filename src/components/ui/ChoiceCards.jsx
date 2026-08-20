import { useId } from 'react'
import Icon from './Icon.jsx'
import styles from './ChoiceCards.module.css'

/**
 * Radios drawn as cards — for a choice that needs a glyph, a label and a line
 * of explanation each, where a list of dots would make the reader work.
 *
 * Native radios inside a fieldset: arrow-key navigation, the group name
 * announced with each option and the focus ring all come free. The tick is
 * decorative — selection is the input's.
 *
 * options: [{ value, label, detail, icon, accent }]
 *   accent picks the icon tile's colour: 'info' (default), 'brand', or one of
 *   the interview tracks, 'nhs' | 'uni' | 'pg', which the token layer already
 *   has a colour for.
 * layout: 'stack' (default) or 'row'
 */
export default function ChoiceCards({
  legend,
  caption,
  name,
  options = [],
  value,
  onChange,
  error,
  layout = 'stack',
  disabled = false,
  className = '',
}) {
  const auto = useId()
  const group = name || auto
  const errorId = error ? `${auto}-error` : undefined

  return (
    <fieldset
      className={`${styles.set} ${disabled ? styles.disabled : ''} ${className}`}
      disabled={disabled}
      aria-describedby={errorId}
    >
      {legend ? <legend className={styles.legend}>{legend}</legend> : null}
      {caption ? <p className={styles.caption}>{caption}</p> : null}

      <div className={`${styles.cards} ${layout === 'row' ? styles.row : ''}`}>
        {options.map((option) => {
          const on = value === option.value
          return (
            <label
              key={option.value}
              className={`${styles.card} ${on ? styles.on : ''}`}
              data-accent={option.accent || undefined}
            >
              <input
                className={styles.native}
                type="radio"
                name={group}
                value={option.value}
                checked={on}
                disabled={disabled}
                onChange={() => onChange?.(option.value)}
              />

              {option.icon ? (
                <span className={styles.icon} aria-hidden="true">
                  <Icon name={option.icon} size="20px" strokeWidth={1.75} />
                </span>
              ) : null}

              <span className={styles.text}>
                <span className={styles.label}>{option.label}</span>
                {option.detail ? <span className={styles.detail}>{option.detail}</span> : null}
              </span>

              {on ? (
                <Icon name="check" size="16px" strokeWidth={2.5} className={styles.tick} />
              ) : null}
            </label>
          )
        })}
      </div>

      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          <Icon name="alertCircle" size="16px" />
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
