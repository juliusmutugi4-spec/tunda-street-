'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'


export default function VideosPage() {
const router = useRouter()
const [videos, setVideos] = useState<any[]>([])
const [featured, setFeatured] = useState<any>(null)
const [loading, setLoading] = useState(true)


useEffect(() => {
  fetchVideos()
}, [])

const fetchVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

if (error) {
  console.log('SUPABASE ERROR:', error)
  alert(JSON.stringify(error))
  return
}

  setVideos(data || [])

const featuredMovie =
  data?.find((v) => v.featured)

setFeatured(featuredMovie)
  setLoading(false)
}

if (loading) {
  return (
    <main className="min-h-screen bg-[#060608] text-white flex items-center justify-center">
      Loading videos...
    </main>
  )
}


  return (

    <main className="min-h-screen bg-[#060608] text-white p-6">

      <h1 className="text-4xl font-bold mb-8">
        Videos
      </h1>

{featured && (
  <div
    className="
      relative
      h-[500px]
      rounded-3xl
      overflow-hidden
      mb-10
      border
      border-zinc-800
    "
  >
    <img
      src={featured.thumbnail_url}
      className="
        absolute
        inset-0
        w-full
        h-full
        object-cover
      "
    />

    <div
      className="
        absolute
        inset-0
        bg-gradient-to-r
        from-black
        via-black/70
        to-transparent
      "
    />

    <div className="relative z-10 p-10 max-w-2xl">

      <p className="text-red-500 font-bold">
        FEATURED MOVIE
      </p>

      <h1 className="text-6xl font-black mt-3">
        {featured.title}
      </h1>

      <p className="text-zinc-300 mt-6">
        {featured.description}
      </p>

      <button
        className="
          mt-8
          px-8
          py-4
          bg-red-600
          rounded-xl
          font-bold
        "
      >
        ▶ Watch Now
      </button>

    </div>
  </div>
)}


<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  {videos.map((video) => (
<div
  key={video.id}
  onClick={() => router.push(`/videos/${video.id}`)}
  className="bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition"
>

<video
  src={video.video_url}
  poster={video.thumbnail_url}
  className="w-full h-48 object-cover"
  muted
  preload="metadata"
/>

      <div className="p-4">

        <h2 className="font-semibold">
          {video.title}
        </h2>

        <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
          {video.description}
        </p>

      </div>

    </div>
  ))}

</div>

    </main>
  )
}