import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import { useAppData } from './context/AppContext'

const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const QRCard = lazy(() => import('./pages/QRCard'))
const Announcements = lazy(() => import('./pages/Announcements'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Profile = lazy(() => import('./pages/Profile'))
const Admin = lazy(() => import('./pages/Admin'))
const Chat = lazy(() => import('./pages/Chat'))
const Settings = lazy(() => import('./pages/Settings'))
const Feedback = lazy(() => import('./pages/Feedback'))

export default function App() {
  const { pathname } = useLocation()
  const { toast, clearToast } = useAppData()
  const showNav = !['/login', '/register'].includes(pathname)

  return (
    <main className="app-shell">
      <Suspense fallback={<section className="screen page loading-screen">Yükleniyor...</section>}>
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
          <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      {showNav && <BottomNav />}
      <PWAInstallPrompt />
      <Toast toast={toast} onDismiss={clearToast} />
    </main>
  )
}
