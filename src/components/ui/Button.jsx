import Spinner from './Spinner.jsx'
import styles from './Button.module.css'

/**
 * variant: primary | secondary | ghost | danger
 * size:    sm | md | lg
 * forceState: kitchen-sink only — renders hover/active/focus/disabled statically.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  loadingLabel = 'Working',
  forceState,
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const tagProps =
    Tag === 'button'
      ? { type, disabled: isDisabled }
      : { role: 'button', 'aria-disabled': isDisabled || undefined }

  return (
    <Tag
      className={classes}
      data-force={forceState}
      aria-busy={loading || undefined}
      {...tagProps}
      {...rest}
    >
      {loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} label={loadingLabel} /> : iconLeft}
      <span className={styles.label}>{children}</span>
      {!loading && iconRight ? iconRight : null}
    </Tag>
  )
}
