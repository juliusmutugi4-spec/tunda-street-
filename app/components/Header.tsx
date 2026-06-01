'use client'

import { useEffect, useState } from 'react'
import { Menu, Search, Bell } from 'lucide-react'

interface HeaderProps {
  showUI: boolean
  activeTab: "wallet" | "profile"
  user: any
  wallet: { balance: number; escrow_balance: number }
  tipsCount: number
  handleSignOut: () => void
  openAuth: () => void
}

export default function Header({
  showUI,
  activeTab,
  user,
  wallet,
  tipsCount,
  handleSignOut,
  openAuth
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isVisible && showUI? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Top bar - solid bg + blur for scroll-under effect */}
      <div className="bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              <button className="text-zinc-400 hover:text-white">
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-black">
                <span className="text-yellow-400">STREET</span>
                <span className="text-white">MARKET</span>
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={openAuth}
                  className="px-4 py-1.5 rounded-md bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                >
                  Deposit
                </button>
              )}
              <button className="text-zinc-400 hover:text-white">
                <Search size={22} />
              </button>
              <button className="text-zinc-400 hover:text-white relative">
                <Bell size={22} />
                {tipsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text- font-bold text-white flex items-center justify-center">
                    {tipsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar - only when logged in */}
      {user && (
        <div className="bg-black/95 backdrop-blur-xl border-b border-zinc-800">
          <div className="max-w-2xl mx-auto px-4 py-2">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text- text-zinc-500">Balance</p>
                <p className="text-green-400 font-bold text-sm">KSh {wallet.balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text- text-zinc-500">Escrow</p>
                <p className="text-yellow-400 font-bold text-sm">KSh {wallet.escrow_balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text- text-zinc-500">Active Tips</p>
                <p className="text-red-400 font-bold text-sm">{tipsCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}