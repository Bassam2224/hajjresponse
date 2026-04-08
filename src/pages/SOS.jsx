import { useState } from 'react'
import { useIncidents } from '../context/IncidentContext'

const alertTypes = [
  { id: 'medical', icon: '🏥', label: 'Medical Emergency' },
  { id: 'heat',    icon: '🌡️', label: 'Heat Exhaustion' },
  { id: 'glucose', icon: '🩸', label: 'Low Blood Sugar' },
  { id: 'crowd',   icon: '👥', label: 'Crowd / Unsafe' },
  { id: 'lost',    icon: '🧭', label: 'I Am Lost' },
  { id: 'cardiac', icon: '❤️',  label: 'Chest Pain' },
]

const HEATSTROKE_STEPS = [
  'Move to shade or a cool area immediately',
  'Lie down and elevate your legs',
  'Remove extra clothing, fan yourself',
  'Apply cool (not icy) water to skin',
  'Sip small amounts of water if able',
  'Stay still — help is already coming',
]

const TYPE_MAP = {
  medical: { type: 'Cardiac Alert',          tier: 3, glucose: false },
  heat:    { type: 'Heatstroke',             tier: 2, glucose: false },
  glucose: { type: 'Hypoglycemic Emergency', tier: 1, glucose: true  },
  crowd:   { type: 'Crowd Crush',            tier: 1, glucose: false },
  lost:    { type: 'Crowd Crush',            tier: 1, glucose: false },
  cardiac: { type: 'Cardiac Alert',          tier: 3, glucose: false },
}

const RESPONDER = { 3: 'Ambulance 01', 2: 'Golf Cart Unit 1', 1: 'Volunteer Team 1' }

// ── Vitals strip ────────────────────────────────────────────────────────────
function VitalsStrip() {
  return (
    <div className="flex gap-2 mb-6">
      {[
        { icon: '❤️', val: '91', unit: 'bpm',   ok: true  },
        { icon: '🌡️', val: '38.1', unit: '°C',  ok: false },
        { icon: '💧', val: '95',  unit: '%SpO₂', ok: true  },
      ].map(({ icon, val, unit, ok }) => (
        <div
          key={unit}
          className={`flex-1 rounded-2xl p-3 text-center ${
            ok ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-300'
          }`}
        >
          <div className="text-xl mb-0.5">{icon}</div>
          <div className={`text-lg font-bold ${ok ? 'text-green-700' : 'text-amber-700'}`}>{val}</div>
          <div className="text-[10px] text-gray-400">{unit}</div>
        </div>
      ))}
    </div>
  )
}

// ── Beacon / dispatching loading screen ─────────────────────────────────────
function BeaconScreen({ stage }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[420px] text-center">
        <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"></div>
          <div className="absolute inset-5 rounded-full bg-red-400/25 animate-ping" style={{ animationDelay: '0.35s' }}></div>
          <div className="w-24 h-24 rounded-full bg-[#dc2626] flex items-center justify-center text-5xl shadow-2xl z-10">
            📡
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#0f1e45] mb-3">
          {stage === 1 ? 'Locating you…' : 'Help is being sent'}
        </h2>

        {stage === 1 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 text-sm text-amber-800 font-semibold mb-5 leading-relaxed">
            📳 Your wristband is now <strong>flashing and beeping</strong> to guide your responder directly to you
          </div>
        )}

        <p className="text-gray-400 text-sm mb-6">
          {stage === 1 ? 'Confirming your GPS + beacon position…' : 'Nearest responder has been notified'}
        </p>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#dc2626] h-3 rounded-full transition-all duration-700"
            style={{ width: stage === 1 ? '35%' : '85%' }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Confirmed screen ─────────────────────────────────────────────────────────
function ConfirmedScreen({ selected, onReset }) {
  const meta = TYPE_MAP[selected] || { type: 'Medical Emergency', tier: 2, glucose: false }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 px-6 pb-10">
      <div className="w-full max-w-[420px]">
        {/* Success badge */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-5xl mx-auto mb-5">✅</div>
          <h2 className="text-3xl font-bold text-[#0f1e45] mb-2">Help is on the way</h2>
          <p className="text-gray-500 text-lg">
            ETA: <strong className="text-green-600">~3 minutes</strong>
          </p>
        </div>

        {/* Beacon active */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl px-5 py-4 flex items-center gap-3 mb-5">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
          <div className="text-sm text-amber-800 font-semibold">
            Beacon Active — your wristband is flashing and sounding to guide your responder
          </div>
        </div>

        {/* Responder card */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-3 text-sm mb-5">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Responder</span>
            <span className="font-semibold text-[#0f1e45]">{RESPONDER[meta.tier]}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Emergency type</span>
            <span className="font-semibold">{alertTypes.find(a => a.id === selected)?.label}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Your location</span>
            <span className="font-semibold text-green-600">Confirmed ✓</span>
          </div>
        </div>

        {/* Heat first aid */}
        {selected === 'heat' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-5">
            <div className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span>🌡️</span> While you wait — cool down now
            </div>
            <ol className="space-y-2">
              {HEATSTROKE_STEPS.map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-orange-900">
                  <span className="w-6 h-6 rounded-full bg-orange-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-orange-700">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Auto-alert note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-700 mb-8 leading-relaxed">
          ℹ️ If your vitals reach a critical threshold, an alert is sent <strong>automatically</strong> — even if you cannot press this button.
        </div>

        <button
          onClick={onReset}
          className="w-full text-center text-gray-400 text-sm underline underline-offset-2"
        >
          Submit a new alert
        </button>
      </div>
    </div>
  )
}

// ── Main SOS form ─────────────────────────────────────────────────────────────
export default function SOS() {
  const { addIncident } = useIncidents()
  const [selected, setSelected] = useState(null)
  const [stage, setStage] = useState(0)

  const handleSOS = () => {
    if (!selected) return
    setStage(1)
    setTimeout(() => setStage(2), 1600)
    setTimeout(() => {
      setStage(3)
      const meta = TYPE_MAP[selected] || { type: 'Medical Emergency', tier: 2, glucose: false }
      addIncident({
        pilgrim: 'Fatima Al-Rashidi',
        nationality: 'Saudi',
        age: 67,
        zone: 'Mina Sector 3 — Tent 14B',
        type: meta.type,
        tier: meta.tier,
        detection: 'Manual SOS',
        responder: RESPONDER[meta.tier],
        status: 'En Route',
        risk: meta.tier === 3 ? 'Critical' : meta.tier === 2 ? 'High' : 'Medium',
        glucose: meta.glucose,
      })
    }, 3200)
  }

  if (stage === 1 || stage === 2) return <BeaconScreen stage={stage} />
  if (stage === 3) return <ConfirmedScreen selected={selected} onReset={() => { setSelected(null); setStage(0) }} />

  return (
    <div className="min-h-screen bg-white">
      {/* Pilgrim header */}
      <div className="bg-green-600 text-white px-4 pt-8 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          Pilgrim View
        </div>
        <h1 className="text-2xl font-bold mb-1">Pilgrim Emergency Access</h1>
        <p className="text-green-100 text-sm">Your wristband is active and monitoring your health</p>
      </div>

      {/* Auto-alert notice */}
      <div className="max-w-[420px] mx-auto px-5 pt-5">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
          ℹ️ <strong>You are protected.</strong> Medical staff will be alerted automatically if your vitals become critical — even without pressing this button.
        </div>
      </div>

      <div className="max-w-[420px] mx-auto px-5 py-5">
        {/* Vitals strip */}
        <VitalsStrip />

        {/* Prompt */}
        <h2 className="text-xl font-bold text-[#0f1e45] mb-1 text-center">Do you need help?</h2>
        <p className="text-gray-400 text-sm text-center mb-5">
          Tap what's happening. Your location is already confirmed.
        </p>

        {/* Alert type grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {alertTypes.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`rounded-2xl border-2 py-5 px-3 text-center transition-all active:scale-95 ${
                selected === id
                  ? 'border-green-500 bg-green-50 shadow-md shadow-green-100'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
              }`}
            >
              <div className="text-4xl mb-2">{icon}</div>
              <div className={`text-sm font-semibold ${selected === id ? 'text-green-700' : 'text-gray-700'}`}>
                {label}
              </div>
            </button>
          ))}
        </div>

        {/* Heat first aid inline preview */}
        {selected === 'heat' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-5">
            <div className="font-bold text-orange-800 mb-3 text-sm">🌡️ Do this now while help comes</div>
            <ol className="space-y-2">
              {HEATSTROKE_STEPS.map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-orange-900">
                  <span className="w-6 h-6 rounded-full bg-orange-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-orange-700">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Location confirmation */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 mb-6">
          <span className="text-2xl">📍</span>
          <div>
            <div className="text-sm font-semibold text-[#0f1e45]">Mina Sector 3 — Tent 14B</div>
            <div className="text-xs text-green-600">GPS + BLE beacon confirmed</div>
          </div>
        </div>

        {/* Big SOS button */}
        <button
          onClick={handleSOS}
          disabled={!selected}
          className={`w-full py-5 rounded-2xl font-bold text-xl transition-all active:scale-95 ${
            selected
              ? 'bg-[#dc2626] hover:bg-red-700 text-white shadow-xl shadow-red-200'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          🚨 Send Emergency Alert
        </button>

        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          Tap an emergency type above, then press Send.
          <br />Your wristband will flash to guide the responder.
        </p>
      </div>
    </div>
  )
}
