import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false)) // don't hang if Supabase is unreachable

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      setProfile(data)
    } catch {
      // profile fetch failed — still clear the spinner
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    if (!email.toLowerCase().endsWith('.edu')) {
      return { error: { message: 'Please use a university (.edu) email address.' } }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async (email, password) => {
    if (!email.toLowerCase().endsWith('.edu')) {
      return { error: { message: 'Please use a university (.edu) email address.' } }
    }
    return supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const updateProfile = async (profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileData })
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return { user, profile, loading, signIn, signUp, signOut, updateProfile, refetchProfile: () => user && fetchProfile(user.id) }
}
