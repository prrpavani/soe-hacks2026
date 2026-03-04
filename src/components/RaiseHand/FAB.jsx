import { Plus } from 'lucide-react'

export function FAB({ onClick, hasActiveHand }) {
  return (
    <button
      onClick={onClick}
      title={hasActiveHand ? 'Your active session' : 'Raise your hand'}
      className={`fixed bottom-8 right-6 z-30 w-16 h-16 rounded-full shadow-2xl
        flex items-center justify-center transition-all active:scale-95
        ${hasActiveHand
          ? 'bg-amber-500 hover:bg-amber-400 ring-4 ring-amber-400/30'
          : 'bg-indigo-600 hover:bg-indigo-500 ring-4 ring-indigo-500/30'
        }`}
    >
      {hasActiveHand
        ? <span className="text-2xl select-none">✋</span>
        : <Plus size={28} strokeWidth={2.5} className="text-white" />
      }
    </button>
  )
}
