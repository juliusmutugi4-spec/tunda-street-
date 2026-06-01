"use client"

import { Menu, Search, Bell, Wallet } from "lucide-react"

interface HeaderProps {
  activeTab: "wallet" | "profile"
  user: any
  wallet: {
    balance: number
    escrow_balance: number
  }
  tipsCount: number
  handleSignOut: () => void
  openAuth: () => void
}

export default function Header({
  user,
  wallet,
  tipsCount,
  openAuth,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main Header */}
      <div className="backdrop-blur-xl bg-black/50 border-b border-white/10">
        <div className="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Menu size={20} className="text-white" />
            </button>

            <div>
              <h1 className="font-black text-lg tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  STREET
                </span>
                <span className="text-white">MARKET</span>
              </h1>

              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                Trade • Predict • Win
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {user && (
              <button
                onClick={openAuth}
                className="
                  bg-gradient-to-r
                  from-yellow-400
                  to-amber-500
                  text-black
                  font-bold
                  px-4
                  py-2
                  rounded-xl
                  shadow-lg
                  hover:scale-105
                  transition-all
                "
              >
                Deposit
              </button>
            )}

            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Search size={18} className="text-white" />
            </button>

            <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Bell size={18} className="text-white" />

              {tipsCount > 0 && (
                <span className="
                  absolute
                  -top-1
                  -right-1
                  min-w-[18px]
                  h-[18px]
                  px-1
                  rounded-full
                  bg-red-500
                  text-white
                  text-[10px]
                  font-bold
                  flex
                  items-center
                  justify-center
                  animate-pulse
                ">
                  {tipsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Bar */}
      {user && (
        <div className="backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">

            <div className="grid grid-cols-3 gap-3">

              {/* Balance */}
              <div className="rounded-2xl bg-white/5 border border-green-500/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={14} className="text-green-400" />
                  <span className="text-zinc-400 text-xs">
                    Balance
                  </span>
                </div>

                <p className="font-bold text-green-400 text-sm">
                  KSh {wallet.balance.toLocaleString()}
                </p>
              </div>

              {/* Escrow */}
              <div className="rounded-2xl bg-white/5 border border-yellow-500/20 p-3">
                <p className="text-zinc-400 text-xs mb-1">
                  Escrow
                </p>

                <p className="font-bold text-yellow-400 text-sm">
                  KSh {wallet.escrow_balance.toLocaleString()}
                </p>
              </div>

              {/* Active Tips */}
              <div className="rounded-2xl bg-white/5 border border-red-500/20 p-3">
                <p className="text-zinc-400 text-xs mb-1">
                  Active Tips
                </p>

                <p className="font-bold text-red-400 text-sm">
                  {tipsCount}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  )
}