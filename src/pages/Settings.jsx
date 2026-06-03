import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Bug, Moon, Smartphone, Wifi } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppContext'
import { registerPushSubscription } from '../lib/push'

const initialSettings = {
  push: true,
  rideAlerts: true,
  chat: false,
  offline: true,
}

export default function Settings() {
  const { notify } = useAppData()
  const auth = useAuth()
  const [settings, setSettings] = useState(initialSettings)

  const toggle = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
    notify('Ayar güncellendi.')
  }

  const enablePush = async () => {
    const result = await registerPushSubscription(auth.profile?.id)
    notify(result.message, result.ok ? 'success' : 'warning')
  }

  return (
    <section className="screen page">
      <div className="titlebar left">
        <Link to="/profile" aria-label="Profile dön">
          <ArrowLeft />
        </Link>
        <h1>Ayarlar</h1>
      </div>

      <div className="settings-list">
        <GlassCard className="setting-row" as={Link} to="/feedback" state={{ from: '/settings' }}>
          <Bug size={20} />
          <div>
            <b>Hata bildir</b>
            <span>Ekip testlerinde gördüğün sorunu kurucuya ilet</span>
          </div>
        </GlassCard>
        <SettingRow
          icon={Bell}
          title="Push bildirimleri"
          desc="Etkinlik ve duyuru uyarıları"
          checked={settings.push}
          onToggle={enablePush}
        />
        <SettingRow
          icon={Smartphone}
          title="Sürüş hatırlatmaları"
          desc="Buluşma saatinden önce bildirim"
          checked={settings.rideAlerts}
          onToggle={() => toggle('rideAlerts')}
        />
        <SettingRow
          icon={Moon}
          title="Sohbet sessiz modu"
          desc="Gece bildirimlerini sessize al"
          checked={settings.chat}
          onToggle={() => toggle('chat')}
        />
        <SettingRow
          icon={Wifi}
          title="Offline PWA modu"
          desc="Ana ekran ve önbellek uyumu"
          checked={settings.offline}
          onToggle={() => toggle('offline')}
        />
      </div>

      <GlassCard className="settings-note">
        68 Riders PWA Android ve iOS ana ekran kullanımına hazır demo yapıdadır.
      </GlassCard>
    </section>
  )
}

function SettingRow({ icon: Icon, title, desc, checked, onToggle }) {
  return (
    <GlassCard className="setting-row" as="button" type="button" onClick={onToggle}>
      <Icon size={20} />
      <div>
        <b>{title}</b>
        <span>{desc}</span>
      </div>
      <span className={`toggle ${checked ? 'on' : ''}`} aria-hidden="true" />
    </GlassCard>
  )
}
