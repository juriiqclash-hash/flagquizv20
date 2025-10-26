import { useEffect, useState, useRef } from 'react';

interface FPSDisplayProps {
  enabled: boolean;
}

const FPSDisplay = ({ enabled }: FPSDisplayProps) => {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const calculateFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(calculateFPS);
    };

    animationFrameRef.current = requestAnimationFrame(calculateFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  const getFpsColor = () => {
    if (fps >= 60) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
      <div className="flex items-center gap-2">
        <span className="text-white text-xs font-medium">FPS:</span>
        <span className={`text-sm font-bold ${getFpsColor()}`}>
          {fps}
        </span>
      </div>
    </div>
  );
};

export default FPSDisplay;
