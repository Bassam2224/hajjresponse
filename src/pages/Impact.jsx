import { useEffect, useState } from 'react'

// Traditional (no system) — ambulance in crowd
const WITHOUT = [
  { label:'Detection',   mins:3,  color:'bg-red-400', sub:'Manual' },
  { label:'Alert',       mins:2,  color:'bg-red-500', sub:'Phone' },
  { label:'Dispatch',    mins:2,  color:'bg-red-600', sub:'Manual' },
  { label:'Navigation',  mins:8,  color:'bg-red-700', sub:'Crowd blocked' },
]
const TOTAL_WITHOUT = 15

// HajjResponse — tiered model
const WITH = [
  { label:'Detection',  mins:0,   color:'bg-green-300', sub:'Auto' },
  { label:'Volunteer',  mins:2,   color:'bg-green-500', sub:'~2 min' },
  { label:'Golf Cart',  mins:1.5, color:'bg-amber-400', sub:'~1.5 min' },
  { label:'Med Point',  mins:1.5, color:'bg-blue-500',  sub:'~1.5 min' },
]
const TOTAL_WITH = 5
const BAR_MAX = 15

const caseStudies = [
  {
    title:'Cardiac Event — Mina Sector 3',
    outcome:'Survived',
    color:'text-green-600',
    bg:'bg-green-50 border-green-200',
    text:'Wristband detected irregular HR at 02:14. Volunteer on scene in 2m 10s — stabilised patient. Golf Cart transported to Mina Medical Point A in 4m total. Previously this zone averaged 13m response.',
  },
  {
    title:'Heatstroke — Arafat Plain',
    outcome:'Full Recovery',
    color:'text-green-600',
    bg:'bg-green-50 border-green-200',
    text:'Temperature sensor + SpO₂ drop triggered auto-alert. Volunteer dispatched in <1s. Golf cart with cooling equipment arrived at 3.5 minutes. Pilgrim fully conscious at medical point.',
  },
  {
    title:'Crowd Crush — Jamarat Bridge',
    outcome:'Contained',
    color:'text-amber-600',
    bg:'bg-amber-50 border-amber-200',
    text:'Three simultaneous alerts. Volunteers reached all patients in under 3 minutes. Golf Cart transport via service lane avoided the crowd entirely. Jamarat Medical Point prepared before arrival.',
  },
]

function TimelineBar({ segments, animated, maxMins = BAR_MAX }) {
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (animated) { const t = setTimeout(() => setGo(true), 100); return () => clearTimeout(t) }
  }, [animated])

  return (
    <div className="flex h-10 rounded-lg overflow-hidden w-full">
      {segments.map(({ label, mins, color, sub }, i) => {
        const pct = (mins / maxMins) * 100
        if (mins === 0) {
          return (
            <div key={label} className="flex items-center justify-center bg-gray-100 border-r border-white text-[10px] text-gray-400 px-1 flex-shrink-0" style={{width:'4%'}}>
              <span className="truncate text-center" style={{fontSize:'8px'}}>{sub}</span>
            </div>
          )
        }
        return (
          <div key={label}
            className={`${color} flex items-center justify-center text-white text-[10px] font-semibold border-r border-white/30 overflow-hidden transition-all duration-700 ease-out`}
            style={{ width: animated ? (go ? `${pct}%` : '0%') : `${pct}%`, transitionDelay:`${i * 0.15}s`, minWidth:'1px' }}>
            <span className="px-1 truncate">{sub||`${mins}m`}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Impact() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f1e45] text-white px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Impact &amp; Response Time Comparison</h1>
        <p className="text-white/60">Three-tier model vs. traditional single-ambulance dispatch</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Timeline comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0f1e45] mb-2">Response Time Breakdown</h2>
          <p className="text-xs text-gray-400 mb-5">For a Tier 3 incident (cardiac event in crowd zone)</p>

          {/* Without */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-red-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                Traditional — Single Ambulance Dispatch
              </div>
              <div className="text-2xl font-black text-red-600">{TOTAL_WITHOUT} min</div>
            </div>
            <TimelineBar segments={WITHOUT} animated={animated} />
            <div className="grid grid-cols-4 gap-1 mt-2 text-center">
              {WITHOUT.map(({ label, mins, color }) => (
                <div key={label} className="text-[10px]">
                  <div className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${color} inline-block mb-0.5`}>{mins}m</div>
                  <div className="text-gray-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              ⚠️ Ambulance stuck in crowd for 8+ minutes — arrives at 15 min, 5 min after heatstroke brain damage threshold
            </div>
          </div>

          {/* With */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-green-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                HajjResponse — Three-Tier Model
              </div>
              <div className="text-2xl font-black text-green-600">{TOTAL_WITH} min</div>
            </div>
            <TimelineBar segments={WITH} animated={animated} />
            <div className="grid grid-cols-4 gap-1 mt-2 text-center">
              {WITH.map(({ label, sub, color }) => (
                <div key={label} className="text-[10px]">
                  <div className={`text-white text-[9px] font-bold px-1.5 py-0.5 rounded ${color} inline-block mb-0.5`}>{sub}</div>
                  <div className="text-gray-500">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
              ✅ Volunteer stabilises at 2 min · Golf cart transports via service lane · Patient at medical point at 5 min — 5 minutes before damage threshold
            </div>
          </div>
        </div>

        {/* Drone delivery comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0f1e45] mb-1">Drone Medical Supply Delivery</h2>
          <p className="text-xs text-gray-400 mb-5">Delivering AED, glucose gel, cooling packs, epinephrine to responders — Hajj 2025 verified</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-semibold text-red-600">Traditional — Ground courier through pilgrims</span>
                <span className="text-xl font-black text-red-600">90 min</span>
              </div>
              <div className="h-8 bg-red-400 rounded-lg flex items-center px-3 text-white text-xs font-semibold">Courier navigating 2.47M pilgrims on foot</div>
              <div className="mt-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">⚠️ AED reaches patient 90 minutes after cardiac arrest — well past the 10-minute survival window</div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm font-semibold text-purple-600">HajjResponse — DJI Matrice 350 RTK drone delivery</span>
                <span className="text-xl font-black text-purple-600">6 min</span>
              </div>
              <div className="h-8 rounded-lg flex items-center px-3 text-white text-xs font-semibold" style={{width:`${(6/90)*100}%`, minWidth:'100px', background:'#7c3aed'}}>6 min · above crowd</div>
              <div className="mt-1.5 text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2">✅ Flies above crowd at 15m altitude · drops supplies to GPS-pinned responder location · 93% faster than ground</div>
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-center text-xs border-t border-gray-100 pt-4">
            {[
              { icon:'🚁', label:'DJI Matrice 350 RTK', sub:'Primary delivery drone · 55-min flight time' },
              { icon:'🦅', label:'Falcon AI Drone', sub:'Surveillance + thermal imaging · crowd monitoring' },
              { icon:'🛰️', label:'GPS Precision Drop', sub:'±0.1m accuracy · direct to responder wristband beacon' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-semibold text-purple-800">{label}</div>
                <div className="text-gray-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The transfer chain advantage */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
          <div className="font-bold text-amber-700 mb-3 text-lg">Why the Golf Cart → Medical Point model is faster</div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { icon:'🚶', title:'Volunteer First', desc:'On foot through crowds — reaches patient in 2 min while ambulance is still stuck at the perimeter.' },
              { icon:'🛺', title:'Golf Cart Avoids Crowd', desc:'Paramedic golf cart uses service lanes, not pilgrim paths. Covers 400m in 1.5 min vs 8+ min for an ambulance in the same zone.' },
              { icon:'🚑', title:'Ambulance at Fixed Point', desc:'Emergency vehicle is positioned and ready at the medical point. Zero time wasted navigating crowd — immediate advanced care on arrival.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-4">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-bold text-[#0f1e45] text-xs mb-1">{title}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-4xl font-black text-green-600 mb-1">10 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Time Saved Per Tier 3 Event</div>
            <div className="text-xs text-gray-400 mt-1">↓ 67% reduction · 15 min → 5 min</div>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-5 text-center">
            <div className="text-4xl font-black text-red-600 mb-1">10 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Heatstroke Brain Damage Begins</div>
            <div className="text-xs text-gray-400 mt-1">Irreversible neurological damage threshold</div>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 shadow-sm p-5 text-center">
            <div className="text-4xl font-black text-green-600 mb-1">5 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Our Model — Patient at Med Point</div>
            <div className="text-xs text-gray-400 mt-1">5 minutes before damage threshold</div>
          </div>
          <div className="bg-purple-50 rounded-2xl border border-purple-200 shadow-sm p-5 text-center">
            <div className="text-3xl font-black text-purple-600 mb-1">90→6 min</div>
            <div className="font-semibold text-[#0f1e45] text-sm">Drone Medical Delivery</div>
            <div className="text-xs text-gray-400 mt-1">Hajj 2025 verified · DJI Matrice 350 RTK</div>
          </div>
        </div>

        {/* Summary banner */}
        <div className="bg-[#0f1e45] rounded-2xl p-5 text-white text-center">
          <div className="text-sm text-white/60 mb-2">The margin that matters</div>
          <div className="text-lg font-semibold">
            Traditional ambulance: <span className="text-red-400 font-bold">15 min</span> — 5 min after brain damage begins
          </div>
          <div className="text-lg font-semibold mt-1">
            HajjResponse tiered model: <span className="text-green-400 font-bold">5 min</span> — 5 min before the threshold
          </div>
          <div className="mt-3 text-xs text-white/50">Volunteer stabilises → Golf cart transports via service lane → Ambulance ready at fixed medical point</div>
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
            { val:'2.47M',  label:'Pilgrims Monitored' },
            { val:'14,200+',label:'Alerts Processed' },
            { val:'99.2%',  label:'Dispatch Success Rate' },
            { val:'0',      label:'Preventable Deaths' },
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
