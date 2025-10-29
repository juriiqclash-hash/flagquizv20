import { Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileBadgeProps {
  plan: 'free' | 'premium' | 'ultimate';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProfileBadge = ({ plan, size = 'md', showLabel = false }: ProfileBadgeProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const containerClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  if (plan === 'free') return null;

  if (plan === 'premium') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold",
        showLabel && containerClasses[size]
      )}>
        <Crown className={sizeClasses[size]} />
        {showLabel && 'Premium'}
      </div>
    );
  }

  if (plan === 'ultimate') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold",
        showLabel && containerClasses[size]
      )}>
        <Star className={sizeClasses[size]} />
        {showLabel && 'Ultimate'}
      </div>
    );
  }

  return null;
};

interface ProfileFrameProps {
  plan: 'free' | 'premium' | 'ultimate';
  children: React.ReactNode;
  className?: string;
}

export const ProfileFrame = ({ plan, children, className }: ProfileFrameProps) => {
  const frameStyles = {
    free: '',
    premium: 'ring-4 ring-amber-500 ring-offset-4 ring-offset-background',
    ultimate: 'ring-4 ring-purple-500 ring-offset-4 ring-offset-background shadow-lg shadow-purple-500/50',
  };

  return (
    <div className={cn(frameStyles[plan], className)}>
      {children}
    </div>
  );
};
