import { useEffect, useState } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [updateReady, setUpdateReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault()
      if (!isStandalone()) setInstallPrompt(event)
    }

    const handleInstalled = () => {
      setInstallPrompt(null)
      setDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) setUpdateReady(true)

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true)
          })
        })
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (dismissed || (!installPrompt && !updateReady)) return null

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  const reloadForUpdate = async () => {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js')
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  return (
    <div className="pwa-banner">
      {updateReady ? <RefreshCw size={18} /> : <Download size={18} />}
      <div>
        <b>{updateReady ? 'Yeni sürüm hazır' : '68 Riders cihazına eklensin'}</b>
        <span>{updateReady ? 'Güncel sürümü yüklemek için yenile.' : 'Ana ekrandan uygulama gibi açabilirsin.'}</span>
      </div>
      <button type="button" onClick={updateReady ? reloadForUpdate : install}>
        {updateReady ? 'Yenile' : 'Ekle'}
      </button>
      <button type="button" className="banner-close" onClick={() => setDismissed(true)} aria-label="Kapat">
        <X size={15} />
      </button>
    </div>
  )
}
