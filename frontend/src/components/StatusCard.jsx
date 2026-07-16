import { Truck, AlertCircle, Clock } from 'lucide-react'

const STATUS_CONFIG = {
  'Fast Delivery': { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: <Truck size={18} />, label: 'On Time' },
  'Moderate':      { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: <Clock size={18} />,  label: 'Moderate' },
  'Delayed':       { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: <AlertCircle size={18} />, label: 'Delayed' },
}

const StatusCard = ({ status, traffic, weather, busyHours, arrivalText }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['Moderate']

  const InfoItem = ({ label, value, dotColor }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor || config.color }} />
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value}</span>
      </div>
    </div>
  )

  return (
    <div className="card p-4 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Delivery Status</p>
          <p className="text-xl font-bold" style={{ color: config.color }}>{config.label}</p>
          {arrivalText && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-sub)' }}>{arrivalText}</p>
          )}
        </div>
      </div>

      <div
        className="grid grid-cols-3 gap-4 pt-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <InfoItem label="Traffic"    value={traffic}    dotColor="#F59E0B" />
        <InfoItem label="Weather"    value={weather}    dotColor="#3B82F6" />
        <InfoItem label="Busy Hours" value={busyHours}  dotColor="#F97316" />
      </div>
    </div>
  )
}

export default StatusCard
