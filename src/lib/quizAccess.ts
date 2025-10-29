export type QuizType = 'flags' | 'capitals' | 'maps' | 'world-knowledge' | 'exclusive';

export interface QuizAccessRules {
  requiresPremium: boolean;
  requiresUltimate: boolean;
  isExclusive: boolean;
}

export const QUIZ_ACCESS: Record<QuizType, QuizAccessRules> = {
  flags: {
    requiresPremium: false,
    requiresUltimate: false,
    isExclusive: false,
  },
  capitals: {
    requiresPremium: false,
    requiresUltimate: false,
    isExclusive: false,
  },
  maps: {
    requiresPremium: false,
    requiresUltimate: false,
    isExclusive: false,
  },
  'world-knowledge': {
    requiresPremium: false,
    requiresUltimate: false,
    isExclusive: false,
  },
  exclusive: {
    requiresPremium: false,
    requiresUltimate: true,
    isExclusive: true,
  },
};

export const canAccessQuiz = (
  quizType: QuizType,
  userPlan: 'free' | 'premium' | 'ultimate'
): boolean => {
  const rules = QUIZ_ACCESS[quizType];
  
  if (rules.requiresUltimate && userPlan !== 'ultimate') {
    return false;
  }
  
  if (rules.requiresPremium && userPlan === 'free') {
    return false;
  }
  
  return true;
};

export const getQuizAccessMessage = (quizType: QuizType): string | null => {
  const rules = QUIZ_ACCESS[quizType];
  
  if (rules.requiresUltimate) {
    return 'Dieses Quiz ist exklusiv für Ultimate-Mitglieder verfügbar.';
  }
  
  if (rules.requiresPremium) {
    return 'Dieses Quiz ist nur für Premium-Mitglieder verfügbar.';
  }
  
  return null;
};
