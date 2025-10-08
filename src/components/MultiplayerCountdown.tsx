import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MultiplayerCountdownProps {
  onCountdownEnd: () => void;
}

export default function MultiplayerCountdown({ onCountdownEnd }: MultiplayerCountdownProps) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count === 0) {
      onCountdownEnd();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onCountdownEnd]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-16 pb-16 text-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Get Ready!</h2>
            <p className="text-muted-foreground">Das Spiel startet in...</p>
          </div>
          
          <div className="text-8xl font-bold text-primary mb-8 animate-pulse">
            {count}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {count === 5 && "Bereite dich vor!"}
            {count === 4 && "Gleich geht's los!"}
            {count === 3 && "Noch 3..."}
            {count === 2 && "Noch 2..."}
            {count === 1 && "Fast da!"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}