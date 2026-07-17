import { useState } from 'react'
import Navbar         from '../components/Navbar'
import SidebarForm    from '../components/SidebarForm'
import MapView        from '../components/MapView'
import ETADashboard   from '../components/ETADashboard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import FeatureCard    from '../components/FeatureCard'
import HowItWorks      from '../components/HowItWorks'
import FeaturesSection from '../components/FeaturesSection'
import AboutSection    from '../components/AboutSection'
import { estimateETA } from '../services/api'
import { useTheme } from '../hooks/useTheme'
import { Target, Zap, Route, Server, AlertCircle } from 'lucide-react'

const VIEWS = Object.freeze({ IDLE: 'idle', LOADING: 'loading', RESULT: 'result' })

const FEATURES = [
  { icon: <Target size={16} />,  title: 'Accurate Estimation',     subtitle: 'Powered by real-world data' },
  { icon: <Zap size={16} />,     title: 'Real-time Conditions',    subtitle: 'Traffic, weather & more' },
  { icon: <Route size={16} />,   title: 'Smart Routing Logic',     subtitle: 'Optimised for fastest delivery' },
  { icon: <Server size={16} />,  title: 'Enterprise Ready',        subtitle: 'Built for scale & reliability' },
]

const Home = () => {
  const { theme, toggle } = useTheme()

  const [view,          setView]          = useState(VIEWS.IDLE)
  const [result,        setResult]        = useState(null)
  const [lastPayload,   setLastPayload]   = useState(null)
  const [error,         setError]         = useState(null)
  const [restaurantName, setRestaurantName] = useState('')

  const [restaurantLat, setRestaurantLat] = useState('')
  const [restaurantLon, setRestaurantLon] = useState('')
  const [deliveryLat,   setDeliveryLat]   = useState('')
  const [deliveryLon,   setDeliveryLon]   = useState('')
  const [activeSection, setActiveSection] = useState('Estimator')

  const handleSetRestaurant = (lat, lng) => {
    setRestaurantLat(lat.toFixed(4))
    setRestaurantLon(lng.toFixed(4))
  }

  const handleSetDelivery = (lat, lng) => {
    setDeliveryLat(lat.toFixed(4))
    setDeliveryLon(lng.toFixed(4))
  }

  const handleSubmit = async (payload) => {
    setError(null)
    setRestaurantName(payload.restaurant_name)
    setLastPayload(payload)
    setView(VIEWS.LOADING)
    try {
      const data = await estimateETA(payload)
      setResult(data)
      setView(VIEWS.RESULT)
    } catch (err) {
      const status = err.response?.status
      if (status === 422) {
        const detail = err.response.data?.detail
        setError(Array.isArray(detail) ? detail.map((d) => d.msg).join('. ') : 'Invalid input.')
      } else if (!err.response) {
        setError('Cannot reach the backend. Ensure the FastAPI server is running on port 8000.')
      } else {
        setError(err.response?.data?.detail || 'An unexpected error occurred.')
      }
      setView(VIEWS.IDLE)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setLastPayload(null)
    setRestaurantLat('')
    setRestaurantLon('')
    setDeliveryLat('')
    setDeliveryLon('')
    setView(VIEWS.IDLE)
  }

  const mapHeight = view === VIEWS.RESULT ? '420px' : '460px'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar
        theme={theme}
        onToggle={toggle}
        activeSection={activeSection}
        onNavClick={setActiveSection}
      />

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-6 py-6">
        {error && (
          <div
            className="flex items-center gap-2 text-sm mb-4 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs font-medium hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeSection === 'How it Works' ? (
          <HowItWorks />
        ) : activeSection === 'Features' ? (
          <FeaturesSection />
        ) : activeSection === 'About' ? (
          <AboutSection />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[35%] shrink-0" style={{ minHeight: '600px' }}>
              <SidebarForm
                onSubmit={handleSubmit}
                isLoading={view === VIEWS.LOADING}
                restaurantLat={restaurantLat}
                restaurantLon={restaurantLon}
                deliveryLat={deliveryLat}
                deliveryLon={deliveryLon}
                onRestaurantLatChange={setRestaurantLat}
                onRestaurantLonChange={setRestaurantLon}
                onDeliveryLatChange={setDeliveryLat}
                onDeliveryLonChange={setDeliveryLon}
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-5">
              <div style={{ height: mapHeight, minHeight: '380px', borderRadius: '12px', overflow: 'hidden' }}>
                <MapView
                  theme={theme}
                  restaurantLat={restaurantLat}
                  restaurantLon={restaurantLon}
                  deliveryLat={deliveryLat}
                  deliveryLon={deliveryLon}
                  distanceKm={result?.distance_km}
                  travelMin={result ? Math.round(result.eta_breakdown.base_travel_time + result.eta_breakdown.traffic_delay) : null}
                  onSetRestaurant={handleSetRestaurant}
                  onSetDelivery={handleSetDelivery}
                  onReset={handleReset}
                />
              </div>

              {view === VIEWS.LOADING && <LoadingSkeleton />}

              {view === VIEWS.RESULT && result && (
                <ETADashboard
                  result={result}
                  restaurantName={restaurantName}
                  payload={lastPayload}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} DeliverIQ — Foodhub Engineering
          </p>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:underline">API Docs</a>
            <a href="https://github.com/DurgamPoojitha/food-delivery-eta-estimator" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
