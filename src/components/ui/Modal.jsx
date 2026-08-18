import { useCallback, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'
import styles from './Modal.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps focus, restores it on close, closes on Escape, locks background scroll.
 * Rendered through a portal so the scrim is never clipped by a parent's overflow.
 */
export default function Modal({
  open,
  onClose,
  title,
  /** Accessible name for a dialog whose heading lives in its body, not the
      header row — Figma 1:9709 puts a tick above the heading, so the dialog
      renders no header at all. Ignored when `title` is set. */
  label,
  description,
  size = 'md',
  placement = 'center',   // center | drawer (right-hand panel)
  footer,
  closeOnScrim = true,
  showClose = true,
  closeLabel = 'Close',
  className = '',
  scrimClassName = '',
  children,
}) {
  const dialogRef = useRef(null)
  const restoreRef = useRef(null)
  const autoId = useId()
  const titleId = `${autoId}-title`
  const descId = `${autoId}-desc`

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key !== 'Tab') return

      const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE)
      if (!nodes || nodes.length === 0) {
        event.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  // Document-level fallback: if an action removes the focused control, focus
  // drops to <body> and the dialog's own keydown never fires.
  useEffect(() => {
    if (!open) return undefined
    const onDocKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onDocKeyDown)
    return () => document.removeEventListener('keydown', onDocKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined

    restoreRef.current = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE)
    if (nodes && nodes.length > 0) nodes[0].focus()
    else dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = overflow
      restoreRef.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={[styles.scrim, placement === 'drawer' ? styles.scrimDrawer : '', scrimClassName]
        .filter(Boolean)
        .join(' ')}
      onMouseDown={(e) => {
        if (closeOnScrim && e.target === e.currentTarget) onClose?.()
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : label}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={[styles.dialog, placement === 'drawer' ? styles.drawer : styles[size], className]
          .filter(Boolean)
          .join(' ')}
        onKeyDown={handleKeyDown}
      >
        {title || showClose ? (
          <div className={styles.header}>
            <div className={styles.headings}>
              {/* tabIndex -1 so a screen can park focus on the heading after an
                  action removes the control that was focused */}
              {title ? (
                <h2 className={styles.title} id={titleId} tabIndex={-1}>
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className={styles.description} id={descId}>
                  {description}
                </p>
              ) : null}
            </div>
            {showClose ? (
              <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
                <Icon name="x" size="1.125rem" />
              </button>
            ) : null}
          </div>
        ) : null}

        {children ? <div className={styles.body}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}
