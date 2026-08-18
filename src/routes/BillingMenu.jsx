import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/ui/index.js'
import styles from './BillingMenu.module.css'

/**
 * The billing hero's kebab menu — Figma node 1:6925, artboard 25
 * (1:6544, "Cancel Reason Dropdown Open").
 *
 * The artboard shows one item, "Cancel Subscription", in surface/error. Once
 * the subscription is cancelled the same menu offers "Renew Subscription"
 * instead (artboard 33, 1:9718), so items are passed in rather than fixed.
 *
 * items: [{ id, label, tone?: 'danger', onSelect }]
 */
export default function BillingMenu({ items, label = 'More billing options' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)

  // Close on a click anywhere else, and on Escape from anywhere in the menu.
  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Opening with the keyboard should land on the first item, the same as the
  // pointer landing on it — otherwise focus stays on a button whose menu moved.
  useEffect(() => {
    if (open) listRef.current?.querySelector('[role="menuitem"]')?.focus()
  }, [open])

  function moveFocus(step) {
    const nodes = [...(listRef.current?.querySelectorAll('[role="menuitem"]') || [])]
    if (nodes.length === 0) return
    const at = nodes.indexOf(document.activeElement)
    const next = (at + step + nodes.length) % nodes.length
    nodes[next].focus()
  }

  function onListKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveFocus(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveFocus(-1)
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <span className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        ref={buttonRef}
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <Icon name="dotsVertical" size="16px" />
      </button>

      {open ? (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className={styles.menu}
          role="menu"
          aria-label={label}
          ref={listRef}
          onKeyDown={onListKeyDown}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={`${styles.item} ${item.tone === 'danger' ? styles.danger : ''}`}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </span>
  )
}
