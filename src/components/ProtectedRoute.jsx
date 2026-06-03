import { Navigate, useLocation } from 'react-router-dom'
import GlassCard from './GlassCard'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation()
  const { loading, realMode, isAuthenticated, isActive, isPending, isBlocked, isAdmin, profile } = useAuth()

  if (loading) {
    return (
      <section className="screen page">
        <GlassCard className="empty-state">
          <b>Oturum kontrol ediliyor</b>
          <span>Üyelik durumu doğrulanıyor.</span>
        </GlassCard>
      </section>
    )
  }

  if (realMode && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (realMode && isPending) {
    return (
      <section className="screen page">
        <GlassCard className="empty-state">
          <b>Başvurun onay bekliyor</b>
          <span>Kurucu onayından sonra üye alanları açılacak.</span>
        </GlassCard>
      </section>
    )
  }

  if (realMode && isBlocked) {
    return (
      <section className="screen page">
        <GlassCard className="empty-state danger">
          <b>Erişim kapalı</b>
          <span>Üyelik durumun: {profile?.status}. Kurucu ile iletişime geçmelisin.</span>
        </GlassCard>
      </section>
    )
  }

  if (realMode && !isActive) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return (
      <section className="screen page">
        <GlassCard className="empty-state danger">
          <b>Admin yetkisi gerekiyor</b>
          <span>Bu alan sadece kurucu ve yönetim ekibine açıktır.</span>
        </GlassCard>
      </section>
    )
  }

  return children
}
