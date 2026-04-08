import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { IncidentProvider } from './context/IncidentContext'
import NavBar from './components/NavBar'
import DemoBanner from './components/DemoBanner'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import SOS from './pages/SOS'
import Profile from './pages/Profile'
import Architecture from './pages/Architecture'
import Impact from './pages/Impact'
import Register from './pages/Register'
import Login from './pages/Login'

export default function App() {
  return (
    <IncidentProvider>
      <BrowserRouter>
        <DemoBanner />
        <NavBar />
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/sos"         element={<SOS />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/impact"      element={<Impact />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/login"       element={<Login />} />
        </Routes>
      </BrowserRouter>
    </IncidentProvider>
  )
}
