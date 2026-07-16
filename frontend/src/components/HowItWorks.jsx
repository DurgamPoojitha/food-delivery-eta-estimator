import { MapPin, Sliders, Calculator, CloudRain, GitBranch, Database, LayoutDashboard } from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: <MapPin size={20} />,
    title: 'Select Locations on the Map',
    description: 'Click anywhere on the OpenStreetMap to drop the restaurant pin and the customer pin. Both markers are draggable — coordinates update instantly in the form fields. The map draws a straight line between the two points as a visual reference.',
    tech: 'React Leaflet · CartoDB Tiles · Browser Geolocation',
    accent: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    number: 2,
    icon: <Sliders size={20} />,
    title: 'Enter Delivery Conditions',
    description: 'Set the base preparation time, traffic level (Low, Medium, High), kitchen busy level, and peak hour dispatch window. Optionally enable weekend surge. These parameters directly affect the final ETA calculation on the backend.',
    tech: 'React form state · Controlled inputs · Auto-submit on change',
    accent: '#7C3AED',
    bg: '#FAF5FF',
  },
  {
    number: 3,
    icon: <Calculator size={20} />,
    title: 'Distance via Haversine Formula',
    description: 'The backend computes the great-circle distance between the two coordinates using the Haversine formula. This gives the shortest straight-line distance in kilometres across the Earth\'s surface. Base travel time is derived from that distance at an assumed average speed of 40 km/h.',
    tech: 'Python · FastAPI · Custom Haversine utility',
    accent: '#16A34A',
    bg: '#F0FDF4',
  },
  {
    number: 4,
    icon: <CloudRain size={20} />,
    title: 'Live Weather Lookup',
    description: 'Using the restaurant\'s coordinates, the backend makes an async call to the OpenWeatherMap API. The weather condition (Clear, Rain, Thunderstorm, Snow) is mapped to a flat delay in minutes. If the API is unavailable or times out (2-second limit), the system defaults to no weather delay — no request fails because of a third-party dependency.',
    tech: 'OpenWeatherMap API · httpx async · Graceful fallback',
    accent: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    number: 5,
    icon: <GitBranch size={20} />,
    title: 'Business Rules Applied',
    description: 'Traffic adds a multiplier to the travel time (1× for low, 1.4× for medium, 2× for heavy). Kitchen busy level adds a flat delay (0, 5, or 10 min). Peak hour dispatch adds 8 min for lunch or 12 min for dinner rush. Weekend surge adds 5 min. All delays are summed with the weather delay to produce the total ETA.',
    tech: 'Python enums · Lookup tables · Pydantic v2 validation',
    accent: '#D97706',
    bg: '#FFFBEB',
  },
  {
    number: 6,
    icon: <Database size={20} />,
    title: 'Redis Cache Check',
    description: 'Before running any calculation, the backend generates a cache key from the request parameters. If a matching result exists in Redis, it is returned immediately — no recalculation, no external API call. If not, the result is computed, stored with a 10-minute TTL, and returned. Every request logs either "Cache Hit" or "Cache Miss".',
    tech: 'Redis · redis-py · 10-minute TTL · SHA key generation',
    accent: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    number: 7,
    icon: <LayoutDashboard size={20} />,
    title: 'ETA Displayed on Dashboard',
    description: 'The API response is rendered across the ETA dashboard — metric cards for distance, travel time, prep time, weather delay, and total ETA. A status card classifies the delivery as Fast (< 20 min), Moderate (20–40 min), or Delayed (> 40 min). The full breakdown shows exactly how each component contributed to the final number.',
    tech: 'React state · Axios · Metric cards · Status classification',
    accent: '#16A34A',
    bg: '#F0FDF4',
  },
]

const FORMULA = [
  { label: 'Base Travel',    value: 'Distance ÷ 40 km/h × 60' },
  { label: 'Traffic Delay', value: 'Travel × (multiplier − 1)' },
  { label: 'Preparation',   value: 'User-defined (mins)' },
  { label: 'Kitchen Busy',  value: '0 / 5 / 10 min' },
  { label: 'Peak Hour',     value: '0 / 8 / 12 min' },
  { label: 'Weather',       value: '0 / 3 / 8 / 15 / 20 / 25 min' },
  { label: 'Weekend Surge', value: '0 / 5 min' },
]

const HowItWorks = () => (
  <div className="animate-slide-up">
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>How It Works</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        A step-by-step walkthrough of how the platform estimates food delivery time — from map click to final result.
      </p>
    </div>

    <div className="flex flex-col gap-4 mb-8">
      {STEPS.map((step, idx) => (
        <div
          key={step.number}
          className="card flex gap-5 p-5 transition-all duration-200 hover:-translate-y-px"
        >
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: step.bg }}
            >
              <span style={{ color: step.accent }}>{step.icon}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="w-px flex-1" style={{ backgroundColor: 'var(--color-border)', minHeight: '20px' }} />
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: step.bg, color: step.accent }}
              >
                Step {step.number}
              </span>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{step.title}</h3>
            </div>
            <p className="text-sm leading-relaxed mb-2.5" style={{ color: 'var(--color-text-muted)' }}>
              {step.description}
            </p>
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg w-fit"
              style={{ backgroundColor: 'var(--color-border-sub)', color: 'var(--color-text-sub)' }}
            >
              <span className="font-mono">{step.tech}</span>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="card p-5">
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>ETA Formula</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Total ETA is the sum of all the following components:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FORMULA.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{ backgroundColor: 'var(--color-border-sub)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text)' }}>{label}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{value}</p>
          </div>
        ))}
        <div
          className="rounded-xl p-3 md:col-span-1"
          style={{ backgroundColor: 'var(--color-primary-bg)', border: '1px solid var(--color-primary)' }}
        >
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-primary)' }}>Total ETA</p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-primary)' }}>Sum of all above</p>
        </div>
      </div>
    </div>
  </div>
)

export default HowItWorks
