import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QuizGame from '@/components/QuizGame';

export default function QuizPage() {
  const navigate = useNavigate();
  const { quizname } = useParams<{ quizname: string }>();
  const [searchParams] = useSearchParams();

  const continent = searchParams.get('continent') || undefined;
  const timeLimit = searchParams.get('time') ? parseInt(searchParams.get('time')!) : undefined;

  if (!quizname) {
    navigate('/quizmenu');
    return null;
  }

  return (
    <QuizGame
      mode={quizname as any}
      onBackToStart={() => navigate('/quizmenu')}
      continent={continent}
      timeLimit={timeLimit}
    />
  );
}
