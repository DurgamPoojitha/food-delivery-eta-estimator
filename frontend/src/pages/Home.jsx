import { useState } from 'react'
import Navbar         from '../components/Navbar'
import MapSelector    from '../components/MapSelector'
import InputCard      from '../components/InputCard'
import ETAResult      from '../components/ETAResult'
import LoadingSpinner from '../components/LoadingSpinner'
import Footer         from '../components/Footer'
import { estimateETA } from '../services/api'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

const VIEWS = Object.freeze({ FORM: 'form', LOADING: 'loading', RESULT: 'result' })

const Home = () => {
  const [view,           setView]           = useState(VIEWS.FORM)
  const [result,         setResult]         = useState(null)
  const [error,          setError]          = useState(null)
  const [restaurantName, setRestaurantName] = useState('')

  const [restaurantLat, setRestaurantLat] = useState('')
  const [restaurantLon, setRestaurantLon] = useState('')
  const [deliveryLat,   setDeliveryLat]   = useState('')
  const [deliveryLon,   setDeliveryLon]   = useState('')

  const handleSetRestaurant = (lat, lng) => {
    setRestaurantLat(lat.toFixed(6))
    setRestaurantLon(lng.toFixed(6))
  }

  const handleSetDelivery = (lat, lng) => {
    setDeliveryLat(lat.toFixed(6))
    setDeliveryLon(lng.toFixed(6))
  }

  const handleSubmit = async (payload) => {
    setError(null)
    setRestaurantName(payload.restaurant_name)
    setView(VIEWS.LOADING)
    try {
      const data = await estimateETA(payload)
      setResult(data)
      setView(VIEWS.RESULT)
    } catch (err) {
      const status = err.response?.status
      if (status === 422) {
        const detail = err.response.data?.detail
        setError(Array.isArray(detail) ? detail.map((d) => d.msg).join('. ') : 'Invalid input. Check your values.')
      } else if (!err.response) {
        setError('Cannot reach the backend. Ensure the FastAPI server is running on port 8000.')
      } else {
        setError(err.response?.data?.detail || 'An unexpected error occurred.')
      }
      setView(VIEWS.FORM)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setRestaurantLat('')
    setRestaurantLon('')
    setDeliveryLat('')
    setDeliveryLon('')
    setView(VIEWS.FORM)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-gray-100">Food Delivery ETA Estimator</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Estimate delivery time using distance, traffic, preparation time, and weather conditions.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Haversine distance</span>
            <span className="text-gray-700">·</span>
            <span>OpenWeatherMap</span>
            <span className="text-gray-700">·</span>
            <span>Redis cache</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="flex-1 min-w-0 relative">
          <MapSelector
            restaurantLat={restaurantLat}
            restaurantLon={restaurantLon}
            deliveryLat={deliveryLat}
            deliveryLon={deliveryLon}
            onSetRestaurant={handleSetRestaurant}
            onSetDelivery={handleSetDelivery}
            onReset={handleReset}
          />
        </div>

        <div className="w-[380px] shrink-0 border-l border-gray-800 bg-gray-950 overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {view === VIEWS.LOADING && (
              <div className="panel px-4 py-6 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}

            {view !== VIEWS.LOADING && (
              <InputCard
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
            )}

            {view === VIEWS.RESULT && result && (
              <ETAResult result={result} restaurantName={restaurantName} onReset={handleReset} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home
