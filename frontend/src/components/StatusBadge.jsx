/**
 * components/StatusBadge.jsx
 * ==========================
 * Purpose:
 *   Renders a color-coded pill badge for the delivery_status value returned
 *   from the backend: "Fast Delivery", "Moderate", or "Delayed".
 *
 * Design Rationale:
 *   - Config-driven approach (STATUS_STYLES map) follows the Open/Closed Principle:
 *     adding a new status means adding one entry to the map — zero JSX changes.
 *   - Colour semantics follow universal mental models:
 *       green  = good / fast
 *       yellow = caution / acceptable
 *       red    = bad / slow
 *     These are immediately understood without reading the label.
 *   - The pulsing dot adds a "live data" quality — the estimate is fresh.
 *   - size prop allows the badge to be used at different scales in the UI
 *     (e.g., large hero display vs small inline reference).
 *
 * @param {{ status: string, size?: 'sm' | 'md' | 'lg' }} props
 */

import { BoltIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// ── Status configuration map ──────────────────────────────────────────────────
const STATUS_STYLES = {
  'Fast Delivery': {
    wrapper: 'bg-green-500/10 border-green-500/30 text-green-400',
    dot:     'bg-green-400',
    icon:    <BoltIcon className="w-4 h-4" />,
  },
  'Moderate': {
    wrapper: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    dot:     'bg-yellow-400',
    icon:    <ClockIcon className="w-4 h-4" />,
  },
  'Delayed': {
    wrapper: 'bg-red-500/10 border-red-500/30 text-red-400',
    dot:     'bg-red-500',
    icon:    <ExclamationTriangleIcon className="w-4 h-4" />,
  },
}

// Fallback to Moderate styling if an unknown status is returned
const FALLBACK = STATUS_STYLES['Moderate']

// ── Size variants ─────────────────────────────────────────────────────────────
const SIZE_CLASSES = {
  sm: 'px-3 py-1 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

// ── Component ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_STYLES[status] ?? FALLBACK
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        transition-all duration-200 select-none
        ${config.wrapper}
        ${sizeClass}
      `}
    >
      {/* Pulsing live indicator dot */}
      <span
        className={`shrink-0 rounded-full ${config.dot} animate-pulse-soft ${
          size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
        }`}
      />

      {/* Emoji icon */}
      <span className="leading-none" aria-hidden="true">
        {config.icon}
      </span>

      {/* Text label */}
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge
