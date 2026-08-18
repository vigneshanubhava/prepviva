import Icon from './Icon.jsx'
import styles from './EmptyState.module.css'

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  primaryAction,
  secondaryAction,
  compact = false,
  className = '',
  children,
}) {
  return (
    <div className={`${styles.empty} ${compact ? styles.compact : ''} ${className}`}>
      {icon ? (
        <span className={styles.icon}>
          {typeof icon === 'string' ? <Icon name={icon} size="1.25rem" /> : icon}
        </span>
      ) : null}
      {title ? <p className={styles.title}>{title}</p> : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      {children}
      {primaryAction || secondaryAction ? (
        <div className={styles.actions}>
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
