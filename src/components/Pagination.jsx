/**
 * Reusable pagination control.
 *
 * Props:
 *  - page:        current page (1-based)
 *  - totalPages:  total number of pages
 *  - total:       total number of items (optional, shown as a caption)
 *  - onPageChange:(page) => void
 *  - maxButtons:  how many page buttons to show around the current page (default 5)
 *
 * Renders prev / next + a compact window of page numbers with ellipses.
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  total = null,
  onPageChange,
  maxButtons = 5,
}) {
  if (totalPages <= 1) {
    // Still show a count caption if total is provided.
    if (total != null) {
      return (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            {total === 0 ? 'No results' : `Showing ${total} result${total === 1 ? '' : 's'}`}
          </span>
        </div>
      )
    }
    return null
  }

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n))
  const current = clamp(page, 1, totalPages)

  // Build a window of page numbers centered on `current`.
  const half = Math.floor(maxButtons / 2)
  let start = clamp(current - half, 1, totalPages - maxButtons + 1)
  let end = clamp(start + maxButtons - 1, 1, totalPages)
  // Re-adjust start if we hit the end.
  start = clamp(end - maxButtons + 1, 1, totalPages)

  const pages = []
  for (let p = start; p <= end; p++) pages.push(p)

  const showLeftEllipsis = start > 1
  const showRightEllipsis = end < totalPages

  const baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/40'
  const navBtn = (disabled) =>
    `${baseBtn} border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 ${
      disabled ? 'cursor-not-allowed opacity-40 hover:bg-white' : ''
    }`
  const pageBtn = (active) =>
    active
      ? `${baseBtn} bg-blue-600 text-white hover:bg-blue-700`
      : `${baseBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`

  const go = (p) => {
    const next = clamp(p, 1, totalPages)
    if (next !== current && onPageChange) onPageChange(next)
  }

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-slate-500">
        {total != null
          ? `Showing ${Math.min((current - 1) * 10 + 1, total)}–${Math.min(current * 10, total)} of ${total}`
          : `Page ${current} of ${totalPages}`}
      </p>
      <div className="flex items-center gap-1">
        <button
          className={navBtn(current === 1)}
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.7 5.3a1 1 0 010 1.4L9.4 10l3.3 3.3a1 1 0 01-1.4 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.4 0z" clipRule="evenodd" />
          </svg>
        </button>

        {showLeftEllipsis && (
          <>
            <button className={pageBtn(1 === current)} onClick={() => go(1)}>
              1
            </button>
            <span className="px-1 text-slate-400">…</span>
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={pageBtn(p === current)}
            onClick={() => go(p)}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {showRightEllipsis && (
          <>
            <span className="px-1 text-slate-400">…</span>
            <button className={pageBtn(totalPages === current)} onClick={() => go(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        <button
          className={navBtn(current === totalPages)}
          onClick={() => go(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.3 5.3a1 1 0 000 1.4L10.6 10l-3.3 3.3a1 1 0 001.4 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.4 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
