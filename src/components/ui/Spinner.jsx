import styles from './Spinner.module.css'
import VisuallyHidden from './VisuallyHidden.jsx'

/** Inherits colour from its parent via currentColor, so it works on any surface. */
export default function Spinner({ size = 'md', label = 'Loading', className = '', ...rest }) {
  return (
    <>
      <span
        className={`${styles.spinner} ${styles[size]} ${className}`}
        aria-hidden="true"
        {...rest}
      />
      {label ? <VisuallyHidden>{label}</VisuallyHidden> : null}
    </>
  )
}
