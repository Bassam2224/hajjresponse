import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { IncidentProvider } from './context/IncidentContext'
import { ResponderProvider } from './context/ResponderContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import DemoBanner from './components/DemoBanner'
import PilgrimLayout from './layouts/PilgrimLayout'
import ResponderLayout from './layouts/ResponderLayout'
import ManagementLayout from './layouts/ManagementLayout'
import Landing from './pages/Landing'
import PilgrimRegister from './pages/pilgrim/Register'
import PilgrimSOS from './pages/pilgrim/SOS'
import PilgrimProfile from './pages/pilgrim/Profile'
import ResponderRegister from './pages/responder/Register'
import ResponderHome from './pages/responder/Home'
import ResponderHistory from './pages/responder/History'
import ManagementLogin from './pages/management/Login'
import ManagementDashboard from './pages/management/Dashboard'
import ManagementPilgrims from './pages/management/Pilgrims'
import ManagementResponders from './pages/management/Responders'
import ManagementAnalytics from './pages/management/Analytics'

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <IncidentProvider>
      <ResponderProvider>
        <BrowserRouter>
          <DemoBanner />
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Pilgrim section */}
            <Route element={<PilgrimLayout />}>
              <Route path="/pilgrim/register" element={<PilgrimRegister />} />
              <Route path="/pilgrim/sos"      element={<PilgrimSOS />} />
              <Route path="/pilgrim/profile"  element={<PilgrimProfile />} />
            </Route>

            {/* Responder section */}
            <Route path="/responder/register" element={<ResponderRegister />} />
            <Route element={<ResponderLayout />}>
              <Route path="/responder/home"    element={<ResponderHome />} />
              <Route path="/responder/history" element={<ResponderHistory />} />
            </Route>

            {/* Operations & Management section — routes: /ops/* */}
            <Route path="/ops/login" element={<ManagementLogin />} />
            <Route element={<ManagementLayout />}>
              <Route path="/ops/dashboard"  element={<ManagementDashboard />} />
              <Route path="/ops/pilgrims"   element={<ManagementPilgrims />} />
              <Route path="/ops/responders" element={<ManagementResponders />} />
              <Route path="/ops/analytics"  element={<ManagementAnalytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ResponderProvider>
    </IncidentProvider>
    </LanguageProvider>
    </ThemeProvider>
  )
}
