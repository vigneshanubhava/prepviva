import { createContext, useContext, useId, useRef } from 'react'
import styles from './Tabs.module.css'

const TabsContext = createContext(null)

/**
 * variant: underline | pill
 * Roving tabindex with arrow / Home / End keys, per the ARIA tabs pattern.
 */
export function Tabs({ value, onChange, variant = 'underline', children, className = '' }) {
  const baseId = useId()
  return (
    <TabsContext.Provider value={{ value, onChange, variant, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ label, className = '', children }) {
  const { variant } = useContext(TabsContext)
  const ref = useRef(null)

  const onKeyDown = (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
    if (!keys.includes(event.key)) return

    const tabs = Array.from(ref.current?.querySelectorAll('[role="tab"]:not([disabled])') || [])
    if (tabs.length === 0) return

    const current = tabs.indexOf(document.activeElement)
    let next = current
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1

    event.preventDefault()
    tabs[next]?.focus()
    tabs[next]?.click()
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      className={`${styles.list} ${styles[variant]} ${className}`}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  )
}

export function Tab({ value: tabValue, disabled = false, forceState, className = '', children, ...rest }) {
  const { value, onChange, baseId } = useContext(TabsContext)
  const selected = value === tabValue

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${tabValue}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${tabValue}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-force={forceState}
      className={`${styles.tab} ${className}`}
      onClick={() => onChange?.(tabValue)}
      {...rest}
    >
      {children}
    </button>
  )
}

export function TabPanel({ value: panelValue, className = '', children }) {
  const { value, baseId } = useContext(TabsContext)
  if (value !== panelValue) return null

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${panelValue}`}
      aria-labelledby={`${baseId}-tab-${panelValue}`}
      tabIndex={0}
      className={`${styles.panel} ${className}`}
    >
      {children}
    </div>
  )
}

export default Tabs
