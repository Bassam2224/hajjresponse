import { Outlet, Link, useLocation } from 'react-router-dom'
import ThemeLangControls from '../components/ThemeLangControls'
import { useLang } from '../context/LanguageContext'

const navItems = [
  { to: '/ops/dashboard',  icon: '📊', labelKey: 'nav_dashboard' },
  { to: '/ops/pilgrims',   icon: '🙏', labelKey: 'nav_pilgrims'  },
  { to: '/ops/responders', icon: '🚑', labelKey: 'nav_responders'},
  { to: '/ops/analytics',  icon: '📈', labelKey: 'nav_analytics' },
]

export default function ManagementLayout() {
  const { pathname } = useLocation()
  const { t } = useLang()

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{background:'var(--bg)'}}>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0f1e45] text-white flex-shrink-0 min-h-screen sticky top-0 max-h-screen overflow-y-auto"
        style={{background:'var(--nav)'}}>
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#f59e0b] text-xl">☪</span>
              <div>
                <div className="font-bold text-sm text-white">HajjResponse</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Operations Center</div>
              </div>
            </div>
            <ThemeLangControls />
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ to, icon, labelKey }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active ? 'bg-white/15 text-white font-semibold' : 'text-white/55 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{icon}</span>
                {t(labelKey)}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-3 border-t border-white/10 text-xs text-white/30">
          Operations & Management · SSCI 2026
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden bg-[#0f1e45] text-white sticky top-0 z-30"
        style={{background:'var(--nav)'}}>
        <div className="flex items-center gap-1 px-2 py-2">
          <div className="flex items-center gap-1.5 mr-2 flex-shrink-0">
            <span className="text-[#f59e0b]">☪</span>
            <span className="font-bold text-xs">Ops</span>
          </div>
          {navItems.map(({ to, icon, labelKey }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to}
                className={`flex flex-col items-center px-1.5 py-1 rounded-lg text-[10px] flex-1 transition-all ${
                  active ? 'bg-white/20 text-white font-semibold' : 'text-white/50 hover:text-white'
                }`}
              >
                <span>{icon}</span>
                <span className="mt-0.5">{t(labelKey)}</span>
              </Link>
            )
          })}
          <div className="flex-shrink-0 ml-1">
            <ThemeLangControls />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
