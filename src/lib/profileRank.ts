import bronzeBadge from '@/assets/bronze.webp';
import silverBadge from '@/assets/silber.webp';
import goldBadge from '@/assets/gold.webp';
import platinumBadge from '@/assets/plartinum.webp';
import diamondBadge from '@/assets/diamant.webp';
import legendsBadge from '@/assets/legends.webp';
import mastersBadge from '@/assets/masters.webp';

export type RankTier = {
  name: string;
  badge: string;
  gradient: string;
  minStreak: number;
  minTimeSeconds: number;
  minDuelWins: number;
  minLevel: number;
};

export const RANK_TIERS: RankTier[] = [
  {
    name: 'Legends',
    badge: legendsBadge,
    gradient: 'from-purple-600 via-purple-500 to-pink-500',
    minStreak: 1000,
    minTimeSeconds: 480, // <8 minutes
    minDuelWins: 500,
    minLevel: 7,
  },
  {
    name: 'Masters',
    badge: mastersBadge,
    gradient: 'from-blue-600 via-blue-500 to-purple-500',
    minStreak: 100,
    minTimeSeconds: 480, // 8-9 minutes
    minDuelWins: 500,
    minLevel: 6,
  },
  {
    name: 'Diamond',
    badge: diamondBadge,
    gradient: 'from-cyan-400 via-blue-400 to-cyan-300',
    minStreak: 60,
    minTimeSeconds: 480, // 8-10 minutes
    minDuelWins: 400,
    minLevel: 5,
  },
  {
    name: 'Platinum',
    badge: platinumBadge,
    gradient: 'from-slate-400 via-slate-300 to-slate-200',
    minStreak: 30,
    minTimeSeconds: 600, // 10-12 minutes
    minDuelWins: 300,
    minLevel: 4,
  },
  {
    name: 'Gold',
    badge: goldBadge,
    gradient: 'from-yellow-600 via-yellow-500 to-yellow-400',
    minStreak: 15,
    minTimeSeconds: 720, // 12-15 minutes
    minDuelWins: 150,
    minLevel: 3,
  },
  {
    name: 'Silver',
    badge: silverBadge,
    gradient: 'from-gray-400 via-gray-300 to-gray-400',
    minStreak: 5,
    minTimeSeconds: 900, // 15-20 minutes
    minDuelWins: 50,
    minLevel: 2,
  },
  {
    name: 'Bronze',
    badge: bronzeBadge,
    gradient: 'from-orange-600 via-orange-500 to-orange-400',
    minStreak: 0,
    minTimeSeconds: 1200, // >20 minutes
    minDuelWins: 0,
    minLevel: 1,
  },
];

// Helper mappers from stats to rank indices (1..7)
const getDuelRank = (duelWins: number): number => {
  if (duelWins >= 500) return 7; // Legends or Masters
  if (duelWins >= 400) return 5; // Diamond
  if (duelWins >= 300) return 4; // Platinum
  if (duelWins >= 150) return 3; // Gold
  if (duelWins >= 50) return 2; // Silver
  return 1; // Bronze
};

const getStreakRank = (streak: number): number => {
  if (streak >= 1000) return 7; // Legends
  if (streak >= 100) return 6; // Masters
  if (streak >= 60) return 5; // Diamond
  if (streak >= 30) return 4; // Platinum
  if (streak >= 15) return 3; // Gold
  if (streak >= 5) return 2; // Silver
  return 1; // Bronze
};

const getTimeRank = (timeSeconds: number): number => {
  if (timeSeconds === 0 || timeSeconds === 9999) return 1; // Bronze (no time)
  if (timeSeconds < 480) return 7; // Legends (<8 min)
  if (timeSeconds < 540) return 6; // Masters (8-9 min)
  if (timeSeconds < 600) return 5; // Diamond (8-10 min)
  if (timeSeconds < 720) return 4; // Platinum (10-12 min)
  if (timeSeconds < 900) return 3; // Gold (12-15 min)
  if (timeSeconds < 1200) return 2; // Silver (15-20 min)
  return 1; // Bronze (>20 min)
};

export type LeaderboardStatsInput = {
  bestStreak: number;
  bestTimeMode: number; // in seconds
  duelWins: number;
  bestPosition?: number;
};

export const calculateRank = (stats: LeaderboardStatsInput, level: number): RankTier => {
  const duelRank = getDuelRank(stats.duelWins);
  const streakRank = getStreakRank(stats.bestStreak);
  const timeRank = getTimeRank(stats.bestTimeMode);
  const averageRank = Math.round((duelRank + streakRank + timeRank) / 3);

  // Map average rank to tier (1=Bronze .. 7=Legends)
  const tierIndex = 7 - averageRank; // Reverse because RANK_TIERS is highest->lowest
  return RANK_TIERS[Math.max(0, Math.min(tierIndex, RANK_TIERS.length - 1))];
};

export const calculateRankScore = (stats: LeaderboardStatsInput, level: number): number => {
  const duelRank = getDuelRank(stats.duelWins);
  const streakRank = getStreakRank(stats.bestStreak);
  const timeRank = getTimeRank(stats.bestTimeMode);
  return (duelRank + streakRank + timeRank) / 3;
};
