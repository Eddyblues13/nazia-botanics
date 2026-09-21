import { Children, cloneElement, isValidElement } from 'react'
/**
 * Shared dashboard primitives. `bodyFlush` turns off the panel's own padding
 * for tables, which manage their cell padding themselves.
 */
export function Panel({ title, action, children, bodyFlush = false, className = '' }) {
  return (
    <section className={`ad-panel ${className}`}>
      {(title || action) && (
        <header className="ad-panel__head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      <div className={`ad-panel__body ${bodyFlush ? 'ad-panel__body--flush' : ''}`}>{children}</div>
    </section>
  )
}

export function StatCard({ label, value, hint, trend }) {
  const trendClass =
    trend === undefined || trend === null
      ? ''
      : trend >= 0
        ? 'ad-stat__hint--up'
        : 'ad-stat__hint--down'

  return (
    <div className="ad-stat">
      <p className="ad-stat__label">{label}</p>
      <p className="ad-stat__value">{value}</p>
      {hint && <p className={`ad-stat__hint ${trendClass}`}>{hint}</p>}
    </div>
  )
}

export function Badge({ status }) {
  return <span className={`ad-badge ad-badge--${status}`}>{status}</span>
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="ad-state">
      <span className="ad-spinner" aria-hidden="true" />
      <p>{label}…</p>
    </div>
  )
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="ad-state">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="ad-state ad-state--error">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="ad-btn ad-btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

/** Horizontal scroll lives here so wide tables never push the page sideways. */
export function TableWrap({ head, children }) {
  // On a narrow screen each row is drawn as a card instead of a table row, so
  // every cell has to say which column it is. The label is stamped on here
  // rather than by each page, which keeps all the dashboard's tables in step
  // and means a page cannot forget one. `colSpan` is respected so a totals row
  // spanning four columns still lines up with the right heading.
  const labelled = Children.map(children, (row) => {
    if (!isValidElement(row) || row.type !== 'tr') return row

    let column = 0
    const cells = Children.map(row.props.children, (cell) => {
      if (!isValidElement(cell)) return cell

      const label = head[column] ?? ''
      column += cell.props.colSpan ?? 1

      // A cell that already names itself is left alone.
      return cell.props['data-label'] === undefined
        ? cloneElement(cell, { 'data-label': label })
        : cell
    })

    return cloneElement(row, undefined, cells)
  })

  return (
    <div className="ad-tablewrap">
      <table className="ad-table">
        <thead>
          <tr>
            {head.map((label, i) => (
              <th key={i}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{labelled}</tbody>
      </table>
    </div>
  )
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="ad-pagination">
      <span>
        Page {meta.current_page} of {meta.last_page} · {meta.total} total
      </span>
      <div className="ad-pagination__buttons">
        <button
          className="ad-btn ad-btn--ghost ad-btn--sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPage(meta.current_page - 1)}
        >
          Previous
        </button>
        <button
          className="ad-btn ad-btn--ghost ad-btn--sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPage(meta.current_page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function Field({ label, hint, error, children }) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      {children}
      {hint && <span className="ad-field__hint">{hint}</span>}
      {error && <span className="ad-field__error">{error}</span>}
    </label>
  )
}
