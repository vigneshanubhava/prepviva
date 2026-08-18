import Field, { useField } from './Field.jsx'
import Icon from './Icon.jsx'
import styles from './Select.module.css'

/**
 * Wraps the native <select> rather than reimplementing a listbox: it is keyboard
 * and screen-reader correct for free, and matches the token layer via the wrapper.
 * options: [{ value, label, disabled }]
 */
export default function Select({
  id,
  label,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  size = 'md',
  options = [],
  placeholder,
  value,
  forceState,
  className = '',
  fieldClassName = '',
  children,
  ...rest
}) {
  const { fieldId, hintId, errorId, describedBy } = useField({ id, hint, error })
  const showingPlaceholder = placeholder != null && (value === '' || value == null)

  return (
    <Field
      fieldId={fieldId}
      hintId={hintId}
      errorId={errorId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      disabled={disabled}
      className={fieldClassName}
    >
      <span
        className={[
          styles.wrap,
          styles[size],
          error ? styles.error : '',
          disabled ? styles.disabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-force={forceState}
      >
        <select
          id={fieldId}
          className={`${styles.select} ${showingPlaceholder ? styles.placeholder : ''}`}
          disabled={disabled}
          required={required}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {placeholder != null ? (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <span className={styles.chevron}>
          <Icon name="chevronDown" />
        </span>
      </span>
    </Field>
  )
}
