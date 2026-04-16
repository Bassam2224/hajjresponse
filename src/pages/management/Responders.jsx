import { useState } from 'react'
import { useIncidents } from '../../context/IncidentContext'

const ROLE_COLOR = {
  'humanitarian_volunteer': 'bg-gray-100   text-gray-600',
  'paramedic_volunteer':    'bg-green-100  text-green-700',
  'golf_cart_paramedic':    'bg-amber-100  text-amber-700',
  // legacy display labels
  'Humanitarian Volunteer': 'bg-gray-100   text-gray-600',
  'Paramedic Volunteer':    'bg-green-100  text-green-700',
  'Golf Cart Paramedic':    'bg-amber-100  text-amber-700',
}
const ROLE_ICON = {
  'humanitarian_volunteer': '🙋',
  'paramedic_volunteer':    '🚶',
  'golf_cart_paramedic':    '🛺',
  'Humanitarian Volunteer': '🙋',
  'Paramedic Volunteer':    '🚶',
  'Golf Cart Paramedic':    '🛺',
}
const ROLE_LABEL = {
  'humanitarian_volunteer': 'Humanitarian Volunteer',
  'paramedic_volunteer':    'Paramedic Volunteer',
  'golf_cart_paramedic':    'Golf Cart Paramedic',
}
const STATUS_BADGE = {
  'On Duty':  'bg-green-100 text-green-700',
  'Off Duty': 'bg-gray-100  text-gray-400',
}

const BASE_RESPONDERS = [
  { id:'R01', name:'Khalid Ali',      role:'golf_cart_paramedic',    zone:'Masjid al-Haram', status:'On Duty',  assignment:'INC-003', location:'Sector B-7',       locationAge:'1m ago',  skills:['CPR','AED','IV Access','Glucagon Administration','Patient Transport'] },
  { id:'R02', name:'Mohammed Rashid', role:'paramedic_volunteer',    zone:'Masjid al-Haram', status:'On Duty',  assignment:'INC-001', location:'Sector A-2',       locationAge:'3m ago',  skills:['Basic First Aid','CPR','Crowd Navigation','Glucose Gel Administration'] },
  { id:'R03', name:'Fatima Omar',     role:'paramedic_volunteer',    zone:'Masjid al-Haram', status:'On Duty',  assignment:null,      location:'Gate 79',          locationAge:'2m ago',  skills:['Basic First Aid','Wound Care','Cooling Spray'] },
  { id:'R04', name:'Ahmed Hassan',    role:'golf_cart_paramedic',    zone:'Mina',            status:'On Duty',  assignment:'INC-002', location:'Tent City C',      locationAge:'5m ago',  skills:['CPR','AED','IV Access','Oxygen Therapy','Patient Transport'] },
  { id:'R05', name:'Bilal Malik',     role:'paramedic_volunteer',    zone:'Mina',            status:'On Duty',  assignment:null,      location:'Zone 4',           locationAge:'4m ago',  skills:['CPR','Glucose Gel Administration','Diabetic Emergency'] },
  { id:'R06', name:'Sara Ahmed',      role:'golf_cart_paramedic',    zone:'Arafat',          status:'On Duty',  assignment:null,      location:'Medical Hub',      locationAge:'7m ago',  skills:['IV Access','AED Certified','Cardiac Response','Patient Transport'] },
  { id:'R07', name:'Rami Khan',       role:'paramedic_volunteer',    zone:'Arafat',          status:'On Duty',  assignment:null,      location:'East Field',       locationAge:'2m ago',  skills:['Basic First Aid','CPR','Crowd Navigation'] },
  { id:'R08', name:'Dr. Tariq Nour',  role:'golf_cart_paramedic',    zone:'Arafat',          status:'On Duty',  assignment:null,      location:'Arafat Med Point', locationAge:'9m ago',  skills:['IV Access','Glucagon Administration','AED Certified','Patient Transport'] },
  { id:'R09', name:'Nadia Diallo',    role:'humanitarian_volunteer', zone:'Muzdalifah',      status:'On Duty',  assignment:null,      location:'Main Road',        locationAge:'6m ago',  skills:['Crowd Management','Communication'] },
  { id:'R10', name:'Yusuf Ibrahim',   role:'golf_cart_paramedic',    zone:'Jamarat',         status:'On Duty',  assignment:null,      location:'Bridge L2',        locationAge:'3m ago',  skills:['CPR','AED','Oxygen Therapy','Patient Transport'] },
  { id:'R11', name:'Hassan Said',     role:'paramedic_volunteer',    zone:'Jamarat',         status:'On Duty',  assignment:null,      location:'Jamarat Sector 2', locationAge:'8m ago',  skills:['Basic First Aid','CPR','Glucose Gel Administration'] },
  { id:'R12', name:'Layla Mansour',   role:'humanitarian_volunteer', zone:'Masjid al-Haram', status:'Off Duty', assignment:null,      location:'Base Camp',        locationAge:'1h ago',  skills:['Crowd Management','Basic First Aid'] },
]

export default function ManagementResponders() {
  const { incidents, updateIncident } = useIncidents()
  const [responders] = useState(BASE_RESPONDERS)
  const [filterZone,   setFilterZone]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRole,   setFilterRole]   = useState('')
  const [msgTarget,    setMsgTarget]    = useState(null)
  const [msg,          setMsg]          = useState('')
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignIncident, setAssignIncident] = useState('')
  const [sentMsgs,     setSentMsgs]    = useState({})

  const pendingIncidents = incidents.filter(i => i.status === 'Detected' || i.status === 'Volunteer Dispatched')

  const filtered = responders.filter(r => {
    if (filterZone   && r.zone   !== filterZone)   return false
    if (filterStatus && r.status !== filterStatus) return false
    if (filterRole   && r.role   !== filterRole)   return false
    return true
  })

  const sendMsg = r => {
    if (!msg.trim()) return
    setSentMsgs(prev => ({ ...prev, [r.id]: [...(prev[r.id]||[]), { text:msg.trim(), time:new Date().toLocaleTimeString() }] }))
    setMsg('')
    setMsgTarget(null)
  }

  const doAssign = () => {
    if (!assignIncident || !assignTarget) return
    updateIncident(assignIncident, { responder:assignTarget.name, status:'Volunteer Dispatched' })
    setAssignTarget(null)
    setAssignIncident('')
  }

  const onDuty  = responders.filter(r => r.status === 'On Duty').length
  const assigned = responders.filter(r => r.assignment).length

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0f1e45] text-white px-4 sm:px-6 py-4">
        <h1 className="font-bold text-lg">Responder Management</h1>
        <p className="text-white/50 text-xs mt-0.5">{onDuty} on duty · {assigned} dispatched · {responders.length} total registered</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label:'On Duty',   val:onDuty,                   color:'text-green-600' },
            { label:'Dispatched', val:assigned,                 color:'text-amber-600' },
            { label:'Available', val:onDuty - assigned,         color:'text-blue-600'  },
            { label:'Off Duty',  val:responders.length - onDuty, color:'text-gray-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Role legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs">
          {[
            ['humanitarian_volunteer','Humanitarian Volunteer'],
            ['paramedic_volunteer','Paramedic Volunteer'],
            ['golf_cart_paramedic','Golf Cart Paramedic'],
          ].map(([id, label]) => (
            <div key={id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold ${ROLE_COLOR[id]}`}>
              <span>{ROLE_ICON[id]}</span>{label}
            </div>
          ))}
          <div className="text-xs text-gray-400 self-center ml-1">SRCA Hajj 2025 · Two-tier dispatch model · 550+ personnel</div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none" value={filterZone}   onChange={e=>setFilterZone(e.target.value)}>
            <option value="">All Zones</option>
            {['Masjid al-Haram','Mina','Arafat','Muzdalifah','Jamarat'].map(z=><option key={z}>{z}</option>)}
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option>On Duty</option>
            <option>Off Duty</option>
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none" value={filterRole}   onChange={e=>setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="humanitarian_volunteer">Humanitarian Volunteer</option>
            <option value="paramedic_volunteer">Paramedic Volunteer</option>
            <option value="golf_cart_paramedic">Golf Cart Paramedic</option>
          </select>
        </div>

        {/* Desktop table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  {['Name','Role','Zone','Status','Assignment','Location','Skills','Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="font-semibold text-[#0f1e45]">{r.name}</div>
                      <div className="text-gray-400 text-[10px]">{r.id}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLOR[r.role]||'bg-gray-100 text-gray-600'}`}>
                        {ROLE_ICON[r.role]} {ROLE_LABEL[r.role] || r.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{r.zone}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      {r.assignment
                        ? <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">{r.assignment}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-gray-600">{r.location}</div>
                      <div className="text-gray-400 text-[10px]">{r.locationAge}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {r.skills.map(s => <span key={s} className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-full">{s}</span>)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setMsgTarget(r); setMsg('') }} className="bg-[#0f1e45] text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg hover:bg-[#1a3060] whitespace-nowrap">Message</button>
                        {r.status === 'On Duty' && !r.assignment && r.role !== 'humanitarian_volunteer' && (
                          <button onClick={() => { setAssignTarget(r); setAssignIncident('') }} className="bg-amber-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg hover:bg-amber-600 whitespace-nowrap">Assign</button>
                        )}
                      </div>
                      {sentMsgs[r.id]?.length > 0 && (
                        <div className="mt-1 text-[9px] text-blue-600">✓ {sentMsgs[r.id].length} msg sent</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm text-[#0f1e45]">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.id} · {r.zone}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status]}`}>{r.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLOR[r.role]||'bg-gray-100'}`}>{ROLE_ICON[r.role]} {ROLE_LABEL[r.role] || r.role}</span>
                {r.assignment && <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">{r.assignment}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { setMsgTarget(r); setMsg('') }} className="flex-1 bg-[#0f1e45] text-white text-xs font-semibold py-2 rounded-lg">Message</button>
                {r.status === 'On Duty' && !r.assignment && r.role !== 'humanitarian_volunteer' && (
                  <button onClick={() => { setAssignTarget(r); setAssignIncident('') }} className="flex-1 bg-amber-500 text-white text-xs font-semibold py-2 rounded-lg">Assign</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Modal */}
      {msgTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="font-bold text-[#0f1e45] mb-1">Message {msgTarget.name}</div>
            <div className="text-xs text-gray-400 mb-4">{ROLE_ICON[msgTarget.role]} {msgTarget.role} · {msgTarget.zone}</div>
            {sentMsgs[msgTarget.id]?.map((m,i) => (
              <div key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg mb-1.5 flex justify-between">
                <span>{m.text}</span><span className="text-blue-400 ml-2 flex-shrink-0">{m.time}</span>
              </div>
            ))}
            <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f1e45] resize-none mt-2" rows={3} placeholder="Type your message…" value={msg} onChange={e=>setMsg(e.target.value)} />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setMsgTarget(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold py-2.5 rounded-xl">Cancel</button>
              <button onClick={() => sendMsg(msgTarget)} className="flex-1 bg-[#0f1e45] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#1a3060]">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="font-bold text-[#0f1e45] mb-1">Assign {assignTarget.name}</div>
            <div className="text-xs text-gray-400 mb-4">{ROLE_ICON[assignTarget.role]} {assignTarget.role} · {assignTarget.zone}</div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Select Incident</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4" value={assignIncident} onChange={e=>setAssignIncident(e.target.value)}>
              <option value="">Choose an incident…</option>
              {pendingIncidents.map(i => (
                <option key={i.id} value={i.id}>{i.id} — {i.pilgrim} ({i.type}) · {i.zone}</option>
              ))}
            </select>
            {pendingIncidents.length === 0 && <p className="text-xs text-gray-400 mb-4">No unassigned incidents available.</p>}
            <div className="flex gap-2">
              <button onClick={() => setAssignTarget(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold py-2.5 rounded-xl">Cancel</button>
              <button onClick={doAssign} disabled={!assignIncident} className="flex-1 bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-amber-600 disabled:opacity-40">Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
