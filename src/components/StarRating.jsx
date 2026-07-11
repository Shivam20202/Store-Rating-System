import { useState } from 'react'

/**
 * Interactive / display star rating (1-5).
 *
 * Props:
 *  - value:        number of filled stars (0-5)
 *  - onChange:      (value) => void  — when provided the component is interactive
 *  - readOnly:      boolean — force display-only mode
 *  - size:          'sm' | 'md' | 'lg' (default md)
 *  - showValue:     boolean — show numeric value next to stars
 *  - total:         number of ratings (optional, shown when showValue)
 *
 * When interactive, hovering a star highlights it and all stars to its left;
 * clicking calls onChange with the selected integer.
 */
const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
}

function Star({ filled, half, size, interactive, onClick, onMouseEnter, onMouseLeave }) {
  const cls = SIZES[size] || SIZES.md
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} p-0 leading-none`}
      aria-label={`${filled ? 'Filled' : 'Empty'} star`}
    >
      <svg className={`${cls} ${filled ? 'text-amber-400' : 'text-slate-300'}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.36 4.18a1 1 0 00.95.69h4.4c.97 0 1.37 1.24.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18c.3.92-.76 1.69-1.54 1.12l-3.56-2.59a1 1 0 00-1.18 0l-3.56 2.59c-.78.57-1.84-.2-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L2.7 9.61c-.78-.57-.38-1.81.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z" />
      </svg>
    </button>
  )
}

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  total = null,
}) {
  const [hover, setHover] = useState(0)
  const interactive = !readOnly && typeof onChange === 'function'
  const display = hover || Number(value) || 0

  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="inline-flex items-center gap-1">
      <div
        className="inline-flex items-center"
        onMouseLeave={() => interactive && setHover(0)}
      >
        {stars.map((n) => (
          <span
            key={n}
            onMouseEnter={() => interactive && setHover(n)}
          >
            <Star
              filled={n <= display}
              size={size}
              interactive={interactive}
              onClick={() => interactive && onChange(n)}
            />
          </span>
        ))}
      </div>
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-600">
          {Number(value) > 0 ? Number(value).toFixed(1) : '—'}
          {total != null && (
            <span className="text-slate-400"> ({total})</span>
          )}
        </span>
      )}
    </div>
  )
}
