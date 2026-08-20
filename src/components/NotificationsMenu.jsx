import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './ui/index.js'
import { usePopover } from './usePopover.js'
import { useAccount } from '../data/AccountProvider.jsx'
import { usePrototype } from '../data/PrototypeProvider.jsx'
import { buildNotifications, unreadCount } from '../data/notifications.js'
import styles from './NotificationsMenu.module.css'

/**
 * The bell in the app header, and the panel behind it.
 *
 * Every row is derived from live state (`data/notifications.js`), so the panel
 * cannot announce something that is no longer true, and each row obeys the
 * switch that owns it in Settings → Preferences. That link is at the bottom of
 * the panel rather than buried: the honest answer to "why am I being told
 * this?" is the control that decides it.
 *
 * Read state lives on `AccountProvider` with the settings, in memory like
 * everything else — the brief rules out storage, so a reload brings them back.
 */
export default function NotificationsMenu() {
  const { account, summary, settings, notificationsRead, markNotificationsRead } = useAccount()
  const { state } = usePrototype()
  const navigate = useNavigate()
  const { open, setOpen, close, wrapRef, triggerRef, panelRef } = usePopover()

  const items = useMemo(
    () => buildNotifications({ account, summary, settings, state }),
    [account, summary, settings, state],
  )
  const unread = unreadCount(items, notificationsRead)

  function go(item) {
    markNotificationsRead([item.id])
    setOpen(false)
    navigate(item.to)
  }

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : 'Notifications, none unread'
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" size="1.25rem" strokeWidth={2} />
        {/* the count is in the button's accessible name above, so the dot is
            decoration rather than a second announcement */}
        {unread > 0 ? <span className={styles.dot} aria-hidden="true" /> : null}
      </button>

      {open ? (
        <div className={styles.panel} ref={panelRef} role="dialog" aria-label="Notifications">
          <header className={styles.head}>
            <p className={styles.title}>
              Notifications
              {unread > 0 ? <span className={styles.count}>{unread} new</span> : null}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                className={styles.markAll}
                onClick={() => markNotificationsRead(items.map((item) => item.id))}
              >
                Mark all as read
              </button>
            ) : null}
          </header>

          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyTile} aria-hidden="true">
                <Icon name="bell" size="18px" strokeWidth={1.5} />
              </span>
              <p className={styles.emptyTitle}>Nothing to tell you</p>
              <p className={styles.emptyBody}>
                Reports, reminders and balance warnings land here. What you are told about is set
                in Preferences.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const isRead = notificationsRead.includes(item.id)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.item}
                      data-tone={item.tone}
                      data-read={isRead || undefined}
                      onClick={() => go(item)}
                    >
                      <span className={styles.tile} aria-hidden="true">
                        <Icon name={item.icon} size="16px" strokeWidth={1.5} />
                      </span>

                      <span className={styles.body}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemBody}>{item.body}</span>
                        <span className={styles.itemMeta}>
                          <span className={styles.when}>{item.when}</span>
                          <span className={styles.action}>
                            {item.action}
                            <Icon name="arrowRight" size="12px" strokeWidth={1.8} />
                          </span>
                        </span>
                      </span>

                      {!isRead ? <span className={styles.unread} aria-hidden="true" /> : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <footer className={styles.foot}>
            <button
              type="button"
              className={styles.footLink}
              onClick={() => {
                close()
                navigate('/settings/preferences')
              }}
            >
              <Icon name="settings" size="14px" strokeWidth={1.5} />
              Notification preferences
            </button>
          </footer>
        </div>
      ) : null}
    </span>
  )
}
