import Icon from './Icon.jsx'
import Spinner from './Spinner.jsx'
import styles from './Table.module.css'

export function Table({ caption, stickyHead = false, hoverable = true, className = '', children, ...rest }) {
  return (
    <div className={`${styles.scroll} ${className}`}>
      <table
        className={[styles.table, stickyHead ? styles.stickyHead : '', hoverable ? styles.hoverable : '']
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        {children}
      </table>
    </div>
  )
}

export function THead({ children, ...rest }) {
  return <thead {...rest}>{children}</thead>
}

export function TBody({ children, ...rest }) {
  return <tbody {...rest}>{children}</tbody>
}

export function Tr({ forceState, className = '', children, ...rest }) {
  return (
    <tr className={`${styles.tr} ${className}`} data-force={forceState} {...rest}>
      {children}
    </tr>
  )
}

/**
 * sort: null (not sortable) | 'none' | 'asc' | 'desc'
 * A sortable header renders a real button and sets aria-sort on the cell.
 */
export function Th({ align = 'left', sort = null, onSort, className = '', children, ...rest }) {
  const alignClass = align === 'right' ? styles.alignRight : align === 'center' ? styles.alignCenter : ''
  const isSorted = sort === 'asc' || sort === 'desc'

  return (
    <th
      scope="col"
      className={`${styles.th} ${alignClass} ${isSorted ? styles.sorted : ''} ${className}`}
      aria-sort={sort ? (sort === 'none' ? 'none' : sort === 'asc' ? 'ascending' : 'descending') : undefined}
      {...rest}
    >
      {sort ? (
        <button type="button" className={styles.sortButton} onClick={onSort}>
          {children}
          <span className={styles.sortIcon}>
            <Icon name={sort === 'desc' ? 'chevronDown' : 'chevronUp'} size="0.875rem" />
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export function Td({ align = 'left', className = '', children, ...rest }) {
  const alignClass = align === 'right' ? styles.alignRight : align === 'center' ? styles.alignCenter : ''
  return (
    <td className={`${styles.td} ${alignClass} ${className}`} {...rest}>
      {children}
    </td>
  )
}

/** Full-width row for the loading and empty cases. */
export function TState({ colSpan, loading = false, children }) {
  return (
    <tr>
      <td className={styles.state} colSpan={colSpan}>
        {loading ? <Spinner size="md" label="Loading rows" /> : children}
      </td>
    </tr>
  )
}

export default Table
