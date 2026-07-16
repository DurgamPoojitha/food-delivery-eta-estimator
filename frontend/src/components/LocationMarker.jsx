import { Marker } from 'react-leaflet'
import L from 'leaflet'

export const createPinIcon = (colorClass) =>
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
    iconAnchor: [16, 32],
  })

export const RESTAURANT_ICON = createPinIcon('bg-brand-orange')
export const DELIVERY_ICON = createPinIcon('bg-blue-500')

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
