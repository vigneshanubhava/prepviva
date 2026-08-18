import styles from './Badge.module.css'

/**
 * tone:    neutral | brand | success | warning | danger | info | nhs | uni | pg
 * variant: subtle | solid | outline
 */
export default function Badge({
  tone = 'neutral',
  variant = 'subtle',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...rest
}) {
  return (
    <span
      className={[styles.badge, styles[variant], styles[tone], styles[size], className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
