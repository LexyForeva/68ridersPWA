import { NavLink, useLocation } from 'react-router-dom'
import { Home, CalendarDays, Image, User, QrCode } from 'lucide-react'

const navClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`
const qrClass = ({ isActive }) => `qr-fab${isActive ? ' active' : ''}`

export default function BottomNav() {
  const { pathname } = useLocation()
  const profileClass = ({ isActive }) => `nav-item${isActive || pathname === '/settings' ? ' active' : ''}`

  return (
    <nav className="bottom-nav" aria-label="Alt menü">
      <NavLink to="/" end className={navClass}>
        <Home size={20} />
        <span>Ana Sayfa</span>
      </NavLink>
      <NavLink to="/events" className={navClass}>
        <CalendarDays size={20} />
        <span>Etkinlikler</span>
      </NavLink>
      <NavLink to="/qr" className={qrClass}>
        <QrCode size={28} />
        <span>QR Kart</span>
      </NavLink>
      <NavLink to="/gallery" className={navClass}>
        <Image size={20} />
        <span>Galeri</span>
      </NavLink>
      <NavLink to="/profile" className={profileClass}>
        <User size={20} />
        <span>Profil</span>
      </NavLink>
    </nav>
  )
}
