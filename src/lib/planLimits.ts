import { supabase } from '@/integrations/supabase/client';

export interface PlanLimits {
  maxSavedAccounts: number;
  maxFriends: number;
  countryChangesPerMonth: number;
  usernameChangesPerMonth: number;
  canCustomizeProfile: boolean;
  maxClanSize: number;
}

export const PLAN_LIMITS: Record<'free' | 'premium' | 'ultimate', PlanLimits> = {
  free: {
    maxSavedAccounts: 3,
    maxFriends: 30,
    countryChangesPerMonth: 5,
    usernameChangesPerMonth: 1,
    canCustomizeProfile: false,
    maxClanSize: 30,
  },
  premium: {
    maxSavedAccounts: Infinity,
    maxFriends: Infinity,
    countryChangesPerMonth: Infinity,
    usernameChangesPerMonth: Infinity,
    canCustomizeProfile: true,
    maxClanSize: 75,
  },
  ultimate: {
    maxSavedAccounts: Infinity,
    maxFriends: Infinity,
    countryChangesPerMonth: Infinity,
    usernameChangesPerMonth: Infinity,
    canCustomizeProfile: true,
    maxClanSize: Infinity,
  },
};

export const checkCountryChangeLimit = async (userId: string, plan: 'free' | 'premium' | 'ultimate'): Promise<{ allowed: boolean; remaining: number; message?: string }> => {
  const limits = PLAN_LIMITS[plan];

  if (limits.countryChangesPerMonth === Infinity) {
    return { allowed: true, remaining: Infinity };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('country_changes_this_month, last_country_change')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return { allowed: true, remaining: limits.countryChangesPerMonth };
  }

  const now = new Date();
  const lastChange = profile.last_country_change ? new Date(profile.last_country_change) : null;

  let changesThisMonth = profile.country_changes_this_month || 0;

  if (lastChange) {
    const isSameMonth = lastChange.getMonth() === now.getMonth() &&
                        lastChange.getFullYear() === now.getFullYear();

    if (!isSameMonth) {
      changesThisMonth = 0;
    }
  }

  const remaining = limits.countryChangesPerMonth - changesThisMonth;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      message: `Du hast dein monatliches Limit von ${limits.countryChangesPerMonth} Land-Änderungen erreicht. Upgrade auf Premium für unbegrenzte Änderungen.`
    };
  }

  return { allowed: true, remaining };
};

export const checkUsernameChangeLimit = async (userId: string, plan: 'free' | 'premium' | 'ultimate'): Promise<{ allowed: boolean; remaining: number; message?: string }> => {
  const limits = PLAN_LIMITS[plan];

  if (limits.usernameChangesPerMonth === Infinity) {
    return { allowed: true, remaining: Infinity };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username_changes_this_month, last_username_change')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return { allowed: true, remaining: limits.usernameChangesPerMonth };
  }

  const now = new Date();
  const lastChange = profile.last_username_change ? new Date(profile.last_username_change) : null;

  let changesThisMonth = profile.username_changes_this_month || 0;

  if (lastChange) {
    const isSameMonth = lastChange.getMonth() === now.getMonth() &&
                        lastChange.getFullYear() === now.getFullYear();

    if (!isSameMonth) {
      changesThisMonth = 0;
    }
  }

  const remaining = limits.usernameChangesPerMonth - changesThisMonth;

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      message: `Du hast dein monatliches Limit von ${limits.usernameChangesPerMonth} Benutzername-Änderung erreicht. Upgrade auf Premium für unbegrenzte Änderungen.`
    };
  }

  return { allowed: true, remaining };
};

export const incrementCountryChange = async (userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('country_changes_this_month, last_country_change')
    .eq('user_id', userId)
    .single();

  if (!profile) return;

  const now = new Date();
  const lastChange = profile.last_country_change ? new Date(profile.last_country_change) : null;

  let changesThisMonth = profile.country_changes_this_month || 0;

  if (lastChange) {
    const isSameMonth = lastChange.getMonth() === now.getMonth() &&
                        lastChange.getFullYear() === now.getFullYear();

    if (!isSameMonth) {
      changesThisMonth = 0;
    }
  }

  await supabase
    .from('profiles')
    .update({
      country_changes_this_month: changesThisMonth + 1,
      last_country_change: now.toISOString(),
    })
    .eq('user_id', userId);
};

export const incrementUsernameChange = async (userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username_changes_this_month, last_username_change')
    .eq('user_id', userId)
    .single();

  if (!profile) return;

  const now = new Date();
  const lastChange = profile.last_username_change ? new Date(profile.last_username_change) : null;

  let changesThisMonth = profile.username_changes_this_month || 0;

  if (lastChange) {
    const isSameMonth = lastChange.getMonth() === now.getMonth() &&
                        lastChange.getFullYear() === now.getFullYear();

    if (!isSameMonth) {
      changesThisMonth = 0;
    }
  }

  await supabase
    .from('profiles')
    .update({
      username_changes_this_month: changesThisMonth + 1,
      last_username_change: now.toISOString(),
    })
    .eq('user_id', userId);
};
