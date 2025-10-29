import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSavedAccounts, saveAccount, removeAccount, clearOldAccounts, type SavedAccount } from '@/lib/accountManager';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useAccountManager = () => {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'ultimate'>('free');
  const { user } = useAuth();

  useEffect(() => {
    loadAccounts();
    checkUserPlan();
  }, [user]);

  const loadAccounts = () => {
    const savedAccounts = getSavedAccounts();
    setAccounts(savedAccounts);
  };

  const checkUserPlan = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (data?.plan) {
      setCurrentPlan(data.plan as 'free' | 'premium' | 'ultimate');
    }
  };

  const addAccount = async (userId: string, email: string, username: string) => {
    const isPremium = currentPlan === 'premium' || currentPlan === 'ultimate';
    const result = saveAccount(userId, email, username, isPremium);
    
    if (!result.success) {
      toast.error('Limit erreicht', {
        description: result.message,
      });
      return false;
    }
    
    loadAccounts();
    toast.success('Account gespeichert', {
      description: `${username} wurde zu deinen gespeicherten Accounts hinzugefügt.`,
    });
    return true;
  };

  const deleteAccount = (userId: string) => {
    removeAccount(userId);
    loadAccounts();
    toast.success('Account entfernt');
  };

  const switchAccount = async (account: SavedAccount) => {
    try {
      await supabase.auth.signOut();
      
      // Update last used
      const isPremium = currentPlan === 'premium' || currentPlan === 'ultimate';
      saveAccount(account.userId, account.email, account.username, isPremium);
      
      toast.success('Account gewechselt', {
        description: `Bitte melde dich als ${account.username} an.`,
      });
      
      return true;
    } catch (error) {
      toast.error('Fehler beim Wechseln');
      return false;
    }
  };

  useEffect(() => {
    const isPremium = currentPlan === 'premium' || currentPlan === 'ultimate';
    clearOldAccounts(isPremium);
  }, [currentPlan]);

  return {
    accounts,
    currentPlan,
    addAccount,
    deleteAccount,
    switchAccount,
    maxAccounts: currentPlan === 'free' ? 3 : Infinity,
  };
};
