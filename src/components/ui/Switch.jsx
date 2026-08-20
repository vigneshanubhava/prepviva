import { useId } from 'react'
import styles from './Switch.module.css'

/**
 * A two-state preference the user flips directly — the settings screen's
 * "interview reminders on / off". It is a real `<input type="checkbox">` with
 * `role="switch"`, so it is keyboard and screen-reader correct for free and the
 * painted track is only paint.
 *
 * Not a Checkbox with different styling on purpose: a checkbox *selects* a
 * value inside a form that is later submitted, a switch *applies* a setting.
 * Where a switch sits inside a form that still needs saving — the notification
 * list — the screen says so with its save bar rather than the control lying
 * about it.
 *
 * `label` is optional: rows that already carry their own heading pass
 * `aria-label` (or `aria-labelledby`) and render nothing here.
 */
export default function Switch({
  id,
  label,
  description,
  disabled = false,
  checked = false,
  onChange,
  size = 'md',
  forceState,
  className = '',
  ...rest
}) {
  const auto = useId()
  const inputId = id || auto
  const descId = description ? `${inputId}-desc` : undefined

  return (
    <span className={[styles.wrap, disabled ? styles.disabled : '', className].filter(Boolean).join(' ')}>
      <label className={[styles.control, styles[size]].filter(Boolean).join(' ')} htmlFor={inputId}>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className={styles.native}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          aria-describedby={descId}
          {...rest}
        />
        <span className={styles.track} data-force={forceState} aria-hidden="true">
          <span className={styles.knob} />
        </span>

        {label ? <span className={styles.label}>{label}</span> : null}
      </label>

      {description ? (
        <span className={styles.description} id={descId}>
          {description}
        </span>
      ) : null}
    </span>
  )
}
