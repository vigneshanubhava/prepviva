import Icon from './Icon.jsx'
import styles from './Banner.module.css'

const toneIcon = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alertTriangle',
  danger: 'alertCircle',
  brand: 'info',
}

export default function Banner({
  tone = 'info',
  title,
  icon,
  actions,
  onDismiss,
  dismissLabel = 'Dismiss',
  className = '',
  children,
  ...rest
}) {
  return (
    <div
      className={`${styles.banner} ${styles[tone]} ${className}`}
      role={tone === 'danger' ? 'alert' : 'status'}
      {...rest}
    >
      <span className={styles.icon}>
        {icon || <Icon name={toneIcon[tone]} size="1.125rem" />}
      </span>

      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.body}>{children}</div> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      {onDismiss ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label={dismissLabel}>
          <Icon name="x" size="1rem" />
        </button>
      ) : null}
    </div>
  )
}
