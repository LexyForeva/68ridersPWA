import { Link, useLocation } from 'react-router-dom'
import {
  Bike,
  Bug,
  Calendar,
  ChevronRight,
  Clock,
  Image,
  MapPin,
  Megaphone,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Header from '../components/Header'
import MotoImage from '../components/MotoImage'
import { useAppData } from '../context/AppContext'

const shortcuts = [
  ['/qr', QrCode, 'Üyelik Kartım'],
  ['/events', Calendar, 'Etkinlikler'],
  ['/announcements', Megaphone, 'Duyurular'],
  ['/gallery', Image, 'Galeri'],
  ['/chat', MessageCircle, 'Ekip Sohbeti'],
  ['/admin', ShieldCheck, 'Yönetim'],
  ['/feedback', Bug, 'Hata Bildir'],
]

export default function Home() {
  const location = useLocation()
  const { events, announcements, activity, isJoined, toggleJoin } = useAppData()
  const featuredEvent = events[0]
  const joined = isJoined(featuredEvent.id)

  return (
    <section className="screen page">
      <Header />

      <GlassCard className="hero-card premium">
        <MotoImage type={featuredEvent.image} />
        <div className="hero-copy">
          <span className="eyebrow">BUGÜNKÜ SÜRÜŞ PLANI</span>
          <h1>{featuredEvent.title}</h1>
          <p>
            <Calendar size={15} /> {featuredEvent.date}
          </p>
          <p>
            <Clock size={15} /> {featuredEvent.time}
          </p>
          <p>
            <MapPin size={15} /> {featuredEvent.place}
          </p>
          <div className="hero-action">
            <button
              type="button"
              className={joined ? 'joined' : ''}
              onClick={() => toggleJoin(featuredEvent.id)}
              aria-pressed={joined}
            >
              {joined ? 'Katıldın' : 'Katılacağım'}
            </button>
            <span>
              <Users size={15} /> +{featuredEvent.people} katılacak
            </span>
          </div>
        </div>
      </GlassCard>

      <h2>Hızlı Erişim</h2>
      <div className="shortcut-grid">
        {shortcuts.map(([to, Icon, label]) => (
          <Link className="shortcut" to={to} state={to === '/feedback' ? { from: location.pathname } : undefined} key={label}>
            <Icon size={25} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="home-metrics">
        <GlassCard>
          <Bike size={18} />
          <b>68</b>
          <span>aktif üye</span>
        </GlassCard>
        <GlassCard>
          <Trophy size={18} />
          <b>8</b>
          <span>rozet</span>
        </GlassCard>
        <GlassCard>
          <ShieldCheck size={18} />
          <b>99%</b>
          <span>onaylı katılım</span>
        </GlassCard>
      </div>

      <div className="section-head">
        <h2>Yaklaşan Etkinlikler</h2>
        <Link to="/events">Tümünü Gör</Link>
      </div>
      <div className="mini-list">
        {events.slice(1, 3).map((event) => (
          <Link to={`/events/${event.id}`} key={event.id}>
            <GlassCard className="mini-event">
              <b>{event.title}</b>
              <span>
                {event.date} · {event.time}
              </span>
              <em>+{event.people}</em>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>Son Duyurular</h2>
        <Link to="/announcements" aria-label="Tüm duyurular">
          <ChevronRight size={18} />
        </Link>
      </div>
      <div className="notice-strip">
        {announcements.slice(0, 2).map((announcement) => (
          <GlassCard key={announcement.id} className="notice-mini">
            <Megaphone size={18} />
            <div>
              <b>{announcement.title}</b>
              <span>{announcement.time}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="section-head">
        <h2>Son Aktiviteler</h2>
      </div>
      <div className="activity-list">
        {activity.slice(0, 3).map((item) => (
          <GlassCard key={item} className="activity-item">
            {item}
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
