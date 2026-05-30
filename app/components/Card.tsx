"use client"
import { useState, useEffect, useMemo } from "react"
import { Lock, Clock, Sparkles, ShieldCheck } from "lucide-react"

// Cyberpunk-infused dynamic brand neon accents
const BRANDS: Record<string, { accent: string; glow: string; border: string }> = {
  SportPesa: { 
    accent: "from-orange-400 to-amber-500 text-transparent bg-clip-text", 
    glow: "shadow-[0_0_15px_rgba(251,146,60,0.15)]",
    border: "border-orange-500/20 hover:border-orange-400/40"
  },
  Betika: { 
    accent: "from-yellow-300 to-lime-400 text-transparent bg-clip-text", 
    glow: "shadow-[0_0_15px_rgba(253,224,71,0.15)]",
    border: "border-yellow-500/20 hover:border-yellow-300/40"
  },
  Betway: { 
    accent: "from-emerald-400 to-cyan-400 text-transparent bg-clip-text", 
    glow: "shadow-[0_0_15px_rgba(52,211,153,0.15)]",
    border: "border-emerald-500/20 hover:border-emerald-400/40"
  },
  default: { 
    accent: "from-white to-slate-300 text-transparent bg-clip-text", 
    glow: "shadow-[0_0_15px_rgba(255,255,255,0.05)]",
    border: "border-white/10 hover:border-white/20"
  }
}

interface TipData {
  id?: string | number
  company?: string
  seller_name?: string
  created_at: string | number | Date
  duration_hours?: number
  expiry_hours?: number
  price: number | string
  odds: number | string
  secret_link?: string
}

export default function BettingTipCard({ tip }: { tip: TipData }) {
  const [paid, setPaid] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null) // Prevents SSR flash hydration issues

  const { expiresAt, odds, price, brand } = useMemo(() => {
    const duration = Number(tip.duration_hours ?? tip.expiry_hours ?? 24)
    const start = new Date(tip.created_at).getTime()
    const name = tip.company || tip.seller_name || "default"
    const b = BRANDS[name] || BRANDS.default
    return { 
      expiresAt: start + duration * 3600000, 
      odds: Number(tip.odds || 0).toFixed(2), 
      price: Number(tip.price || 0).toLocaleString('en-KE'), 
      brand: b 
    }
  }, [tip])

  useEffect(() => {
    const tick = () => setTimeLeft(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)))
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [expiresAt])

  // Sub-millisecond layout isolation cleanup if item expires
  if (timeLeft !== null && timeLeft <= 0) return null

  const h = String(Math.floor((timeLeft || 0) / 3600)).padStart(2, "0")
  const m = String(Math.floor(((timeLeft || 0) % 3600) / 60)).padStart(2, "0")
  const s = String((timeLeft || 0) % 60).padStart(2, "0")

  return (
    <article 
      className={`relative w-full h-32 rounded-xl bg-gradient-to-b from-[#0d1527] to-[#050914] border ${brand.border} ${brand.glow} p-2.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden`}
      style={{
        contain: 'layout paint style', // Prevents DOM card updates from lagging the rest of the web app
        transform: 'translateZ(0)',    // Forces instant GPU layout rendering
        willChange: 'transform, opacity'
      }}
    >
      {/* Sci-fi Subtle Background Radar Grid Line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

      {/* Top Header Layer */}
      <div className="flex items-center justify-between text-[10px] font-medium tracking-wider z-10">
        <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 backdrop-blur-md animate-pulse">
          <Sparkles className="w-2.5 h-2.5" />
          LIVE
        </span>
        <div className="flex items-center gap-1 font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 backdrop-blur-md">
          <Clock className="w-2.5 h-2.5 text-slate-400 group-hover:rotate-12 transition-transform duration-300" />
          <span>{h}:{m}<span className="text-[8px] opacity-60 text-slate-500">:{s}</span></span>
        </div>
      </div>

      {/* Center Pricing Area */}
      <div className="flex flex-col justify-center items-start my-1 z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-bold text-slate-500 tracking-tight">ODDS</span>
          <h2 className={`text-2xl font-black bg-gradient-to-r ${brand.accent} tracking-tighter leading-none`}>
            @{odds}
          </h2>
        </div>
        <p className="text-xs font-bold text-slate-300 font-mono tracking-wide mt-0.5">
          KSh {price}
        </p>
      </div>

      {/* Futuristic Action Button */}
      <div className="w-full z-10 mt-1">
        {!paid ? (
          <button 
            onClick={() => setPaid(true)} 
            className="relative w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black text-[10px] font-black tracking-widest flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(255,255,255,0.1)] transition-all duration-200 active:scale-[0.98]"
          >
            <Lock className="w-3 h-3 text-black animate-bounce-subtle" />
            UNLOCK ACCESS
          </button>
        ) : (
          <a 
            href={tip.secret_link || "#"} 
            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-[10px] font-black tracking-widest flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(52,211,153,0.2)] transition-all duration-200 active:scale-[0.98]"
          >
            <ShieldCheck className="w-3 h-3 text-black" />
            OPEN INVESTMENT
          </a>
        )}
      </div>
    </article>
  )
}
