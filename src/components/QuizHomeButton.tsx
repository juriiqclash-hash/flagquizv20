import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface QuizHomeButtonProps {
  onNavigateHome: () => void;
}

const QuizHomeButton = ({ onNavigateHome }: QuizHomeButtonProps) => {
  return (
    <Button variant="outline" size="icon" onClick={onNavigateHome}>
      <Home className="h-5 w-5" />
    </Button>
  );
};

export default QuizHomeButton;
