import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NATIONALITIES = ['Saudi Arabia','Indonesia','Pakistan','Bangladesh','Nigeria','Egypt','India','Turkey','Iran','Morocco','Malaysia','Sudan','Algeria','Iraq','Yemen','Afghanistan','Senegal','Mali','Niger','Somalia','Jordan','Palestine','Libya','Tunisia','Mauritania','Kuwait','UAE','Qatar','Bahrain','Oman','Other']
const CONDITIONS = [
  { id: 'diabetes1',    label: 'Type 1 Diabetes',        icon: '💉' },
  { id: 'diabetes2',    label: 'Type 2 Diabetes',        icon: '🩸' },
  { id: 'hypertension', label: 'Hypertension',           icon: '🫀' },
  { id: 'cardiac',      label: 'Previous Cardiac Event', icon: '❤️' },
  { id: 'asthma',       label: 'Asthma',                 icon: '🫁' },
  { id: 'kidney',       label: 'Kidney Disease',         icon: '🫘' },
  { id: 'obesity',      label: 'Obesity',                icon: '⚖️' },
  { id: 'none',         label: 'None of the above',      icon: '✅' },
]
const CGM_DEVICES = ['FreeStyle Libre 2','FreeStyle Libre 3','Dexcom G6','Dexcom G7']
const BLOOD_TYPES = ['A+','A−','B+','B−','AB+','AB−','O+','O−','Unknown']
const STEPS = ['Personal Info','Medical Profile','Device Pairing','Summary']
const TAKEN = ['AB123456','CD789012']

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-0 px-4 py-4">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? 'bg-green-500 border-green-500 text-white' : i === step ? 'bg-[#0f1e45] border-[#0f1e45] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className={`text-[9px] mt-1 font-medium whitespace-nowrap ${i === step ? 'text-[#0f1e45]' : i < step ? 'text-green-600' : 'text-gray-400'}`}>{label}</div>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

const inp = (err) => `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

function Step1({ data, setData, onNext }) {
  const [errors, setErrors] = useState({})
  const validate = () => {
    const e = {}
    if (!data.name.trim()) e.name = 'Required'
    if (!data.nationality) e.nationality = 'Required'
    if (!data.age || data.age < 1) e.age = 'Required'
    if (!data.gender) e.gender = 'Required'
    const pp = data.passport.trim().toUpperCase()
    if (!pp) e.passport = 'Required'
    else if (!/^[A-Z0-9]{6,9}$/.test(pp)) e.passport = 'Must be 6–9 alphanumeric characters'
    else if (TAKEN.includes(pp)) e.passport = 'A profile already exists for this passport number.'
    if (!data.hajjGroup.trim()) e.hajjGroup = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }
  return (
    <div className="space-y-4">
      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
        <input className={inp(errors.name)} placeholder="As on passport" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nationality</label>
          <select className={inp(errors.nationality)} value={data.nationality} onChange={e => setData({...data, nationality: e.target.value})}>
            <option value="">Select…</option>{NATIONALITIES.map(n=><option key={n}>{n}</option>)}
          </select>
          {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
        </div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Age</label>
          <input type="number" className={inp(errors.age)} placeholder="e.g. 65" value={data.age} onChange={e => setData({...data, age: e.target.value})} />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
        </div>
      </div>
      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
        <div className="flex gap-2">
          {['Male','Female'].map(g => (
            <button key={g} type="button" onClick={() => setData({...data, gender: g})} className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${data.gender===g?'border-green-600 bg-green-600 text-white':'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {g==='Male'?'👨':'👩'} {g}
            </button>
          ))}
        </div>
        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
      </div>
      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Passport Number</label>
        <input className={inp(errors.passport)} placeholder="e.g. AB123456" value={data.passport} onChange={e => setData({...data, passport: e.target.value.toUpperCase()})} />
        {errors.passport && <p className="text-red-500 text-xs mt-1">{errors.passport}</p>}
        <p className="text-xs text-gray-400 mt-1">Used to verify against your existing Hajj registration — no new account needed.</p>
      </div>
      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hajj Group Number</label>
        <input className={inp(errors.hajjGroup)} placeholder="e.g. SA-2026-04821" value={data.hajjGroup} onChange={e => setData({...data, hajjGroup: e.target.value})} />
      </div>
      <button type="button" onClick={() => validate() && onNext()} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3.5 rounded-xl transition-colors">Continue →</button>
    </div>
  )
}

function Step2({ data, setData, onNext, onBack }) {
  const toggle = (id) => {
    if (id === 'none') { setData({...data, conditions: data.conditions.includes('none') ? [] : ['none']}); return }
    const next = data.conditions.filter(c => c !== 'none')
    setData({...data, conditions: next.includes(id) ? next.filter(c=>c!==id) : [...next, id]})
  }
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[#0f1e45] mb-1">Do you have any of these conditions?</h3>
        <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map(({id, label, icon}) => {
            const on = data.conditions.includes(id)
            return (
              <button key={id} type="button" onClick={() => toggle(id)} className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all ${on ? (id==='none'?'border-green-500 bg-green-50':'border-green-600 bg-green-50') : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span className={`text-xs font-semibold ${on?'text-green-700':'text-gray-600'}`}>{label}</span>
                {on && <span className="ml-auto text-green-600 text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      </div>
      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Other conditions or medications</label>
        <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" placeholder="e.g. Metformin 500mg, allergic to penicillin…" value={data.otherConditions} onChange={e => setData({...data, otherConditions: e.target.value})} />
      </div>
      <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Blood Type</label>
        <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={data.bloodType} onChange={e => setData({...data, bloodType: e.target.value})}>
          <option value="">Select…</option>{BLOOD_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:border-gray-400">← Back</button>
        <button type="button" onClick={onNext} className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl">Continue →</button>
      </div>
    </div>
  )
}

function Step3({ data, setData, onNext, onBack }) {
  const [wrist, setWrist] = useState('idle')
  const [cgm, setCgm]     = useState('idle')
  const [wristId, setWristId] = useState('')
  const hasDiab = data.conditions.includes('diabetes1') || data.conditions.includes('diabetes2')

  const pairWristband = () => {
    setWrist('pairing')
    setTimeout(() => {
      const id = 'HJ-2025-' + String(Math.floor(10000 + Math.random()*90000))
      setWristId(id); setWrist('paired'); setData(d => ({...d, wristbandId: id}))
    }, 2000)
  }
  const linkCGM = () => {
    if (!data.cgmDevice || !data.cgmEmail) return
    setCgm('linking')
    setTimeout(() => setCgm('linked'), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Wristband */}
      <div className={`border-2 rounded-2xl p-5 ${wrist==='paired'?'border-green-500':'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#0f1e45]/10 flex items-center justify-center text-2xl">⌚</div>
          <div><div className="font-bold text-sm text-[#0f1e45]">Wristband Pairing</div><div className="text-xs text-gray-400">Required to use HajjResponse</div></div>
        </div>
        {wrist==='idle' && <button type="button" onClick={pairWristband} className="w-full bg-[#0f1e45] hover:bg-[#1a3060] text-white font-semibold py-3 rounded-xl text-sm">📡 Pair Your Hajj Wristband</button>}
        {wrist==='pairing' && <div className="flex items-center justify-center gap-3 py-3 text-sm text-gray-500"><div className="w-5 h-5 border-2 border-[#0f1e45] border-t-transparent rounded-full animate-spin"></div>Searching for wristband…</div>}
        {wrist==='paired' && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3"><span className="text-xl">✅</span><div><div className="font-bold text-green-700 text-sm">Wristband Paired Successfully</div><div className="text-xs font-mono text-green-600">ID: {wristId}</div></div></div>}
        <p className="text-xs text-gray-400 mt-3 text-center">No smartphone? Your wristband alone is sufficient — it connects automatically to Hajj site gateways.</p>
      </div>

      {/* CGM */}
      {hasDiab ? (
        <div className={`border-2 rounded-2xl p-5 ${cgm==='linked'?'border-blue-500':'border-blue-200 bg-blue-50/30'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🩸</div>
            <div><div className="font-bold text-sm text-[#0f1e45]">CGM Device</div><div className="text-xs text-blue-600 font-semibold">Recommended for diabetic pilgrims</div></div>
          </div>
          <div className="space-y-3 mb-4">
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={data.cgmDevice} onChange={e => setData(d=>({...d, cgmDevice:e.target.value}))}>
              <option value="">Select device…</option>{CGM_DEVICES.map(d=><option key={d}>{d}</option>)}
            </select>
            <input type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="LibreView / Dexcom email" value={data.cgmEmail} onChange={e => setData(d=>({...d, cgmEmail:e.target.value}))} />
          </div>
          {cgm==='idle' && <button type="button" onClick={linkCGM} disabled={!data.cgmDevice||!data.cgmEmail} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl text-sm">🔗 Link CGM Device</button>}
          {cgm==='linking' && <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Authenticating…</div>}
          {cgm==='linked' && <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3"><span>✅</span><div><div className="font-bold text-blue-700 text-sm">CGM Linked</div><div className="text-xs text-blue-500">{data.cgmDevice}</div></div></div>}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center text-gray-400 text-sm">
          🩸 CGM linking is only available for pilgrims with diabetes.
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl">← Back</button>
        <button type="button" onClick={onNext} disabled={wrist!=='paired'} className="flex-[2] bg-green-600 hover:bg-green-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl">Continue →</button>
      </div>
      {wrist!=='paired' && <p className="text-xs text-center text-gray-400">Pair your wristband to continue.</p>}
    </div>
  )
}

function Step4({ data, onBack, onComplete }) {
  const hasCondition = data.conditions.length > 0 && !data.conditions.includes('none')
  const condLabels = CONDITIONS.filter(c => data.conditions.includes(c.id) && c.id!=='none').map(c=>c.label)
  const hasDiab = data.conditions.includes('diabetes1') || data.conditions.includes('diabetes2')

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-bold text-[#0f1e45]">{data.name}</div>
            <div className="text-xs text-gray-400">{data.nationality} · Age {data.age} · {data.gender}</div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${hasCondition?'bg-red-100 text-red-700':'bg-green-100 text-green-700'}`}>
            {hasCondition ? '⚠️ HIGH RISK' : '✓ STANDARD'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {[['Passport', data.passport],['Group', data.hajjGroup],['Blood Type', data.bloodType||'—'],['Wristband', data.wristbandId]].map(([k,v])=>(
            <div key={k}><div className="text-gray-400">{k}</div><div className="font-mono font-semibold text-gray-700">{v||'—'}</div></div>
          ))}
        </div>
        {condLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">{condLabels.map(c=><span key={c} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{c}</span>)}</div>
        )}
        {hasDiab && data.cgmDevice && <div className="mt-2 text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg">🩸 {data.cgmDevice} linked</div>}
      </div>

      {/* Threshold note */}
      {hasCondition && <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">⚙️ <strong>Your alert thresholds have been personalised</strong> based on your medical profile.</div>}

      {/* Integrations */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 text-sm font-semibold text-[#0f1e45]">Connected to Existing Systems</div>
        {[{name:'Nusuk — Hajj Registration Verified',icon:'🕌',desc:'Pilgrim permit and group confirmed'},{name:'Tawakkalna — Health Status Linked',icon:'🤝',desc:'Vaccination and health screening imported'},{name:'Saudi MOH — Medical Records Access',icon:'🏥',desc:'Chronic condition flags from national record'}].map(({name,icon,desc})=>(
          <div key={name} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
            <span className="text-xl">{icon}</span>
            <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-[#0f1e45]">{name}</div><div className="text-xs text-gray-400">{desc}</div></div>
            <span className="text-green-500 text-base">✓</span>
          </div>
        ))}
        <div className="px-4 py-2 text-xs text-gray-400 italic">HajjResponse does not store duplicate data — we connect to systems you are already registered with.</div>
      </div>

      {/* Privacy */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
        🔒 Your data is processed on Saudi government servers, deleted after Hajj season, and compliant with the <strong>Saudi Personal Data Protection Law (PDPL)</strong>.
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl">← Back</button>
        <button type="button" onClick={onComplete} className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200">✓ Complete Registration →</button>
      </div>
    </div>
  )
}

const EMPTY = { name:'',nationality:'',age:'',gender:'',passport:'',hajjGroup:'',conditions:[],otherConditions:'',bloodType:'',wristbandId:'',cgmDevice:'',cgmEmail:'' }

export default function PilgrimRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState(EMPTY)

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="bg-green-600 text-white px-4 pt-7 pb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>Pilgrim Registration
        </div>
        <h1 className="text-xl font-bold">Register Your Wristband</h1>
        <p className="text-green-100 text-xs mt-1">4 steps · takes about 3 minutes</p>
      </div>
      <div className="max-w-lg mx-auto">
        <ProgressBar step={step} />
        <div className="px-5 pb-8">
          {step===0 && <Step1 data={data} setData={setData} onNext={() => setStep(1)} />}
          {step===1 && <Step2 data={data} setData={setData} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step===2 && <Step3 data={data} setData={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step===3 && <Step4 data={data} onBack={() => setStep(2)} onComplete={() => navigate('/pilgrim/sos')} />}
        </div>
      </div>
    </div>
  )
}
