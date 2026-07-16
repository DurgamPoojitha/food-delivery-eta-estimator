import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, useMapEvents, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, RotateCcw } from 'lucide-react'
import LocationMarker, { RESTAURANT_ICON, DELIVERY_ICON } from './LocationMarker'

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

const MapClickHandler = ({ onSetRestaurant, onSetDelivery, hasRestaurant, hasDelivery }) => {
  useMapEvents({
    click({ latlng: { lat, lng } }) {
      if (!hasRestaurant) onSetRestaurant(lat, lng)
      else if (!hasDelivery) onSetDelivery(lat, lng)
    },
  })
  return null
}

const AutoFitBounds = ({ restaurantPos, deliveryPos }) => {
  const map = useMap()
  useEffect(() => {
    if (restaurantPos && deliveryPos) {
      map.flyToBounds(L.latLngBounds([restaurantPos, deliveryPos]), { padding: [60, 60], duration: 1 })
    }
  }, [map, restaurantPos, deliveryPos])
  return null
}

const TileUpdater = ({ theme }) => {
  const map = useMap()
  useEffect(() => {
    map.eachLayer((layer) => { if (layer instanceof L.TileLayer) map.removeLayer(layer) })
    L.tileLayer(theme === 'dark' ? TILE_DARK : TILE_LIGHT, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
  }, [map, theme])
  return null
}

const MapView = ({
  theme,
  restaurantLat,
  restaurantLon,
  deliveryLat,
  deliveryLon,
  distanceKm,
  travelMin,
  onSetRestaurant,
  onSetDelivery,
  onReset,
}) => {
  const center = [17.385, 78.4867]

  const restaurantPos = restaurantLat !== '' && restaurantLon !== '' ? [Number(restaurantLat), Number(restaurantLon)] : null
  const deliveryPos   = deliveryLat   !== '' && deliveryLon   !== '' ? [Number(deliveryLat),   Number(deliveryLon)]   : null

  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(({ coords }) => onSetDelivery(coords.latitude, coords.longitude))
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
        className="w-full h-full animate-fade-in"
      >
        <TileUpdater theme={theme} />
        <ZoomControl position="topleft" />

        <MapClickHandler
          onSetRestaurant={onSetRestaurant}
          onSetDelivery={onSetDelivery}
          hasRestaurant={!!restaurantPos}
          hasDelivery={!!deliveryPos}
        />

        <AutoFitBounds restaurantPos={restaurantPos} deliveryPos={deliveryPos} />

        <LocationMarker position={restaurantPos} icon={RESTAURANT_ICON} onDragEnd={(e) => {
          const { lat, lng } = e.target.getLatLng()
          onSetRestaurant(lat, lng)
        }} />
        <LocationMarker position={deliveryPos} icon={DELIVERY_ICON} onDragEnd={(e) => {
          const { lat, lng } = e.target.getLatLng()
          onSetDelivery(lat, lng)
        }} />

        {restaurantPos && deliveryPos && (
          <Polyline
            positions={[restaurantPos, deliveryPos]}
            pathOptions={{ color: '#2563EB', weight: 4, opacity: 0.85 }}
          />
        )}
      </MapContainer>

      {restaurantPos && deliveryPos && distanceKm && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <div className="map-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            {distanceKm} km
          </div>
          {travelMin && (
            <div className="map-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {travelMin} min
            </div>
          )}
        </div>
      )}

      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2" style={{ right: restaurantPos && deliveryPos ? '100px' : '12px' }}>
        <button
          onClick={handleLocate}
          className="map-badge cursor-pointer hover:opacity-80 transition-opacity"
          title="Use my location"
        >
          <Navigation size={12} />
        </button>
        {(restaurantPos || deliveryPos) && (
          <button
            onClick={onReset}
            className="map-badge cursor-pointer hover:opacity-80 transition-opacity"
            title="Reset map"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {(!restaurantPos || !deliveryPos) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] map-badge text-xs pointer-events-none">
          {!restaurantPos ? 'Click map to place restaurant' : 'Click map to place customer'}
        </div>
      )}
    </div>
  )
}

export default MapView
