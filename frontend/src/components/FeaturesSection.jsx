import {
  Map,
  MapPin,
  Compass,
  Clock,
  CloudRain,
  TrafficCone,
  UtensilsCrossed,
  Sunrise,
  Database,
  Plug,
  MonitorSmartphone,
  SunMoon,
  ShieldCheck,
} from 'lucide-react'

const FEATURES = [
  {
    icon: <Map size={20} />,
    title: 'Interactive Map',
    description: 'Click anywhere on OpenStreetMap to drop location pins. Both markers are draggable — coordinates sync to the form instantly.',
    accent: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: <MapPin size={20} />,
    title: 'Location Selection',
    description: 'Set restaurant and customer locations either by clicking the map or typing coordinates directly. A polyline connects both points.',
    accent: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    icon: <Compass size={20} />,
    title: 'Haversine Distance',
    description: 'Great-circle distance is computed from raw latitude and longitude coordinates using the Haversine formula — no routing API needed.',
    accent: '#16A34A',
    bg: '#F0FDF4',
  },
  {
    icon: <Clock size={20} />,
    title: 'ETA Calculation',
    description: 'Travel time, prep time, traffic delay, weather delay, and surge values are summed to produce a single estimated delivery time.',
    accent: '#7C3AED',
    bg: '#FAF5FF',
  },
  {
    icon: <TrafficCone size={20} />,
    title: 'Traffic Simulation',
    description: 'Three traffic levels apply a multiplier (1×, 1.4×, 2×) to base travel time, simulating low, medium, and heavy congestion.',
    accent: '#D97706',
    bg: '#FFFBEB',
  },
  {
    icon: <UtensilsCrossed size={20} />,
    title: 'Kitchen Busy Level',
    description: 'Accounts for kitchen load — normal, slightly busy, or at peak — adding 0, 5, or 10 minutes to the preparation-side delay.',
    accent: '#F97316',
    bg: '#FFF7ED',
  },
  {
    icon: <Sunrise size={20} />,
    title: 'Peak Hour Adjustment',
    description: 'Lunch rush adds 8 minutes, dinner rush adds 12 minutes. Reflects real-world dispatch delays during high-demand periods.',
    accent: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    icon: <CloudRain size={20} />,
    title: 'Live Weather Integration',
    description: 'Fetches current weather from OpenWeatherMap using restaurant coordinates. Rain, storms, and snow each add a defined flat delay.',
    accent: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: <Database size={20} />,
    title: 'Redis Caching',
    description: 'Repeated requests with the same parameters return cached results instantly. Cache entries expire after 10 minutes via TTL.',
    accent: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    icon: <Plug size={20} />,
    title: 'REST API Backend',
    description: 'FastAPI backend exposes a single POST endpoint with Pydantic validation. Interactive docs available at /docs via Swagger UI.',
    accent: '#16A34A',
    bg: '#F0FDF4',
  },
  {
    icon: <MonitorSmartphone size={20} />,
    title: 'Responsive Layout',
    description: 'Built with Tailwind CSS. The layout adapts from a desktop two-column view to a stacked single-column layout on mobile.',
    accent: '#7C3AED',
    bg: '#FAF5FF',
  },
  {
    icon: <SunMoon size={20} />,
    title: 'Light and Dark Mode',
    description: 'Theme toggle persists the selected mode in localStorage. Detects system preference automatically on first visit.',
    accent: '#D97706',
    bg: '#FFFBEB',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Input Validation',
    description: 'Coordinate ranges, prep time limits, and required fields are validated both on the frontend form and in the Pydantic request model.',
    accent: '#0891B2',
    bg: '#ECFEFF',
  },
]

const FeaturesSection = () => (
  <div className="animate-slide-up">
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Features</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        A summary of what the platform does and how each part of the system is implemented.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {FEATURES.map(({ icon, title, description, accent, bg }) => (
        <div
          key={title}
          className="card p-4 flex gap-4 transition-all duration-200 hover:-translate-y-0.5"
          style={{ cursor: 'default' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: bg }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{title}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default FeaturesSection
