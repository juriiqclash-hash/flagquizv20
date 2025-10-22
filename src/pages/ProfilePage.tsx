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
    const [viewedUserId, setViewedUserId] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
      const fetchUserByUsername = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('username', username)
            .single();

          if (error || !data) {
            console.error('User not found:', error);
            setViewedUserId(null);
          } else {
            setViewedUserId(data.user_id);
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setViewedUserId(null);
        } finally {
          setLoadingUser(false);
        }
      };

      fetchUserByUsername();
    }, [username]);

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
          {loadingUser ? (
            <div className="text-white text-center">Lädt...</div>
          ) : viewedUserId ? (
            <PublicProfileView 
              userId={viewedUserId}
              onClose={handleClose}
            />
          ) : (
            <div className="text-white text-center">Benutzer nicht gefunden</div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
