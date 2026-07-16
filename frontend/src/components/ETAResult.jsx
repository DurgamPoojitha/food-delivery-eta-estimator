import StatusBadge from './StatusBadge'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

const Row = ({ label, value, isTotal }) => (
  <div className={`result-row ${isTotal ? 'border-t border-gray-700 mt-1 pt-3 border-b-0' : ''}`}>
    <span className={`result-label ${isTotal ? 'text-gray-200 font-medium' : ''}`}>{label}</span>
    <span className={`result-value ${isTotal ? 'text-orange-400 text-base' : ''}`}>{value}</span>
  </div>
)

const ETAResult = ({ result, restaurantName, onReset }) => {
  const {
    distance_km,
    total_eta,
    delivery_status,
    weather,
    weather_delay,
    eta_breakdown,
  } = result

  const travelWithTraffic = eta_breakdown.base_travel_time + eta_breakdown.traffic_delay
  const prepTotal = eta_breakdown.base_prep_time + eta_breakdown.busy_delay

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">ETA Result — {restaurantName}</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-end gap-3 mb-5">
          <span className="text-4xl font-bold text-gray-100 tabular-nums">{total_eta}</span>
          <span className="text-gray-400 text-sm mb-1">minutes</span>
          <div className="mb-1">
            <StatusBadge status={delivery_status} />
          </div>
        </div>

        <div className="flex flex-col">
          <Row label="Distance" value={`${distance_km} km`} />
          <Row label="Travel time" value={`${eta_breakdown.base_travel_time} min`} />
          <Row label="Traffic delay" value={`+${eta_breakdown.traffic_delay} min`} />
          <Row label="Preparation" value={`${eta_breakdown.base_prep_time} min`} />
          <Row label="Kitchen delay" value={`+${eta_breakdown.busy_delay} min`} />
          <Row label="Peak hour" value={`+${eta_breakdown.peak_delay} min`} />
          <Row label={`Weather (${weather})`} value={`+${weather_delay} min`} />
          <Row label="Weekend surge" value={`+${eta_breakdown.weekend_delay} min`} />
          <Row label="Total ETA" value={`${total_eta} min`} isTotal />
        </div>
      </div>
    </div>
  )
}

export default ETAResult
