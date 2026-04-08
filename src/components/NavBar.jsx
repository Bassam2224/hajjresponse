import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FaceIDModal from './FaceIDModal'

const pilgrimLinks = [
  { to: '/register', label: 'Register'      },
  { to: '/sos',      label: 'SOS'           },
  { to: '/profile',  label: 'My Profile'    },
]

const commandLinks = [
  { to: '/dashboard',    label: 'Dashboard'    },
  { to: '/architecture', label: 'Architecture' },
  { to: '/impact',       label: 'Impact'       },
  { to: '/login',        label: 'Staff Login'  },
]

function NavLink({ to, label, pathname }) {
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`px-2.5 py-1.5 rounded text-sm transition-colors whitespace-nowrap ${
        active
          ? 'bg-white/20 text-white font-semibold'
          : 'text-white/65 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  )
}

export default function NavBar() {
  const { pathname } = useLocation()
  const [faceID, setFaceID] = useState(false)

  return (
    <>
      {faceID && <FaceIDModal target="/sos" onClose={() => setFaceID(false)} />}

      <nav className="bg-[#0f1e45] text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-base tracking-tight flex-shrink-0">
            <span className="text-[#f59e0b] text-2xl">☪</span>
            <span className="hidden sm:inline">HajjResponse</span>
          </Link>

          {/* Nav groups — scrollable on small screens */}
          <div className="flex items-center gap-0.5 overflow-x-auto max-w-full scrollbar-none">
            {/* Pilgrim group */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-green-400/70 font-bold uppercase tracking-widest mr-1 hidden lg:inline">
                Pilgrim
              </span>
              {pilgrimLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} label={label} pathname={pathname} />
              ))}
              {/* Face ID button */}
              <button
                onClick={() => setFaceID(true)}
                className="px-2.5 py-1.5 rounded text-sm text-white/65 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <span className="text-base">🪪</span>
                <span className="hidden sm:inline">Face ID</span>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 mx-2 flex-shrink-0"></div>

            {/* Command group */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-blue-300/70 font-bold uppercase tracking-widest mr-1 hidden lg:inline">
                Command
              </span>
              {commandLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} label={label} pathname={pathname} />
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
