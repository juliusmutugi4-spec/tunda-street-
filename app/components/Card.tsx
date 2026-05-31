"use client"
import { useState, useEffect, useMemo, useRef } from "react"
import { Lock, Clock, Sparkles, ShieldCheck } from "lucide-react"
import { createPortal } from "react-dom"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
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
  profile_photo?: string
  created_at: string | number | Date

  duration_hours?: number
  expiry_hours?: number

  price: number | string
  odds: number | string

  slip_link?: string

  match?: any
  matches?: number

  slip_details?: {
    home: string
    away: string
    odds: string
    tip: string
  }[]
}




export default function BettingTipCard({ tip }: { tip: TipData }) {
  const [profilePhoto, setProfilePhoto] = useState(
  tip.profile_photo || "/avatar.png"
)
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
  console.log("SLIP DETAILS JSON:", JSON.stringify(tip.slip_details, null, 2))
}, [tip])
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
  {tip.slip_details?.length ?? 0}M
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

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
<div>
  <h3 className="text-cyan-300 text-lg font-black">
    Premium Slip
  </h3>

  <p className="text-slate-500 text-xs">
    Match Analysis & Seller Profile
  </p>
</div>

        <button
          onClick={() => setShowMatches(false)}
          className="text-red-400 text-2xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* TWO COLUMNS */}
      <div className="
  grid
  grid-cols-1
  md:grid-cols-[2fr_1fr]
  h-[calc(100vh-70px)]
">

        {/* LEFT SIDE - MATCHES */}
        <div className="overflow-y-auto p-4 space-y-3">

          {tip.slip_details?.map((match, i) => (
            <div
              key={i}
              className="rounded-xl border border-cyan-500/20 bg-white/5 p-4"
            >
              <div className="flex justify-between">
                <span className="font-bold text-white">
                  {match.home}
                </span>

                <span className="text-cyan-400 text-xs">
                  VS
                </span>

                <span className="font-bold text-white">
                  {match.away}
                </span>
              </div>

              <div className="h-px bg-white/10 my-3" />

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Odds
                </span>

                <span className="text-green-400 font-black">
                  @{match.odds}
                </span>
              </div>

              <div className="flex justify-between mt-2">
                <span className="text-slate-400">
                  Prediction
                </span>

                <span className="text-cyan-300 font-black">
                  {paid ? match.tip : "🔒 Hidden"}
                </span>
              </div>
            </div>
          ))}

        </div>

        {/* RIGHT SIDE - PROFILE */}
<div className="
  border-l border-white/10
  bg-gradient-to-b
  from-cyan-950/20
  to-transparent
  p-6
">

  <div className="sticky top-0 flex flex-col items-center">

<div className="relative group">

 <img
  src={profilePhoto}
    alt="Tipster"
    className="
      w-28 h-28
      rounded-full
      border-2 border-cyan-500
      object-cover
      shadow-[0_0_25px_rgba(34,211,238,0.25)]
    "
  />
<input
  id={`profile-upload-${tip.id}`}
  type="file"
  accept="image/*"
  className="hidden"
onChange={async (e) => {
  const file = e.target.files?.[0]

  if (!file) return

  const fileName = `${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(fileName, file)

  if (uploadError) {
    console.error(uploadError)
    alert("Upload failed")
    return
  }

  const { data } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(fileName)

  const photoUrl = data.publicUrl

  setProfilePhoto(photoUrl)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from("betting_tips")
    .update({
      profile_photo: photoUrl
    })
    .eq("seller_name", user.email)
}}
/>


  {/* Online */}
  <div className="
    absolute bottom-2 right-2
    w-4 h-4
    rounded-full
    bg-green-500
    border-2 border-black
  " />

  {/* Upload Photo Button */}
<button
  onClick={() =>
    document
      .getElementById(`profile-upload-${tip.id}`)
      ?.click()
  }
  className="
    absolute
    -bottom-1
    -right-1
    w-8 h-8
    rounded-full
    bg-cyan-500
    text-black
    font-black
    text-lg
    shadow-lg
    hover:scale-110
    transition
    cursor-pointer
  "
>
  +
</button>
</div>

<h2 className="
  mt-4
  text-white
  font-black
  text-xl
  tracking-wide
">
  {tip.seller_name || "Verified Tipster"}
</h2>

<span className="mt-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
  ✓ VERIFIED TIPSTER
</span>

<div className="grid grid-cols-3 gap-2 w-full mt-4">

  <div className="bg-white/5 rounded-lg p-2 text-center">
    <p className="text-green-400 font-black text-lg">
  92%
</p>
    <p className="text-[10px] text-slate-400">Win Rate</p>
  </div>

  <div className="bg-white/5 rounded-lg p-2 text-center">
    <p className="text-cyan-400 font-black">124</p>
    <p className="text-[10px] text-slate-400">Tips</p>
  </div>

  <div className="bg-white/5 rounded-lg p-2 text-center">
    <p className="text-yellow-400 font-black">VIP</p>
    <p className="text-[10px] text-slate-400">Level</p>
  </div>

</div>

            <div className="mt-6 w-full space-y-3">

              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-400 text-xs">
                  Company
                </p>

                <p className="text-white font-bold">
                  {tip.company}
                </p>
              </div>

              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-400 text-xs">
                  Odds
                </p>

                <p className="text-green-400 font-bold">
                  @{tip.odds}
                </p>
              </div>

              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-slate-400 text-xs">
                  Price
                </p>

                <p className="text-yellow-400 font-bold">
                  KSh {tip.price}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>,
    document.body
  )}
  </>
)

}