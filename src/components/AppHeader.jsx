import { Icon } from './ui/index.js'
import Logo from './Logo.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import PrototypeMenu from './PrototypeMenu.jsx'
import styles from './AppHeader.module.css'

/**
 * The fixed app header from Figma node 1:2121 — logo left, notifications /
 * help / avatar right. The avatar opens the profile menu (1:4997). Shared by
 * every signed-in screen, so the fixed-position and --app-header-h offset logic
 * is written once.
 *
 * Pages that use it must clear its height themselves; --app-header-h is the
 * measurement to offset by.
 *
 * `controls` hangs the prototype panel off the gear — on by default, and off on
 * the signup flow, where there is no account yet for it to force anything on.
 */
export default function AppHeader({ name, email, controls = true, className = '' }) {
  return (
    <header className={`${styles.header} ${className}`}>
      <Logo />
      <div className={styles.right}>
        {/* prototype only — see PrototypeMenu */}
        {controls ? <PrototypeMenu /> : null}
        <button type="button" className={styles.iconBtn} aria-label="Notifications">
          <Icon name="bell" size="1.25rem" strokeWidth={2} />
        </button>
        <button type="button" className={styles.iconBtn} aria-label="Help">
          <Icon name="helpCircle" size="1.25rem" strokeWidth={2} />
        </button>
        {/* the avatar opens the profile menu — Figma 1:4997 */}
        <ProfileMenu name={name} email={email} />
      </div>
    </header>
  )
}
