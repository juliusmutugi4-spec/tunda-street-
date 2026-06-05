'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ChatPage() {
  const params = useParams()
  const otherUserId = params.userId as string

  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    let channel: any

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      if (!user) return

      // Load messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      setMessages(data || [])

      // REAL-TIME CHAT (FIXED ORDER)
      channel = supabase.channel('chat-room')

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
      (payload: any) => {
          const msg = payload.new

          const isPartOfChat =
            (msg.sender_id === user.id &&
              msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId &&
              msg.receiver_id === user.id)

          if (isPartOfChat) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )

      channel.subscribe()
    }

    load()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [otherUserId])

const sendMessage = async () => {
  if (!text.trim() || !user) return

  const messageText = text.trim()

  // Clear input immediately for better UX
  setText('')

  const { error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: otherUserId,
      content: messageText,
    })

  if (error) {
    console.error(error)
    alert('Failed to send message')
  }
}
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col">
      
      {/* HEADER */}
      <div className="p-4 border-b border-zinc-800 backdrop-blur-xl bg-black/40">
        <h1 className="text-lg font-bold tracking-widest text-cyan-400">
          NEURAL CHAT
        </h1>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.sender_id === user?.id ? 'text-right' : 'text-left'
            }
          >
            <div
              className={
                m.sender_id === user?.id
                  ? `
                    inline-block
                    bg-gradient-to-r from-cyan-500 to-blue-500
                    px-4 py-2
                    rounded-2xl
                    shadow-lg
                    text-white
                    max-w-xs
                  `
                  : `
                    inline-block
                    bg-zinc-800/80
                    px-4 py-2
                    rounded-2xl
                    border border-zinc-700
                    text-white
                    max-w-xs
                  `
              }
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-zinc-800 bg-black/60 backdrop-blur-xl flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="
            flex-1
            bg-zinc-900
            border border-zinc-700
            rounded-xl
            px-4 py-3
            focus:outline-none
            focus:border-cyan-500
          "
        />

        <button
          onClick={sendMessage}
          className="
            px-5 py-3
            bg-gradient-to-r from-cyan-500 to-blue-500
            rounded-xl
            font-bold
            hover:scale-105
            transition
          "
        >
          Send
        </button>
      </div>
    </div>
  )
}