import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, UserPlus, Settings, Users, Shield, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AuthForm from '@/components/AuthForm';
import SettingsDialog from '@/components/SettingsDialog';
import { ProfileView } from '@/components/ProfileView';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';

interface ProfileButtonProps {
  transparentStyle?: boolean;
  onOpenAdminPanel?: () => void;
  onProfileOpenChange?: (open: boolean) => void;
}

interface SavedAccount {
  email: string;
  userId: string;
  avatarUrl?: string;
  session?: {
    access_token: string;
    refresh_token: string;
  };
}

const ProfileButton = ({ transparentStyle = false, onOpenAdminPanel, onProfileOpenChange }: ProfileButtonProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  
  // Debug log
  useEffect(() => {
    if (user && !adminLoading) {
      console.log('Admin check:', { 
        email: user.email, 
        isAdmin, 
        hasCallback: !!onOpenAdminPanel 
      });
    }
  }, [user, isAdmin, adminLoading, onOpenAdminPanel]);
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);

  const handleProfileViewChange = (open: boolean) => {
    setShowProfileView(open);
    onProfileOpenChange?.(open);
  };
  const [showAccountSwitchDialog, setShowAccountSwitchDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadSavedAccounts();
    }
  }, [user]);

  // Save account when avatarUrl changes
  useEffect(() => {
    if (user && avatarUrl !== null) {
      saveCurrentAccount();
    }
  }, [user, avatarUrl]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadSavedAccounts = () => {
    const accounts = localStorage.getItem('flagquiz_accounts');
    if (accounts) {
      setSavedAccounts(JSON.parse(accounts));
    }
  };

  const saveCurrentAccount = async () => {
    if (!user) return;
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    const accounts = localStorage.getItem('flagquiz_accounts');
    const accountsList: SavedAccount[] = accounts ? JSON.parse(accounts) : [];
    
    const existingIndex = accountsList.findIndex(acc => acc.userId === user.id);
    const newAccount = { 
      email: user.email || '', 
      userId: user.id,
      avatarUrl: avatarUrl || undefined,
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token
      } : undefined
    };
    
    if (existingIndex === -1) {
      accountsList.push(newAccount);
    } else {
      accountsList[existingIndex] = newAccount;
    }
    
    localStorage.setItem('flagquiz_accounts', JSON.stringify(accountsList));
    setSavedAccounts(accountsList);
  };

  const handleSwitchAccount = async (account: SavedAccount) => {
    if (!account.session) {
      toast({
        title: 'Fehler',
        description: 'Keine Session für diesen Account gefunden. Bitte melde dich erneut an.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Save current account's session before switching
      await saveCurrentAccount();
      
      // Set the new session
      const { error } = await supabase.auth.setSession({
        access_token: account.session.access_token,
        refresh_token: account.session.refresh_token
      });

      if (error) throw error;

      toast({
        title: 'Konto gewechselt',
        description: `Du bist jetzt als ${account.email} angemeldet`,
      });
      
      // Reload the page to update all components
      window.location.reload();
    } catch (error) {
      console.error('Error switching account:', error);
      toast({
        title: 'Fehler beim Wechseln',
        description: 'Bitte melde dich erneut an',
        variant: 'destructive'
      });
    }
  };

  const handleAddUser = () => {
    setShowAddUserDialog(true);
  };

  const handleRemoveAccount = (accountUserId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const accounts = localStorage.getItem('flagquiz_accounts');
    if (!accounts) return;

    const accountsList: SavedAccount[] = JSON.parse(accounts);
    const updatedAccounts = accountsList.filter(acc => acc.userId !== accountUserId);

    localStorage.setItem('flagquiz_accounts', JSON.stringify(updatedAccounts));
    setSavedAccounts(updatedAccounts);

    toast({
      title: 'Account entfernt',
      description: 'Der Account wurde aus der Liste entfernt',
    });
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Abgemeldet',
      description: 'Du wurdest erfolgreich abgemeldet',
    });
  };

  if (!user) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <Button 
          variant="outline" 
          className={transparentStyle 
            ? "bg-white/10 text-white border-white/20 hover:bg-white/20" 
            : ""
          }
          onClick={() => setShowAuthDialog(true)}
        >
          <User className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">{t.login}</span>
        </Button>
        <DialogContent className="max-w-md">
          <AuthForm onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={transparentStyle 
              ? "bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2" 
              : "gap-2"
            }
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{t.profile}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-popover border shadow-lg z-[60]" align="end">
          <div className="px-2 py-2 text-sm text-muted-foreground">
            {user.email}
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleProfileViewChange(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Benutzer hinzufügen</span>
          </DropdownMenuItem>

          {savedAccounts.length > 1 && (
            <DropdownMenuItem onClick={() => setShowAccountSwitchDialog(true)}>
              <Users className="mr-2 h-4 w-4" />
              <span>Benutzer wechseln</span>
            </DropdownMenuItem>
          )}

          {!adminLoading && isAdmin && onOpenAdminPanel && (
            <DropdownMenuItem onClick={onOpenAdminPanel}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin-Panel</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Einstellungen</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Ausloggen</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-md">
          <AuthForm onSuccess={() => setShowAddUserDialog(false)} mode="signup" />
        </DialogContent>
      </Dialog>

      {/* Profile View */}
      <ProfileView 
        open={showProfileView} 
        onOpenChange={handleProfileViewChange} 
      />

      {/* Settings Dialog */}
      <SettingsDialog 
        open={showSettingsDialog} 
        onOpenChange={setShowSettingsDialog} 
      />

      {/* Account Switch Dialog */}
      <Dialog open={showAccountSwitchDialog} onOpenChange={setShowAccountSwitchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Benutzer wechseln</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {savedAccounts.map((account) => {
              const isCurrentUser = account.userId === user.id;
              return (
                <div key={account.userId} className="relative">
                  <button
                    onClick={() => {
                      if (!isCurrentUser) {
                        handleSwitchAccount(account);
                        setShowAccountSwitchDialog(false);
                      }
                    }}
                    className={`w-full flex flex-col items-center gap-3 p-4 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? 'border-primary bg-primary/10 cursor-default'
                        : 'border-border hover:bg-accent cursor-pointer'
                    }`}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={account.avatarUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {account.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="font-medium text-sm truncate max-w-[120px]">{account.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {isCurrentUser ? 'Aktuell' : 'Wechseln'}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleRemoveAccount(account.userId, e)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors border border-border"
                    title="Account entfernen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileButton;