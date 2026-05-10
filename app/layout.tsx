import './globals.css'
import Link from 'next/link'
import { Home, Flame, PlusSquare, Wallet, User } from 'lucide-react'

export const metadata = {
  title: 'Street Market',
  description: 'Buy & sell in your hood',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white pb-20">
        <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-center text-red-500">Street Market</h1>
          </div>
        </header>

        <main className="max-w-md mx-auto p-4">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
          <div className="max-w-md mx-auto grid grid-cols-5 h-16">
            <Link href="/" className="flex flex-col items-center justify-center text-zinc-400 hover:text-white">
              <Home size={22} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/tips" className="flex flex-col items-center justify-center text-red-500">
              <Flame size={22} />
              <span className="text-xs mt-1">Tips</span>
            </Link>
            <Link href="/post" className="flex flex-col items-center justify-center text-white">
              <PlusSquare size={28} />
              <span className="text-xs mt-1 font-semibold">Sell</span>
            </Link>
            <Link href="/wallet" className="flex flex-col items-center justify-center text-zinc-400 hover:text-white">
              <Wallet size={22} />
              <span className="text-xs mt-1">Wallet</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center text-zinc-400 hover:text-white">
              <User size={22} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  )
}