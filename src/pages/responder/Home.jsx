import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Circle, Polygon, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useResponder } from '../../context/ResponderContext'
import { useIncidents } from '../../context/IncidentContext'
import { ZONE_TO_MED_POINT } from '../../context/IncidentContext'
import { HOSPITALS, HEALTH_CENTERS, haversineDist } from '../../data/medicalFacilities'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'
import { classifyGlucose } from '../../utils/glucoseLogic'

// ── Icon helpers ─────────────────────────────────────────────────────────────
const mkIcon = (html, w, h) => L.divIcon({ className:'', html, iconSize:[w,h], iconAnchor:[w/2,h/2], popupAnchor:[0,-h/2] })

const SELF_ICON = mkIcon(`
  <div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid white;
    box-shadow:0 0 0 0 rgba(37,99,235,0.5);animation:pBlue 2s infinite;position:relative;">
  </div>
  <style>@keyframes pBlue{0%{box-shadow:0 0 0 0 rgba(37,99,235,0.6)}70%{box-shadow:0 0 0 12px rgba(37,99,235,0)}100%{box-shadow:0 0 0 0 rgba(37,99,235,0)}}</style>
`,20,20)

const PATIENT_ICON = mkIcon(`
  <div style="width:24px;height:24px;border-radius:50%;background:#dc2626;border:3px solid white;
    box-shadow:0 0 0 0 rgba(220,38,38,0.6);animation:pRed 1.4s infinite;display:flex;align-items:center;justify-content:center;font-size:12px;">
    🆘
  </div>
  <style>@keyframes pRed{0%{box-shadow:0 0 0 0 rgba(220,38,38,0.8)}70%{box-shadow:0 0 0 16px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}</style>
`,24,24)

const NEARBY_ICON = mkIcon(`
  <div style="width:14px;height:14px;border-radius:50%;background:#f97316;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
`,14,14)

const HOSPITAL_ICON = mkIcon(`
  <div style="width:22px;height:22px;border-radius:50%;background:#15803d;border:2.5px solid white;
    display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:900;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);">H</div>
`,22,22)

const CENTER_ICON = mkIcon(`
  <div style="width:18px;height:18px;border-radius:50%;background:#16a34a;border:2px solid white;
    display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:700;">+</div>
`,18,18)

const DRONE_ICON = mkIcon(`
  <div style="font-size:20px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));animation:dFly 0.4s ease-in-out infinite alternate;">🚁</div>
  <style>@keyframes dFly{from{transform:translateY(0)}to{transform:translateY(-3px)}}</style>
`,24,24)

const OTHER_RESP_ICON = mkIcon(`
  <div style="width:10px;height:10px;border-radius:50%;background:#60a5fa;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
`,10,10)

// ── Constants ────────────────────────────────────────────────────────────────
const RESP_START   = [21.4130, 39.8930]
const PATIENT_POS  = [21.4145, 39.8955]
const STANDBY_POS  = [21.4220, 39.8850] // Mina zone center
const ZONE_CENTERS = {
  'Masjid al-Haram': [21.4225, 39.8262],
  'Mina':            [21.4220, 39.8850],
  'Arafat':          [21.3547, 39.9847],
  'Muzdalifah':      [21.3830, 39.9210],
  'Jamarat':         [21.4228, 39.8656],
}

// Crowd density zones (semi-transparent red overlay)
const CROWD_ZONES = [
  [[21.428,39.860],[21.428,39.875],[21.416,39.875],[21.416,39.860]], // Jamarat main
  [[21.422,39.887],[21.424,39.898],[21.413,39.898],[21.413,39.887]], // Mina main path
]

// Nearby incidents simulation
const NEARBY_INCIDENTS = [
  { id:'N1', type:'Heat Exhaustion', coords:[21.4138, 39.8962], risk:'High',   pilgrim:'Ahmed Al-Faruqi'    },
  { id:'N2', type:'Crowd Injury',    coords:[21.4125, 39.8944], risk:'Medium', pilgrim:'Bilal Chowdhury'    },
  { id:'N3', type:'Hypoglycemia',    coords:[21.4151, 39.8971], risk:'High',   pilgrim:'Fatimah Okonkwo'    },
]

// Other on-duty responders in zone
const OTHER_RESPONDERS = [
  [21.4135, 39.8940],
  [21.4118, 39.8925],
  [21.4155, 39.8910],
]

const RISK_COLOR = {
  Critical:'bg-red-100 text-red-700',
  High:    'bg-orange-100 text-orange-700',
  Medium:  'bg-amber-100 text-amber-700',
  Low:     'bg-green-100 text-green-700',
}

// ── Role type helper ─────────────────────────────────────────────────────────
function getRoleType(role) {
  if (role === 'humanitarian_volunteer') return 'humanitarian'
  if (role === 'golf_cart_paramedic')   return 'golf_cart'
  return 'paramedic' // paramedic_volunteer or legacy roles
}

function lerp(a, b, t) { return a + (b - a) * t }

function fmtDist(m) { return m >= 1000 ? `${(m/1000).toFixed(1)}km` : `${m}m` }

// ── Map controls sub-component ───────────────────────────────────────────────
function MapControls({ selfPos, patientPos, showCrowd, onToggleCrowd }) {
  const map = useMap()
  return (
    <div className="absolute top-3 right-3 z-[999] flex flex-col gap-1.5">
      <button onClick={() => map.flyTo(selfPos, 18, {animate:true,duration:1})}
        className="bg-white/95 hover:bg-white text-[#0f1e45] text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-sm border border-gray-200 whitespace-nowrap">
        📍 Me
      </button>
      {patientPos && (
        <button onClick={() => map.flyTo(patientPos, 18, {animate:true,duration:1})}
          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-sm whitespace-nowrap">
          🎯 Patient
        </button>
      )}
      <button onClick={onToggleCrowd}
        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-sm border whitespace-nowrap ${showCrowd ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white/95 text-gray-600 border-gray-200'}`}>
        👥 Crowd
      </button>
    </div>
  )
}

function FlyToOnMove({ pos }) {
  const map = useMap()
  useEffect(() => { map.panTo(pos, {animate:true, duration:1.5}) }, [pos, map])
  return null
}

// ── Live patient vitals hook ─────────────────────────────────────────────────
function usePatientVitals(active) {
  const [vitals, setVitals] = useState({ hr:102, temp:38.7, spo2:93, glucose:3.2 })
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => {
      setVitals(v => ({
        hr:      Math.max(75, Math.min(140, v.hr + Math.round((Math.random()-0.45)*4))),
        temp:    parseFloat((Math.max(37, Math.min(41, v.temp + (Math.random()-0.5)*0.15))).toFixed(1)),
        spo2:    Math.max(88, Math.min(99, v.spo2 + Math.round((Math.random()-0.5)*2))),
        glucose: parseFloat((Math.max(2.0, Math.min(26, v.glucose + (Math.random()-0.42)*0.5))).toFixed(1)),
      }))
    }, 5000)
    return () => clearInterval(t)
  }, [active])
  return vitals
}

// ── Clinical glucose instruction card ────────────────────────────────────────
function GlucoseClinicalCard({ glucose, isDark }) {
  const gc = classifyGlucose(glucose)
  if (!gc || gc.id === 'normal') return null

  const isHypo  = gc.type === 'hypoglycemia'
  const isHyper = gc.type === 'hyperglycemia' || gc.type === 'dka'
  const isCrit  = gc.flashing

  const borderCls = isCrit
    ? isDark ? 'border-red-500 animate-pulse' : 'border-red-600 animate-pulse'
    : gc.color === 'amber'
      ? isDark ? 'border-amber-600' : 'border-amber-500'
      : isDark ? 'border-red-700' : 'border-red-500'

  const bgCls = gc.color === 'amber'
    ? isDark ? 'bg-amber-900/20' : 'bg-amber-50'
    : isDark ? 'bg-red-900/20' : 'bg-red-50'

  const actionBg = isHypo
    ? isDark ? 'bg-blue-900/40 border-blue-700' : 'bg-blue-100 border-blue-400'
    : isDark ? 'bg-red-900/40 border-red-700' : 'bg-red-100 border-red-400'

  const actionText = isHypo
    ? isDark ? 'text-blue-200' : 'text-blue-900'
    : isDark ? 'text-red-200' : 'text-red-900'

  return (
    <div className={`rounded-2xl border-2 p-4 ${borderCls} ${bgCls}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🩸</span>
          <div>
            <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              Glucose Alert
            </div>
            <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#0f1e45]'}`}>{gc.label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-black text-2xl font-mono ${
            isHypo ? 'text-blue-500' : 'text-red-500'
          }`}>{glucose}</div>
          <div className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>mmol/L</div>
        </div>
      </div>

      {/* Classification badge */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border mb-3 ${
        isHypo
          ? isDark ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-800'
          : isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-800'
      }`}>
        <span>{isHypo ? '⬇️' : '⬆️'}</span>
        <span className="font-bold text-xs">{isHypo ? 'HYPOGLYCEMIA' : isHyper ? 'HYPERGLYCEMIA' : 'DKA RISK'}</span>
        <span className="text-[10px] opacity-70">{gc.threshold}</span>
      </div>

      {/* Action — impossible to miss */}
      <div className={`rounded-xl border p-3 mb-3 ${actionBg}`}>
        <div className={`font-black text-base leading-snug ${actionText}`}>
          {gc.actionVerb}
        </div>
        <p className={`text-xs mt-1.5 leading-relaxed ${actionText} opacity-90`}>{gc.action}</p>
      </div>

      {/* What to bring */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
        isDark ? 'bg-white/5 text-white/70' : 'bg-white/60 text-gray-700'
      }`}>
        <span>🎒</span>
        <span><strong>Bring:</strong> {gc.bring}</span>
      </div>

      {/* Drone suggestion */}
      {gc.dronePayload && (
        <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
          isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'
        }`}>
          <span>🚁</span>
          <span><strong>Drone payload:</strong> {gc.dronePayload}</span>
        </div>
      )}
    </div>
  )
}

// ── Notification alert ───────────────────────────────────────────────────────
function NotificationAlert({ incident, onAccept, onDecline, t }) {
  return (
    <div className="fixed inset-0 z-[2000] bg-red-600 flex flex-col items-center justify-center px-5">
      <style>{`@keyframes flashBorder{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.8)}50%{box-shadow:0 0 0 16px rgba(220,38,38,0)}}`}</style>
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" style={{animation:'flashBorder 1.2s ease-in-out infinite'}}>
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-4xl mx-auto mb-3">🚨</div>
          <div className="text-xl font-black text-red-600">{t('resp_incoming')}</div>
        </div>
        <div className="space-y-2.5 text-sm mb-5">
          {[
            [t('resp_patient'),   incident.pilgrim],
            [t('resp_emergency'), incident.type],
            ['Location',          incident.zone],
            [t('resp_risk'),      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RISK_COLOR[incident.risk]}`}>{incident.risk}</span>],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-gray-400">{k}</span>
              <span className="font-bold text-[#0f1e45]">{v}</span>
            </div>
          ))}
        </div>
        {incident.glucose && incident.cgmReading && (() => {
          const gc = classifyGlucose(incident.cgmReading)
          if (!gc || gc.id === 'normal') return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-700 font-semibold mb-3">
              🩸 Diabetic patient — check glucose on scene
            </div>
          )
          const isHypo = gc.type === 'hypoglycemia'
          return (
            <div className={`border rounded-xl px-3 py-2.5 text-xs font-semibold mb-3 ${isHypo ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
              🩸 CGM: <strong>{incident.cgmReading} mmol/L</strong> — {gc.label}
              <div className="mt-1 font-black">{gc.actionVerb}</div>
            </div>
          )
        })()}
        <div className="flex gap-3">
          <button onClick={onDecline} className="flex-1 border-2 border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:border-red-300 hover:text-red-500 transition-colors">{t('resp_decline')}</button>
          <button onClick={onAccept} className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">{t('resp_accept')}</button>
        </div>
      </div>
    </div>
  )
}

// ── Escalation panel (inline) ────────────────────────────────────────────────
function EscalationPanel({ assignment, onSubmit, onCancel, t, isDark }) {
  const [selected, setSelected] = useState([])
  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s])

  const options = [
    { key:'esc_golf_cart', isGolf: true },
    { key:'esc_ambulance' }, { key:'esc_oxygen' }, { key:'esc_aed' },
    { key:'esc_glucose' },   { key:'esc_ice' },    { key:'esc_volunteer' }, { key:'esc_doctor' },
  ]
  const medPoint = assignment ? ZONE_TO_MED_POINT[assignment.zone] || 'Nearest Medical Point' : ''
  const golfSelected = selected.includes('esc_golf_cart')

  return (
    <div className={`rounded-2xl border-2 border-red-400 p-4 ${isDark?'bg-red-900/10':'bg-red-50'}`}>
      <div className="font-bold text-sm text-red-600 mb-1">{t('esc_title')}</div>
      <p className="text-xs text-red-500/80 mb-3">{t('esc_subtitle')}</p>

      {golfSelected && (
        <div className={`border rounded-xl px-3 py-2 text-xs font-semibold mb-3 ${isDark?'bg-amber-900/30 border-amber-700 text-amber-300':'bg-amber-50 border-amber-300 text-amber-700'}`}>
          🛺 {t('esc_golf_cart_note')} → <strong>{medPoint}</strong>
        </div>
      )}

      <div className="grid grid-cols-1 gap-1.5 mb-3">
        {options.map(({ key, isGolf }) => {
          const on = selected.includes(key)
          return (
            <button key={key} type="button" onClick={() => toggle(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left text-xs font-medium transition-all ${
                on ? (isGolf?'border-amber-500 bg-amber-500/20 text-amber-400':'border-red-500 bg-red-500/20 text-red-400')
                   : isDark ? 'border-white/10 text-white/60 hover:border-white/20' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${on?(isGolf?'bg-amber-500 border-amber-500':'bg-red-500 border-red-500'):'border-gray-400'}`}>
                {on && <span className="text-white text-[9px]">✓</span>}
              </div>
              {t(key)}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className={`flex-1 border-2 font-semibold py-2.5 rounded-xl text-xs ${isDark?'border-white/10 text-white/60':'border-gray-200 text-gray-500'}`}>
          {t('esc_cancel')}
        </button>
        <button onClick={() => onSubmit(selected, medPoint)} disabled={!selected.length}
          className="flex-[2] bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl text-xs">
          {t('esc_confirm')}
        </button>
      </div>
    </div>
  )
}

// ── Drone dispatch modal ─────────────────────────────────────────────────────
function DroneModal({ assignment, patientGlucose, onClose, t, isDark }) {
  const [dispatched, setDispatched] = useState(false)
  const card = isDark ? 'bg-[#0f1e45]' : 'bg-white'

  // Pick payload based on glucose classification — critical safety logic
  const gc = patientGlucose ? classifyGlucose(patientGlucose) : null
  const payload = gc?.dronePayload || 'AED · Ice Packs · Saline · First Aid Kit'
  const payloadWarning = gc && gc.type === 'hyperglycemia' || gc?.type === 'dka'

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center px-5">
      <div className={`${card} rounded-2xl w-full max-w-sm p-6 shadow-2xl`}>
        <div className="text-center mb-4">
          <div className="text-3xl mb-2">🚁</div>
          <div className={`font-bold text-lg ${isDark?'text-white':'text-[#0f1e45]'}`}>{t('resp_drone_request')}</div>
          <p className={`text-xs mt-1 ${isDark?'text-white/50':'text-gray-400'}`}>Nearest drone dispatched to medical point</p>
        </div>
        {!dispatched ? (
          <>
            {/* Glucose-matched payload warning */}
            {gc && gc.id !== 'normal' && (
              <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold mb-3 border ${
                payloadWarning
                  ? isDark ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-800'
                  : isDark ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-800'
              }`}>
                🩸 Glucose: <strong>{patientGlucose} mmol/L</strong> — {gc.label}
                {payloadWarning && <div className="mt-0.5 font-black">⚠️ NO GLUCOSE IN PAYLOAD — IV fluids only</div>}
              </div>
            )}
            <div className={`rounded-xl p-3 text-xs space-y-1.5 mb-4 ${isDark?'bg-white/5':'bg-gray-50'}`}>
              {[
                ['Drone',       'DJI Matrice 350 RTK — Alpha'],
                ['Payload',     payload],
                ['Destination', assignment ? (ZONE_TO_MED_POINT[assignment.zone]||'Medical Point') : 'Medical Point'],
                ['ETA',         '~4–6 minutes'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="flex-shrink-0" style={{color:'var(--text-2)'}}>{k}</span>
                  <span className={`font-semibold text-right ${isDark?'text-white':'text-[#0f1e45]'}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className={`flex-1 border-2 font-semibold py-2.5 rounded-xl text-sm ${isDark?'border-white/10 text-white/60':'border-gray-200 text-gray-500'}`}>Cancel</button>
              <button onClick={() => setDispatched(true)} className="flex-[2] bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-sm">
                🚁 Dispatch Drone
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3 animate-bounce">🚁</div>
            <div className="font-bold text-green-500 mb-1">Drone Dispatched ✓</div>
            <p className={`text-xs mb-4 ${isDark?'text-white/50':'text-gray-400'}`}>Supplies arriving in ~5 minutes at medical point</p>
            <button onClick={onClose} className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Humanitarian Volunteer home screen ────────────────────────────────────
const REPORT_TYPES = [
  'Pilgrim collapsed',
  'Heat exhaustion',
  'Crowd crush',
  'Person unresponsive',
  'Injury / bleeding',
  'Diabetic emergency',
  'Other',
]

function HumanitarianHome({ responder, isDark, t, toggleDuty }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submittedType, setSubmittedType] = useState(null)

  const bg    = isDark ? 'bg-[#0a1628]' : 'bg-[#fafaf9]'
  const card  = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-200'
  const textP = isDark ? 'text-white'    : 'text-[#0f1e45]'
  const textM = isDark ? 'text-white/50' : 'text-gray-500'

  const handleSubmit = () => {
    if (!selected) return
    setSubmittedType(selected)
    setSubmitted(true)
  }

  const handleAnother = () => {
    setSubmitted(false)
    setSelected(null)
    setSubmittedType(null)
  }

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Header */}
      <div className={`px-4 pt-7 pb-5 ${isDark ? 'bg-[#0f1e45]' : 'bg-gray-800'} text-white`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-500/30 flex items-center justify-center text-xl">🙋</div>
          <div>
            <div className="font-bold">{responder.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] bg-gray-500/40 text-gray-200 px-2 py-0.5 rounded-full font-bold border border-gray-500/50">
                {t('resp_humanitarian_badge')}
              </span>
              <span className="text-xs text-gray-300">· {responder.zone}</span>
            </div>
          </div>
          <div className="ml-auto">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse mr-1" />
            <span className="text-xs text-green-300 font-semibold">{t('resp_on_duty')}</span>
          </div>
        </div>
        <div className={`rounded-xl border px-3 py-2 text-xs ${isDark?'bg-white/5 border-white/10':'bg-white/10 border-white/20'} text-gray-200`}>
          <div className="font-semibold mb-0.5">{t('resp_humanitarian_standby')}</div>
          <div className="opacity-70">{t('resp_humanitarian_standby_sub')}</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {!submitted ? (
          <>
            {/* Report button section */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className={`text-xs font-bold uppercase tracking-wide mb-3 ${textM}`}>{t('resp_report_type')}</div>
              <div className="space-y-2">
                {REPORT_TYPES.map(type => (
                  <button key={type} type="button" onClick={() => setSelected(type)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selected === type
                        ? isDark ? 'border-amber-500 bg-amber-900/20 text-amber-300' : 'border-amber-500 bg-amber-50 text-amber-700'
                        : isDark ? 'border-[#1e3a5f] text-white/70 hover:border-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}>
                    {selected === type && <span className="mr-2 text-amber-500">✓</span>}
                    {type}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selected}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold py-4 rounded-xl transition-colors text-base shadow-lg shadow-amber-900/20">
                {t('resp_report_submit')}
              </button>
            </div>

            {/* What happens info */}
            <div className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${isDark?'bg-blue-900/20 border-blue-800 text-blue-300':'bg-blue-50 border-blue-200 text-blue-700'}`}>
              ℹ️ Your report is instantly forwarded to the nearest Paramedic Volunteer in your zone. You do not need to approach the patient — stay nearby and safe.
            </div>
          </>
        ) : (
          /* Submitted confirmation */
          <div className={`rounded-2xl border p-6 text-center ${card}`}>
            <div className="text-5xl mb-3">✅</div>
            <div className={`font-black text-lg mb-1 ${textP}`}>{t('resp_report_submitted')}</div>
            <div className={`text-sm mb-2 ${textM}`}>
              <strong className="text-amber-500">{submittedType}</strong>
            </div>
            <p className={`text-xs leading-relaxed mb-5 ${textM}`}>{t('resp_report_sent_note')}</p>
            <div className={`grid grid-cols-3 gap-2 text-center text-xs mb-5 rounded-xl border p-3 ${isDark?'bg-white/5 border-white/10':'bg-gray-50 border-gray-100'}`}>
              {[
                { label:'Status',   val:'Forwarded', color:'text-green-500' },
                { label:'ETA',      val:'~3–5 min',  color:'text-amber-500' },
                { label:'Zone',     val:responder.zone?.split(' ')[0]||'—', color:textP },
              ].map(({label,val,color}) => (
                <div key={label}>
                  <div className={`font-bold ${color}`}>{val}</div>
                  <div className={`text-[10px] ${textM}`}>{label}</div>
                </div>
              ))}
            </div>
            <button onClick={handleAnother} className={`w-full border-2 font-bold py-3 rounded-xl text-sm ${isDark?'border-amber-600 text-amber-400 hover:bg-amber-900/20':'border-amber-500 text-amber-600 hover:bg-amber-50'}`}>
              {t('resp_report_another')}
            </button>
          </div>
        )}

        {/* SRCA attribution */}
        <div className={`rounded-xl px-3 py-2.5 text-xs ${isDark?'bg-white/5 text-white/30':'bg-gray-100 text-gray-400'}`}>
          🇸🇦 SRCA Hajj 2025 · 150 Humanitarian Volunteers deployed · Reporting only — no medical dispatch
        </div>

        {/* End shift */}
        <button onClick={toggleDuty}
          className={`w-full border-2 font-semibold py-2.5 rounded-xl text-sm transition-colors ${isDark?'border-white/10 text-white/50 hover:border-red-500 hover:text-red-400':'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600'}`}>
          🔚 {t('resp_end_shift')}
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ResponderHome() {
  const { responder, toggleDuty, notification, setNotification, acceptAssignment, declineAssignment, assignment, completeAssignment } = useResponder()
  const { incidents, updateIncident } = useIncidents()
  const { isDark } = useTheme()
  const { t } = useLang()

  const [phase, setPhase]                   = useState('enroute')
  const [showEscalation, setShowEscalation] = useState(false)
  const [escalationNeeds, setEscalationNeeds] = useState([])
  const [assignedMedPoint, setAssignedMedPoint] = useState(null)
  const [escalationSent, setEscalationSent] = useState(false)
  const [showDroneModal, setShowDroneModal] = useState(false)
  const [message, setMessage]               = useState('')
  const [sentMessages, setSentMessages]     = useState([])
  const [showCrowd, setShowCrowd]           = useState(true)
  const [statusTimes, setStatusTimes]       = useState({})
  const [dronePos, setDronePos]             = useState(null)
  const prevCount = useRef(incidents.length)

  // Responder position animation
  const [respPos, setRespPos] = useState(RESP_START)
  const progressRef = useRef(0)

  useEffect(() => {
    progressRef.current = 0
    setRespPos(RESP_START)
  }, [assignment?.id])

  useEffect(() => {
    if (!assignment) return
    const t = setInterval(() => {
      progressRef.current = Math.min(1, progressRef.current + 0.10)
      const p = progressRef.current
      setRespPos([lerp(RESP_START[0], PATIENT_POS[0], p), lerp(RESP_START[1], PATIENT_POS[1], p)])
    }, 3000)
    return () => clearInterval(t)
  }, [assignment])

  // Drone animation
  useEffect(() => {
    if (!dronePos) return
    // Simple drone animation from hospital to medical point
  }, [dronePos])

  // Watch for new incidents
  useEffect(() => {
    if (incidents.length > prevCount.current && responder.onDuty && !assignment && !notification) {
      const newest = incidents[0]
      if (newest?.status === 'Detected') setNotification(newest)
    }
    prevCount.current = incidents.length
  }, [incidents, responder.onDuty, assignment, notification, setNotification])

  // Live patient vitals
  const patientVitals = usePatientVitals(!!assignment)

  const dist    = haversineDist(respPos, PATIENT_POS)
  const etaMins = Math.max(0, Math.ceil(dist / 80))

  // Nearest 3 medical facilities to patient
  const nearestFacilities = [
    ...HOSPITALS.map(h => ({...h, d: haversineDist(PATIENT_POS, h.coords), ftype:'hospital'})),
    ...HEALTH_CENTERS.map(hc => ({...hc, d: haversineDist(PATIENT_POS, hc.coords), ftype:'center'})),
  ].sort((a,b) => a.d - b.d).slice(0, 3)

  const handleAccept = () => {
    if (!notification) return
    acceptAssignment(notification, updateIncident)
    setPhase('enroute')
  }

  const stampStatus = (key) => setStatusTimes(prev => ({...prev, [key]: new Date().toLocaleTimeString()}))

  const handleStatusUpdate = (action) => {
    if (!assignment) return
    if (action === 'onScene') {
      updateIncident(assignment.id, { status: 'On Scene' })
      setPhase('onScene')
      stampStatus('onScene')
    } else if (action === 'treating') {
      updateIncident(assignment.id, { status: 'On Scene' })
      setPhase('treating')
      stampStatus('treating')
    } else if (action === 'escalating') {
      setShowEscalation(true)
    } else if (action === 'done') {
      updateIncident(assignment.id, { status: 'Resolved' })
      completeAssignment('Resolved')
      setPhase('enroute')
      setAssignedMedPoint(null)
      setEscalationNeeds([])
      setEscalationSent(false)
      setShowCrowd(true)
      setStatusTimes({})
      setDronePos(null)
    }
  }

  const handleEscalationSubmit = (needs, medPoint) => {
    setEscalationNeeds(needs)
    setShowEscalation(false)
    const golfCart = needs.includes('esc_golf_cart')
    updateIncident(assignment.id, {
      escalated: true,
      escalationNeeds: needs.map(k => t(k)),
      status: golfCart ? 'Golf Cart En Route' : 'On Scene',
      ...(golfCart ? { golfCartRequested: true, assignedMedPoint: medPoint } : {}),
    })
    if (golfCart) setAssignedMedPoint(medPoint)
    setEscalationSent(true)
    setPhase('escalated')
    stampStatus('escalated')
    // Trigger drone animation
    if (needs.includes('esc_glucose') || needs.includes('esc_ice') || needs.includes('esc_aed')) {
      setDronePos([21.4270, 39.8734]) // From hospital
    }
  }

  const sendMessage = () => {
    if (!message.trim()) return
    const msg = { from:'Responder', text:message.trim(), time:new Date().toLocaleTimeString() }
    if (assignment) updateIncident(assignment.id, { messages:[...(assignment.messages||[]), msg] })
    setSentMessages(prev => [...prev.slice(-2), msg])
    setMessage('')
  }

  const handleHandOff = () => {
    if (!assignment) return
    completeAssignment('Handed Off')
    setPhase('enroute')
    setStatusTimes({})
  }

  const handleEndShift = () => {
    toggleDuty()
  }

  // Theme classes
  const bg    = isDark ? 'bg-[#0a1628]' : 'bg-gray-100'
  const card  = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-100'
  const textP = isDark ? 'text-white' : 'text-[#0f1e45]'
  const textM = isDark ? 'text-white/50' : 'text-gray-400'
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const tileAttr = isDark
    ? '© <a href="https://carto.com">CARTO</a>'
    : '© <a href="https://openstreetmap.org">OpenStreetMap</a>'

  if (!responder.registered) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-5 ${bg}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🚑</div>
          <div className={`font-bold ${textP}`}>Please register first</div>
          <a href="/responder/register" className="text-amber-500 text-sm underline mt-2 block">Go to Registration</a>
        </div>
      </div>
    )
  }

  const roleType = getRoleType(responder.role)

  // Humanitarian volunteers get a simplified reporting screen — no medical dispatch
  if (roleType === 'humanitarian') {
    return <HumanitarianHome responder={responder} isDark={isDark} t={t} toggleDuty={toggleDuty} />
  }

  // ── MAP COMPONENT ──────────────────────────────────────────────────────────
  const MapSection = ({ isStandby = false }) => (
    <div className="relative w-full h-full" style={{minHeight: isStandby ? '55vh' : undefined}}>
      <MapContainer
        center={isStandby ? (ZONE_CENTERS[responder.zone] || STANDBY_POS) : [(RESP_START[0]+PATIENT_POS[0])/2, (RESP_START[1]+PATIENT_POS[1])/2]}
        zoom={isStandby ? 15 : 17}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer url={tileUrl} attribution={tileAttr} />

        {/* Own position with accuracy circle */}
        <Marker position={isStandby ? (ZONE_CENTERS[responder.zone] || STANDBY_POS) : respPos} icon={SELF_ICON} />
        <Circle
          center={isStandby ? (ZONE_CENTERS[responder.zone] || STANDBY_POS) : respPos}
          radius={15}
          pathOptions={{ color:'#2563eb', fillColor:'#2563eb', fillOpacity:0.12, weight:1, dashArray:'4,4' }}
        />

        {!isStandby && assignment && (
          <>
            {/* Animated position tracking */}
            <FlyToOnMove pos={respPos} />

            {/* Patient marker */}
            <Marker position={PATIENT_POS} icon={PATIENT_ICON} />

            {/* Optimized route (green, thick) */}
            <Polyline
              positions={[respPos, [21.4137, 39.8942], PATIENT_POS]}
              pathOptions={{ color:'#16a34a', weight:5, opacity:0.9 }}
            />
            {/* Direct path (gray dashed) */}
            <Polyline
              positions={[respPos, PATIENT_POS]}
              pathOptions={{ color:'#94a3b8', weight:2, opacity:0.5, dashArray:'8,6' }}
            />

            {/* Drone marker */}
            {dronePos && <Marker position={dronePos} icon={DRONE_ICON} />}
          </>
        )}

        {/* Crowd density overlay */}
        {showCrowd && CROWD_ZONES.map((coords, i) => (
          <Polygon key={i} positions={coords}
            pathOptions={{ color:'#dc2626', fillColor:'#dc2626', fillOpacity:0.18, weight:1.5, dashArray:'6,4' }}
          />
        ))}

        {/* Other nearby incidents (orange) */}
        {!isStandby && NEARBY_INCIDENTS.map(inc => (
          <Marker key={inc.id} position={inc.coords} icon={NEARBY_ICON} />
        ))}

        {/* Other responders */}
        {OTHER_RESPONDERS.map((pos, i) => (
          <Marker key={i} position={pos} icon={OTHER_RESP_ICON} />
        ))}

        {/* Nearest 3 medical facilities */}
        {nearestFacilities.map(f => (
          <Marker key={f.id} position={f.coords} icon={f.ftype==='hospital' ? HOSPITAL_ICON : CENTER_ICON} />
        ))}

        {/* Map controls */}
        <MapControls
          selfPos={isStandby ? (ZONE_CENTERS[responder.zone] || STANDBY_POS) : respPos}
          patientPos={isStandby ? null : PATIENT_POS}
          showCrowd={showCrowd}
          onToggleCrowd={() => setShowCrowd(s => !s)}
        />
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 z-[999] rounded-xl px-3 py-2 shadow border text-[10px] space-y-1 pointer-events-none"
        style={{background: isDark ? 'rgba(7,16,32,0.92)' : 'rgba(255,255,255,0.95)', borderColor:'var(--border)', color:'var(--text-2)'}}>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> You</div>
        {!isStandby && <div className="flex items-center gap-1.5"><span className="text-xs">🆘</span> Patient</div>}
        {!isStandby && <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Other incidents</div>}
        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-green-700 inline-flex items-center justify-center text-white text-[7px] font-bold">H</span> Hospital</div>
        {showCrowd && <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/40 border border-red-400 inline-block" /> High density</div>}
      </div>
    </div>
  )

  // ── STANDBY VIEW ──────────────────────────────────────────────────────────
  if (responder.onDuty && !assignment) {
    const zoneIncidentCount = incidents.filter(i => i.zone === responder.zone && i.status !== 'Resolved').length
    return (
      <>
        {notification && (
          <NotificationAlert incident={notification} onAccept={handleAccept} onDecline={() => { declineAssignment(); setNotification(null) }} t={t} />
        )}
        <div className={`min-h-screen flex flex-col ${bg}`}>
          {/* Full-screen map for standby */}
          <div style={{height:'62vh'}}>
            <MapSection isStandby />
          </div>

          {/* Standby card */}
          <div className="p-4 space-y-3 flex-1">
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div>
                  <div className={`font-bold ${textP}`}>{t('resp_standby')}</div>
                  <div className="text-amber-500 font-semibold text-sm">{responder.zone}</div>
                </div>
              </div>
              <p className={`text-sm mb-3 ${textM}`}>{t('resp_standby_sub')}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  { label:'Zone Incidents', val:zoneIncidentCount, color:'text-red-500' },
                  { label:'Tier',           val:roleType === 'golf_cart' ? 'Tier 2' : 'Tier 1', color:roleType === 'golf_cart' ? 'text-amber-500' : 'text-green-500' },
                  { label:'Responders',     val:OTHER_RESPONDERS.length+1, color:'text-blue-500' },
                ].map(({label,val,color}) => (
                  <div key={label} className={`rounded-xl py-2 border ${isDark?'bg-white/5 border-white/10':'bg-gray-50 border-gray-100'}`}>
                    <div className={`font-bold text-lg ${color}`}>{val}</div>
                    <div className={`text-[10px] ${textM}`}>{label}</div>
                  </div>
                ))}
              </div>
              {roleType === 'golf_cart' && (
                <div className={`mt-2 rounded-xl px-3 py-2 text-xs ${isDark?'bg-amber-900/20 border border-amber-800 text-amber-300':'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                  🛺 Golf Cart Kit: AED · IV Access · Oxygen · Glucagon · IV Fluids · Stretcher
                </div>
              )}
              {roleType === 'paramedic' && (
                <div className={`mt-2 rounded-xl px-3 py-2 text-xs ${isDark?'bg-green-900/20 border border-green-800 text-green-300':'bg-green-50 border border-green-200 text-green-700'}`}>
                  🚶 {t('resp_300m_only')}
                </div>
              )}
            </div>

            <div className={`text-xs px-3 py-2 rounded-xl ${isDark?'bg-white/5':'bg-gray-50'}`} style={{color:'var(--text-3)'}}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block mr-1.5 animate-pulse" />
              {t('resp_location_active')} · GPS confirmed
            </div>

            <div className="flex gap-2">
              <button onClick={handleEndShift} className={`flex-1 border-2 font-semibold py-2.5 rounded-xl text-sm transition-colors ${isDark?'border-white/10 text-white/50 hover:border-red-500 hover:text-red-400':'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600'}`}>
                {t('resp_end_shift')}
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── OFF DUTY ──────────────────────────────────────────────────────────────
  if (!responder.onDuty) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-5 ${bg}`}>
        <div className="text-center">
          <div className="text-5xl mb-4">💤</div>
          <div className={`font-bold text-lg ${textP}`}>{t('resp_off_duty')}</div>
          <p className={`text-sm mt-2 ${textM}`}>Toggle On Duty in the top bar to start receiving assignments</p>
        </div>
      </div>
    )
  }

  // ── ACTIVE ASSIGNMENT: desktop split / mobile stacked ─────────────────────
  return (
    <>
      {notification && !assignment && (
        <NotificationAlert incident={notification} onAccept={handleAccept} onDecline={() => { declineAssignment(); setNotification(null) }} t={t} />
      )}
      {showDroneModal && (
        <DroneModal assignment={assignment} patientGlucose={assignment?.glucose ? patientVitals.glucose : null} onClose={() => setShowDroneModal(false)} t={t} isDark={isDark} />
      )}

      <div className={`flex flex-col md:flex-row md:h-[calc(100vh-64px)] md:overflow-hidden ${bg}`}>

        {/* ── MAP (left/top) ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 md:w-[62%]" style={{height:'62vh'}} data-map-col>
          <div className="relative h-full">
            <MapSection />

            {/* Distance/ETA overlay */}
            <div className="absolute top-3 left-3 z-[999] rounded-xl px-3 py-2 shadow text-xs"
              style={{background: isDark ? 'rgba(7,16,32,0.92)' : 'rgba(255,255,255,0.95)', borderColor:'var(--border)', color:'var(--text)'}}>
              <div className="font-bold text-lg">{fmtDist(dist)}</div>
              <div className={textM}>ETA ~{etaMins} min</div>
            </div>

            {/* Beacon strip */}
            <div className="absolute bottom-14 left-0 right-0 z-[999] mx-3">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${isDark?'bg-green-900/70 text-green-300':'bg-green-50 text-green-700'} border ${isDark?'border-green-800':'border-green-200'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                {t('resp_beacon_active')} {t('resp_beacon_sub')}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTROL PANEL (right/bottom, scrollable) ───────────────────── */}
        <div className="flex-1 md:overflow-y-auto p-3 space-y-3 md:h-full md:w-[38%]">

          {/* Patient assignment card */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <div className="flex items-start gap-3 mb-3">
              {/* Photo placeholder with initials */}
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                {assignment?.pilgrim?.split(' ').map(w=>w[0]).slice(0,2).join('') || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold truncate ${textP}`}>{assignment?.pilgrim}</div>
                <div className={`text-xs ${textM}`}>{assignment?.nationality} · {assignment?.zone}</div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${RISK_COLOR[assignment?.risk]}`}>{assignment?.risk}</span>
                  <span className={`text-xs ${textM}`}>{assignment?.type}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-mono font-bold text-blue-500`}>{etaMins > 0 ? `~${etaMins}m` : t('resp_arrived')}</div>
                <div className={`text-[10px] mt-0.5 ${textM}`}>{fmtDist(dist)}</div>
              </div>
            </div>

            {/* Vitals strip */}
            {(() => {
              const gc = assignment?.glucose ? classifyGlucose(patientVitals.glucose) : null
              const glucWarn = gc && gc.id !== 'normal'
              const glucColor = gc?.type === 'hypoglycemia' ? 'text-blue-400' : gc && gc.id !== 'normal' ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-800'
              return (
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  {[
                    { icon:'❤️', val:patientVitals.hr,        unit:'bpm',  warn:patientVitals.hr>110,   textCls:null },
                    { icon:'🌡️', val:`${patientVitals.temp}`, unit:'°C',   warn:patientVitals.temp>38.5, textCls:null },
                    { icon:'💧', val:`${patientVitals.spo2}`, unit:'%',    warn:patientVitals.spo2<93,   textCls:null },
                    { icon:'🩸', val:patientVitals.glucose,   unit:'mmol', warn:glucWarn,                textCls:glucColor },
                  ].map(({ icon, val, unit, warn, textCls }) => (
                    <div key={unit} className={`rounded-xl py-1.5 border ${warn ? isDark?'bg-red-900/30 border-red-700':'bg-red-50 border-red-200' : isDark?'bg-white/5 border-white/10':'bg-gray-50 border-gray-100'}`}>
                      <div className="text-sm">{icon}</div>
                      <div className={`font-bold text-xs ${textCls || (warn ? 'text-red-500' : isDark?'text-white':'text-gray-800')}`}>{val}</div>
                      <div style={{color:'var(--text-3)'}}>{unit}</div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {assignment?.conditions?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {assignment.conditions.map(c => (
                  <span key={c} className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            )}
            {assignment?.glucose && patientVitals.glucose && (
              <div className="mt-2">
                <GlucoseClinicalCard glucose={patientVitals.glucose} isDark={isDark} />
              </div>
            )}
          </div>

          {/* ── Status update bar ─────────────────────────────────────────── */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${textM}`}>
              {t('resp_update_status')}
              {roleType === 'golf_cart' && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDark?'bg-amber-900/30 text-amber-300':'bg-amber-100 text-amber-700'}`}>🛺 Golf Cart</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(roleType === 'golf_cart' ? [
                { action:'onScene',    label:t('resp_gc_on_scene'),    color:'bg-blue-600 hover:bg-blue-700',   disabled: phase!=='enroute',                      timeKey:'onScene'  },
                { action:'treating',   label:t('resp_gc_treatment'),   color:'bg-amber-500 hover:bg-amber-600', disabled: phase!=='onScene',                      timeKey:'treating' },
                { action:'escalating', label:t('resp_gc_transporting'),color:'bg-purple-600 hover:bg-purple-700',disabled: !['onScene','treating','escalated'].includes(phase), timeKey:'escalated'},
                { action:'done',       label:t('resp_gc_resolved'),    color:'bg-green-600 hover:bg-green-700', disabled: phase==='enroute',                      timeKey:'done'     },
              ] : [
                { action:'onScene',    label:t('resp_on_scene'),  color:'bg-blue-600 hover:bg-blue-700',   disabled: phase!=='enroute',                      timeKey:'onScene'  },
                { action:'treating',   label:t('resp_treating'),  color:'bg-amber-500 hover:bg-amber-600', disabled: phase!=='onScene',                      timeKey:'treating' },
                { action:'escalating', label:t('resp_escalate'),  color:'bg-red-600 hover:bg-red-700',     disabled: !['onScene','treating','escalated'].includes(phase), timeKey:'escalated'},
                { action:'done',       label:t('resp_resolved'),  color:'bg-green-600 hover:bg-green-700', disabled: phase==='enroute',                      timeKey:'done'     },
              ]).map(({ action, label, color, disabled, timeKey }) => (
                <div key={action}>
                  <button onClick={() => handleStatusUpdate(action)} disabled={disabled}
                    className={`w-full ${color} disabled:bg-gray-300 disabled:text-gray-400 text-white font-bold py-3 rounded-xl text-xs transition-colors`}>
                    {label}
                  </button>
                  {statusTimes[timeKey] && (
                    <div className={`text-center text-[9px] mt-0.5 ${textM}`}>{statusTimes[timeKey]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Escalation sent notice */}
          {escalationSent && (
            <div className={`rounded-2xl border-2 border-red-400 p-3 text-xs ${isDark?'bg-red-900/20 text-red-300':'bg-red-50 text-red-700'}`}>
              ⚠️ {t('esc_sent')}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {escalationNeeds.map(k => <span key={k} className="bg-red-500/20 px-1.5 py-0.5 rounded-full">{t(k)}</span>)}
              </div>
              {assignedMedPoint && (
                <div className={`mt-1.5 font-semibold ${isDark?'text-amber-300':'text-amber-700'}`}>
                  🛺 Transfer to: {assignedMedPoint}
                </div>
              )}
            </div>
          )}

          {/* Escalation panel (inline) */}
          {showEscalation && (
            <EscalationPanel
              assignment={assignment}
              onSubmit={handleEscalationSubmit}
              onCancel={() => setShowEscalation(false)}
              t={t}
              isDark={isDark}
            />
          )}

          {/* Navigation instructions */}
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <div className={`px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${isDark?'border-white/10':'border-gray-100'}`}
              style={{color:'var(--text-2)'}}>
              🗺️ Navigation
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${isDark?'bg-amber-900/40 text-amber-300':'bg-amber-100 text-amber-700'}`}>
                Crowd-density optimised
              </span>
            </div>
            {[
              { step:1, icon:'↑', colorCls:'bg-blue-500/20 text-blue-400', text:t('resp_nav_step1'), sub:t('resp_nav_step1_sub'), dist:'~180m' },
              { step:2, icon:'←', colorCls:'bg-amber-500/20 text-amber-400', text:t('resp_nav_step2'), sub:t('resp_nav_step2_sub'), dist:'~60m' },
              { step:3, icon:'📍', colorCls:'bg-green-500/20 text-green-400', text:t('resp_nav_step3'), sub:t('resp_nav_step3_sub'), dist:'~20m' },
            ].map(({ step, icon, colorCls, text, sub, dist: d }) => (
              <div key={step} className={`flex items-start gap-3 px-4 py-2.5 border-b last:border-0 ${isDark?'border-white/5':'border-gray-50'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorCls}`}>{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${textP}`}>{text}</div>
                  <div className={`text-[10px] mt-0.5 ${textM}`}>{sub}</div>
                </div>
                <div className={`text-[10px] font-mono flex-shrink-0 ${textM}`}>{d}</div>
              </div>
            ))}
          </div>

          {/* Direct path warning */}
          <div className={`rounded-xl px-3 py-2 text-xs flex items-start gap-2 ${isDark?'bg-red-900/20 border border-red-800 text-red-300':'bg-red-50 border border-red-200 text-red-700'}`}>
            <span className="flex-shrink-0">⚠️</span>
            <span>Direct path — crowd density <strong>HIGH</strong> — not recommended. Follow green route.</span>
          </div>

          {/* Drone dispatch button */}
          {(assignment?.glucose || phase === 'escalated' || phase === 'treating') && (
            <button onClick={() => setShowDroneModal(true)}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              🚁 {t('resp_drone_request')}
            </button>
          )}

          {/* Golf Cart — Request Hospital Transfer button */}
          {roleType === 'golf_cart' && phase === 'escalated' && (
            <div className={`rounded-2xl border-2 border-red-400 p-3 ${isDark?'bg-red-900/10':'bg-red-50'}`}>
              <div className={`text-xs font-bold mb-2 text-red-600`}>{t('resp_hospital_transfer')}</div>
              <p className={`text-xs mb-3 ${textM}`}>Request ambulance from nearest hospital to collect patient at current medical point.</p>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                🚑 Request Hospital Ambulance
              </button>
            </div>
          )}

          {/* Message box */}
          <div className={`rounded-2xl border p-4 ${card}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${textM}`}>{t('resp_msg_to_ops')}</div>
            {sentMessages.length > 0 && (
              <div className="space-y-1 mb-3">
                {sentMessages.map((m,i) => (
                  <div key={i} className={`text-xs px-3 py-1.5 rounded-lg flex justify-between gap-2 ${isDark?'bg-blue-900/30 text-blue-300':'bg-blue-50 text-blue-700'}`}>
                    <span className="truncate">{m.text}</span>
                    <span className="flex-shrink-0 opacity-60">{m.time}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{background:'var(--bg-input)', color:'var(--text)', border:'1px solid var(--border)'}}
                placeholder={t('resp_msg_placeholder')}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-3 rounded-xl text-xs">{t('resp_send_msg')}</button>
            </div>
          </div>

          {/* Hand off / End shift */}
          <div className="flex gap-2 pb-2">
            <button onClick={handleHandOff}
              className={`flex-1 border-2 font-semibold py-2.5 rounded-xl text-xs transition-colors ${isDark?'border-white/10 text-white/50 hover:border-amber-500 hover:text-amber-400':'border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600'}`}>
              🔄 {t('resp_hand_off')}
            </button>
            <button onClick={handleEndShift}
              className={`flex-1 border-2 font-semibold py-2.5 rounded-xl text-xs transition-colors ${isDark?'border-white/10 text-white/50 hover:border-red-500 hover:text-red-400':'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600'}`}>
              🔚 {t('resp_end_shift')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
