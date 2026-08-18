import Logo from './Logo.jsx'
import banner from '../assets/signup/banner.png'
import styles from './AuthShell.module.css'

/**
 * The banner + card composition every out-of-app screen sits in: signup
 * outcomes (1:2167, 1:2230) and the login sequence (1:3169, 1:5516).
 *
 * The login artboards draw the banner as a flat purple gradient because the
 * artwork was not placed on them; artboard 11's own export shows the same
 * banner image as the signup flow, so all four screens share it.
 *
 * `cardClassName` is for a screen that needs to change the card itself rather
 * than its contents — first-run setup pins its height so the card does not
 * resize between steps.
 */
export default function AuthShell({ tone = 'welcome', gap = 'lg', cardClassName = '', children }) {
  return (
    <main className={`${styles.page} ${styles[tone]}`}>
      <div className={styles.layout}>
        <img className={styles.banner} src={banner} alt="" />

        <div className={`${styles.card} ${styles[`gap-${gap}`]} ${cardClassName}`}>
          <Logo className={styles.logo} />
          {children}
        </div>
      </div>
    </main>
  )
}
