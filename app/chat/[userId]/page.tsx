'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ChatPage() {
  const params = useParams()
  const otherUserId = params.userId as string

  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  useEffect(() => {
    let channel: any

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setUser(user)

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error(error)
      }

      setMessages(data || [])
      setLoading(false)

channel = supabase.channel(
  `chat-${user.id}-${otherUserId}`
)

channel.on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
  },
  (payload: any) => {
    const msg = payload.new

    const isPartOfChat =
      (msg.sender_id === user.id &&
        msg.receiver_id === otherUserId) ||
      (msg.sender_id === otherUserId &&
        msg.receiver_id === user.id)

    if (!isPartOfChat) return

    setMessages((prev) => {
      const exists = prev.some(
        (m) => m.id === msg.id
      )

      if (exists) return prev

      return [...prev, msg]
    })
  }
)

await supabase.removeChannel(channel)

channel.subscribe()
    }

    load()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [otherUserId])

  const sendMessage = async () => {
    if (!text.trim() || !user) return

    const messageText = text.trim()

    setText('')

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: user.id,
        receiver_id: otherUserId,
        content: messageText,
      })

    if (error) {
      console.error(error)
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading chat...
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b141a] text-white">
      {/* HEADER */}
      <div className="h-16 border-b border-zinc-800 bg-[#202c33] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              w-11 h-11 rounded-full
              bg-gradient-to-r
              from-emerald-400
              to-cyan-500
            "
          />

          <div>
            <h1 className="font-bold">
              Conversation
            </h1>
            <p className="text-xs text-zinc-400">
              Tunda Street Chat
            </p>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          py-6
          space-y-3
          bg-[#111b21]
        "
      >
        {messages.map((m) => {
          const mine =
            m.sender_id === user?.id

          return (
            <div
              key={m.id}
              className={
                mine
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }
            >
              <div
                className={
                  mine
                    ? `
                    max-w-[80%]
                    bg-[#005c4b]
                    px-4
                    py-2
                    rounded-2xl
                    rounded-br-sm
                    shadow-lg
                  `
                    : `
                    max-w-[80%]
                    bg-[#202c33]
                    px-4
                    py-2
                    rounded-2xl
                    rounded-bl-sm
                    shadow-lg
                  `
                }
              >
                <p className="break-words">
                  {m.content}
                </p>

                <p className="text-[10px] text-zinc-400 mt-1 text-right">
                  {new Date(
                    m.created_at
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="bg-[#202c33] border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            className="
              flex-1
              bg-[#2a3942]
              rounded-full
              px-5
              py-3
              outline-none
              border
              border-transparent
              focus:border-emerald-500
            "
          />

          <button
            onClick={sendMessage}
            className="
              px-6
              rounded-full
              bg-emerald-500
              hover:bg-emerald-400
              font-bold
              transition
            "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}