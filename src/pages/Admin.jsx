import { useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  Bug,
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Megaphone,
  Shield,
  ShieldAlert,
  Undo2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useAppData } from '../context/AppContext'

const modules = [
  { key: 'members', icon: Users, title: 'Üye Yönetimi', desc: 'Başvuru, onay, uyarı ve ban sistemi.' },
  { key: 'events', icon: CalendarDays, title: 'Etkinlik Yönetimi', desc: 'Kurucu rotası oluştur ve listeyi yönet.' },
  { key: 'announcements', icon: Megaphone, title: 'Duyuru Yönetimi', desc: 'Üyelere duyuru yayınla.' },
  { key: 'gallery', icon: ImageIcon, title: 'Galeri Yönetimi', desc: 'Fotoğraf ekle ve medya arşivini yönet.' },
  { key: 'badges', icon: Shield, title: 'Rozet Yönetimi', desc: 'Yetki ve rozetleri düzenle.' },
  { key: 'reports', icon: BarChart3, title: 'Raporlar', desc: 'Katılım ve disiplin özetlerini gör.' },
]

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function Admin() {
  const app = useAppData()
  const [activeModule, setActiveModule] = useState(null)

  if (activeModule) {
    return <AdminModule module={activeModule} app={app} onBack={() => setActiveModule(null)} />
  }

  return (
    <section className="screen page">
      <div className="titlebar left">
        <Shield />
        <h1>Kurucu Paneli</h1>
      </div>

      <GlassCard className="founder-card">
        <span className="eyebrow">68 RIDERS KURUCU ERİŞİMİ</span>
        <h2>{app.currentUser.name}</h2>
        <p>Üyelik, başvuru, disiplin, etkinlik ve medya yönetimi tek panelden kontrol edilir.</p>
      </GlassCard>

      <div className="admin-stats">
        {app.adminStats.map(([label, value]) => (
          <GlassCard key={label}>
            <b>{value}</b>
            <span>{label}</span>
          </GlassCard>
        ))}
      </div>

      <div className="admin-grid">
        {modules.map((module) => (
          <GlassCard
            as="button"
            type="button"
            className="admin-card"
            key={module.key}
            onClick={() => setActiveModule(module)}
          >
            <module.icon />
            <div>
              <h3>{module.title}</h3>
              <p>{module.desc}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="approval">
        <UserPlus />
        <div>
          <b>{app.pendingMembers.length} yeni başvuru onay bekliyor</b>
          <span>Onaylanmayan kullanıcı içerideki üye alanlarını görmemeli.</span>
        </div>
        <button type="button" onClick={() => setActiveModule(modules[0])}>
          <CheckCircle2 size={16} /> İncele
        </button>
      </GlassCard>
    </section>
  )
}

function AdminModule({ module, app, onBack }) {
  return (
    <section className="screen page">
      <div className="titlebar left">
        <button className="icon-btn" type="button" onClick={onBack} aria-label="Yönetim paneline dön">
          <ArrowLeft />
        </button>
        <h1>{module.title}</h1>
      </div>

      {module.key === 'members' && <MemberManagement app={app} />}
      {module.key === 'events' && <EventManagement app={app} />}
      {module.key === 'announcements' && <AnnouncementManagement app={app} />}
      {module.key === 'gallery' && <GalleryManagement app={app} />}
      {module.key === 'badges' && <BadgeManagement app={app} />}
      {module.key === 'reports' && <ReportManagement app={app} />}
    </section>
  )
}

function MemberManagement({ app }) {
  const [memberForm, setMemberForm] = useState({
    name: 'Yeni Başvuru',
    email: 'basvuru@example.com',
    phone: '+90 532 000 6800',
    bike: 'CFMOTO 450 SR',
  })

  const update = (key, value) => setMemberForm((current) => ({ ...current, [key]: value }))

  const submitApplication = (event) => {
    event.preventDefault()
    app.addMember(memberForm, 'pending')
  }

  return (
    <>
      <GlassCard className="policy-card">
        <ShieldAlert />
        <div>
          <b>Üyelik Politikası</b>
          <span>Başvuran kişi önce beklemeye düşer. Kurucu onaylarsa aktif üye olur. 3 uyarı alan üye otomatik atılır.</span>
        </div>
      </GlassCard>

      <AdminForm title="Demo Başvuru Oluştur" onSubmit={submitApplication}>
        <Field label="Ad Soyad" value={memberForm.name} onChange={(value) => update('name', value)} />
        <Field label="E-posta" value={memberForm.email} onChange={(value) => update('email', value)} />
        <Field label="Telefon" value={memberForm.phone} onChange={(value) => update('phone', value)} />
        <Field label="Motosiklet" value={memberForm.bike} onChange={(value) => update('bike', value)} />
      </AdminForm>

      <h2>Bekleyen Başvurular</h2>
      <div className="admin-list">
        {app.pendingMembers.map((member) => (
          <MemberRow key={member.id} member={member}>
            <button type="button" onClick={() => app.approveMember(member.id)}>
              <UserCheck size={15} /> Onayla
            </button>
            <button type="button" className="ghost-danger" onClick={() => app.rejectMember(member.id)}>
              <UserX size={15} /> Reddet
            </button>
          </MemberRow>
        ))}
        {!app.pendingMembers.length && <GlassCard className="admin-list-item">Bekleyen başvuru yok.</GlassCard>}
      </div>

      <h2>Aktif Üyeler</h2>
      <div className="admin-list">
        {app.activeMembers.map((member) => (
          <MemberRow key={member.id} member={member}>
            <button type="button" onClick={() => app.warnMember(member.id)}>
              <ShieldAlert size={15} /> Uyar
            </button>
            <button type="button" className="ghost-danger" onClick={() => app.banMember(member.id)}>
              <UserX size={15} /> Banla
            </button>
          </MemberRow>
        ))}
      </div>

      <h2>Banlı / Atılan</h2>
      <div className="admin-list">
        {app.blockedMembers.map((member) => (
          <MemberRow key={member.id} member={member}>
            <button type="button" onClick={() => app.restoreMember(member.id)}>
              <Undo2 size={15} /> Geri Al
            </button>
          </MemberRow>
        ))}
        {!app.blockedMembers.length && <GlassCard className="admin-list-item">Banlı veya atılan üye yok.</GlassCard>}
      </div>
    </>
  )
}

function EventManagement({ app }) {
  const [eventForm, setEventForm] = useState({
    title: 'Pazar Kısa Rota',
    date: '7 Haziran 2026',
    time: '10:30',
    place: 'Aksaray - Helvadere',
    distance: '64 km',
    details: 'Kurucu panelinden oluşturulan rota.',
  })

  const update = (key, value) => setEventForm((current) => ({ ...current, [key]: value }))

  const submitEvent = (event) => {
    event.preventDefault()
    app.addEvent(eventForm)
  }

  return (
    <>
      <AdminForm title="Yeni Etkinlik" onSubmit={submitEvent}>
        <Field label="Başlık" value={eventForm.title} onChange={(value) => update('title', value)} />
        <Field label="Tarih" value={eventForm.date} onChange={(value) => update('date', value)} />
        <Field label="Saat" value={eventForm.time} onChange={(value) => update('time', value)} />
        <Field label="Konum" value={eventForm.place} onChange={(value) => update('place', value)} />
        <Field label="Mesafe" value={eventForm.distance} onChange={(value) => update('distance', value)} />
        <TextArea label="Detay" value={eventForm.details} onChange={(value) => update('details', value)} />
      </AdminForm>
      <AdminList items={app.events} render={(event) => `${event.title} · ${event.date} · +${event.people}`} />
    </>
  )
}

function AnnouncementManagement({ app }) {
  const [announcementForm, setAnnouncementForm] = useState({
    title: 'Yeni Toplantı Notu',
    body: 'Bu hafta yönetim toplantısı garajda yapılacaktır.',
    type: 'event',
  })

  const update = (key, value) => setAnnouncementForm((current) => ({ ...current, [key]: value }))

  const submitAnnouncement = (event) => {
    event.preventDefault()
    app.addAnnouncement(announcementForm)
  }

  return (
    <>
      <AdminForm title="Yeni Duyuru" onSubmit={submitAnnouncement}>
        <Field label="Başlık" value={announcementForm.title} onChange={(value) => update('title', value)} />
        <TextArea label="Metin" value={announcementForm.body} onChange={(value) => update('body', value)} />
        <SelectField
          label="Tür"
          value={announcementForm.type}
          options={[
            ['event', 'Etkinlik'],
            ['urgent', 'Önemli'],
            ['rules', 'Kurallar'],
            ['service', 'Bakım'],
          ]}
          onChange={(value) => update('type', value)}
        />
      </AdminForm>
      <AdminList items={app.announcements} render={(announcement) => `${announcement.title} · ${announcement.time}`} />
    </>
  )
}

function GalleryManagement({ app }) {
  const [galleryForm, setGalleryForm] = useState({ title: 'Yeni medya', type: 'photo', image: 'ride', src: '' })

  const update = (key, value) => setGalleryForm((current) => ({ ...current, [key]: value }))

  const submitGallery = (event) => {
    event.preventDefault()
    app.addGalleryItem(galleryForm)
  }

  const chooseFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      app.notify('Galeri için fotoğraf dosyası seç.', 'warning')
      return
    }
    update('src', await readFileAsDataUrl(file))
    update('title', galleryForm.title || file.name.replace(/\.[^.]+$/, ''))
    event.target.value = ''
  }

  return (
    <>
      <AdminForm title="Yeni Medya" onSubmit={submitGallery}>
        <Field label="Başlık" value={galleryForm.title} onChange={(value) => update('title', value)} />
        <SelectField
          label="Tür"
          value={galleryForm.type}
          options={[
            ['photo', 'Fotoğraf'],
            ['video', 'Video'],
          ]}
          onChange={(value) => update('type', value)}
        />
        <SelectField
          label="Demo Görsel"
          value={galleryForm.image}
          options={[
            ['ride', 'Konvoy'],
            ['night', 'Gece'],
            ['mountain', 'Dağ'],
          ]}
          onChange={(value) => update('image', value)}
        />
        <label className="field">
          <span>Fotoğraf Dosyası</span>
          <input type="file" accept="image/*" onChange={chooseFile} />
        </label>
        {galleryForm.src && <img className="admin-preview" src={galleryForm.src} alt="Seçilen medya" />}
      </AdminForm>
      <AdminList items={app.gallery} render={(item) => `${item.title} · ${item.type}`} />
    </>
  )
}

function BadgeManagement({ app }) {
  const [badgeForm, setBadgeForm] = useState({
    title: 'Güvenli Sürüş',
    description: 'Sürüş kurallarına düzenli uyum',
  })

  const update = (key, value) => setBadgeForm((current) => ({ ...current, [key]: value }))

  const submitBadge = (event) => {
    event.preventDefault()
    app.addBadge(badgeForm)
  }

  return (
    <>
      <AdminForm title="Yeni Rozet" onSubmit={submitBadge}>
        <Field label="Başlık" value={badgeForm.title} onChange={(value) => update('title', value)} />
        <TextArea label="Açıklama" value={badgeForm.description} onChange={(value) => update('description', value)} />
      </AdminForm>
      <AdminList items={app.badges} render={(badge) => `${badge.title} · ${badge.description}`} />
    </>
  )
}

function ReportManagement({ app }) {
  const severityLabels = {
    low: 'Küçük',
    medium: 'Normal',
    high: 'Önemli',
    critical: 'Kritik',
  }

  return (
    <>
      <GlassCard className="report-card">
        <BarChart3 />
        <b>Kurucu Özeti</b>
        <p>
          {app.activeMembers.length} aktif üye, {app.pendingMembers.length} bekleyen başvuru,{' '}
          {app.blockedMembers.length} banlı/atılan kayıt ve {app.events.length} aktif etkinlik var.
        </p>
      </GlassCard>
      <GlassCard className="policy-card">
        <ShieldAlert />
        <div>
          <b>Disiplin Otomasyonu</b>
          <span>Demo kural: Her uyarı üyeye işlenir. 3. uyarıda statü otomatik “Atıldı” olur.</span>
        </div>
      </GlassCard>

      <h2>Hata Bildirimleri</h2>
      <div className="admin-list">
        {app.feedbackReports.slice(0, 10).map((report) => (
          <GlassCard className="feedback-row" key={report.id}>
            <div className="feedback-row-head">
              <b>
                <Bug size={15} /> {report.title}
              </b>
              <span className={`severity-pill ${report.severity}`}>
                {severityLabels[report.severity] || report.severity}
              </span>
            </div>
            <p>{report.description}</p>
            <small>
              {report.pagePath} · {report.reporterName} · {report.createdAt}
            </small>
            <div className="row-actions">
              {report.status === 'resolved' ? (
                <span className="status-line resolved">
                  <CheckCircle2 size={14} /> Çözüldü
                </span>
              ) : (
                <button type="button" onClick={() => app.resolveFeedbackReport(report.id)}>
                  <CheckCircle2 size={15} /> Çözüldü
                </button>
              )}
            </div>
          </GlassCard>
        ))}
        {!app.feedbackReports.length && <GlassCard className="admin-list-item">Henüz hata bildirimi yok.</GlassCard>}
      </div>

      <h2>Son Aktiviteler</h2>
      <AdminList items={app.activity} render={(item) => item} />
    </>
  )
}

function MemberRow({ member, children }) {
  return (
    <GlassCard className="member-row">
      <div>
        <b>{member.name}</b>
        <span>
          #{member.id} · {member.role} · {member.bike}
        </span>
        <small>
          {member.email} · Uyarı {member.warnings || 0}/3
        </small>
      </div>
      <StatusPill status={member.status} />
      <div className="row-actions">{children}</div>
    </GlassCard>
  )
}

function StatusPill({ status }) {
  const label =
    {
      active: 'Aktif',
      pending: 'Onay Bekliyor',
      banned: 'Banlı',
      removed: 'Atıldı',
      rejected: 'Reddedildi',
    }[status] || status

  return <span className={`status-pill ${status}`}>{label}</span>
}

function AdminForm({ title, onSubmit, children }) {
  return (
    <form className="admin-form glass" onSubmit={onSubmit}>
      <h2>{title}</h2>
      {children}
      <button type="submit" className="primary-btn">
        Kaydet
      </button>
    </form>
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

function TextArea({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([key, text]) => (
          <option value={key} key={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

function AdminList({ items, render }) {
  return (
    <div className="admin-list">
      {items.slice(0, 8).map((item) => (
        <GlassCard className="admin-list-item" key={item.id || item}>
          {render(item)}
        </GlassCard>
      ))}
    </div>
  )
}
