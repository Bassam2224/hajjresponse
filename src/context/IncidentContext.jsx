import { createContext, useContext, useState, useEffect, useRef } from 'react'

const IncidentContext = createContext(null)

const AUTO_POOL = [
  {
    pilgrim: 'Omar Al-Farsi', nationality: 'Omani', age: 69,
    zone: 'Masjid al-Haram — Gate 5', type: 'Heatstroke',
    tier: 2, detection: 'Wristband Auto-Detect', responder: 'Golf Cart Unit 3',
    status: 'En Route', risk: 'High', glucose: false,
  },
  {
    pilgrim: 'Amina Diallo', nationality: 'Senegalese', age: 55,
    zone: 'Muzdalifah — Open Plain', type: 'Hypoglycemic Emergency',
    tier: 1, detection: 'Wristband Auto-Detect', responder: 'Volunteer Team 12',
    status: 'Pending', risk: 'Medium', glucose: true,
  },
  {
    pilgrim: 'Ibrahim Koné', nationality: 'Ivorian', age: 74,
    zone: 'Jamarat Bridge — Level 3', type: 'Cardiac Alert',
    tier: 3, detection: 'Manual SOS', responder: 'Ambulance 04',
    status: 'Dispatched', risk: 'Critical', glucose: false,
  },
  {
    pilgrim: 'Khadijah Yilmaz', nationality: 'Turkish', age: 61,
    zone: 'Arafat Plain — Zone C', type: 'Heatstroke',
    tier: 2, detection: 'Wristband Auto-Detect', responder: 'Golf Cart Unit 7',
    status: 'En Route', risk: 'High', glucose: false,
  },
  {
    pilgrim: 'Bilal Chowdhury', nationality: 'Bangladeshi', age: 48,
    zone: 'Mina Sector 3 — Tent 22', type: 'Crowd Crush',
    tier: 1, detection: 'Manual SOS', responder: 'Volunteer Team 5',
    status: 'On Scene', risk: 'Medium', glucose: false,
  },
  {
    pilgrim: 'Nour El-Din Masri', nationality: 'Egyptian', age: 80,
    zone: 'Masjid al-Haram — Safa', type: 'Cardiac Alert',
    tier: 3, detection: 'Wristband Auto-Detect', responder: 'Ambulance 09',
    status: 'Pending', risk: 'Critical', glucose: false,
  },
]

const BASE_INCIDENTS = [
  {
    id: 'INC-001', pilgrim: 'Ahmed Al-Rashidi', nationality: 'Saudi', age: 72,
    zone: 'Mina Sector 3 — Tent 14B', type: 'Cardiac Alert',
    tier: 3, detection: 'Wristband Auto-Detect', responder: 'Ambulance 02',
    status: 'En Route', risk: 'Critical', glucose: false, elapsed: 42,
  },
  {
    id: 'INC-002', pilgrim: 'Fatimah Okonkwo', nationality: 'Nigerian', age: 65,
    zone: 'Arafat Plain — Zone B', type: 'Heatstroke',
    tier: 2, detection: 'Wristband Auto-Detect', responder: 'Golf Cart Unit 5',
    status: 'On Scene', risk: 'High', glucose: false, elapsed: 75,
  },
  {
    id: 'INC-003', pilgrim: 'Yusuf Benali', nationality: 'Moroccan', age: 58,
    zone: 'Jamarat Bridge — Gate 3', type: 'Crowd Crush',
    tier: 1, detection: 'Manual SOS', responder: 'Unassigned',
    status: 'Pending', risk: 'Medium', glucose: false, elapsed: 150,
  },
  {
    id: 'INC-004', pilgrim: 'Zainab Hassan', nationality: 'Pakistani', age: 44,
    zone: 'Muzdalifah — Sector 4', type: 'Hypoglycemic Emergency',
    tier: 1, detection: 'Wristband Auto-Detect', responder: 'Volunteer Team 8',
    status: 'Resolved', risk: 'Low', glucose: true, elapsed: 250,
  },
]

let incCounter = BASE_INCIDENTS.length + 1

export function IncidentProvider({ children }) {
  const [incidents, setIncidents] = useState(BASE_INCIDENTS)
  const poolRef = useRef(0)

  // tick elapsed seconds
  useEffect(() => {
    const t = setInterval(() => {
      setIncidents(prev =>
        prev.map(inc =>
          inc.status !== 'Resolved' ? { ...inc, elapsed: inc.elapsed + 1 } : inc
        )
      )
    }, 1000)
    return () => clearInterval(t)
  }, [])

  // auto-inject new incident every 30s
  useEffect(() => {
    const t = setInterval(() => {
      const template = AUTO_POOL[poolRef.current % AUTO_POOL.length]
      poolRef.current++
      const id = `INC-${String(incCounter++).padStart(3, '0')}`
      setIncidents(prev => [{ ...template, id, elapsed: 0 }, ...prev])
    }, 30000)
    return () => clearInterval(t)
  }, [])

  const addIncident = (inc) => {
    const id = `INC-${String(incCounter++).padStart(3, '0')}`
    setIncidents(prev => [{ ...inc, id, elapsed: 0 }, ...prev])
  }

  return (
    <IncidentContext.Provider value={{ incidents, addIncident }}>
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncidents() {
  return useContext(IncidentContext)
}
