import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, OverlayViewF, OverlayView, useJsApiLoader } from '@react-google-maps/api'

const DEFAULT_CENTER = { lat: 35.7796, lng: -78.6782 } // NCSU

const TYPE_CONFIG = {
  Walk:    { color: '#22c55e', emoji: '🚶' },
  Mindful: { color: '#a855f7', emoji: '🧘' },
  Nourish: { color: '#f97316', emoji: '🥗' },
}

// Google Maps "Night Mode" dark style
const DARK_MAP_STYLES = [
  { elementType: 'geometry',              stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon',           stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',      stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke',    stylers: [{ color: '#212121' }] },
  { featureType: 'administrative',        elementType: 'geometry',            stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill',  stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi',                   elementType: 'labels.text.fill',    stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park',              elementType: 'geometry',            stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park',              elementType: 'labels.text.fill',    stylers: [{ color: '#616161' }] },
  { featureType: 'road',                  elementType: 'geometry.fill',       stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road',                  elementType: 'labels.text.fill',    stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial',         elementType: 'geometry',            stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway',          elementType: 'geometry',            stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access', elementType: 'geometry',   stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local',            elementType: 'labels.text.fill',    stylers: [{ color: '#616161' }] },
  { featureType: 'transit',               elementType: 'labels.text.fill',    stylers: [{ color: '#757575' }] },
  { featureType: 'water',                 elementType: 'geometry',            stylers: [{ color: '#000000' }] },
  { featureType: 'water',                 elementType: 'labels.text.fill',    stylers: [{ color: '#3d3d3d' }] },
]

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLES,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  zoomControlOptions: { position: 9 }, // RIGHT_BOTTOM
  clickableIcons: false,
}

// ── Custom emoji pin ─────────────────────────────────────────
function PinMarker({ hand, onClick }) {
  const { color, emoji } = TYPE_CONFIG[hand.type] ?? TYPE_CONFIG.Walk
  return (
    <div
      onClick={onClick}
      title={`${hand.type} — ${hand.profiles?.full_name ?? 'Unknown'}`}
      style={{
        width: 46, height: 46,
        borderRadius: '50%',
        background: color,
        border: '3px solid white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        userSelect: 'none',
        transform: 'translate(-50%, -50%)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(-50%, -50%)'
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)'
      }}
    >
      {emoji}
    </div>
  )
}

// ── Main map component ───────────────────────────────────────
export function MapView({ activeHands, onPinClick, onManualPin, manualPinMode, userLocation }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '',
  })

  const [map, setMap] = useState(null)

  // Pan to user location when geolocation resolves
  useEffect(() => {
    if (!map || !userLocation) return
    map.panTo({ lat: userLocation.lat, lng: userLocation.lng })
    map.setZoom(17)
  }, [userLocation, map])

  // Crosshair cursor in manual pin-drop mode
  useEffect(() => {
    if (!map) return
    map.setOptions({ draggableCursor: manualPinMode ? 'crosshair' : '' })
  }, [map, manualPinMode])

  const handleMapClick = useCallback(
    (e) => {
      if (manualPinMode) onManualPin(e.latLng.lat(), e.latLng.lng())
    },
    [manualPinMode, onManualPin]
  )

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 text-sm animate-pulse">Loading map…</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={DEFAULT_CENTER}
      zoom={15}
      options={MAP_OPTIONS}
      onLoad={setMap}
      onClick={handleMapClick}
    >
      {activeHands.map((hand) => (
        <OverlayViewF
          key={hand.id}
          position={{ lat: hand.lat, lng: hand.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <PinMarker hand={hand} onClick={() => onPinClick(hand)} />
        </OverlayViewF>
      ))}
    </GoogleMap>
  )
}
