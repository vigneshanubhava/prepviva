import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'
import styles from './Toast.module.css'

const ToastContext = createContext(null)

const toneIcon = {
  info: 'info',
  success: 'checkCircle',
  warning: 'alertTriangle',
  danger: 'alertCircle',
}

/** Presentational toast — exported so the kitchen sink can render every tone statically. */
export function Toast({ tone = 'info', title, children, onDismiss, leaving = false, className = '' }) {
  return (
    <div
      className={`${styles.toast} ${styles[tone]} ${leaving ? styles.leaving : ''} ${className}`}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <span className={styles.icon}>
        <Icon name={toneIcon[tone]} size="1.125rem" />
      </span>
      <div className={styles.content}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <p className={styles.body}>{children}</p> : null}
      </div>
      {onDismiss ? (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          <Icon name="x" size="1rem" />
        </button>
      ) : null}
    </div>
  )
}

export function ToastProvider({ children, duration = 5000 }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ tone = 'info', title, body, duration: ms = duration }) => {
      const id = nextId.current++
      setToasts((list) => [...list, { id, tone, title, body }])
      if (ms > 0) timers.current.set(id, setTimeout(() => dismiss(id), ms))
      return id
    },
    [dismiss, duration],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div className={styles.viewport} aria-live="polite" aria-atomic="false">
              {toasts.map((t) => (
                <Toast key={t.id} tone={t.tone} title={t.title} onDismiss={() => dismiss(t.id)}>
                  {t.body}
                </Toast>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default Toast
