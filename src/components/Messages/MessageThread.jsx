import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export function MessageThread({ currentUser, otherProfile, onClose }) {
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef  = useRef(null)

  // ── Fetch conversation ────────────────────────────────────
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherProfile.id}),` +
        `and(sender_id.eq.${otherProfile.id},receiver_id.eq.${currentUser.id})`
      )
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`dm:${[currentUser.id, otherProfile.id].sort().join(':')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new
        const isRelevant =
          (m.sender_id === currentUser.id && m.receiver_id === otherProfile.id) ||
          (m.sender_id === otherProfile.id && m.receiver_id === currentUser.id)
        if (isRelevant) setMessages((prev) => [...prev, m])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [currentUser.id, otherProfile.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send ──────────────────────────────────────────────────
  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setSending(true)
    await supabase.from('messages').insert({
      sender_id:   currentUser.id,
      receiver_id: otherProfile.id,
      content:     text,
    })
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800 shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 bg-indigo-700 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0">
          {otherProfile.full_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{otherProfile.full_name}</p>
          {otherProfile.pronouns && (
            <p className="text-gray-500 text-xs">{otherProfile.pronouns}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-4xl mb-4">👋</p>
            <p className="text-gray-400 text-sm">Say hi to {otherProfile.full_name}!</p>
            {otherProfile.ask_me_about && (
              <p className="text-gray-600 text-sm mt-2">
                Ask them about:{' '}
                <span className="text-indigo-400">{otherProfile.ask_me_about}</span>
              </p>
            )}
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUser.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-800 flex gap-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-2xl px-4 py-3
            focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-sm"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-3 rounded-2xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
