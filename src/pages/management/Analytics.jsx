import { useIncidents } from '../../context/IncidentContext'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

const COLORS = ['#dc2626','#f59e0b','#0f1e45','#16a34a','#7c3aed','#0891b2']
const ZONES  = ['Masjid al-Haram','Mina','Arafat','Muzdalifah','Jamarat']

// Simulated hourly response time trend
const RESPONSE_TREND = [
  {hour:'06:00',mins:6.2},{hour:'07:00',mins:5.8},{hour:'08:00',mins:5.1},
  {hour:'09:00',mins:4.7},{hour:'10:00',mins:4.2},{hour:'11:00',mins:3.9},
  {hour:'12:00',mins:4.5},{hour:'13:00',mins:3.7},{hour:'14:00',mins:3.4},
  {hour:'15:00',mins:3.8},{hour:'16:00',mins:3.2},{hour:'Now',  mins:3.47},
]

function fmtSec(s) { const m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s` }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="font-semibold text-gray-700 mb-0.5">{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color}} className="font-medium">{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function ManagementAnalytics() {
  const { incidents } = useIncidents()

  const resolved = incidents.filter(i => i.status === 'Resolved')
  const active   = incidents.filter(i => i.status !== 'Resolved')
  const avgElapsed  = incidents.length ? Math.round(incidents.reduce((s,i) => s+i.elapsed,0)/incidents.length) : 0
  const minElapsed  = incidents.length ? Math.min(...incidents.map(i => i.elapsed)) : 0

  // Incidents by type
  const typeMap = {}
  incidents.forEach(i => { typeMap[i.type] = (typeMap[i.type]||0)+1 })
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }))

  // Incidents by zone
  const zoneData = ZONES.map(zone => ({
    zone: zone.split(' ').pop(), // short name
    incidents: incidents.filter(i => i.zone === zone).length,
  }))

  // Resolved vs active donut
  const statusData = [
    { name:'Resolved', value: resolved.length },
    { name:'Active',   value: active.length   },
  ]
  const statusColors = ['#16a34a','#dc2626']

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0f1e45] text-white px-4 sm:px-6 py-4">
        <h1 className="font-bold text-lg">Analytics</h1>
        <p className="text-white/50 text-xs mt-0.5">Live operational metrics · today's session</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Avg Response Time',   val: fmtSec(avgElapsed), sub:'across all incidents',  color:'text-[#0f1e45]' },
            { label:'Fastest Response',    val: fmtSec(minElapsed), sub:'best today',             color:'text-green-600' },
            { label:'Pilgrims Monitored',  val: '1,284',            sub:'CGM + wristband active', color:'text-amber-600' },
          ].map(({ label, val, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-xs font-semibold text-gray-600 mt-1">{label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Incidents by Type — Pie */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="font-semibold text-sm text-[#0f1e45] mb-0.5">Incidents by Type</div>
            <p className="text-xs text-gray-400 mb-3">Distribution of emergency categories</p>
            {typeData.length === 0
              ? <div className="text-xs text-gray-400 py-12 text-center">No incidents yet</div>
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize:'11px'}} />
                  </PieChart>
                </ResponsiveContainer>
              )}
          </div>

          {/* Resolved vs Active — Donut */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="font-semibold text-sm text-[#0f1e45] mb-0.5">Resolved vs Active</div>
            <p className="text-xs text-gray-400 mb-1">Incident closure rate this session</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={statusColors[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'11px'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-gray-400 -mt-2">
              {incidents.length > 0
                ? `${Math.round((resolved.length/incidents.length)*100)}% resolution rate`
                : 'No data yet'}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Incidents by Zone — Bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="font-semibold text-sm text-[#0f1e45] mb-0.5">Incidents by Hajj Zone</div>
            <p className="text-xs text-gray-400 mb-3">All incidents per site</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={zoneData} margin={{top:4,right:4,bottom:4,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="zone" tick={{fontSize:10}} />
                <YAxis tick={{fontSize:10}} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="incidents" fill="#0f1e45" radius={[4,4,0,0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Response time trend — Line */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="font-semibold text-sm text-[#0f1e45] mb-0.5">Response Time Trend</div>
            <p className="text-xs text-gray-400 mb-3">Average minutes per hour today</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={RESPONSE_TREND} margin={{top:4,right:4,bottom:4,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="hour" tick={{fontSize:9}} interval={2} />
                <YAxis tick={{fontSize:10}} domain={[2,8]} unit="m" />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="mins" stroke="#0f1e45" strokeWidth={2.5} dot={{r:3,fill:'#0f1e45'}} name="Avg (min)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="font-semibold text-sm text-[#0f1e45] mb-3">Incident Risk Breakdown</div>
          <div className="grid grid-cols-4 gap-3">
            {['Critical','High','Medium','Low'].map(risk => {
              const count = incidents.filter(i => i.risk === risk).length
              const styles = {
                Critical:'bg-red-50 border-red-200 text-red-700',
                High:'bg-orange-50 border-orange-200 text-orange-700',
                Medium:'bg-amber-50 border-amber-200 text-amber-700',
                Low:'bg-green-50 border-green-200 text-green-700',
              }
              return (
                <div key={risk} className={`rounded-xl border-2 px-3 py-3 text-center ${styles[risk]}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-semibold mt-0.5">{risk}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">
                    {incidents.length > 0 ? `${Math.round((count/incidents.length)*100)}%` : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center pb-2">
          Data reflects current session · live from IncidentContext · response trend uses simulated hourly data
        </div>
      </div>
    </div>
  )
}
