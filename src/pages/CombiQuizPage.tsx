import { useNavigate, useSearchParams } from 'react-router-dom';
import CombiQuiz from '@/components/CombiQuiz';

export default function CombiQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDailyChallenge = searchParams.get('daily') === 'true';

  return (
    <CombiQuiz
      onBackToStart={() => navigate(isDailyChallenge ? '/' : '/quizmenu')}
      isDailyChallenge={isDailyChallenge}
      maxQuestions={isDailyChallenge ? 10 : undefined}
    />
  );
}
