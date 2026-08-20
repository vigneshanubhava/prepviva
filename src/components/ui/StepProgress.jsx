import styles from './StepProgress.module.css'

/**
 * How far through a multi-step flow you are: one segment per step, filled up to
 * the current one, with the count beside it.
 *
 * One `role="progressbar"` for assistive tech and decorative segments for
 * everyone else — a row of divs each announcing itself is noise, and a bar with
 * no visible count leaves sighted users counting pips.
 *
 * `step` is 0-based, the way the flow that owns it counts.
 */
export default function StepProgress({
  step = 0,
  total = 1,
  label,
  showCount = true,
  className = '',
}) {
  const position = Math.min(Math.max(step + 1, 1), total)
  const text = `Step ${position} of ${total}${label ? `: ${label}` : ''}`

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-valuemin={1}
        aria-valuenow={position}
        aria-valuemax={total}
        aria-valuetext={text}
      >
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`${styles.segment} ${index < position ? styles.on : ''}`}
          />
        ))}
      </div>

      {showCount ? (
        <p className={styles.count}>
          Step {position} of {total}
        </p>
      ) : null}
    </div>
  )
}
