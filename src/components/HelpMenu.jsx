import { useNavigate } from 'react-router-dom'
import { Icon } from './ui/index.js'
import { usePopover } from './usePopover.js'
import { HELP_ACTIONS, HELP_NOTE, HELP_TOPICS } from '../data/help.js'
import styles from './HelpMenu.module.css'

/**
 * The question mark in the app header.
 *
 * It answers the four questions this product actually raises rather than
 * offering a search box over a help centre that does not exist, and every
 * destination in it is a screen that is built. The note at the bottom says
 * plainly that there is no support channel behind it — a "Contact us" row that
 * went nowhere would be the one dishonest thing in the panel.
 */
export default function HelpMenu() {
  const navigate = useNavigate()
  const { open, setOpen, wrapRef, triggerRef, panelRef } = usePopover()

  function go(to) {
    setOpen(false)
    navigate(to)
  }

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-label="Help"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="helpCircle" size="1.25rem" strokeWidth={2} />
      </button>

      {open ? (
        <div className={styles.panel} ref={panelRef} role="dialog" aria-label="Help">
          <header className={styles.head}>
            <p className={styles.title}>Help</p>
            <p className={styles.sub}>The four things people ask first.</p>
          </header>

          <ul className={styles.list}>
            {HELP_TOPICS.map((topic) => (
              <li key={topic.id}>
                <button type="button" className={styles.topic} onClick={() => go(topic.to)}>
                  <span className={styles.tile} aria-hidden="true">
                    <Icon name={topic.icon} size="16px" strokeWidth={1.5} />
                  </span>

                  <span className={styles.body}>
                    <span className={styles.topicTitle}>{topic.title}</span>
                    <span className={styles.topicBody}>{topic.body}</span>
                    <span className={styles.topicLink}>
                      {topic.linkLabel}
                      <Icon name="arrowRight" size="12px" strokeWidth={1.8} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            {HELP_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className={styles.action}
                onClick={() => go(action.to)}
              >
                <Icon name={action.icon} size="14px" strokeWidth={1.5} />
                {action.label}
              </button>
            ))}
          </div>

          <footer className={styles.foot}>
            <p className={styles.note}>
              <Icon name="info" size="14px" strokeWidth={1.6} />
              <span>{HELP_NOTE}</span>
            </p>
          </footer>
        </div>
      ) : null}
    </span>
  )
}
