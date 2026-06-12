'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return
console.log('SESSION USER:', session?.user?.id)
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: false })

console.log('NOTIFICATIONS ERROR:', error)
console.log('NOTIFICATIONS DATA:', data)

    setNotifications(data || [])
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-black mb-8">
          Notifications
        </h1>

        <div className="space-y-4">

          {notifications.length === 0 ? (
            <div className="text-zinc-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="
                  p-4
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950/60
                "
              >
                <p>{notification.message}</p>

                <p className="text-xs text-zinc-500 mt-2">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </p>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  )
}