import styles from './StatusTag.module.css'

/**
 * The pill in a record table's Status column.
 *
 * tone: free | paid | succeeded   (settled — green)
 *       unpaid                    (awaiting payment — amber)
 *       failed                    (declined — red)
 */
export default function StatusTag({ tone, children }) {
  return <span className={`${styles.tag} ${styles[tone] || ''}`}>{children}</span>
}
