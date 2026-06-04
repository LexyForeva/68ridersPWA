import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, MapPin, Route, ShieldCheck, Users } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import MotoImage from '../components/MotoImage'
import { useAppData } from '../context/AppContext'

export default function EventDetail() {
  const { eventId } = useParams()
  const { events, isJoined, toggleJoin } = useAppData()
  const event = events.find((item) => String(item.id) === String(eventId))

  if (!event) {
    return (
      <section className="screen page">
        <div className="titlebar left">
          <Link to="/events" aria-label="Etkinliklere dön">
            <ArrowLeft />
          </Link>
          <h1>Etkinlik bulunamadı</h1>
        </div>
        <GlassCard className="empty-state">
          <b>Bu demo etkinlik artık listede yok.</b>
          <span>Etkinlikler sayfasından güncel listeyi açabilirsin.</span>
        </GlassCard>
      </section>
    )
  }

  const joined = isJoined(event.id)

  return (
    <section className="screen page">
      <div className="titlebar left">
        <Link to="/events" aria-label="Etkinliklere dön">
          <ArrowLeft />
        </Link>
        <h1>Etkinlik Detayı</h1>
      </div>

      <GlassCard className="detail-hero">
        <MotoImage type={event.image} src={event.src} />
        <div>
          <span className="eyebrow">{event.status}</span>
          <h2>{event.title}</h2>
          <p>{event.details}</p>
        </div>
      </GlassCard>

      <div className="detail-grid">
        <GlassCard>
          <Calendar size={18} />
          <b>{event.date}</b>
          <span>{event.time}</span>
        </GlassCard>
        <GlassCard>
          <MapPin size={18} />
          <b>{event.place}</b>
          <span>{event.meetingPoint}</span>
        </GlassCard>
        <GlassCard>
          <Route size={18} />
          <b>{event.distance}</b>
          <span>{event.pace}</span>
        </GlassCard>
        <GlassCard>
          <Users size={18} />
          <b>+{event.people}</b>
          <span>katılımcı</span>
        </GlassCard>
      </div>

      <GlassCard className="route-plan">
        <h2>Rota Planı</h2>
        <p>
          <Clock size={15} /> 08:30 garaj buluşması
        </p>
        <p>
          <ShieldCheck size={15} /> Güvenlik brifingi ve ekip dizilimi
        </p>
        <p>
          <MapPin size={15} /> Fotoğraf molası ve dönüş kontrolü
        </p>
      </GlassCard>

      <button
        type="button"
        className={`primary-btn sticky-action ${joined ? 'joined' : ''}`}
        onClick={() => toggleJoin(event.id)}
        aria-pressed={joined}
      >
        {joined ? 'Katıldın' : 'Katılacağım'}
      </button>
    </section>
  )
}
