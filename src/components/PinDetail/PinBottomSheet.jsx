import { X, Clock, Users, MapPin, MessageCircle, Flag } from 'lucide-react'

const TYPE_INFO = {
  Walk:    { bg: 'bg-green-600',  text: 'text-green-400',  label: 'Walk / Run',    icon: '🚶' },
  Mindful: { bg: 'bg-purple-600', text: 'text-purple-400', label: 'Mindful Break', icon: '🧘' },
  Nourish: { bg: 'bg-orange-600', text: 'text-orange-400', label: 'Healthy Meal',  icon: '🥗' },
}

function timeLeft(expiresAt) {
  const diff = new Date(expiresAt) - Date.now()
  if (diff <= 0) return 'Expired'
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  return hours > 0 ? `${hours}h ${mins % 60}m left` : `${mins}m left`
}

export function PinBottomSheet({ hand, isOwnPin, onClose, onMessage, onDelete, onExtend }) {
  const profile = hand.profiles
  const info    = TYPE_INFO[hand.type] ?? TYPE_INFO.Walk

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 rounded-t-3xl border-t border-gray-700 shadow-2xl">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-600 rounded-full" />
      </div>

      <div className="px-6 pb-10 pt-3">
        <div className="flex justify-end mb-3">
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Type badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-white mb-4 ${info.bg}`}>
          <span>{info.icon}</span>
          <span>{info.label}</span>
        </div>

        {/* Host info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-indigo-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{profile?.full_name ?? 'Unknown'}</h3>
            {profile?.pronouns && (
              <p className="text-gray-500 text-sm">{profile.pronouns}</p>
            )}
            {profile?.academic_level && (
              <span className="inline-block mt-1 bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                {profile.academic_level}
              </span>
            )}
          </div>
        </div>

        {/* Ask me about */}
        {profile?.ask_me_about && (
          <div className="bg-gray-800 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-gray-500 mb-0.5">Ask me about…</p>
            <p className="text-gray-200 text-sm">{profile.ask_me_about}</p>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock  size={14} className={info.text} />
            <span>{timeLeft(hand.expires_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users  size={14} className={info.text} />
            <span>{hand.capacity} {hand.capacity === 1 ? 'seat' : 'seats'}</span>
          </div>
          {hand.location_name && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className={info.text} />
              <span>{hand.location_name}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {hand.description && (
          <p className="text-gray-300 text-sm bg-gray-800 rounded-xl px-4 py-3 mb-4">
            {hand.description}
          </p>
        )}

        {/* Actions */}
        {isOwnPin ? (
          <div className="flex gap-3">
            <button
              onClick={onExtend}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Extend +15 min
            </button>
            <button
              onClick={onDelete}
              className="flex-1 bg-gray-800 hover:bg-red-900/40 text-red-400 font-semibold py-3 rounded-xl border border-gray-700 transition-colors text-sm"
            >
              Lower Hand
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => onMessage(profile)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={16} />
              Request to Join
            </button>
            <button
              title="Report user"
              className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Flag size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
