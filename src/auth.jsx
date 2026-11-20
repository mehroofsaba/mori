import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, configured } from './lib/supabase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

const friendly = (e) => {
  const m = (e?.message || '').toLowerCase()
  if (m.includes('invalid login')) return 'That email and password don’t match. Check them and try again.'
  if (m.includes('email not confirmed')) return 'Please confirm your email first. We sent you a link when you signed up.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Try logging in instead.'
  if (m.includes('password') && m.includes('characters')) return 'Your password needs at least 8 characters.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a minute and try again.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Can’t reach the server. Check your internet connection.'
  return e?.message || 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(configured)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') setRecovery(false)
    })
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  const signUp = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin },
    })
    if (error) throw new Error(friendly(error))
    // Supabase hides "already registered" behind a user with no identities
    if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error(friendly({ message: 'already registered' }))
    return { needsConfirm: !data.session }
  }, [])
  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(friendly(error))
  }, [])
  const signOut = useCallback(async () => { await supabase.auth.signOut() }, [])
  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin })
    if (error) throw new Error(friendly(error))
  }, [])
  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(friendly(error))
    setRecovery(false)
  }, [])

  const value = useMemo(
    () => ({ session, user: session?.user || null, loading, recovery, signUp, signIn, signOut, resetPassword, updatePassword }),
    [session, loading, recovery, signUp, signIn, signOut, resetPassword, updatePassword],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
