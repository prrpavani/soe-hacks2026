import { useState } from 'react'

const LEVELS = ['UG', 'Grad', 'PhD']

export function ProfileSetup({ onSave }) {
  const [form, setForm] = useState({
    full_name: '',
    pronouns: '',
    academic_level: '',
    ask_me_about: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('Name is required'); return }
    if (!form.academic_level)  { setError('Academic level is required'); return }
    setError('')
    setLoading(true)
    const { error: err } = await onSave(form)
    if (err) setError(err.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 select-none">👋</div>
          <h1 className="text-3xl font-bold text-white">Set Up Your Profile</h1>
          <p className="text-gray-400 mt-2">Let others know who you are</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Alex Kim"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                  focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
              />
            </div>

            {/* Pronouns */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Pronouns</label>
              <input
                type="text"
                value={form.pronouns}
                onChange={(e) => set('pronouns', e.target.value)}
                placeholder="they/them, she/her, he/him…"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                  focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
              />
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Academic Level <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => set('academic_level', level)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      form.academic_level === level
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Ask me about */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Ask me about…
              </label>
              <input
                type="text"
                value={form.ask_me_about}
                onChange={(e) => set('ask_me_about', e.target.value)}
                placeholder="Existentialism, best ramen spots, ML research…"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                  focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
              />
              <p className="text-xs text-gray-600 mt-1">
                Your conversation icebreaker — makes connections effortless
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Saving…' : 'Enter Campus →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
