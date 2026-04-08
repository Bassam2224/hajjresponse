import { useState, useEffect } from 'react'

const conditions = [
  { label: 'Type 2 Diabetes',           color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Hypertension',              color: 'bg-red-100 text-red-700 border-red-200'    },
  { label: 'Cardiac Event (2019)',      color: 'bg-orange-100 text-orange-700 border-orange-200' },
]

const thresholds = [
  { metric: 'Heart Rate (high)',  standard: '> 120 bpm', fatima: '> 100 bpm', reason: 'Cardiac history' },
  { metric: 'Temperature',        standard: '> 39.5°C',  fatima: '> 38.5°C',  reason: 'Hypertension risk' },
  { metric: 'SpO₂ (low)',         standard: '< 90%',     fatima: '< 93%',     reason: 'Cardiac history' },
  { metric: 'Glucose (low)',      standard: 'N/A',       fatima: '< 4.0 mmol/L', reason: 'Type 2 Diabetes' },
  { metric: 'Glucose (high)',     standard: 'N/A',       fatima: '> 13.9 mmol/L', reason: 'Type 2 Diabetes' },
  { metric: 'Inactivity',         standard: '> 15 min',  fatima: '> 8 min',   reason: 'Fall / collapse risk' },
]

const alertHistory = [
  { date: 'Day 4 – Muzdalifah',   event: 'Low glucose detected (3.6) — auto-alert sent', level: 'critical' },
  { date: 'Day 3 – Arafat Plain', event: 'Heat advisory — responder pre-positioned nearby', level: 'warning' },
  { date: 'Day 2 – Mina',         event: 'All clear — vitals normal throughout', level: 'ok' },
  { date: 'Day 1 – Arrival',      event: 'Wristband HJ-2025-08841 linked · FreeStyle Libre 3 paired', level: 'ok' },
]

function getTrend(prev, curr) {
  if (curr > prev + 0.1) return '↑'
  if (curr < prev - 0.1) return '↓'
  return '→'
}
function glucoseStatus(v) {
  if (v < 4.0)  return 'critical'
  if (v < 4.5 || v > 10.0) return 'warning'
  return 'ok'
}

export default function Profile() {
  const [glucose, setGlucose]       = useState(5.1)
  const [prevGlucose, setPrevGlucose] = useState(5.1)

  useEffect(() => {
    const t = setInterval(() => {
      const next = parseFloat((3.8 + Math.random() * 2.4).toFixed(1))
      setPrevGlucose(glucose)
      setGlucose(next)
    }, 4000)
    return () => clearInterval(t)
  }, [glucose])

  const trend   = getTrend(prevGlucose, glucose)
  const gStatus = glucoseStatus(glucose)
  const trendColor = trend === '↑' ? 'text-red-500' : trend === '↓' ? 'text-blue-500' : 'text-gray-400'

  const glucoseBg =
    gStatus === 'critical' ? 'bg-red-50 border-red-300'   :
    gStatus === 'warning'  ? 'bg-amber-50 border-amber-300' :
    'bg-green-50 border-green-200'

  const glucoseText =
    gStatus === 'critical' ? 'text-red-700'   :
    gStatus === 'warning'  ? 'text-amber-700'  :
    'text-green-700'

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Pilgrim header */}
      <div className="bg-green-600 text-white px-4 pt-8 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          Pilgrim View
        </div>
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-3xl mx-auto mb-3">🕌</div>
        <h1 className="text-2xl font-bold">Fatima Al-Rashidi</h1>
        <p className="text-green-100 text-sm mt-1">Age 67 · Saudi Arabia · Wristband HJ-2025-08841</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
          ⚠️ High Risk Profile
        </div>
      </div>

      {/* Reassurance banner */}
      <div className="max-w-lg mx-auto px-4 pt-5">
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-sm text-green-800 leading-relaxed text-center">
          ✅ <strong>Your health is being monitored.</strong> Medical staff will be alerted automatically if anything needs attention — you don't need to do anything.
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Personal info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#0f1e45] mb-4 text-base">Your Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-400 mb-1">Full Name</div>
              <div className="font-semibold text-gray-800">Fatima Al-Rashidi</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Nationality</div>
              <div className="font-semibold text-gray-800">Saudi Arabia</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Age</div>
              <div className="font-semibold text-gray-800">67 years</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Blood Type</div>
              <div className="font-semibold text-gray-800">O+</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Emergency Contact</div>
              <div className="font-semibold text-gray-800">Hassan Al-Rashidi</div>
              <div className="text-xs text-gray-500">+966 55 987 6543</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Wristband ID</div>
              <div className="font-mono text-xs font-semibold text-gray-700">HJ-2025-08841</div>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#0f1e45] mb-3 text-base">Health Conditions</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {conditions.map(({ label, color }) => (
              <span key={label} className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${color}`}>
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            These conditions are on file with the Hajj medical team. Your alert thresholds have been personalised accordingly.
          </p>
        </div>

        {/* Live vitals — large cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0f1e45] text-base">Your Vitals Right Now</h3>
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '❤️',  label: 'Heart Rate',   val: '91 bpm',  ok: true  },
              { icon: '🌡️', label: 'Temperature',   val: '38.1°C',  ok: false },
              { icon: '💧',  label: 'Oxygen Level',  val: '95%',     ok: true  },
              { icon: '👣',  label: 'Steps Today',   val: '8,210',   ok: true  },
            ].map(({ icon, label, val, ok }) => (
              <div
                key={label}
                className={`rounded-2xl p-4 text-center border ${
                  ok ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="text-3xl mb-1">{icon}</div>
                <div className={`text-xl font-bold mb-0.5 ${ok ? 'text-green-700' : 'text-amber-700'}`}>{val}</div>
                <div className="text-xs text-gray-400">{label}</div>
                <div className={`text-[10px] font-semibold mt-1 ${ok ? 'text-green-600' : 'text-amber-600'}`}>
                  {ok ? 'Normal ✓' : 'Slightly elevated'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CGM reading — prominent */}
        <div className={`rounded-2xl border-2 p-5 ${glucoseBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🩸</span>
              <div>
                <div className={`font-bold text-base ${glucoseText}`}>Blood Glucose</div>
                <div className="text-xs text-gray-400">FreeStyle Libre 3 · updates every 4s</div>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 border border-green-300 px-2 py-1 rounded-full font-semibold">
              CGM Active ✓
            </span>
          </div>
          <div className="flex items-end gap-2 mb-1">
            <span className={`text-4xl font-black ${glucoseText}`}>{glucose}</span>
            <span className={`text-xl font-bold mb-1 ${trendColor}`}>{trend}</span>
            <span className="text-gray-400 text-sm mb-1">mmol/L</span>
          </div>
          <div className={`text-xs font-semibold ${glucoseText}`}>
            {gStatus === 'critical' ? '⚠️ Below safe range — alert sent to medical team' :
             gStatus === 'warning'  ? 'Monitor closely' :
             'Within normal range ✓'}
          </div>
        </div>

        {/* Alert history — simple */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-[#0f1e45] mb-4 text-base">Your Hajj Journey</h3>
          <div className="space-y-4">
            {alertHistory.map(({ date, event, level }) => (
              <div key={date} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                  level === 'critical' ? 'bg-red-500' :
                  level === 'warning'  ? 'bg-amber-400' :
                  'bg-green-400'
                }`} />
                <div>
                  <div className="font-semibold text-[#0f1e45] text-sm">{date}</div>
                  <div className={`text-sm mt-0.5 ${
                    level === 'critical' ? 'text-red-600 font-medium' :
                    level === 'warning'  ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    {event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalised thresholds — tucked at bottom */}
        <details className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <summary className="px-5 py-4 font-semibold text-sm text-[#0f1e45] cursor-pointer select-none flex items-center justify-between">
            <span>Your personalised alert thresholds</span>
            <span className="text-gray-400 text-xs">tap to expand</span>
          </summary>
          <div className="px-5 pb-5">
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Based on your medical profile, the system alerts earlier than for a standard pilgrim.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-2 text-gray-500 font-semibold pr-3">Metric</th>
                    <th className="pb-2 text-gray-500 font-semibold pr-3">Standard</th>
                    <th className="pb-2 text-red-500 font-semibold pr-3">Your Threshold</th>
                    <th className="pb-2 text-gray-400 font-normal">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {thresholds.map(({ metric, standard, fatima, reason }) => (
                    <tr key={metric} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 font-medium text-gray-700 pr-3">{metric}</td>
                      <td className="py-2 text-gray-400 pr-3">{standard}</td>
                      <td className="py-2 font-bold text-red-600 pr-3">{fatima}</td>
                      <td className="py-2 text-gray-400 italic">{reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

      </div>
    </div>
  )
}
