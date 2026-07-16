import L from 'leaflet'
import { Marker } from 'react-leaflet'

export const RESTAURANT_ICON = L.divIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="position:relative;width:36px;height:42px;">
      <svg viewBox="0 0 36 42" width="36" height="42" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.059 0 0 8.059 0 18c0 12.314 18 24 18 24S36 30.314 36 18C36 8.059 27.941 0 18 0z" fill="#EF4444"/>
        <circle cx="18" cy="18" r="8" fill="white"/>
        <path d="M13 15h10M15 13v2M21 13v2M14 17a4 4 0 0 0 8 0" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
})

export const DELIVERY_ICON = L.divIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="position:relative;width:36px;height:42px;">
      <svg viewBox="0 0 36 42" width="36" height="42" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.059 0 0 8.059 0 18c0 12.314 18 24 18 24S36 30.314 36 18C36 8.059 27.941 0 18 0z" fill="#2563EB"/>
        <circle cx="18" cy="18" r="8" fill="white"/>
        <path d="M15 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM11 18h4M21 18h4" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
})

const LocationMarker = ({ position, icon, onDragEnd }) => {
  if (!position) return null
  return (
    <Marker
      position={position}
      icon={icon}
      draggable={true}
      eventHandlers={{ dragend: onDragEnd }}
    />
  )
}

export default LocationMarker
