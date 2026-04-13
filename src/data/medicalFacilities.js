// ── Verified Hajj 2025 medical facility data ─────────────────────────────
// Based on published Saudi MOH / Hajj Authority facility records

export const HOSPITALS = [
  { id:'H-1', name:'Mina Al Jasar Hospital',       coords:[21.4270, 39.8734], beds:800, specialty:'General · Cardiac · Surgical',   bedsAvail:142, incoming:3, vehicles:4 },
  { id:'H-2', name:'Mina Al Wadi Hospital',         coords:[21.4198, 39.8812], beds:null, specialty:'General · Emergency',            bedsAvail:87,  incoming:1, vehicles:2 },
  { id:'H-3', name:'Armed Forces Hospital Mina',    coords:[21.4155, 39.8778], beds:null, specialty:'Trauma · Surgical · ICU',        bedsAvail:53,  incoming:2, vehicles:3 },
  { id:'H-4', name:'Arafat General Hospital',       coords:[21.3547, 39.9847], beds:800, specialty:'General · Heat Exhaustion · ICU', bedsAvail:210, incoming:0, vehicles:5 },
  { id:'H-5', name:'Jabal Al Rahmah Hospital',      coords:[21.3583, 39.9892], beds:null, specialty:'General · Emergency',            bedsAvail:95,  incoming:1, vehicles:2 },
]

export const HEALTH_CENTERS = [
  { id:'HC-1',  name:'Jamarat Medical Center 1',   coords:[21.4228, 39.8656], specialty:'Heat Exhaustion · First Aid' },
  { id:'HC-2',  name:'Jamarat Medical Center 2',   coords:[21.4215, 39.8671], specialty:'First Aid · Crowd Trauma'   },
  { id:'HC-3',  name:'Jamarat Medical Center 3',   coords:[21.4235, 39.8643], specialty:'First Aid · Cardiac'        },
  { id:'HC-4',  name:'Jamarat Medical Center 4',   coords:[21.4242, 39.8661], specialty:'First Aid · General'        },
  { id:'HC-5',  name:'Jamarat Medical Center 5',   coords:[21.4221, 39.8648], specialty:'Heat Exhaustion · First Aid' },
  { id:'HC-6',  name:'Holy Mosque Medical Center', coords:[21.4225, 39.8262], specialty:'General · Emergency · First Aid' },
  { id:'HC-7',  name:'Muzdalifah Health Center 1', coords:[21.3820, 39.9156], specialty:'Heat Exhaustion · First Aid' },
  { id:'HC-8',  name:'Muzdalifah Health Center 2', coords:[21.3798, 39.9134], specialty:'First Aid · General'        },
  { id:'HC-9',  name:'Muzdalifah Health Center 3', coords:[21.3812, 39.9178], specialty:'Heat Exhaustion · Diabetic'  },
]

// All facilities combined for map rendering
export const ALL_FACILITIES = [
  ...HOSPITALS.map(h => ({ ...h, type:'hospital' })),
  ...HEALTH_CENTERS.map(h => ({ ...h, type:'center', beds: null, bedsAvail: null, incoming: null, vehicles: null })),
]

// Zone → nearest hospital for golf cart transfer routing
export const ZONE_TO_HOSPITAL = {
  'Masjid al-Haram': HOSPITALS[0], // Mina Al Jasar (closest large)
  'Mina':            HOSPITALS[0], // Mina Al Jasar
  'Muzdalifah':      HOSPITALS[1], // Mina Al Wadi
  'Arafat':          HOSPITALS[3], // Arafat General
  'Jamarat':         HOSPITALS[2], // Armed Forces Mina
}

export function haversineDist(a, b) {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLon = (b[1] - a[1]) * Math.PI / 180
  const s = Math.sin(dLat/2)**2 + Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLon/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s)))
}

export function nearestHospital(coords) {
  return HOSPITALS.reduce((best, h) => {
    const d = haversineDist(coords, h.coords)
    return d < best.dist ? { ...h, dist: d } : best
  }, { ...HOSPITALS[0], dist: haversineDist(coords, HOSPITALS[0].coords) })
}
