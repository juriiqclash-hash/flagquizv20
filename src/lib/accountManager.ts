const SAVED_ACCOUNTS_KEY = 'flagquiz_saved_accounts';
const MAX_FREE_ACCOUNTS = 3;

export interface SavedAccount {
  userId: string;
  email: string;
  username: string;
  lastUsed: string;
}

export const getSavedAccounts = (): SavedAccount[] => {
  try {
    const stored = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveAccount = (userId: string, email: string, username: string, isPremium: boolean): { success: boolean; message?: string } => {
  const accounts = getSavedAccounts();
  const existingIndex = accounts.findIndex(acc => acc.userId === userId);

  if (existingIndex >= 0) {
    accounts[existingIndex] = {
      userId,
      email,
      username,
      lastUsed: new Date().toISOString(),
    };
  } else {
    if (!isPremium && accounts.length >= MAX_FREE_ACCOUNTS) {
      return {
        success: false,
        message: `Du hast das Maximum von ${MAX_FREE_ACCOUNTS} gespeicherten Accounts erreicht. Upgrade auf Premium für unbegrenzte Accounts.`,
      };
    }

    accounts.push({
      userId,
      email,
      username,
      lastUsed: new Date().toISOString(),
    });
  }

  accounts.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());

  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  return { success: true };
};

export const removeAccount = (userId: string) => {
  const accounts = getSavedAccounts();
  const filtered = accounts.filter(acc => acc.userId !== userId);
  localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(filtered));
};

export const clearOldAccounts = (isPremium: boolean) => {
  if (isPremium) return;

  const accounts = getSavedAccounts();
  if (accounts.length > MAX_FREE_ACCOUNTS) {
    const keep = accounts.slice(0, MAX_FREE_ACCOUNTS);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(keep));
  }
};
