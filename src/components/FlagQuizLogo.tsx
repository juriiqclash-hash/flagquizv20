import { MapPin } from 'lucide-react';

interface FlagQuizLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // dark = für dunklen Hintergrund (blau innen, weiß außen), light = für hellen Hintergrund (weiß innen, blau außen)
  className?: string;
}

export default function FlagQuizLogo({ size = 'md', variant = 'light', className = '' }: FlagQuizLogoProps) {
  const sizes = {
    sm: {
      container: 'gap-2',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      text: 'text-2xl',
    },
    md: {
      container: 'gap-3',
      icon: 'w-12 h-12',
      iconInner: 'w-6 h-6',
      text: 'text-4xl',
    },
    lg: {
      container: 'gap-4',
      icon: 'w-16 h-16',
      iconInner: 'w-8 h-8',
      text: 'text-5xl md:text-6xl',
    },
    xl: {
      container: 'gap-5',
      icon: 'w-20 h-20',
      iconInner: 'w-10 h-10',
      text: 'text-6xl md:text-7xl',
      isMainMenu: true,
    },
  };

  const currentSize = sizes[size];

  const isDark = variant === 'dark';
  
  // Smaller stroke for smaller sizes to prevent overlap on mobile
  const getStrokeWidth = () => {
    if (size === 'sm') return isDark ? '1px #3b82f6' : '1px #1e40af';
    if (size === 'md') return isDark ? '1.5px #3b82f6' : '1.5px #1e40af';
    if (size === 'lg') return isDark ? '2.5px #3b82f6' : '2.5px #1e40af';
    return isDark ? '8px #3b82f6' : '3px #1e40af'; // xl
  };
  
  const isMainMenu = currentSize.isMainMenu === true;

  if (isMainMenu) {
    return (
      <>
        {/* Mobile: Vertical Layout */}
        <div className={`flex md:hidden flex-col items-center justify-center ${className}`}>
          {/* Map Pin Icon */}
          <MapPin
            className="w-32 h-32 drop-shadow-lg fill-white text-blue-500 mb-3"
          />

          {/* FLAG Text */}
          <div className="text-8xl font-black tracking-tight leading-none">
            <span
              className={isDark ? 'text-white' : 'text-white'}
              style={isDark ? {
                WebkitTextStroke: '6px #3b82f6',
                paintOrder: 'stroke fill'
              } : {
                WebkitTextStroke: '6px #3b82f6',
                paintOrder: 'stroke fill'
              }}>
              FLAG
            </span>
          </div>

          {/* QUIZ Text */}
          <div className="text-8xl font-black tracking-tight leading-none -mt-3">
            <span
              className={isDark ? 'text-white' : 'text-white'}
              style={isDark ? {
                WebkitTextStroke: '6px #3b82f6',
                paintOrder: 'stroke fill'
              } : {
                WebkitTextStroke: '6px #3b82f6',
                paintOrder: 'stroke fill'
              }}>
              QUIZ
            </span>
          </div>
        </div>

        {/* Desktop: Vertical Layout */}
        <div className={`hidden md:flex flex-col items-center justify-center ${className}`}>
          {/* Map Pin Icon */}
          <MapPin
            className={`${currentSize.icon} drop-shadow-lg ${isDark ? 'fill-white text-blue-500' : 'fill-white text-blue-500'} mb-2`}
          />

          {/* FLAG Text */}
          <div className={`${currentSize.text} font-black tracking-tight leading-none`}>
            <span
              className={isDark ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600'}
              style={isDark ? {
                WebkitTextStroke: getStrokeWidth(),
                paintOrder: 'stroke fill'
              } : {
                WebkitTextStroke: getStrokeWidth(),
                paintOrder: 'stroke fill'
              }}>
              FLAG
            </span>
          </div>

          {/* QUIZ Text */}
          <div className={`${currentSize.text} font-black tracking-tight leading-none -mt-2`}>
            <span
              className={isDark ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600'}
              style={isDark ? {
                WebkitTextStroke: getStrokeWidth(),
                paintOrder: 'stroke fill'
              } : {
                WebkitTextStroke: getStrokeWidth(),
                paintOrder: 'stroke fill'
              }}>
              QUIZ
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={`flex items-center justify-center ${currentSize.container} ${className}`}>
      {/* Map Pin Icon */}
      <MapPin
        className={`${currentSize.icon} drop-shadow-lg ${isDark ? 'fill-white text-blue-500' : 'fill-white text-blue-500'}`}
      />

      {/* FLAGQUIZ Text */}
      <div className={`${currentSize.text} font-black tracking-tight`}>
        <span
          className={isDark ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600'}
          style={isDark ? {
            WebkitTextStroke: getStrokeWidth(),
            paintOrder: 'stroke fill'
          } : {
            WebkitTextStroke: getStrokeWidth(),
            paintOrder: 'stroke fill'
          }}>
          FLAGQUIZ
        </span>
      </div>
    </div>
  );
}
