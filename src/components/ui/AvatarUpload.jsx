import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar.jsx'
import Icon from './Icon.jsx'
import Spinner from './Spinner.jsx'
import VisuallyHidden from './VisuallyHidden.jsx'
import { checkFile } from './fileRules.js'
import styles from './AvatarUpload.module.css'

/**
 * The account's picture, and the one control that changes it.
 *
 * The pattern every product that does this well converges on (WhatsApp, Jira,
 * Otter): the photograph *is* the button. A camera badge hangs off it so the
 * affordance is visible before you hover, the whole circle is the hit target
 * so it is not a 16px one, and the picker it opens is the browser's own — no
 * modal in between, because there is nothing to ask that the file dialog does
 * not already ask.
 *
 * Three states are worth showing and all three are on the badge, so the eye
 * never has to leave the picture: camera (pick one), spinner (being read and
 * squared), tick (kept). Dropping a file on the circle works too — a dragged
 * file that lands anywhere else is a browser navigation, so the target says so
 * with a ring while you drag.
 *
 * There is one control and nothing else. Picking again replaces what is
 * there, so "Replace" would be a second button for what the badge already
 * does, and a line of type under the circle — a size limit, a remove link —
 * turns a picture into a four-line block and pushes everything beside it out
 * of line. Whatever the screen has to say about the file, it says where its
 * own copy lives.
 *
 * `onSelect` may return a promise; that is what drives the spinner. Rejections
 * — a bad type, an oversize file, an unreadable image — come back through
 * `onReject` rather than being drawn from in here, so the screen keeps its own
 * voice about where the message goes.
 */
export default function AvatarUpload({
  name,
  src,
  size = 'lg',
  accept = [],
  maxMB,
  onSelect,
  onReject,
  /** The button takes this role, so the control can join a menu's roving
      focus rather than sitting outside the list a screen reader reads. */
  itemRole,
  disabled = false,
  className = '',
}) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('idle')   // idle | busy | done
  const [dragging, setDragging] = useState(false)

  /* The tick is a receipt, not a state: it says the last pick landed and then
     gets out of the way. */
  useEffect(() => {
    if (status !== 'done') return undefined
    const timer = setTimeout(() => setStatus('idle'), 1800)
    return () => clearTimeout(timer)
  }, [status])

  const busy = status === 'busy'

  async function take(file) {
    if (!file || busy) return

    const bad = checkFile(file, { accept, maxMB })
    if (bad) {
      onReject?.(bad.message, bad.reason)
      return
    }

    setStatus('busy')
    try {
      await onSelect?.(file)
      setStatus('done')
    } catch (error) {
      setStatus('idle')
      onReject?.(error?.message || 'That photo could not be read.', 'read')
    }
  }

  function pick(event) {
    const chosen = event.target.files?.[0]
    event.target.value = ''      // so re-picking the same file still fires
    take(chosen)
  }

  function onDrop(event) {
    event.preventDefault()
    setDragging(false)
    take(event.dataTransfer?.files?.[0])
  }

  const action = src ? 'Change your photo' : 'Add a photo'

  return (
    <div className={`${styles.wrap} ${className}`}>
      <button
        type="button"
        role={itemRole}
        className={`${styles.target} ${dragging ? styles.dragging : ''}`}
        aria-label={action}
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !busy) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <Avatar name={name} src={src} size={size} aria-hidden="true" />

        {/* Hover and focus reveal the same thing the badge already promises,
            over the picture rather than beside it. */}
        <span className={styles.veil} aria-hidden="true">
          <Icon name="camera" size="1rem" strokeWidth={1.5} />
        </span>

        <span className={`${styles.badge} ${status === 'done' ? styles.badgeDone : ''}`} aria-hidden="true">
          {busy ? (
            <Spinner size="sm" label="" />
          ) : (
            <Icon name={status === 'done' ? 'check' : 'camera'} size="0.75rem" strokeWidth={2} />
          )}
        </span>
      </button>

      <VisuallyHidden>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          aria-label={action}
          disabled={disabled || busy}
          tabIndex={-1}
          onChange={pick}
        />
      </VisuallyHidden>

      {/* Announced, because the change itself is silent to a screen reader. */}
      <VisuallyHidden aria-live="polite">
        {busy ? 'Saving your photo' : status === 'done' ? 'Photo updated' : ''}
      </VisuallyHidden>
    </div>
  )
}
