'use client'

import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type TopNavProps = {
  user: any
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({
  user,
  onLogin,
  onLogout,
}: TopNavProps) {
  const router = useRouter()

  return (
    <header
  className="
    fixed
    top-0
    left-0
    right-0
    z-50
    bg-black/90
    backdrop-blur-xl
    border-b
    border-cyan-500/20
  "
>
      <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LOGO */}
{/* LOGO */}
<div
  onClick={() => router.push('/')}
  className="
    group
    relative
    cursor-pointer
    select-none
    transition-all
    duration-500
    hover:scale-105
    active:scale-95
  "
>
  {/* Ambient Glow */}
  <div
    className="
      absolute
      -inset-6
      rounded-full
      bg-cyan-500/20
      blur-2xl
      transition-all
      duration-500
      group-hover:bg-cyan-500/30
      group-hover:blur-3xl
    "
  />

  {/* Core Glow */}
  <div
    className="
      absolute
      -inset-1
      rounded-xl
      bg-gradient-to-r
      from-red-500/30
      via-cyan-500/30
      to-red-500/30
      opacity-0
      blur-md
      transition-opacity
      duration-500
      group-hover:opacity-100
    "
  />

  {/* Scan Line */}
  <div
    className="
      absolute
      top-0
      left-0
      h-[2px]
      w-full
      opacity-0
      group-hover:opacity-100
      transition-all
      duration-500
      bg-gradient-to-r
      from-transparent
      via-cyan-400
      to-transparent
    "
  />

  {/* Main Container */}
  <div
    className="
      relative
      px-4
      py-2
      md:px-6
      md:py-3
      rounded-xl
      border
      border-white/5
      bg-black/40
      backdrop-blur-xl
      shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]
      transition-all
      duration-500
      group-hover:border-cyan-500/30
      group-hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.15)]
    "
  >

    {/* Top Left Corner */}
    <div
      className="
        absolute
        top-0
        left-0
        h-2
        w-2
        border-t-2
        border-l-2
        border-cyan-400/40
        group-hover:border-cyan-400
      "
    />

    {/* Bottom Right Corner */}
    <div
      className="
        absolute
        bottom-0
        right-0
        h-2
        w-2
        border-b-2
        border-r-2
        border-red-500/40
        group-hover:border-red-500
      "
    />

    {/* Logo */}
    <h1
      className="
        relative
        text-3xl
        md:text-5xl
        font-black
        tracking-widest
        text-center
        transition-all
        duration-500
        group-hover:tracking-[0.25em]
      "
    >
      <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
        C
      </span>

<span className="group relative mx-4 inline-block font-black select-none tracking-tighter transition-all duration-75 ease-out hover:scale-125 hover:rotate-[1deg]">
  
  {/* Layer 1: The Event Horizon (Deep Sub-Atomic Gravitational Glow) */}
  <span className="absolute inset-0 select-none text-blue-900/80 blur-3xl mix-blend-color-dodge scale-150 transform transition-transform duration-700 group-hover:scale-[2.5]" />

  {/* Layer 2: Cyberpunk Glitch Shadow (Left Red Channel Bleed) */}
  <span className="absolute inset-0 -translate-x-[4px] select-none text-red-500 opacity-60 blur-[1px] mix-blend-screen transition-transform duration-300 group-hover:-translate-x-[8px] group-hover:skew-x-12">
    W
  </span>

  {/* Layer 3: Matrix Distortion (Right Emerald Channel Bleed) */}
  <span className="absolute inset-0 translate-x-[4px] select-none text-emerald-400 opacity-40 blur-[2px] mix-blend-screen transition-transform duration-300 group-hover:translate-x-[6px] group-hover:-skew-x-12">
    W
  </span>

  {/* Layer 4: Plasma Ignition (Vibrant Blue Photon Field) */}
  <span className="absolute inset-0 select-none text-blue-500 blur-xl mix-blend-screen drop-shadow-[0_0_40px_rgba(59,130,246,1)] transition-all duration-500 group-hover:blur-2xl group-hover:scale-110">
    W
  </span>

  {/* Layer 5: High-Frequency Energy Arcs (Sharp Neon Light Core) */}
  <span className="absolute inset-0 select-none text-cyan-300 blur-[3px] opacity-90 mix-blend-color-dodge transition-all duration-300 group-hover:scale-105 group-hover:text-white">
    W
  </span>

  {/* Layer 6: Future Chrome Vector Outer Outline */}
  <span 
    className="absolute inset-0 select-none bg-gradient-to-b from-white via-cyan-300 to-blue-600 bg-clip-text text-transparent opacity-40 transition-all duration-500 group-hover:scale-105"
    style={{ WebkitTextStroke: '2px rgba(255,255,255,0.6)' }}
  >
    W
  </span>

  {/* Layer 7: The Master Liquid Core (Premium Gradient & Light Trap) */}
  <span className="
    relative
    block
    bg-gradient-to-b
    from-white
    via-blue-100
    to-blue-900
    bg-clip-text
    text-transparent
    drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]
    [text-shadow:0_0_60px_rgba(37,99,235,0.6),_0_0_20px_rgba(6,182,212,0.8)]
  ">
    W
  </span>

  {/* Layer 8: Specular Lens Flare Overlay */}
  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-clip-text text-transparent opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-pulse">
    W
  </span>
</span>


      <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
        V
      </span>
    </h1>

    {/* System Text */}
    <div
      className="
        hidden
        md:flex
        mt-1
        items-center
        justify-between
        text-[8px]
        font-mono
        tracking-[0.3em]
        text-cyan-400/40
        group-hover:text-cyan-400/80
      "
    >
      <span>SYS.OP</span>

      <span
        className="
          h-1
          w-1
          rounded-full
          bg-red-500
          animate-pulse
        "
      />

      <span>V.4.02</span>
    </div>

  </div>
</div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-6">

          <button
            onClick={() => router.push('/videos')}
            className="
              text-sm
              font-semibold
              text-zinc-300
              hover:text-white
              transition
            "
          >
            Videos
          </button>

          {user ? (
            <>
              <button
                onClick={() =>
                  router.push('/notifications')
                }
                className="
                  text-zinc-300
                  hover:text-white
                  transition
                "
              >
                <Bell size={22} />
              </button>

              <button
                onClick={onLogout}
                className="
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-red-400
                  border
                  border-zinc-700
                  rounded-lg
                  hover:bg-red-900/20
                  transition
                "
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="
                px-4
                py-2
                text-sm
                font-bold
                text-white
                rounded-lg
                bg-gradient-to-r
                from-red-600
                to-red-700
                hover:from-red-500
                hover:to-red-600
                transition
              "
            >
              Login
            </button>
          )}

        </div>
      </div>
    </header>
  )
}