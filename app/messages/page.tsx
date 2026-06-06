// File: app/messages/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

type Conversation = {
  userId: string
  username: string
  avatar_url: string | null
  lastMessage: string
  created_at: string
}

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread messages
  const fetchUnread = async (userId: string) => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
    setUnreadCount(count || 0)
  }

  // Initialize user and conversations
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()
        setProfile(profileData)

        await fetchUnread(session.user.id)
        await fetchConversations(session.user.id)
      }

      setLoading(false)
    }
    init()
  }, [])

  const fetchConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    if (error) return console.error(error)

    const uniqueUsers = new Map()
    for (const msg of data || []) {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      if (!uniqueUsers.has(otherUserId)) {
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', otherUserId)
          .single()
        uniqueUsers.set(otherUserId, {
          userId: otherUserId,
          username: otherProfile?.username || 'User',
          avatar_url: otherProfile?.avatar_url || null,
          lastMessage: msg.content,
          created_at: msg.created_at,
        })
      }
    }
    setConversations(Array.from(uniqueUsers.values()))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUnreadCount(0)
  }

  return (
  <main className="min-h-screen bg-[#060608] text-white">
    <TopNav user={user} onLogin={() => {}} onLogout={handleLogout} />

    <div className="pt-20 pb-24 h-[calc(100vh-80px)] lg:grid lg:grid-cols-12 overflow-hidden">

      {/* LEFT PANEL: Conversations */}
      <div className="lg:col-span-4 border-r border-zinc-800 overflow-y-auto bg-[#0b141a]">
        <div className="px-4 py-6">
          <h1 className="text-3xl font-black mb-2">Messages</h1>
          <p className="text-zinc-500 text-sm mb-4">Recent conversations</p>

          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-400">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.userId}
                  onClick={() => {
                    if (window.innerWidth >= 1024) {
                      setSelectedChat(conv)
                    } else {
                      router.push(`/chat/${conv.userId}`)
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800/50 transition"
                >
                  {conv.avatar_url ? (
                    <img
                      src={conv.avatar_url}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
                      {conv.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 text-left min-w-0">
                    <h2 className="font-semibold text-white truncate">{conv.username}</h2>
                    <p className="text-sm text-zinc-400 truncate">{conv.lastMessage}</p>
                  </div>

                  <div className="text-xs text-zinc-500">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Chat area */}
      <div className="hidden lg:flex lg:col-span-8 flex-col bg-[#0b141a]">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="h-20 border-b border-zinc-800 flex items-center px-6 bg-[#111b21]">
              <div className="flex items-center gap-4">
                {selectedChat.avatar_url ? (
                  <img
                    src={selectedChat.avatar_url}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    {selectedChat.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-bold">{selectedChat.username}</h2>
                  <p className="text-xs text-zinc-500">Active now</p>
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Example static messages */}
              <div className="text-sm text-zinc-300">Chat messages will appear here</div>
            </div>

            {/* Chat input */}
            <div className="h-20 border-t border-zinc-800 bg-[#111b21] flex items-center px-4">
              <input
                placeholder="Type a message..."
                className="flex-1 bg-zinc-900 rounded-xl px-4 py-3 outline-none"
              />
              <button className="ml-3 px-5 py-3 rounded-xl bg-emerald-500 text-black font-bold">
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Tunda Chat</h2>
              <p className="text-zinc-500 mt-2">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>

    <BottomNav user={user} profile={profile} unreadCount={unreadCount} />
  </main>
)
}