import HelpMenu from './HelpMenu.jsx'
import Logo from './Logo.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import PrototypeMenu from './PrototypeMenu.jsx'
import styles from './AppHeader.module.css'

/**
 * The fixed app header from Figma node 1:2121 — logo left, notifications /
 * help / avatar right. All three open a panel: the bell and the question mark
 * (both `usePopover`) and the avatar (the profile menu, 1:4997). Shared by
 * every signed-in screen, so the fixed-position and --app-header-h offset logic
 * is written once.
 *
 * Pages that use it must clear its height themselves; --app-header-h is the
 * measurement to offset by.
 *
 * `controls` hangs the prototype panel off the gear — on by default, and off on
 * the signup flow, where there is no account yet for it to force anything on.
 *
 * `signedIn` does the same for the bell and the question mark. Both speak about
 * an account — a locked practice screen, a credit balance, where to change your
 * track — and checkout is the one screen that carries this header before there
 * is one. They are hidden rather than emptied: an empty bell on the way in
 * would still be claiming there is something to have notifications about.
 */
export default function AppHeader({
  name,
  email,
  controls = true,
  signedIn = true,
  className = '',
}) {
  return (
    <header className={`${styles.header} ${className}`}>
      <Logo />
      <div className={styles.right}>
        {/* prototype only — see PrototypeMenu */}
        {controls ? <PrototypeMenu /> : null}
        {/* both derive what they show from live state — see NotificationsMenu */}
        {signedIn ? (
          <>
            <NotificationsMenu />
            <HelpMenu />
          </>
        ) : null}
        {/* the avatar opens the profile menu — Figma 1:4997 */}
        <ProfileMenu name={name} email={email} />
      </div>
    </header>
  )
}
