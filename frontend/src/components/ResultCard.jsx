/**
 * components/ResultCard.jsx
 * =========================
 * Displays the ETA estimation results with an itemised receipt breakdown.
 */

import {
  MapIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import StatusBadge from './StatusBadge'

// ── Stat card sub-component ───────────────────────────────────────────────────
const StatCard = ({ icon, label, value, unit, delay = 0, accent = 'orange' }) => {
  const colors = {
    orange: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    teal:   'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }

  return (
    <div
      className="glass-panel p-4 rounded-2xl flex items-center gap-4 animate-slide-up hover:-translate-y-1 transition-transform"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${colors[accent]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="text-xl font-black text-white leading-tight">
          {value} <span className="text-sm font-normal text-slate-400 ml-0.5">{unit}</span>
        </p>
      </div>
    </div>
  )
}

const ReceiptRow = ({ label, value, isHighlight }) => (
  <div className="flex justify-between items-center py-2.5 text-sm border-b border-white/5 last:border-0">
    <span className={isHighlight ? "text-white font-semibold" : "text-slate-400"}>{label}</span>
    <span className={`tabular-nums font-mono ${isHighlight ? "text-brand-orange font-bold text-lg" : "text-slate-300"}`}>
      {value > 0 ? `+ ${value}` : value} min
    </span>
  </div>
)

const ResultCard = ({ result, restaurantName, onReset }) => {
  const {
    distance_km,
    total_eta,
    delivery_status,
    eta_breakdown,
  } = result

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Hero panel ──────────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-10 flex flex-col items-center text-center gap-5 shadow-glow-orange border-t-2 border-t-brand-orange/50">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Estimated ETA for
        </p>
        <h2 className="text-white text-2xl font-bold leading-tight">
          {restaurantName}
        </h2>
        <div className="my-2">
          <p className="text-transparent bg-clip-text bg-gradient-to-br from-brand-orange to-yellow-400 text-8xl font-black leading-none tabular-nums tracking-tighter">
            {total_eta}
          </p>
          <p className="text-brand-orange text-sm mt-3 font-semibold uppercase tracking-widest">Minutes Total</p>
        </div>
        <StatusBadge status={delivery_status} size="lg" />
      </div>

      {/* ── Stat grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={<MapIcon className="w-6 h-6" />}
          label="Distance"
          value={distance_km}
          unit="km"
          delay={60}
          accent="blue"
        />
        <StatCard
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          label="Base Travel"
          value={eta_breakdown.base_travel_time}
          unit="min"
          delay={120}
          accent="purple"
        />
        <StatCard
          icon={<ClockIcon className="w-6 h-6" />}
          label="Base Prep"
          value={eta_breakdown.base_prep_time}
          unit="min"
          delay={180}
          accent="teal"
        />
      </div>

      {/* ── Receipt Breakdown ────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col animate-slide-up" style={{ animationDelay: '240ms', opacity: 0 }}>
        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-slate-500" />
          Receipt Breakdown
        </h3>
        
        <div className="flex flex-col">
          <ReceiptRow label={`Base Travel Time (${distance_km} km)`} value={eta_breakdown.base_travel_time} />
          <ReceiptRow label="Traffic Multiplier" value={eta_breakdown.traffic_delay} />
          <ReceiptRow label="Base Prep Time" value={eta_breakdown.base_prep_time} />
          <ReceiptRow label="Restaurant Busy Delay" value={eta_breakdown.busy_delay} />
          <ReceiptRow label="Peak Hour Dispatch" value={eta_breakdown.peak_delay} />
          <ReceiptRow label="Weather Conditions" value={eta_breakdown.weather_delay} />
          <ReceiptRow label="Weekend Surge" value={eta_breakdown.weekend_delay} />
          
          <div className="mt-4 pt-4 border-t border-slate-700 border-dashed">
            <ReceiptRow label="Total Estimated ETA" value={total_eta} isHighlight={true} />
          </div>
        </div>
      </div>

      {/* ── Reset button ──────────────────────────────────── */}
      <button onClick={onReset} className="w-full py-5 rounded-2xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:text-white text-slate-300 font-bold tracking-wide uppercase text-sm transition-all duration-200 ease-out flex items-center justify-center gap-3 active:scale-[0.98]">
        <ArrowPathIcon className="w-5 h-5" />
        Calculate Another ETA
      </button>
    </div>
  )
}

export default ResultCard
