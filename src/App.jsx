import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import { useAppData } from './context/AppContext'
import Login from './pages/Login'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import QRCard from './pages/QRCard'
import Announcements from './pages/Announcements'
import Gallery from './pages/Gallery'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Feedback from './pages/Feedback'

export default function App() {
  const { pathname } = useLocation()
  const { toast, clearToast } = useAppData()
  const showNav = !['/login', '/register'].includes(pathname)

  return (
    <main className="app-shell">
      <Routes>
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/register" element={<Login mode="register" />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/events/:eventId" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/qr" element={<ProtectedRoute><QRCard /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="*" element={<Home />} />
      </Routes>
      {showNav && <BottomNav />}
      <Toast toast={toast} onDismiss={clearToast} />
    </main>
  )
}
