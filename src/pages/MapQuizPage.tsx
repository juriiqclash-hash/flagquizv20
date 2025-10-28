import { useNavigate } from 'react-router-dom';
import MapQuiz from '@/components/MapQuiz';

export default function MapQuizPage() {
  const navigate = useNavigate();

  return <MapQuiz onBack={() => navigate('/quizmenu')} />;
}
