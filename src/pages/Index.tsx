import { useNavigate } from 'react-router-dom';
import MainMenu from "@/components/MainMenu";
import { AuthProvider } from "@/hooks/useAuth";

export default function Index() {
  const navigate = useNavigate();

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
        onProfileOpen={() => navigate('/quizmenu?openProfile=true')}
      />
    </AuthProvider>
  );
}