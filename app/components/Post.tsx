'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PostProps {
  post: any
  user: any
}

export default function Post({ post, user }: PostProps) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    loadPostData()
  }, [post.id, user])

  const loadPostData = async () => {
    try {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)

      setLikes(count || 0)

      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle()

        setLiked(!!data)
      }

const { data: commentsData } = await supabase
  .from('comments')
  .select('*')
  .eq('post_id', post.id)
  .order('created_at', { ascending: false })

      setComments(commentsData || [])
    } catch (error) {
      console.error(error)
    }
  }

  const toggleLike = async () => {
    if (!user) {
      alert('Login first')
      return
    }

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)

        setLiked(false)
        setLikes((prev) => Math.max(0, prev - 1))
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          })

        setLiked(true)
        setLikes((prev) => prev + 1)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const addComment = async () => {
    if (!commentText.trim()) return

    if (!user) {
      alert('Login first')
      return
    }

    try {
const { data, error } = await supabase
  .from('comments')
  .insert({
    post_id: post.id,
    user_id: user.id,
    content: commentText,
    username: user.user_metadata?.username || 'Anonymous'
  })
  .select()
  .single()

 if (error) {
  console.log('COMMENT ERROR:', error)
  console.log('MESSAGE:', error.message)
  console.log('DETAILS:', error.details)
  console.log('HINT:', error.hint)

  alert(error.message)
  return
}

      if (data) {
        setComments((prev) => [data, ...prev])
        setCommentText('')
      }
    }
    
catch (error: any) {
  console.log('CATCH ERROR:', error)
  alert(error?.message || 'Unknown error')
}
  }
return (
  <div className="group relative bg-[#09090b]/40 border border-zinc-900 overflow-hidden rounded-xl p-4 transition-all duration-300 hover:border-zinc-800 hover:shadow-2xl hover:shadow-black/60">
    {/* Tech Ambient Interface Highlights */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/20 transition-all duration-500" />
    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/10 transition-all duration-500" />

    {/* Header */}
    <div className="flex items-center gap-3 mb-4 relative z-10">
      <div className="relative group/avatar">
        <img
          src="https://i.pravatar.cc/100"
          alt="avatar"
          className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-800 transition-all duration-300 group-hover/avatar:ring-emerald-500/30"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
      </div>

      <div>
        <p className="font-bold text-sm tracking-wide text-zinc-100 transition-colors duration-200 hover:text-emerald-400 cursor-pointer">
          {post.username || 'ANONYMOUS_NODE'}
        </p>
        <p className="text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase mt-0.5">
          {new Date(post.created_at).toLocaleString()}
        </p>
      </div>
    </div>

    {/* Content */}
    {post.content && (
      <p className="text-sm leading-relaxed text-zinc-300 mb-4 whitespace-pre-wrap selection:bg-emerald-500/30 relative z-10">
        {post.content}
      </p>
    )}

    {/* Video Container */}
    {post.video_url && (
      <div className="relative rounded-xl border border-zinc-900 bg-black/40 overflow-hidden mb-4 max-h-[500px] group/video shadow-inner">
        <video
          src={post.video_url}
          controls
          className="w-full h-full object-contain mix-blend-screen opacity-90 transition-opacity duration-300 group-hover/video:opacity-100"
        />
      </div>
    )}

    {/* Actions Interface */}
    <div className="flex items-center gap-3 border-y border-zinc-900/60 py-2.5 my-4 relative z-10">
      <button
        onClick={toggleLike}
        className={`group/btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 flex items-center gap-2 border ${
          liked
            ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/40 hover:bg-red-950/10'
        }`}
      >
        <span className={`text-sm transition-transform duration-300 ${liked ? 'scale-110' : 'group-hover/btn:scale-110 group-hover/btn:rotate-12'}`}>
          {liked ? '❤️' : '🤍'}
        </span> 
        <span>{likes} REAX</span>
      </button>
    </div>

    {/* Comment Stream Area */}
    <div className="space-y-3 relative z-10">
      {/* Input Module */}
      {user && (
        <div className="flex gap-2 group/input">
          <input
            type="text"
            placeholder="Initialize response terminal..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-zinc-950/60 border border-zinc-900 rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 placeholder:text-zinc-600 placeholder:font-mono placeholder:tracking-wide focus:outline-none focus:border-emerald-500/40 focus:bg-zinc-950 transition-all duration-300 focus:shadow-[0_0_15px_rgba(16,185,129,0.03)]"
          />

          <button
            onClick={addComment}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 rounded-lg text-xs font-black tracking-widest uppercase text-white transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.15)] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
          >
            Transmit
          </button>
        </div>
      )}

      {/* Embedded Comments Display */}
      {comments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-900/30 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="group/item flex gap-2 relative bg-zinc-950/20 border border-transparent hover:border-zinc-900/40 hover:bg-zinc-950/40 rounded-lg p-2.5 transition-all duration-200"
            >
              <div className="absolute top-2 left-0 w-[2px] h-3 bg-zinc-800 group-hover/item:bg-emerald-500/40 transition-colors duration-300" />
              <div className="flex-1 pl-1">
                <p className="font-bold text-xs text-zinc-300 tracking-wide transition-colors duration-200 group-hover/item:text-zinc-200">
                  {comment.username || 'ANONYMOUS_NODE'}
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed selection:bg-emerald-500/20">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)
}