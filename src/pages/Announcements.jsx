import { useState } from 'react'
import { CheckCircle2, Filter, Megaphone } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useAppData } from '../context/AppContext'

const filters = [
  ['all', 'Tümü'],
  ['urgent', 'Önemli'],
  ['event', 'Etkinlik'],
  ['rules', 'Kurallar'],
]

export default function Announcements() {
  const { announcements, notify } = useAppData()
  const [activeFilter, setActiveFilter] = useState('all')
  const [readIds, setReadIds] = useState(new Set())

  const visibleAnnouncements =
    activeFilter === 'all'
      ? announcements
      : announcements.filter((announcement) => announcement.type === activeFilter)

  const markRead = (id) => {
    setReadIds((current) => new Set(current).add(id))
    notify('Duyuru okundu olarak işaretlendi.')
  }

  return (
    <section className="screen page">
      <div className="titlebar">
        <h1>Duyurular</h1>
        <button className="icon-btn" type="button" aria-label="Duyuru filtresi">
          <Filter size={18} />
        </button>
      </div>

      <div className="tabs scroll-tabs" role="tablist" aria-label="Duyuru kategorileri">
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeFilter === key ? 'active' : ''}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="announce-list">
        {visibleAnnouncements.map((announcement) => {
          const read = readIds.has(announcement.id)
          return (
            <GlassCard
              className={`announce ${read ? 'read' : ''}`}
              key={announcement.id}
              as="button"
              type="button"
              onClick={() => markRead(announcement.id)}
            >
              <div>
                {read ? <CheckCircle2 /> : <Megaphone />}
              </div>
              <section>
                <h3>{announcement.title}</h3>
                <p>{announcement.body}</p>
                <small>{announcement.time}</small>
              </section>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
