import { useMemo, useState } from 'react'
import {
  Icon,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  TState,
  VisuallyHidden,
} from '../components/ui/index.js'
import styles from './RecordsTable.module.css'

/**
 * The searchable, sortable record table used by both billing tabs — Figma
 * 1:13303 puts the toolbar and the table in one block below the tabs, so the
 * two tabs share this rather than each growing its own copy.
 *
 * columns: { key, label, width, sortable, value(row), render(row) }
 */
export default function RecordsTable({
  label,
  columns,
  rows,
  searchLabel,
  searchPlaceholder,
  defaultSort,
  downloadLabel,
  rowLabel,
  emptyLabel = 'No records match',
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(defaultSort)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const searchable = (row) =>
      columns.map((col) => String(col.value ? col.value(row) : '')).join(' ').toLowerCase()

    const filtered = q ? rows.filter((row) => searchable(row).includes(q)) : rows

    const col = columns.find((c) => c.key === sort.key)
    if (!col?.value) return filtered

    return [...filtered].sort((a, b) => {
      const av = col.value(a)
      const bv = col.value(b)
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, columns, query, sort])

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.search}>
            <span className={styles.searchIcon}>
              <Icon name="search" size="16px" strokeWidth={1.5} />
            </span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={searchLabel}
            />
          </span>
          <button type="button" className={styles.iconBtn} aria-label={`Filter ${label.toLowerCase()}`}>
            <Icon name="filterLines" size="16px" strokeWidth={1.5} />
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <button type="button" className={styles.outlineBtn}>
            <Icon name="download" size="16px" strokeWidth={1.5} />
            {downloadLabel}
          </button>
          <button type="button" className={styles.iconBtnBare} aria-label="More table options">
            <Icon name="dotsVertical" size="16px" />
          </button>
        </div>
      </div>

      {/* No visible caption — the artboard has none, and the tab above already
          names the table. aria-label carries the name instead. */}
      <Table className={styles.table} aria-label={label}>
        <THead>
          <Tr>
            {columns.map((col) => (
              <Th
                key={col.key}
                className={styles[`col-${col.width}`]}
                sort={col.sortable ? (sort.key === col.key ? sort.dir : 'none') : null}
                onSort={col.sortable ? () => toggleSort(col.key) : undefined}
              >
                {col.label}
              </Th>
            ))}
            <Th className={styles['col-menu']}>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Th>
          </Tr>
        </THead>

        <TBody>
          {visible.length === 0 ? (
            <TState colSpan={columns.length + 1}>
              {emptyLabel} &ldquo;{query}&rdquo;.
            </TState>
          ) : (
            visible.map((row) => (
              <Tr key={row.id}>
                {columns.map((col) => (
                  <Td key={col.key}>{col.render ? col.render(row) : col.value(row)}</Td>
                ))}
                <Td className={styles['col-menu']}>
                  <button
                    type="button"
                    className={styles.rowMenu}
                    aria-label={`Actions for ${rowLabel(row)}`}
                  >
                    <Icon name="dotsVertical" size="16px" />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>
    </>
  )
}
