'use client'

import { Home, PlusSquare, MessageCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

type BottomNavProps = {
  user: any
  profile: { username?: string; avatar_url?: string | null } | null
}

export default function BottomNav({ user, profile }: BottomNavProps) {
  const router = useRouter()

  const navigate = (path: string) => router.push(path)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-t border-zinc-800 shadow-md">
      <div className="max-w-xl mx-auto h-16 flex items-center justify-around">
        {/* Feed */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-zinc-400 hover:text-white transition"
        >
          <Home size={24} />
          <span className="text-[10px] mt-1">Feed</span>
        </button>

        {/* Create Post */}
        <button
          onClick={() => navigate('/create')}
          className="flex flex-col items-center text-emerald-400 hover:text-emerald-300 transition"
        >
          <PlusSquare size={26} />
          <span className="text-[10px] mt-1">Create</span>
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="flex flex-col items-center text-zinc-400 hover:text-white transition relative"
        >
          <MessageCircle size={24} />
          <span className="text-[10px] mt-1">Messages</span>
          {/* Optional unread badge */}
          <span className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 rounded-full border border-zinc-900" />
        </button>

        {/* Profile */}
        <button
          onClick={() =>
  navigate(
    profile?.username
      ? `/profile/${profile.username}`
      : '/'
  )
}
          className="flex flex-col items-center text-zinc-400 hover:text-white transition"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username ?? 'Profile'}
              className="w-6 h-6 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <User size={24} />
          )}
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </div>
    </nav>
  )
}