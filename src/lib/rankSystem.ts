export interface Rank {
  name: string;
  level: number;
  image: string;
  color: string;
}

export const RANKS: Rank[] = [
  { name: 'Bronze', level: 1, image: '/bronze.webp', color: '#CD7F32' },
  { name: 'Silver', level: 20, image: '/silber.webp', color: '#C0C0C0' },
  { name: 'Gold', level: 40, image: '/gold.webp', color: '#FFD700' },
  { name: 'Platinum', level: 60, image: '/plartinum.webp', color: '#E5E4E2' },
  { name: 'Diamond', level: 75, image: '/diamant.webp', color: '#B9F2FF' },
  { name: 'Masters', level: 90, image: '/masters.webp', color: '#FF6B9D' },
  { name: 'Legends', level: 100, image: '/legends.webp', color: '#FF0000' },
];

export const getRankFromLevel = (level: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].level) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

export const getRankTier = (level: number, rank: Rank): string => {
  const levelInRank = level - rank.level;
  const nextRankIndex = RANKS.findIndex(r => r.name === rank.name) + 1;
  const nextRankLevel = nextRankIndex < RANKS.length ? RANKS[nextRankIndex].level : 101;
  const levelsInThisRank = nextRankLevel - rank.level;

  if (levelsInThisRank <= 10) {
    return 'I';
  }

  const tierSize = Math.floor(levelsInThisRank / 3);

  if (levelInRank < tierSize) {
    return 'III';
  } else if (levelInRank < tierSize * 2) {
    return 'II';
  } else {
    return 'I';
  }
};
