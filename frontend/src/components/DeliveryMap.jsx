/**
 * components/DeliveryMap.jsx
 * ==========================
 * Interactive map for placing and dragging restaurant/delivery locations.
 */

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

// ── Custom Markers ────────────────────────────────────────────────────────────
// By default, Leaflet's marker images break in Vite without specific config.
// Using custom HTML markers is cleaner and allows us to use Tailwind + Heroicons styles.
const createPinIcon = (colorClass) =>
  L.divIcon({
    className: 'custom-pin-icon',
    html: `
      <div class="relative w-8 h-8 -mt-8 -ml-4 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full ${colorClass} opacity-20 animate-ping"></div>
        <div class="relative w-5 h-5 rounded-full ${colorClass} border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
        <div class="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[8px] border-l-transparent border-r-transparent ${colorClass.replace('bg-', 'border-t-')} drop-shadow-md"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Anchor at the bottom tip
  })

const RESTAURANT_ICON = createPinIcon('bg-brand-orange')
const DELIVERY_ICON   = createPinIcon('bg-blue-500')

// ── Map Interactions ──────────────────────────────────────────────────────────
const MapInteractions = ({ onSetRestaurant, onSetDelivery, hasRestaurant, hasDelivery }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (!hasRestaurant) {
        onSetRestaurant(lat, lng)
      } else if (!hasDelivery) {
        onSetDelivery(lat, lng)
      }
      // If both exist, we ignore clicks (users can drag the markers instead)
    },
  })
  return null
}

const FitBounds = ({ restaurantPos, deliveryPos }) => {
  const map = useMap()
  useEffect(() => {
    if (restaurantPos && deliveryPos) {
      const bounds = L.latLngBounds([restaurantPos, deliveryPos])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (restaurantPos) {
      map.setView(restaurantPos, 14)
    } else if (deliveryPos) {
      map.setView(deliveryPos, 14)
    }
  }, [map, restaurantPos, deliveryPos])
  return null
}

// ── Main Component ────────────────────────────────────────────────────────────
const DeliveryMap = ({
  restaurantLat,
  restaurantLon,
  deliveryLat,
  deliveryLon,
  onSetRestaurant,
  onSetDelivery
}) => {
  // Default to London if nothing is set
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
    <div className="w-full h-[500px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-[120px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full bg-slate-900"
      >
        {/* Dark Mode Tiles from CartoDB */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapInteractions 
          onSetRestaurant={onSetRestaurant}
          onSetDelivery={onSetDelivery}
          hasRestaurant={!!restaurantPos}
          hasDelivery={!!deliveryPos}
        />
        
        <FitBounds restaurantPos={restaurantPos} deliveryPos={deliveryPos} />

        {restaurantPos && (
          <Marker 
            position={restaurantPos} 
            icon={RESTAURANT_ICON}
            draggable={true}
            eventHandlers={{ dragend: handleRestaurantDragEnd }}
          />
        )}
        
        {deliveryPos && (
          <Marker 
            position={deliveryPos} 
            icon={DELIVERY_ICON}
            draggable={true}
            eventHandlers={{ dragend: handleDeliveryDragEnd }}
          />
        )}

        {restaurantPos && deliveryPos && (
          <Polyline 
            positions={[restaurantPos, deliveryPos]} 
            pathOptions={{ color: '#ff6b00', weight: 3, dashArray: '8, 8', opacity: 0.8 }} 
          />
        )}
      </MapContainer>

      {/* Helper Overlay */}
      {(!restaurantPos || !deliveryPos) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] glass-panel px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-brand-orange animate-pulse">
          {!restaurantPos ? 'Tap to place Restaurant' : 'Tap to place Customer'}
        </div>
      )}
    </div>
  )
}

export default DeliveryMap
