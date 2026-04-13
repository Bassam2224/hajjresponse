import { createContext, useContext, useState } from 'react'

const ResponderContext = createContext(null)

const EMPTY_PROFILE = {
  name: '', staffId: '', role: '', skills: [], phone: '', zone: '', onDuty: false,
  registered: false,
}

export function ResponderProvider({ children }) {
  const [responder, setResponder]         = useState(EMPTY_PROFILE)
  const [assignment, setAssignment]       = useState(null)  // incident object
  const [notification, setNotification]   = useState(null)  // pending incident
  const [history, setHistory]             = useState([])

  const [dutyStartTime, setDutyStartTime] = useState(null)

  const register = (profile) => {
    setResponder({ ...profile, onDuty: true, registered: true })
    setDutyStartTime(Date.now())
  }

  const toggleDuty = () => {
    setResponder(r => ({ ...r, onDuty: !r.onDuty }))
    setDutyStartTime(prev => prev ? null : Date.now())
  }

  const acceptAssignment = (incident, updateIncident) => {
    const eta = Math.floor(Math.random() * 4) + 2
    updateIncident(incident.id, {
      responder: responder.name,
      responderETA: eta,
      status: 'Dispatched',
    })
    setAssignment({ ...incident, responderETA: eta })
    setNotification(null)
  }

  const declineAssignment = () => setNotification(null)

  const completeAssignment = (outcome) => {
    if (assignment) {
      setHistory(h => [{
        ...assignment,
        outcome,
        completedAt: new Date().toLocaleTimeString(),
      }, ...h])
    }
    setAssignment(null)
  }

  return (
    <ResponderContext.Provider value={{
      responder, register, toggleDuty,
      assignment, setAssignment,
      notification, setNotification,
      acceptAssignment, declineAssignment,
      completeAssignment,
      history,
      dutyStartTime,
    }}>
      {children}
    </ResponderContext.Provider>
  )
}

export function useResponder() { return useContext(ResponderContext) }
