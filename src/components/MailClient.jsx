import { Avatar } from './ui/index.js'
import MailIcon from '../routes/MailIcon.jsx'
import styles from './MailClient.module.css'

/**
 * The simulated mail client both PrepViva emails are read in — Figma nodes
 * 14:10469 (the magic link) and 14:10022 (the cancellation confirmation).
 *
 * Everything here is third-party client chrome: layout only, inert, and hidden
 * from assistive technology. The email itself is passed in as children, and
 * every word of it comes from the docs.
 *
 * Its glyphs are redrawn inline in MailIcon rather than exported from Figma,
 * which would bake in their colours and stop following the theme.
 */

const NAV = [
  { icon: 'inbox', label: 'Inbox', count: '3', active: true },
  { icon: 'star', label: 'Starred' },
  { icon: 'clock', label: 'Snoozed' },
  { icon: 'send', label: 'Sent' },
  { icon: 'file', label: 'Drafts', count: '1', bold: true },
  { icon: 'alert', label: 'Spam', count: '3', bold: true },
  { icon: 'trash', label: 'Trash' },
  { icon: 'tag', label: 'Categories', bold: true, caret: true },
  { icon: 'chevronDown', label: 'More' },
]

const TOOLBAR = [
  ['archive', 'Archive'],
  ['alert', 'Report spam'],
  ['trash', 'Delete'],
  null,
  ['markUnread', 'Mark as unread'],
  ['clock', 'Snooze'],
  ['addTask', 'Add to tasks'],
  null,
  ['moveTo', 'Move to'],
  ['tag', 'Labels'],
  ['moreVert', 'More'],
]

const RAIL = ['clock', 'file', 'addTask', 'markUnread']

export default function MailClient({
  proto,
  protoTag = 'Prototype only',
  subject,
  tag = 'Promotions',
  to,
  timestamp = 'just now',
  reader = 'Oliver Davies',
  sender = { name: 'PrepViva', address: 'help@prepviva.com' },
  children,
}) {
  return (
    <div className={styles.page}>
      {/* Not on the artboard. One flowing line: a flex container here would put
          each text fragment on its own row. */}
      {proto ? (
        <p className={styles.protoBar}>
          <span className={styles.protoTag}>{protoTag}</span>
          {proto}
        </p>
      ) : null}

      {/* ------------------------------------------------ mail client chrome */}
      <div className={styles.client}>
        <div className={styles.clientHeader} aria-hidden="true">
          <div className={styles.headerLeft}>
            <MailIcon name="menu" size="24px" />
            <span className={styles.clientName}>Mail</span>
          </div>

          <div className={styles.search}>
            <MailIcon name="search" size="24px" />
            <span className={styles.searchText}>Search mail</span>
            <MailIcon name="chevronDown" size="22px" className={styles.searchCaret} />
          </div>

          <div className={styles.headerRight}>
            <MailIcon name="help" size="24px" />
            <MailIcon name="settings" size="24px" />
            <MailIcon name="apps" size="24px" />
            <Avatar name={reader} />
          </div>
        </div>

        <div className={styles.clientBody}>
          <nav className={styles.nav} aria-hidden="true">
            <span className={styles.compose}>
              <MailIcon name="plus" size="24px" />
              Compose
            </span>

            <ul className={styles.navList}>
              {NAV.map((item) => (
                <li key={item.label}>
                  <span className={`${styles.navItem} ${item.active ? styles.navActive : ''}`}>
                    <span className={styles.navCaret}>
                      {item.caret ? <MailIcon name="chevronDown" size="16px" /> : null}
                    </span>
                    <MailIcon name={item.icon} size="22px" />
                    <span className={`${styles.navLabel} ${item.bold ? styles.navBold : ''}`}>
                      {item.label}
                    </span>
                    {item.count ? <span className={styles.navCount}>{item.count}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------------------------------------------------- email view */}
          <div className={styles.view}>
            <div className={styles.toolbar} aria-hidden="true">
              <MailIcon name="arrowBack" size="22px" />
              <span className={styles.toolbarGroup}>
                {TOOLBAR.map((entry, index) =>
                  entry ? (
                    <MailIcon key={entry[1]} name={entry[0]} size="22px" />
                  ) : (
                    <span key={`rule-${index}`} className={styles.toolbarRule} />
                  ),
                )}
              </span>
              <span className={styles.pagination}>1–50 of 2,619</span>
              <MailIcon name="chevronLeft" size="22px" />
              <MailIcon name="chevronRight" size="22px" />
            </div>

            <div className={styles.subjectRow}>
              <h1 className={styles.subject}>{subject}</h1>
              <span className={styles.important} aria-hidden="true">
                <MailIcon name="labelImportant" size="20px" />
              </span>
              <span className={styles.chip} aria-hidden="true">
                Inbox
              </span>
              {tag ? (
                <span className={styles.tag} aria-hidden="true">
                  {tag}
                </span>
              ) : null}
              <span className={styles.subjectActions} aria-hidden="true">
                <MailIcon name="print" size="20px" />
                <MailIcon name="openInNew" size="20px" />
              </span>
            </div>

            <div className={styles.senderRow}>
              <Avatar name={sender.name} />
              <div className={styles.senderText}>
                <p className={styles.senderLine}>
                  <span className={styles.senderName}>{sender.name}</span>
                  <span className={styles.senderAddress}>&lt;{sender.address}&gt;</span>
                  <span className={styles.unsubscribe}>Unsubscribe</span>
                </p>
                <p className={styles.recipient}>to {to}</p>
              </div>
              <span className={styles.timestamp} aria-hidden="true">
                {timestamp}
              </span>
              <span className={styles.senderActions} aria-hidden="true">
                <MailIcon name="star" size="22px" />
                <MailIcon name="reply" size="22px" />
                <MailIcon name="moreVert" size="22px" />
              </span>
            </div>

            <div className={styles.area}>
              <div className={styles.canvas}>{children}</div>

              <div className={styles.replyRow} aria-hidden="true">
                <span className={styles.replyBtn}>
                  <MailIcon name="reply" size="20px" />
                  Reply
                </span>
                <span className={styles.replyBtn}>
                  <MailIcon name="forward" size="20px" />
                  Forward
                </span>
              </div>
            </div>
          </div>

          <aside className={styles.rail} aria-hidden="true">
            {RAIL.map((icon) => (
              <MailIcon key={icon} name={icon} size="20px" />
            ))}
            <span className={styles.railRule} />
            <MailIcon name="plus" size="20px" />
          </aside>
        </div>
      </div>
    </div>
  )
}
