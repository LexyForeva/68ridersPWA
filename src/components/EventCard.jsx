import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import MotoImage from './MotoImage'

export default function EventCard({ event, joined = false, onToggle }) {
  return (
    <article className="event-card rich">
      <MotoImage type={event.image} label={event.distance} />
      <div className="event-info">
        <h3>{event.title}</h3>
        <p>
          <Calendar size={14} /> {event.date} <Clock size={14} /> {event.time}
        </p>
        <p>
          <MapPin size={14} /> {event.place}
        </p>
        <small>{event.status}</small>
        <div className="event-row">
          <span>
            <Users size={14} /> +{event.people}
          </span>
          <div className="event-actions">
            <Link to={`/events/${event.id}`}>Detay</Link>
            <button
              type="button"
              className={joined ? 'joined' : ''}
              onClick={() => onToggle(event.id)}
              aria-pressed={joined}
            >
              {joined ? 'Katıldın' : 'Katıl'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
