'use client'

import { Home, PlusSquare, MessageCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  user: {
    id: string
    avatar_url?: string | null
  } | null
}

export default function BottomNav({ user }: BottomNavProps) {
  const router = useRouter()

  const navItems = [
    { name: 'Feed', icon: <Home size={22} />, href: '/' },
    { name: 'Create', icon: <PlusSquare size={24} />, href: '/create', highlight: true },
    { name: 'Messages', icon: <MessageCircle size={22} />, href: '/messages' },
    { 
      name: 'Profile', 
      icon: user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt="Profile"
          className="w-6 h-6 rounded-full object-cover border border-zinc-700"
        />
      ) : (
        <User size={22} />
      ),
      href: user ? `/profile/${user.id}` : '/login'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-t border-zinc-800 shadow-inner">
      <div className="max-w-xl mx-auto h-16 flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.href)}
            className={`
              flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-all duration-200
              ${item.highlight ? 'text-emerald-400 hover:text-emerald-300' : ''}
              active:scale-95
            `}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-semibold">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}