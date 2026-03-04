import { useState, useCallback, useEffect } from 'react'
import { useAuth }        from './hooks/useAuth'
import { useLocation }    from './hooks/useLocation'
import { useActiveHands } from './hooks/useActiveHands'
import { AuthPage }       from './components/Auth/AuthPage'
import { ProfileSetup }   from './components/Profile/ProfileSetup'
import { MapView }        from './components/Map/MapView'
import { FAB }            from './components/RaiseHand/FAB'
import { RaiseHandModal } from './components/RaiseHand/RaiseHandModal'
import { PinBottomSheet } from './components/PinDetail/PinBottomSheet'
import { MessageThread }  from './components/Messages/MessageThread'
import { Toast }          from './components/UI/Toast'

// ── Toast helpers ─────────────────────────────────────────────
let toastId = 0
function useToasts() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((t) => {
    setToasts((prev) => [...prev, { ...t, id: ++toastId }])
  }, [])
  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  return { toasts, add, remove }
}

export default function App() {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth()
  const { location, manualMode, requestLocation, setManualLocation, setManualMode } = useLocation()
  const { toasts, add: addToast, remove: removeToast } = useToasts()

  // ── Active hands – expiry warning ───────────────────────
  const handleExpirySoon = useCallback(
    (hand) => {
      if (hand.user_id !== user?.id) return
      addToast({
        type: 'warning',
        message: '⏰ Your session ends in 2 minutes! Tap your hand to extend.',
        duration: 12000,
      })
    },
    [user?.id, addToast]
  )

  const { activeHands, createHand, deleteHand, extendHand } = useActiveHands(handleExpirySoon)

  // ── UI state ──────────────────────────────────────────────
  const [showRaiseModal, setShowRaiseModal] = useState(false)
  const [selectedPin,    setSelectedPin]    = useState(null)
  const [messageTarget,  setMessageTarget]  = useState(null)
  const [manualPinMode,  setManualPinMode]  = useState(false)

  const myActiveHand = activeHands.find((h) => h.user_id === user?.id)

  // Request location on mount so it's ready when the user raises a hand
  useEffect(() => {
    if (user && !location) requestLocation()
  }, [user])

  // ── Handlers ─────────────────────────────────────────────
  const handleFABClick = () => {
    if (myActiveHand) {
      // Show own pin details
      setSelectedPin(myActiveHand)
    } else {
      if (!location) requestLocation()
      setShowRaiseModal(true)
    }
  }

  const handleRaiseHandSubmit = async (data) => {
    const result = await createHand({ ...data, user_id: user.id })
    if (!result.error) {
      addToast({ type: 'success', message: '🌿 Activity posted! Others can see you on the map.' })
    }
    return result
  }

  const handleManualPinRequest = () => {
    setShowRaiseModal(false)
    setManualPinMode(true)
    addToast({ type: 'info', message: '📍 Tap anywhere on the map to drop your pin.', duration: 6000 })
  }

  const handleManualPin = (lat, lng) => {
    setManualLocation(lat, lng)
    setManualPinMode(false)
    setShowRaiseModal(true)
  }

  const handleExtend = async () => {
    if (!selectedPin) return
    await extendHand(selectedPin.id)
    setSelectedPin(null)
    addToast({ type: 'success', message: '⏱ Session extended by 15 minutes!' })
  }

  const handleDelete = async () => {
    if (!selectedPin) return
    await deleteHand(selectedPin.id)
    setSelectedPin(null)
    addToast({ type: 'info', message: 'Activity cleared. Stay active!' })
  }

  // ── Render ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} />
  }

  if (!profile) {
    return <ProfileSetup onSave={updateProfile} />
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950">
      {/* ── Map ── */}
      <MapView
        activeHands={activeHands}
        onPinClick={setSelectedPin}
        onManualPin={handleManualPin}
        manualPinMode={manualPinMode}
        userLocation={location}
      />

      {/* ── Top-right: profile / sign-out ── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300">
          {profile.full_name}
        </div>
        <button
          onClick={signOut}
          className="bg-gray-900/90 backdrop-blur border border-gray-700 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* ── Map legend ── */}
      <div className="absolute top-4 left-4 z-20 bg-gray-900/90 backdrop-blur rounded-xl border border-gray-700 px-3 py-3 space-y-1.5">
        {[
          { dot: 'bg-green-500',  label: 'Walk'    },
          { dot: 'bg-purple-500', label: 'Mindful' },
          { dot: 'bg-orange-500', label: 'Meal'    },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-gray-300">
            <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
            {label}
          </div>
        ))}
      </div>

      {/* ── Manual-pin overlay ── */}
      {manualPinMode && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-900/90 text-amber-100 text-sm px-5 py-2.5 rounded-2xl border border-amber-700 shadow-lg pointer-events-none">
          Tap the map to drop your location
        </div>
      )}

      {/* ── Active sessions count ── */}
      {activeHands.length > 0 && (
        <div className="absolute bottom-8 left-6 z-20 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-300">
          {activeHands.length} {activeHands.length === 1 ? 'person' : 'people'} staying active near you
        </div>
      )}

      {/* ── FAB ── */}
      <FAB onClick={handleFABClick} hasActiveHand={!!myActiveHand} />

      {/* ── Raise Hand Modal ── */}
      {showRaiseModal && (
        <RaiseHandModal
          onClose={() => setShowRaiseModal(false)}
          onSubmit={handleRaiseHandSubmit}
          userLocation={location}
          onRequestManualPin={handleManualPinRequest}
        />
      )}

      {/* ── Pin bottom sheet ── */}
      {selectedPin && !showRaiseModal && (
        <PinBottomSheet
          hand={selectedPin}
          isOwnPin={selectedPin.user_id === user.id}
          onClose={() => setSelectedPin(null)}
          onMessage={(targetProfile) => {
            setSelectedPin(null)
            setMessageTarget(targetProfile)
          }}
          onExtend={handleExtend}
          onDelete={handleDelete}
        />
      )}

      {/* ── Direct messages ── */}
      {messageTarget && (
        <MessageThread
          currentUser={user}
          otherProfile={messageTarget}
          onClose={() => setMessageTarget(null)}
        />
      )}

      {/* ── Toasts ── */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
