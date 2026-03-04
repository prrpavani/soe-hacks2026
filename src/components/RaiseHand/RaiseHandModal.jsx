import { useState } from 'react'
import { X, Clock, Users, MapPin } from 'lucide-react'

const ACTIVITY_TYPES = [
  { value: 'Walk',    label: 'Walk / Run',     icon: '🚶', active: 'bg-green-700  border-green-500',  desc: 'A quick walk, jog, or stroll'  },
  { value: 'Mindful', label: 'Mindful Break',  icon: '🧘', active: 'bg-purple-700 border-purple-500', desc: 'Meditation, breathing, chill'   },
  { value: 'Nourish', label: 'Healthy Meal',   icon: '🥗', active: 'bg-orange-700 border-orange-500', desc: 'Dining hall or healthy spot'    },
]

const DURATION_STEPS = [15, 30, 45, 60, 90, 120]

export function RaiseHandModal({ onClose, onSubmit, userLocation, onRequestManualPin }) {
  const [type,         setType]         = useState('')
  const [duration,     setDuration]     = useState(30)
  const [capacity,     setCapacity]     = useState(2)
  const [description,  setDescription]  = useState('')
  const [locationName, setLocationName] = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!type) { setError('Please choose an activity type'); return }
    if (!userLocation) { setError('Location required — drop a pin on the map first'); return }

    setLoading(true)
    setError('')

    const expiresAt = new Date(Date.now() + duration * 60_000).toISOString()
    const { error: err } = await onSubmit({
      type,
      duration,
      expires_at:    expiresAt,
      lat:           userLocation.lat,
      lng:           userLocation.lng,
      capacity,
      description:   description.trim() || null,
      location_name: locationName.trim() || 'Campus',
    })

    if (err) setError(err.message)
    else onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-gray-900 rounded-t-3xl sm:rounded-2xl border border-gray-700 w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-white">Post Your Activity 🌿</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-5">
          {/* Activity type */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">What healthy activity?</p>
            <div className="space-y-2">
              {ACTIVITY_TYPES.map((act) => (
                <button
                  key={act.value}
                  type="button"
                  onClick={() => setType(act.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    type === act.value
                      ? `${act.active} text-white`
                      : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl shrink-0">{act.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{act.label}</p>
                    <p className="text-xs opacity-70">{act.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Clock size={13} /> Duration
              </p>
              <span className="text-indigo-400 font-semibold text-sm">
                {duration >= 60 ? `${duration / 60}h` : `${duration}m`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={DURATION_STEPS.length - 1}
              step={1}
              value={DURATION_STEPS.indexOf(duration)}
              onChange={(e) => setDuration(DURATION_STEPS[Number(e.target.value)])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1 px-0.5">
              {DURATION_STEPS.map((s) => (
                <span key={s}>{s >= 60 ? `${s / 60}h` : `${s}m`}</span>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <p className="text-sm font-medium text-gray-300 flex items-center gap-1.5 mb-2">
              <Users size={13} /> Available seats
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCapacity(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    capacity === n
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Location name */}
          <div>
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5 mb-1.5">
              <MapPin size={13} /> Where exactly?
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Carmichael Gym, Greenway trail, Talley dining…"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
            />
          </div>

          {/* Vibe / description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Vibe <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Heading to the Greenway, going slow, all welcome…"
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm resize-none"
            />
          </div>

          {/* Location status */}
          {userLocation ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <MapPin size={14} />
              <span>
                Location set ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-amber-900/30 border border-amber-800 rounded-xl px-4 py-3">
              <p className="text-amber-400 text-sm">GPS not detected</p>
              <button
                type="button"
                onClick={onRequestManualPin}
                className="text-amber-300 text-sm font-semibold underline"
              >
                Drop pin on map
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !type}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40
              text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? 'Posting…' : '🌿 Post Activity'}
          </button>
        </form>
      </div>
    </div>
  )
}
