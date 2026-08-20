import { useId, useRef } from 'react'
import Button from './Button.jsx'
import Icon from './Icon.jsx'
import VisuallyHidden from './VisuallyHidden.jsx'
import { checkFile } from './fileRules.js'
import styles from './FileDrop.module.css'

/**
 * Attach one file: an empty zone with a button, or the attached file with its
 * size and a way to remove it.
 *
 * It makes the two checks a file always needs — extension and size, shared
 * with the avatar picker in `fileRules.js` — because a component that accepts
 * anything teaches the user nothing until the server says no. The message is
 * handed back through `onReject` rather than rendered from inside, so the
 * screen keeps its own voice; `error` renders it.
 *
 * Only the file's name and size are passed on. This prototype has no backend,
 * and nothing here reads the bytes — with one opt-in exception: `passFile`
 * adds the `File` itself to the payload, for a screen that has to *show* what
 * was picked (the profile photo makes a blob URL from it). Still nothing
 * leaves the browser.
 */
export default function FileDrop({
  label,
  hint,
  accept = [],
  maxMB,
  file = null,
  error,
  onSelect,
  onReject,
  /** Removing, as its own callback. `onSelect(null)` means both "removed" and
      "what you picked was rejected", which is fine for a form field and wrong
      for anything already saved — a bad file must not delete the good one. */
  onRemove,
  chooseLabel = 'Choose a file',
  replaceLabel = 'Replace',
  /** Include the `File` in onSelect's payload — see the note above. */
  passFile = false,
  /** Actions only — no drop zone, whether or not a file is attached. For a
      screen that already states the file, or has no room for a target: the
      configurator's "CV attached" card, the profile photo. */
  compact = false,
  allowReplace = true,
  /** Off where removing the file would strand the flow the screen is in. */
  allowRemove = true,
  disabled = false,
  className = '',
}) {
  const auto = useId()
  const inputRef = useRef(null)
  const errorId = error ? `${auto}-error` : undefined
  const hintId = hint ? `${auto}-hint` : undefined

  function pick(event) {
    const chosen = event.target.files?.[0]
    event.target.value = ''      // so re-picking the same file still fires
    if (!chosen) return

    const bad = checkFile(chosen, { accept, maxMB })
    if (bad) {
      onSelect?.(null)
      onReject?.(bad.message, bad.reason)
      return
    }

    onSelect?.({
      name: chosen.name,
      size: chosen.size,
      ...(passFile ? { file: chosen } : null),
    })
  }

  return (
    <div className={`${styles.wrap} ${compact ? styles.wrapCompact : ''} ${className}`}>
      {label ? <p className={styles.label}>{label}</p> : null}

      {file ? (
        <p className={compact ? styles.compact : styles.file}>
          {compact ? null : (
            <>
              <Icon name="checkCircle" size="16px" className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatSize(file.size)}</span>
            </>
          )}

          {/* Replace goes through the same input and the same two checks as the
              first attach — a second picker somewhere else in the app would be
              a second place for the size and type rules to drift. */}
          {allowReplace ? (
            <button
              type="button"
              className={styles.remove}
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              {replaceLabel}
              <VisuallyHidden> {file.name}</VisuallyHidden>
            </button>
          ) : null}

          {allowRemove ? (
            <button
              type="button"
              className={styles.remove}
              disabled={disabled}
              onClick={() => (onRemove ? onRemove() : onSelect?.(null))}
            >
              Remove
              <VisuallyHidden> {file.name}</VisuallyHidden>
            </button>
          ) : null}
        </p>
      ) : compact ? (
        <p className={styles.compact}>
          <button
            type="button"
            className={styles.remove}
            disabled={disabled}
            aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
            onClick={() => inputRef.current?.click()}
          >
            {chooseLabel}
          </button>
        </p>
      ) : (
        <div className={`${styles.zone} ${error ? styles.zoneError : ''}`}>
          <span className={styles.zoneIcon} aria-hidden="true">
            <Icon name="upload" size="24px" strokeWidth={1.5} />
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={disabled}
            aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
            onClick={() => inputRef.current?.click()}
          >
            {chooseLabel}
          </Button>

          {hint ? (
            <p className={styles.hint} id={hintId}>
              {hint}
            </p>
          ) : null}
        </div>
      )}

      <VisuallyHidden>
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          aria-label={label || chooseLabel}
          disabled={disabled}
          tabIndex={-1}
          onChange={pick}
        />
      </VisuallyHidden>

      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          <Icon name="alertCircle" size="16px" />
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Never "0 KB": a file that exists is at least one. Kept internal so this file
    exports only its component — the fast-refresh rule the lint config enforces. */
function formatSize(bytes) {
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
