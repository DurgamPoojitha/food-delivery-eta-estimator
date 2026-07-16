import { Polyline } from 'react-leaflet'

const RouteLine = ({ startPos, endPos }) => {
  if (!startPos || !endPos) return null

  return (
    <Polyline 
      positions={[startPos, endPos]} 
      pathOptions={{ color: '#ff6b00', weight: 3, dashArray: '8, 8', opacity: 0.8 }} 
    />
  )
}

export default RouteLine
