import { useRef } from 'react'
import styles from './SegmentedControl.module.css'

/**
 * options: [{ value, label, note, disabled }]
 * `note` is the inline suffix the pricing toggle needs ("Save 20%").
 */
export default function SegmentedControl({
  value,
  onChange,
  options = [],
  label,
  size = 'md',
  forceStates = {},
  className = '',
}) {
  const ref = useRef(null)

  const onKeyDown = (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const items = Array.from(ref.current?.querySelectorAll('[role="radio"]:not([disabled])') || [])
    if (items.length === 0) return

    const current = items.indexOf(document.activeElement)
    let next = current
    if (event.key === 'ArrowRight') next = (current + 1) % items.length
    if (event.key === 'ArrowLeft') next = (current - 1 + items.length) % items.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = items.length - 1

    event.preventDefault()
    items[next]?.focus()
    items[next]?.click()
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={`${styles.group} ${styles[size]} ${className}`}
      onKeyDown={onKeyDown}
    >
      {options.map((opt) => {
        const checked = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={opt.disabled}
            data-force={forceStates[opt.value]}
            className={styles.segment}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.label}
            {opt.note ? <span className={styles.note}>{opt.note}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
