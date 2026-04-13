import { createContext, useContext, useState, useEffect, useRef } from 'react'

const IncidentContext = createContext(null)

export const HAJJ_ZONES = ['Masjid al-Haram', 'Mina', 'Arafat', 'Muzdalifah', 'Jamarat']

export const STATUS_STAGES = [
  'Detected',
  'Volunteer Dispatched',
  'On Scene',
  'Golf Cart En Route',
  'En Route to Med Point',
  'At Medical Point',
  'Hospital Transfer',
  'Resolved',
]

export const MEDICAL_POINTS = [
  { id:'MP-1', name:'Mina Medical Point A',          coords:[21.4134, 39.8947], bedsAvail:8,  incoming:1, vehicles:2 },
  { id:'MP-2', name:'Mina Medical Point B',          coords:[21.4098, 39.8912], bedsAvail:12, incoming:0, vehicles:1 },
  { id:'MP-3', name:'Jamarat Medical Point',         coords:[21.4228, 39.8656], bedsAvail:6,  incoming:0, vehicles:2 },
  { id:'MP-4', name:'Arafat Medical Point',          coords:[21.3547, 39.9840], bedsAvail:15, incoming:0, vehicles:3 },
  { id:'MP-5', name:'Masjid al-Haram Medical Point', coords:[21.4225, 39.8262], bedsAvail:4,  incoming:2, vehicles:2 },
]

export const ZONE_TO_MED_POINT = {
  'Masjid al-Haram': 'Masjid al-Haram Medical Point',
  'Mina':            'Mina Medical Point A',
  'Arafat':          'Arafat Medical Point',
  'Muzdalifah':      'Mina Medical Point B',
  'Jamarat':         'Jamarat Medical Point',
}

const AUTO_POOL = [
  { pilgrim:'Omar Al-Farsi',     nationality:'Omani',       age:69, zone:'Masjid al-Haram', type:'Heatstroke',            tier:2, detection:'Wristband Auto-Detect', status:'Detected',   risk:'High',     conditions:['Hypertension'],                       medications:'Amlodipine 5mg',                bloodType:'A+',  glucose:false, cgmReading:null },
  { pilgrim:'Amina Diallo',      nationality:'Senegalese',  age:55, zone:'Muzdalifah',       type:'Hypoglycemic Emergency', tier:1, detection:'Wristband Auto-Detect', status:'Detected',   risk:'Medium',   conditions:['Type 2 Diabetes'],                    medications:'Metformin 500mg',               bloodType:'O+',  glucose:true,  cgmReading:3.4 },
  { pilgrim:'Ibrahim Koné',      nationality:'Ivorian',     age:74, zone:'Jamarat',          type:'Cardiac Alert',          tier:3, detection:'Manual SOS',           status:'Detected',   risk:'Critical', conditions:['Previous Cardiac Event','Hypertension'],medications:'Aspirin 75mg · Atorvastatin',    bloodType:'B+',  glucose:false, cgmReading:null },
  { pilgrim:'Khadijah Yilmaz',   nationality:'Turkish',     age:61, zone:'Arafat',           type:'Heatstroke',             tier:2, detection:'Wristband Auto-Detect', status:'Detected',   risk:'High',     conditions:['Hypertension','Kidney Disease'],       medications:'Furosemide 40mg',               bloodType:'AB+', glucose:false, cgmReading:null },
  { pilgrim:'Bilal Chowdhury',   nationality:'Bangladeshi', age:48, zone:'Mina',             type:'Crowd Crush',            tier:1, detection:'Manual SOS',           status:'Detected',   risk:'Medium',   conditions:[],                                     medications:'None',                          bloodType:'O-',  glucose:false, cgmReading:null },
  { pilgrim:'Nour El-Din Masri', nationality:'Egyptian',    age:80, zone:'Masjid al-Haram',  type:'Cardiac Alert',          tier:3, detection:'Wristband Auto-Detect', status:'Detected',   risk:'Critical', conditions:['Previous Cardiac Event','Asthma'],     medications:'Salbutamol · Bisoprolol',        bloodType:'A-',  glucose:false, cgmReading:null },
]

const BASE_INCIDENTS = [
  { id:'INC-001', pilgrim:'Ahmed Al-Rashidi',  nationality:'Saudi',    age:72, zone:'Mina',            type:'Cardiac Alert',          tier:3, detection:'Wristband Auto-Detect', responder:'Dr. Khalid Hassan',  responderETA:2, status:'On Scene',            risk:'Critical', conditions:['Previous Cardiac Event','Hypertension'], medications:'Aspirin 75mg · Amlodipine', bloodType:'A+',  glucose:false, cgmReading:null, escalated:false, golfCartRequested:false, assignedMedPoint:null, escalationNeeds:[], messages:[], elapsed:312 },
  { id:'INC-002', pilgrim:'Fatimah Okonkwo',   nationality:'Nigerian', age:65, zone:'Arafat',          type:'Heatstroke',             tier:2, detection:'Wristband Auto-Detect', responder:'Paramedic S. Ali',   responderETA:0, status:'Golf Cart En Route',   risk:'High',     conditions:['Hypertension'],                         medications:'Lisinopril 10mg',           bloodType:'O+',  glucose:false, cgmReading:null, escalated:false, golfCartRequested:true,  assignedMedPoint:'Arafat Medical Point', escalationNeeds:[], messages:[], elapsed:540 },
  { id:'INC-003', pilgrim:'Yusuf Benali',       nationality:'Moroccan', age:58, zone:'Jamarat',         type:'Crowd Crush',            tier:1, detection:'Manual SOS',           responder:null,                  responderETA:null, status:'Detected',          risk:'Medium',   conditions:[],                                       medications:'None',                      bloodType:'B+',  glucose:false, cgmReading:null, escalated:false, golfCartRequested:false, assignedMedPoint:null, escalationNeeds:[], messages:[], elapsed:90  },
  { id:'INC-004', pilgrim:'Zainab Hassan',      nationality:'Pakistani',age:44, zone:'Muzdalifah',      type:'Hypoglycemic Emergency', tier:1, detection:'Wristband Auto-Detect', responder:'Volunteer Team 8',   responderETA:0, status:'Resolved',            risk:'Low',      conditions:['Type 2 Diabetes'],                      medications:'Metformin 1000mg',          bloodType:'AB+', glucose:true,  cgmReading:4.2, escalated:false, golfCartRequested:false, assignedMedPoint:null, escalationNeeds:[], messages:[], elapsed:720 },
]

let incCounter = BASE_INCIDENTS.length + 1
const makeId = () => `INC-${String(incCounter++).padStart(3,'0')}`

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(BASE_INCIDENTS)
  const poolRef = useRef(0)

  // Tick elapsed for non-resolved
  useEffect(() => {
    const t = setInterval(() => {
      setIncidents(prev => prev.map(inc =>
        inc.status !== 'Resolved' ? { ...inc, elapsed: inc.elapsed + 1 } : inc
      ))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // Auto-inject every 30s
  useEffect(() => {
    const t = setInterval(() => {
      const template = AUTO_POOL[poolRef.current % AUTO_POOL.length]
      poolRef.current++
      setIncidents(prev => [{
        ...template, id:makeId(), elapsed:0,
        responder:null, responderETA:null,
        escalated:false, golfCartRequested:false, assignedMedPoint:null,
        escalationNeeds:[], messages:[],
      }, ...prev])
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const addIncident = (inc) => {
    setIncidents(prev => [{
      ...inc, id:makeId(), elapsed:0,
      status: inc.status || 'Detected',
      escalated:false, golfCartRequested:false, assignedMedPoint:null,
      escalationNeeds:[], messages:[],
    }, ...prev])
  }

  const updateIncident = (id, updates) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, ...updates } : inc))
  }

  return (
    <IncidentContext.Provider value={{ incidents, addIncident, updateIncident }}>
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncidents() { return useContext(IncidentContext) }
