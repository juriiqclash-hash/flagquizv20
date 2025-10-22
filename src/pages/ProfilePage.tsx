import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProfileView } from '@/components/ProfileView';
import { PublicProfileView } from '@/components/PublicProfileView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [open, setOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    navigate('/');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      navigate('/');
    }
    setOpen(newOpen);
  };

  // Redirect /profile to /profile/me
  useEffect(() => {
    if (!username) {
      navigate('/profile/me', { replace: true });
    }
  }, [username, navigate]);

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
          .single();

        if (error) {
          console.error('Error loading user:', error);
          setUserId(null);
        } else {
          setUserId(data?.user_id || null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserByUsername();
  }, [username]);

  // If viewing /profile/me
  if (username === 'me') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Hauptmenü
          </Button>
          <ProfileView open={open} onOpenChange={handleOpenChange} />
        </div>
      </div>
    );
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

    if (!userId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <div className="text-center text-white mt-20">
              <h1 className="text-2xl font-bold mb-4">Benutzer nicht gefunden</h1>
              <p className="text-white/80">Der Benutzer "{username}" existiert nicht.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <PublicProfileView 
            userId={userId}
            onClose={handleClose}
          />
        </div>
      </div>
    );
  }

  return null;
}
