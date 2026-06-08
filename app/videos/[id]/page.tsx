'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function WatchVideo() {
  const params = useParams()
  const [video, setVideo] = useState<any>(null)

  useEffect(() => {
    loadVideo()
  }, [])

const loadVideo = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return

  setVideo(data)

  await supabase
    .from('videos')
    .update({
      views: (data.views || 0) + 1,
    })
    .eq('id', data.id)
}

  if (!video) return <div>Loading...</div>

  return (
    <main className="min-h-screen bg-black text-white">
      <video
        src={video.video_url}
        controls
        autoPlay
        className="w-full max-h-[80vh]"
      />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold">
          {video.title}
        </h1>

        <p className="text-zinc-400 mt-4">
          {video.description}
        </p>
      </div>
    </main>
  )
}