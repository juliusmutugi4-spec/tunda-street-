"use client"
import { useState, useEffect, useMemo } from "react"
import { Lock, Clock, Flame, Layers, CircleDot } from "lucide-react"

const COMPANY_BRANDS: Record<string, {
  name: string,
  accent: string,
  accentBg: string
}> = {
  "SportPesa": { name: "SportPesa", accent: "text-[#FFA500]", accentBg: "bg-[#FFA500]" },
  "Betika": { name: "Betika", accent: "text-[#FDD700]", accentBg: "bg-[#FDD700]" },
  "Odibets": { name: "Odibets", accent: "text-white", accentBg: "bg-white" },
  "Betway Kenya": { name: "Betway Kenya", accent: "text-[#00A651]", accentBg: "bg-[#00A651]" },
  "1XBet Kenya": { name: "1XBet Kenya", accent: "text-white", accentBg: "bg-white" },
  "MozzartBet": { name: "MozzartBet", accent: "text-white", accentBg: "bg-white" },
  "22Bet": { name: "22Bet", accent: "text-[#FFD700]", accentBg: "bg-[#FFD700]" },
  "BangBet": { name: "BangBet", accent: "text-white", accentBg: "bg-white" },
  "MeridianBet": { name: "MeridianBet", accent: "text-[#FFD700]", accentBg: "bg-[#FFD700]" },
  "Lucky2U": { name: "Lucky2U", accent: "text-[#FFD700]", accentBg: "bg-[#FFD700]" },
  "BetLion": { name: "BetLion", accent: "text-black", accentBg: "bg-black" },
  "PremierBet": { name: "PremierBet", accent: "text-[#FFD700]", accentBg: "bg-[#FFD700]" }
}

interface TipData {
  readonly company?: string
  readonly seller_name?: string
  readonly created_at: string | number | Date
  readonly duration_hours?: number
  readonly expiry_hours?: number
  readonly price: number | string
  readonly odds: number | string
  readonly secret_link?: string
  readonly matches_count?: number
}

export default function BettingTipCard({ tip, onExpire }: { tip: TipData, onExpire?: () => void }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isPaid, setIsPaid] = useState<boolean>(false)

  const { expiresAt, displayPrice, displayOdds, company, accent, accentBg } = useMemo(() => {
    const duration = Number(tip.duration_hours?? tip.expiry_hours?? 24)
    const baseTime = tip.created_at? new Date(tip.created_at).getTime() : Date.now()
    const companyName = tip.company || tip.seller_name || 'SportPesa'
    const brand = COMPANY_BRANDS[companyName] || COMPANY_BRANDS["SportPesa"]
    return {
      expiresAt: baseTime + duration * 60 * 60 * 1000,
      displayPrice: Number(tip.price || 0),
      displayOdds: Number(tip.odds || 0).toFixed(2),
      company: brand.name,
      accent: brand.accent,
      accentBg: brand.accentBg
    }
  }, [tip])

  useEffect(() => {
    const calculateDelta = () => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    const initialDelta = calculateDelta()
    setTimeLeft(initialDelta)
    if (initialDelta <= 0) { onExpire?.(); return }

    // ADD HERE: Change 1000 to 5000 for 5s updates = faster
    const timerId = setInterval(() => {
      const remaining = calculateDelta()
      setTimeLeft(remaining)
      if (remaining <= 0) { clearInterval(timerId); onExpire?.() }
    }, 5000) // 5 seconds instead of 1 second
    return () => clearInterval(timerId)
  }, [expiresAt, onExpire])

  // ADD HERE: Skeleton loader while loading
  if (timeLeft === null) return (
    <div className="w-full max-w-[190px] h-[360px] rounded-lg bg-[#141821] p-2.5 animate-pulse">
      <div className="h-3 bg-white/10 rounded mb-3 w-16"></div>
      <div className="h-4 bg-white/10 rounded mb-2 w-20"></div>
      <div className="h-6 bg-white/10 rounded mb-3"></div>
      <div className="h-10 bg-white/10 rounded mb-3"></div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="h-8 bg-white/10 rounded"></div>
        <div className="h-8 bg-white/10 rounded"></div>
      </div>
      <div className="h-8 bg-white/20 rounded"></div>
    </div>
  )

  if (timeLeft <= 0) return null

  const hours = Math.floor(timeLeft / 3600).toString().padStart(2, '0')
  const mins = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')

  return (
    <article
      className="relative bg-[#141821] rounded-lg p-2.5 w-full max-w-[190px] h-[360px]"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="flex-col justify-between h-full" style={{ fontFamily: 'Courier New, monospace' }}>

        <div className="flex items-center gap-1.5 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>
          <CircleDot size={5} className="text-white fill-white" />
          <span className="text-white text- font-semibold truncate">{company}</span>
        </div>

        <div className="mb-3">
          <div className="text-white/30 text- uppercase mb-0.5">access<br/>fee</div>
          <div className="text-white font-bold text-lg">KSh {displayPrice}</div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-1 text-white/30 text- uppercase mb-1">
            <Clock size={8} />
            <span>closes in</span>
          </div>
          <div className="flex justify-center gap-1.5">
            <div className="text-center">
              <div className="text-xl font-black text-white">{hours}</div>
              <div className="text-[6px] text-white/30 uppercase">hr</div>
            </div>
            <span className="text-lg font-bold text-white/20">:</span>
            <div className="text-center">
              <div className={`text-xl font-black ${accent}`}>{mins}</div>
              <div className="text-[6px] text-white/30 uppercase">min</div>
            </div>
            <span className="text-lg font-bold text-white/20">:</span>
            <div className="text-center">
              <div className={`text-xl font-black ${accent}`}>{secs}</div>
              <div className="text-[6px] text-white/30 uppercase">sec</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center">
            <Flame size={10} className={accent} />
            <div className="text-[6px] text-white/30 uppercase mt-0.5">odds</div>
            <div className={`text- font-bold ${accent}`}>@{displayOdds}</div>
          </div>
          <div className="text-center">
            <Layers size={10} className={accent} />
            <div className="text-[6px] text-white/30 uppercase mt-0.5">picks</div>
            <div className={`text- font-bold ${accent}`}>{tip.matches_count || 1}</div>
          </div>
        </div>

        <div>
          {isPaid && tip.secret_link? (
            <a href={tip.secret_link} target="_blank" rel="noopener noreferrer"
              className={`w-full ${accentBg} ${accent.includes('white') || accent.includes('black')? 'text-black' : 'text-[#141821]'} font-black py-2 rounded-md uppercase text- tracking-wide flex items-center justify-center gap-1`}>
              <Lock size={10} />
              unlock slip
            </a>
          ) : (
<div className="w-full relative group/btn overflow-visible">
  {/* Hardware-accelerated background aura layer that amplifies your dynamic theme accent background */}
  <div className={`absolute -inset-[1px] ${accentBg} rounded-xl opacity-20 blur-sm group-hover/btn:opacity-40 transition-all duration-300 pointer-events-none`} />

  <button 
    onClick={() => setIsPaid(true)}
    type="button"
    className={`w-full ${accentBg} ${
      accent.includes('white') || accent.includes('black') ? 'text-black' : 'text-[#141821]'
    } font-sans font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 shadow-[0_4px_16px_rgba(0,0,0,0.4)] focus:outline-none cursor-pointer`}
  >
    {/* Clean horizontal scanning laser line overlay on hover */}
    <span className="absolute inset-0 w-full h-full bg-white/10 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite_linear]" style={{ transform: 'skewX(-20deg)' }} />

    <Lock size={12} className="flex-shrink-0 opacity-90 group-hover/btn:scale-110 transition-transform duration-200" />
    <span className="font-bold tracking-[0.25em]">Unlock Slip Node</span>
  </button>
</div>

          )}
        </div>
      </div>
    </article>
  )
}