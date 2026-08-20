import { useId, useRef } from 'react'
import Button from './Button.jsx'
import Icon from './Icon.jsx'
import VisuallyHidden from './VisuallyHidden.jsx'
import styles from './FileDrop.module.css'

/**
 * Attach one file: an empty zone with a button, or the attached file with its
 * size and a way to remove it.
 *
 * It owns the two checks a file always needs — extension and size — because a
 * component that accepts anything teaches the user nothing until the server
 * says no. The message is handed back through `onReject` rather than rendered
 * from inside, so the screen keeps its own voice; `error` renders it.
 *
 * Only the file's name and size are passed on. This prototype has no backend,
 * and nothing here reads the bytes.
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
  chooseLabel = 'Choose a file',
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

    const named = chosen.name.toLowerCase()
    if (accept.length && !accept.some((ext) => named.endsWith(ext))) {
      onSelect?.(null)
      onReject?.(`That file type is not accepted — use ${accept.join(', ')}.`, 'type')
      return
    }
    if (maxMB && chosen.size > maxMB * 1024 * 1024) {
      onSelect?.(null)
      onReject?.(`That file is over ${maxMB}MB.`, 'size')
      return
    }
    onSelect?.({ name: chosen.name, size: chosen.size })
  }

  return (
    <div className={`${styles.wrap} ${className}`}>
      {label ? <p className={styles.label}>{label}</p> : null}

      {file ? (
        <p className={styles.file}>
          <Icon name="checkCircle" size="16px" className={styles.fileIcon} />
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatSize(file.size)}</span>
          <button
            type="button"
            className={styles.remove}
            disabled={disabled}
            onClick={() => onSelect?.(null)}
          >
            Remove
            <VisuallyHidden> {file.name}</VisuallyHidden>
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
