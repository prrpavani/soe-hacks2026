import { useEffect } from 'react'
import { X } from 'lucide-react'

const BG = {
  success: 'bg-green-900 border-green-700',
  warning: 'bg-amber-900 border-amber-700',
  error:   'bg-red-900   border-red-700',
  info:    'bg-indigo-900 border-indigo-700',
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    if (toast.duration === Infinity) return
    const t = setTimeout(onRemove, toast.duration ?? 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl text-white text-sm
        ${BG[toast.type] ?? BG.info} animate-fade-in`}
    >
      <p className="flex-1 leading-snug">{toast.message}</p>
      {toast.actions?.length > 0 && (
        <div className="flex flex-col gap-1 shrink-0">
          {toast.actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); onRemove() }}
              className="text-xs font-semibold underline text-left"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={onRemove} className="opacity-50 hover:opacity-100 shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  )
}

export function Toast({ toasts, removeToast }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-80 pointer-events-auto">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
      ))}
    </div>
  )
}
