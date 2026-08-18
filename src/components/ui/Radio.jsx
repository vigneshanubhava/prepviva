import { useId } from 'react'
import Icon from './Icon.jsx'
import styles from './Choice.module.css'

export function Radio({
  id,
  name,
  label,
  description,
  disabled = false,
  error = false,
  forceState,
  className = '',
  ...rest
}) {
  const auto = useId()
  const inputId = id || auto
  const descId = description ? `${inputId}-desc` : undefined

  return (
    <label
      htmlFor={inputId}
      className={[
        styles.choice,
        styles.radio,
        disabled ? styles.disabled : '',
        error ? styles.errorState : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-force={forceState}
    >
      <input
        id={inputId}
        name={name}
        type="radio"
        className={styles.native}
        disabled={disabled}
        aria-describedby={descId}
        {...rest}
      />
      <span className={styles.box}>
        <span className={styles.mark}>
          <span className={styles.dot} />
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
  )
}

/**
 * A real <fieldset>/<legend>, so the group name is announced with each option.
 * Arrow-key navigation between radios is native browser behaviour.
 */
export function RadioGroup({
  legend,
  hint,
  error,
  name,
  value,
  onChange,
  options = [],
  direction = 'column',
  disabled = false,
  className = '',
  children,
}) {
  const auto = useId()
  const groupName = name || auto
  const hintId = hint ? `${groupName}-hint` : undefined
  const errId = error ? `${groupName}-err` : undefined
  // Only drive `checked` when a value is supplied — otherwise the group stays
  // uncontrolled, rather than becoming a permanently-unchecked controlled input.
  const controlled = value !== undefined

  return (
    <fieldset
      className={`${styles.group} ${direction === 'row' ? styles.groupRow : ''} ${className}`}
      aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      {legend ? <legend className={styles.legend}>{legend}</legend> : null}
      {hint ? (
        <span className={styles.groupHint} id={hintId}>
          {hint}
        </span>
      ) : null}

      {options.map((opt) => (
        <Radio
          key={opt.value}
          name={groupName}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          disabled={opt.disabled}
          error={Boolean(error)}
          checked={controlled ? value === opt.value : undefined}
          defaultChecked={controlled ? undefined : opt.defaultChecked}
          onChange={onChange}
        />
      ))}
      {children}

      {error ? (
        <span className={styles.groupError} id={errId} role="alert">
          <Icon name="alertCircle" />
          {error}
        </span>
      ) : null}
    </fieldset>
  )
}

export default Radio
