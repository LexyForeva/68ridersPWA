import { supabase } from './supabase'

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export async function registerPushSubscription(profileId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, message: 'Bu tarayıcı push bildirim desteklemiyor.' }
  }

  if (!vapidPublicKey) {
    return { ok: false, message: 'VAPID public key henüz tanımlı değil.' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, message: 'Bildirim izni verilmedi.' }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })

  if (supabase && profileId) {
    await supabase.from('push_subscriptions').upsert({
      profile_id: profileId,
      endpoint: subscription.endpoint,
      subscription: subscription.toJSON(),
    })
  }

  return { ok: true, message: 'Push bildirimi aktif edildi.' }
}
