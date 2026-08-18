import { useEffect, useId, useRef } from 'react'
import Icon from './Icon.jsx'
import styles from './Choice.module.css'

export default function Checkbox({
  id,
  label,
  description,
  error,
  indeterminate = false,
  disabled = false,
  forceState,
  className = '',
  ...rest
}) {
  const auto = useId()
  const inputId = id || auto
  const descId = description ? `${inputId}-desc` : undefined
  const errId = error ? `${inputId}-err` : undefined
  const ref = useRef(null)

  // indeterminate is a DOM property, not an attribute — it has to be set imperatively
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <span className={styles.text} style={{ minWidth: 0 }}>
      <label
        htmlFor={inputId}
        className={[
          styles.choice,
          styles.checkbox,
          disabled ? styles.disabled : '',
          error ? styles.errorState : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-force={forceState}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={styles.native}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        <span className={styles.box}>
          <span className={styles.mark}>
            <Icon name={indeterminate ? 'minus' : 'check'} size="0.875rem" />
          </span>
        </span>
        {label || description ? (
          <span className={styles.text}>
            {label ? <span className={styles.label}>{label}</span> : null}
            {description ? (
              <span className={styles.description} id={descId}>
                {description}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>
      {error ? (
        <span className={styles.groupError} id={errId} role="alert">
          <Icon name="alertCircle" />
          {error}
        </span>
      ) : null}
    </span>
  )
}
