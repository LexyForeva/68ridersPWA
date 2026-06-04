import { useEffect, useState } from 'react'
import { Download, RefreshCw, X, Share, Plus } from 'lucide-react'

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true ||
  document.referrer.includes('android-app://')

const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

const isInStandaloneMode = () => isStandalone()

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [updateReady, setUpdateReady] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('pwa-install-dismissed') === 'true'
    } catch (error) {
      // Ignore storage errors
      console.warn('Failed to read dismiss state:', error)
      return false
    }
  })
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    // Check if we should show iOS prompt
    if (isIOS() && !isInStandaloneMode() && !dismissed) {
      setShowIOSPrompt(true)
    }

    const handleBeforeInstall = event => {
      event.preventDefault()
      if (!isStandalone()) setInstallPrompt(event)
    }

    const handleInstalled = () => {
      setInstallPrompt(null)
      setDismissed(true)
      try {
        localStorage.setItem('pwa-install-dismissed', 'true')
      } catch (error) {
        // Ignore storage errors
        console.warn('Failed to save install state:', error)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
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
  }, [dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setShowIOSPrompt(false)
    try {
      localStorage.setItem('pwa-install-dismissed', 'true')
    } catch (error) {
      // Ignore storage errors
      console.warn('Failed to save dismiss state:', error)
    }
  }

  if (dismissed || isInStandaloneMode()) return null
  if (!installPrompt && !updateReady && !showIOSPrompt) return null

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

  // iOS-specific install prompt
  if (showIOSPrompt) {
    return (
      <div className="pwa-banner ios-install-prompt">
        <Download size={18} />
        <div className="ios-instructions">
          <b>68 Riders ana ekranına ekle</b>
          <span className="ios-steps">
            1. Safari'de alttaki <Share size={14} className="inline-icon" /> (Paylaş) butonuna bas
            <br />
            2. Aşağı kaydır ve <Plus size={14} className="inline-icon" /> "Ana Ekrana Ekle" seç
            <br />
            3. Sağ üstteki "Ekle" butonuna bas
          </span>
        </div>
        <button type="button" className="banner-close" onClick={handleDismiss} aria-label="Kapat">
          <X size={15} />
        </button>
      </div>
    )
  }

  // Standard install prompt (Android/Desktop)
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
      <button type="button" className="banner-close" onClick={handleDismiss} aria-label="Kapat">
        <X size={15} />
      </button>
    </div>
  )
}
