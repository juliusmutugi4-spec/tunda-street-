'use client'
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ImagePlus, Video, Send, Loader2, Sparkles } from 'lucide-react'

interface CreatePostProps {
  userId: string
  onPosted: () => void
}

export default function CreatePost({ userId, onPosted }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePost = async () => {
    if (!content.trim()) return
    setUploading(true)

    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) throw new Error('Not logged in')

      let videoUrl = null

      // Upload video if exists
      if (video) {
        const fileExt = video.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
         .from('videos')
         .upload(fileName, video)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('videos').getPublicUrl(fileName)
        videoUrl = data.publicUrl
      }

      // Get username from auth metadata or email
      const username = user.user_metadata?.name || user.user_metadata?.username || user.email?.split('@')[0]

      // Insert post with username
      const { error: insertError } = await supabase.from('posts').insert({
        content: content,
        user_id: user.id,
        username: username,
        video_url: videoUrl
      })

      if (insertError) throw insertError

      // Reset form
      setContent('')
      setVideo(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh feed
      onPosted()

    } catch (error) {
      console.error('Error posting:', error)
      alert('Failed to post. Try again.')
    } finally {
      setUploading(false)
    }
  }
return (
  <div className="group relative overflow-hidden rounded-xl border border-zinc-900 bg-[#09090b]/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-zinc-800">
    {/* Futuristic Background Matrix Gradients - Green and Fading Red */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none animate-pulse" />
    <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />

    <div className="relative p-5 z-10">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 font-mono font-black text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          C
        </div>
        <div>
          <h3 className="font-bold text-zinc-100 text-sm tracking-wide uppercase">Create Transmission</h3>
          <p className="text-xs text-zinc-500 font-mono tracking-tight mt-0.5">Broadcast to the cWV cluster matrix</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-zinc-900/40 border border-zinc-800/60 px-2.5 py-1 rounded-full backdrop-blur-md">
          <Sparkles size={12} className="text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400">LIVE_NODE</span>
        </div>
      </div>

      {/* Text Area Content Module */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 transition-all duration-300 focus-within:border-emerald-500/30 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.02)]">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Initialize terminal signal output..."
          maxLength={500}
          className="w-full resize-none bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-700 placeholder:font-mono placeholder:tracking-wide leading-relaxed selection:bg-emerald-500/30"
        />
      </div>

      {/* Video Preview Matrix */}
      {video && (
        <div className="mt-4 rounded-xl border border-red-950/40 bg-red-950/5 p-4 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <Video size={16} className="text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-mono font-semibold text-zinc-300">{video.name}</p>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={() => {
                setVideo(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-xs font-mono font-bold tracking-wider uppercase text-red-500 hover:text-red-400 transition-colors duration-200"
            >
              [purge]
            </button>
          </div>
        </div>
      )}

      {/* Bottom Actions Interface */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-5 py-2.5 text-xs font-bold tracking-wide uppercase text-zinc-400 transition-all duration-300 hover:bg-zinc-900 hover:text-zinc-200 hover:border-zinc-700 active:scale-95">
          <ImagePlus size={14} className="text-zinc-500" />
          <span>Attach Payload</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
        </label>

        <button
          onClick={handlePost}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-[0_0_25px_rgba(220,38,38,0.15)] hover:shadow-[0_0_35px_rgba(220,38,38,0.35)] hover:from-red-500 hover:to-red-600 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin text-white" />
              <span>Broadcasting...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>Transmit to cWV</span>
            </>
          )}
        </button>
      </div>

      {/* Character Terminal Matrix Tracker */}
      <div className="mt-3 text-right">
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-600">{content.length} / 500 PKTS</span>
      </div>
    </div>
  </div>
)
}