import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// target: '/sos' for pilgrims, '/dashboard' for staff
export default function FaceIDModal({ target, onClose }) {
  const navigate = useNavigate()
  // stages: 'scanning' → 'verified' → (navigate)
  const [stage, setStage] = useState('scanning')

  useEffect(() => {
    const t1 = setTimeout(() => setStage('verified'), 2200)
    const t2 = setTimeout(() => {
      onClose()
      navigate(target)
    }, 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [navigate, target, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center relative overflow-hidden">
        {/* Close */}
        {stage === 'scanning' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        )}

        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Sign in with Face ID
          </div>
          <div className="text-sm text-gray-500">Uses device biometrics</div>
        </div>

        {/* Face frame */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          {/* Corner brackets */}
          {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
            <div
              key={i}
              className={`absolute w-7 h-7 ${pos} ${
                stage === 'verified' ? 'border-green-500' : 'border-[#0f1e45]'
              } border-2 transition-colors duration-500 ${
                i === 0 ? 'border-r-0 border-b-0 rounded-tl-xl' :
                i === 1 ? 'border-l-0 border-b-0 rounded-tr-xl' :
                i === 2 ? 'border-r-0 border-t-0 rounded-bl-xl' :
                           'border-l-0 border-t-0 rounded-br-xl'
              }`}
            />
          ))}

          {/* Face icon */}
          <div className={`absolute inset-0 flex items-center justify-center text-6xl transition-all duration-500 ${
            stage === 'verified' ? 'scale-110' : ''
          }`}>
            {stage === 'verified' ? '😊' : '😐'}
          </div>

          {/* Scanning line */}
          {stage === 'scanning' && (
            <div
              className="absolute left-2 right-2 h-0.5 bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)] rounded-full"
              style={{
                animation: 'scanLine 2.2s ease-in-out infinite',
              }}
            />
          )}

          {/* Pulse rings when verified */}
          {stage === 'verified' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-60" />
              <div className="absolute inset-4 rounded-full border-2 border-green-300 animate-ping opacity-40" style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </div>

        {stage === 'scanning' ? (
          <>
            <div className="text-base font-semibold text-[#0f1e45] mb-1">Scanning…</div>
            <div className="text-sm text-gray-400">Look at your device camera</div>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 0.2, 0.4].map(d => (
                <div
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300"
                  style={{ animation: `bounce 1s ${d}s ease-in-out infinite` }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-xl font-bold text-green-600 mb-1">Identity Verified ✓</div>
            <div className="text-sm text-gray-400">Redirecting you now…</div>
          </>
        )}

        <style>{`
          @keyframes scanLine {
            0%   { top: 8px;   opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { top: calc(100% - 8px); opacity: 0; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-4px); }
          }
        `}</style>
      </div>
    </div>
  )
}
