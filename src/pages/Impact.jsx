import { useEffect, useState } from 'react'

const WITHOUT = [
  { label: 'Detection', mins: 2, color: 'bg-red-400' },
  { label: 'Alert', mins: 2, color: 'bg-red-500' },
  { label: 'Dispatch', mins: 2, color: 'bg-red-600' },
  { label: 'Navigation', mins: 4, color: 'bg-red-700' },
  { label: 'Last Meter', mins: 2, color: 'bg-red-800' },
]

const WITH = [
  { label: 'Detection', mins: 0, color: 'bg-green-300', sublabel: 'Auto' },
  { label: 'Alert', mins: 0, color: 'bg-green-400', sublabel: 'Auto' },
  { label: 'Dispatch', mins: 0.5, color: 'bg-green-500', sublabel: '0.5 min' },
  { label: 'Navigation', mins: 2, color: 'bg-green-600', sublabel: '2 min' },
  { label: 'Last Meter', mins: 1, color: 'bg-green-700', sublabel: '1 min' },
]

const TOTAL_WITHOUT = 12
const TOTAL_WITH = 3.5
const BAR_MAX_MINS = 12

const caseStudies = [
  {
    title: 'Cardiac Event — Mina Sector 3',
    outcome: 'Survived',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    text: 'Wristband detected irregular HR at 02:14. Responder on scene in 3m 42s. Previously this zone averaged 11m response.',
  },
  {
    title: 'Heatstroke — Arafat Plain',
    outcome: 'Full Recovery',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    text: 'Temperature sensor + SpO₂ drop triggered alert. Cooling unit dispatched pre-emptively. Pilgrim conscious on arrival.',
  },
  {
    title: 'Crowd Crush — Jamarat Bridge',
    outcome: 'Contained',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    text: 'Density sensors predicted crush before it occurred. Zone cleared via PA + responder deployment. Zero casualties.',
  },
]

function TimelineBar({ segments, totalMins, colorClass, animated }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (animated) {
      const t = setTimeout(() => setWidth(100), 100)
      return () => clearTimeout(t)
    }
  }, [animated])

  return (
    <div className="flex h-10 rounded-lg overflow-hidden w-full" style={{ opacity: animated ? (width > 0 ? 1 : 0) : 1, transition: 'opacity 0.3s' }}>
      {segments.map(({ label, mins, color, sublabel }, i) => {
        const pct = (mins / BAR_MAX_MINS) * 100
        if (mins === 0) {
          return (
            <div
              key={label}
              className="flex items-center justify-center bg-gray-100 border-r border-white text-[10px] text-gray-400 font-medium px-1"
              style={{ width: '4%', transition: `width 0.8s ease ${i * 0.15}s`, flexShrink: 0 }}
            >
              <span className="writing-mode-vertical hidden sm:block">{sublabel || label}</span>
            </div>
          )
        }
        return (
          <div
            key={label}
            className={`${color} flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold border-r border-white/30 overflow-hidden transition-all duration-700 ease-out`}
            style={{ width: animated ? `${(pct * width) / 100}%` : `${pct}%`, transitionDelay: `${i * 0.12}s`, minWidth: '1px' }}
          >
            <span className="px-1 truncate">{sublabel || `${mins}m`}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Impact() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f1e45] text-white px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Impact & Response Time Comparison</h1>
        <p className="text-white/60">Measured outcomes vs. traditional emergency management</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Animated timelines */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0f1e45] mb-6">Response Time Breakdown</h2>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-5 text-xs text-gray-500">
            {WITHOUT.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${color}`}></div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Without */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-red-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
                Without HajjResponse
              </div>
              <div className="text-2xl font-black text-red-600">{TOTAL_WITHOUT} min</div>
            </div>
            <TimelineBar segments={WITHOUT} totalMins={TOTAL_WITHOUT} animated={animated} />
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>0</span>
              <span>3 min</span>
              <span>6 min</span>
              <span>9 min</span>
              <span>12 min</span>
            </div>
          </div>

          {/* With */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-green-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
                With HajjResponse
              </div>
              <div className="text-2xl font-black text-green-600">{TOTAL_WITH} min</div>
            </div>
            <TimelineBar segments={WITH} totalMins={TOTAL_WITH} animated={animated} />
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>0</span>
              <span>3 min</span>
              <span>6 min</span>
              <span>9 min</span>
              <span>12 min</span>
            </div>
          </div>

          {/* Phase labels below */}
          <div className="mt-5 grid grid-cols-5 gap-1 text-center text-[10px] sm:text-xs text-gray-500">
            {WITHOUT.map(({ label, mins }) => (
              <div key={label}>
                <div className="font-medium text-gray-700">{label}</div>
                <div className="text-red-500">{mins} min</div>
                <div className="text-green-500">{WITH.find(w => w.label === label)?.mins === 0 ? 'Auto' : `${WITH.find(w => w.label === label)?.mins} min`}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 stat cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-4xl font-black text-green-600 mb-1">8.5 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Time Saved Per Event</div>
            <div className="text-xs text-gray-400 mt-1">↓ 71% reduction in response time</div>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-5 text-center">
            <div className="text-4xl font-black text-red-600 mb-1">10 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Heatstroke Brain Damage Begins At</div>
            <div className="text-xs text-gray-400 mt-1">Irreversible neurological damage threshold</div>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 shadow-sm p-5 text-center">
            <div className="text-4xl font-black text-green-600 mb-1">3.5 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Our System Intervenes At</div>
            <div className="text-xs text-gray-400 mt-1">6.5 minutes before brain damage threshold</div>
          </div>
        </div>

        {/* Summary banner */}
        <div className="bg-[#0f1e45] rounded-2xl p-5 text-white text-center">
          <div className="text-sm text-white/60 mb-2">The margin that matters</div>
          <div className="text-lg font-semibold">
            Without us: responder arrives at <span className="text-red-400 font-bold">12 min</span> — 2 min after brain damage begins
          </div>
          <div className="text-lg font-semibold mt-1">
            With us: responder arrives at <span className="text-green-400 font-bold">3.5 min</span> — 6.5 min before the threshold
          </div>
        </div>

        {/* Case studies */}
        <div>
          <h2 className="text-xl font-bold text-[#0f1e45] mb-4">Case Studies — 2026 Season</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {caseStudies.map(({ title, outcome, color, bg, text }) => (
              <div key={title} className={`rounded-xl border bg-white shadow-sm p-5 ${bg}`}>
                <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-3 border ${bg} ${color}`}>{outcome}</div>
                <h3 className="font-semibold text-[#0f1e45] text-sm mb-2">{title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="bg-[#0f1e45] text-white rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { val: '2.47M', label: 'Pilgrims Monitored' },
            { val: '14,200+', label: 'Alerts Processed' },
            { val: '99.2%', label: 'Dispatch Success Rate' },
            { val: '0', label: 'Preventable Deaths' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-[#f59e0b]">{val}</div>
              <div className="text-white/60 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
