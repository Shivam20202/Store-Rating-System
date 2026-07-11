/**
 * Sortable table header cell.
 *
 * Props:
 *  - label:      column display name
 *  - field:      the backend sortBy value this column maps to
 *  - sortBy:     current active sort field
 *  - sortOrder:  current sort order ('asc' | 'desc')
 *  - onSort:     (field) => void  — called with the field to sort by
 *  - className:  optional extra classes for the <th>
 *  - align:       'left' | 'right' | 'center' (default left)
 *
 * Clicking toggles asc/desc when already active, or switches to asc when inactive.
 */
export default function SortableHeader({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  className = '',
  align = 'left',
}) {
  const active = sortBy === field
  const order = active ? sortOrder : null

  const alignClass =
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left'

  const handleClick = () => {
    if (!onSort) return
    // If clicking the active column, toggle order; otherwise default to asc.
    if (active) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSort(field, 'asc')
    }
  }

  return (
    <th
      scope="col"
      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 ${alignClass} ${className}`}
    >
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-1 transition ${
          align === 'right' ? 'flex-row-reverse' : ''
        } ${active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <span>{label}</span>
        <span className="flex flex-col">
          {/* Up caret */}
          <svg
            className={`h-2.5 w-2.5 ${active && order === 'asc' ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 6a1 1 0 01.7.3l3 3a1 1 0 01-1.4 1.4L10 8.4l-2.3 2.3a1 1 0 11-1.4-1.4l3-3A1 1 0 0110 6z" />
          </svg>
          {/* Down caret */}
          <svg
            className={`-mt-1 h-2.5 w-2.5 ${active && order === 'desc' ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 14a1 1 0 01-.7-.3l-3-3a1 1 0 011.4-1.4L10 11.6l2.3-2.3a1 1 0 111.4 1.4l-3 3A1 1 0 0110 14z" />
          </svg>
        </span>
      </button>
    </th>
  )
}
