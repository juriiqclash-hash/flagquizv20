import { useNavigate } from 'react-router-dom';
import Leaderboard from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LeaderboardPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Leaderboard />
    </div>
  );
}
