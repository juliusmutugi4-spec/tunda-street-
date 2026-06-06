'use client'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Post from './components/Post'
import CreatePost from './components/CreatePost'
import LoginModal from './components/LoginModal'
import TopNav from './components/TopNav'
import BottomNav from './components/BottomNav'

type PostType = {
  id: string
  content: string
  video_url?: string | null
  user_id: string
  created_at: string
  username?: string
  avatar_url?: string | null
}
export default function Home() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [posts, setPosts] = useState<PostType[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  // Fetch unread messages count
  const fetchUnreadMessages = async (userId: string) => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)

    setUnreadCount(count || 0)
  }

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()

        setProfile(data)

        // ✅ fetch unread messages here
        await fetchUnreadMessages(session.user.id)
      }

      fetchPosts()
    }

    checkUser()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', session.user.id)
            .single()

          setProfile(data)

          // ✅ update unread messages on login
          await fetchUnreadMessages(session.user.id)
        } else {
          setProfile(null)
          setUnreadCount(0)
        }
      }
    )

    return () => sub.subscription.unsubscribe()
  }, [])

  const fetchPosts = async () => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Supabase fetchPosts error:', postsError)
      return
    }

    const userIds = postsData?.map((p: any) => p.user_id) ?? []
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    const postsWithProfiles = postsData?.map((p: any) => {
      const profile = profiles?.find((u: any) => u.id === p.user_id)
      return { ...p, username: profile?.username, avatar_url: profile?.avatar_url }
    }) ?? []

    setPosts(postsWithProfiles)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUnreadCount(0)
  }

  return (
    <main className="min-h-screen bg-[#060608] text-[#f4f4f5] antialiased selection:bg-emerald-500/30 font-sans tracking-tight relative overflow-x-hidden">
      {/* TopNav fixed */}
      <TopNav user={user} onLogin={() => setShowLogin(true)} onLogout={handleLogout} />

      {/* Feed scrollable */}
<div
  className="
    max-w-7xl
    mx-auto
    px-4
    pt-20
    pb-20
    lg:grid
    lg:grid-cols-12
    lg:gap-6
  "
>
{/* DESKTOP LEFT SIDEBAR */}
<div className="hidden lg:block lg:col-span-3">
  <div className="sticky top-24 space-y-2">
    <h2 className="font-bold text-lg text-white mb-3">Chats</h2>

    {/* Map over conversations */}
    {user && posts.length > 0 ? (
      posts.map((post) => (
        <button
          key={post.id}
          onClick={() => console.log(`Open chat for ${post.username}`)}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-zinc-800 transition"
        >
          <img
            src={post.avatar_url || '/avatar-placeholder.png'}
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 text-left min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{post.username}</h3>
            <p className="text-xs text-zinc-400 truncate">{post.content}</p>
          </div>
          <span className="text-[10px] text-zinc-500">
            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </button>
      ))
    ) : (
      <p className="text-xs text-zinc-500">No conversations</p>
    )}
  </div>
</div>

{/* MAIN FEED */}
<div className="lg:col-span-6"></div>
        {user && (
          <div className="group relative rounded-xl bg-zinc-900/20 border border-zinc-900 overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-zinc-800/80">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="p-4">
              <CreatePost userId={user.id} onPosted={fetchPosts} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.01] to-transparent animate-pulse" />
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
            <p className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase"> Synchronizing network feed... </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl bg-zinc-900/10 border border-zinc-900/60 p-12 text-center backdrop-blur-md">
            <p className="text-sm font-mono text-zinc-500 tracking-wide"> INDEX_EMPTY: No packets detected on this stream. </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="group relative rounded-xl bg-[#0d0d11]/40 border border-zinc-900/80 overflow-hidden shadow-xl backdrop-blur-md transition-all duration-300 hover:border-zinc-800 hover:shadow-black/50 hover:-translate-y-[1px]"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/10 transition-all duration-500" />
                <div className="p-0.5 relative z-10">
                  <Post
  post={post}
  user={user}
  profile={profile}
/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BottomNav fixed */}
      <BottomNav
        user={user}
        profile={profile}
        unreadCount={unreadCount} // ✅ pass unread count to show badge
      />

      {/* Login Modal */}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={fetchPosts} />
      )}
    </main>
  )
}