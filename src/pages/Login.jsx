import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FaceIDModal from '../components/FaceIDModal'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [faceID, setFaceID]   = useState(false)

  const handleSignIn = (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); navigate('/dashboard') }, 900)
  }

  const handleDemo = () => {
    setEmail('dispatch@hajjresponse.sa')
    setPassword('demo1234')
    setError('')
    setTimeout(() => navigate('/dashboard'), 700)
  }

  return (
    <>
      {faceID && <FaceIDModal target="/dashboard" onClose={() => setFaceID(false)} />}

      <div className="min-h-screen bg-[#0a1530] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-4">
              <span className="text-[#f59e0b] text-3xl">☪</span>
              HajjResponse
            </Link>
            <div className="flex justify-center">
              <span className="bg-[#0f1e45] border border-blue-400/30 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                Command Center Access
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#0f1e45] px-6 py-4 text-center">
              <h1 className="text-white font-bold text-lg">Staff Sign In</h1>
              <p className="text-white/50 text-xs mt-0.5">Dispatcher · Medical · Command</p>
            </div>

            <form onSubmit={handleSignIn} className="px-6 py-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@hajj.gov.sa"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e45] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e45] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f1e45] hover:bg-[#1a3060] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              {/* Face ID */}
              <button
                type="button"
                onClick={() => setFaceID(true)}
                className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-[#0f1e45] text-gray-600 hover:text-[#0f1e45] font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <span className="text-xl">🪪</span>
                Sign in with Face ID
                <span className="text-xs text-gray-400 font-normal">— device biometrics</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">or</div>
              </div>

              {/* Demo login */}
              <button
                type="button"
                onClick={handleDemo}
                className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                🚀 Demo Login — auto-fill & sign in
              </button>
            </form>

            <div className="px-6 pb-5 text-center">
              <p className="text-xs text-gray-400">
                Authorised medical and dispatch staff only.
                <br />Access is logged and audited.
              </p>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            Are you a pilgrim?{' '}
            <Link to="/register" className="text-green-400 hover:text-green-300 underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
