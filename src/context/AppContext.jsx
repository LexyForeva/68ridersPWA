import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { isSupabaseConfigured, supabase, publicUrl } from '../lib/supabase'
import {
  activity as seedActivity,
  announcements as seedAnnouncements,
  badges as seedBadges,
  events as seedEvents,
  gallery as seedGallery,
  members as seedMembers,
  messages as seedMessages,
  user as seedUser,
} from '../data/mockData'

const AppContext = createContext(null)

const copyList = (list) => list.map((item) => ({ ...item }))

const readStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeStored = (key, value) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Large uploaded demo images may exceed localStorage in some browsers.
  }
}

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl)
  return response.blob()
}

const inferRoleKey = (role, fallback = 'member') => {
  const value = String(role || '').toLocaleLowerCase('tr-TR')
  if (['founder', 'admin', 'moderator', 'member'].includes(value)) return value
  if (value.includes('kurucu')) return 'founder'
  if (value.includes('yönetim') || value.includes('yonetim') || value.includes('admin')) return 'admin'
  if (value.includes('moderat')) return 'moderator'
  return fallback
}

const roleLabelFromKey = (role) =>
  ({
    founder: 'Kurucu Üye',
    admin: 'Yönetim',
    moderator: 'Moderatör',
    member: 'Üye',
  }[role] || 'Üye')

const profileToUser = (profile, fallback) => ({
  ...fallback,
  id: profile.member_no || fallback.id,
  name: profile.full_name || fallback.name,
  role:
    {
      founder: 'Kurucu Üye',
      admin: 'Yönetim',
      moderator: 'Moderatör',
      member: 'Üye',
    }[profile.role] || fallback.role,
  blood: profile.blood || fallback.blood,
  bike: profile.bike || fallback.bike,
  phone: profile.phone || fallback.phone,
  email: profile.email || fallback.email,
  city: profile.city || fallback.city,
  emergencyName: profile.emergency_name || fallback.emergencyName,
  emergencyPhone: profile.emergency_phone || fallback.emergencyPhone,
  photoUrl: profile.avatar_url || fallback.photoUrl,
})

const eventFromDb = (event) => ({
  id: event.id,
  title: event.title,
  date: event.event_date || 'Tarih yok',
  time: event.event_time || '10:00',
  place: event.location || '68 Riders Garaj',
  people: event.attendees_count || 0,
  image: event.image_type || 'ride',
  status: event.status_text || 'Katılım açık',
  distance: event.distance || 'Demo rota',
  pace: event.pace || 'Orta tempo',
  meetingPoint: event.meeting_point || event.location || '68 Riders Garaj',
  details: event.details || '',
})

const galleryFromDb = (item) => ({
  id: item.id,
  title: item.title,
  type: item.media_type || 'photo',
  image: item.image_type || 'ride',
  src: item.file_path ? publicUrl(item.bucket || 'gallery', item.file_path) : item.public_url || '',
  views: item.views || 0,
  status: item.status || 'approved',
  uploadedBy: item.uploaded_by_name || '',
})

const moderationFromDb = (action) => ({
  id: action.id,
  targetProfileId: action.target_profile_id,
  actionType: action.action_type,
  reason: action.reason || 'Sebep girilmedi.',
  createdBy: action.created_by,
  createdAt: action.created_at ? new Date(action.created_at).toLocaleString('tr-TR') : 'az önce',
})

const feedbackFromDb = (report) => ({
  id: report.id,
  title: report.title,
  description: report.description,
  severity: report.severity || 'medium',
  pagePath: report.page_path || '/',
  status: report.status || 'open',
  reporterName: report.reporter_name || 'Üye',
  deviceInfo: report.device_info || '',
  createdAt: report.created_at ? new Date(report.created_at).toLocaleString('tr-TR') : 'az önce',
})

const profileFromDb = (member) =>
  normalizeMember({
    id: member.member_no || member.id,
    profileId: member.id,
    name: member.full_name || member.email,
    rawRole: member.role || 'member',
    role:
      {
        founder: 'Kurucu Üye',
        admin: 'Yönetim',
        moderator: 'Moderatör',
        member: 'Üye',
      }[member.role] || 'Üye',
    bike: member.bike || 'Motosiklet bilgisi yok',
    email: member.email,
    phone: member.phone || '+90 5XX XXX XX XX',
    appliedAt: member.created_at ? new Date(member.created_at).toLocaleDateString('tr-TR') : 'Demo kayıt',
    warnings: member.warnings || 0,
    status: member.status || 'pending',
  })

const applicationFromDb = (application) =>
  normalizeMember({
    id: application.id,
    applicationId: application.id,
    profileId: application.user_id || null,
    name: application.full_name,
    role: 'Üye Adayı',
    bike: application.bike || 'Motosiklet bilgisi yok',
    email: application.email,
    phone: application.phone || '+90 5XX XXX XX XX',
    appliedAt: application.created_at ? new Date(application.created_at).toLocaleDateString('tr-TR') : 'az önce',
    warnings: 0,
    status: application.status === 'pending' ? 'pending' : application.status === 'approved' ? 'active' : 'rejected',
  })

const normalizeMember = (member) => {
  const normalized = {
    email: `${String(member.name).toLowerCase().replaceAll(' ', '.')}@demo.68riders.com.tr`,
    phone: '+90 5XX XXX XX XX',
    appliedAt: 'Demo kayıt',
    warnings: 0,
    status: 'active',
    rawRole: inferRoleKey(member.rawRole || member.role),
    ...member,
  }

  return {
    ...normalized,
    status:
      {
        Aktif: 'active',
        Beklemede: 'pending',
        Banlı: 'banned',
        Atıldı: 'removed',
      }[normalized.status] || normalized.status,
  }
}

export function AppProvider({ children }) {
  const auth = useAuth()
  const [currentUser, setCurrentUser] = useState(() => readStored('68riders:user', seedUser))
  const [events, setEvents] = useState(() => readStored('68riders:events', copyList(seedEvents)))
  const [announcements, setAnnouncements] = useState(() =>
    readStored('68riders:announcements', copyList(seedAnnouncements)),
  )
  const [gallery, setGallery] = useState(() => readStored('68riders:gallery', copyList(seedGallery)))
  const [messages, setMessages] = useState(() => copyList(seedMessages))
  const [feedbackReports, setFeedbackReports] = useState(() => readStored('68riders:feedbackReports', []))
  const [moderationActions, setModerationActions] = useState(() => readStored('68riders:moderationActions', []))
  const [members, setMembers] = useState(() =>
    readStored('68riders:members', [
      ...seedMembers.map(normalizeMember),
      {
        id: 68131,
        name: 'Can Demir',
        role: 'Üye Adayı',
        bike: 'KTM Duke 390',
        email: 'can.demir@example.com',
        phone: '+90 532 000 6831',
        appliedAt: 'bugün',
        warnings: 0,
        status: 'pending',
      },
      {
        id: 68132,
        name: 'Ece Karaca',
        role: 'Üye Adayı',
        bike: 'Honda CBR500R',
        email: 'ece.karaca@example.com',
        phone: '+90 532 000 6832',
        appliedAt: 'dün',
        warnings: 0,
        status: 'pending',
      },
    ]).map(normalizeMember),
  )
  const [badges, setBadges] = useState(() => copyList(seedBadges))
  const [activity, setActivity] = useState(() => [...seedActivity])
  const [joinedIds, setJoinedIds] = useState(() => new Set())
  const [toast, setToast] = useState(null)
  const realBackend = isSupabaseConfigured && auth.isAuthenticated && auth.isActive

  useEffect(() => writeStored('68riders:user', currentUser), [currentUser])
  useEffect(() => writeStored('68riders:events', events), [events])
  useEffect(() => writeStored('68riders:announcements', announcements), [announcements])
  useEffect(() => writeStored('68riders:gallery', gallery), [gallery])
  useEffect(() => writeStored('68riders:feedbackReports', feedbackReports), [feedbackReports])
  useEffect(() => writeStored('68riders:moderationActions', moderationActions), [moderationActions])
  useEffect(() => writeStored('68riders:members', members), [members])

  useEffect(() => {
    if (auth.profile) setCurrentUser((user) => profileToUser(auth.profile, user))
  }, [auth.profile])

  useEffect(() => {
    if (!realBackend || !supabase) return undefined

    let alive = true

    const loadAll = async () => {
      const [
        eventsResult,
        announcementsResult,
        galleryResult,
        profilesResult,
        applicationsResult,
        attendeeResult,
        feedbackResult,
        moderationResult,
      ] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('membership_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('event_attendees').select('event_id').eq('profile_id', auth.user?.id),
        supabase.from('feedback_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('moderation_actions').select('*').order('created_at', { ascending: false }),
      ])

      if (!alive) return
      if (!eventsResult.error) setEvents((eventsResult.data || []).map(eventFromDb))
      if (!announcementsResult.error) setAnnouncements(announcementsResult.data || [])
      if (!galleryResult.error) {
        setGallery((galleryResult.data || []).filter((item) => item.status !== 'rejected').map(galleryFromDb))
      }
      if (!feedbackResult.error) setFeedbackReports((feedbackResult.data || []).map(feedbackFromDb))
      if (!moderationResult.error) setModerationActions((moderationResult.data || []).map(moderationFromDb))
      if (!profilesResult.error) {
        const dbMembers = (profilesResult.data || []).map(profileFromDb)
        const profileEmails = new Set(dbMembers.map((member) => String(member.email).toLowerCase()))
        const applications = applicationsResult.error
          ? []
          : (applicationsResult.data || [])
              .map(applicationFromDb)
              .filter((application) => application.status === 'pending' || !profileEmails.has(String(application.email).toLowerCase()))
        setMembers([...applications, ...dbMembers])
      }
      if (!attendeeResult.error) setJoinedIds(new Set((attendeeResult.data || []).map((item) => item.event_id)))
    }

    loadAll()

    const channel = supabase
      .channel('app-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'membership_applications' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_reports' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moderation_actions' }, loadAll)
      .subscribe()

    return () => {
      alive = false
      supabase.removeChannel(channel)
    }
  }, [auth.user?.id, realBackend])

  const notify = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type })
  }, [])

  const clearToast = useCallback(() => setToast(null), [])

  const addActivity = useCallback((message) => {
    setActivity((current) => [message, ...current].slice(0, 8))
  }, [])

  const updateUser = useCallback(
    async (data) => {
      setCurrentUser((user) => ({ ...user, ...data }))
      if (realBackend && supabase && auth.user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: data.name,
            email: data.email,
            phone: data.phone,
            city: data.city,
            bike: data.bike,
            blood: data.blood,
            emergency_name: data.emergencyName,
            emergency_phone: data.emergencyPhone,
          })
          .eq('id', auth.user.id)
        if (!error) auth.refreshProfile()
      }
      notify('Profil bilgileri güncellendi.')
      addActivity('Profil bilgileri güncellendi.')
    },
    [addActivity, auth, notify, realBackend],
  )

  const updateProfilePhoto = useCallback(
    async (photoUrl) => {
      setCurrentUser((user) => ({ ...user, photoUrl }))
      if (realBackend && supabase && auth.user?.id && photoUrl?.startsWith('data:')) {
        const blob = await dataUrlToBlob(photoUrl)
        const path = `${auth.user.id}/avatar-${Date.now()}.png`
        const { error } = await supabase.storage.from('avatars').upload(path, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: blob.type || 'image/png',
        })
        if (!error) {
          const avatarUrl = publicUrl('avatars', path)
          setCurrentUser((user) => ({ ...user, photoUrl: avatarUrl }))
          await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', auth.user.id)
          auth.refreshProfile()
        }
      }
      notify('Profil fotoğrafı güncellendi.')
    },
    [auth, notify, realBackend],
  )

  const isJoined = useCallback((eventId) => joinedIds.has(eventId), [joinedIds])

  const toggleJoin = useCallback(
    async (eventId) => {
      const id = eventId
      const alreadyJoined = joinedIds.has(id)
      const delta = alreadyJoined ? -1 : 1

      setJoinedIds((current) => {
        const next = new Set(current)
        if (alreadyJoined) next.delete(id)
        else next.add(id)
        return next
      })

      setEvents((current) =>
        current.map((event) =>
          event.id === id ? { ...event, people: Math.max(0, event.people + delta) } : event,
        ),
      )

      if (realBackend && supabase && auth.user?.id) {
        if (alreadyJoined) {
          await supabase.from('event_attendees').delete().eq('event_id', id).eq('profile_id', auth.user.id)
        } else {
          await supabase.from('event_attendees').insert({ event_id: id, profile_id: auth.user.id })
        }
        const nextEvent = events.find((event) => event.id === id)
        if (nextEvent) {
          await supabase
            .from('events')
            .update({ attendees_count: Math.max(0, Number(nextEvent.people || 0) + delta) })
            .eq('id', id)
        }
      }

      notify(alreadyJoined ? 'Katılım iptal edildi.' : 'Etkinliğe katıldın.')
      addActivity(alreadyJoined ? 'Bir etkinlik katılımı iptal edildi.' : 'Yeni bir etkinlik katılımı eklendi.')
    },
    [addActivity, auth.user?.id, events, joinedIds, notify, realBackend],
  )

  const addEvent = useCallback(
    async (data) => {
      const nextEvent = {
        id: Date.now(),
        title: data.title || 'Yeni Demo Etkinlik',
        date: data.date || 'Haziran 2026',
        time: data.time || '10:00',
        place: data.place || '68 Riders Garaj',
        people: Number(data.people || 0),
        image: data.image || 'ride',
        status: data.status || 'Katılım açık',
        distance: data.distance || 'Demo rota',
        pace: data.pace || 'Orta tempo',
        meetingPoint: data.meetingPoint || data.place || '68 Riders Garaj',
        details: data.details || 'Kurucu panelinden eklenen demo etkinlik.',
      }

      if (realBackend && supabase) {
        const { data: inserted, error } = await supabase
          .from('events')
          .insert({
            title: nextEvent.title,
            event_date: nextEvent.date,
            event_time: nextEvent.time,
            location: nextEvent.place,
            distance: nextEvent.distance,
            pace: nextEvent.pace,
            meeting_point: nextEvent.meetingPoint,
            details: nextEvent.details,
            status_text: nextEvent.status,
            image_type: nextEvent.image,
            attendees_count: nextEvent.people,
            created_by: auth.user?.id,
          })
          .select()
          .single()
        if (!error && inserted) nextEvent.id = inserted.id
      }

      setEvents((current) => [nextEvent, ...current])
      notify('Yeni etkinlik oluşturuldu.')
      addActivity(`${nextEvent.title} etkinliği oluşturuldu.`)
      return nextEvent
    },
    [addActivity, auth.user?.id, notify, realBackend],
  )

  const addAnnouncement = useCallback(
    async (data) => {
      const nextAnnouncement = {
        id: Date.now(),
        title: data.title || 'Yeni Demo Duyuru',
        body: data.body || 'Yönetim panelinden eklenen demo duyuru.',
        time: 'az önce',
        type: data.type || 'event',
      }

      if (realBackend && supabase) {
        const { data: inserted, error } = await supabase
          .from('announcements')
          .insert({
            title: nextAnnouncement.title,
            body: nextAnnouncement.body,
            type: nextAnnouncement.type,
            time: nextAnnouncement.time,
            created_by: auth.user?.id,
          })
          .select()
          .single()
        if (!error && inserted) nextAnnouncement.id = inserted.id
      }

      setAnnouncements((current) => [nextAnnouncement, ...current])
      notify('Yeni duyuru yayınlandı.')
      addActivity(`${nextAnnouncement.title} duyurusu yayınlandı.`)
    },
    [addActivity, auth.user?.id, notify, realBackend],
  )

  const addGalleryItem = useCallback(
    async (data) => {
      let filePath = ''
      let publicImageUrl = data.src || ''

      if (realBackend && supabase && data.src?.startsWith('data:')) {
        const blob = await dataUrlToBlob(data.src)
        filePath = `${auth.user?.id || 'member'}/${Date.now()}-${data.title || 'media'}.png`
        const { error } = await supabase.storage.from('gallery').upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type || 'image/png',
        })
        if (!error) publicImageUrl = publicUrl('gallery', filePath)
      }

      const nextItem = {
        id: Date.now(),
        title: data.title || 'Yeni medya',
        type: data.type || 'photo',
        image: data.image || 'ride',
        src: publicImageUrl,
        views: 0,
        status: 'approved',
        uploadedBy: currentUser.name,
      }

      if (realBackend && supabase) {
        const { data: inserted, error } = await supabase
          .from('gallery_items')
          .insert({
            title: nextItem.title,
            media_type: nextItem.type,
            image_type: nextItem.image,
            bucket: filePath ? 'gallery' : null,
            file_path: filePath || null,
            public_url: filePath ? null : nextItem.src,
            status: 'approved',
            uploaded_by: auth.user?.id,
            uploaded_by_name: currentUser.name,
          })
          .select()
          .single()
        if (!error && inserted) nextItem.id = inserted.id
      }

      setGallery((current) => [nextItem, ...current])
      notify('Galeri medyası eklendi.')
      addActivity(`${nextItem.title} galeriye eklendi.`)
    },
    [addActivity, auth.user?.id, currentUser.name, notify, realBackend],
  )

  const updateEvent = useCallback(
    async (eventId, data) => {
      const patch = {
        title: data.title || 'Etkinlik',
        date: data.date || 'Haziran 2026',
        time: data.time || '10:00',
        place: data.place || '68 Riders Garaj',
        distance: data.distance || 'Demo rota',
        details: data.details || '',
        status: data.status || 'Katılım açık',
        image: data.image || 'ride',
        pace: data.pace || 'Orta tempo',
        meetingPoint: data.meetingPoint || data.place || '68 Riders Garaj',
        people: Number(data.people || 0),
      }

      if (realBackend && supabase) {
        await supabase
          .from('events')
          .update({
            title: patch.title,
            event_date: patch.date,
            event_time: patch.time,
            location: patch.place,
            distance: patch.distance,
            details: patch.details,
            status_text: patch.status,
            image_type: patch.image,
            pace: patch.pace,
            meeting_point: patch.meetingPoint,
            attendees_count: patch.people,
          })
          .eq('id', eventId)
      }

      setEvents((current) => current.map((event) => (event.id === eventId ? { ...event, ...patch } : event)))
      notify('Etkinlik güncellendi.')
      addActivity(`${patch.title} etkinliği güncellendi.`)
    },
    [addActivity, notify, realBackend],
  )

  const deleteEvent = useCallback(
    async (eventId) => {
      const event = events.find((item) => item.id === eventId)
      if (realBackend && supabase) await supabase.from('events').delete().eq('id', eventId)
      setEvents((current) => current.filter((item) => item.id !== eventId))
      notify('Etkinlik silindi.')
      if (event) addActivity(`${event.title} etkinliği silindi.`)
    },
    [addActivity, events, notify, realBackend],
  )

  const updateAnnouncement = useCallback(
    async (announcementId, data) => {
      const patch = {
        title: data.title || 'Duyuru',
        body: data.body || '',
        type: data.type || 'event',
      }
      if (realBackend && supabase) {
        await supabase.from('announcements').update(patch).eq('id', announcementId)
      }
      setAnnouncements((current) =>
        current.map((announcement) => (announcement.id === announcementId ? { ...announcement, ...patch } : announcement)),
      )
      notify('Duyuru güncellendi.')
      addActivity(`${patch.title} duyurusu güncellendi.`)
    },
    [addActivity, notify, realBackend],
  )

  const deleteAnnouncement = useCallback(
    async (announcementId) => {
      const announcement = announcements.find((item) => item.id === announcementId)
      if (realBackend && supabase) await supabase.from('announcements').delete().eq('id', announcementId)
      setAnnouncements((current) => current.filter((item) => item.id !== announcementId))
      notify('Duyuru silindi.')
      if (announcement) addActivity(`${announcement.title} duyurusu silindi.`)
    },
    [addActivity, announcements, notify, realBackend],
  )

  const updateGalleryItem = useCallback(
    async (itemId, data) => {
      const patch = {
        title: data.title || 'Medya',
        type: data.type || 'photo',
        image: data.image || 'ride',
      }
      if (realBackend && supabase) {
        await supabase
          .from('gallery_items')
          .update({ title: patch.title, media_type: patch.type, image_type: patch.image })
          .eq('id', itemId)
      }
      setGallery((current) => current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
      notify('Galeri medyası güncellendi.')
      addActivity(`${patch.title} galeri medyası güncellendi.`)
    },
    [addActivity, notify, realBackend],
  )

  const deleteGalleryItem = useCallback(
    async (itemId) => {
      const item = gallery.find((entry) => entry.id === itemId)
      if (realBackend && supabase) await supabase.from('gallery_items').update({ status: 'rejected' }).eq('id', itemId)
      setGallery((current) => current.filter((entry) => entry.id !== itemId))
      notify('Galeri medyası arşivden kaldırıldı.')
      if (item) addActivity(`${item.title} galeri medyası kaldırıldı.`)
    },
    [addActivity, gallery, notify, realBackend],
  )

  const sendMessage = useCallback((text) => {
    const cleanText = text.trim()
    if (!cleanText) return
    setMessages((current) => [...current, { id: Date.now(), from: 'Sen', text: cleanText, me: true }])
  }, [])

  const submitFeedbackReport = useCallback(
    async (data) => {
      const nextReport = {
        id: Date.now(),
        title: data.title || 'Yeni hata bildirimi',
        description: data.description || 'Açıklama girilmedi.',
        severity: data.severity || 'medium',
        pagePath: data.pagePath || '/',
        status: 'open',
        reporterName: currentUser.name,
        deviceInfo: data.deviceInfo || '',
        createdAt: new Date().toLocaleString('tr-TR'),
      }

      if (realBackend && supabase) {
        const { data: inserted, error } = await supabase
          .from('feedback_reports')
          .insert({
            title: nextReport.title,
            description: nextReport.description,
            severity: nextReport.severity,
            page_path: nextReport.pagePath,
            status: 'open',
            reporter_id: auth.user?.id,
            reporter_name: currentUser.name,
            device_info: nextReport.deviceInfo,
          })
          .select()
          .single()

        if (error) {
          notify('Hata bildirimi kaydedilemedi. Supabase 003 SQL dosyasını çalıştırmak gerekiyor.', 'warning')
          return null
        }

        if (inserted) nextReport.id = inserted.id
      }

      setFeedbackReports((current) => [nextReport, ...current])
      notify('Hata bildirimi ekibe iletildi.')
      addActivity(`${currentUser.name} hata bildirimi gönderdi: ${nextReport.title}`)
      return nextReport
    },
    [addActivity, auth.user?.id, currentUser.name, notify, realBackend],
  )

  const resolveFeedbackReport = useCallback(
    async (reportId) => {
      if (realBackend && supabase) {
        await supabase
          .from('feedback_reports')
          .update({
            status: 'resolved',
            resolved_by: auth.user?.id,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', reportId)
      }

      setFeedbackReports((current) =>
        current.map((report) => (report.id === reportId ? { ...report, status: 'resolved' } : report)),
      )
      notify('Hata bildirimi çözüldü olarak işaretlendi.')
    },
    [auth.user?.id, notify, realBackend],
  )

  const addMember = useCallback(
    async (data, status = 'active') => {
      const nextMember = normalizeMember({
        id: Date.now(),
        name: data.name || 'Yeni Üye',
        role: data.role || (status === 'pending' ? 'Üye Adayı' : 'Üye'),
        bike: data.bike || 'Motosiklet bilgisi yok',
        email: data.email || 'yeni.uye@example.com',
        phone: data.phone || '+90 5XX XXX XX XX',
        appliedAt: 'az önce',
        warnings: 0,
        status,
      })

      if (realBackend && supabase && status === 'pending') {
        const { data: inserted, error } = await supabase
          .from('membership_applications')
          .upsert(
            {
              full_name: nextMember.name,
              email: nextMember.email,
              phone: nextMember.phone,
              bike: nextMember.bike,
              status: 'pending',
            },
            { onConflict: 'email' },
          )
          .select()
          .single()
        if (!error && inserted) {
          nextMember.id = inserted.id
          nextMember.applicationId = inserted.id
          nextMember.profileId = inserted.user_id || null
        }
      }

      setMembers((current) => [nextMember, ...current])
      notify(status === 'pending' ? 'Başvuru oluşturuldu.' : 'Demo üye eklendi.')
      addActivity(`${nextMember.name} ${status === 'pending' ? 'başvuru yaptı' : 'üye listesine eklendi'}.`)
    },
    [addActivity, notify, realBackend],
  )

  const addBadge = useCallback(
    (data) => {
      const nextBadge = {
        id: Date.now(),
        title: data.title || 'Yeni Rozet',
        description: data.description || 'Demo rozet açıklaması',
      }

      setBadges((current) => [nextBadge, ...current])
      notify('Demo rozet eklendi.')
    },
    [notify],
  )

  const pushModerationAction = useCallback((member, actionType, reason) => {
    if (!member) return
    setModerationActions((current) => [
      {
        id: Date.now(),
        targetProfileId: member.profileId || null,
        targetMemberId: member.id,
        memberName: member.name,
        actionType,
        reason: reason || 'Sebep girilmedi.',
        createdBy: auth.user?.id || 'local-admin',
        createdAt: new Date().toLocaleString('tr-TR'),
      },
      ...current,
    ])
  }, [auth.user?.id])

  const updateMemberStatus = useCallback(
    async (memberId, status, activityMessage, toastMessage, reason) => {
      const member = members.find((item) => item.id === memberId)
      const actionReason = reason || activityMessage
      if (realBackend && supabase && member?.profileId) {
        await supabase.from('profiles').update({ status }).eq('id', member.profileId)
        await supabase.from('moderation_actions').insert({
          target_profile_id: member.profileId,
          action_type: status,
          reason: actionReason,
          created_by: auth.user?.id,
        })
      }
      if (realBackend && supabase && member?.applicationId) {
        await supabase
          .from('membership_applications')
          .update({
            status: status === 'active' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
            reviewed_by: auth.user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', member.applicationId)
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === memberId
            ? {
                ...member,
                status,
                role: status === 'active' && member.role === 'Üye Adayı' ? 'Üye' : member.role,
              }
            : member,
        ),
      )
      notify(toastMessage)
      pushModerationAction(member, status, actionReason)
      addActivity(activityMessage)
    },
    [addActivity, auth.user?.id, members, notify, pushModerationAction, realBackend],
  )

  const approveMember = useCallback(
    (memberId) => {
      const member = members.find((item) => item.id === memberId)
      if (!member) return
      updateMemberStatus(memberId, 'active', `${member.name} üyeliğe onaylandı.`, 'Üye başvurusu onaylandı.')
    },
    [members, updateMemberStatus],
  )

  const rejectMember = useCallback(
    (memberId) => {
      const member = members.find((item) => item.id === memberId)
      if (!member) return
      updateMemberStatus(memberId, 'rejected', `${member.name} başvurusu reddedildi.`, 'Başvuru reddedildi.')
    },
    [members, updateMemberStatus],
  )

  const banMember = useCallback(
    (memberId) => {
      const member = members.find((item) => item.id === memberId)
      if (!member || String(member.id) === currentUser.id) {
        notify('Kurucu hesap banlanamaz.', 'warning')
        return
      }
      updateMemberStatus(memberId, 'banned', `${member.name} banlandı.`, 'Üye banlandı.')
    },
    [currentUser.id, members, notify, updateMemberStatus],
  )

  const warnMember = useCallback(
    async (memberId) => {
      const member = members.find((item) => item.id === memberId)
      if (!member || String(member.id) === currentUser.id) {
        notify('Kurucu hesaba uyarı verilemez.', 'warning')
        return
      }

      const nextWarnings = Number(member.warnings || 0) + 1
      const nextStatus = nextWarnings >= 3 ? 'removed' : member.status
      if (realBackend && supabase && member.profileId) {
        await supabase
          .from('profiles')
          .update({ warnings: nextWarnings, status: nextStatus })
          .eq('id', member.profileId)
        await supabase.from('moderation_actions').insert({
          target_profile_id: member.profileId,
          action_type: nextWarnings >= 3 ? 'auto_removed' : 'warning',
          reason: `${nextWarnings}. uyarı`,
          created_by: auth.user?.id,
        })
      }
      setMembers((current) =>
        current.map((item) =>
          item.id === memberId ? { ...item, warnings: nextWarnings, status: nextStatus } : item,
        ),
      )

      if (nextWarnings >= 3) {
        notify('3 uyarı tamamlandı, üye otomatik atıldı.')
        addActivity(`${member.name} 3 uyarı sonrası otomatik atıldı.`)
      } else {
        notify(`Uyarı verildi. Toplam uyarı: ${nextWarnings}/3`)
        addActivity(`${member.name} için ${nextWarnings}. uyarı verildi.`)
      }
    },
    [addActivity, auth.user?.id, currentUser.id, members, notify, realBackend],
  )

  const restoreMember = useCallback(
    async (memberId) => {
      const member = members.find((item) => item.id === memberId)
      if (!member) return
      if (realBackend && supabase && member.profileId) {
        await supabase.from('profiles').update({ status: 'active', warnings: 0 }).eq('id', member.profileId)
        await supabase.from('moderation_actions').insert({
          target_profile_id: member.profileId,
          action_type: 'restore',
          reason: 'Kurucu tarafından geri alındı',
          created_by: auth.user?.id,
        })
      }
      setMembers((current) =>
        current.map((item) => (item.id === memberId ? { ...item, status: 'active', warnings: 0 } : item)),
      )
      notify('Üye tekrar aktif edildi.')
      addActivity(`${member.name} tekrar aktif edildi.`)
    },
    [addActivity, auth.user?.id, members, notify, realBackend],
  )

  const moderateMember = useCallback(
    async (memberId, actionType, reason, nextRole) => {
      const member = members.find((item) => item.id === memberId)
      if (!member) return
      if (member.rawRole === 'founder' || String(member.id) === currentUser.id) {
        notify('Kurucu hesabı bu işlemden korunur.', 'warning')
        return
      }

      const roleLabel = nextRole ? roleLabelFromKey(nextRole) : member.role
      const nextWarnings = actionType === 'warning' ? Number(member.warnings || 0) + 1 : Number(member.warnings || 0)
      const autoRemoved = actionType === 'warning' && nextWarnings >= 3
      const statusMap = {
        warning: autoRemoved ? 'removed' : member.status,
        ban: 'banned',
        reject: 'rejected',
        restore: 'active',
        role_update: member.status,
      }
      const dbActionType = autoRemoved ? 'auto_removed' : actionType
      const actionReason = reason || 'Sebep girilmedi.'
      const nextStatus = statusMap[actionType] || member.status

      if (realBackend && supabase && member.profileId) {
        const profilePatch = {}
        if (actionType === 'warning') {
          profilePatch.warnings = nextWarnings
          profilePatch.status = nextStatus
        }
        if (['ban', 'reject', 'restore'].includes(actionType)) {
          profilePatch.status = nextStatus
          if (actionType === 'restore') profilePatch.warnings = 0
        }
        if (actionType === 'role_update' && nextRole) profilePatch.role = nextRole
        if (Object.keys(profilePatch).length) {
          await supabase.from('profiles').update(profilePatch).eq('id', member.profileId)
        }
        await supabase.from('moderation_actions').insert({
          target_profile_id: member.profileId,
          action_type: dbActionType,
          reason: actionReason,
          created_by: auth.user?.id,
        })
      }

      setMembers((current) =>
        current.map((item) =>
          item.id === memberId
            ? {
                ...item,
                status: nextStatus,
                warnings: actionType === 'restore' ? 0 : nextWarnings,
                rawRole: actionType === 'role_update' && nextRole ? nextRole : item.rawRole,
                role: actionType === 'role_update' && nextRole ? roleLabel : item.role,
              }
            : item,
        ),
      )
      pushModerationAction(member, dbActionType, actionReason)
      notify(
        {
          warning: autoRemoved ? '3 uyarı tamamlandı, üye otomatik atıldı.' : 'Uyarı kaydedildi.',
          ban: 'Üye banlandı.',
          reject: 'Üye reddedildi.',
          restore: 'Üye tekrar aktif edildi.',
          role_update: 'Üye rolü güncellendi.',
        }[actionType] || 'İşlem kaydedildi.',
      )
      addActivity(`${member.name}: ${actionReason}`)
    },
    [addActivity, auth.user?.id, currentUser.id, members, notify, pushModerationAction, realBackend],
  )

  const activeMembers = useMemo(() => members.filter((member) => member.status === 'active'), [members])
  const pendingMembers = useMemo(() => members.filter((member) => member.status === 'pending'), [members])
  const blockedMembers = useMemo(
    () => members.filter((member) => ['banned', 'removed', 'rejected'].includes(member.status)),
    [members],
  )

  const adminStats = useMemo(
    () => [
      ['Aktif Üye', String(activeMembers.length)],
      ['Bekleyen Onay', String(pendingMembers.length)],
      ['Ban/Atılan', String(blockedMembers.length)],
      ['Galeri Medyası', String(gallery.length)],
    ],
    [activeMembers.length, blockedMembers.length, gallery.length, pendingMembers.length],
  )

  const value = useMemo(
    () => ({
      currentUser,
      events,
      announcements,
      gallery,
      messages,
      feedbackReports,
      moderationActions,
      members,
      activeMembers,
      pendingMembers,
      blockedMembers,
      badges,
      activity,
      adminStats,
      toast,
      notify,
      clearToast,
      updateUser,
      updateProfilePhoto,
      isJoined,
      toggleJoin,
      addEvent,
      updateEvent,
      deleteEvent,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      addGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
      sendMessage,
      submitFeedbackReport,
      resolveFeedbackReport,
      addMember,
      addBadge,
      approveMember,
      rejectMember,
      warnMember,
      banMember,
      restoreMember,
      moderateMember,
    }),
    [
      currentUser,
      events,
      announcements,
      gallery,
      messages,
      feedbackReports,
      moderationActions,
      members,
      activeMembers,
      pendingMembers,
      blockedMembers,
      badges,
      activity,
      adminStats,
      toast,
      notify,
      clearToast,
      updateUser,
      updateProfilePhoto,
      isJoined,
      toggleJoin,
      addEvent,
      updateEvent,
      deleteEvent,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      addGalleryItem,
      updateGalleryItem,
      deleteGalleryItem,
      sendMessage,
      submitFeedbackReport,
      resolveFeedbackReport,
      addMember,
      addBadge,
      approveMember,
      rejectMember,
      warnMember,
      banMember,
      restoreMember,
      moderateMember,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppData() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppData must be used inside AppProvider')
  return context
}
