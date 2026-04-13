import { Outlet, Link, useLocation } from 'react-router-dom'
import ThemeLangControls from '../components/ThemeLangControls'
import { useLang } from '../context/LanguageContext'

export default function PilgrimLayout() {
  const { pathname } = useLocation()
  const { t } = useLang()

  const tabs = [
    { to: '/pilgrim/sos',     icon: '🆘', labelKey: 'nav_sos'     },
    { to: '/pilgrim/profile', icon: '👤', labelKey: 'nav_profile' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{background:'var(--bg)'}}>
      {/* Top bar */}
      <div className="bg-green-700 text-white py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span>🙏</span>
          <span>Pilgrim Access</span>
        </div>
        <ThemeLangControls />
      </div>

      {/* Page content — pad bottom for tab bar */}
      <div className="flex-1 pb-16">
        <Outlet />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t"
        style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
        {tabs.map(({ to, icon, labelKey }) => {
          const active = pathname === to || (labelKey === 'nav_sos' && pathname === '/pilgrim/register')
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className={`text-[11px] font-semibold ${active ? 'text-green-600' : ''}`}
                style={active ? {} : {color:'var(--text-3)'}}>
                {t(labelKey)}
              </span>
              {active && <div className="w-5 h-0.5 rounded-full bg-green-600 mt-0.5" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
