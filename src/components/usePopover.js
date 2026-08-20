import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * The open/close behaviour the header's panels share: click outside to dismiss,
 * Escape to dismiss and hand focus back to the trigger, and focus moved into
 * the panel when it opens.
 *
 * `ProfileMenu` keeps its own copy — it is a `role="menu"` with arrow-key
 * roving, which these two panels are not: they hold links, buttons and prose,
 * so they are labelled regions you tab through rather than menus you arrow
 * through. Sharing one hook for the part that genuinely is the same, and not
 * for the part that isn't, is why this is a hook and not a wrapper component.
 */
export function usePopover() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  // the first thing in the panel, so the keyboard carries on from where it was
  useEffect(() => {
    if (!open) return
    const first = panelRef.current?.querySelector(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    first?.focus()
  }, [open])

  return { open, setOpen, close, wrapRef, triggerRef, panelRef }
}
