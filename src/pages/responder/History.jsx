import { useResponder } from '../../context/ResponderContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'

const OUTCOME_COLOR_DARK  = { Resolved:'bg-green-900/40 text-green-300', Escalated:'bg-red-900/40 text-red-300', Declined:'bg-gray-700 text-gray-400' }
const OUTCOME_COLOR_LIGHT = { Resolved:'bg-green-100 text-green-700',    Escalated:'bg-red-100 text-red-700',    Declined:'bg-gray-100 text-gray-500' }
const RISK_COLOR_DARK     = { Critical:'bg-red-900/40 text-red-300', High:'bg-orange-900/40 text-orange-300', Medium:'bg-amber-900/40 text-amber-300', Low:'bg-green-900/40 text-green-300' }
const RISK_COLOR_LIGHT    = { Critical:'bg-red-100 text-red-700',    High:'bg-orange-100 text-orange-700',    Medium:'bg-amber-100 text-amber-700',    Low:'bg-green-100 text-green-700' }

const DEMO_HISTORY = [
  { id:'INC-001', pilgrim:'Ahmed Al-Rashidi', type:'Cardiac Alert', zone:'Mina',    risk:'Critical', outcome:'Resolved',  completedAt:'11:42', elapsed:312 },
  { id:'INC-002', pilgrim:'Fatimah Okonkwo',  type:'Heatstroke',   zone:'Arafat',  risk:'High',     outcome:'Resolved',  completedAt:'10:18', elapsed:540 },
  { id:'INC-003', pilgrim:'Bilal Chowdhury',  type:'Crowd Crush',  zone:'Jamarat', risk:'Medium',   outcome:'Escalated', completedAt:'09:05', elapsed:190 },
]

function fmtElapsed(s) {
  const m = Math.floor(s/60); const sec = s%60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export default function ResponderHistory() {
  const { history, responder } = useResponder()
  const { isDark } = useTheme()
  const { t } = useLang()
  const combined = [...history, ...DEMO_HISTORY]

  const outcomeColor = isDark ? OUTCOME_COLOR_DARK : OUTCOME_COLOR_LIGHT
  const riskColor    = isDark ? RISK_COLOR_DARK    : RISK_COLOR_LIGHT

  const bgPage  = isDark ? 'bg-[#0a1628]' : 'bg-[#fafaf9]'
  const card    = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-100'
  const textP   = isDark ? 'text-white'   : 'text-[#0f1e45]'
  const textM   = isDark ? 'text-white/50' : 'text-gray-400'
  const summary = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-gray-50 border-gray-200'

  return (
    <div className={`min-h-screen ${bgPage}`}>
      <div className="bg-amber-500 text-white px-4 py-4">
        <h1 className="font-bold">{t('hist_title')}</h1>
        <p className="text-amber-100 text-xs mt-0.5">
          {combined.length} {t('hist_handled')}{responder.name ? ` · ${responder.name}` : ''}
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
        {combined.length === 0 && (
          <div className={`text-center py-16 ${textM}`}>
            <div className="text-4xl mb-3">📋</div>
            <div className="font-semibold">{t('hist_empty')}</div>
            <p className={`text-sm mt-1 ${textM}`}>{t('hist_empty_sub')}</p>
          </div>
        )}

        {combined.map((inc, i) => (
          <div key={inc.id || i} className={`rounded-2xl border shadow-sm p-4 ${card}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className={`font-bold text-sm ${textP}`}>{inc.pilgrim}</div>
                <div className={`text-xs ${textM}`}>{inc.type} · {inc.zone}</div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${outcomeColor[inc.outcome] || (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                  {inc.outcome}
                </span>
                <div className={`text-xs mt-1 ${textM}`}>{inc.completedAt || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColor[inc.risk] || ''}`}>{inc.risk}</span>
              <span className={`text-xs ${textM}`}>{t('hist_response')}: {fmtElapsed(inc.elapsed)}</span>
              <span className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-300'}`}>{inc.id}</span>
            </div>
          </div>
        ))}

        {combined.length > 0 && (
          <div className={`rounded-2xl border p-4 text-sm ${summary}`}>
            <div className={`font-semibold mb-2 ${textP}`}>{t('hist_summary')}</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { labelKey:'hist_total',     val: combined.length },
                { labelKey:'hist_resolved',  val: combined.filter(i=>i.outcome==='Resolved').length },
                { labelKey:'hist_escalated', val: combined.filter(i=>i.outcome==='Escalated').length },
              ].map(({labelKey, val}) => (
                <div key={labelKey}>
                  <div className="text-2xl font-bold text-amber-600">{val}</div>
                  <div className={`text-xs ${textM}`}>{t(labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
