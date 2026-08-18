import styles from './Card.module.css'

const padMap = { none: 'padNone', sm: 'padSm', md: 'padMd', lg: 'padLg' }
const elevMap = { flat: 'flat', sm: 'elevSm', md: 'elevMd', lg: 'elevLg' }

export default function Card({
  padding = 'md',
  elevation = 'sm',
  interactive = false,
  selected = false,
  title,
  subtitle,
  headerAction,
  footer,
  forceState,
  as,
  className = '',
  children,
  ...rest
}) {
  const Tag = as || (interactive ? 'button' : 'div')
  const isButton = Tag === 'button'

  return (
    <Tag
      className={[
        styles.card,
        styles[padMap[padding]],
        styles[elevMap[elevation]],
        interactive ? styles.interactive : '',
        selected ? styles.selected : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-force={forceState}
      type={isButton ? 'button' : undefined}
      aria-pressed={isButton && selected ? true : undefined}
      {...rest}
    >
      {title || headerAction ? (
        <div className={styles.header}>
          <div>
            {title ? <h3 className={styles.title}>{title}</h3> : null}
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
          {headerAction}
        </div>
      ) : null}

      <div className={styles.body}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </Tag>
  )
}
