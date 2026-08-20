import { useId } from 'react'
import Icon from './Icon.jsx'
import styles from './ChipGroup.module.css'

/**
 * Multi-select chips — a checkbox group drawn as pills, for a question whose
 * answers are short and unordered ("what worries you most?").
 *
 * Real checkboxes inside a fieldset, so the group name is announced with each
 * option and the whole thing works from the keyboard without help. The tick is
 * decorative; selection is carried by the input, not the glyph.
 *
 * options: string[] or [{ value, label }]
 * value:   the selected values, and onChange gets the whole next array
 */
export default function ChipGroup({
  legend,
  hint,
  options = [],
  value = [],
  onChange,
  error,
  disabled = false,
  name,
  className = '',
}) {
  const auto = useId()
  const errorId = error ? `${auto}-error` : undefined
  const hintId = hint ? `${auto}-hint` : undefined

  const items = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  )

  function toggle(entry) {
    const next = value.includes(entry)
      ? value.filter((item) => item !== entry)
      : [...value, entry]
    onChange?.(next)
  }

  return (
    <fieldset
      className={`${styles.set} ${disabled ? styles.disabled : ''} ${className}`}
      disabled={disabled}
      aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
    >
      {legend ? <legend className={styles.legend}>{legend}</legend> : null}
      {hint ? (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      ) : null}

      <div className={styles.chips}>
        {items.map((item) => {
          const on = value.includes(item.value)
          return (
            <label key={item.value} className={`${styles.chip} ${on ? styles.on : ''}`}>
              <input
                className={styles.native}
                type="checkbox"
                name={name}
                value={item.value}
                checked={on}
                disabled={disabled}
                onChange={() => toggle(item.value)}
              />
              {on ? <Icon name="check" size="14px" strokeWidth={2.5} /> : null}
              {item.label}
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
