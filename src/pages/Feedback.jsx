import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Bug, CheckCircle2, Send } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useAppData } from '../context/AppContext'

const severityOptions = [
  ['low', 'Küçük'],
  ['medium', 'Normal'],
  ['high', 'Önemli'],
  ['critical', 'Kritik'],
]

const severityLabels = Object.fromEntries(severityOptions)

export default function Feedback() {
  const app = useAppData()
  const location = useLocation()
  const defaultPath = location.state?.from || '/'
  const [form, setForm] = useState({
    title: '',
    pagePath: defaultPath,
    severity: 'medium',
    description: '',
  })

  const openReports = useMemo(
    () => app.feedbackReports.filter((report) => report.status !== 'resolved'),
    [app.feedbackReports],
  )

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    const report = await app.submitFeedbackReport({
      ...form,
      deviceInfo: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    })
    if (report) setForm((current) => ({ ...current, title: '', description: '' }))
  }

  return (
    <section className="screen page">
      <div className="titlebar left">
        <Link to="/" aria-label="Ana sayfaya dön">
          <ArrowLeft />
        </Link>
        <h1>Hata Bildir</h1>
      </div>

      <GlassCard className="feedback-summary">
        <Bug />
        <div>
          <span className="eyebrow">EKİP TEST MERKEZİ</span>
          <h2>{openReports.length} açık bildirim</h2>
          <p>Üyelerin gördüğü sorunlar kurucu panelindeki raporlara düşer.</p>
        </div>
      </GlassCard>

      <form className="admin-form glass" onSubmit={submit}>
        <h2>Yeni Bildirim</h2>
        <label className="field">
          <span>Başlık</span>
          <input
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="Örn. Galeri fotoğrafı açılmıyor"
            required
          />
        </label>
        <label className="field">
          <span>Sayfa</span>
          <input value={form.pagePath} onChange={(event) => update('pagePath', event.target.value)} required />
        </label>
        <label className="field">
          <span>Önem</span>
          <select value={form.severity} onChange={(event) => update('severity', event.target.value)}>
            {severityOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Açıklama</span>
          <textarea
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="Ne yaptın, ne bekledin, ne oldu?"
            required
          />
        </label>
        <button type="submit" className="primary-btn">
          <Send size={17} />
          Bildirimi Gönder
        </button>
      </form>

      <div className="section-head">
        <h2>Son Bildirimler</h2>
      </div>
      <div className="admin-list">
        {app.feedbackReports.slice(0, 8).map((report) => (
          <GlassCard className="feedback-row" key={report.id}>
            <div className="feedback-row-head">
              <b>{report.title}</b>
              <span className={`severity-pill ${report.severity}`}>{severityLabels[report.severity] || report.severity}</span>
            </div>
            <p>{report.description}</p>
            <small>
              {report.pagePath} · {report.reporterName} · {report.createdAt}
            </small>
            <span className={`status-line ${report.status}`}>
              {report.status === 'resolved' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              {report.status === 'resolved' ? 'Çözüldü' : 'Açık'}
            </span>
          </GlassCard>
        ))}
        {!app.feedbackReports.length && <GlassCard className="admin-list-item">Henüz hata bildirimi yok.</GlassCard>}
      </div>
    </section>
  )
}
