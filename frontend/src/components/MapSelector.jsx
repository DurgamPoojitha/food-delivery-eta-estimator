import { useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { MapPinIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

import LocationMarker, { RESTAURANT_ICON, DELIVERY_ICON } from './LocationMarker'
import RouteLine from './RouteLine'

const MapInteractions = ({ onSetRestaurant, onSetDelivery, hasRestaurant, hasDelivery }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (!hasRestaurant) {
        onSetRestaurant(lat, lng)
      } else if (!hasDelivery) {
        onSetDelivery(lat, lng)
      }
    },
  })
  return null
}

const FitBounds = ({ restaurantPos, deliveryPos }) => {
  const map = useMap()
  useEffect(() => {
    if (restaurantPos && deliveryPos) {
      const bounds = L.latLngBounds([restaurantPos, deliveryPos])
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 })
    }
  }, [map, restaurantPos, deliveryPos])
  return null
}

const LocateMeControl = ({ onLocate }) => {
  const map = useMap()

  const handleLocate = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          onLocate(lat, lng)
          map.flyTo([lat, lng], 15, { duration: 1.5 })
        },
        () => {
          alert('Unable to retrieve your location')
        }
      )
    }
  }

  return (
    <div className="leaflet-top leaflet-right mt-2 mr-2 z-[400] absolute right-2 top-2">
      <button 
        onClick={handleLocate}
        className="bg-slate-800 border border-slate-700 text-brand-orange p-2 rounded-lg shadow-lg hover:bg-slate-700 transition-colors flex items-center justify-center group"
        title="Locate Me"
      >
        <MapPinIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )
}

const ResetControl = ({ onReset }) => {
  return (
    <div className="leaflet-bottom leaflet-right mb-2 mr-2 z-[400] absolute right-2 bottom-2">
      <button 
        onClick={onReset}
        className="bg-slate-800 border border-slate-700 text-slate-300 p-2 rounded-lg shadow-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center group"
        title="Reset Map"
      >
        <ArrowPathIcon className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
      </button>
    </div>
  )
}

const MapSelector = ({
  restaurantLat,
  restaurantLon,
  deliveryLat,
  deliveryLon,
  onSetRestaurant,
  onSetDelivery,
  onReset
}) => {
  const center = [51.5074, -0.1278]

  const restaurantPos = (restaurantLat !== '' && restaurantLon !== '') ? [restaurantLat, restaurantLon] : null
  const deliveryPos   = (deliveryLat !== '' && deliveryLon !== '')     ? [deliveryLat, deliveryLon]     : null

  const handleRestaurantDragEnd = (e) => {
    const latlng = e.target.getLatLng()
    onSetRestaurant(latlng.lat, latlng.lng)
  }

  const handleDeliveryDragEnd = (e) => {
    const latlng = e.target.getLatLng()
    onSetDelivery(latlng.lat, latlng.lng)
  }

  return (
    <div className="w-full h-[500px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-[120px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-0 relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full bg-slate-900"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position="topleft" />

        <MapInteractions 
          onSetRestaurant={onSetRestaurant}
          onSetDelivery={onSetDelivery}
          hasRestaurant={!!restaurantPos}
          hasDelivery={!!deliveryPos}
        />
        
        <FitBounds restaurantPos={restaurantPos} deliveryPos={deliveryPos} />
        
        <LocateMeControl onLocate={onSetDelivery} />
        <ResetControl onReset={onReset} />

        <LocationMarker 
          position={restaurantPos} 
          icon={RESTAURANT_ICON} 
          onDragEnd={handleRestaurantDragEnd} 
        />
        
        <LocationMarker 
          position={deliveryPos} 
          icon={DELIVERY_ICON} 
          onDragEnd={handleDeliveryDragEnd} 
        />

        <RouteLine startPos={restaurantPos} endPos={deliveryPos} />
      </MapContainer>

      {(!restaurantPos || !deliveryPos) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] glass-panel px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-brand-orange animate-pulse pointer-events-none">
          {!restaurantPos ? 'Tap to place Restaurant' : 'Tap to place Customer'}
        </div>
      )}
    </div>
  )
}

export default MapSelector
