import L from 'leaflet'
import { Marker } from 'react-leaflet'

export const RESTAURANT_ICON = L.divIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="width:12px;height:12px;background:#f97316;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(249,115,22,0.3)"></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

export const DELIVERY_ICON = L.divIcon({
  className: 'custom-pin-icon',
  html: `
    <div style="width:12px;height:12px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
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
