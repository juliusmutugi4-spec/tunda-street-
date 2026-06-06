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

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()

        setProfile(profileData)

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

    if (error) {
      console.error(error)
      return
    }

    const uniqueUsers = new Map()

    for (const msg of data || []) {
      const otherUserId =
        msg.sender_id === userId
          ? msg.receiver_id
          : msg.sender_id

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

    setConversations(
      Array.from(uniqueUsers.values())
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <TopNav
        user={user}
        onLogin={() => {}}
        onLogout={handleLogout}
      />

      <div className="max-w-xl mx-auto pt-20 pb-24 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-black">
            Messages
          </h1>

          <p className="text-zinc-500 text-sm">
            Recent conversations
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-400">
              No conversations yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.userId}
                onClick={() =>
                  router.push(
                    `/chat/${conversation.userId}`
                  )
                }
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 hover:bg-zinc-800/50 transition"
              >
                {conversation.avatar_url ? (
                  <img
                    src={conversation.avatar_url}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
                    {conversation.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="flex-1 text-left min-w-0">
                  <h2 className="font-semibold text-white truncate">
                    {conversation.username}
                  </h2>

                  <p className="text-sm text-zinc-400 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>

                <div className="text-xs text-zinc-500">
                  {new Date(
                    conversation.created_at
                  ).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav
        user={user}
        profile={profile}
      />
    </main>
  )
}