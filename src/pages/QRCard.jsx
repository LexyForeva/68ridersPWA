import { Link } from 'react-router-dom'
import { ArrowLeft, Bike, Calendar, Droplets, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo'
import { useAppData } from '../context/AppContext'

export default function QRCard() {
  const { currentUser } = useAppData()

  return (
    <section className="screen page">
      <div className="titlebar">
        <Link to="/" aria-label="Ana sayfaya dön">
          <ArrowLeft />
        </Link>
        <h1>Üyelik Kartım</h1>
        <span />
      </div>

      <div className="member-card pro">
        <Logo />
        <div className="qr-frame">
          <img className="qr-img" src="/qr-member-68123.svg" alt="68 Riders üyelik QR kodu" />
        </div>
        <strong>#{currentUser.id}</strong>
        <h2>{currentUser.name}</h2>
        <p>{currentUser.role}</p>
        <div className="member-tags">
          <span>
            <ShieldCheck size={15} /> Onaylı Üye
          </span>
          <span>
            <Bike size={15} /> {currentUser.bike}
          </span>
          <span>
            <Droplets size={15} /> {currentUser.blood}
          </span>
        </div>
        <div className="divider" />
        <span>
          <Calendar size={16} /> Üyelik: {currentUser.memberSince}
        </span>
        <small>{currentUser.qrUrl}</small>
      </div>
    </section>
  )
}
