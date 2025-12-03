import { useState, useEffect } from 'react';
import { Skull, AlertTriangle, Zap, Database, ShieldOff } from 'lucide-react';

interface FakeAttackOverlayProps {
  type: 'ddos' | 'attack';
  userData?: {
    username?: string;
    xp?: number;
    level?: number;
    wins?: number;
  };
  onComplete: () => void;
}

export function FakeAttackOverlay({ type, userData, onComplete }: FakeAttackOverlayProps) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const interval = setInterval(() => {
      setGlitchText(Array.from({ length: 20 }, () => 
        glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join(''));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 3;
      });
    }, 100);

    const phaseInterval = setInterval(() => {
      setPhase(prev => prev + 1);
    }, 1500);

    const timeout = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  if (type === 'ddos') {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-red-500 font-mono text-xs animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {Math.random() > 0.5 ? '01001' : '11010'}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-8 animate-pulse">
            <Zap className="h-16 w-16 text-red-500" />
            <Skull className="h-24 w-24 text-red-600 animate-bounce" />
            <Zap className="h-16 w-16 text-red-500" />
          </div>

          <h1 className="text-6xl font-bold text-red-500 mb-4 animate-pulse glitch-text">
            DDoS ATTACK
          </h1>

          <div className="text-red-400 font-mono mb-8 h-6">
            {glitchText}
          </div>

          <div className="w-96 h-4 bg-red-900/50 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="text-red-500 font-mono text-lg">
            {phase === 0 && 'INITIATING ATTACK...'}
            {phase === 1 && 'FLOODING NETWORK...'}
            {phase === 2 && 'OVERLOADING SERVERS...'}
            {phase === 3 && 'BYPASSING FIREWALL...'}
            {phase >= 4 && 'SYSTEM COMPROMISED'}
          </div>

          <div className="mt-8 text-red-600/60 text-sm font-mono">
            IP: {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}
          </div>
        </div>

        {/* Screen glitch effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
          {phase >= 3 && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent animate-scan" />
          )}
        </div>
      </div>
    );
  }

  // Attack type - data theft
  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 font-mono text-sm animate-matrix-fall"
            style={{
              left: `${i * 3.33}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j} className="opacity-50">
                {Math.random() > 0.5 ? '0' : '1'}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <ShieldOff className="h-16 w-16 text-green-500 animate-pulse" />
          <Database className="h-20 w-20 text-green-400 animate-bounce" />
          <AlertTriangle className="h-16 w-16 text-green-500 animate-pulse" />
        </div>

        <h1 className="text-5xl font-bold text-green-400 mb-4 animate-pulse">
          DATA BREACH DETECTED
        </h1>

        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 mb-6 font-mono text-left max-w-md">
          <div className="text-green-400 mb-2">STEALING DATA...</div>
          
          {phase >= 1 && userData?.username && (
            <div className="text-green-300 animate-pulse">
              ✓ Username: {userData.username}
            </div>
          )}
          {phase >= 2 && userData?.xp !== undefined && (
            <div className="text-green-300 animate-pulse">
              ✓ XP: {userData.xp} → DELETED
            </div>
          )}
          {phase >= 3 && userData?.level !== undefined && (
            <div className="text-green-300 animate-pulse">
              ✓ Level: {userData.level} → RESET TO 1
            </div>
          )}
          {phase >= 4 && userData?.wins !== undefined && (
            <div className="text-green-300 animate-pulse">
              ✓ Wins: {userData.wins} → DELETED
            </div>
          )}
          {phase >= 5 && (
            <div className="text-red-400 mt-4 animate-pulse">
              ⚠ ALL DATA COMPROMISED
            </div>
          )}
        </div>

        <div className="w-96 h-4 bg-green-900/50 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="text-green-500 font-mono">
          {Math.min(Math.floor(progress), 100)}% COMPLETE
        </div>
      </div>

      {/* Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
      </div>
    </div>
  );
}
