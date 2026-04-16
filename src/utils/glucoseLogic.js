/**
 * Clinical glucose classification engine for HajjResponse
 * All values in mmol/L
 *
 * Critical distinction: hypoglycemia requires glucose; hyperglycemia is worsened by glucose.
 * Wrong treatment for hyperglycemia/DKA can be fatal.
 */

export const GLUCOSE_ZONES = [
  {
    id:             'critical_hypo',
    type:           'hypoglycemia',
    label:          'Critical Hypoglycemia',
    shortLabel:     'CRITICAL LOW',
    threshold:      '< 2.5 mmol/L',
    color:          'red',
    flashing:       true,
    tier:           3,
    emergencyType:  'Hypoglycemic Emergency — Critical',
    // Responder instructions
    action:         'DO NOT give oral glucose. Glucagon injection only. Immediate transfer required.',
    actionVerb:     'GLUCAGON INJECTION ONLY',
    isGiveGlucose:  false,
    bring:          'Glucagon kit — NO oral glucose',
    dronePayload:   'Glucagon Kit × 2 · IV Glucose 50% · Glucometer · Cannula',
    // Ops display
    opsNote:        'Tier 3 — Emergency transfer. Glucagon only. Operations auto-alerted.',
    // Patient / bystander
    bystanderNote:  null, // may be unconscious
  },
  {
    id:             'severe_hypo',
    type:           'hypoglycemia',
    label:          'Severe Hypoglycemia',
    shortLabel:     'SEVERE LOW',
    threshold:      '2.5–3.0 mmol/L',
    color:          'red',
    flashing:       false,
    tier:           2,
    emergencyType:  'Hypoglycemic Emergency — Severe',
    action:         'Administer glucagon injection. Prepare for golf cart transport to medical point.',
    actionVerb:     'GIVE GLUCAGON',
    isGiveGlucose:  false,
    bring:          'Glucagon kit + glucose gel (if conscious)',
    dronePayload:   'Glucagon Kit × 1 · Glucose Gel × 3 · Glucometer',
    opsNote:        'Tier 2 — Glucagon + golf cart transport.',
    bystanderNote:  'Give glucagon injection if trained. Keep person on their side.',
  },
  {
    id:             'mild_hypo',
    type:           'hypoglycemia',
    label:          'Hypoglycemia',
    shortLabel:     'LOW',
    threshold:      '3.0–3.5 mmol/L',
    color:          'amber',
    flashing:       false,
    tier:           1,
    emergencyType:  'Hypoglycemic Emergency',
    action:         'Administer glucose gel if conscious. Do NOT give anything by mouth if unconscious.',
    actionVerb:     'GIVE GLUCOSE GEL',
    isGiveGlucose:  true,
    bring:          'Glucose gel × 2 + glucometer',
    dronePayload:   'Glucose Gel × 4 · Juice Packs · Glucometer',
    opsNote:        'Tier 1 — Glucose gel if conscious.',
    bystanderNote:  'Squeeze one sachet of glucose gel inside the cheek. Do NOT give food or drink if unconscious.',
  },
  {
    id:             'normal',
    type:           'normal',
    label:          'Normal',
    shortLabel:     'NORMAL',
    threshold:      '4.0–10.0 mmol/L',
    color:          'green',
    flashing:       false,
    tier:           0,
    emergencyType:  null,
    action:         null,
    actionVerb:     null,
    isGiveGlucose:  null,
    bring:          'Standard kit',
    dronePayload:   null,
    opsNote:        null,
    bystanderNote:  null,
  },
  {
    id:             'mild_hyper',
    type:           'hyperglycemia',
    label:          'Hyperglycemia',
    shortLabel:     'HIGH',
    threshold:      '14.0–20.0 mmol/L',
    color:          'amber',
    flashing:       false,
    tier:           2,
    emergencyType:  'Hyperglycemic Emergency',
    action:         'DO NOT administer glucose. Encourage hydration if conscious. Monitor for DKA signs: fruity breath, rapid breathing, confusion.',
    actionVerb:     'DO NOT GIVE GLUCOSE',
    isGiveGlucose:  false,
    bring:          'Water / fluids ONLY — NO glucose, no glucose gel',
    dronePayload:   'IV Fluid Supplies · Saline × 2 · Monitoring Kit',
    opsNote:        'Tier 2 — Hyperglycemia. NO glucose. Hydration + DKA monitoring.',
    bystanderNote:  'Give water only if conscious. DO NOT give sugary food or drinks. Watch for fruity-smelling breath.',
  },
  {
    id:             'severe_hyper',
    type:           'hyperglycemia',
    label:          'Severe Hyperglycemia / Possible DKA',
    shortLabel:     'SEVERE HIGH / DKA?',
    threshold:      '20.0–25.0 mmol/L',
    color:          'red',
    flashing:       false,
    tier:           3,
    emergencyType:  'Hyperglycemic Emergency — Possible DKA',
    action:         'Immediate hospital transfer required. DO NOT administer glucose or glucose gel. IV fluids at medical point only.',
    actionVerb:     'DO NOT GIVE GLUCOSE — DKA RISK',
    isGiveGlucose:  false,
    bring:          'NO glucose — prepare IV access for medical point',
    dronePayload:   'IV Fluid Supplies · Saline × 4 · Insulin Pen · IV Cannula Kit',
    opsNote:        'Tier 3 — DKA possible. No glucose. Immediate golf cart + transfer.',
    bystanderNote:  'DO NOT give food or drink. Emergency transfer to medical point. Stay with the person.',
  },
  {
    id:             'dka',
    type:           'dka',
    label:          'Critical DKA',
    shortLabel:     'DKA — CRITICAL',
    threshold:      '> 25.0 mmol/L',
    color:          'red',
    flashing:       true,
    tier:           3,
    emergencyType:  'DKA Alert — Critical',
    action:         'Critical DKA. Ambulance from medical point now. DO NOT give glucose. IV fluids ONLY. Operations auto-alerted.',
    actionVerb:     'AMBULANCE NOW — NO GLUCOSE',
    isGiveGlucose:  false,
    bring:          'NO glucose — activate ambulance immediately',
    dronePayload:   'IV Saline × 6 · Insulin · Monitoring Kit · IV Cannula Kit',
    opsNote:        'Tier 3 — CRITICAL DKA. Ambulance dispatched. Operations alerted.',
    bystanderNote:  'Emergency. Do not give anything by mouth. Medical team is coming.',
  },
]

/**
 * Classify a glucose reading into a clinical zone.
 * Returns null if mmol is null/undefined.
 */
export function classifyGlucose(mmol) {
  if (mmol === null || mmol === undefined) return null
  if (mmol < 2.5)   return GLUCOSE_ZONES[0] // critical_hypo
  if (mmol < 3.0)   return GLUCOSE_ZONES[1] // severe_hypo
  if (mmol < 3.5)   return GLUCOSE_ZONES[2] // mild_hypo
  if (mmol <= 14.0) return GLUCOSE_ZONES[3] // normal
  if (mmol < 20.0)  return GLUCOSE_ZONES[4] // mild_hyper
  if (mmol < 25.0)  return GLUCOSE_ZONES[5] // severe_hyper
  return GLUCOSE_ZONES[6]                   // dka
}

export function glucoseSeverityColor(gc, isDark) {
  if (!gc) return ''
  if (gc.color === 'green') return isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
  if (gc.color === 'amber') return isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-300'
  return isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-300'
}

export function glucoseTextColor(gc, isDark) {
  if (!gc) return ''
  if (gc.color === 'green') return isDark ? 'text-green-300' : 'text-green-700'
  if (gc.color === 'amber') return isDark ? 'text-amber-300' : 'text-amber-800'
  return isDark ? 'text-red-300' : 'text-red-800'
}

/**
 * Returns kit-match info for an incident.
 * Determines whether a Paramedic Volunteer (Tier 1) is sufficient
 * or a Golf Cart Paramedic (Tier 2) is required.
 *
 * tier 1 = Paramedic Volunteer (on foot) — BLS, glucose gel, cooling spray, wound care
 * tier 2 = Golf Cart Paramedic — AED, IV, oxygen, glucagon, patient transport
 */
export function getKitMatch(inc) {
  const gc   = (inc?.cgmReading != null) ? classifyGlucose(inc.cgmReading) : null
  const type = (inc?.type || '').toLowerCase()

  // Cardiac → AED + IV needed → Tier 2
  if (type.includes('cardiac') || type.includes('chest')) {
    return { tier: 2, label: 'Golf Cart Required', canVolunteer: false, needsGolfCart: true, note: 'AED + IV access needed' }
  }

  // DKA or severe hyperglycemia → IV fluids + hospital → Tier 2
  if (gc && (gc.id === 'dka' || gc.id === 'severe_hyper')) {
    return { tier: 2, label: 'Golf Cart Required', canVolunteer: false, needsGolfCart: true, note: gc.opsNote }
  }

  // Critical hypo → glucagon injection + IV glucose → Tier 2
  if (gc && gc.id === 'critical_hypo') {
    return { tier: 2, label: 'Golf Cart Required', canVolunteer: false, needsGolfCart: true, note: 'Glucagon kit + IV glucose needed' }
  }

  // Severe hypo → glucagon injection → Tier 2
  if (gc && gc.id === 'severe_hypo') {
    return { tier: 2, label: 'Golf Cart Required', canVolunteer: false, needsGolfCart: true, note: 'Glucagon injection + transport' }
  }

  // Mild hyperglycemia → IV fluids + DKA monitoring → Tier 2
  if (gc && gc.id === 'mild_hyper') {
    return { tier: 2, label: 'Golf Cart Required', canVolunteer: false, needsGolfCart: true, note: 'IV fluids + DKA monitoring' }
  }

  // Mild hypo → glucose gel → Tier 1 sufficient
  if (gc && gc.id === 'mild_hypo') {
    return { tier: 1, label: 'Volunteer Sufficient', canVolunteer: true, needsGolfCart: false, note: 'Glucose gel from volunteer kit' }
  }

  // Heat exhaustion → cooling spray + hydration → Tier 1
  if (type.includes('heat')) {
    return { tier: 1, label: 'Volunteer Sufficient', canVolunteer: true, needsGolfCart: false, note: 'Cooling spray + hydration' }
  }

  // Default: Tier 1 sufficient
  return { tier: 1, label: 'Volunteer Sufficient', canVolunteer: true, needsGolfCart: false, note: 'Standard first aid kit' }
}
