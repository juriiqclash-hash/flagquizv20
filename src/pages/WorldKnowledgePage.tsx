import { useNavigate, useSearchParams } from 'react-router-dom';
import DifficultySelector from '@/components/DifficultySelector';
import WorldKnowledgeQuiz from '@/components/WorldKnowledgeQuiz';
import { DifficultyLevel } from '@/data/worldKnowledge';

export default function WorldKnowledgePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') as DifficultyLevel | null;

  const handleSelectDifficulty = (diff: DifficultyLevel) => {
    setSearchParams({ difficulty: diff });
  };

  if (difficulty) {
    return (
      <WorldKnowledgeQuiz
        difficulty={difficulty}
        onBack={() => setSearchParams({})}
      />
    );
  }

  return (
    <DifficultySelector
      onSelectDifficulty={handleSelectDifficulty}
      onBack={() => navigate('/quizmenu')}
    />
  );
}
