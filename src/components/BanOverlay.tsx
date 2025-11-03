import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import BannedScreen from './BannedScreen'

// Fullscreen, non-dismissible overlay that appears when the current user is banned
export default function BanOverlay() {
  const { user } = useAuth()
  const [isBanned, setIsBanned] = useState(false)
  const [banInfo, setBanInfo] = useState<{ reason?: string; bannedAt?: string }>({})

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const fetchStatus = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('banned, ban_reason, banned_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.banned) {
        setIsBanned(true)
        setBanInfo({ reason: data.ban_reason || undefined, bannedAt: data.banned_at || undefined })
      } else {
        setIsBanned(false)
        setBanInfo({})
      }

      // Realtime subscribe
      channel = supabase
        .channel('ban-overlay-profile-changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, (payload) => {
          const newData = payload.new as any
          if (newData.banned) {
            setIsBanned(true)
            setBanInfo({ reason: newData.ban_reason || undefined, bannedAt: newData.banned_at || undefined })
          } else {
            setIsBanned(false)
            setBanInfo({})
          }
        })
        .subscribe()
    }

    fetchStatus()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [user])

  if (!isBanned) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      <BannedScreen banReason={banInfo.reason} bannedAt={banInfo.bannedAt} />
    </div>
  )
}
