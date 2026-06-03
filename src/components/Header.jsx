import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import Logo from './Logo'
import { useAppData } from '../context/AppContext'

export default function Header() {
  const { currentUser } = useAppData()

  return (
    <header className="header">
      <Logo compact />
      <div className="head-actions">
        <Link className="icon-btn" to="/announcements" aria-label="Duyurular">
          <Bell size={18} />
          <b>3</b>
        </Link>
        <Link className="avatar" to="/profile" aria-label="Profil">
          {currentUser.photoUrl && <img src={currentUser.photoUrl} alt="" />}
        </Link>
      </div>
    </header>
  )
}
