import { MapPin, Clock, Thermometer, CloudRain, Timer, TrendingUp } from 'lucide-react'
import MetricCard from './MetricCard'
import StatusCard from './StatusCard'

const BUSY_LABELS = { low: 'Normal Hours', medium: 'Slightly Busy', high: 'Dinner Peak' }
const PEAK_LABELS = { none: 'No Peak', lunch: 'Lunch Rush', dinner: 'Dinner Rush' }
const TRAFFIC_LABELS = { low: 'Low Traffic', medium: 'Medium Traffic', high: 'Heavy Traffic' }

const ETADashboard = ({ result, restaurantName, payload }) => {
  const { distance_km, total_eta, delivery_status, weather, weather_delay, eta_breakdown } = result
  const travelWithTraffic = eta_breakdown.base_travel_time + eta_breakdown.traffic_delay

  const metrics = [
    { icon: <MapPin size={18} />,      label: 'Distance',       value: distance_km,                       unit: 'km',  accent: 'blue' },
    { icon: <Clock size={18} />,       label: 'Travel Time',    value: Math.round(travelWithTraffic),      unit: 'min', accent: 'green' },
    { icon: <Timer size={18} />,       label: 'Prep Time',      value: eta_breakdown.base_prep_time,       unit: 'min', accent: 'purple' },
    { icon: <CloudRain size={18} />,   label: 'Weather Delay',  value: `+${weather_delay}`,                unit: 'min', accent: 'yellow' },
    { icon: <TrendingUp size={18} />,  label: 'Total ETA',      value: total_eta,                          unit: 'min', accent: 'blue' },
  ]

  const busyLabel    = BUSY_LABELS[payload?.busy_level] ?? 'Unknown'
  const trafficLabel = TRAFFIC_LABELS[payload?.traffic] ?? 'Unknown'

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
          Estimated Delivery Time
          {restaurantName && (
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>
              — {restaurantName}
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard
          status={delivery_status}
          traffic={trafficLabel}
          weather={weather || 'Sunny'}
          busyHours={busyLabel}
          arrivalText={`Estimated in ${total_eta} minutes`}
        />

        <div className="card p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Breakdown</p>
          <div className="flex flex-col gap-2">
            {[
              ['Base travel',   `${eta_breakdown.base_travel_time} min`],
              ['Traffic delay', `+${eta_breakdown.traffic_delay} min`],
              ['Preparation',   `${eta_breakdown.base_prep_time} min`],
              ['Kitchen busy',  `+${eta_breakdown.busy_delay} min`],
              ['Peak hour',     `+${eta_breakdown.peak_delay} min`],
              [`Weather (${weather})`, `+${weather_delay} min`],
              ['Weekend surge', `+${eta_breakdown.weekend_delay} min`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border-sub)', paddingBottom: '6px' }}>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-text)' }}>{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Total ETA</span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{total_eta} min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ETADashboard
