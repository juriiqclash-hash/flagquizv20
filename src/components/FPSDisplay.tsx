import { useEffect, useState, useRef } from 'react';
import { Wifi } from 'lucide-react';

interface FPSDisplayProps {
  enabled: boolean;
  showNetworkStats?: boolean;
}

const FPSDisplay = ({ enabled, showNetworkStats = false }: FPSDisplayProps) => {
  const [fps, setFps] = useState(0);
  const [ping, setPing] = useState(0);
  const [latency, setLatency] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();
  const networkIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (networkIntervalRef.current) {
        clearInterval(networkIntervalRef.current);
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

  useEffect(() => {
    if (!showNetworkStats || !enabled) {
      if (networkIntervalRef.current) {
        clearInterval(networkIntervalRef.current);
      }
      return;
    }

    const measureNetwork = async () => {
      const start = performance.now();
      try {
        await fetch(window.location.origin, { method: 'HEAD', cache: 'no-cache' });
        const end = performance.now();
        const pingValue = Math.round(end - start);
        setPing(pingValue);
        setLatency(pingValue);
      } catch (error) {
        setPing(0);
        setLatency(0);
      }
    };

    measureNetwork();
    networkIntervalRef.current = setInterval(measureNetwork, 5000);

    return () => {
      if (networkIntervalRef.current) {
        clearInterval(networkIntervalRef.current);
      }
    };
  }, [showNetworkStats, enabled]);

  if (!enabled) return null;

  const getFpsColor = () => {
    if (fps >= 60) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPingColor = () => {
    if (ping <= 50) return 'text-green-500';
    if (ping <= 100) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 pointer-events-none">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-medium">FPS:</span>
          <span className={`text-sm font-bold ${getFpsColor()}`}>
            {fps}
          </span>
        </div>
        {showNetworkStats && (
          <>
            <div className="flex items-center gap-2 border-t border-white/20 pt-1">
              <span className="text-white text-xs font-medium">Ping:</span>
              <span className={`text-sm font-bold ${getPingColor()}`}>
                {ping}ms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium">Latenz:</span>
              <span className={`text-sm font-bold ${getPingColor()}`}>
                {latency}ms
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FPSDisplay;
