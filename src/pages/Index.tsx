import { useNavigate } from 'react-router-dom';
import MainMenu from "@/components/MainMenu";
import { AuthProvider } from "@/hooks/useAuth";

export default function Index() {
  const navigate = useNavigate();

  const handleProfileOpen = () => {
    // Navigate to quizmenu first, then immediately open profile
    navigate('/quizmenu');
    // Use setTimeout to ensure navigation completes first
    setTimeout(() => {
      navigate('/profile/me', { state: { from: '/' } });
    }, 0);
  };

  return (
    <AuthProvider>
      <MainMenu
        onStart={() => navigate('/quizmenu')}
        onMultiplayerStart={() => navigate('/multiplayer')}
        onDailyChallengeStart={() => navigate('/quizmenu/combi-quiz?daily=true')}
        onStartQuiz={(mode) => {
          if (mode === 'combi-quiz') {
            navigate('/quizmenu/combi-quiz');
          } else if (mode === 'flag-archive') {
            navigate('/quizmenu/flag-archive');
          } else if (mode === 'world-knowledge') {
            navigate('/quizmenu/world-knowledge');
          } else {
            navigate(`/quizmenu/${mode}`);
          }
        }}
        onProfileOpen={handleProfileOpen}
      />
    </AuthProvider>
  );
}