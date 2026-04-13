import { useState, useEffect } from 'react'

const BASE_PILGRIMS = [
  { id:1,  name:'Fatima Al-Rashidi',  nationality:'Saudi',      risk:'High',     hr:91,  temp:38.1, spo2:95, glucose:5.1,  wristband:'Active',   lastAlert:'4h ago',  status:'Monitored',  conditions:['Type 2 Diabetes','Hypertension'] },
  { id:2,  name:'Omar Al-Farsi',      nationality:'Omani',      risk:'High',     hr:98,  temp:38.4, spo2:94, glucose:null,  wristband:'Active',   lastAlert:'1h ago',  status:'Monitored',  conditions:['Hypertension'] },
  { id:3,  name:'Amina Diallo',       nationality:'Senegalese', risk:'Medium',   hr:82,  temp:37.9, spo2:97, glucose:6.3,  wristband:'Active',   lastAlert:'None',    status:'Stable',     conditions:['Type 2 Diabetes'] },
  { id:4,  name:'Ibrahim Koné',       nationality:'Ivorian',    risk:'Critical', hr:112, temp:38.9, spo2:92, glucose:null,  wristband:'Active',   lastAlert:'12m ago', status:'Alert',      conditions:['Previous Cardiac Event','Hypertension'] },
  { id:5,  name:'Khadijah Yilmaz',    nationality:'Turkish',    risk:'High',     hr:104, temp:38.6, spo2:93, glucose:null,  wristband:'Active',   lastAlert:'30m ago', status:'Monitored',  conditions:['Hypertension','Kidney Disease'] },
  { id:6,  name:'Bilal Chowdhury',    nationality:'Bangladeshi',risk:'Low',      hr:74,  temp:37.2, spo2:98, glucose:7.1,  wristband:'Active',   lastAlert:'None',    status:'Stable',     conditions:['Type 2 Diabetes'] },
  { id:7,  name:'Nour El-Din Masri',  nationality:'Egyptian',   risk:'Critical', hr:118, temp:39.1, spo2:91, glucose:null,  wristband:'Active',   lastAlert:'5m ago',  status:'Alert',      conditions:['Previous Cardiac Event','Asthma'] },
  { id:8,  name:'Zainab Hassan',      nationality:'Pakistani',  risk:'Medium',   hr:85,  temp:37.6, spo2:96, glucose:8.2,  wristband:'Active',   lastAlert:'2h ago',  status:'Stable',     conditions:['Type 2 Diabetes'] },
  { id:9,  name:'Ahmed Boudiaf',      nationality:'Algerian',   risk:'Low',      hr:72,  temp:37.0, spo2:99, glucose:null,  wristband:'Active',   lastAlert:'None',    status:'Stable',     conditions:[] },
  { id:10, name:'Mariam Al-Yahya',    nationality:'Saudi',      risk:'Medium',   hr:88,  temp:37.8, spo2:96, glucose:9.4,  wristband:'Offline',  lastAlert:'3h ago',  status:'Monitored',  conditions:['Type 2 Diabetes','Obesity'] },
]

const RISK_ROW = { Critical:'bg-red-50 border-l-4 border-red-500', High:'bg-amber-50 border-l-4 border-amber-400', Medium:'bg-white', Low:'bg-white' }
const RISK_BADGE = { Critical:'bg-red-100 text-red-700', High:'bg-orange-100 text-orange-700', Medium:'bg-amber-100 text-amber-700', Low:'bg-green-100 text-green-700' }
const STATUS_BADGE = { Alert:'bg-red-100 text-red-700', Monitored:'bg-blue-100 text-blue-700', Stable:'bg-green-100 text-green-700' }

function cellColor(val, m) {
  if (!val) return 'text-gray-400'
  if (m==='hr')      return val>110?'text-red-600 font-bold':val>95?'text-amber-600 font-semibold':'text-gray-700'
  if (m==='temp')    return val>38.5?'text-red-600 font-bold':val>38?'text-amber-600 font-semibold':'text-gray-700'
  if (m==='spo2')    return val<93?'text-red-600 font-bold':val<95?'text-amber-600 font-semibold':'text-gray-700'
  if (m==='glucose') return val<4?'text-red-600 font-bold':val>10?'text-amber-600 font-semibold':'text-gray-700'
  return 'text-gray-700'
}

export default function ManagementPilgrims() {
  const [pilgrims, setPilgrims] = useState(BASE_PILGRIMS)
  const [search, setSearch]     = useState('')
  const [filterRisk, setFilterRisk]   = useState('')
  const [filterCond, setFilterCond]   = useState('')
  const [expanded, setExpanded]       = useState(null)

  // live updates every 5s
  useEffect(() => {
    const t = setInterval(() => {
      setPilgrims(prev => prev.map(p => ({
        ...p,
        hr:      Math.max(60, Math.min(130, p.hr + Math.round((Math.random()-0.48)*3))),
        temp:    parseFloat(Math.max(36.5, Math.min(40, p.temp+(Math.random()-0.5)*0.1)).toFixed(1)),
        spo2:    Math.max(88, Math.min(100, p.spo2+Math.round((Math.random()-0.5)*2))),
        glucose: p.glucose!==null ? parseFloat(Math.max(3.5, Math.min(14, p.glucose+(Math.random()-0.5)*0.3)).toFixed(1)) : null,
      })))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const filtered = pilgrims.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.nationality.toLowerCase().includes(search.toLowerCase())) return false
    if (filterRisk && p.risk !== filterRisk) return false
    if (filterCond && !p.conditions.some(c => c.toLowerCase().includes(filterCond.toLowerCase()))) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0f1e45] text-white px-4 sm:px-6 py-4">
        <h1 className="font-bold text-lg">Pilgrim Monitor</h1>
        <p className="text-white/50 text-xs mt-0.5">Live vitals · updates every 5 seconds · {pilgrims.length} pilgrims registered</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f1e45]" placeholder="Search name or nationality…" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none" value={filterRisk} onChange={e=>setFilterRisk(e.target.value)}>
            <option value="">All Risk Levels</option>
            {['Critical','High','Medium','Low'].map(r=><option key={r}>{r}</option>)}
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none" value={filterCond} onChange={e=>setFilterCond(e.target.value)}>
            <option value="">All Conditions</option>
            {['Diabetes','Hypertension','Cardiac','Asthma','Kidney'].map(c=><option key={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-green-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Live · 5s
          </div>
        </div>

        {/* Desktop table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  {['Name','Risk','Heart Rate','Temp','SpO₂','Glucose','Wristband','Last Alert','Status',''].map(h=>(
                    <th key={h} className="px-3 py-3 text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <>
                    <tr key={p.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${RISK_ROW[p.risk]}`} onClick={() => setExpanded(expanded===p.id?null:p.id)}>
                      <td className="px-3 py-3"><div className="font-semibold text-[#0f1e45]">{p.name}</div><div className="text-gray-400 text-[10px]">{p.nationality}</div></td>
                      <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${RISK_BADGE[p.risk]}`}>{p.risk}</span></td>
                      <td className={`px-3 py-3 font-mono ${cellColor(p.hr,'hr')}`}>{p.hr} bpm</td>
                      <td className={`px-3 py-3 font-mono ${cellColor(p.temp,'temp')}`}>{p.temp}°C</td>
                      <td className={`px-3 py-3 font-mono ${cellColor(p.spo2,'spo2')}`}>{p.spo2}%</td>
                      <td className={`px-3 py-3 font-mono ${p.glucose!==null?cellColor(p.glucose,'glucose'):'text-gray-300'}`}>{p.glucose!==null?`${p.glucose}`:'—'}</td>
                      <td className={`px-3 py-3 font-medium ${p.wristband==='Active'?'text-green-600':'text-red-500'}`}>{p.wristband}</td>
                      <td className="px-3 py-3 text-gray-400 whitespace-nowrap">{p.lastAlert}</td>
                      <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BADGE[p.status]}`}>{p.status}</span></td>
                      <td className="px-3 py-3 text-gray-400">{expanded===p.id?'▲':'▼'}</td>
                    </tr>
                    {expanded===p.id && (
                      <tr key={`${p.id}-expand`} className="bg-blue-50">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="text-xs space-y-2">
                            <div className="font-semibold text-[#0f1e45]">Full Profile — {p.name}</div>
                            <div><span className="text-gray-500 mr-2">Conditions:</span>
                              {p.conditions.length>0 ? p.conditions.map(c=><span key={c} className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full mr-1 text-[10px] font-medium">{c}</span>) : <span className="text-gray-400">None on record</span>}
                            </div>
                            <div className="flex gap-6">
                              <div><span className="text-gray-500 mr-1">Risk:</span><strong>{p.risk}</strong></div>
                              <div><span className="text-gray-500 mr-1">Status:</span><strong>{p.status}</strong></div>
                              <div><span className="text-gray-500 mr-1">Wristband:</span><strong className={p.wristband==='Active'?'text-green-600':'text-red-500'}>{p.wristband}</strong></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(p => (
            <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-4 ${p.status==='Alert'?'border-red-200':'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <div><div className="font-semibold text-sm text-[#0f1e45]">{p.name}</div><div className="text-xs text-gray-400">{p.nationality}</div></div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>{p.status}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[{l:'HR',v:`${p.hr}`,m:'hr'},{l:'Temp',v:`${p.temp}`,m:'temp'},{l:'SpO₂',v:`${p.spo2}%`,m:'spo2'},{l:'BGL',v:p.glucose?`${p.glucose}`:'—',m:'glucose'}].map(({l,v,m})=>(
                  <div key={l} className="bg-gray-50 rounded-lg p-1.5">
                    <div className="text-[9px] text-gray-400">{l}</div>
                    <div className={`text-sm font-bold ${cellColor(parseFloat(v),m)}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-4 text-xs text-gray-400 flex-wrap">
          <span className="text-red-600 font-semibold">Red = above/below threshold</span>
          <span className="text-amber-600 font-semibold">Amber = approaching threshold</span>
          <span>— = no CGM device</span>
          <span>Click row to expand profile</span>
        </div>
      </div>
    </div>
  )
}
