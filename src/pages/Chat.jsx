import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  Camera,
  CheckCheck,
  FileText,
  Image,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Send,
  Smile,
  Trash2,
  Video,
  Vote,
  X,
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppContext'
import { publicUrl, supabase } from '../lib/supabase'

const ROOM_ID = '00000000-0000-0000-0000-000000000068'
const CHAT_STORAGE_KEY = '68riders:chatMessages:v1'
const LOCAL_FILE_LIMIT_BYTES = 5 * 1024 * 1024
const reactions = ['👍', '❤️', '🔥', '👏', '🏍️']
const quickEmojis = [...reactions, '😂', '😎', '🙌', '🙏', '✅', '⚠️']

const fileToPathName = (name) => `${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, '-')}`

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const seedToChatMessages = (messages) =>
  messages.map((message) => ({
    id: message.id,
    sender_name: message.from,
    body: message.text,
    message_type: 'text',
    me: message.me,
    created_at: new Date().toISOString(),
  }))

const readLocalMessages = (seedMessages) => {
  if (typeof window === 'undefined') return seedToChatMessages(seedMessages)
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) && parsed.length ? parsed : seedToChatMessages(seedMessages)
  } catch {
    return seedToChatMessages(seedMessages)
  }
}

const writeLocalMessages = (messages) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-200)))
  } catch {
    // Media-heavy demo conversations can exceed browser storage.
  }
}

const summarizeReactions = (rows = []) =>
  rows.reduce((summary, row) => {
    const emoji = row.emoji || row
    if (!emoji) return summary
    const count = Number(row.count || 1)
    const found = summary.find((item) => item.emoji === emoji)
    if (found) found.count += count
    else summary.push({ emoji, count })
    return summary
  }, [])

const normalizeReactionSummary = (message) => summarizeReactions(message.reactions || message.message_reactions || [])

export default function Chat() {
  const auth = useAuth()
  const app = useAppData()
  const [messages, setMessages] = useState(() => readLocalMessages(app.messages))
  const [draft, setDraft] = useState('')
  const [attachOpen, setAttachOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [editing, setEditing] = useState(null)
  const [typing, setTyping] = useState('')
  const [online, setOnline] = useState([])
  const [recording, setRecording] = useState(false)
  const [pollOpen, setPollOpen] = useState(false)
  const [pollForm, setPollForm] = useState({ question: '', options: 'Evet\nHayır' })
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const photoInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const documentInputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const roomChannelRef = useRef(null)

  const realChat = auth.realMode && auth.isActive && supabase

  const commitMessages = (updater) => {
    setMessages((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      if (!realChat) writeLocalMessages(next)
      return next
    })
  }

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [messages],
  )

  useEffect(() => {
    if (!realChat) return undefined

    let alive = true

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*, message_reactions(emoji, profile_id)')
        .eq('room_id', ROOM_ID)
        .order('created_at', { ascending: true })
        .limit(120)

      if (!error && alive) {
        setMessages((data || []).map((message) => ({ ...message, reactions: summarizeReactions(message.message_reactions) })))
      }
    }

    loadMessages()

    const channel = supabase
      .channel(`room-${ROOM_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${ROOM_ID}` }, loadMessages)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnline(Object.values(state).flat().map((item) => item.name).filter(Boolean))
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== auth.user?.id) {
          setTyping(`${payload.name} yazıyor...`)
          window.clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = window.setTimeout(() => setTyping(''), 1800)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: auth.user?.id, name: auth.profile?.full_name || app.currentUser.name })
        }
      })

    roomChannelRef.current = channel

    return () => {
      alive = false
      roomChannelRef.current = null
      supabase.removeChannel(channel)
      window.clearTimeout(typingTimeoutRef.current)
    }
  }, [app.currentUser.name, auth.profile?.full_name, auth.user?.id, realChat])

  const broadcastTyping = async () => {
    if (!realChat) return
    await roomChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: auth.user?.id, name: auth.profile?.full_name || app.currentUser.name },
    })
  }

  const insertMessage = async (payload) => {
    const localMessage = {
      id: Date.now(),
      sender_name: 'Sen',
      sender_id: auth.user?.id,
      room_id: ROOM_ID,
      me: true,
      created_at: new Date().toISOString(),
      ...payload,
    }

    if (realChat) {
      const { error } = await supabase.from('chat_messages').insert({
        room_id: ROOM_ID,
        sender_id: auth.user.id,
        sender_name: auth.profile?.full_name || app.currentUser.name,
        reply_to: replyTo?.id || null,
        ...payload,
      })
      if (error) {
        app.notify(error.message, 'warning')
        return
      }
    } else {
      commitMessages((current) => [...current, localMessage])
    }

    setReplyTo(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const clean = draft.trim()
    if (!clean) return

    if (editing) {
      if (realChat) {
        await supabase.from('chat_messages').update({ body: clean, edited_at: new Date().toISOString() }).eq('id', editing.id)
      }
      commitMessages((current) =>
        current.map((message) => (message.id === editing.id ? { ...message, body: clean, edited_at: new Date().toISOString() } : message)),
      )
      setEditing(null)
      setDraft('')
      return
    }

    await insertMessage({ body: clean, message_type: 'text' })
    setDraft('')
  }

  const uploadChatFile = async (file, messageType, bucket) => {
    if (!file) return

    if (realChat) {
      const path = `${auth.user.id}/${fileToPathName(file.name)}`
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
      })
      if (error) {
        app.notify(error.message, 'warning')
        return
      }

      await insertMessage({
        body: file.name,
        message_type: messageType,
        bucket,
        file_path: path,
        public_url: publicUrl(bucket, path),
      })
      return
    }

    if (file.size > LOCAL_FILE_LIMIT_BYTES) {
      app.notify('Büyük medya kalıcı kayıt için Supabase Storage ister. Demo modda 5 MB altı dosyalar saklanır.', 'warning')
      return
    }

    const public_url = await fileToDataUrl(file)
    await insertMessage({ body: file.name, message_type: messageType, public_url })
  }

  const handleFileSelect = async (event, messageType, bucket) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    await uploadChatFile(file, messageType, bucket)
    setAttachOpen(false)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      app.notify('Tarayıcı ses kaydını desteklemiyor.', 'warning')
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunksRef.current = []
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (event) => chunksRef.current.push(event.data)
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const file = new File([blob], `sesli-mesaj-${Date.now()}.webm`, { type: 'audio/webm' })
      stream.getTracks().forEach((track) => track.stop())
      await uploadChatFile(file, 'audio', 'chat-voice')
    }
    recorder.start()
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const softDelete = async (message) => {
    if (realChat) {
      await supabase.from('chat_messages').update({ deleted_at: new Date().toISOString(), body: '' }).eq('id', message.id)
    }
    commitMessages((current) => current.map((item) => (item.id === message.id ? { ...item, deleted_at: new Date().toISOString(), body: '' } : item)))
  }

  const reactToMessage = async (message, emoji) => {
    if (realChat) {
      const { error } = await supabase.from('message_reactions').insert({ message_id: message.id, profile_id: auth.user.id, emoji })
      if (error?.message.toLowerCase().includes('duplicate')) {
        app.notify('Bu tepki zaten eklendi.', 'warning')
        return
      }
      if (error) {
        app.notify(error.message, 'warning')
        return
      }
    }
    commitMessages((current) =>
      current.map((item) => {
        if (item.id !== message.id) return item
        const nextReactions = normalizeReactionSummary(item)
        const found = nextReactions.find((reaction) => reaction.emoji === emoji)
        if (found) found.count += 1
        else nextReactions.push({ emoji, count: 1 })
        return { ...item, reactions: nextReactions }
      }),
    )
    app.notify(`${emoji} tepki gönderildi.`)
  }

  const shareEvent = async () => {
    const event = app.events[0]
    await insertMessage({ body: `${event.title} · ${event.date} · ${event.place}`, message_type: 'event' })
    setAttachOpen(false)
  }

  const submitPoll = async (event) => {
    event.preventDefault()
    const options = pollForm.options.split('\n').map((item) => item.trim()).filter(Boolean)
    if (!pollForm.question.trim() || options.length < 2) {
      app.notify('Anket için soru ve en az iki seçenek lazım.', 'warning')
      return
    }

    await insertMessage({
      body: JSON.stringify({ question: pollForm.question, options }),
      message_type: 'poll',
    })
    setPollForm({ question: '', options: 'Evet\nHayır' })
    setPollOpen(false)
    setAttachOpen(false)
  }

  return (
    <section className="screen page chat-page">
      <div className="chat-head">
        <div>
          <h1>Ekip Sohbeti</h1>
          <span>{typing || `${realChat ? online.length : 6} çevrimiçi · 68 Riders üyeleri`}</span>
        </div>
        <div>
          <button type="button" className="icon-btn" aria-label="Sesli arama">
            <Phone size={18} />
          </button>
          <button type="button" className="icon-btn" aria-label="Sohbet seçenekleri">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="chat-feed">
        {sortedMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            me={message.sender_id ? message.sender_id === auth.user?.id : message.me}
            onReply={() => setReplyTo(message)}
            onEdit={() => {
              setEditing(message)
              setDraft(message.body || '')
            }}
            onDelete={() => softDelete(message)}
            onReact={(emoji) => reactToMessage(message, emoji)}
          />
        ))}
      </div>

      {(replyTo || editing) && (
        <div className="reply-bar">
          <span>{editing ? 'Düzenleniyor' : `Cevap: ${replyTo.sender_name}`}</span>
          <button type="button" onClick={() => {
            setReplyTo(null)
            setEditing(null)
            setDraft('')
          }}>
            <X size={15} />
          </button>
        </div>
      )}

      {attachOpen && (
        <div className="attach-menu glass">
          <AttachButton icon={Image} label="Fotoğraf" onClick={() => photoInputRef.current?.click()} />
          <AttachButton icon={Video} label="Video" onClick={() => videoInputRef.current?.click()} />
          <AttachButton icon={Camera} label="Kamera" onClick={() => cameraInputRef.current?.click()} />
          <AttachButton icon={FileText} label="Belge" onClick={() => documentInputRef.current?.click()} />
          <AttachButton icon={Mic} label={recording ? 'Kaydı Bitir' : 'Sesli Mesaj'} onClick={recording ? stopRecording : startRecording} />
          <AttachButton icon={Vote} label="Anket" onClick={() => setPollOpen(true)} />
          <AttachButton icon={CalendarDays} label="Etkinlik" onClick={shareEvent} />
        </div>
      )}

      {emojiOpen && (
        <div className="emoji-menu glass">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setDraft((current) => `${current}${emoji}`)
                setEmojiOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={handleSubmit}>
        <button type="button" className="chat-tool" onClick={() => setAttachOpen((open) => !open)} aria-label="Ek ekle">
          {attachOpen ? <X size={20} /> : <Plus size={22} />}
        </button>
        <button type="button" className="chat-tool" onClick={() => setEmojiOpen((open) => !open)} aria-label="Emoji">
          <Smile size={20} />
        </button>
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            broadcastTyping()
          }}
          placeholder="Bir mesaj yazın"
          aria-label="Mesaj yaz"
        />
        <button type="submit" className="primary-btn" aria-label="Mesaj gönder">
          <Send size={18} />
        </button>
        <button type="button" className={`chat-tool mic ${recording ? 'recording' : ''}`} onClick={recording ? stopRecording : startRecording} aria-label="Sesli mesaj">
          <Mic size={20} />
        </button>
      </form>

      <input ref={photoInputRef} className="sr-only" type="file" accept="image/*" onChange={(event) => handleFileSelect(event, 'image', 'chat-media')} />
      <input ref={videoInputRef} className="sr-only" type="file" accept="video/*" onChange={(event) => handleFileSelect(event, 'video', 'chat-media')} />
      <input ref={cameraInputRef} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => handleFileSelect(event, 'image', 'chat-media')} />
      <input ref={documentInputRef} className="sr-only" type="file" onChange={(event) => handleFileSelect(event, 'document', 'chat-documents')} />

      {pollOpen && (
        <Modal title="Anket Oluştur" onClose={() => setPollOpen(false)}>
          <form className="modal-form" onSubmit={submitPoll}>
            <label className="field">
              <span>Soru</span>
              <input value={pollForm.question} onChange={(event) => setPollForm((current) => ({ ...current, question: event.target.value }))} />
            </label>
            <label className="field">
              <span>Seçenekler</span>
              <textarea value={pollForm.options} onChange={(event) => setPollForm((current) => ({ ...current, options: event.target.value }))} />
            </label>
            <button type="submit" className="primary-btn">Anketi Gönder</button>
          </form>
        </Modal>
      )}
    </section>
  )
}

function MessageBubble({ message, me, onReply, onEdit, onDelete, onReact }) {
  const deleted = Boolean(message.deleted_at)
  const mediaUrl = message.public_url || (message.bucket && message.file_path ? publicUrl(message.bucket, message.file_path) : '')
  const messageReactions = normalizeReactionSummary(message)

  return (
    <div className={`bubble ${me ? 'me' : ''}`}>
      <small>{message.sender_name || (me ? 'Sen' : 'Üye')}</small>
      {deleted ? <p>Bu mesaj silindi.</p> : <MessageContent message={message} mediaUrl={mediaUrl} />}
      {!!messageReactions.length && (
        <div className="reaction-strip">
          {messageReactions.map((reaction) => (
            <span key={reaction.emoji}>
              {reaction.emoji} {reaction.count > 1 ? reaction.count : ''}
            </span>
          ))}
        </div>
      )}
      <div className="message-meta">
        <span>{message.edited_at ? 'Düzenlendi' : new Date(message.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
        {me && <CheckCheck size={13} />}
      </div>
      <div className="message-actions">
        {reactions.map((emoji) => (
          <button key={emoji} type="button" onClick={() => onReact(emoji)}>{emoji}</button>
        ))}
        <button type="button" onClick={onReply}>Cevapla</button>
        {me && !deleted && <button type="button" onClick={onEdit}>Düzenle</button>}
        {me && !deleted && <button type="button" onClick={onDelete}><Trash2 size={12} /></button>}
      </div>
    </div>
  )
}

function MessageContent({ message, mediaUrl }) {
  if (message.message_type === 'image') return <img className="chat-media" src={mediaUrl} alt={message.body || 'Fotoğraf'} />
  if (message.message_type === 'video') return <video className="chat-media" src={mediaUrl} controls />
  if (message.message_type === 'audio') return <audio className="chat-audio" src={mediaUrl} controls />
  if (message.message_type === 'document') return <a className="chat-document" href={mediaUrl} target="_blank" rel="noreferrer"><FileText size={16} /> {message.body}</a>
  if (message.message_type === 'event') return <GlassCard className="shared-event"><CalendarDays size={16} /><span>{message.body}</span></GlassCard>
  if (message.message_type === 'poll') {
    let poll = { question: '', options: [] }
    try {
      poll = JSON.parse(message.body || '{"question":"","options":[]}')
    } catch {
      poll = { question: message.body || 'Anket', options: [] }
    }
    return (
      <div className="poll-card">
        <b>{poll.question}</b>
        {poll.options.map((option) => <button type="button" key={option}>{option}</button>)}
      </div>
    )
  }
  return <p>{message.body}</p>
}

function AttachButton({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  )
}
