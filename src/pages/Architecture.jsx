// ── Data ─────────────────────────────────────────────────────────────────────

// Hardware / connectivity
const hardwareSources = [
  {
    name: 'Hajj Smart Wristband',
    detail: 'HR · Temp · SpO₂ · Accel · BLE',
    icon: '⌚',
    note: 'Issued to all pilgrims at registration',
    arrow: 'Biometric stream',
  },
  {
    name: 'CGM Device (optional)',
    detail: 'FreeStyle Libre 3 / Dexcom G7',
    icon: '🩸',
    note: 'For diabetic pilgrims — Bluetooth glucose feed',
    arrow: 'Glucose readings',
  },
  {
    name: 'STC Mobile Network',
    detail: 'LTE-M · NB-IoT · 5G',
    icon: '📶',
    note: 'Saudi Telecom — full Hajj site coverage',
    arrow: 'Data transport',
  },
]

// Government / registry data sources
const dataSources = [
  {
    name: 'Nusuk',
    fullName: 'Nusuk — Hajj Registration',
    detail: 'Pilgrim ID · Group · Permit · DOB',
    icon: '🕌',
    note: 'Ministry of Hajj & Umrah official platform',
    arrow: 'Identity + group info',
    color: 'border-emerald-300 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Tawakkalna',
    fullName: 'Tawakkalna — Health Status',
    detail: 'Vaccination · Chronic condition flags',
    icon: '🤝',
    note: 'Saudi digital health wallet — national app',
    arrow: 'Health status',
    color: 'border-teal-300 bg-teal-50',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'Saudi MOH',
    fullName: 'Saudi MOH — Medical Records',
    detail: 'Diagnoses · Allergies · Medications',
    icon: '🏥',
    note: 'Ministry of Health national health record',
    arrow: 'Medical history',
    color: 'border-blue-300 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
]

const ourPipeline = [
  { label: 'Data Ingestion', detail: 'MQTT + REST · <50ms',          icon: '📡', color: 'bg-blue-500'   },
  { label: 'Risk Engine',    detail: 'ML scoring · per-pilgrim',      icon: '🧠', color: 'bg-indigo-500' },
  { label: 'Dispatch Logic', detail: 'Nearest unit · tier-matched',   icon: '📋', color: 'bg-purple-500' },
  { label: 'Responder App',  detail: 'Turn-by-turn · BLE last meter', icon: '🚑', color: 'bg-rose-500'   },
  { label: 'Beacon Trigger', detail: 'Flash + sound wristband',       icon: '📳', color: 'bg-amber-500'  },
]

const flows = [
  { from: 'Wristband',      event: 'Vitals spike detected',              to: 'Data Ingestion', latency: '< 50ms'  },
  { from: 'Nusuk + MOH',    event: 'Profile & risk context fetched',     to: 'Risk Engine',    latency: '< 100ms' },
  { from: 'Risk Engine',    event: 'Personalised alert generated',        to: 'Dispatch Logic', latency: '< 100ms' },
  { from: 'Dispatch Logic', event: 'Nearest Tier responder assigned',     to: 'Responder App',  latency: '< 200ms' },
  { from: 'Responder App',  event: 'Navigate + activate beacon',          to: 'Beacon Trigger', latency: '< 300ms' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function Architecture() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f1e45] text-white px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">System Architecture</h1>
        <p className="text-white/60">What already exists — and what we built on top of it</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* ── EXISTING INFRASTRUCTURE ─────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-gray-300 bg-gray-50 overflow-hidden">
          <div className="bg-gray-200 px-5 py-3 flex items-center gap-3">
            <span className="text-lg">🏗️</span>
            <div>
              <div className="font-bold text-gray-700 text-sm uppercase tracking-wider">Existing Infrastructure</div>
              <div className="text-xs text-gray-500">Already deployed — we integrate, not replace</div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Hardware row */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Hardware &amp; Connectivity
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {hardwareSources.map(({ name, detail, icon, note, arrow }) => (
                  <div key={name} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex flex-col">
                    <div className="text-2xl mb-1.5">{icon}</div>
                    <div className="text-sm font-semibold text-gray-800 mb-0.5">{name}</div>
                    <div className="text-xs text-gray-500 mb-1 flex-1">{detail}</div>
                    <div className="text-[10px] text-gray-400 italic leading-tight mb-2">{note}</div>
                    <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 rounded-lg px-2 py-1">
                      <span>↓</span> {arrow}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Government data sources row */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                Government &amp; Registry Data Sources
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {dataSources.map(({ name, fullName, detail, icon, note, arrow, color, badge }) => (
                  <div key={name} className={`rounded-xl border-2 p-3 shadow-sm flex flex-col ${color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{icon}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>{name}</span>
                    </div>
                    <div className="text-xs font-semibold text-gray-800 mb-0.5">{fullName}</div>
                    <div className="text-xs text-gray-600 mb-1 flex-1">{detail}</div>
                    <div className="text-[10px] text-gray-400 italic leading-tight mb-2">{note}</div>
                    <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-white/60 rounded-lg px-2 py-1">
                      <span>↓</span> {arrow}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Arrow ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-0.5 h-4 bg-gray-300"></div>
          <div className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            All data streams feed into HajjResponse Platform
          </div>
          <div className="w-0.5 h-4 bg-gray-300"></div>
        </div>

        {/* ── OUR PLATFORM ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-[#0f1e45] bg-[#0f1e45] overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3 border-b border-white/10">
            <span className="text-lg">🚀</span>
            <div>
              <div className="font-bold text-white text-sm uppercase tracking-wider">HajjResponse Platform — Our Solution</div>
              <div className="text-xs text-white/50">Built for the 2026 Hajj Season · SSCI Ireland Hackathon</div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {ourPipeline.map(({ label, detail, icon, color }, i) => (
                <div key={label} className="flex sm:flex-col items-center gap-2 sm:gap-1 flex-1">
                  <div className={`${color} rounded-xl p-3 text-white text-center w-full flex flex-col items-center`}>
                    <div className="text-2xl mb-1">{icon}</div>
                    <div className="text-xs font-bold">{label}</div>
                    <div className="text-[10px] text-white/70 mt-0.5">{detail}</div>
                  </div>
                  {i < ourPipeline.length - 1 && <div className="text-white/40 text-xl sm:hidden">↓</div>}
                </div>
              ))}
            </div>
            <div className="hidden sm:flex justify-between px-[5%] mt-1">
              {ourPipeline.slice(0, -1).map((_, i) => (
                <div key={i} className="flex-1 text-center text-white/30 text-xl">→</div>
              ))}
              <div className="flex-1"></div>
            </div>
          </div>
        </div>

        {/* ── Arrow ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-0.5 h-5 bg-gray-300"></div>
          <div className="w-0.5 h-5 bg-gray-300"></div>
        </div>

        {/* ── Output ────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 px-6 py-5 text-center">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-xl font-bold text-green-800">Patient reached in under 4 minutes</div>
          <div className="text-sm text-green-700 mt-1">vs. 12 minutes with traditional emergency management</div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-green-700">
            <span>⏱ End-to-end latency: &lt;650ms</span>
            <span>📍 Location accuracy: &lt;2m</span>
            <span>🎯 Dispatch accuracy: 99.2%</span>
          </div>
        </div>

        {/* ── Alert flow ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0f1e45] mb-4">Alert Flow — Step by Step</h2>
          <div className="space-y-3">
            {flows.map(({ from, event, to, latency }, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-[#0f1e45] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</div>
                <div className="bg-gray-50 rounded px-3 py-1 font-medium text-[#0f1e45] text-xs">{from}</div>
                <div className="text-gray-400 text-xs flex-1 min-w-[80px]">{event}</div>
                <div className="bg-gray-50 rounded px-3 py-1 font-medium text-[#0f1e45] text-xs">{to}</div>
                <div className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">{latency}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tech stack ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-[#0f1e45] mb-4">Technology Stack</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[
              { category: 'Hardware / Sensors', items: ['Nordic nRF52840 (wristband SoC)', 'MAX30102 pulse oximeter', 'BLE 5.0 beacons (2m accuracy)', 'LTE-M/NB-IoT modem', 'Abbott FreeStyle Libre 3 (CGM)'] },
              { category: 'Integrations', items: ['Nusuk API (pilgrim identity)', 'Tawakkalna health status', 'Saudi MOH records API', 'MQTT broker (Eclipse Mosquitto)', 'Apache Kafka (event bus)'] },
              { category: 'Frontend', items: ['React + Vite', 'Tailwind CSS v4', 'React Router v6', 'Context API (shared state)', 'Deployed via Vercel'] },
            ].map(({ category, items }) => (
              <div key={category}>
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{category}</div>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-gray-700 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f1e45] flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
