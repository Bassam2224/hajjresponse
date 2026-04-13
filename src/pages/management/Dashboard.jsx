import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useIncidents } from '../../context/IncidentContext'
import { STATUS_STAGES } from '../../context/IncidentContext'
import { HOSPITALS, HEALTH_CENTERS, haversineDist } from '../../data/medicalFacilities'
import { useTheme } from '../../context/ThemeContext'
import { classifyGlucose } from '../../utils/glucoseLogic'

// ── Leaflet icon factories ─────────────────────────────────────────────────
const makeIcon = (html, w, h) => L.divIcon({
  className: '',
  html,
  iconSize:   [w, h],
  iconAnchor: [w / 2, h / 2],
  popupAnchor:[0, -(h / 2) - 2],
})

const INCIDENT_ICON = makeIcon(`
  <div style="width:14px;height:14px;border-radius:50%;background:#dc2626;border:2px solid white;
    box-shadow:0 0 0 0 rgba(220,38,38,0.6);animation:pulseInc 1.5s infinite;">
  </div>
  <style>@keyframes pulseInc{0%{box-shadow:0 0 0 0 rgba(220,38,38,0.7)}70%{box-shadow:0 0 0 10px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}</style>
`, 14, 14)

const RESPONDER_ICON = makeIcon(
  `<div style="width:12px;height:12px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`,
  12, 12
)

const HOSPITAL_ICON = makeIcon(`
  <div style="width:22px;height:22px;border-radius:50%;background:#15803d;border:2.5px solid white;
    display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:900;
    box-shadow:0 2px 6px rgba(0,0,0,0.35);">H</div>
`, 22, 22)

const CENTER_ICON = makeIcon(`
  <div style="width:16px;height:16px;border-radius:50%;background:#16a34a;border:2px solid white;
    display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:700;
    box-shadow:0 1px 4px rgba(0,0,0,0.3);">+</div>
`, 16, 16)

// ── Zone polygons (accurate Hajj site boundaries) ─────────────────────────
const ZONE_POLYGONS = [
  { name:'Masjid al-Haram', color:'#2563eb', coords:[[21.428,39.820],[21.428,39.833],[21.417,39.833],[21.417,39.820]] },
  { name:'Jamarat',         color:'#dc2626', coords:[[21.428,39.856],[21.428,39.874],[21.416,39.874],[21.416,39.856]] },
  { name:'Mina',            color:'#f59e0b', coords:[[21.432,39.873],[21.432,39.898],[21.413,39.898],[21.413,39.873]] },
  { name:'Muzdalifah',      color:'#7c3aed', coords:[[21.395,39.912],[21.395,39.930],[21.378,39.930],[21.378,39.912]] },
  { name:'Arafat',          color:'#16a34a', coords:[[21.370,39.975],[21.370,40.005],[21.345,40.005],[21.345,39.975]] },
]

const ZONE_CENTERS = {
  'Masjid al-Haram': [21.4225, 39.8262],
  'Mina':            [21.4220, 39.8850],
  'Arafat':          [21.3547, 39.9847],
  'Muzdalifah':      [21.3830, 39.9210],
  'Jamarat':         [21.4228, 39.8656],
}

const MAP_RESPONDERS = [
  { name:'K. Ali',     zone:'Masjid al-Haram', coords:[21.4220, 39.8270] },
  { name:'M. Rashid',  zone:'Masjid al-Haram', coords:[21.4230, 39.8255] },
  { name:'A. Hassan',  zone:'Mina',            coords:[21.4210, 39.8860] },
  { name:'B. Malik',   zone:'Mina',            coords:[21.4200, 39.8880] },
  { name:'S. Ahmed',   zone:'Arafat',          coords:[21.3550, 39.9840] },
  { name:'R. Khan',    zone:'Arafat',          coords:[21.3540, 39.9855] },
  { name:'N. Diallo',  zone:'Muzdalifah',      coords:[21.3835, 39.9160] },
  { name:'Y. Ibrahim', zone:'Jamarat',         coords:[21.4230, 39.8650] },
  { name:'H. Said',    zone:'Jamarat',         coords:[21.4225, 39.8665] },
]

function incidentCoords(inc) {
  const base = ZONE_CENTERS[inc.zone] || [21.4220, 39.8850]
  const seed = inc.id.charCodeAt(inc.id.length - 1)
  return [
    base[0] + ((seed % 7) - 3) * 0.0007,
    base[1] + ((seed % 5) - 2) * 0.0007,
  ]
}

// ── Tier / risk colours ────────────────────────────────────────────────────
const TIER = {
  1:{ label:'Tier 1 — Volunteer',  color:'bg-green-100 text-green-700 border-green-300' },
  2:{ label:'Tier 2 — Golf Cart',  color:'bg-amber-100 text-amber-700 border-amber-300' },
  3:{ label:'Tier 3 — Ambulance',  color:'bg-red-100   text-red-700   border-red-300'   },
}
const RISK_COLOR = {
  Critical:'bg-red-100 text-red-700',
  High:    'bg-orange-100 text-orange-700',
  Medium:  'bg-amber-100 text-amber-700',
  Low:     'bg-green-100 text-green-700',
}

function fmtElapsed(s) { const m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s` }
function stageIdx(status) { const i=STATUS_STAGES.indexOf(status); return i>=0?i:0 }

function StatusTimeline({ status }) {
  const idx = stageIdx(status)
  const SHORT = ['Det.','Disp.','Scene','Cart','→Med','Med Pt','Hosp.','Done']
  return (
    <div className="mt-2">
      <div className="flex items-center">
        {STATUS_STAGES.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 border ${i<=idx?'bg-[#0f1e45] border-[#0f1e45]':'bg-white border-gray-300'}`} />
            {i < STATUS_STAGES.length-1 && <div className={`flex-1 h-0.5 ${i<idx?'bg-[#0f1e45]':'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-0.5">
        {SHORT.map((s,i) => (
          <div key={s} className={`text-[7px] flex-1 text-center ${i===idx?'text-[#0f1e45] font-bold':'text-gray-300'}`}>{s}</div>
        ))}
      </div>
    </div>
  )
}

function ETACount({ eta }) {
  const [secs, setSecs] = useState(eta ? eta * 60 : 0)
  useEffect(() => { setSecs(eta ? eta * 60 : 0) }, [eta])
  useEffect(() => {
    if (!secs) return
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [secs > 0])
  if (!secs) return null
  return <span className="text-blue-600 font-mono text-xs">ETA {Math.floor(secs/60)}:{String(secs%60).padStart(2,'0')}</span>
}

function IncidentCard({ inc, updateIncident }) {
  const [msg, setMsg]           = useState('')
  const [expanded, setExpanded] = useState(false)

  const sendMsg = () => {
    if (!msg.trim()) return
    updateIncident(inc.id, { messages:[...(inc.messages||[]), { from:'Management', text:msg.trim(), time:new Date().toLocaleTimeString() }] })
    setMsg('')
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 ${inc.escalated?'border-red-400':'border-gray-100'}`}>
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className="font-semibold text-sm text-[#0f1e45]">{inc.pilgrim}</span>
            <span className="text-xs text-gray-400">({inc.nationality})</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${RISK_COLOR[inc.risk]}`}>{inc.risk}</span>
            {inc.escalated && <span className="text-xs bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">⚠️ ESCALATED</span>}
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{inc.type}</span>
            {' · '}{inc.zone}
            {' · '}
            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${inc.detection==='Manual SOS'?'bg-orange-50 text-orange-600':'bg-blue-50 text-blue-600'}`}>
              {inc.detection}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIER[inc.tier]?.color}`}>{TIER[inc.tier]?.label}</div>
          <div className="text-xs text-gray-400 mt-1">{fmtElapsed(inc.elapsed)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs mb-2 flex-wrap">
        <span className="text-gray-400">Responder:</span>
        <span className={`font-medium ${inc.responder?'text-green-700':'text-red-500'}`}>{inc.responder||'Unassigned'}</span>
        {inc.responderETA > 0 && <ETACount eta={inc.responderETA} />}
        {inc.glucose && (() => {
          const gc = inc.cgmReading ? classifyGlucose(inc.cgmReading) : null
          if (!gc || gc.id === 'normal') return (
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">🩸 Diabetic — check glucose</span>
          )
          const isHypo = gc.type === 'hypoglycemia'
          return (
            <span className={`border px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${isHypo ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-red-50 text-red-800 border-red-300'}`}>
              🩸 {inc.cgmReading} mmol/L — {gc.shortLabel}
            </span>
          )
        })()}
        {inc.glucose && inc.cgmReading && (() => {
          const gc = classifyGlucose(inc.cgmReading)
          if (!gc || gc.id === 'normal') return null
          const isHypo = gc.type === 'hypoglycemia'
          return (
            <span className={`border px-1.5 py-0.5 rounded-full text-[10px] font-black ${isHypo ? 'bg-blue-100 text-blue-900 border-blue-400' : 'bg-red-100 text-red-900 border-red-400'}`}>
              {gc.actionVerb}
            </span>
          )
        })()}
        {inc.golfCartRequested && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">🛺 Cart dispatched</span>}
        {inc.glucose && inc.cgmReading && (() => {
          const gc = classifyGlucose(inc.cgmReading)
          if (!gc || !gc.dronePayload) return null
          return (
            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              🚁 {gc.type === 'hypoglycemia' ? 'Glucagon drone' : 'IV fluid drone'}
            </span>
          )
        })()}
      </div>

      {inc.assignedMedPoint && (
        <div className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg mb-2">
          🏥 Transfer to: <strong>{inc.assignedMedPoint}</strong>
        </div>
      )}

      <StatusTimeline status={inc.status} />

      {inc.messages?.length > 0 && (
        <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
          {inc.messages.map((m,i) => (
            <div key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg flex justify-between gap-2">
              <span><strong>{m.from}:</strong> {m.text}</span>
              <span className="text-blue-400 flex-shrink-0">{m.time}</span>
            </div>
          ))}
        </div>
      )}

      {inc.escalated && inc.escalationNeeds?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {inc.escalationNeeds.map(n => <span key={n} className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{n}</span>)}
        </div>
      )}

      <div className="mt-2 border-t border-gray-50 pt-2">
        <button onClick={() => setExpanded(e=>!e)} className="text-xs text-gray-400 hover:text-gray-600">{expanded?'▲ Hide':'▼ Actions'}</button>
        {expanded && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <input className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" placeholder="Send instruction to responder…" value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} />
              <button onClick={sendMsg} className="bg-[#0f1e45] text-white text-xs font-semibold px-3 rounded-lg hover:bg-[#1a3060]">Send</button>
            </div>
            <select className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none" value={inc.status} onChange={e=>updateIncident(inc.id, {status:e.target.value})}>
              {STATUS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="w-full border border-gray-200 text-gray-500 text-xs font-semibold py-1.5 rounded-lg hover:border-amber-400 hover:text-amber-600 transition-colors">🔄 Reassign Responder</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Facility popup content ─────────────────────────────────────────────────
function FacilityPopup({ facility, incidents, updateIncident }) {
  const topActive = incidents.find(i => i.status !== 'Resolved' && i.risk === 'Critical')
    || incidents.find(i => i.status !== 'Resolved')

  const assign = () => {
    if (!topActive) return
    updateIncident(topActive.id, {
      assignedMedPoint: facility.name,
      golfCartRequested: true,
      status: 'Golf Cart En Route',
    })
  }

  return (
    <div style={{minWidth:'180px', fontSize:'12px'}}>
      <div style={{fontWeight:'700', color: facility.type==='hospital'?'#15803d':'#16a34a', marginBottom:'4px'}}>
        {facility.type==='hospital'?'🏥':'🏪'} {facility.name}
      </div>
      {facility.beds && <div style={{marginBottom:'2px'}}><strong>Beds:</strong> {facility.beds}</div>}
      {facility.bedsAvail != null && <div style={{marginBottom:'2px'}}><strong>Available:</strong> {facility.bedsAvail}</div>}
      {facility.incoming != null && <div style={{marginBottom:'2px'}}><strong>Incoming:</strong> {facility.incoming}</div>}
      {facility.vehicles != null && <div style={{marginBottom:'4px'}}><strong>Vehicles:</strong> {facility.vehicles}</div>}
      <div style={{color:'#6b7280', marginBottom:'6px', fontSize:'11px'}}>{facility.specialty}</div>
      {topActive && (
        <button
          onClick={assign}
          style={{background:'#15803d', color:'white', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'11px', fontWeight:'700', cursor:'pointer', width:'100%'}}
        >
          Assign as Transfer Point
        </button>
      )}
    </div>
  )
}

// ── Main Hajj Map ──────────────────────────────────────────────────────────
function HajjMap({ incidents, updateIncident }) {
  const { isDark } = useTheme()
  const activeInc = incidents.filter(i => i.status !== 'Resolved')
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  const tileAttr = isDark
    ? '© <a href="https://carto.com">CARTO</a>'
    : '© <a href="https://openstreetmap.org">OpenStreetMap</a>'

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{height:'440px', position:'relative'}}>
      <MapContainer
        center={[21.4225, 39.8262]}
        zoom={13}
        style={{ height:'100%', width:'100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer url={tileUrl} attribution={tileAttr} />

        {/* Zone polygons */}
        {ZONE_POLYGONS.map(z => (
          <Polygon
            key={z.name}
            positions={z.coords}
            pathOptions={{ color:z.color, fillColor:z.color, fillOpacity:0.14, weight:2, dashArray:'5,4' }}
          >
            <Tooltip permanent direction="center" sticky={false}>
              <span style={{fontSize:'10px', fontWeight:'700', color:z.color}}>{z.name}</span>
            </Tooltip>
          </Polygon>
        ))}

        {/* Hospital markers (large H) */}
        {HOSPITALS.map(h => (
          <Marker key={h.id} position={h.coords} icon={HOSPITAL_ICON}>
            <Tooltip><span style={{fontSize:'11px', fontWeight:'700'}}>{h.name}{h.beds?` — ${h.beds} beds`:''}</span></Tooltip>
            <Popup>
              <FacilityPopup facility={{...h, type:'hospital'}} incidents={incidents} updateIncident={updateIncident} />
            </Popup>
          </Marker>
        ))}

        {/* Health center markers (smaller +) */}
        {HEALTH_CENTERS.map(hc => (
          <Marker key={hc.id} position={hc.coords} icon={CENTER_ICON}>
            <Tooltip><span style={{fontSize:'10px', fontWeight:'600'}}>{hc.name}</span></Tooltip>
            <Popup>
              <FacilityPopup facility={{...hc, type:'center'}} incidents={incidents} updateIncident={updateIncident} />
            </Popup>
          </Marker>
        ))}

        {/* Responder markers */}
        {MAP_RESPONDERS.map(r => (
          <Marker key={r.name} position={r.coords} icon={RESPONDER_ICON}>
            <Tooltip><span style={{fontSize:'10px', fontWeight:'600'}}>🚶 {r.name} · {r.zone}</span></Tooltip>
          </Marker>
        ))}

        {/* Active incident markers */}
        {activeInc.map(inc => (
          <Marker key={inc.id} position={incidentCoords(inc)} icon={INCIDENT_ICON}>
            <Popup>
              <div style={{minWidth:'150px', fontSize:'12px'}}>
                <div style={{fontWeight:'700', color:'#dc2626', marginBottom:'4px'}}>{inc.type}</div>
                <div style={{marginBottom:'2px'}}><strong>Patient:</strong> {inc.pilgrim}</div>
                <div style={{marginBottom:'2px'}}><strong>Zone:</strong> {inc.zone}</div>
                <div style={{marginBottom:'2px'}}><strong>Risk:</strong> {inc.risk}</div>
                <div><strong>Responder:</strong> {inc.responder || 'Unassigned'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/93 backdrop-blur-sm rounded-xl px-3 py-2 shadow border border-gray-200 text-[10px] space-y-1 pointer-events-none">
        <div className="font-semibold text-gray-600 mb-1">Legend</div>
        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-flex items-center justify-center text-white text-[8px] font-bold">!</span> Active Incident</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Responder</div>
        <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-green-700 inline-flex items-center justify-center text-white text-[8px] font-bold">H</span> Hospital</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-flex items-center justify-center text-white text-[7px] font-bold">+</span> Health Centre</div>
      </div>
    </div>
  )
}

// ── Medical Points Live Panel ──────────────────────────────────────────────
function MedicalPointsPanel({ incidents }) {
  // Find highest-priority active incident to compute distances
  const topInc = incidents.find(i => i.status !== 'Resolved' && i.risk === 'Critical')
    || incidents.find(i => i.status !== 'Resolved')
  const refCoords = topInc ? (ZONE_CENTERS[topInc.zone] || [21.4225, 39.8262]) : [21.4225, 39.8262]

  const hospitalsWithDist = HOSPITALS.map(h => ({
    ...h,
    dist: haversineDist(refCoords, h.coords),
    // count incidents assigned to this hospital
    incomingLive: incidents.filter(i => i.assignedMedPoint === h.name && i.status !== 'Resolved').length || h.incoming,
  })).sort((a,b) => a.dist - b.dist)

  const capacityColor = (avail) => {
    if (avail == null) return 'border-gray-200'
    if (avail > 100) return 'border-green-300 bg-green-50'
    if (avail > 30)  return 'border-amber-300 bg-amber-50'
    return 'border-red-300 bg-red-50'
  }
  const capacityBadge = (avail) => {
    if (avail == null) return 'bg-gray-100 text-gray-500'
    if (avail > 100) return 'bg-green-100 text-green-700'
    if (avail > 30)  return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
      <div className="px-4 py-3 border-b border-gray-100 bg-green-700 text-white">
        <h3 className="font-semibold text-sm">Hospitals — Live Status</h3>
        <p className="text-green-100 text-xs mt-0.5">
          {topInc ? `Distances from highest-priority incident (${topInc.zone})` : 'Distances from Masjid al-Haram'}
          {' · '}Emergency vehicles never enter crowd zones
        </p>
      </div>
      <div className="p-3 space-y-2.5">
        {hospitalsWithDist.map(h => (
          <div key={h.id} className={`rounded-xl border-2 p-3 ${capacityColor(h.bedsAvail)}`}>
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-xs text-[#0f1e45] leading-tight truncate">{h.name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{h.specialty}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${capacityBadge(h.bedsAvail)}`}>
                  {h.bedsAvail != null ? `${h.bedsAvail} beds free` : 'Capacity N/A'}
                </span>
                <div className="text-[10px] text-blue-600 font-mono mt-1">{(h.dist/1000).toFixed(1)}km away</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-white/60 rounded-lg py-1.5">
                <div className={`font-bold ${h.bedsAvail>100?'text-green-700':h.bedsAvail>30?'text-amber-600':'text-red-600'}`}>{h.bedsAvail ?? '—'}</div>
                <div className="text-gray-400">Available</div>
              </div>
              <div className={`rounded-lg py-1.5 ${h.incomingLive>0?'bg-amber-50':'bg-white/60'}`}>
                <div className={`font-bold ${h.incomingLive>0?'text-amber-600':'text-gray-400'}`}>{h.incomingLive}</div>
                <div className="text-gray-400">Incoming</div>
              </div>
              <div className="bg-blue-50 rounded-lg py-1.5">
                <div className="font-bold text-blue-600">{h.vehicles ?? '—'}</div>
                <div className="text-gray-400">Vehicles</div>
              </div>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-gray-400 text-center px-2 pt-1">
          Based on verified Hajj 2025 data · 5 hospitals in Mina · 7 health centres in Muzdalifah · 5 medical centres at Jamarat Bridge
        </p>
      </div>
    </div>
  )
}

// ── AI Predictive Monitor ──────────────────────────────────────────────────
const AI_PILGRIMS = [
  { id:'P-1001', name:'Mohammed Al-Otaibi', age:72, nationality:'Saudi', zone:'Mina',       risk:82, temp:38.9, hr:108, spo2:93, exposure:'1h 23m', factors:['Age 72','Prolonged sun exposure','HR elevated','Temp 38.9°C'], status:'alert' },
  { id:'P-1002', name:'Fatima Nasser',      age:65, nationality:'Saudi', zone:'Jamarat',    risk:71, temp:38.6, hr:101, spo2:94, exposure:'52m',    factors:['Age 65','Direct sun Jamarat','Hypertension history'],          status:'alert' },
  { id:'P-1003', name:'Ibrahim Diallo',     age:58, nationality:'Mali',  zone:'Arafat',     risk:63, temp:38.4, hr:96,  spo2:95, exposure:'2h 10m', factors:['Prolonged outdoor exposure','Arafat heat peak'],               status:'watch' },
  { id:'P-1004', name:'Amina Yusuf',        age:44, nationality:'Somalia',zone:'Mina',      risk:47, temp:37.9, hr:88,  spo2:96, exposure:'34m',    factors:['Moderate temp elevation','Light activity'],                     status:'watch' },
  { id:'P-1005', name:'Ahmed Kamara',       age:61, nationality:'Senegal',zone:'Muzdalifah',risk:38, temp:37.6, hr:82,  spo2:97, exposure:'28m',    factors:['Mild sun exposure','Age 61'],                                   status:'ok'   },
  { id:'P-1006', name:'Khadija Rahman',     age:39, nationality:'Bangladesh',zone:'Masjid al-Haram',risk:22,temp:37.2,hr:75,spo2:98,exposure:'18m',factors:['Indoor mostly','Low risk baseline'],                             status:'ok'   },
  { id:'P-1007', name:'Umar Al-Farsi',      age:68, nationality:'Oman',  zone:'Jamarat',    risk:74, temp:38.7, hr:104, spo2:93, exposure:'1h 5m',  factors:['Age 68','Recent cardiac history','Jamarat crowd heat'],         status:'alert' },
  { id:'P-1008', name:'Layla Hassan',       age:52, nationality:'Egypt', zone:'Arafat',     risk:41, temp:37.8, hr:85,  spo2:96, exposure:'45m',    factors:['Sun exposure building','Moderate risk'],                        status:'watch' },
  { id:'P-1009', name:'Tariq Musa',         age:33, nationality:'Jordan',zone:'Mina',       risk:18, temp:36.9, hr:72,  spo2:98, exposure:'12m',    factors:['Young age','Indoor resting'],                                   status:'ok'   },
  { id:'P-1010', name:'Nour Al-Din',        age:76, nationality:'Morocco',zone:'Mina',      risk:88, temp:39.2, hr:115, spo2:92, exposure:'1h 48m', factors:['Age 76','CRITICAL — temp 39.2°C','SpO₂ 92%','HR 115'],          status:'critical' },
]

function AIPredictiveMonitor() {
  const [filter, setFilter] = useState('all')
  const [alertSent, setAlertSent] = useState({})

  const filtered = filter === 'all' ? AI_PILGRIMS : AI_PILGRIMS.filter(p => p.status === filter)
  const counts = { critical: AI_PILGRIMS.filter(p=>p.status==='critical').length, alert: AI_PILGRIMS.filter(p=>p.status==='alert').length, watch: AI_PILGRIMS.filter(p=>p.status==='watch').length, ok: AI_PILGRIMS.filter(p=>p.status==='ok').length }

  const statusColor = { critical:'bg-red-100 text-red-700 border-red-300', alert:'bg-amber-100 text-amber-700 border-amber-300', watch:'bg-yellow-100 text-yellow-700 border-yellow-200', ok:'bg-green-100 text-green-700 border-green-200' }
  const riskColor   = (r) => r>=70?'text-red-600':r>=40?'text-amber-600':'text-green-600'
  const riskBar     = (r) => r>=70?'bg-red-500':r>=40?'bg-amber-400':'bg-green-500'

  return (
    <div className="max-w-7xl mx-auto px-4 py-5">
      {/* Alert banner */}
      <div className="bg-purple-700 text-white rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-300 animate-pulse inline-block" />
            AI Heatstroke Prediction Engine — Healthy Pilgrim Monitor
          </div>
          <p className="text-purple-200 text-xs mt-0.5">Analysing 2.5M pilgrims in real time · Thermal cameras + wristband data · Alerts at risk ≥70%</p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label:'Critical', val:counts.critical, color:'bg-red-500' },
            { label:'Alert',    val:counts.alert,    color:'bg-amber-500' },
            { label:'Watch',    val:counts.watch,    color:'bg-yellow-500' },
            { label:'OK',       val:counts.ok,       color:'bg-green-500' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white/10 rounded-xl px-3 py-2">
              <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1`} />
              <div className="font-bold text-base">{val}</div>
              <div className="text-purple-300">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all','critical','alert','watch','ok'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filter===f?'bg-[#0f1e45] text-white':'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
            {f==='all'?`All (${AI_PILGRIMS.length})`:f==='critical'?`Critical (${counts.critical})`:f==='alert'?`Alert (${counts.alert})`:f==='watch'?`Watch (${counts.watch})`:`OK (${counts.ok})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white rounded-xl border-2 p-4 ${p.status==='critical'?'border-red-400':p.status==='alert'?'border-amber-300':p.status==='watch'?'border-yellow-200':'border-gray-100'}`}>
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-sm text-[#0f1e45]">{p.name}</span>
                  <span className="text-xs text-gray-400">Age {p.age} · {p.nationality}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${statusColor[p.status]} capitalize`}>{p.status}</span>
                  {p.status === 'critical' && <span className="text-xs bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">AUTO-ALERTING OPS</span>}
                </div>
                <div className="text-xs text-gray-500">📍 {p.zone} · ☀️ Sun exposure: <strong>{p.exposure}</strong></div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-black ${riskColor(p.risk)}`}>{p.risk}<span className="text-sm font-semibold text-gray-400">/100</span></div>
                <div className="text-xs text-gray-400">Risk Score</div>
              </div>
            </div>
            {/* Risk bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full ${riskBar(p.risk)}`} style={{width:`${p.risk}%`}} />
            </div>
            {/* Vitals */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
              <div className={`rounded-lg py-1.5 ${p.temp>38.5?'bg-red-50':'p.temp>37.5'?'bg-amber-50':'bg-gray-50'}`}>
                <div className="font-bold text-sm">{p.temp}°C</div>
                <div className="text-gray-400">Temp</div>
              </div>
              <div className={`rounded-lg py-1.5 ${p.hr>100?'bg-red-50':p.hr>85?'bg-amber-50':'bg-gray-50'}`}>
                <div className="font-bold text-sm">{p.hr}</div>
                <div className="text-gray-400">HR bpm</div>
              </div>
              <div className={`rounded-lg py-1.5 ${p.spo2<93?'bg-red-50':p.spo2<96?'bg-amber-50':'bg-gray-50'}`}>
                <div className="font-bold text-sm">{p.spo2}%</div>
                <div className="text-gray-400">SpO₂</div>
              </div>
            </div>
            {/* Factors */}
            <div className="flex flex-wrap gap-1 mb-3">
              {p.factors.map(f => <span key={f} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>)}
            </div>
            {p.status !== 'ok' && (
              <button
                onClick={() => setAlertSent(prev => ({...prev, [p.id]: true}))}
                disabled={alertSent[p.id]}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${alertSent[p.id]?'bg-green-50 text-green-700 border border-green-300':'bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                {alertSent[p.id] ? '✅ Predictive Alert Sent — Volunteer Dispatched' : '🚨 Send Predictive Alert & Dispatch Volunteer'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Drone & Camera Operations ──────────────────────────────────────────────
const DRONES = [
  { id:'DRN-01', name:'Matrice 350 RTK — Alpha', zone:'Mina', status:'delivering', battery:72, altitude:15, payload:'AED + Cooling Pack', eta:'1m 20s', thermal:true },
  { id:'DRN-02', name:'Matrice 350 RTK — Bravo', zone:'Jamarat', status:'patrolling', battery:88, altitude:18, payload:'Standby', eta:null, thermal:true },
  { id:'DRN-03', name:'Falcon AI — Surveillance', zone:'Arafat', status:'surveillance', battery:61, altitude:30, payload:'None (camera only)', eta:null, thermal:true },
]
const CAMERAS = [
  { id:'CAM-A1', label:'Jamarat Bridge — North',   alerts:3, density:'Very High', thermal:'38.6°C peak', flag:'Stationary pilgrim detected' },
  { id:'CAM-B2', label:'Mina Tent City — Sector 4', alerts:1, density:'High',      thermal:'37.9°C peak', flag:'Crowd buildup near water station' },
  { id:'CAM-C3', label:'Arafat Plain — Centre',    alerts:0, density:'Medium',    thermal:'36.8°C peak', flag:null },
  { id:'CAM-D4', label:'Masjid al-Haram — East',   alerts:5, density:'Very High', thermal:'39.1°C peak', flag:'Heat pocket detected — 12 pilgrims' },
]

function DroneCameraOps() {
  const [dispatching, setDispatching] = useState({})

  const dispatch = (id) => {
    setDispatching(prev => ({...prev, [id]: true}))
    setTimeout(() => setDispatching(prev => ({...prev, [id]: 'sent'})), 1200)
  }

  const droneStatusColor = { delivering:'bg-amber-100 text-amber-700', patrolling:'bg-blue-100 text-blue-700', surveillance:'bg-purple-100 text-purple-700' }

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
      {/* Drone fleet */}
      <div>
        <h2 className="font-bold text-[#0f1e45] mb-3 flex items-center gap-2">
          <span>🚁</span> Drone Fleet — Live Status
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal ml-1">3 active</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {DRONES.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <div className="font-semibold text-xs text-[#0f1e45] leading-tight">{d.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{d.id} · {d.zone}</div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${droneStatusColor[d.status]}`}>{d.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] mb-3">
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <div className={`font-bold text-sm ${d.battery<40?'text-red-600':d.battery<70?'text-amber-600':'text-green-600'}`}>{d.battery}%</div>
                  <div className="text-gray-400">Battery</div>
                </div>
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <div className="font-bold text-sm text-blue-600">{d.altitude}m</div>
                  <div className="text-gray-400">Altitude</div>
                </div>
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <div className="font-bold text-sm text-purple-600">{d.thermal?'ON':'OFF'}</div>
                  <div className="text-gray-400">Thermal</div>
                </div>
              </div>
              <div className="text-[11px] text-gray-600 mb-2"><strong>Payload:</strong> {d.payload}</div>
              {d.eta && <div className="text-[11px] text-amber-600 font-semibold mb-2">ETA delivery: {d.eta}</div>}
              {/* Thermal camera simulation */}
              <div className="relative rounded-lg overflow-hidden bg-gray-900 h-16 flex items-center justify-center">
                <div className="absolute inset-0 opacity-40" style={{background:'radial-gradient(ellipse at 30% 50%,#ef4444,#f97316,#1d4ed8,#1e1b4b)'}} />
                <div className="relative z-10 text-white/70 text-[10px] font-mono text-center">
                  <div>THERMAL FEED · {d.id}</div>
                  <div className="text-white/40">{d.zone} · Live</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery dispatch */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-bold text-[#0f1e45] text-sm mb-3">🏥 Dispatch Drone Medical Supply Delivery</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { payload:'AED Unit', icon:'⚡', zone:'Mina', target:'Incident INC-009', time:'~4 min' },
            { payload:'Glucose Gel x4', icon:'🍬', zone:'Jamarat', target:'Volunteer K. Ali', time:'~3 min' },
            { payload:'Cooling Pack', icon:'🧊', zone:'Arafat', target:'Incident INC-007', time:'~6 min' },
          ].map(({ payload, icon, zone, target, time }) => (
            <div key={payload} className="border border-purple-200 bg-purple-50 rounded-xl p-3">
              <div className="text-2xl mb-1.5">{icon}</div>
              <div className="font-semibold text-xs text-[#0f1e45] mb-0.5">{payload}</div>
              <div className="text-[10px] text-gray-500 mb-0.5">To: {target}</div>
              <div className="text-[10px] text-gray-500 mb-2">Zone: {zone} · Est. {time}</div>
              <button
                onClick={() => dispatch(payload)}
                disabled={dispatching[payload]}
                className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all ${dispatching[payload]==='sent'?'bg-green-100 text-green-700':'dispatching[payload]'?'bg-purple-200 text-purple-500':'bg-purple-700 hover:bg-purple-800 text-white'}`}
              >
                {dispatching[payload]==='sent' ? '✅ Dispatched' : dispatching[payload] ? 'Dispatching…' : '🚁 Dispatch Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Camera AI analysis */}
      <div>
        <h2 className="font-bold text-[#0f1e45] mb-3 flex items-center gap-2">
          <span>📷</span> Baseer AI Camera Analysis — 15,000+ Cameras
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-normal ml-1">4 flagged zones</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {CAMERAS.map(c => (
            <div key={c.id} className={`bg-white rounded-xl border shadow-sm p-4 ${c.alerts>3?'border-red-300':c.alerts>0?'border-amber-300':'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <div className="font-semibold text-xs text-[#0f1e45]">{c.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{c.id}</div>
                </div>
                {c.alerts > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.alerts>3?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{c.alerts} alert{c.alerts>1?'s':''}</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-2">
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <div className={`font-bold ${c.density==='Very High'?'text-red-600':c.density==='High'?'text-amber-600':'text-gray-700'}`}>{c.density}</div>
                  <div className="text-gray-400">Density</div>
                </div>
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <div className={`font-bold ${parseFloat(c.thermal)>38.5?'text-red-600':parseFloat(c.thermal)>37.5?'text-amber-600':'text-gray-700'}`}>{c.thermal}</div>
                  <div className="text-gray-400">Thermal</div>
                </div>
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <div className="font-bold text-purple-600">LIVE</div>
                  <div className="text-gray-400">Feed</div>
                </div>
              </div>
              {c.flag && (
                <div className="flex items-center gap-1.5 text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 text-amber-700">
                  <span>⚠️</span> {c.flag}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function ManagementDashboard() {
  const { incidents, updateIncident } = useIncidents()
  const [activeTab, setActiveTab] = useState('live')
  const active   = incidents.filter(i => i.status !== 'Resolved')
  const resolved = incidents.filter(i => i.status === 'Resolved')
  const critical = active.filter(i => i.risk === 'Critical')

  const aiAlerts = AI_PILGRIMS.filter(p => p.status === 'critical' || p.status === 'alert').length

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Stats bar */}
      <div className="bg-[#0f1e45] text-white px-4 sm:px-6 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label:'Active Incidents',   val:String(active.length),   sub:`${critical.length} critical`,   color:'text-red-400',    pulse:true  },
            { label:'Responders On Duty', val:'12',                    sub:'3 dispatched',                  color:'text-blue-300',   pulse:false },
            { label:'Avg Response Time',  val:'3.8 min',               sub:'↓ 68% vs baseline',             color:'text-green-400',  pulse:false },
            { label:'AI Predictive Alerts',val:String(aiAlerts),       sub:'healthy pilgrims flagged',      color:'text-purple-300', pulse:true  },
            { label:'Resolved Today',     val:String(resolved.length), sub:'incidents closed',              color:'text-green-400',  pulse:false },
          ].map(({ label, val, sub, color, pulse }) => (
            <div key={label} className="bg-white/10 rounded-xl px-3 py-2">
              <div className="text-xs text-white/50 mb-0.5 flex items-center gap-1">
                {pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />}
                {label}
              </div>
              <div className={`text-xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-white/40">{sub}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-3">
          {[
            { id:'live',  label:'📊 Live Operations' },
            { id:'ai',    label:'🧠 AI Predictive Monitor' },
            { id:'drone', label:'🚁 Drone & Camera Ops' },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab===id?'bg-white text-[#0f1e45]':'text-white/60 hover:text-white hover:bg-white/10'}`}>
              {label}
              {id==='ai' && aiAlerts > 0 && <span className="ml-1.5 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{aiAlerts}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'live' && (
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Left — Incident feed */}
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#0f1e45]">Live Incident Feed</h2>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  +1 auto every 30s
                </span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {incidents.length === 0 && (
                  <div className="text-center py-12 text-gray-400"><div className="text-3xl mb-2">📋</div><div>No incidents yet</div></div>
                )}
                {incidents.map(inc => (
                  <IncidentCard key={inc.id} inc={inc} updateIncident={updateIncident} />
                ))}
              </div>
            </div>
            {/* Right — Map + Hospitals */}
            <div className="lg:col-span-2">
              <h2 className="font-bold text-[#0f1e45] mb-3">Hajj Site Map — Live</h2>
              <HajjMap incidents={incidents} updateIncident={updateIncident} />
              <MedicalPointsPanel incidents={incidents} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && <AIPredictiveMonitor />}
      {activeTab === 'drone' && <DroneCameraOps />}
    </div>
  )
}
