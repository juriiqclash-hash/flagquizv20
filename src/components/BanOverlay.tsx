import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import BannedScreen from './BannedScreen'

// Fullscreen, non-dismissible overlay that appears when the current user is banned
export default function BanOverlay() {
  const { user } = useAuth()
  const [isBanned, setIsBanned] = useState(false)
  const [banInfo, setBanInfo] = useState<{ reason?: string; bannedAt?: string }>({})
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Listen to auth state changes to close overlay on logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsBanned(false)
        setBanInfo({})
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {

    const fetchStatus = async () => {
      if (!user) {
        // Wenn kein Benutzer vorhanden ist, Overlay sofort schließen
        setIsBanned(false)
        setBanInfo({})
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
        return
      }

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
      channelRef.current = supabase
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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user])

  if (!isBanned) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      <BannedScreen 
        banReason={banInfo.reason} 
        bannedAt={banInfo.bannedAt} 
        onBack={() => setIsBanned(false)}
      />
    </div>
  )
}
