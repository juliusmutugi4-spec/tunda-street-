"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { Lock, Clock, Sparkles, ShieldCheck } from "lucide-react"
import { createPortal } from "react-dom"
// ATOMIC CONSTANTS: Pre-compiled styling classes to save CPU cycles from string concatenation during map loops
const BRAND_STYLES = {
  SportPesa: {
    accent:
      "bg-gradient-to-r from-orange-400 via-red-400 to-amber-300 text-transparent bg-clip-text",
    glow:
      "shadow-[0_0_25px_rgba(251,146,60,0.2)]",
    border:
      "border-orange-500/30 hover:border-orange-400/60"
  },

  Betika: {
    accent:
      "bg-gradient-to-r from-yellow-300 via-lime-300 to-green-400 text-transparent bg-clip-text",
    glow:
      "shadow-[0_0_25px_rgba(234,179,8,0.2)]",
    border:
      "border-yellow-400/30 hover:border-yellow-300/60"
  },

  Betway: {
    accent:
      "bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 text-transparent bg-clip-text",
    glow:
      "shadow-[0_0_25px_rgba(16,185,129,0.2)]",
    border:
      "border-emerald-400/30 hover:border-cyan-400/60"
  },

  default: {
    accent:
      "bg-gradient-to-r from-white via-slate-300 to-slate-500 text-transparent bg-clip-text",
    glow:
      "shadow-[0_0_20px_rgba(255,255,255,0.08)]",
    border:
      "border-white/15 hover:border-white/30"
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
  slip_link?: string
  matches?: number

  match_list?: {
    home: string
    away: string
  }[]
}

export default function BettingTipCard({ tip }: { tip: TipData }) {
  const [paid, setPaid] = useState(false)
  const timerRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
const [showMatches, setShowMatches] = useState(false)
  // Memoize everything to avoid recalculating mathematical operations on parent state updates
  const meta = useMemo(() => {
    const duration = Number(tip.duration_hours?? tip.expiry_hours?? 24)
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
useEffect(() => {
  console.log("created_at:", tip.created_at)
  console.log("start:", new Date(tip.created_at).getTime())
  console.log("expires:", meta.expiresAt)
}, [])
useEffect(() => {
  console.log(tip)
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
      timerNode.textContent = `${h < 10? '0' + h : h}:${m < 10? '0' + m : m}:${s < 10? '0' + s : s}`
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
    <>
    <article
      ref={cardRef}
      className={`relative w-full h-32 rounded-xl bg-[radial-gradient(circle_at_top_left,#172554_0%,#0f172a_35%,#020617_100%)]
backdrop-blur-xl border p-2.5 flex-col justify-between group overflow-hidden ${meta.brand.border} ${meta.brand.glow}`}
      style={{
        contain: 'layout paint style size', // STRICT LAYER CONTAINER SANDBOX
        transform: 'translateZ(0)', // ALL ANIMATIONS SHIFTED TO HARDWARE GPU GRID
        willChange: 'transform'
      }}
    >
      {/* Structural Sci-Fi Grid Filter Line Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:18px_18px]
opacity-30 pointer-events-none" />

{/* Company + Timer */}
<div className="absolute top-0 left-0 z-20 flex flex-col">
  {/* Company Name */}
<span
  className={`
    px-2
    py-1
    text-[10px]
    font-black
    uppercase
    tracking-[0.18em]
    ${meta.brand.accent}
  `}
>
  {tip.company || tip.seller_name || "Premium Tip"}
</span>

  {/* Timer */}
<div className="flex items-center gap-1 px-2">
  <Clock className="w-3 h-3 text-cyan-400" />

  <span
    ref={timerRef}
    className="
      tabular-nums
      text-[10px]
      font-bold
      text-cyan-300
    "
  >
    00:00:00
  </span>
</div>
</div>

      {/* Center Odds & KSh Area */}
      <div className="flex flex-col items-start z-9 mt-8">
        <div className="flex items-baseline gap-1">
          <span
  className="
  text-[12px]
  font-black
  uppercase
  tracking-[0.25em]
  text-slate-400
  "
>
  ODDS
</span>
          <h2 className="text-[20px] leading-none tracking-[-0.08em]  font-black tracking-tighter leading-none flex items-baseline gap-0.5 select-none group/odds" style={{ contain: 'content' }}>
            <span className="text-[8px] sm:text-xs font-black text-orange-500/80 tracking-normal mr-0.5 transition-transform duration-300 group-hover/odds:-translate-y-0.5">@</span>
            <span className={`bg-gradient-to-r ${meta.brand.accent} drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-300 group-hover/odds:scale-[1.02] origin-left tabular-nums`}>
              {meta.odds.replace('@', '')}
            </span>
          </h2>
        </div>
<div className="flex items-center justify-between w-full mt-1">
  <p className="text-xs font-bold text-slate-300 font-mono tracking-wide">
    KSh {meta.price}
  </p>

<div className="ml-auto flex-shrink-0">
  <button
    onClick={() => setShowMatches(true)}
    className="
      ml-auto mr-1
      px-2 py-0.5
      text-[10px]
      font-black
      rounded-md
      bg-cyan-500/10
      text-cyan-300
      border border-cyan-500/20
      hover:bg-cyan-500/20
      transition
      cursor-pointer
    "
  >
    {tip.matches ?? 0}M
  </button>
</div>
</div>
      </div>



      <div className="w-full z-10 mt-1">
        {!paid? (
          <button
            onClick={() => setPaid(true)}
            className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-black text-[8px] font-black tracking-widest flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(255,255,255,0.1)] transition-transform duration-100 active:scale-[0.98]"
          >
            <Lock className="w-3 h-3 text-black" />
            INSTANT ACCESS
          </button>
        ) : (
          <button
            onClick={() => {
              console.log('SLIP LINK:', tip.slip_link)
              if (tip.slip_link && String(tip.slip_link)!== '#') {
                window.open(String(tip.slip_link), '_blank', 'noopener,noreferrer')
              } else {
                alert('No slip link for this tip')
              }
            }}
            disabled={!tip.slip_link}
            className={`w-full py-1.5 rounded-lg text-black text-[8px] font-black tracking-widest flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(52,211,153,0.2)] transition-transform duration-100 active:scale-[0.98] ${
              tip.slip_link
               ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 cursor-pointer'
                : 'bg-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-black" />
            OPEN LINK
          </button>
        )}
      </div>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />
<div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />

    </article>
    {showMatches &&
      createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-cyan-300 font-bold text-lg">
              Matches ({tip.matches ?? 0})
            </h3>

            <button
              onClick={() => setShowMatches(false)}
              className="text-red-400 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-70px)]">
            {tip.match_list?.map((match, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-white font-bold">
                  {match.home}
                </div>

                <div className="text-center text-cyan-400 py-2">
                  VS
                </div>

                <div className="text-white font-bold">
                  {match.away}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
  </>
)

}