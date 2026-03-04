import { useState, useCallback } from 'react'

export function useLocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [manualMode, setManualMode] = useState(false)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setManualMode(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setManualMode(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setManualMode(true)
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    )
  }, [])

  const setManualLocation = useCallback((lat, lng) => {
    setLocation({ lat, lng })
    setManualMode(false)
  }, [])

  return { location, error, manualMode, requestLocation, setManualLocation, setManualMode }
}
