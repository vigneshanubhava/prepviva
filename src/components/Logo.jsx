import logoMark from '../assets/signup/logo-mark.png'
import styles from './Logo.module.css'

/**
 * The PrepViva lockup: mark + wordmark. Figma draws it at 15×18 with the
 * wordmark at 15px / -0.45px on every screen that carries it, so it lives here
 * rather than being re-declared per screen.
 */
export default function Logo({ className = '' }) {
  return (
    <span className={`${styles.logo} ${className}`}>
      <img className={styles.mark} src={logoMark} alt="" />
      <span className={styles.text}>PrepViva</span>
    </span>
  )
}
