import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bike,
  Camera,
  ChevronRight,
  HeartPulse,
  Medal,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Modal from '../components/Modal'
import { useAppData } from '../context/AppContext'

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function Profile() {
  const { currentUser, updateUser, updateProfilePhoto, notify } = useAppData()
  const [activePanel, setActivePanel] = useState(null)
  const [form, setForm] = useState(currentUser)
  const [notifications, setNotifications] = useState({
    events: true,
    announcements: true,
    chat: true,
  })
  const fileInputRef = useRef(null)

  const panelTitle = useMemo(
    () =>
      ({
        account: 'Hesap Bilgileri',
        notifications: 'Bildirim Ayarları',
        emergency: 'Acil Durum Bilgileri',
      })[activePanel],
    [activePanel],
  )

  const openPanel = (panel) => {
    setForm(currentUser)
    setActivePanel(panel)
  }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const saveProfile = (event) => {
    event.preventDefault()
    updateUser(form)
    setActivePanel(null)
  }

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      notify('Lütfen fotoğraf dosyası seç.', 'warning')
      return
    }

    const photoUrl = await readFileAsDataUrl(file)
    updateProfilePhoto(photoUrl)
    event.target.value = ''
  }

  const toggleNotification = (key) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }))
    notify('Bildirim tercihi güncellendi.')
  }

  return (
    <section className="screen page">
      <div className="titlebar">
        <h1>Profilim</h1>
        <Link className="icon-btn" to="/settings" aria-label="Ayarlar">
          <Settings size={18} />
        </Link>
      </div>

      <div className="profile-head">
        <button
          type="button"
          className="profile-photo rider editable-photo"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Profil fotoğrafı ekle veya değiştir"
        >
          {currentUser.photoUrl ? <img src={currentUser.photoUrl} alt="Profil" /> : <Camera size={18} />}
          <span>
            <Camera size={15} />
          </span>
        </button>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
        />
        <h2>{currentUser.name}</h2>
        <p>
          #{currentUser.id} · {currentUser.role}
        </p>
      </div>

      <div className="stats">
        <GlassCard>
          <b>15</b>
          <span>Etkinlik</span>
        </GlassCard>
        <GlassCard>
          <b>124</b>
          <span>Galeri</span>
        </GlassCard>
        <GlassCard>
          <b>8</b>
          <span>Rozet</span>
        </GlassCard>
        <GlassCard>
          <b>2</b>
          <span>Yıl Üyelik</span>
        </GlassCard>
      </div>

      <div className="badges">
        <GlassCard>
          <Medal />
          <span>Kurucu</span>
        </GlassCard>
        <GlassCard>
          <Bike />
          <span>{currentUser.bike.replace('CFMOTO ', '')}</span>
        </GlassCard>
        <GlassCard>
          <HeartPulse />
          <span>{currentUser.blood}</span>
        </GlassCard>
      </div>

      <GlassCard as="button" type="button" className="menu-row" onClick={() => openPanel('account')}>
        <span>Hesap Bilgileri</span>
        <ChevronRight />
      </GlassCard>
      <GlassCard as="button" type="button" className="menu-row" onClick={() => openPanel('notifications')}>
        <span>Bildirim Ayarları</span>
        <ChevronRight />
      </GlassCard>
      <GlassCard as="button" type="button" className="menu-row" onClick={() => openPanel('emergency')}>
        <span>Acil Durum Bilgileri</span>
        <ChevronRight />
      </GlassCard>

      <GlassCard className="profile-safety">
        <ShieldCheck size={18} />
        <span>Üyelik kartı, profil ve acil bilgiler kurucu onaylı demo kayıtla eşleşiyor.</span>
      </GlassCard>

      {activePanel && (
        <Modal title={panelTitle} onClose={() => setActivePanel(null)}>
          {activePanel === 'account' && (
            <form className="modal-form" onSubmit={saveProfile}>
              <Field label="Ad Soyad" value={form.name} onChange={(value) => updateForm('name', value)} />
              <Field label="E-posta" value={form.email} onChange={(value) => updateForm('email', value)} />
              <Field label="Telefon" value={form.phone} onChange={(value) => updateForm('phone', value)} />
              <Field label="Şehir" value={form.city} onChange={(value) => updateForm('city', value)} />
              <Field label="Motosiklet" value={form.bike} onChange={(value) => updateForm('bike', value)} />
              <button type="submit" className="primary-btn">
                Bilgileri Kaydet
              </button>
            </form>
          )}

          {activePanel === 'notifications' && (
            <div className="settings-list compact">
              <ToggleRow
                title="Etkinlik bildirimleri"
                desc="Yeni rota ve katılım güncellemeleri"
                checked={notifications.events}
                onClick={() => toggleNotification('events')}
              />
              <ToggleRow
                title="Duyuru bildirimleri"
                desc="Kurucu ve yönetim duyuruları"
                checked={notifications.announcements}
                onClick={() => toggleNotification('announcements')}
              />
              <ToggleRow
                title="Sohbet bildirimleri"
                desc="Ekip sohbeti uyarıları"
                checked={notifications.chat}
                onClick={() => toggleNotification('chat')}
              />
            </div>
          )}

          {activePanel === 'emergency' && (
            <form className="modal-form" onSubmit={saveProfile}>
              <Field label="Kan grubu" value={form.blood} onChange={(value) => updateForm('blood', value)} />
              <Field
                label="Acil kişi"
                value={form.emergencyName}
                onChange={(value) => updateForm('emergencyName', value)}
              />
              <Field
                label="Acil telefon"
                value={form.emergencyPhone}
                onChange={(value) => updateForm('emergencyPhone', value)}
              />
              <button type="submit" className="primary-btn">
                Acil Bilgileri Kaydet
              </button>
            </form>
          )}
        </Modal>
      )}
    </section>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function ToggleRow({ title, desc, checked, onClick }) {
  return (
    <GlassCard as="button" type="button" className="setting-row" onClick={onClick}>
      <ShieldCheck size={18} />
      <div>
        <b>{title}</b>
        <span>{desc}</span>
      </div>
      <span className={`toggle ${checked ? 'on' : ''}`} aria-hidden="true" />
    </GlassCard>
  )
}
