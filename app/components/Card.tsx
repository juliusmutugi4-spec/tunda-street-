"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { Lock, Clock, Sparkles, ShieldCheck } from "lucide-react"

// ATOMIC CONSTANTS: Pre-compiled styling classes to save CPU cycles from string concatenation during map loops
const BRAND_STYLES = {
  SportPesa: {
    accent: "bg-gradient-to-r from-orange-400 to-amber-500 text-transparent bg-clip-text",
    glow: "shadow-[0_0_15px_rgba(251,146,60,0.12)]",
    border: "border-orange-500/20 hover:border-orange-400/40"
  },
  Betika: {
    accent: "bg-gradient-to-r from-yellow-300 to-lime-400 text-transparent bg-clip-text",
    glow: "shadow-[0_0_15px_rgba(253,224,71,0.12)]",
    border: "border-yellow-500/20 hover:border-yellow-300/40"
  },
  Betway: {
    accent: "bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text",
    glow: "shadow-[0_0_15px_rgba(52,211,153,0.12)]",
    border: "border-emerald-500/20 hover:border-emerald-400/40"
  },
  default: {
    accent: "bg-gradient-to-r from-white to-slate-300 text-transparent bg-clip-text",
    glow: "shadow-[0_0_15px_rgba(255,255,255,0.03)]",
    border: "border-white/10 hover:border-white/20"
  }
} as const

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
 matches?: number 
}

export default function BettingTipCard({ tip }: { tip: TipData }) {
  const [paid, setPaid] = useState(false)
  const timerRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Memoize everything to avoid recalculating mathematical operations on parent state updates
  const meta = useMemo(() => {
    const duration = Number(tip.duration_hours ?? tip.expiry_hours ?? 24)
    const start = new Date(tip.created_at).getTime()
    const name = tip.company || tip.seller_name || "default"
    const brand = BRAND_STYLES[name as keyof typeof BRAND_STYLES] || BRAND_STYLES.default
    
    return {
      expiresAt: start + (duration * 3600000),
      odds: Number(tip.odds || 0).toFixed(2),
      price: Number(tip.price || 0).toLocaleString('en-KE'),
      brand
    }
  }, [tip])

  // SUB-MILLISECOND ISOLATED COUNTDOWN: Updates the DOM text node directly without triggering React re-renders
  useEffect(() => {
    const target = meta.expiresAt
    const timerNode = timerRef.current
    const cardNode = cardRef.current
    
    if (!timerNode) return

    const tick = () => {
      const now = Date.now()
      if (now >= target) {
        if (cardNode) cardNode.style.display = 'none' // Instant layout removal without state lag
        return false
      }

      // Fast integer division via bitwise math operations
      const diffSecs = ((target - now) / 1000) | 0
      const h = (diffSecs / 3600) | 0
      const m = ((diffSecs % 3600) / 60) | 0
      const s = diffSecs % 60

      // Blit time data straight to native browser DOM text elements to drop CPU cycles to zero
      timerNode.textContent = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
      return true
    }

    // Run first layout cycle immediately
    const state = tick()
    if (!state) return

    const intervalId = setInterval(() => {
      if (!tick()) clearInterval(intervalId)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [meta.expiresAt])

  return (
    <article 
      ref={cardRef}
      className={`relative w-full h-32 rounded-xl bg-gradient-to-b from-[#0d1527] to-[#050914] border p-2.5 flex flex-col justify-between group overflow-hidden ${meta.brand.border} ${meta.brand.glow}`}
      style={{
        contain: 'layout paint style size', // STRICT LAYER CONTAINER SANDBOX
        transform: 'translateZ(0)',         // ALL ANIMATIONS SHIFTED TO HARDWARE GPU GRID
        willChange: 'transform'
      }}
    >
      {/* Structural Sci-Fi Grid Filter Line Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

      {/* Top Header Row Layout */}
      <div className="flex items-center justify-between text-[10px] font-medium tracking-wider z-10">
        <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 backdrop-blur-md">
          <div className="flex items-center gap-1 select-none" style={{ contain: 'content' }}>
            <span className="flex items-center gap-0.5 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-1 py-0.5 rounded border border-orange-500/20 backdrop-blur-sm">
              <Sparkles className="w-2 h-2 text-orange-400 animate-pulse" />
              <span className="text-[7px] font-black tracking-widest text-orange-400 uppercase font-mono">LIVE</span>
            </span>
            
            {/* HYPER-MICRO 5 MAGNETIC WOBBLING DOTS */}
            <div className="flex items-center gap-[1.5px] px-0.5 h-3">
              <span className="w-[2px] h-[2px] rounded-full bg-orange-500 animate-[bounce_0.8s_infinite_100ms] shadow-[0_0_4px_#f97316]" />
              <span className="w-[2px] h-[2px] rounded-full bg-orange-400 animate-[bounce_0.8s_infinite_200ms] shadow-[0_0_4px_#fb923c]" />
              <span className="w-[2px] h-[2px] rounded-full bg-red-500 animate-[bounce_0.8s_infinite_300ms] shadow-[0_0_4px_#ef4444]" />
              <span className="w-[2px] h-[2px] rounded-full bg-red-400 animate-[bounce_0.8s_infinite_400ms] shadow-[0_0_4px_#f87171]" />
              <span className="w-[2px] h-[2px] rounded-full bg-amber-400 animate-[bounce_0.8s_infinite_500ms] shadow-[0_0_4px_#fbbf24]" />
            </div>
          </div>
</span>
        <div className="flex items-center gap-1 font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 backdrop-blur-md">
          <Clock className="w-2.5 h-2.5 text-slate-500" />
          {/* Static ref node container bypasses all virtual-DOM reconciliations */}
          <span ref={timerRef} className="tabular-nums">00:00:00</span>
        </div>
      </div>

      {/* Center Odds & KSh Area */}
      <div className="flex flex-col justify-center items-start my-1 z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] font-bold text-slate-500 tracking-tight">ODDS</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tighter leading-none flex items-baseline gap-0.5 select-none group/odds" style={{ contain: 'content' }}>
            <span className="text-[10px] sm:text-xs font-black text-orange-500/80 tracking-normal mr-0.5 transition-transform duration-300 group-hover/odds:-translate-y-0.5">@</span>
            <span className={`bg-gradient-to-r ${meta.brand.accent} drop-shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all duration-300 group-hover/odds:scale-[1.02] origin-left tabular-nums`}>
              {meta.odds.replace('@', '')}
            </span>
          </h2>

        </div>
        <p className="text-xs font-bold text-slate-300 font-mono tracking-wide mt-0.5">
          KSh {meta.price}
        </p>
      </div>

{tip.matches && tip.matches > 0 && (
  <p className="text-[8px] text-slate-400 font-medium text-center mb-0.5">
    {tip.matches} games
  </p>
)}
<div className="w-full z-10 mt-1">
        {!paid ? (
          <button 
            onClick={() => setPaid(true)} 
            className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black text-[10px] font-black tracking-widest flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(255,255,255,0.1)] transition-transform duration-100 active:scale-[0.98]"
          >
            <Lock className="w-3 h-3 text-black" />
            INSTANT ACCESS
          </button>
        ) : (
          <a 
            href={tip.secret_link || "#"} 
            className="w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-[10px] font-black tracking-widest flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(52,211,153,0.2)] transition-transform duration-100 active:scale-[0.98]"
          >
            <ShieldCheck className="w-3 h-3 text-black" />
            OPEN LINK
          </a>
        )}
      </div>
    </article>
  )
}
