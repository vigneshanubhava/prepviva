import Logo from './Logo.jsx'
import styles from './EmailCard.module.css'

/**
 * The PrepViva email itself — the branded 640px card inside the mail client.
 * Figma draws the same card on 14:10469 (the magic link) and 14:10022 (the
 * subscription-cancelled confirmation): logo, gradient hero, centred heading,
 * body column, footer.
 *
 * Both artboards fill the hero with the template product's isometric artwork
 * and an `aidnn` logo. A low-opacity arc motif and the PrepViva wordmark stand
 * in for it rather than shipping someone else's illustration.
 *
 * Both footers describe an AI analytics platform for finance teams at a Palo
 * Alto address. The first note says what this product actually is; the second
 * is the route's own line about why the message was sent, which is the useful
 * thing to put there.
 */
export default function EmailCard({
  heroLine,
  heading,
  tone = 'blue',   // blue (14:10469) | brand (14:10022)
  greeting,
  footerReason,
  children,
}) {
  return (
    <article className={styles.email}>
      <div className={styles.emailLogo}>
        <Logo />
      </div>

      <div className={`${styles.hero} ${tone === 'brand' ? styles.heroBrand : ''}`}>
        <svg
          className={styles.heroArt}
          viewBox="0 0 608 280"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="430" cy="118" r="150" />
          <circle cx="430" cy="118" r="110" />
          <circle cx="430" cy="118" r="70" />
          <path d="M120 280C220 200 320 240 430 118" />
          <path d="M60 250C180 190 300 220 430 118" />
        </svg>

        <p className={styles.heroLine}>{heroLine}</p>
        <span className={styles.heroMark}>PrepViva</span>
      </div>

      <div className={styles.copy}>
        <h2 className={styles.emailHeading}>{heading}</h2>

        <div className={styles.copyBody}>
          {greeting ? <p className={styles.hi}>{greeting}</p> : null}
          {children}
        </div>
      </div>

      <div className={styles.emailFooter}>
        <p className={styles.footerNote}>
          PrepViva is AI mock-interview practice for UK medical candidates — NHS, university and
          postgraduate interviews, with scored feedback on what to fix before the real panel.
        </p>
        <p className={styles.footerNote}>
          <span className={styles.footerStrong}>PrepViva</span>
          <br />
          {footerReason}
        </p>
      </div>
    </article>
  )
}

/** The bold half of the hero's two-line lockup. */
export function EmailHeroStrong({ children }) {
  return <span className={styles.heroStrong}>{children}</span>
}
