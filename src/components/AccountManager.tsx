import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, X, Crown, LogOut } from 'lucide-react';
import { useAccountManager } from '@/hooks/useAccountManager';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AccountManager = () => {
  const { accounts, currentPlan, deleteAccount, switchAccount, maxAccounts } = useAccountManager();
  const { user } = useAuth();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();
      if (data) setUsername(data.username);
    };
    fetchProfile();
  }, [user]);

  const isPremium = currentPlan === 'premium' || currentPlan === 'ultimate';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Account Manager
              {isPremium && <Crown className="h-5 w-5 text-amber-500" />}
            </CardTitle>
            <CardDescription>
              {isPremium 
                ? 'Unbegrenzte gespeicherte Accounts'
                : `${accounts.length} / ${maxAccounts} gespeicherte Accounts`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Account */}
        {user && username && (
          <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant="default">Aktiv</Badge>
            </div>
          </div>
        )}

        {/* Saved Accounts */}
        {accounts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Gespeicherte Accounts</p>
            {accounts.map((account) => (
              <div
                key={account.userId}
                className="p-3 bg-card rounded-lg border flex items-center justify-between hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{account.username}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => switchAccount(account)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteAccount(account.userId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPremium && accounts.length >= maxAccounts && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-center">
              Upgrade auf Premium für unbegrenzte Accounts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
