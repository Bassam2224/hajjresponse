import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import ThemeLangControls from '../components/ThemeLangControls'

export default function Landing() {
  const { isDark } = useTheme()
  const { t } = useLang()

  const portals = [
    {
      role: 'Pilgrim',
      icon: '🙏',
      colorBg: 'bg-green-600',
      border: isDark ? 'border-green-700' : 'border-green-200',
      badge: isDark ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-700',
      ring: 'hover:ring-green-500',
      desc: t('pilgrim_desc'),
      cta: t('pilgrim_cta'),
      to: '/pilgrim/register',
      sub: t('pilgrim_sub'),
    },
    {
      role: 'Responder',
      icon: '🚑',
      colorBg: 'bg-amber-500',
      border: isDark ? 'border-amber-700' : 'border-amber-200',
      badge: isDark ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-100 text-amber-700',
      ring: 'hover:ring-amber-400',
      desc: t('responder_desc'),
      cta: t('responder_cta'),
      to: '/responder/register',
      sub: t('responder_sub'),
    },
    {
      role: 'Operations',
      icon: '🖥️',
      colorBg: 'bg-[#0f1e45]',
      border: isDark ? 'border-blue-700' : 'border-blue-200',
      badge: isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-700',
      ring: 'hover:ring-blue-500',
      desc: t('ops_desc'),
      cta: t('ops_cta'),
      to: '/ops/login',
      sub: t('ops_sub'),
    },
  ]

  const bg = isDark ? 'bg-[#0a1628]' : 'bg-slate-50'
  const cardBg = isDark ? 'bg-white/5 hover:bg-white/8' : 'bg-white hover:bg-gray-50'
  const textPrimary = isDark ? 'text-white' : 'text-[#0f1e45]'
  const textMuted = isDark ? 'text-white/50' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Top bar with controls */}
      <div className="flex justify-end px-4 pt-3 pb-1">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isDark ? 'bg-white/10' : 'bg-[#0f1e45]'}`}>
          <ThemeLangControls />
        </div>
      </div>

      {/* Hero */}
      <div className="text-center px-4 pt-10 pb-12">
        <div className={`inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full mb-6 ${isDark ? 'bg-white/10 text-white/70' : 'bg-[#0f1e45]/10 text-[#0f1e45]/70'}`}>
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
          {t('landing_badge')}
        </div>
        <h1 className={`text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-tight ${textPrimary}`}>
          {t('landing_title1')}
          <br />
          <span className="text-[#f59e0b]">{t('landing_title2')}</span>
        </h1>
        <p className={`text-lg max-w-xl mx-auto mb-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          {t('landing_subtitle')}{' '}
          <span className={`font-semibold ${textPrimary}`}>{t('landing_subtitle2')}</span>
        </p>
        <p className={`text-sm mb-1 ${textMuted}`}>{t('landing_who')}</p>
        {/* Language note */}
        <p className={`text-xs mt-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
          🌐 {t('landing_lang_note')}
        </p>
      </div>

      {/* Three portals */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {portals.map(({ role, icon, colorBg, border, badge, ring, desc, cta, to, sub }) => (
            <div key={role}
              className={`${cardBg} border ${border} rounded-2xl p-7 flex flex-col transition-all hover:ring-2 ${ring} shadow-sm group`}
            >
              <div className={`w-14 h-14 rounded-2xl ${colorBg} flex items-center justify-center text-3xl mb-5 shadow-lg`}>
                {icon}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full self-start mb-3 ${badge}`}>
                {role}
              </span>
              <p className={`text-sm leading-relaxed flex-1 mb-6 ${isDark ? 'text-white/65' : 'text-gray-500'}`}>{desc}</p>
              <Link to={to}
                className={`w-full text-center ${colorBg} hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg mb-2`}
              >
                {cta}
              </Link>
              <p className={`text-xs text-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className={`mt-12 grid grid-cols-4 gap-6 border-t pt-10 text-center ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          {[
            { val:'15 → 5 min', labelKey:'stat_response_time' },
            { val:'2.5M+',      labelKey:'stat_pilgrims'      },
            { val:'90→6 min',   labelKey:'stat_drone'         },
            { val:'99.7%',      labelKey:'stat_accuracy'      },
          ].map(({ val, labelKey }) => (
            <div key={labelKey}>
              <div className="text-2xl font-bold text-[#f59e0b]">{val}</div>
              <div className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{t(labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
