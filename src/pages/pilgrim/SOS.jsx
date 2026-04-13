import { useState, useEffect } from 'react'
import { useIncidents } from '../../context/IncidentContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import { classifyGlucose } from '../../utils/glucoseLogic'

const PILGRIM = { name: 'Fatima Al-Rashidi', diabetic: true, conditions: ['Type 2 Diabetes','Hypertension'] }

const ALERT_TYPE_KEYS = [
  { id: 'heat',    icon: '🌡️', labelKey: 'sos_heat'    },
  { id: 'cardiac', icon: '❤️',  labelKey: 'sos_cardiac' },
  { id: 'glucose', icon: '🩸',  labelKey: 'sos_glucose' },
  { id: 'crowd',   icon: '👥',  labelKey: 'sos_crowd'   },
  { id: 'lost',    icon: '🧭',  labelKey: 'sos_lost'    },
  { id: 'other',   icon: '🏥',  labelKey: 'sos_other'   },
]

function useVitals(diabetic) {
  const [vitals, setVitals] = useState({ hr: 91, temp: 38.1, spo2: 95, glucose: 3.4 })
  useEffect(() => {
    const t = setInterval(() => {
      setVitals(v => ({
        hr:      Math.max(60, Math.min(130, v.hr + Math.round((Math.random()-0.48)*3))),
        temp:    parseFloat((Math.max(36.5, Math.min(40, v.temp + (Math.random()-0.5)*0.1))).toFixed(1)),
        spo2:    Math.max(88, Math.min(100, v.spo2 + Math.round((Math.random()-0.5)*2))),
        glucose: diabetic ? parseFloat((Math.max(2.0, Math.min(22, v.glucose + (Math.random()-0.45)*0.4))).toFixed(1)) : null,
      }))
    }, 3000)
    return () => clearInterval(t)
  }, [diabetic])
  return vitals
}

function useCountdown(startSecs) {
  const [secs, setSecs] = useState(startSecs)
  useEffect(() => {
    if (secs <= 0) return
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [secs])
  return `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`
}

// ── Two-branch diabetic emergency card ────────────────────────────────────────
function DiabeticBranchCard({ glucose, isDark, t }) {
  const gc = classifyGlucose(glucose)
  const isLow  = gc && gc.type === 'hypoglycemia'
  const isHigh = gc && (gc.type === 'hyperglycemia' || gc.type === 'dka')

  return (
    <div className={`rounded-2xl border-2 p-4 ${isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🩸</span>
        <div>
          <div className={`font-black text-sm ${isDark ? 'text-white' : 'text-[#0f1e45]'}`}>{t('gluc_check_first')}</div>
          <div className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{t('gluc_is_diabetic')}</div>
        </div>
      </div>

      {/* Live glucose reading */}
      {glucose !== null && (
        <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-4 border ${
          isLow  ? isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-300'
          : isHigh ? isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-300'
          : isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
        }`}>
          <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>CGM Live Reading</span>
          <div className="flex items-center gap-2">
            <span className={`font-black text-lg font-mono ${
              isLow ? 'text-blue-500' : isHigh ? 'text-red-500' : 'text-green-500'
            }`}>{glucose}</span>
            <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>mmol/L</span>
            {gc && gc.id !== 'normal' && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isLow ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
              }`}>{gc.shortLabel}</span>
            )}
          </div>
        </div>
      )}

      {/* Branch A — LOW */}
      <div className={`rounded-2xl border-2 p-3 mb-3 ${
        isLow
          ? 'border-blue-500 shadow-lg shadow-blue-500/20'
          : isDark ? 'border-white/10 opacity-60' : 'border-gray-200 opacity-70'
      } ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">⬇️</span>
          <div>
            <div className={`font-bold text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{t('gluc_low_branch')}</div>
            {isLow && gc && <div className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>⚠ Current: {gc.label}</div>}
          </div>
        </div>
        <div className={`font-black text-lg mb-1.5 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
          ✅ {t('gluc_give_gel')}
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-blue-200' : 'text-blue-900'}`}>{t('gluc_low_note')}</p>
      </div>

      {/* Branch B — HIGH */}
      <div className={`rounded-2xl border-2 p-3 mb-3 ${
        isHigh
          ? 'border-red-500 shadow-lg shadow-red-500/20'
          : isDark ? 'border-white/10 opacity-60' : 'border-gray-200 opacity-70'
      } ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">⬆️</span>
          <div>
            <div className={`font-bold text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>{t('gluc_high_branch')}</div>
            {isHigh && gc && <div className={`text-[10px] font-bold mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}>⚠ Current: {gc.label}</div>}
          </div>
        </div>
        <div className={`font-black text-lg mb-1.5 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
          🚫 {t('gluc_no_glucose')}
        </div>
        <p className={`text-xs leading-relaxed ${isDark ? 'text-red-200' : 'text-red-900'}`}>{t('gluc_high_note')}</p>
      </div>

      {/* Unconscious note */}
      <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold ${isDark ? 'bg-white/5 text-white/60' : 'bg-gray-50 text-gray-600'}`}>
        🚫 {t('gluc_unconscious')}
      </div>

      {/* Critical reminder */}
      <div className={`mt-3 text-center text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
        ⚠️ {t('gluc_always_check')}
      </div>
    </div>
  )
}

export default function PilgrimSOS() {
  const { addIncident } = useIncidents()
  const { isDark } = useTheme()
  const { t } = useLang()
  const vitals = useVitals(PILGRIM.diabetic)
  const [selected, setSelected] = useState(null)
  const [stage, setStage] = useState('idle')
  const [etaSecs] = useState(210)
  const countdown = useCountdown(stage === 'active' ? etaSecs : etaSecs)

  const card = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-200'
  const textP = isDark ? 'text-white' : 'text-[#0f1e45]'
  const textM = isDark ? 'text-white/50' : 'text-gray-400'
  const bgPage = isDark ? 'bg-[#0a1628]' : 'bg-white'

  // Glucose classification for incident type
  const gc = vitals.glucose !== null ? classifyGlucose(vitals.glucose) : null
  const glucoseIncidentType = gc && gc.emergencyType ? gc.emergencyType : 'Diabetic Emergency'

  const handleSOS = () => {
    if (!selected) return
    setStage('sending')
    setTimeout(() => {
      setStage('active')
      addIncident({
        pilgrim: PILGRIM.name, nationality: 'Saudi', age: 67,
        zone: 'Mina',
        type: selected==='heat' ? 'Heatstroke'
            : selected==='cardiac' ? 'Cardiac Alert'
            : selected==='glucose' ? glucoseIncidentType
            : 'Crowd Crush',
        tier: selected==='cardiac' ? 3
            : selected==='glucose' && gc && gc.tier >= 2 ? gc.tier
            : 2,
        detection: 'Manual SOS',
        responder: null, responderETA: null, status: 'Pending',
        risk: selected==='cardiac' ? 'Critical'
            : selected==='glucose' && gc && gc.color === 'red' ? 'Critical'
            : 'High',
        conditions: PILGRIM.conditions,
        medications: 'Metformin 1000mg · Amlodipine 10mg',
        bloodType: 'O+',
        glucose: PILGRIM.diabetic,
        cgmReading: vitals.glucose,
        glucoseClassification: gc ? gc.id : null,
      })
    }, 2000)
  }

  // Non-glucose first aid steps
  const firstAidSteps = selected === 'heat' ? t('heatstroke_steps')
    : selected === 'cardiac' ? t('cpr_steps')
    : null

  const firstAidTitle = selected === 'heat' ? t('sos_while_wait')
    : selected === 'cardiac' ? 'CPR — while you wait'
    : null

  // Glucose warning for vitals strip
  const glucoseWarn = vitals.glucose !== null && (vitals.glucose < 3.5 || vitals.glucose > 14)
  const glucoseColor = vitals.glucose !== null && gc
    ? gc.type === 'hypoglycemia' ? 'text-blue-500'
    : gc.type !== 'normal'       ? 'text-red-500'
    : 'text-green-500'
    : 'text-green-500'

  return (
    <div className={`min-h-screen ${bgPage}`}>
      {/* Status bar */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-semibold">Wristband Active — HJ-2025-08841</span>
        </div>
        {PILGRIM.diabetic && (
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
            🩸 CGM Live
          </div>
        )}
      </div>

      <div className="max-w-[420px] mx-auto px-5 pt-5 pb-8">
        {/* Pilgrim name */}
        <div className="text-center mb-5">
          <div className={`text-lg font-bold ${textP}`}>{PILGRIM.name}</div>
          <div className={`text-xs ${textM}`}>Mina — Sector 3, Block 7, Row 12</div>
        </div>

        {/* Vitals strip */}
        <div className="flex gap-2 mb-6">
          {[
            { icon:'❤️', labelKey:'vital_hr',   value:vitals.hr,    unitKey:'unit_bpm',     warn:vitals.hr > 100,    textCls: null },
            { icon:'🌡️', labelKey:'vital_temp', value:vitals.temp,  unitKey:'unit_celsius', warn:vitals.temp > 38,   textCls: null },
            { icon:'💧', labelKey:'vital_spo2', value:vitals.spo2,  unitKey:'unit_percent', warn:vitals.spo2 < 94,   textCls: null },
            ...(PILGRIM.diabetic ? [{ icon:'🩸', labelKey:'vital_glucose', value:vitals.glucose, unitKey:'unit_mmol', warn: glucoseWarn, textCls: glucoseColor }] : []),
          ].map(({ icon, value, unitKey, warn, textCls }) => (
            <div key={unitKey} className={`flex-1 rounded-2xl p-3 text-center border ${
              warn
                ? isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-300'
                : isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
            }`}>
              <div className="text-xl mb-0.5">{icon}</div>
              <div className={`text-base font-bold ${textCls || (warn ? 'text-amber-500' : 'text-green-500')}`}>{value}</div>
              <div className={`text-[10px] ${textM}`}>{t(unitKey)}</div>
            </div>
          ))}
        </div>

        {/* ── IDLE ── */}
        {stage === 'idle' && (
          <>
            <h2 className={`text-xl font-bold mb-1 text-center ${textP}`}>{t('sos_title')}</h2>
            <p className={`text-sm text-center mb-4 ${textM}`}>{t('sos_select')}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {ALERT_TYPE_KEYS.map(({ id, icon, labelKey }) => (
                <button key={id} onClick={() => setSelected(id)}
                  className={`rounded-2xl border-2 py-4 text-center transition-all active:scale-95 ${
                    selected === id
                      ? 'border-green-500 bg-green-500/20 shadow-md'
                      : isDark ? 'border-white/10 bg-white/5 hover:border-green-600' : 'border-gray-200 bg-white hover:border-green-300'
                  }`}>
                  <div className="text-3xl mb-1.5">{icon}</div>
                  <div className={`text-sm font-semibold ${selected===id ? 'text-green-400' : textP}`}>{t(labelKey)}</div>
                </button>
              ))}
            </div>
            <button onClick={handleSOS} disabled={!selected}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 ${selected ? 'bg-[#dc2626] hover:bg-red-700 text-white shadow-xl shadow-red-900/30' : isDark ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
              {t('sos_send')}
            </button>
          </>
        )}

        {/* ── SENDING ── */}
        {stage === 'sending' && (
          <div className="text-center py-10">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-red-400/30 animate-ping" style={{animationDelay:'0.3s'}} />
              <div className="w-28 h-28 rounded-full bg-[#dc2626] flex items-center justify-center text-5xl shadow-2xl z-10 relative">📡</div>
            </div>
            <div className={`text-xl font-bold mb-2 ${textP}`}>{t('sos_sending')}</div>
            <div className={textM}>Confirming your location via GPS + BLE</div>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {stage === 'active' && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-2">✅</div>
              <div className={`text-xl font-bold ${textP}`}>{t('sos_sent')}</div>
            </div>

            {/* Info card */}
            <div className={`rounded-2xl border p-4 space-y-2.5 text-sm ${card}`}>
              {[
                [t('sos_location'),     'Mina — Sector 3, Block 7, Row 12'],
                [t('sos_confirmed_by'), 'GPS + BLE Beacon ✓'],
                [t('sos_responder'),    'Khalid Al-Harbi (Golf Cart)'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span style={{color:'var(--text-2)'}}>{k}</span>
                  <span className={`font-semibold ${textP}`}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span style={{color:'var(--text-2)'}}>{t('sos_eta')}</span>
                <span className="font-bold text-[#dc2626] text-lg font-mono">{countdown}</span>
              </div>
            </div>

            {/* Beacon */}
            <div className={`border rounded-2xl px-4 py-3 flex items-center gap-3 ${isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-300'}`}>
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <div className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{t('sos_beacon')}</div>
            </div>

            {/* Diabetic two-branch card */}
            {selected === 'glucose' && (
              <DiabeticBranchCard glucose={vitals.glucose} isDark={isDark} t={t} />
            )}

            {/* Non-glucose first aid steps */}
            {firstAidSteps && Array.isArray(firstAidSteps) && (
              <div className={`border rounded-2xl p-4 ${isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
                <div className={`font-bold mb-3 text-sm ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                  🌡️ {firstAidTitle}
                </div>
                <div className="space-y-2">
                  {firstAidSteps.map(({icon, text}, i) => (
                    <div key={i} className={`flex items-start gap-2.5 text-sm ${isDark ? 'text-orange-200' : 'text-orange-900'}`}>
                      <span className="text-base flex-shrink-0">{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto-alert note */}
        <div className={`mt-5 border rounded-2xl px-4 py-3 text-xs leading-relaxed ${isDark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          ℹ️ {t('sos_auto_note')}
        </div>
      </div>
    </div>
  )
}
