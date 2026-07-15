import { useState } from 'react'
import Navbar         from '../components/Navbar'
import Hero           from '../components/Hero'
import InputCard      from '../components/InputCard'
import ResultCard     from '../components/ResultCard'
import LoadingSpinner from '../components/LoadingSpinner'
import DeliveryMap    from '../components/DeliveryMap'
import Footer         from '../components/Footer'
import { estimateETA } from '../services/api'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const VIEWS = Object.freeze({
  FORM:    'form',
  LOADING: 'loading',
  RESULT:  'result',
})

const Home = () => {
  const [view,           setView]           = useState(VIEWS.FORM)
  const [result,         setResult]         = useState(null)
  const [error,          setError]          = useState(null)
  const [restaurantName, setRestaurantName] = useState('')

  const [restaurantLat, setRestaurantLat] = useState('')
  const [restaurantLon, setRestaurantLon] = useState('')
  const [deliveryLat,   setDeliveryLat]   = useState('')
  const [deliveryLon,   setDeliveryLon]   = useState('')

  const handleSetRestaurant = (lat, lon) => {
    setRestaurantLat(lat.toFixed(5))
    setRestaurantLon(lon.toFixed(5))
  }

  const handleSetDelivery = (lat, lon) => {
    setDeliveryLat(lat.toFixed(5))
    setDeliveryLon(lon.toFixed(5))
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
      if (err.response?.status === 422) {
        const detail = err.response.data?.detail
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join('. '))
        } else {
          setError('Invalid input. Please check your coordinates and values.')
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.')
      } else if (!err.response) {
        setError('Cannot reach the DeliverIQ server. Make sure the backend is running on port 8000.')
      } else {
        setError(err.response?.data?.detail || 'An unexpected error occurred. Please try again.')
      }
      setView(VIEWS.FORM)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setView(VIEWS.FORM)
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-hero-gradient selection:bg-brand-orange/30 selection:text-brand-orange">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view !== VIEWS.RESULT && <Hero />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
          
          
          <DeliveryMap 
            restaurantLat={restaurantLat}
            restaurantLon={restaurantLon}
            deliveryLat={deliveryLat}
            deliveryLon={deliveryLon}
            onSetRestaurant={handleSetRestaurant}
            onSetDelivery={handleSetDelivery}
          />

          
          <div className="flex flex-col gap-8">
            {view === VIEWS.LOADING && (
              <div className="glass-panel rounded-3xl p-16 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
              </div>
            )}
            
            {view === VIEWS.FORM && (
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

            {error && view === VIEWS.FORM && (
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 animate-fade-in flex items-start gap-4 shadow-lg" role="alert">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 text-red-400">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                </div>
                <div className="pt-0.5">
                  <p className="text-red-400 font-bold text-sm tracking-wide">Estimation Failed</p>
                  <p className="text-red-300/80 text-sm mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {view === VIEWS.RESULT && result && (
              <ResultCard result={result} restaurantName={restaurantName} onReset={handleReset} />
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Home
