const MetricCard = ({ icon, label, value, unit, accent }) => {
  const accentColors = {
    blue:   { bg: '#EFF6FF', color: '#2563EB' },
    green:  { bg: '#F0FDF4', color: '#16A34A' },
    yellow: { bg: '#FFFBEB', color: '#D97706' },
    red:    { bg: '#FEF2F2', color: '#DC2626' },
    purple: { bg: '#FAF5FF', color: '#7C3AED' },
  }
  const { bg, color } = accentColors[accent] ?? accentColors.blue

  return (
    <div
      className="card card-hover flex items-center gap-4 p-4 cursor-default"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="metric-value">{value}<span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>{unit}</span></div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  )
}

export default MetricCard
