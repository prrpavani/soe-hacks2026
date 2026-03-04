import { useState } from 'react'

export function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (m) => { setMode(m); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error: err } = await onSignIn(email, password)
        if (err) setError(err.message)
      } else {
        const { error: err } = await onSignUp(email, password)
        if (err) setError(err.message)
        // no email confirmation — onAuthStateChange in useAuth picks up the session immediately
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 select-none">🌿</div>
          <h1 className="text-4xl font-bold text-white tracking-tight">OpenSeat</h1>
          <p className="text-gray-400 mt-2">Find your wellness crew. Right now. On campus.</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1 mb-6">
            {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                  focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3
                  focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-4">
            University (.edu) email required · No spam, ever
          </p>

          {/* Demo shortcut */}
          <div className="mt-5 pt-5 border-t border-gray-800">
            <p className="text-center text-xs text-gray-600 mb-3">Hackathon demo?</p>
            <button
              type="button"
              onClick={() => {
                setEmail('demo@ncsu.edu')
                setPassword('OpenTable2026!')
                setMode('signin')
                setError('')
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700
                text-gray-300 text-sm py-2.5 rounded-xl transition-colors"
            >
              ⚡ Load Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
