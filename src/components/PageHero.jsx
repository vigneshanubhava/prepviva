import { Icon } from './ui/index.js'
import styles from './PageHero.module.css'

/**
 * The purple masthead — Billing's band (Figma `1:5133`), on every signed-in
 * screen that opens with a title.
 *
 * It moved here when Settings became the second screen to want it and
 * Performance, My Sessions and Practice the third, fourth and fifth: four
 * copies of one gradient would have been four chances for them to drift apart.
 *
 * **Billing still draws its own.** That one is 206px tall because three stat
 * cards overlap its bottom half, and it carries a menu; the height and the
 * overlap arithmetic belong to that screen. The two share `--app-hero-*` — the
 * colours and the inline padding — so a change to the band still lands on both.
 */
export default function PageHero({ icon, title, lede, actions, className = '' }) {
  return (
    <header className={`${styles.hero} ${className}`}>
      <div className={styles.top}>
        <div className={styles.titles}>
          {icon ? (
            <span className={styles.icon} aria-hidden="true">
              <Icon name={icon} size="18px" strokeWidth={1.5} />
            </span>
          ) : null}
          <h1 className={styles.h1}>{title}</h1>
        </div>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      {lede ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  )
}

/**
 * A control that sits on the band: Billing's outlined pill, in white on the
 * gradient. `on` is for a set of them acting as a choice — it fills rather than
 * changing colour, because a purple accent is invisible against purple.
 */
export function HeroAction({ icon, on = false, children, ...rest }) {
  return (
    <button type="button" className={styles.action} data-on={on || undefined} {...rest}>
      {icon ? <Icon name={icon} size="14px" strokeWidth={1.5} /> : null}
      {children}
    </button>
  )
}
