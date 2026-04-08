import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// ── Constants ────────────────────────────────────────────────────────────────
const NATIONALITIES = [
  'Saudi Arabia','Indonesia','Pakistan','Bangladesh','Nigeria','Egypt','India',
  'Turkey','Iran','Morocco','Malaysia','Sudan','Algeria','Iraq','Yemen',
  'Afghanistan','Senegal','Mali','Niger','Somalia','Jordan','Palestine',
  'Libya','Tunisia','Mauritania','Kuwait','UAE','Qatar','Bahrain','Oman',
  'Other',
]

const CONDITIONS = [
  { id: 'diabetes2',  label: 'Type 2 Diabetes',        icon: '🩸' },
  { id: 'diabetes1',  label: 'Type 1 Diabetes',        icon: '💉' },
  { id: 'hypertension', label: 'Hypertension',         icon: '🫀' },
  { id: 'cardiac',    label: 'Previous Cardiac Event', icon: '❤️' },
  { id: 'asthma',     label: 'Asthma',                 icon: '🫁' },
  { id: 'kidney',     label: 'Kidney Disease',         icon: '🫘' },
  { id: 'obesity',    label: 'Obesity',                icon: '⚖️' },
  { id: 'none',       label: 'None of the above',      icon: '✅' },
]

const CGM_DEVICES = [
  'FreeStyle Libre 2',
  'FreeStyle Libre 3',
  'Dexcom G6',
  'Dexcom G7',
]

const BLOOD_TYPES = ['A+','A−','B+','B−','AB+','AB−','O+','O−','Unknown']

const STEPS = ['Personal Info', 'Medical Profile', 'Device Pairing', 'Summary']

// ── Step indicator ────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div className="px-5 pt-5 pb-4">
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done    = i < step
          const current = i === step
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done    ? 'bg-green-500 border-green-500 text-white' :
                  current ? 'bg-[#0f1e45] border-[#0f1e45] text-white' :
                             'bg-white border-gray-200 text-gray-400'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <div className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  current ? 'text-[#0f1e45]' : done ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 1 — Personal Info ────────────────────────────────────────────────────
function Step1({ data, setData, onNext }) {
  const [errors, setErrors] = useState({})

  // Simulate already-registered passports
  const takenPassports = ['AB123456', 'CD789012', 'EF345678']

  const validate = () => {
    const e = {}
    if (!data.name.trim())       e.name       = 'Full name is required'
    if (!data.nationality)       e.nationality = 'Please select your nationality'
    if (!data.age || data.age < 1 || data.age > 120) e.age = 'Please enter a valid age'
    if (!data.gender)            e.gender     = 'Please select your gender'
    const pp = data.passport.trim().toUpperCase()
    if (!pp) {
      e.passport = 'Passport number is required'
    } else if (!/^[A-Z0-9]{6,9}$/.test(pp)) {
      e.passport = 'Passport must be 6–9 alphanumeric characters'
    } else if (takenPassports.includes(pp)) {
      e.passport = 'A profile already exists for this passport number. Please use Face ID or your registered details to access your profile.'
    }
    if (!data.hajjGroup.trim()) e.hajjGroup = 'Hajj Group Number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const Field = ({ id, label, children, error }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )

  const inputCls = (err) =>
    `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e45] ${
      err ? 'border-red-400 bg-red-50' : 'border-gray-200'
    }`

  return (
    <div className="space-y-4">
      <Field id="name" label="Full Name" error={errors.name}>
        <input
          className={inputCls(errors.name)}
          placeholder="As on your passport"
          value={data.name}
          onChange={e => setData({ ...data, name: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="nationality" label="Nationality" error={errors.nationality}>
          <select
            className={inputCls(errors.nationality)}
            value={data.nationality}
            onChange={e => setData({ ...data, nationality: e.target.value })}
          >
            <option value="">Select…</option>
            {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
          </select>
        </Field>

        <Field id="age" label="Age" error={errors.age}>
          <input
            type="number"
            className={inputCls(errors.age)}
            placeholder="e.g. 65"
            value={data.age}
            onChange={e => setData({ ...data, age: e.target.value })}
          />
        </Field>
      </div>

      <Field id="gender" label="Gender" error={errors.gender}>
        <div className="flex gap-2">
          {['Male','Female'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setData({ ...data, gender: g })}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.gender === g
                  ? 'border-[#0f1e45] bg-[#0f1e45] text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {g === 'Male' ? '👨 Male' : '👩 Female'}
            </button>
          ))}
        </div>
        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
      </Field>

      <Field id="passport" label="Passport Number" error={errors.passport}>
        <input
          className={inputCls(errors.passport)}
          placeholder="e.g. AB123456"
          value={data.passport}
          onChange={e => setData({ ...data, passport: e.target.value.toUpperCase() })}
        />
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          Your passport number is used to verify your identity against your existing Hajj registration — no new account needed.
        </p>
      </Field>

      <Field id="hajjGroup" label="Hajj Group Number" error={errors.hajjGroup}>
        <input
          className={inputCls(errors.hajjGroup)}
          placeholder="e.g. SA-2026-04821"
          value={data.hajjGroup}
          onChange={e => setData({ ...data, hajjGroup: e.target.value })}
        />
      </Field>

      <button
        type="button"
        onClick={() => validate() && onNext()}
        className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
      >
        Continue →
      </button>
    </div>
  )
}

// ── Step 2 — Medical Profile ──────────────────────────────────────────────────
function Step2({ data, setData, onNext, onBack }) {
  const toggle = (id) => {
    if (id === 'none') {
      setData({ ...data, conditions: data.conditions.includes('none') ? [] : ['none'] })
      return
    }
    const next = data.conditions.filter(c => c !== 'none')
    setData({
      ...data,
      conditions: next.includes(id) ? next.filter(c => c !== id) : [...next, id],
    })
  }
  const selected = data.conditions

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#0f1e45] mb-1">Do you have any of these conditions?</h3>
        <p className="text-xs text-gray-400 mb-3">Select all that apply. This personalises your alert thresholds.</p>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map(({ id, label, icon }) => {
            const on = selected.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all ${
                  on
                    ? id === 'none'
                      ? 'border-green-500 bg-green-50'
                      : 'border-[#0f1e45] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-xl flex-shrink-0">{icon}</span>
                <span className={`text-xs font-semibold ${on ? (id === 'none' ? 'text-green-700' : 'text-[#0f1e45]') : 'text-gray-600'}`}>
                  {label}
                </span>
                {on && <span className="ml-auto text-xs">{id === 'none' ? '✓' : '✓'}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Any other conditions or medications we should know about?
        </label>
        <textarea
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e45] resize-none"
          placeholder="e.g. Metformin 1000mg twice daily, allergic to penicillin…"
          value={data.otherConditions}
          onChange={e => setData({ ...data, otherConditions: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Blood Type
        </label>
        <select
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e45]"
          value={data.bloodType}
          onChange={e => setData({ ...data, bloodType: e.target.value })}
        >
          <option value="">Select blood type…</option>
          {BLOOD_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={onNext} className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors">
          Continue →
        </button>
      </div>
    </div>
  )
}

// ── Step 3 — Device Pairing ───────────────────────────────────────────────────
function Step3({ data, setData, onNext, onBack }) {
  const [wristState, setWristState] = useState('idle') // idle | pairing | paired
  const [cgmState,   setCgmState]   = useState('idle') // idle | linking | linked
  const [wristId,    setWristId]    = useState('')

  const hasDiabetes = data.conditions.includes('diabetes1') || data.conditions.includes('diabetes2')

  const pairWristband = () => {
    setWristState('pairing')
    setTimeout(() => {
      const id = 'HJ-2025-' + String(Math.floor(10000 + Math.random() * 90000))
      setWristId(id)
      setWristState('paired')
      setData(d => ({ ...d, wristbandId: id }))
    }, 2000)
  }

  const linkCGM = () => {
    if (!data.cgmDevice || !data.cgmEmail) return
    setCgmState('linking')
    setTimeout(() => { setCgmState('linked') }, 2000)
  }

  return (
    <div className="space-y-5">
      {/* Wristband */}
      <div className="border-2 border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#0f1e45]/10 flex items-center justify-center text-2xl">⌚</div>
          <div>
            <div className="font-bold text-sm text-[#0f1e45]">Wristband Pairing</div>
            <div className="text-xs text-gray-400">Your Hajj wristband is required</div>
          </div>
        </div>

        {wristState === 'idle' && (
          <button
            type="button"
            onClick={pairWristband}
            className="w-full bg-[#0f1e45] hover:bg-[#1a3060] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            📡 Pair Your Hajj Wristband
          </button>
        )}

        {wristState === 'pairing' && (
          <div className="flex items-center justify-center gap-3 py-3 text-sm text-gray-500">
            <div className="w-5 h-5 border-2 border-[#0f1e45] border-t-transparent rounded-full animate-spin"></div>
            Searching for nearby wristband…
          </div>
        )}

        {wristState === 'paired' && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold text-green-700 text-sm">Wristband Paired Successfully</div>
              <div className="text-xs text-green-600 font-mono mt-0.5">ID: {wristId}</div>
            </div>
          </div>
        )}
      </div>

      {/* CGM — only for diabetics */}
      {hasDiabetes ? (
        <div className="border-2 border-blue-200 bg-blue-50/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🩸</div>
            <div>
              <div className="font-bold text-sm text-[#0f1e45]">CGM Device</div>
              <div className="text-xs text-blue-600 font-semibold">For diabetic pilgrims — recommended</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Link your continuous glucose monitor so the medical team can see your live blood sugar levels and intervene before a crisis.
          </p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Device Model</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={data.cgmDevice}
                onChange={e => setData(d => ({ ...d, cgmDevice: e.target.value }))}
              >
                <option value="">Select device…</option>
                {CGM_DEVICES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                LibreView / Dexcom Account Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                value={data.cgmEmail}
                onChange={e => setData(d => ({ ...d, cgmEmail: e.target.value }))}
              />
            </div>
          </div>

          {cgmState === 'idle' && (
            <button
              type="button"
              onClick={linkCGM}
              disabled={!data.cgmDevice || !data.cgmEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              🔗 Link CGM Device
            </button>
          )}
          {cgmState === 'linking' && (
            <div className="flex items-center justify-center gap-3 py-3 text-sm text-gray-500">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Authenticating with {data.cgmDevice?.split(' ')[0]}…
            </div>
          )}
          {cgmState === 'linked' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-bold text-blue-700 text-sm">CGM Linked Successfully</div>
                <div className="text-xs text-blue-500 mt-0.5">{data.cgmDevice} · {data.cgmEmail}</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center text-gray-400 text-sm">
          <div className="text-2xl mb-2">🩸</div>
          CGM linking is only available for pilgrims with diabetes.
          <br />
          <span className="text-xs">Go back to update your medical profile if needed.</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={wristState !== 'paired'}
          className="flex-[2] bg-green-600 hover:bg-green-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Continue →
        </button>
      </div>
      {wristState !== 'paired' && (
        <p className="text-xs text-center text-gray-400">You must pair your wristband before continuing.</p>
      )}
    </div>
  )
}

// ── Step 4 — Summary ──────────────────────────────────────────────────────────
function Step4({ data, onBack, onComplete }) {
  const hasCondition = data.conditions.length > 0 && !data.conditions.includes('none')
  const conditionLabels = CONDITIONS.filter(c => data.conditions.includes(c.id) && c.id !== 'none').map(c => c.label)
  const hasDiabetes = data.conditions.includes('diabetes1') || data.conditions.includes('diabetes2')

  const integrations = [
    {
      name: 'Nusuk — Hajj Registration Verified',
      desc: 'Your Hajj permit and group assignment have been confirmed.',
      icon: '🕌',
    },
    {
      name: 'Tawakkalna — Health Status Linked',
      desc: 'COVID vaccination and health screening status imported.',
      icon: '🤝',
    },
    {
      name: 'Saudi MOH — Medical Records Access',
      desc: 'Chronic condition flags from your national health record.',
      icon: '🏥',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Profile card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">🕌</div>
            <div>
              <div className="font-bold text-[#0f1e45]">{data.name || '—'}</div>
              <div className="text-xs text-gray-400">{data.nationality} · Age {data.age} · {data.gender}</div>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${
            hasCondition ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {hasCondition ? '⚠️ HIGH RISK' : '✓ STANDARD'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            ['Passport',     data.passport],
            ['Hajj Group',   data.hajjGroup],
            ['Blood Type',   data.bloodType || 'Not provided'],
            ['Wristband ID', data.wristbandId || '—'],
            hasDiabetes && data.cgmDevice ? ['CGM Device', data.cgmDevice] : null,
          ].filter(Boolean).map(([k, v]) => (
            <div key={k}>
              <div className="text-gray-400 mb-0.5">{k}</div>
              <div className="font-semibold text-gray-700 font-mono text-[11px]">{v}</div>
            </div>
          ))}
        </div>
        {conditionLabels.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-1.5">Medical Conditions</div>
            <div className="flex flex-wrap gap-1.5">
              {conditionLabels.map(c => (
                <span key={c} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alert thresholds note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
        ⚙️ <strong>Your alert thresholds have been personalised</strong> based on your medical profile. Medical staff will be notified at lower thresholds than for a standard pilgrim.
      </div>

      {/* Integrations */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="font-semibold text-sm text-[#0f1e45]">Connected to Existing Systems</div>
          <div className="text-xs text-gray-400 mt-0.5">HajjResponse does not store duplicate data — we connect to systems you are already registered with.</div>
        </div>
        <div className="divide-y divide-gray-100">
          {integrations.map(({ name, desc, icon }) => (
            <div key={name} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#0f1e45]">{name}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <span className="text-green-500 text-base flex-shrink-0">✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
        🔒 <strong>Privacy:</strong> Your data is processed on Saudi government servers, deleted after the Hajj season, and compliant with the{' '}
        <strong>Saudi Personal Data Protection Law (PDPL)</strong>.
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:border-gray-400 transition-colors">
          ← Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-green-200"
        >
          ✓ Complete Registration →
        </button>
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
const EMPTY = {
  name: '', nationality: '', age: '', gender: '',
  passport: '', hajjGroup: '',
  conditions: [], otherConditions: '', bloodType: '',
  wristbandId: '', cgmDevice: '', cgmEmail: '',
}

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep]   = useState(0)
  const [data, setData]   = useState(EMPTY)

  const next = () => setStep(s => Math.min(s + 1, 3))
  const back = () => setStep(s => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 pt-7 pb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          Pilgrim View
        </div>
        <h1 className="text-xl font-bold">Pilgrim Registration</h1>
        <p className="text-green-100 text-xs mt-1">Link your wristband · personalise your protection</p>
      </div>

      <div className="max-w-lg mx-auto">
        <ProgressBar step={step} />

        <div className="px-5 pb-8">
          {step === 0 && <Step1 data={data} setData={setData} onNext={next} />}
          {step === 1 && <Step2 data={data} setData={setData} onNext={next} onBack={back} />}
          {step === 2 && <Step3 data={data} setData={setData} onNext={next} onBack={back} />}
          {step === 3 && (
            <Step4
              data={data}
              onBack={back}
              onComplete={() => navigate('/sos')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
