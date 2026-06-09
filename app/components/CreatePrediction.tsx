'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CreatePrediction({
  userId,
  username,
  avatarUrl,
  onCreated,
}: any) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
const createPrediction = async () => {
  if (!title.trim()) return

  const { error } = await supabase
    .from('predictions')
    .insert({
      title,
      target_date: date || null,
      user_id: userId,
      username,
      avatar_url: avatarUrl,
    })

  if (error) {
    alert(error.message)
    return
  }

  setTitle('')
  setDate('')

  onCreated()
}
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#05070b] p-4">
      <h3 className="mb-3 text-cyan-400 font-bold">
        Prediction Engine
      </h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Predict the future..."
        className="w-full mb-3 rounded bg-zinc-900 p-3"
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full mb-3 rounded bg-zinc-900 p-3"
      />

<button
  onClick={createPrediction}
  className="w-full rounded bg-cyan-500 p-3 font-bold"
>
  Create Prediction
</button>
    </div>
  )
}