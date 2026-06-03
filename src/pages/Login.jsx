import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bike, Lock, LogOut, Mail, Phone, ShieldCheck, UserPlus } from 'lucide-react'
import Logo from '../components/Logo'
import { useAppData } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Login({ mode = 'login' }) {
  const navigate = useNavigate()
  const { notify, addMember } = useAppData()
  const auth = useAuth()
  const isRegister = mode === 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bike: '',
  })

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const activeSessionName = auth.profile?.full_name || auth.user?.user_metadata?.full_name || auth.user?.email

  const handleSignOut = async () => {
    await auth.signOut()
    notify('Oturum kapatıldı.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isRegister) {
      if (auth.realMode) {
        const { data, error } = await auth.signUp({
          email: form.email,
          password: form.password,
          metadata: {
            full_name: form.name,
            phone: form.phone,
            bike: form.bike,
          },
        })
        if (error) {
          notify(error.message, 'warning')
        }

        const { error: applicationError } = await supabase
          .from('membership_applications')
          .upsert(
            {
              user_id: data?.user?.id || null,
              full_name: form.name,
              email: form.email,
              phone: form.phone,
              bike: form.bike,
              status: 'pending',
            },
            { onConflict: 'email' },
          )

        if (applicationError) {
          notify(applicationError.message, 'warning')
          return
        }

        notify('Başvurun kurucu onayına gönderildi.')
        navigate('/login')
        return
      }

      addMember(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          bike: form.bike,
          role: 'Üye Adayı',
        },
        'pending',
      )
      notify('Başvurun kurucu onayına gönderildi.')
      navigate('/login')
      return
    }

    if (auth.realMode && auth.isAuthenticated) {
      notify('Başka hesapla girmek için önce açık oturumdan çıkış yap.', 'warning')
      return
    }

    if (auth.realMode) {
      const { data, error } = await auth.signIn({ email: form.email, password: form.password })
      if (error) {
        notify(error.message, 'warning')
        return
      }
      await auth.refreshProfile(data?.user?.id)
      notify('Giriş başarılı.')
      navigate('/')
      return
    }

    notify('Kurucu demo girişi başarılı.')
    navigate('/')
  }

  return (
    <section className="screen login-screen">
      <div className="hero-bike" />
      <div className="login-content">
        <Logo />
        <p className="tagline">Yolda birlik, ruhta özgürlük.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {!isRegister && auth.realMode && auth.isAuthenticated && (
          <div className="session-card">
            <ShieldCheck size={18} />
            <div>
              <b>{activeSessionName}</b>
              <span>Bu tarayıcıda oturum açık. Başka hesabı test etmek için önce çıkış yap.</span>
            </div>
            <button type="button" onClick={handleSignOut}>
              <LogOut size={14} />
              Çıkış
            </button>
          </div>
        )}
        {isRegister && (
          <label>
            <UserPlus size={16} />
            <input
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Ad Soyad"
              required
            />
          </label>
        )}
        <label>
          <Mail size={16} />
          <input
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            type="email"
            placeholder="E-posta"
            required
          />
        </label>
        {isRegister && (
          <>
            <label>
              <Phone size={16} />
              <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Telefon" />
            </label>
            <label>
              <Bike size={16} />
              <input
                value={form.bike}
                onChange={(event) => update('bike', event.target.value)}
                placeholder="Motosiklet"
              />
            </label>
          </>
        )}
        <label>
          <Lock size={16} />
          <input
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            type="password"
            placeholder="Şifre"
            required
          />
        </label>
        <button className="primary-btn" type="submit">
          {isRegister ? 'Başvuru Gönder' : 'Giriş Yap'}
        </button>
        <Link className="outline-btn" to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Giriş ekranına dön' : 'Üyelik Başvurusu'}
        </Link>
        <span className="guest">Üye alanı kurucu onayı olmadan açılmaz.</span>
      </form>

      <small>© 68 Riders · Tüm hakları saklıdır.</small>
    </section>
  )
}
