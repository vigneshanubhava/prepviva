import { Link } from 'react-router-dom'
import { formatGBP } from '../data/plans.js'
import ellipseCard from '../assets/pricing/ellipse-card.svg'
import ellipseCardCore from '../assets/pricing/ellipse-card-core.svg'
import styles from './PlanCard.module.css'

/**
 * One plan card. Figma draws the same card on the public pricing page
 * (14:11391) and on Manage plan (1:9922, 1:11825, 1:11505, 1:14576), so it is
 * one component — an icon change on one surface cannot miss the other.
 *
 * The product sells one billing period — monthly — so the card states one
 * price. What differs between the two surfaces is only the badge and the call
 * to action, so both are passed in:
 *   badge  { label, tone: 'recommended' | 'current' }
 *   cta    { label, variant, to?, onClick?, disabled?, id? }
 *   footer  replaces the call to action outright — artboard 54 (1:14729) puts
 *           the scheduled-downgrade notice where the card's button sits.
 */

/* Figma gives the three cards three different CTA fills. */
const CTA_VARIANT = {
  starter: styles.ctaSecondary,
  'core-prep': styles.ctaPrimary,
  intensive: styles.ctaTertiary,
}

export default function PlanCard({ plan, badge, cta, note, footer, children }) {
  const featured = Boolean(plan.recommended)
  const price = plan.price.monthly

  const ctaClass = [
    styles.cta,
    cta?.variant === 'current' ? styles.ctaCurrent : CTA_VARIANT[plan.id],
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={[
        styles.card,
        featured ? styles.featured : '',
        plan.id === 'intensive' ? styles.emphasis : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={`plan-${plan.id}`}
    >
      <span className={styles.wash} aria-hidden="true" />
      <img
        className={styles.ellipse}
        src={featured ? ellipseCardCore : ellipseCard}
        alt=""
        width={featured ? 371 : 391}
        height={featured ? 365 : 383}
        aria-hidden="true"
      />

      {badge ? (
        <span className={`${styles.badge} ${badge.tone === 'current' ? styles.badgeCurrent : ''}`}>
          {badge.label}
        </span>
      ) : null}

      <div className={styles.content}>
        <PlanIcon icon={plan.icon} />

        {/* Focusable only programmatically: a screen that removes a control
            inside the card (Manage plan's Revert) parks focus on the heading
            when the card's own button cannot take it. */}
        <h2 className={styles.name} id={`plan-${plan.id}`} tabIndex={-1}>
          {plan.name}
        </h2>

        <p className={styles.priceRow}>
          <span className={styles.price}>{formatGBP(price)}</span>
          <span className={styles.period}>/monthly</span>
        </p>

        <p className={styles.includes}>Includes:</p>

        <ul className={styles.features}>
          {plan.features.map((feature) => (
            <li key={feature} className={styles.feature}>
              <Tick />
              {feature}
            </li>
          ))}
        </ul>

        {children}

        <div className={styles.ctaWrap}>
          {footer ? (
            footer
          ) : cta?.to ? (
            <Link className={ctaClass} to={cta.to} id={cta.id}>
              {cta.label}
            </Link>
          ) : (
            <button
              type="button"
              id={cta?.id}
              className={ctaClass}
              onClick={cta?.onClick}
              disabled={cta?.disabled}
              aria-current={cta?.variant === 'current' ? 'true' : undefined}
            >
              {cta?.label}
            </button>
          )}
          {note && !footer ? <p className={styles.ctaNote}>{note}</p> : null}
        </div>
      </div>
    </section>
  )
}

/**
 * Plan icons. Glyphs come from the project icon set (the same Untitled UI
 * family Figma drew from), inlined rather than linked so they stroke in
 * currentColor — the exported files bake in their own colour and would not
 * follow the theme.
 *
 * Figma's briefcase / users / office-block were the B2B template's; these read
 * as a practice product: practise aloud, sit a full panel, top tier. Keyed by
 * `plan.icon`, the same field the app-wide Icon set uses, so a plan cannot end
 * up with one glyph here and another in Billing.
 *
 * The wrapper keeps Figma's icon treatment exactly: a 34px box holding the
 * 32.381px ring and a 19.429px glyph.
 */
const GLYPHS = {
  // microphone-01 — practise speaking
  microphone:
    'M19 10V12C19 15.866 15.866 19 12 19M5 10V12C5 15.866 8.13401 19 12 19M12 19V22M8 22H16M12 15C10.3431 15 9 13.6569 9 12V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V12C15 13.6569 13.6569 15 12 15Z',
  // users-03 — a full interview panel
  users:
    'M18.0001 15.8369C19.456 16.5683 20.7042 17.742 21.6153 19.2096C21.7957 19.5003 21.886 19.6456 21.9172 19.8468C21.9805 20.2558 21.7009 20.7585 21.32 20.9204C21.1326 21 20.9218 21 20.5001 21M16.0001 11.5322C17.4818 10.7959 18.5001 9.26686 18.5001 7.5C18.5001 5.73314 17.4818 4.20411 16.0001 3.46776M14.0001 7.5C14.0001 9.98528 11.9854 12 9.50008 12C7.0148 12 5.00008 9.98528 5.00008 7.5C5.00008 5.01472 7.0148 3 9.50008 3C11.9854 3 14.0001 5.01472 14.0001 7.5ZM2.55931 18.9383C4.15362 16.5446 6.66945 15 9.50008 15C12.3307 15 14.8465 16.5446 16.4409 18.9383C16.7901 19.4628 16.9648 19.725 16.9446 20.0599C16.929 20.3207 16.758 20.64 16.5496 20.7976C16.282 21 15.9139 21 15.1777 21H3.82244C3.08625 21 2.71816 21 2.45052 20.7976C2.24213 20.64 2.07117 20.3207 2.05551 20.0599C2.03541 19.725 2.21004 19.4628 2.55931 18.9383Z',
  // trophy-01 — top tier, priority processing
  trophy:
    'M12 15C8.68629 15 6 12.3137 6 9V3.44444C6 3.0306 6 2.82367 6.06031 2.65798C6.16141 2.38021 6.38021 2.16141 6.65798 2.06031C6.82367 2 7.0306 2 7.44444 2H16.5556C16.9694 2 17.1763 2 17.342 2.06031C17.6198 2.16141 17.8386 2.38021 17.9397 2.65798C18 2.82367 18 3.0306 18 3.44444V9C18 12.3137 15.3137 15 12 15ZM12 15V18M18 4H20.5C20.9659 4 21.1989 4 21.3827 4.07612C21.6277 4.17761 21.8224 4.37229 21.9239 4.61732C22 4.80109 22 5.03406 22 5.5V6C22 6.92997 22 7.39496 21.8978 7.77646C21.6204 8.81173 20.8117 9.62038 19.7765 9.89778C19.395 10 18.93 10 18 10M6 4H3.5C3.03406 4 2.80109 4 2.61732 4.07612C2.37229 4.17761 2.17761 4.37229 2.07612 4.61732C2 4.80109 2 5.03406 2 5.5V6C2 6.92997 2 7.39496 2.10222 7.77646C2.37962 8.81173 3.18827 9.62038 4.22354 9.89778C4.60504 10 5.07003 10 6 10M7.44444 22H16.5556C16.801 22 17 21.801 17 21.5556C17 19.5919 15.4081 18 13.4444 18H10.5556C8.59188 18 7 19.5919 7 21.5556C7 21.801 7.19898 22 7.44444 22Z',
}

export function PlanIcon({ icon }) {
  return (
    <span className={styles.icon} aria-hidden="true">
      {/* Figma: 32.381px ring, 1.61905 stroke */}
      <svg className={`${styles.iconLeaf} ${styles.iconRing}`} viewBox="0 0 34 34" fill="none">
        <circle cx="17" cy="17" r="16.19" stroke="currentColor" strokeWidth="1.61905" />
      </svg>
      {/* Figma: 19.429px glyph */}
      <svg className={`${styles.iconLeaf} ${styles.iconGlyph}`} viewBox="0 0 24 24" fill="none">
        <path
          d={GLYPHS[icon]}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** The list tick — Figma's check, inlined for the same reason. */
export function Tick() {
  return (
    <svg className={styles.tick} viewBox="0 0 9 6.5" fill="none" aria-hidden="true">
      <path d="M8.5 0.5L3 6L0.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
