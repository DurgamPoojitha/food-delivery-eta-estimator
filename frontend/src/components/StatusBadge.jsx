import { BoltIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

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

const FALLBACK = STATUS_STYLES['Moderate']

const SIZE_CLASSES = {
  sm: 'px-3 py-1 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

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
      
      <span
        className={`shrink-0 rounded-full ${config.dot} animate-pulse-soft ${
          size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2'
        }`}
      />

      
      <span className="leading-none" aria-hidden="true">
        {config.icon}
      </span>

      
      <span>{status}</span>
    </span>
  )
}

export default StatusBadge
