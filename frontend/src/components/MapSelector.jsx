import { useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import LocationMarker, { RESTAURANT_ICON, DELIVERY_ICON } from './LocationMarker'
import RouteLine from './RouteLine'

const MapClickHandler = ({ onSetRestaurant, onSetDelivery, hasRestaurant, hasDelivery }) => {
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

const AutoFitBounds = ({ restaurantPos, deliveryPos }) => {
  const map = useMap()
  useEffect(() => {
    if (restaurantPos && deliveryPos) {
      const bounds = L.latLngBounds([restaurantPos, deliveryPos])
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 })
    }
  }, [map, restaurantPos, deliveryPos])
  return null
}

const MapSelector = ({
  restaurantLat,
  restaurantLon,
  deliveryLat,
  deliveryLon,
  onSetRestaurant,
  onSetDelivery,
  onReset,
}) => {
  const center = [51.5074, -0.1278]

  const restaurantPos = restaurantLat !== '' && restaurantLon !== '' ? [Number(restaurantLat), Number(restaurantLon)] : null
  const deliveryPos   = deliveryLat !== '' && deliveryLon !== ''     ? [Number(deliveryLat), Number(deliveryLon)]     : null

  const handleRestaurantDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng()
    onSetRestaurant(lat, lng)
  }

  const handleDeliveryDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng()
    onSetDelivery(lat, lng)
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => onSetDelivery(coords.latitude, coords.longitude),
      () => {}
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#030712' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position="bottomright" />

        <MapClickHandler
          onSetRestaurant={onSetRestaurant}
          onSetDelivery={onSetDelivery}
          hasRestaurant={!!restaurantPos}
          hasDelivery={!!deliveryPos}
        />

        <AutoFitBounds restaurantPos={restaurantPos} deliveryPos={deliveryPos} />

        <LocationMarker position={restaurantPos} icon={RESTAURANT_ICON} onDragEnd={handleRestaurantDragEnd} />
        <LocationMarker position={deliveryPos}   icon={DELIVERY_ICON}   onDragEnd={handleDeliveryDragEnd} />

        <RouteLine startPos={restaurantPos} endPos={deliveryPos} />
      </MapContainer>

      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        {(!restaurantPos || !deliveryPos) && (
          <div className="bg-gray-900/90 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
            {!restaurantPos ? 'Click to place restaurant' : 'Click to place customer'}
          </div>
        )}
        {(restaurantPos || deliveryPos) && (
          <div className="flex gap-2">
            {restaurantPos && (
              <span className="flex items-center gap-1 text-xs bg-gray-900/90 border border-gray-700 px-2 py-1 rounded-lg text-gray-300">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Restaurant
              </span>
            )}
            {deliveryPos && (
              <span className="flex items-center gap-1 text-xs bg-gray-900/90 border border-gray-700 px-2 py-1 rounded-lg text-gray-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Customer
              </span>
            )}
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex gap-2">
        <button
          onClick={handleLocateMe}
          className="bg-gray-900/90 border border-gray-700 text-gray-300 hover:text-gray-100 hover:border-gray-600 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
          title="Use my location as customer"
        >
          Locate me
        </button>
        {(restaurantPos || deliveryPos) && (
          <button
            onClick={onReset}
            className="bg-gray-900/90 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/50 text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export default MapSelector
