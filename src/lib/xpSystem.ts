const XP_TABLE = [
  { level: 1, xpForLevel: 4, cumulativeXP: 4 },
  { level: 2, xpForLevel: 8, cumulativeXP: 12 },
  { level: 3, xpForLevel: 14, cumulativeXP: 26 },
  { level: 4, xpForLevel: 20, cumulativeXP: 46 },
  { level: 5, xpForLevel: 26, cumulativeXP: 72 },
  { level: 6, xpForLevel: 33, cumulativeXP: 105 },
  { level: 7, xpForLevel: 40, cumulativeXP: 145 },
  { level: 8, xpForLevel: 47, cumulativeXP: 192 },
  { level: 9, xpForLevel: 55, cumulativeXP: 247 },
  { level: 10, xpForLevel: 63, cumulativeXP: 310 },
  { level: 11, xpForLevel: 70, cumulativeXP: 380 },
  { level: 12, xpForLevel: 79, cumulativeXP: 459 },
  { level: 13, xpForLevel: 88, cumulativeXP: 547 },
  { level: 14, xpForLevel: 97, cumulativeXP: 644 },
  { level: 15, xpForLevel: 107, cumulativeXP: 751 },
  { level: 16, xpForLevel: 117, cumulativeXP: 868 },
  { level: 17, xpForLevel: 126, cumulativeXP: 994 },
  { level: 18, xpForLevel: 137, cumulativeXP: 1131 },
  { level: 19, xpForLevel: 147, cumulativeXP: 1278 },
  { level: 20, xpForLevel: 149, cumulativeXP: 1427 },
  { level: 21, xpForLevel: 161, cumulativeXP: 1588 },
  { level: 22, xpForLevel: 172, cumulativeXP: 1760 },
  { level: 23, xpForLevel: 184, cumulativeXP: 1944 },
  { level: 24, xpForLevel: 196, cumulativeXP: 2140 },
  { level: 25, xpForLevel: 209, cumulativeXP: 2349 },
  { level: 26, xpForLevel: 222, cumulativeXP: 2571 },
  { level: 27, xpForLevel: 235, cumulativeXP: 2806 },
  { level: 28, xpForLevel: 249, cumulativeXP: 3055 },
  { level: 29, xpForLevel: 262, cumulativeXP: 3317 },
  { level: 30, xpForLevel: 247, cumulativeXP: 3564 },
  { level: 31, xpForLevel: 275, cumulativeXP: 3839 },
  { level: 32, xpForLevel: 288, cumulativeXP: 4127 },
  { level: 33, xpForLevel: 301, cumulativeXP: 4428 },
  { level: 34, xpForLevel: 315, cumulativeXP: 4743 },
  { level: 35, xpForLevel: 329, cumulativeXP: 5072 },
  { level: 36, xpForLevel: 343, cumulativeXP: 5415 },
  { level: 37, xpForLevel: 357, cumulativeXP: 5772 },
  { level: 38, xpForLevel: 371, cumulativeXP: 6143 },
  { level: 39, xpForLevel: 386, cumulativeXP: 6529 },
  { level: 40, xpForLevel: 354, cumulativeXP: 6883 },
  { level: 41, xpForLevel: 401, cumulativeXP: 7284 },
  { level: 42, xpForLevel: 416, cumulativeXP: 7700 },
  { level: 43, xpForLevel: 431, cumulativeXP: 8131 },
  { level: 44, xpForLevel: 446, cumulativeXP: 8577 },
  { level: 45, xpForLevel: 462, cumulativeXP: 9039 },
  { level: 46, xpForLevel: 478, cumulativeXP: 9517 },
  { level: 47, xpForLevel: 494, cumulativeXP: 10011 },
  { level: 48, xpForLevel: 510, cumulativeXP: 10521 },
  { level: 49, xpForLevel: 526, cumulativeXP: 11047 },
  { level: 50, xpForLevel: 468, cumulativeXP: 11515 },
  { level: 51, xpForLevel: 557, cumulativeXP: 12072 },
  { level: 52, xpForLevel: 573, cumulativeXP: 12645 },
  { level: 53, xpForLevel: 589, cumulativeXP: 13234 },
  { level: 54, xpForLevel: 606, cumulativeXP: 13840 },
  { level: 55, xpForLevel: 623, cumulativeXP: 14463 },
  { level: 56, xpForLevel: 640, cumulativeXP: 15103 },
  { level: 57, xpForLevel: 657, cumulativeXP: 15760 },
  { level: 58, xpForLevel: 674, cumulativeXP: 16434 },
  { level: 59, xpForLevel: 692, cumulativeXP: 17126 },
  { level: 60, xpForLevel: 587, cumulativeXP: 17713 },
  { level: 61, xpForLevel: 743, cumulativeXP: 18456 },
  { level: 62, xpForLevel: 761, cumulativeXP: 19217 },
  { level: 63, xpForLevel: 779, cumulativeXP: 19996 },
  { level: 64, xpForLevel: 797, cumulativeXP: 20793 },
  { level: 65, xpForLevel: 815, cumulativeXP: 21608 },
  { level: 66, xpForLevel: 833, cumulativeXP: 22441 },
  { level: 67, xpForLevel: 852, cumulativeXP: 23293 },
  { level: 68, xpForLevel: 871, cumulativeXP: 24164 },
  { level: 69, xpForLevel: 890, cumulativeXP: 25054 },
  { level: 70, xpForLevel: 712, cumulativeXP: 25766 },
  { level: 71, xpForLevel: 930, cumulativeXP: 26696 },
  { level: 72, xpForLevel: 950, cumulativeXP: 27646 },
  { level: 73, xpForLevel: 970, cumulativeXP: 28616 },
  { level: 74, xpForLevel: 990, cumulativeXP: 29606 },
  { level: 75, xpForLevel: 1011, cumulativeXP: 30617 },
  { level: 76, xpForLevel: 1032, cumulativeXP: 31649 },
  { level: 77, xpForLevel: 1053, cumulativeXP: 32702 },
  { level: 78, xpForLevel: 1074, cumulativeXP: 33776 },
  { level: 79, xpForLevel: 1095, cumulativeXP: 34871 },
  { level: 80, xpForLevel: 842, cumulativeXP: 35713 },
  { level: 81, xpForLevel: 1130, cumulativeXP: 36843 },
  { level: 82, xpForLevel: 1151, cumulativeXP: 37994 },
  { level: 83, xpForLevel: 1173, cumulativeXP: 39167 },
  { level: 84, xpForLevel: 1195, cumulativeXP: 40362 },
  { level: 85, xpForLevel: 1217, cumulativeXP: 41579 },
  { level: 86, xpForLevel: 1239, cumulativeXP: 42818 },
  { level: 87, xpForLevel: 1262, cumulativeXP: 44080 },
  { level: 88, xpForLevel: 1285, cumulativeXP: 45365 },
  { level: 89, xpForLevel: 1308, cumulativeXP: 46673 },
  { level: 90, xpForLevel: 975, cumulativeXP: 47648 },
  { level: 91, xpForLevel: 1333, cumulativeXP: 48981 },
  { level: 92, xpForLevel: 1357, cumulativeXP: 50338 },
  { level: 93, xpForLevel: 1381, cumulativeXP: 51719 },
  { level: 94, xpForLevel: 1405, cumulativeXP: 53124 },
  { level: 95, xpForLevel: 1429, cumulativeXP: 54553 },
  { level: 96, xpForLevel: 1454, cumulativeXP: 56007 },
  { level: 97, xpForLevel: 1479, cumulativeXP: 57486 },
  { level: 98, xpForLevel: 1504, cumulativeXP: 58990 },
  { level: 99, xpForLevel: 1529, cumulativeXP: 60519 },
  { level: 100, xpForLevel: 1112, cumulativeXP: 61631 },
];

export const calculateLevel = (totalXP: number): number => {
  if (totalXP < 4) return 0;

  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (totalXP >= XP_TABLE[i].cumulativeXP) {
      return XP_TABLE[i].level;
    }
  }

  return 0;
};

export const getXPForLevel = (level: number): number => {
  if (level < 1 || level > 100) return 0;
  return XP_TABLE[level - 1].xpForLevel;
};

export const getCumulativeXP = (level: number): number => {
  if (level < 1) return 0;
  if (level > 100) return XP_TABLE[XP_TABLE.length - 1].cumulativeXP;
  return XP_TABLE[level - 1].cumulativeXP;
};

export const getXPProgress = (totalXP: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercentage: number;
} => {
  const currentLevel = calculateLevel(totalXP);

  if (currentLevel >= 100) {
    return {
      currentLevel: 100,
      xpInCurrentLevel: 0,
      xpNeededForNextLevel: 0,
      progressPercentage: 100
    };
  }

  const currentLevelCumulativeXP = currentLevel === 0 ? 0 : getCumulativeXP(currentLevel);
  const nextLevelCumulativeXP = getCumulativeXP(currentLevel + 1);

  const xpInCurrentLevel = totalXP - currentLevelCumulativeXP;
  const xpNeededForNextLevel = getXPForLevel(currentLevel + 1);
  const progressPercentage = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercentage: Math.min(100, Math.max(0, progressPercentage))
  };
};
