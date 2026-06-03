import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const founderProfile = {
  id: 'demo-founder',
  member_no: '68123',
  full_name: 'Faruk Yılmaz',
  role: 'founder',
  status: 'active',
  bike: 'CFMOTO 450 SR',
  blood: 'A Rh+',
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(isSupabaseConfigured ? null : founderProfile)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return null

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) {
      setProfile(null)
      return null
    }

    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user?.id) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user?.id) loadProfile(nextSession.user.id)
      else setProfile(null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { data: null, error: null }
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.data?.session) setSession(result.data.session)
    if (result.data?.user?.id) await loadProfile(result.data.user.id)
    return result
  }, [loadProfile])

  const signUp = useCallback(async ({ email, password, metadata }) => {
    if (!supabase) return { data: null, error: null }
    return supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setSession(null)
    setProfile(null)
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(async (userId) => {
    const targetUserId = userId || session?.user?.id
    if (!targetUserId) return null
    return loadProfile(targetUserId)
  }, [loadProfile, session?.user?.id])

  const value = useMemo(() => {
    const realMode = isSupabaseConfigured
    const isAuthenticated = realMode ? Boolean(session?.user) : true
    const status = profile?.status || 'pending'
    const role = profile?.role || 'member'
    const isActive = !realMode || status === 'active'
    const isPending = realMode && status === 'pending'
    const isBlocked = realMode && ['banned', 'removed', 'rejected'].includes(status)
    const isAdmin = !realMode || ['founder', 'admin', 'moderator'].includes(role)
    const isFounder = !realMode || role === 'founder'

    return {
      realMode,
      loading,
      session,
      user: session?.user || null,
      profile,
      isAuthenticated,
      isActive,
      isPending,
      isBlocked,
      isAdmin,
      isFounder,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }
  }, [loading, profile, refreshProfile, session, signIn, signOut, signUp])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
