import { NavLink } from 'react-router-dom'
import { Icon } from './ui/index.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { NAV_ITEMS as ITEMS } from '../data/nav.js'
import styles from './AppNav.module.css'

/**
 * The left navigation from Figma 1:5133.
 *
 * The artboard carries the Admin variant — Dashboard, Connectors, Billing and
 * Invoice, People, Settings, under an "Admin" header chip. doc/BRIEF.md deletes
 * that variant outright: there is one nav set, and Connectors and People belong
 * to a team product this one is not. The six that are it live in data/nav.js,
 * which the "not built yet" placeholder reads too.
 */

export default function AppNav({ collapsed = false, onToggle }) {
  // The live account, not the module default — a plan change moves the
  // allowance, and the nav sits on the screen the change was made on.
  const { summary } = useAccount()
  const { credits, daysLeft, trialing } = summary

  return (
    <nav
      className={`${styles.nav} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Main"
      data-collapsed={collapsed || undefined}
    >
      <ul className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
              /* the label is display:none when the nav is collapsed — by the
                 toggle or by the 900px media query — and a link with no
                 accessible name is a link nobody can ask for */
              aria-label={item.label}
            >
              <span className={styles.icon}>
                <Icon name={item.icon} size="16px" strokeWidth={1.5} />
              </span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Figma's panel reads "Credits used / 0k of 500k / 15 days left in your
          trial". The plan is 3 trial credits over 14 days, and credits are
          always stated twice — the number and what it buys. */}
      <div className={styles.credits}>
        <span className={styles.creditsTile} aria-hidden="true">
          <Icon name="sparkle" size="16px" strokeWidth={1.5} />
        </span>

        <p className={styles.creditsTitle}>Credits left</p>

        <p className={styles.creditsFigure}>
          <span className={styles.creditsCount}>{credits.remaining}</span>
          <span className={styles.creditsOf}>of {credits.allowance}</span>
        </p>

        {/* headed "Credits left", so it measures what is left — the billing
            card's bar is headed "used" and measures the other way */}
        <span
          className={styles.track}
          role="progressbar"
          aria-valuenow={credits.remaining}
          aria-valuemin={0}
          aria-valuemax={credits.allowance}
          aria-label={`${credits.remaining} of ${credits.allowance} credits left`}
        >
          <span className={styles.fill} style={{ inlineSize: `${100 - credits.percentUsed}%` }} />
        </span>

        <p className={styles.creditsTerms}>&asymp; {credits.remainingInPlainTerms}</p>

        {trialing ? (
          <p className={styles.trialNote}>
            <span className={styles.trialDays}>{daysLeft}</span> days left in your trial.
          </p>
        ) : null}

        <NavLink className={styles.upgrade} to="/billing/manage-plan">
          Upgrade
        </NavLink>
      </div>

      <button
        type="button"
        className={styles.toggle}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        aria-expanded={!collapsed}
      >
        <span className={styles.toggleIcon}>
          <Icon name="arrowCircleLeft" size="16px" strokeWidth={1.5} />
        </span>
      </button>
    </nav>
  )
}
