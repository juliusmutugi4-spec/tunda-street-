"use client"
"use client"

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
  activeTab,
  user,
  wallet,
  tipsCount,
  handleSignOut,
  openAuth
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[999]">
      <div className="bg-black border-b border-red-600/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">

        {/* Red glow line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        <div className="max-w-2xl mx-auto px-5 py-4">

          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-red-500 font-bold">
                STREET MARKET
              </p>

              <h1 className="text-2xl font-black text-white">
                {activeTab === "wallet"
                  ? "Trading Feed"
                  : "Wallet Hub"}
              </h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900 border border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-zinc-300">
                    Online
                  </span>
                </div>
              )}

              <button
                onClick={user ? handleSignOut : openAuth}
                className="
                  px-4 py-2
                  rounded-xl
                  bg-red-600
                  hover:bg-red-500
                  text-white
                  text-sm
                  font-bold
                  transition
                "
              >
                {user ? "Logout" : "Sign In"}
              </button>

            </div>
          </div>

          {user && (
            <div className="grid grid-cols-3 gap-3 mt-4">

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500">
                  Balance
                </p>
                <p className="text-green-400 font-black">
                  KSh {wallet.balance.toLocaleString()}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500">
                  Escrow
                </p>
                <p className="text-yellow-400 font-black">
                  KSh {wallet.escrow_balance.toLocaleString()}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500">
                  Active Tips
                </p>
                <p className="text-red-400 font-black">
                  {tipsCount}
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Bottom curved edge */}
        <div className="h-4 bg-black rounded-b-3xl" />
      </div>
    </header>
  )
}