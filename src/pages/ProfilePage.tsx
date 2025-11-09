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
  const { user, loading: authLoading } = useAuth();
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

  // Handle /profile/me - redirect to actual username or login
  useEffect(() => {
    const redirectToActualUsername = async () => {
      if (username === 'me') {
        // Wait for auth to finish loading
        if (authLoading) {
          return;
        }

        // If not logged in, redirect to login with return path
        if (!user) {
          navigate('/login?redirect=/profile/me', { replace: true });
          return;
        }

        // If logged in, load username and redirect
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();

          if (data?.username && !error) {
            navigate(`/profile/${data.username}`, { replace: true });
          } else {
            console.error('No username found for user');
            setLoading(false);
          }
        } catch (error) {
          console.error('Error loading username:', error);
          setLoading(false);
        }
      }
    };

    redirectToActualUsername();
  }, [username, user, authLoading, navigate]);

  // Load user ID from username
  useEffect(() => {
    const loadUserByUsername = async () => {
      if (!username || username === 'me') {
        return;
      }

      setLoading(true);
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

  // If viewing /profile/me (before redirect)
  if (username === 'me') {
    if (loading || authLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4 flex items-center justify-center">
          <p className="text-white">Lade Profil...</p>
        </div>
      );
    }

    // If auth loaded but no user and still on /profile/me, show error
    if (!authLoading && !user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Nicht angemeldet</h1>
            <p className="text-white/80 mb-4">Du musst angemeldet sein, um dein Profil zu sehen.</p>
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Zum Login
            </button>
          </div>
        </div>
      );
    }
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

    return <PublicProfileView userId={viewedUserId} username={username} onClose={handleClose} />;
  }

  return null;
}
