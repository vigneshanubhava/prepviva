import { Button, Icon } from '../components/ui/index.js'
import styles from './Settings.module.css'

/**
 * The pieces every settings section is built from. They live beside the
 * route rather than in `src/components/ui/` because they are a *layout* for
 * this screen — a panel with a glyph head, a labelled row with its control on
 * the right, the save bar and the draft it saves — not controls another screen
 * would reach for. The controls themselves are all the shared library's.
 */

/* ── layout ─────────────────────────────────────────────────────────────── */

export function SectionHead({ title, blurb, meta }) {
  return (
    <header className={styles.sectionHead}>
      <div className={styles.sectionHeadText}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {blurb ? <p className={styles.sectionBlurb}>{blurb}</p> : null}
      </div>
      {meta ? <div className={styles.sectionMeta}>{meta}</div> : null}
    </header>
  )
}

export function Panel({ icon, title, sub, actions, tone, footer, children }) {
  return (
    <section className={styles.panel} data-tone={tone || undefined}>
      <header className={styles.panelHead}>
        {icon ? (
          <span className={styles.panelTile} aria-hidden="true">
            <Icon name={icon} size="17px" strokeWidth={1.5} />
          </span>
        ) : null}

        <div className={styles.panelHeadText}>
          <h3 className={styles.panelTitle}>{title}</h3>
          {sub ? <p className={styles.panelSub}>{sub}</p> : null}
        </div>

        {actions ? <div className={styles.panelActions}>{actions}</div> : null}
      </header>

      <div className={styles.panelBody}>{children}</div>

      {footer ? <div className={styles.panelFoot}>{footer}</div> : null}
    </section>
  )
}

/** The hairline-separated list a panel's rows sit in. */
export function Rows({ children, className = '' }) {
  return <div className={`${styles.rows} ${className}`}>{children}</div>
}

/**
 * One setting: what it is on the left, the control on the right.
 *
 * `htmlFor` makes the title the control's own label — use it whenever the
 * control is a bare input or switch that would otherwise be announced as
 * nameless. `layout="stack"` drops the control under the text instead, for the
 * ones that need the full width (a chip group, a set of choice cards).
 */
export function Row({ title, hint, htmlFor, layout = 'split', tone, children }) {
  const Title = htmlFor ? 'label' : 'span'

  return (
    <div className={styles.row} data-layout={layout} data-tone={tone || undefined}>
      <div className={styles.rowText}>
        <Title className={styles.rowTitle} htmlFor={htmlFor}>
          {title}
        </Title>
        {hint ? <p className={styles.rowHint}>{hint}</p> : null}
      </div>

      {children ? <div className={styles.rowControl}>{children}</div> : null}
    </div>
  )
}

/**
 * The unsaved-changes bar, sticky to the bottom of the reading column.
 *
 * The container is always in the DOM so its `aria-live` region exists before
 * anything changes — a live region created at the same moment as its text is
 * not announced. Its contents are not, so nothing focusable sits behind an
 * invisible bar.
 */
export function SaveBar({ dirty, onSave, onDiscard, saveLabel = 'Save changes', note }) {
  return (
    <div className={styles.saveBar} data-open={dirty || undefined} aria-live="polite">
      {dirty ? (
        <div className={styles.saveBarInner}>
          <span className={styles.saveDot} aria-hidden="true" />
          <p className={styles.saveText}>{note || 'You have unsaved changes.'}</p>
          <div className={styles.saveActions}>
            <Button variant="ghost" size="sm" onClick={onDiscard}>
              Discard
            </Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              {saveLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** The line a panel uses to say what this prototype does not actually do. */
export function Disclosure({ children }) {
  return (
    <p className={styles.disclosure}>
      <Icon name="info" size="14px" strokeWidth={1.6} />
      <span>{children}</span>
    </p>
  )
}
