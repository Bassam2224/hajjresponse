import { useState, useEffect } from 'react'
import { useIncidents } from '../context/IncidentContext'

// ── Helpers ──────────────────────────────────────────────────────────────────
const TIER = {
  1: { label: 'Tier 1 — Volunteer', color: 'bg-green-100 text-green-700 border-green-300' },
  2: { label: 'Tier 2 — Golf Cart', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  3: { label: 'Tier 3 — Ambulance', color: 'bg-red-100 text-red-700 border-red-300' },
}
const RISK_COLOR = {
  Critical: 'bg-red-100 text-red-700',
  High:     'bg-orange-100 text-orange-700',
  Medium:   'bg-amber-100 text-amber-700',
  Low:      'bg-green-100 text-green-700',
}
const STATUS_COLOR = {
  'En Route':  'text-blue-600',
  'On Scene':  'text-amber-600',
  Pending:     'text-red-600',
  Resolved:    'text-green-600',
  Dispatched:  'text-purple-600',
}
function fmtElapsed(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

// ── Pilgrim Monitor data (mock live vitals) ───────────────────────────────────
const BASE_PILGRIMS = [
  { id: 1, name: 'Fatima Al-Rashidi',  nationality: 'Saudi',      risk: 'High',     hr: 91,  temp: 38.1, spo2: 95, glucose: 5.1,  lastAlert: '4h ago',  status: 'Monitored' },
  { id: 2, name: 'Omar Al-Farsi',      nationality: 'Omani',      risk: 'High',     hr: 98,  temp: 38.4, spo2: 94, glucose: null,  lastAlert: '1h ago',  status: 'Monitored' },
  { id: 3, name: 'Amina Diallo',       nationality: 'Senegalese', risk: 'Medium',   hr: 82,  temp: 37.9, spo2: 97, glucose: 6.3,  lastAlert: 'None',    status: 'Stable'    },
  { id: 4, name: 'Ibrahim Koné',       nationality: 'Ivorian',    risk: 'Critical', hr: 112, temp: 38.9, spo2: 92, glucose: null,  lastAlert: '12m ago', status: 'Alert'     },
  { id: 5, name: 'Khadijah Yilmaz',    nationality: 'Turkish',    risk: 'High',     hr: 104, temp: 38.6, spo2: 93, glucose: null,  lastAlert: '30m ago', status: 'Monitored' },
  { id: 6, name: 'Bilal Chowdhury',    nationality: 'Bangladeshi',risk: 'Low',      hr: 74,  temp: 37.2, spo2: 98, glucose: 7.1,  lastAlert: 'None',    status: 'Stable'    },
  { id: 7, name: 'Nour El-Din Masri',  nationality: 'Egyptian',   risk: 'Critical', hr: 118, temp: 39.1, spo2: 91, glucose: null,  lastAlert: '5m ago',  status: 'Alert'     },
  { id: 8, name: 'Zainab Hassan',      nationality: 'Pakistani',  risk: 'Medium',   hr: 85,  temp: 37.6, spo2: 96, glucose: 8.2,  lastAlert: '2h ago',  status: 'Stable'    },
]

function useLivePilgrims() {
  const [pilgrims, setPilgrims] = useState(BASE_PILGRIMS)
  useEffect(() => {
    const t = setInterval(() => {
      setPilgrims(prev => prev.map(p => ({
        ...p,
        hr:      Math.max(60, Math.min(130, p.hr   + Math.round((Math.random() - 0.48) * 3))),
        temp:    parseFloat((Math.max(36.5, Math.min(40, p.temp + (Math.random() - 0.5) * 0.1))).toFixed(1)),
        glucose: p.glucose !== null ? parseFloat((Math.max(3.5, Math.min(14, p.glucose + (Math.random() - 0.5) * 0.3))).toFixed(1)) : null,
      })))
    }, 3000)
    return () => clearInterval(t)
  }, [])
  return pilgrims
}

// ── Incident feed tab ─────────────────────────────────────────────────────────
function IncidentFeed({ incidents }) {
  const [selected, setSelected] = useState(null)
  const selectedFresh = selected ? incidents.find(i => i.id === selected.id) || selected : null
  const active   = incidents.filter(i => i.status !== 'Resolved')
  const critical = incidents.filter(i => i.risk === 'Critical' && i.status !== 'Resolved')

  return (
    <div>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Active Incidents', val: String(active.length),   sub: `${critical.length} critical`,  color: 'text-red-600'      },
          { label: 'Avg Response Time', val: '3m 47s',               sub: '↓ 68% vs baseline',            color: 'text-green-600'    },
          { label: 'Responders On Duty', val: '128',                  sub: '14 dispatched',                color: 'text-blue-600'     },
          { label: 'Pilgrims Monitored', val: '2.47M',                sub: '99.7% coverage',               color: 'text-[#0f1e45]'    },
        ].map(({ label, val, sub, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        {/* Feed */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#0f1e45] text-sm">Active Incidents</h3>
            <span className="text-xs text-gray-400">+1 auto every 30s</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelected(inc)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedFresh?.id === inc.id ? 'bg-blue-50' : ''} ${inc.status === 'Resolved' ? 'opacity-55' : ''}`}
              >
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-semibold text-sm text-[#0f1e45]">{inc.pilgrim}</span>
                      <span className="text-xs text-gray-400">({inc.nationality})</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RISK_COLOR[inc.risk]}`}>{inc.risk}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-700">{inc.type}</span>
                      <span className="mx-1">·</span>
                      {inc.zone}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIER[inc.tier].color}`}>{TIER[inc.tier].label}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{inc.detection}</span>
                      {inc.glucose && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">💊 Glucose gel</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mt-0.5">
                    <div className={`text-xs font-semibold ${STATUS_COLOR[inc.status] || 'text-gray-500'}`}>{inc.status}</div>
                    <div className="text-xs text-gray-400">{fmtElapsed(inc.elapsed)}</div>
                    <div className="text-xs text-gray-300">{inc.id}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-[#0f1e45] text-sm">Incident Detail</h3>
          </div>
          {selectedFresh ? (
            <div className="p-4 space-y-2.5 text-sm">
              {[
                ['Pilgrim',    `${selectedFresh.pilgrim} · ${selectedFresh.nationality} · Age ${selectedFresh.age}`],
                ['Type',       selectedFresh.type],
                ['Location',   selectedFresh.zone],
                ['Detection',  selectedFresh.detection],
                ['Responder',  selectedFresh.responder],
                ['Elapsed',    fmtElapsed(selectedFresh.elapsed)],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{k}</div>
                  <div className={`font-medium ${k === 'Responder' && selectedFresh.responder === 'Unassigned' ? 'text-red-600' : 'text-gray-800'}`}>{v}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Tier</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TIER[selectedFresh.tier].color}`}>
                  {TIER[selectedFresh.tier].label}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Risk</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${RISK_COLOR[selectedFresh.risk]}`}>{selectedFresh.risk}</span>
              </div>
              {selectedFresh.glucose && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-blue-800 mb-1">💊 Responder Note</div>
                  <div className="text-xs text-blue-700">Diabetic pilgrim — carry glucose gel and glucometer. No insulin without assessment.</div>
                </div>
              )}
              <button className="w-full bg-[#dc2626] hover:bg-red-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors mt-1">
                Dispatch Nearest Responder
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-xs text-center px-4">
              Select an incident to view details
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-[#0f1e45] text-sm">Live Zone Map</h3>
          <span className="text-xs text-green-600 font-medium">● 5 sites active</span>
        </div>
        <div className="bg-[#1a2f5e] h-52 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-10">
            {[...Array(8)].map((_, i)  => <line key={`h${i}`} x1="0" y1={`${i*12.5}%`} x2="100%" y2={`${i*12.5}%`} stroke="#60a5fa" strokeWidth="0.5"/>)}
            {[...Array(12)].map((_, i) => <line key={`v${i}`} x1={`${i*8.33}%`} y1="0" x2={`${i*8.33}%`} y2="100%" stroke="#60a5fa" strokeWidth="0.5"/>)}
          </svg>
          {[
            { x: '18%', y: '35%', label: 'Masjid al-Haram', color: 'bg-red-500',    size: 'w-4 h-4' },
            { x: '38%', y: '55%', label: 'Mina Sector 3',   color: 'bg-red-400',    size: 'w-3 h-3' },
            { x: '62%', y: '60%', label: 'Arafat Plain',    color: 'bg-amber-500',  size: 'w-3 h-3' },
            { x: '50%', y: '72%', label: 'Muzdalifah',      color: 'bg-blue-400',   size: 'w-3 h-3' },
            { x: '30%', y: '28%', label: 'Jamarat Bridge',  color: 'bg-orange-400', size: 'w-3 h-3' },
          ].map(({ x, y, label, color, size }) => (
            <div key={label} className="absolute flex flex-col items-center" style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}>
              <div className={`${size} rounded-full ${color} animate-pulse shadow-lg`}></div>
              <div className="text-white text-[10px] mt-1 font-medium whitespace-nowrap bg-black/30 px-1 rounded">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Pilgrim Monitor tab ───────────────────────────────────────────────────────
function PilgrimMonitor() {
  const pilgrims = useLivePilgrims()

  const riskDot = { Critical: 'bg-red-500', High: 'bg-orange-400', Medium: 'bg-amber-400', Low: 'bg-green-400' }
  const statusBadge = {
    Alert:     'bg-red-100 text-red-700',
    Monitored: 'bg-blue-100 text-blue-700',
    Stable:    'bg-green-100 text-green-700',
  }

  function cellColor(val, metric) {
    if (metric === 'hr')      return val > 110 ? 'text-red-600 font-bold' : val > 95 ? 'text-amber-600 font-semibold' : 'text-gray-700'
    if (metric === 'temp')    return val > 38.5 ? 'text-red-600 font-bold' : val > 38.0 ? 'text-amber-600 font-semibold' : 'text-gray-700'
    if (metric === 'spo2')    return val < 93 ? 'text-red-600 font-bold' : val < 95 ? 'text-amber-600 font-semibold' : 'text-gray-700'
    if (metric === 'glucose') return val < 4.0 ? 'text-red-600 font-bold' : val > 10 ? 'text-amber-600 font-semibold' : 'text-gray-700'
    return 'text-gray-700'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[#0f1e45]">High-Risk Pilgrim Monitor</h3>
          <p className="text-xs text-gray-400 mt-0.5">Live vitals · updates every 3 seconds · red = above/below threshold</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {['Name', 'Risk', 'Heart Rate', 'Temp', 'SpO₂', 'Glucose', 'Last Alert', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pilgrims.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.status === 'Alert' ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#0f1e45]">{p.name}</div>
                    <div className="text-gray-400 text-[10px]">{p.nationality}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${riskDot[p.risk]}`}></div>
                      <span className={`font-medium ${RISK_COLOR[p.risk].replace('bg-', 'text-').replace('-100', '-700')}`}>{p.risk}</span>
                    </div>
                  </td>
                  <td className={`px-4 py-3 font-mono ${cellColor(p.hr, 'hr')}`}>{p.hr} bpm</td>
                  <td className={`px-4 py-3 font-mono ${cellColor(p.temp, 'temp')}`}>{p.temp}°C</td>
                  <td className={`px-4 py-3 font-mono ${cellColor(p.spo2, 'spo2')}`}>{p.spo2}%</td>
                  <td className={`px-4 py-3 font-mono ${p.glucose !== null ? cellColor(p.glucose, 'glucose') : 'text-gray-300'}`}>
                    {p.glucose !== null ? `${p.glucose} mmol/L` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{p.lastAlert}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge[p.status]}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {pilgrims.map(p => (
          <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-4 ${p.status === 'Alert' ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-sm text-[#0f1e45]">{p.name}</div>
                <div className="text-xs text-gray-400">{p.nationality}</div>
              </div>
              <div className="flex gap-1.5 items-center">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge[p.status]}`}>{p.status}</span>
                <div className={`w-2 h-2 rounded-full ${riskDot[p.risk]}`}></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'HR',    val: `${p.hr}`,     unit: 'bpm',    m: 'hr'      },
                { label: 'Temp',  val: `${p.temp}`,   unit: '°C',     m: 'temp'    },
                { label: 'SpO₂', val: `${p.spo2}`,   unit: '%',      m: 'spo2'    },
                { label: 'BGL',   val: p.glucose ? `${p.glucose}` : '—', unit: 'mmol', m: 'glucose' },
              ].map(({ label, val, unit, m }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-1.5">
                  <div className="text-[10px] text-gray-400">{label}</div>
                  <div className={`text-sm font-bold ${cellColor(parseFloat(val), m)}`}>{val}</div>
                  <div className="text-[9px] text-gray-300">{unit}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-400">Last alert: {p.lastAlert}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="text-red-600 font-semibold">Red = above/below threshold</span>
        <span className="text-amber-600 font-semibold">Amber = approaching threshold</span>
        <span className="text-gray-400">— = no CGM device</span>
      </div>
    </div>
  )
}

// ── Dashboard shell ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { incidents } = useIncidents()
  const [tab, setTab] = useState('incidents')
  const active   = incidents.filter(i => i.status !== 'Resolved')
  const critical = incidents.filter(i => i.risk === 'Critical' && i.status !== 'Resolved')

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Console bar */}
      <div className="bg-[#0f1e45] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="font-semibold text-sm">Dispatcher Console</span>
          <span className="bg-[#1a3060] text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
            Command Center
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-white/70">
          <span>All Hajj Sites</span>
          <span className="text-[#f59e0b] font-semibold">{active.length} Active · {critical.length} Critical</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-7xl mx-auto flex gap-0">
          {[
            { id: 'incidents', label: 'Live Incidents', icon: '🚨' },
            { id: 'monitor',   label: 'Pilgrim Monitor', icon: '🩺' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                tab === id
                  ? 'border-[#0f1e45] text-[#0f1e45]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span>{icon}</span>
              {label}
              {id === 'incidents' && active.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {active.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {tab === 'incidents' ? (
          <IncidentFeed incidents={incidents} />
        ) : (
          <PilgrimMonitor />
        )}
      </div>
    </div>
  )
}
