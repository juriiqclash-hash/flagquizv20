import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ProfileView } from '@/components/ProfileView';
import { PublicProfileView } from '@/components/PublicProfileView';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    const from = (location.state as any)?.from;
    if (from === 'mainmenu') {
      navigate('/');
    } else {
      navigate('/quizmenu');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      const from = (location.state as any)?.from;
      if (from === 'mainmenu') {
        navigate('/');
      } else {
        navigate('/quizmenu');
      }
    }
  };

  // Redirect /profile to /profile/me - only once on mount
  useEffect(() => {
    if (!username) {
      navigate('/profile/me', { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load user ID from username
  useEffect(() => {
    const loadUserByUsername = async () => {
      if (!username || username === 'me') {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('username', username)
          .maybeSingle();

        if (error) {
          console.error('Error loading user:', error);
          setViewedUserId(null);
        } else {
          setViewedUserId(data?.user_id || null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setViewedUserId(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserByUsername();
  }, [username]);

  // If viewing /profile/me
  if (username === 'me') {
    return <ProfileView open={true} onOpenChange={handleOpenChange} />;
  }

  // If viewing another user's profile by username
  if (username) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4 flex items-center justify-center">
          <p className="text-white">Lade Profil...</p>
        </div>
      );
    }

    if (!viewedUserId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Benutzer nicht gefunden</h1>
            <p className="text-white/80">Der Benutzer "{username}" existiert nicht.</p>
          </div>
        </div>
      );
    }

    return <PublicProfileView userId={viewedUserId} onClose={handleClose} />;
  }

  return null;
}
