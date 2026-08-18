import styles from './Skeleton.module.css'
import VisuallyHidden from './VisuallyHidden.jsx'

/**
 * variant: text | rect | circle
 * `lines` > 1 renders a stack with a shortened last line.
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  label = 'Loading',
  className = '',
  ...rest
}) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`${styles.lines} ${className}`} aria-busy="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className={`${styles.skeleton} ${styles.text}`} style={{ width, height }} />
        ))}
        <VisuallyHidden>{label}</VisuallyHidden>
      </div>
    )
  }

  const size = variant === 'circle' ? { width: width || height, height: height || width } : { width, height }

  return (
    <span
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={size}
      aria-busy="true"
      aria-label={label}
      role="status"
      {...rest}
    />
  )
}
