import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useActiveHands(onExpirySoon) {
  const [activeHands, setActiveHands] = useState([])
  const [loading, setLoading] = useState(true)
  // Keep callback in a ref to avoid stale closure in the interval
  const onExpirySoonRef = useRef(onExpirySoon)
  useEffect(() => { onExpirySoonRef.current = onExpirySoon })

  const fetchHands = useCallback(async () => {
    const { data, error } = await supabase
      .from('active_hands')
      .select(`
        *,
        profiles (
          id, full_name, pronouns, academic_level, avatar_url, ask_me_about
        )
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (!error && data) setActiveHands(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHands()

    const channel = supabase
      .channel('active_hands_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_hands' },
        () => fetchHands()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchHands])

  // Client-side expiry filter + 2-min warning
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setActiveHands((prev) =>
        prev.filter((hand) => {
          const expiresMs = new Date(hand.expires_at).getTime()
          if (expiresMs <= now) return false

          const minsLeft = (expiresMs - now) / 60000
          // Fire warning once, between 2:00 and 1:55 minutes remaining
          if (minsLeft <= 2 && minsLeft > 1.916) {
            onExpirySoonRef.current?.(hand)
          }
          return true
        })
      )
    }, 15000) // check every 15s

    return () => clearInterval(interval)
  }, [])

  const createHand = async (handData) => {
    const { data, error } = await supabase
      .from('active_hands')
      .insert(handData)
      .select()
      .single()
    if (!error) await fetchHands()
    return { data, error }
  }

  const deleteHand = async (id) => {
    const result = await supabase.from('active_hands').delete().eq('id', id)
    await fetchHands()
    return result
  }

  const extendHand = async (id, additionalMinutes = 15) => {
    const hand = activeHands.find((h) => h.id === id)
    if (!hand) return { error: new Error('Hand not found') }

    const currentExpiry = new Date(hand.expires_at).getTime()
    const newExpiry = new Date(
      Math.max(currentExpiry, Date.now()) + additionalMinutes * 60000
    ).toISOString()

    const result = await supabase
      .from('active_hands')
      .update({ expires_at: newExpiry })
      .eq('id', id)

    await fetchHands()
    return result
  }

  return { activeHands, loading, createHand, deleteHand, extendHand, refetch: fetchHands }
}
