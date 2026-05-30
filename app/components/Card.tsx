"use client"
import { useState, useEffect, useMemo } from "react"
import { Lock, Clock, Flame, Layers, CircleDot } from "lucide-react"

const BRANDS: Record<string, { accent: string; glow: string }> = {
  SportPesa: { accent: "text-orange-400", glow: "shadow-orange-500/20" },
  Betika: { accent: "text-yellow-300", glow: "shadow-yellow-500/20" },
  Betway: { accent: "text-emerald-400", glow: "shadow-emerald-500/20" },
  default: { accent: "text-white", glow: "shadow-white/10" }
}

interface TipData {
  company?: string
  seller_name?: string
  created_at: string | number | Date
  duration_hours?: number
  expiry_hours?: number
  price: number | string
  odds: number | string
  secret_link?: string
  matches_count?: number
}

export default function BettingTipCard({ tip }: { tip: TipData }) {
  const [paid, setPaid] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const { expiresAt, odds, price, brand } = useMemo(() => {
    const duration = Number(tip.duration_hours?? tip.expiry_hours?? 24)
    const start = new Date(tip.created_at).getTime()
    const name = tip.company || tip.seller_name || "default"
    const b = BRANDS[name] || BRANDS.default
    return {
      expiresAt: start + duration * 3600000,
      odds: Number(tip.odds || 0).toFixed(2),
      price: Number(tip.price || 0),
      brand: b
    }
  }, [tip])

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setTimeLeft(diff)
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [expiresAt])

  if (timeLeft <= 0) return null
  const h = String(Math.floor(timeLeft / 3600)).padStart(2, "0")
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0")
  const s = String(timeLeft % 60).padStart(2, "0")

  return (
    <article className={`relative w-full rounded-lg bg-[#0a0f1a] border-white/10 overflow-hidden p-1.5 transition-all ${brand.glow}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-500/10" />

      {/* brand + live */}
      <div className="relative flex items-center justify-between text-[7px] text-white/60 mb-1">
        <div className="flex items-center gap-1 truncate">
          <CircleDot className={`w-2.5 h-2.5 ${brand.accent}`} />
          <span className="truncate font-medium">{tip.company || "Signal"}</span>
        </div>
        <span className="text-emerald-400 font-bold text-[6px]">LIVE</span>
      </div>

      {/* odds */}
      <div className="relative mb-1">
        <p className="text-[6px] text-white/40 uppercase">Odds</p>
        <p className={`text-lg font-black ${brand.accent} leading-none`}>@{odds}</p>
      </div>

      {/* price */}
      <div className="relative mb-1">
        <p className="text-[6px] text-white/40 uppercase">Access</p>
        <p className="text-xs font-bold text-white leading-none">KSh {price}</p>
      </div>

      {/* timer */}
      <div className="relative flex items-center justify-between text-[6px] text-white/50 mb-1">
        <div className="flex items-center gap-0.5">
          <Clock className="w-2.5 h-2.5" />
          <span>EXP</span>
        </div>
        <div className="font-mono text-white">{h}:{m}:{s}</div>
      </div>

      {/* bottom stats */}
      <div className="relative flex items-center justify-between text-[7px] text-white/50 mb-1.5">
        <div className="flex items-center gap-0.5">
          <Flame className={`w-2.5 h-2.5 ${brand.accent}`} />
          <span>{odds}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Layers className="w-2.5 h-2.5 text-white/40" />
          <span>{tip.matches_count || 1}</span>
        </div>
      </div>

      {/* button */}
      {!paid? (
        <button onClick={() => setPaid(true)} className="relative w-full py-1 rounded-md bg-white text-black text-[7px] font-bold flex items-center justify-center gap-1 hover:scale-[1.02]">
          <Lock className="w-2.5 h-2.5" />
          UNLOCK
        </button>
      ) : (
        <a href={tip.secret_link || "#"} className="w-full py-1 rounded-md bg-emerald-500 text-black text-[7px] font-bold text-center block">
          OPEN
        </a>
      )}
    </article>
  )
}