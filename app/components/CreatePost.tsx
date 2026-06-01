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
    if (!content.trim() &&!video) {
      alert('Create a post or upload a video')
      return
    }

    try {
      setUploading(true)
      let videoUrl: string | null = null

      if (video) {
        // File size check - Supabase free tier limit
        if (video.size > 50 * 1024 * 1024) {
          alert('Video must be under 50MB')
          setUploading(false)
          return
        }

        // Sanitize filename - remove spaces/special chars
        const fileExt = video.name.split('.').pop()
        const cleanName = video.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const fileName = `${userId}/${Date.now()}-${cleanName}`

        console.log('Uploading to bucket: posts-media, file:', fileName)

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
         .from('posts-media') // Must match bucket name in Supabase exactly
         .upload(fileName, video)

        if (uploadError) {
          console.error('UPLOAD ERROR:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL - fixed destructuring
        const { data } = supabase.storage
         .from('posts-media')
         .getPublicUrl(fileName)

        videoUrl = data.publicUrl
        console.log('Video URL:', videoUrl)
      }

      // Insert post
      const { error: insertError } = await supabase
       .from('posts')
       .insert({
          user_id: userId,
          content: content.trim(),
          video_url: videoUrl,
        })

      if (insertError) {
        console.error('INSERT ERROR:', insertError)
        throw new Error(`Post failed: ${insertError.message}`)
      }

      // Reset form
      setContent('')
      setVideo(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onPosted()
      alert('Posted successfully!')

    } catch (error: any) {
      console.error('POST ERROR:', error)
      console.error('Error code:', error.code)
      alert(error.message || 'Failed to create post. Check console F12 for details.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-black text-white">
            C
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Create Post</h3>
            <p className="text-sm text-gray-400">Share with the cWV community</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-cyan-400">
            <Sparkles size={18} />
            <span className="text-xs font-semibold">LIVE</span>
          </div>
        </div>

        {/* Text Area */}
        <div className="rounded-2xl border-white/10 bg-black/20 p-4">
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening today?"
            maxLength={500}
            className="w-full resize-none bg-transparent text-lg text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Video Preview */}
        {video && (
          <div className="mt-4 rounded-2xl border-cyan-500/20 bg-black/30 p-4">
            <div className="flex items-center gap-3">
              <Video size={20} className="text-cyan-400" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-white">{video.name}</p>
                <p className="text-xs text-gray-400">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => { setVideo(null); if(fileInputRef.current) fileInputRef.current.value = '' }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-5 flex-col gap-3 sm:flex-row">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
            <ImagePlus size={18} />
            <span>Upload Video</span>
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
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={18} />
                Post to cWV
              </>
            )}
          </button>
        </div>

        {/* Character Count */}
        <div className="mt-3 text-right">
          <span className="text-xs text-gray-500">{content.length}/500</span>
        </div>
      </div>
    </div>
  )
}