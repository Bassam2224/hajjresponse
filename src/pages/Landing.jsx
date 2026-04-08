import { useState } from 'react'
import { Link } from 'react-router-dom'
import FaceIDModal from '../components/FaceIDModal'

const problems = [
  {
    icon: '📡',
    title: 'Passive Detection',
    subtitle: 'Problem 1',
    description:
      'Traditional systems wait for pilgrims to manually call for help. By the time an emergency is reported, critical minutes are already lost. HajjResponse uses wearable biometric sensors and AI to detect distress automatically — before the pilgrim can even reach for their phone.',
    stat: '8 min',
    statLabel: 'avg detection delay eliminated',
    color: 'border-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  {
    icon: '🚑',
    title: 'Risk-Adaptive Dispatch',
    subtitle: 'Problem 2',
    description:
      'One-size-fits-all dispatching ignores that elderly pilgrims, those with heart conditions, and first-time visitors face vastly different risks. Our AI engine maintains a live risk profile per pilgrim and routes the right responder with the right equipment in real time.',
    stat: '3×',
    statLabel: 'faster triage prioritization',
    color: 'border-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    icon: '📍',
    title: 'Last-Meter Access',
    subtitle: 'Problem 3',
    description:
      "GPS alone fails in dense crowds and enclosed spaces. Responders would arrive at the correct GPS coordinate but couldn't locate the pilgrim. HajjResponse combines GPS, BLE beacons, and crowd-aware routing to guide responders to the exact person, not just a general zone.",
    stat: '< 2m',
    statLabel: 'final location accuracy',
    color: 'border-green-600',
    badge: 'bg-green-100 text-green-700',
  },
]

export default function Landing() {
  const [faceID, setFaceID] = useState(false)

  return (
    <div>
      {faceID && <FaceIDModal target="/sos" onClose={() => setFaceID(false)} />}
      {/* Hero */}
      <section className="bg-[#0f1e45] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></span>
            Live at Masjid al-Haram · 2.5M pilgrims covered
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            HajjResponse
            <br />
            <span className="text-[#f59e0b]">Smart Emergency Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Reducing emergency response time at Hajj{' '}
            <span className="text-white font-semibold">from 12 minutes to under 4</span> — through
            AI-powered detection, adaptive dispatch, and last-meter navigation.
          </p>

          {/* Two-portal CTA */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-4">
            {/* Pilgrim card */}
            <div className="bg-white/5 border border-white/15 hover:bg-white/10 transition-colors rounded-2xl p-6 text-left flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center text-2xl mb-4">
                🙏
              </div>
              <div className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-1">Pilgrim View</div>
              <h3 className="text-lg font-bold text-white mb-2">For Pilgrims</h3>
              <p className="text-white/60 text-sm leading-relaxed flex-1 mb-4">
                Simple emergency access for pilgrims during Hajj. One tap to call for help. Your wristband does the rest.
              </p>
              <Link
                to="/register"
                className="w-full text-center bg-green-500 hover:bg-green-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm mb-2"
              >
                Register as Pilgrim →
              </Link>
              <button
                onClick={() => setFaceID(true)}
                className="w-full text-center text-green-300 hover:text-white text-xs py-1.5 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🪪</span>
                Returning pilgrim? Sign in with Face ID
              </button>
            </div>

            {/* Staff card */}
            <div className="bg-white/5 border border-white/15 hover:bg-white/10 transition-colors rounded-2xl p-6 text-left flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-2xl mb-4">
                🖥️
              </div>
              <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Command Center</div>
              <h3 className="text-lg font-bold text-white mb-2">For Medical Staff</h3>
              <p className="text-white/60 text-sm leading-relaxed flex-1 mb-4">
                Real-time dispatch and health monitoring for medical staff and coordinators managing emergency response.
              </p>
              <Link
                to="/login"
                className="w-full text-center bg-[#0f1e45] hover:bg-blue-900 border border-blue-400/40 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
              >
                Staff Login →
              </Link>
            </div>
          </div>

          <p className="text-white/40 text-sm italic">
            Two interfaces. One system. Every second counts.
          </p>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
            {[
              { val: '12 → 4 min', label: 'Response Time' },
              { val: '2.5M+', label: 'Pilgrims Covered' },
              { val: '99.7%', label: 'Detection Accuracy' },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-3xl font-bold text-[#f59e0b]">{val}</div>
                <div className="text-white/60 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems solved */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f1e45] mb-3">Three Problems. One Platform.</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Every second counts during Hajj emergencies. Here's what HajjResponse solves.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map(({ icon, title, subtitle, description, stat, statLabel, color, badge }) => (
              <div
                key={title}
                className={`bg-white rounded-2xl p-7 shadow-sm border-t-4 ${color} flex flex-col`}
              >
                <div className="text-4xl mb-4">{icon}</div>
                <div className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded self-start mb-2 ${badge}`}>
                  {subtitle}
                </div>
                <h3 className="text-xl font-bold text-[#0f1e45] mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{description}</p>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <span className="text-2xl font-bold text-[#0f1e45]">{stat}</span>
                  <span className="text-xs text-gray-500 ml-2">{statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f1e45] mb-12">How It Works</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
            {[
              { step: '01', title: 'Wearable Detects Distress', body: 'Smart wristbands monitor heart rate, temperature, and movement. ML models identify distress patterns and trigger an alert within seconds.', color: 'bg-red-500' },
              { step: '02', title: 'AI Evaluates Risk Profile', body: "The pilgrim's pre-registered medical history, age, and location context are combined to calculate a real-time risk score.", color: 'bg-amber-500' },
              { step: '03', title: 'Optimal Responder Dispatched', body: 'The nearest qualified medic with the right equipment is dispatched via the dashboard, accounting for crowd density and access routes.', color: 'bg-blue-500' },
              { step: '04', title: 'Last-Meter Navigation', body: 'BLE beacons guide the responder to the exact pilgrim position even in crowded tents or multi-floor structures.', color: 'bg-green-600' },
            ].map(({ step, title, body, color }) => (
              <div key={step} className="flex gap-6 mb-8 relative">
                <div className={`w-16 h-16 rounded-full ${color} text-white font-bold text-sm flex items-center justify-center flex-shrink-0 z-10`}>
                  {step}
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex-1">
                  <h4 className="font-semibold text-[#0f1e45] mb-1">{title}</h4>
                  <p className="text-gray-600 text-sm">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="bg-[#0f1e45] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Explore the platform</h2>
          <p className="text-white/70 mb-8">
            Try the pilgrim SOS flow, review the dispatcher dashboard, or inspect the full system architecture.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/sos" className="bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3 rounded-xl transition-colors">
              Pilgrim App →
            </Link>
            <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3 rounded-xl transition-colors">
              Dashboard →
            </Link>
            <Link to="/impact" className="bg-[#f59e0b] hover:bg-amber-400 text-[#0f1e45] font-bold px-7 py-3 rounded-xl transition-colors">
              See Impact →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-sm py-6 text-center">
        © 2026 HajjResponse · Smart Emergency Platform · Built for the 2026 Hajj Season
      </footer>
    </div>
  )
}
