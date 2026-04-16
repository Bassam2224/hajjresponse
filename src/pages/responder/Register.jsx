import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useResponder } from '../../context/ResponderContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'

const RESPONDER_TYPES = [
  {
    id: 'humanitarian_volunteer',
    labelKey: 'reg_role_humanitarian',
    badge: 'bg-gray-100 text-gray-700 border-gray-300',
    badgeDark: 'bg-gray-800/60 text-gray-300 border-gray-600',
    icon: '🙋',
    descKey: 'reg_role_humanitarian_desc',
    skills: ['Crowd Management', 'Basic First Aid', 'Communication'],
    tier: null,
    tierLabel: 'Reporting Only',
    tierColor: 'bg-gray-100 text-gray-600',
  },
  {
    id: 'paramedic_volunteer',
    labelKey: 'reg_role_paramedic_vol',
    badge: 'bg-green-100 text-green-700 border-green-300',
    badgeDark: 'bg-green-900/40 text-green-300 border-green-700',
    icon: '🚶',
    descKey: 'reg_role_paramedic_vol_desc',
    skills: ['Basic First Aid', 'CPR Certified', 'Crowd Navigation', 'Diabetic Emergency', 'Glucose Gel Administration', 'Wound Care'],
    tier: 1,
    tierLabel: 'Tier 1 — On Foot · 300m dispatch radius',
    tierColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'golf_cart_paramedic',
    labelKey: 'reg_role_golf_cart',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    badgeDark: 'bg-amber-900/40 text-amber-300 border-amber-700',
    icon: '🛺',
    descKey: 'reg_role_golf_cart_desc',
    skills: ['CPR Certified', 'IV Access', 'AED Certified', 'Glucagon Administration', 'Oxygen Therapy', 'Patient Transport'],
    tier: 2,
    tierLabel: 'Tier 2 — SRCA Paramedic · Golf Cart',
    tierColor: 'bg-amber-100 text-amber-700',
  },
]

const SKILLS_LIST = ['Basic First Aid','CPR Certified','IV Access','AED Certified','Cardiac Response','Crowd Navigation','Crowd Management','Diabetic Emergency','Glucose Gel Administration','Glucagon Administration','Oxygen Therapy','Patient Transport','Wound Care']
const ZONES = ['Masjid al-Haram','Mina','Arafat','Muzdalifah','Jamarat']

export default function ResponderRegister() {
  const navigate = useNavigate()
  const { register } = useResponder()
  const { isDark } = useTheme()
  const { t } = useLang()
  const [form, setForm] = useState({ name:'', staffId:'', role:'', skills:[], phone:'', zone:'', onDuty:true })
  const [errors, setErrors] = useState({})

  const toggleSkill = s => setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills, s] }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = t('reg_required')
    if (!form.staffId.trim()) e.staffId = t('reg_required')
    if (!form.role)           e.role    = t('reg_required')
    if (!form.phone.trim())   e.phone   = t('reg_required')
    if (!form.zone)           e.zone    = t('reg_required')
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = () => {
    if (!validate()) return
    register(form)
    navigate('/responder/home')
  }

  const selectedType = RESPONDER_TYPES.find(tp => tp.id === form.role)

  const bgPage  = isDark ? 'bg-[#0a1628]' : 'bg-[#fafaf9]'
  const textP   = isDark ? 'text-white'    : 'text-[#0f1e45]'
  const textM   = isDark ? 'text-white/50' : 'text-gray-500'
  const inp     = `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? 'bg-[#0f1e45] border-[#1e3a5f] text-white placeholder-white/30' : 'bg-white border-gray-200 text-[#0f1e45]'}`
  const cardBase = isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-white border-gray-200'

  return (
    <div className={`min-h-screen ${bgPage}`}>
      <div className="bg-amber-500 text-white px-4 pt-7 pb-5 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {t('reg_onboarding')}
        </div>
        <h1 className="text-xl font-bold">{t('reg_title')}</h1>
        <p className="text-amber-100 text-xs mt-1">{t('reg_subtitle')}</p>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">

        {/* Responder Type Selection */}
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${textM}`}>{t('reg_type')}</label>
          <div className="space-y-2.5">
            {RESPONDER_TYPES.map(tp => {
              const selected = form.role === tp.id
              return (
                <button key={tp.id} type="button" onClick={() => setForm(f => ({ ...f, role: tp.id }))}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                    selected
                      ? isDark ? 'border-amber-500 bg-amber-900/20' : 'border-amber-500 bg-amber-50'
                      : isDark ? 'border-[#1e3a5f] bg-[#0f1e45] hover:border-amber-700' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-2xl">{tp.icon}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isDark ? tp.badgeDark : tp.badge}`}>
                      {t(tp.labelKey)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tp.tierColor}`}>{tp.tierLabel}</span>
                    {selected && <span className="ml-auto text-amber-500 text-lg">✓</span>}
                  </div>
                  <p className={`text-xs leading-relaxed pl-9 ${textM}`}>{t(tp.descKey)}</p>
                </button>
              )
            })}
          </div>
          {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
        </div>

        {/* Operational note for Golf Cart Paramedic */}
        {form.role === 'golf_cart_paramedic' && (
          <div className={`border rounded-xl px-4 py-3 text-xs leading-relaxed ${isDark ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            🛺 <strong>{t('reg_note')}:</strong> {t('reg_golf_cart_note')}
          </div>
        )}
        {/* Info note for Humanitarian Volunteer */}
        {form.role === 'humanitarian_volunteer' && (
          <div className={`border rounded-xl px-4 py-3 text-xs leading-relaxed ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-600'}`}>
            🙋 <strong>{t('reg_note')}:</strong> As a Humanitarian Volunteer, you report emergencies but are not dispatched to provide medical care. Your reports are instantly forwarded to the nearest Paramedic Volunteer.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textM}`}>{t('reg_name')}</label>
            <input className={inp} placeholder={t('reg_name_ph')} value={form.name} onChange={e => setForm({...form, name:e.target.value})} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textM}`}>{t('reg_staff_id')}</label>
            <input className={inp} placeholder="SR-2026-0042" value={form.staffId} onChange={e => setForm({...form, staffId:e.target.value})} />
            {errors.staffId && <p className="text-red-500 text-xs mt-1">{errors.staffId}</p>}
          </div>
        </div>

        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textM}`}>{t('reg_phone')}</label>
          <input className={inp} placeholder="+966 5x xxx xxxx" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Skills */}
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${textM}`}>{t('reg_skills')}</label>
          {selectedType && (
            <p className={`text-xs rounded-xl px-3 py-2 mb-2 border ${isDark ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              {t('reg_recommended')} {t(selectedType.labelKey)}: {selectedType.skills.join(' · ')}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {SKILLS_LIST.map(s => {
              const on = form.skills.includes(s)
              return (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left text-xs font-semibold transition-all ${
                    on
                      ? isDark ? 'border-amber-500 bg-amber-900/20 text-amber-300' : 'border-amber-500 bg-amber-50 text-amber-700'
                      : isDark ? 'border-[#1e3a5f] text-white/50 hover:border-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${on ? 'bg-amber-500 border-amber-500' : isDark ? 'border-white/20' : 'border-gray-300'}`}>
                    {on && <span className="text-white text-[10px]">✓</span>}
                  </span>
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Zone */}
        <div>
          <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textM}`}>
            {form.role === 'golf_cart_paramedic' ? t('reg_zone_vehicle') : t('reg_zone')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ZONES.map(z => (
              <button key={z} type="button" onClick={() => setForm({...form, zone:z})}
                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-semibold text-center transition-all ${
                  form.zone===z
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : isDark ? 'border-[#1e3a5f] text-white/50 hover:border-amber-700' : 'border-gray-200 text-gray-500 hover:border-amber-300'
                }`}>
                {z}
              </button>
            ))}
          </div>
          {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone}</p>}
        </div>

        {/* On Duty toggle */}
        <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${isDark ? 'bg-[#0f1e45] border-[#1e3a5f]' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            <div className={`font-semibold text-sm ${textP}`}>{t('reg_on_duty')}</div>
            <div className={`text-xs ${textM}`}>{t('reg_on_duty_sub')}</div>
          </div>
          <button type="button" onClick={() => setForm(f => ({...f, onDuty:!f.onDuty}))}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${form.onDuty?'bg-green-500':'bg-gray-400'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.onDuty?'left-7':'left-1'}`} />
          </button>
        </div>

        <div className={`border rounded-xl px-4 py-3 text-xs leading-relaxed ${isDark ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          📍 {t('reg_location_consent')}
        </div>

        <button type="button" onClick={handleSubmit}
          className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded-2xl transition-colors text-base shadow-lg shadow-amber-900/20">
          {t('reg_submit')}
        </button>
      </div>
    </div>
  )
}
