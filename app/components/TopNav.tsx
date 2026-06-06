'use client'

import { Bell, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TopNavProps {
  user: any
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({
  user,
  onLogin,
  onLogout,
}: TopNavProps) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-xl mx-auto h-16 px-4 flex items-center justify-between">
        
        {/* Logo */}
        <h1
          onClick={() => router.push('/')}
          className="text-2xl font-black cursor-pointer select-none"
        >
          <span className="text-red-500">c</span>
          <span className="text-emerald-400">W</span>
          <span className="text-red-500">V</span>
        </h1>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          
          <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition">
            <Search size={18} />
          </button>

          <button className="relative w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {user ? (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}