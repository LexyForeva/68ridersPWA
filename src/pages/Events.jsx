import { useRef, useState } from 'react'
import { Filter, Plus } from 'lucide-react'
import EventCard from '../components/EventCard'
import GlassCard from '../components/GlassCard'
import Modal from '../components/Modal'
import { useAppData } from '../context/AppContext'

const tabs = [
  ['upcoming', 'Yaklaşan'],
  ['past', 'Geçmiş'],
  ['joined', 'Katıldıklarım'],
]

const emptyForm = {
  title: '',
  date: '',
  time: '',
  place: '',
  distance: '',
  pace: 'Orta tempo',
  details: '',
  src: '',
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function Events() {
  const { events, isJoined, toggleJoin, addEvent, currentUser } = useAppData()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const imageInputRef = useRef(null)

  const visibleEvents =
    activeTab === 'joined'
      ? events.filter((event) => isJoined(event.id))
      : activeTab === 'past'
        ? []
        : events

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const chooseEventImage = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    updateForm('src', await readFileAsDataUrl(file))
    event.target.value = ''
  }

  const submitEvent = (event) => {
    event.preventDefault()
    addEvent({
      title: form.title || 'Yeni Kurucu Rotası',
      date: form.date || 'Haziran 2026',
      time: form.time || '10:00',
      place: form.place || '68 Riders Garaj',
      distance: form.distance || 'Demo rota',
      pace: form.pace || 'Orta tempo',
      details: form.details || `${currentUser.name} tarafından oluşturulan kurucu demo etkinliği.`,
      status: 'Katılım açık',
      src: form.src,
    })
    setForm(emptyForm)
    setCreateOpen(false)
    setActiveTab('upcoming')
  }

  return (
    <section className="screen page">
      <div className="titlebar">
        <h1>Etkinlikler</h1>
        <div className="head-actions">
          <button className="icon-btn" type="button" onClick={() => setCreateOpen(true)} aria-label="Etkinlik oluştur">
            <Plus size={18} />
          </button>
          <button className="icon-btn" type="button" aria-label="Filtrele">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Etkinlik filtreleri">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeTab === key ? 'active' : ''}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="event-list">
        {visibleEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            joined={isJoined(event.id)}
            onToggle={toggleJoin}
          />
        ))}
      </div>

      {!visibleEvents.length && (
        <GlassCard className="empty-state">
          <b>Henüz etkinlik yok</b>
          <span>Katıldıkların burada görünecek.</span>
        </GlassCard>
      )}

      {createOpen && (
        <Modal title="Etkinlik Oluştur" onClose={() => setCreateOpen(false)}>
          <form className="modal-form" onSubmit={submitEvent}>
            <Field label="Başlık" value={form.title} onChange={(value) => updateForm('title', value)} />
            <Field label="Tarih" value={form.date} onChange={(value) => updateForm('date', value)} />
            <Field label="Saat" value={form.time} onChange={(value) => updateForm('time', value)} />
            <Field label="Konum" value={form.place} onChange={(value) => updateForm('place', value)} />
            <Field label="Mesafe" value={form.distance} onChange={(value) => updateForm('distance', value)} />
            <Field label="Tempo" value={form.pace} onChange={(value) => updateForm('pace', value)} />
            <button className="upload-drop compact" type="button" onClick={() => imageInputRef.current?.click()}>
              {form.src ? <img src={form.src} alt="Etkinlik fotoğrafı" /> : <span>Etkinlik fotoğrafı seç</span>}
            </button>
            <input ref={imageInputRef} className="sr-only" type="file" accept="image/*" onChange={chooseEventImage} />
            <label className="field">
              <span>Detay</span>
              <textarea value={form.details} onChange={(event) => updateForm('details', event.target.value)} />
            </label>
            <button type="submit" className="primary-btn">
              Etkinliği Yayınla
            </button>
          </form>
        </Modal>
      )}
    </section>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
