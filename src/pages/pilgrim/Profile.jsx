import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import { GLUCOSE_ZONES } from '../../utils/glucoseLogic'

const CONDITIONS = [
  { label: 'Type 2 Diabetes',       color: 'bg-blue-100 text-blue-700 border-blue-200',      darkColor: 'bg-blue-900/40 text-blue-300 border-blue-700' },
  { label: 'Hypertension',          color: 'bg-red-100 text-red-700 border-red-200',          darkColor: 'bg-red-900/40 text-red-300 border-red-700' },
  { label: 'Cardiac Event (2019)',  color: 'bg-orange-100 text-orange-700 border-orange-200', darkColor: 'bg-orange-900/40 text-orange-300 border-orange-700' },
]

const THRESHOLDS = [
  { metric: 'Heart Rate (high)',  standard: '> 120 bpm',   mine: '> 100 bpm',     reason: 'Cardiac history' },
  { metric: 'Temperature',        standard: '> 39.5°C',    mine: '> 38.5°C',      reason: 'Hypertension' },
  { metric: 'SpO₂ (low)',        standard: '< 90%',        mine: '< 93%',         reason: 'Cardiac history' },
  { metric: 'Glucose (low)',      standard: 'N/A',          mine: '< 4.0 mmol/L',  reason: 'Diabetes' },
  { metric: 'Inactivity',         standard: '> 15 min',     mine: '> 8 min',       reason: 'Fall risk' },
]

const ALERT_HISTORY = [
  { time: 'Day 4 · 14:22', event: 'Glucose 3.4 mmol/L — auto-alert sent', level: 'critical', resolved: true },
  { time: 'Day 3 · 11:05', event: 'Heat advisory — zone pre-positioned',  level: 'warning',  resolved: true },
  { time: 'Day 1 · 08:30', event: 'Wristband linked · CGM paired',        level: 'ok',       resolved: true },
]

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1
  const W = 80; const H = 24
  const pts = data.map((v,i) => `${(i/(data.length-1))*W},${H - ((v-min)/range)*H}`).join(' ')
  return (
    <svg width={W} height={H} className="opacity-70 mt-1">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function useVital(base, min, max, step) {
  const [history, setHistory] = useState(() => Array.from({length:10}, ()=>base + (Math.random()-0.5)*step*2))
  useEffect(() => {
    const t = setInterval(() => {
      setHistory(h => {
        const last = h[h.length-1]
        const next = parseFloat(Math.max(min, Math.min(max, last + (Math.random()-0.5)*step)).toFixed(1))
        return [...h.slice(1), next]
      })
    }, 3000)
    return () => clearInterval(t)
  }, [min, max, step])
  return [history, history[history.length-1]]
}

function useGlucose() {
  const [history, setHistory] = useState(() => Array.from({length:10}, ()=>+(4.5 + (Math.random()-0.5)*1.5).toFixed(1)))
  useEffect(() => {
    const t = setInterval(() => {
      setHistory(h => {
        const last = h[h.length-1]
        const next = parseFloat(Math.max(3.5, Math.min(13, last + (Math.random()-0.5)*0.4)).toFixed(1))
        return [...h.slice(1), next]
      })
    }, 4000)
    return () => clearInterval(t)
  }, [])
  return [history, history[history.length-1]]
}

const BASELINE = { hr: 74, temp: 36.8, spo2: 97 }

function useHeatTimer() {
  const [seconds, setSeconds] = useState(47 * 60 + 22)
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0 ? `${h}h ${m}m ${String(s).padStart(2,'0')}s` : `${m}m ${String(s).padStart(2,'0')}s`
}

function useRiskScore(temp, hr, spo2) {
  return Math.round(Math.min(100, Math.max(0,
    ((temp - 36.5) / 3.5) * 40 +
    ((hr - 60) / 70) * 35 +
    ((97 - spo2) / 9) * 25
  )))
}

export default function PilgrimProfile() {
  const { isDark } = useTheme()
  const { t } = useLang()

  const [hrHistory,   hr]      = useVital(91, 60, 130, 3)
  const [tempHistory, temp]    = useVital(38.1, 36.5, 40, 0.1)
  const [spo2History, spo2]    = useVital(95, 88, 100, 1)
  const [stepsHistory, steps]  = useVital(8210, 6000, 12000, 200)
  const [glucHistory, glucose] = useGlucose()
  const heatTimer              = useHeatTimer()
  const riskScore              = useRiskScore(temp, hr, spo2)

  const gWarn = glucose < 4.5 || glucose > 10
  const gCrit = glucose < 4.0

  const riskColor = riskScore >= 70 ? 'text-red-500' : riskScore >= 40 ? 'text-amber-500' : 'text-green-500'
  const riskBg    = riskScore >= 70
    ? isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
    : riskScore >= 40
      ? isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-300'
      : isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
  const riskLabel = riskScore >= 70 ? t('risk_high') : riskScore >= 40 ? t('risk_elevated') : t('risk_low')
  const riskBadge = riskScore >= 70
    ? isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'
    : riskScore >= 40
      ? isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'
      : isDark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'

  const bgPage = isDark ? 'bg-[#0a1628]' : 'bg-[#f9fafb]'
  const card   = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-100'
  const textP  = isDark ? 'text-white'    : 'text-[#0f1e45]'
  const textM  = isDark ? 'text-white/50' : 'text-gray-400'
  const textS  = isDark ? 'text-white/70' : 'text-gray-500'
  const divider = isDark ? 'border-[#1e3a5f]' : 'border-gray-100'
  const tableRow = isDark ? 'border-[#1e3a5f]' : 'border-gray-50'

  return (
    <div className={`min-h-screen ${bgPage}`}>
      {/* Header */}
      <div className="bg-green-600 text-white px-4 pt-7 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />{t('prof_view')}
        </div>
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-3xl mx-auto mb-2">🕌</div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-xl font-bold">Fatima Al-Rashidi</h1>
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{t('risk_high')}</span>
        </div>
        <p className="text-green-100 text-xs">{t('prof_age')} 67 · Saudi Arabia</p>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs flex-wrap">
          <span className="bg-white/15 px-2 py-1 rounded-full">⌚ HJ-2025-08841</span>
          <span className="bg-green-100/20 border border-green-300/40 px-2 py-1 rounded-full">🩸 CGM Connected — FreeStyle Libre 3</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Proactive risk alert */}
        {riskScore >= 40 && (
          <div className={`border-2 rounded-2xl px-4 py-3 text-sm ${isDark ? 'bg-amber-900/20 border-amber-600 text-amber-200' : 'bg-amber-50 border-amber-400 text-amber-800'}`}>
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div>
                <div className="font-bold mb-0.5">{t('prof_risk_alert_title')}</div>
                <div className="text-xs leading-relaxed">{t('prof_risk_alert_body')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Reassurance */}
        <div className={`border rounded-2xl px-4 py-3 text-sm text-center ${isDark ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-green-50 border-green-200 text-green-800'}`}>
          ✅ <strong>{t('prof_monitored')}</strong> {t('prof_monitored_sub')}
        </div>

        {/* AI Environmental Risk Score */}
        <div className={`rounded-2xl shadow-sm border-2 p-4 ${riskBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`font-bold text-sm ${textP}`}>{t('prof_risk_score')}</h3>
              <p className={`text-xs mt-0.5 ${textM}`}>{t('prof_risk_score_sub')}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-black ${riskColor}`}>{riskScore}<span className={`text-base font-semibold ${textM}`}>/100</span></div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${riskBadge}`}>{riskLabel}</div>
            </div>
          </div>
          <div className={`h-2 rounded-full overflow-hidden mb-3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${riskScore>=70?'bg-red-500':riskScore>=40?'bg-amber-400':'bg-green-500'}`} style={{width:`${riskScore}%`}} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { icon:'🌡️', label:t('vital_temp'),  val:`${temp}°C`,   warn: temp > 37.5,  contrib: Math.round(((temp-36.5)/3.5)*40) },
              { icon:'❤️',  label:t('vital_hr'),    val:`${hr} bpm`,   warn: hr > 90,      contrib: Math.round(((hr-60)/70)*35) },
              { icon:'☀️',  label:t('prof_sun'),    val:heatTimer,     warn: true,          contrib: Math.min(25, Math.round(riskScore * 0.25)) },
            ].map(({ icon, label, val, warn, contrib }) => (
              <div key={label} className={`rounded-xl px-2 py-2 border ${
                warn
                  ? isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'
                  : isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              }`}>
                <div className="text-lg">{icon}</div>
                <div className={`mt-0.5 ${textM}`}>{label}</div>
                <div className={`font-bold text-[11px] mt-0.5 ${warn?'text-amber-500':'text-green-500'}`}>{val}</div>
                <div className={`text-[9px] mt-0.5 ${textM}`}>+{contrib} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Baseline vs Now */}
        <div className={`rounded-2xl shadow-sm border p-4 ${card}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`font-bold text-sm ${textP}`}>{t('prof_baseline_title')}</h3>
              <p className={`text-xs mt-0.5 ${textM}`}>{t('prof_baseline_sub')}</p>
            </div>
            <div className="text-right">
              <div className={`text-xs ${textM}`}>☀️ {t('prof_sun')}</div>
              <div className="text-sm font-bold text-amber-500 font-mono">{heatTimer}</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon:'❤️',  label:t('vital_hr'),   base:BASELINE.hr,   now:hr,   unit:'bpm', fmt:v=>v },
              { icon:'🌡️', label:t('vital_temp'), base:BASELINE.temp, now:temp, unit:'°C',  fmt:v=>v.toFixed(1) },
              { icon:'💧',  label:t('vital_spo2'), base:BASELINE.spo2, now:spo2, unit:'%',   fmt:v=>v },
            ].map(({ icon, label, base, now, unit, fmt }) => {
              const diff = now - base
              const pct  = Math.round(Math.abs(diff / base) * 100)
              const up   = diff > 0
              return (
                <div key={label} className="flex items-center gap-3 text-xs">
                  <span className="text-base w-5 flex-shrink-0">{icon}</span>
                  <div className={`w-20 flex-shrink-0 ${textS}`}>{label}</div>
                  <div className={`flex-1 rounded-full h-1.5 relative overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <div className={`absolute left-1/2 top-0 h-full w-0.5 ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
                    <div className={`absolute h-full ${up?'left-1/2':'right-1/2'} ${Math.abs(diff)>2?'bg-amber-400':'bg-green-400'}`}
                      style={{width:`${Math.min(50, pct * 0.5)}%`}} />
                  </div>
                  <div className={`text-[10px] w-14 text-right flex-shrink-0 ${textM}`}>
                    <span>{fmt(base)}</span> → <span className={`font-bold ${textP}`}>{fmt(now)}{unit}</span>
                  </div>
                  <div className={`text-[10px] font-bold w-12 flex-shrink-0 ${up?'text-amber-500':'text-blue-400'}`}>
                    {up?'+':''}{fmt(diff)}{unit}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conditions */}
        <div className={`rounded-2xl shadow-sm border p-4 ${card}`}>
          <h3 className={`font-bold mb-3 text-sm ${textP}`}>{t('prof_conditions')}</h3>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(({label, color, darkColor}) => (
              <span key={label} className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${isDark ? darkColor : color}`}>{label}</span>
            ))}
          </div>
        </div>

        {/* Live vitals */}
        <div className={`rounded-2xl shadow-sm border p-4 ${card}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold text-sm ${textP}`}>{t('prof_live_vitals')}</h3>
            <span className="flex items-center gap-1 text-xs text-green-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{t('prof_live_label')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon:'❤️',  label:t('vital_hr'),    value:`${hr} bpm`,             warn: hr>100, hist: hrHistory,    color:'#ef4444' },
              { icon:'🌡️', label:t('vital_temp'),   value:`${temp}°C`,             warn: temp>38,   hist: tempHistory,  color:'#f59e0b' },
              { icon:'💧',  label:t('vital_spo2'),  value:`${spo2}%`,              warn: spo2<94,  hist: spo2History,  color:'#3b82f6' },
              { icon:'👣',  label:t('prof_steps'),  value:Math.round(steps).toLocaleString(), warn:false, hist:stepsHistory, color:'#22c55e'},
            ].map(({icon, label, value, warn, hist, color}) => (
              <div key={label} className={`rounded-2xl p-3 border ${
                warn
                  ? isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'
                  : isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{icon}</span>
                  <span className={`text-xs ${textS}`}>{label}</span>
                </div>
                <div className={`text-lg font-bold ${warn?'text-amber-500':'text-green-500'}`}>{value}</div>
                <Sparkline data={hist} color={color} />
                <div className={`text-[10px] mt-1 font-semibold ${warn?'text-amber-500':'text-green-500'}`}>
                  {warn ? t('prof_elevated') : t('prof_normal')}
                </div>
              </div>
            ))}
          </div>

          {/* CGM */}
          <div className={`mt-3 rounded-2xl p-3 border ${
            gCrit
              ? isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-300'
              : gWarn
                ? isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-300'
                : isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🩸</span>
                <span className={`text-xs ${textS}`}>Blood Glucose · FreeStyle Libre 3</span>
              </div>
              <span className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${isDark ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-300'}`}>
                CGM Active ✓
              </span>
            </div>
            <div className={`text-2xl font-black ${gCrit?'text-red-500':gWarn?'text-amber-500':'text-green-500'}`}>{glucose} mmol/L</div>
            <Sparkline data={glucHistory} color={gCrit?'#ef4444':gWarn?'#f59e0b':'#16a34a'} />
            <div className={`text-[10px] mt-1 font-semibold ${gCrit?'text-red-500':gWarn?'text-amber-500':'text-green-500'}`}>
              {gCrit ? t('prof_glucose_critical') : gWarn ? t('prof_glucose_warn') : t('prof_glucose_ok')}
            </div>
          </div>
        </div>

        {/* Glucose Safety Zones */}
        <div className={`rounded-2xl shadow-sm border p-4 ${card}`}>
          <h3 className={`font-bold mb-1 text-sm ${textP}`}>{t('gluc_zones_title')}</h3>
          <p className={`text-xs mb-4 ${textM}`}>{t('gluc_zones_sub')}</p>
          <div className="space-y-2">
            {GLUCOSE_ZONES.map(gc => {
              const isNormal = gc.id === 'normal'
              const isHypo   = gc.type === 'hypoglycemia'
              const isHyper  = gc.type === 'hyperglycemia' || gc.type === 'dka'
              const rowBg = isNormal
                ? isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                : gc.color === 'amber'
                  ? isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'
                  : isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
              const labelColor = isNormal ? 'text-green-500'
                : gc.color === 'amber' ? 'text-amber-500'
                : 'text-red-500'
              const actionColor = isHypo
                ? isDark ? 'text-blue-300' : 'text-blue-800'
                : isHyper
                  ? isDark ? 'text-red-300' : 'text-red-800'
                  : isDark ? 'text-green-300' : 'text-green-700'

              return (
                <div key={gc.id} className={`rounded-xl border p-3 ${rowBg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-xs ${labelColor}`}>{gc.threshold}</span>
                        {gc.flashing && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">CRITICAL</span>}
                      </div>
                      <div className={`font-semibold text-xs ${textP}`}>{gc.label}</div>
                      {!isNormal && gc.action && (
                        <div className={`text-xs mt-1 font-medium ${actionColor}`}>
                          {isHypo ? '✅' : '🚫'} {gc.actionVerb}
                        </div>
                      )}
                    </div>
                    <div className={`flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg text-right max-w-[120px] ${
                      isNormal
                        ? isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                        : gc.color === 'amber'
                          ? isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700'
                          : isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                    }`}>
                      Tier {gc.tier || '—'}
                      {!isNormal && <div className="font-normal opacity-70 mt-0.5">{gc.bring}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className={`mt-3 rounded-xl px-3 py-2.5 text-xs font-semibold border ${isDark ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            ⚠️ {t('gluc_zone_note')}
          </div>
        </div>

        {/* Other thresholds */}
        <div className={`rounded-2xl shadow-sm border p-4 ${card}`}>
          <h3 className={`font-bold mb-1 text-sm ${textP}`}>{t('prof_thresholds')}</h3>
          <p className={`text-xs mb-3 ${textM}`}>{t('prof_thresholds_sub')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className={`border-b text-left ${divider}`}>
                <th className={`pb-2 font-semibold pr-3 ${textS}`}>{t('prof_metric')}</th>
                <th className={`pb-2 font-normal pr-3 ${textM}`}>{t('prof_standard')}</th>
                <th className="pb-2 text-red-500 font-semibold pr-3">{t('prof_yours')}</th>
                <th className={`pb-2 font-normal ${textM}`}>{t('prof_why')}</th>
              </tr></thead>
              <tbody>{THRESHOLDS.filter(th => !th.metric.includes('Glucose')).map(({metric, standard, mine, reason}) => (
                <tr key={metric} className={`border-b last:border-0 ${tableRow}`}>
                  <td className={`py-2 font-medium pr-3 ${textS}`}>{metric}</td>
                  <td className={`py-2 pr-3 ${textM}`}>{standard}</td>
                  <td className="py-2 font-bold text-red-500 pr-3">{mine}</td>
                  <td className={`py-2 italic ${textM}`}>{reason}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {/* Alert history */}
        <div className={`rounded-2xl shadow-sm border p-4 ${card}`}>
          <h3 className={`font-bold mb-3 text-sm ${textP}`}>{t('prof_alerts')}</h3>
          <div className="space-y-3">
            {ALERT_HISTORY.map(({time, event, level, resolved}) => (
              <div key={time} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${level==='critical'?'bg-red-500':level==='warning'?'bg-amber-400':'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${textP}`}>{time}</div>
                  <div className={`text-xs mt-0.5 ${level==='critical'?'text-red-500 font-medium':textM}`}>{event}</div>
                </div>
                {resolved && <span className="text-xs text-green-500 font-semibold flex-shrink-0">{t('prof_resolved')}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
