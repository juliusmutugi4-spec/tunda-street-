'use client'

import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type TopNavProps = {
  user: any
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({ user, onLogin, onLogout }: TopNavProps) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-b border-zinc-800 shadow-sm">
      <div className="max-w-xl mx-auto h-16 px-4 flex items-center justify-between">
        <h1
          className="text-xl font-black cursor-pointer select-none"
          onClick={() => router.push('/')}
        >
          <span className="text-red-500">c</span>
          <span className="text-emerald-400">W</span>
          <span className="text-red-500">V</span>
        </h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Bell
                size={22}
                className="cursor-pointer text-zinc-300 hover:text-white transition"
                onClick={() => router.push('/notifications')}
              />
              <button
                onClick={onLogout}
                className="px-3 py-1 text-xs font-bold text-red-400 border border-zinc-700 rounded-lg hover:bg-red-900/20 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg shadow-md transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}