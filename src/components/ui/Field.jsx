import { useId } from 'react'
import Icon from './Icon.jsx'
import styles from './Field.module.css'

/**
 * Owns the label / hint / error wiring shared by Input, Select, Checkbox and Radio,
 * so the aria plumbing is written once rather than four times.
 */
export function useField({ id, hint, error }) {
  const auto = useId()
  const fieldId = id || auto
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  return {
    fieldId,
    hintId,
    errorId,
    describedBy: [hintId, errorId].filter(Boolean).join(' ') || undefined,
  }
}

export default function Field({
  fieldId,
  hintId,
  errorId,
  label,
  hint,
  error,
  required = false,
  optional = false,
  disabled = false,
  labelFor = true,
  as = 'div',
  className = '',
  children,
}) {
  const Tag = as
  const LabelTag = labelFor ? 'label' : 'span'

  return (
    <Tag className={`${styles.field} ${disabled ? styles.disabled : ''} ${className}`}>
      {label ? (
        <LabelTag className={styles.label} htmlFor={labelFor ? fieldId : undefined}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
          {optional && !required ? <span className={styles.optional}>(optional)</span> : null}
        </LabelTag>
      ) : null}

      {children}

      {hint ? (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      ) : null}

      {error ? (
        <span className={styles.error} id={errorId} role="alert">
          <Icon name="alertCircle" />
          {error}
        </span>
      ) : null}
    </Tag>
  )
}
