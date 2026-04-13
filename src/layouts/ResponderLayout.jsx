import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import ThemeLangControls from '../components/ThemeLangControls'
import { useResponder } from '../context/ResponderContext'
import { useLang } from '../context/LanguageContext'

function useShiftTimer(dutyStartTime) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!dutyStartTime) { setElapsed(0); return }
    const tick = () => setElapsed(Math.floor((Date.now() - dutyStartTime) / 1000))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [dutyStartTime])
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return h > 0
    ? `${h}h ${String(m).padStart(2,'0')}m`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function ResponderLayout() {
  const { pathname } = useLocation()
  const { responder, dutyStartTime } = useResponder()
  const { t } = useLang()
  const shiftTime = useShiftTimer(dutyStartTime)
  const [panicFlash, setPanicFlash] = useState(false)

  const tabs = [
    { to: '/responder/home',    icon: '📡', labelKey: 'nav_home'    },
    { to: '/responder/history', icon: '📋', labelKey: 'nav_history' },
  ]

  const handlePanic = () => {
    setPanicFlash(true)
    setTimeout(() => setPanicFlash(false), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background:'var(--bg)'}}>
      {/* Persistent duty top bar */}
      <div className={`bg-amber-600 text-white px-3 py-2 flex items-center justify-between gap-2 sticky top-0 z-40 transition-all ${panicFlash ? 'bg-red-600 animate-pulse' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          {/* Duty status */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${responder.onDuty ? 'bg-green-300 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs font-bold">{responder.onDuty ? t('resp_on_duty') : t('resp_off_duty')}</span>
          </div>
          {/* Divider */}
          <div className="w-px h-4 bg-white/30 flex-shrink-0" />
          {/* Zone */}
          {responder.zone && (
            <span className="text-xs text-amber-100 truncate max-w-[80px]">{responder.zone}</span>
          )}
          {/* Shift timer */}
          {responder.onDuty && dutyStartTime && (
            <>
              <div className="w-px h-4 bg-white/30 flex-shrink-0" />
              <span className="text-xs font-mono text-amber-100 flex-shrink-0">{shiftTime}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Responder SOS panic button */}
          <button
            onClick={handlePanic}
            className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
            title="Emergency — I need help"
          >
            {t('resp_panic')}
          </button>
          <ThemeLangControls />
        </div>
      </div>

      {panicFlash && (
        <div className="bg-red-600 text-white text-center py-2 text-xs font-bold animate-pulse">
          ⚠️ Responder SOS sent — Operations notified — Help is coming
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 pb-16">
        <Outlet />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t"
        style={{background:'var(--bg-card)', borderColor:'var(--border)'}}>
        {tabs.map(({ to, icon, labelKey }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                active ? 'text-amber-600' : ''
              }`}
              style={active ? {} : {color:'var(--text-3)'}}
            >
              <span className="text-xl">{icon}</span>
              <span className={`text-[11px] font-semibold`}>{t(labelKey)}</span>
              {active && <div className="w-5 h-0.5 rounded-full bg-amber-500 mt-0.5" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
