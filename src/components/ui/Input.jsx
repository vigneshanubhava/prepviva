import Field, { useField } from './Field.jsx'
import styles from './Input.module.css'

export default function Input({
  id,
  label,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  type = 'text',
  prefix,
  suffix,
  forceState,
  className = '',
  fieldClassName = '',
  ...rest
}) {
  const { fieldId, hintId, errorId, describedBy } = useField({ id, hint, error })

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
          readOnly ? styles.readOnly : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-force={forceState}
      >
        {prefix ? <span className={styles.affix}>{prefix}</span> : null}
        <input
          id={fieldId}
          type={type}
          className={styles.input}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {suffix ? <span className={styles.affix}>{suffix}</span> : null}
      </span>
    </Field>
  )
}
