import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Edit3, Lock, Trash2, Upload, UserX, User, Shield, Bell, Palette, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { checkUsernameChangeLimit, incrementUsernameChange } from '@/lib/planLimits';
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsCategory = 'account' | 'privacy' | 'appearance' | 'notifications';

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('account');

  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
      if (data?.username) {
        setCurrentUsername(data.username);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({ title: 'Profilbild aktualisiert!' });
    } catch (error: any) {
      toast({
        title: 'Fehler beim Hochladen',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib eine gültige E-Mail ein',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast({
        title: 'E-Mail geändert',
        description: 'Bitte überprüfe deine E-Mail zur Bestätigung',
      });
      setNewEmail('');
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte gib einen gültigen Benutzernamen ein',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !subscription) return;

    // Check limits
    const plan = subscription.plan || 'free';
    const limitCheck = await checkUsernameChangeLimit(user.id, plan);

    if (!limitCheck.allowed) {
      toast({
        title: 'Limit erreicht',
        description: limitCheck.message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('user_id', user?.id);

      if (error) throw error;

      // Increment counter
      await incrementUsernameChange(user.id);

      setCurrentUsername(newUsername.trim());
      toast({
        title: 'Benutzername geändert',
        description: 'Dein Benutzername wurde erfolgreich aktualisiert',
      });
      setNewUsername('');
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      toast({
        title: 'Fehler',
        description: 'Passwort muss mindestens 6 Zeichen lang sein',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: 'Passwort geändert',
        description: 'Dein Passwort wurde erfolgreich aktualisiert',
      });
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          is_deactivated: true,
          deactivated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      await supabase.auth.signOut();

      toast({
        title: 'Konto deaktiviert',
        description: 'Dein Konto wurde deaktiviert. Du kannst es jederzeit wieder aktivieren.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowDeactivateConfirm(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      if (error) throw error;

      toast({
        title: 'Konto gelöscht',
        description: 'Dein Konto wurde erfolgreich gelöscht',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'account' as SettingsCategory, label: 'Account', icon: User },
    { id: 'privacy' as SettingsCategory, label: 'Datenschutz', icon: Shield },
    { id: 'appearance' as SettingsCategory, label: 'Darstellung', icon: Palette },
    { id: 'notifications' as SettingsCategory, label: 'Benachrichtigungen', icon: Bell },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background w-full h-full max-w-7xl max-h-[90vh] rounded-lg shadow-2xl flex overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="w-64 bg-muted/30 border-r border-border p-6 space-y-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Einstellungen</h2>
            </div>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeCategory === 'account' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center space-y-4 pb-6 border-b border-border">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-lg">{currentUsername || user?.email?.split('@')[0]}</p>
            </div>

                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                        <Upload className="h-4 w-4" />
                        <span>Profilbild ändern</span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </Label>
                  </div>

                  {/* Email Change */}
                  <div className="space-y-2">
            <Label htmlFor="new-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail ändern
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={user?.email || ''}
              />
                      <Button onClick={handleChangeEmail} disabled={isLoading || !newEmail}>
                        Ändern
                      </Button>
                    </div>
                  </div>

                  {/* Username Change */}
                  <div className="space-y-2">
            <Label htmlFor="new-username" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Benutzername ändern
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Neuer Benutzername"
              />
                      <Button onClick={handleChangeUsername} disabled={isLoading || !newUsername}>
                        Ändern
                      </Button>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="space-y-2">
            <Label htmlFor="new-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Passwort ändern
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Neues Passwort"
              />
                      <Button onClick={handleChangePassword} disabled={isLoading || !newPassword}>
                        Ändern
                      </Button>
                    </div>
                  </div>

                  {/* Deactivate Account */}
                  <div className="pt-6 border-t border-border space-y-3">
            {!showDeactivateConfirm ? (
              <Button
                variant="outline"
                className="w-full text-orange-500 hover:bg-orange-500 hover:text-white"
                onClick={() => setShowDeactivateConfirm(true)}
              >
                <UserX className="mr-2 h-4 w-4" />
                Konto deaktivieren
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Dein Konto wird temporär deaktiviert. Du kannst dich jederzeit wieder anmelden, um es zu reaktivieren.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeactivateConfirm(false)}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    onClick={handleDeactivateAccount}
                    disabled={isLoading}
                  >
                    Deaktivieren
                  </Button>
                </div>
              </div>
            )}

                    {/* Delete Account */}
                    {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Konto löschen
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Bist du sicher? Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Löschen
                  </Button>
                    </div>
                  </div>
                )}
                  </div>
                </div>
              )}

              {activeCategory === 'privacy' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Datenschutzeinstellungen</h4>
                    <p className="text-sm text-muted-foreground">
                      Verwalte deine Datenschutzeinstellungen und lege fest, wer dein Profil sehen kann.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Weitere Datenschutzoptionen werden in Kürze verfügbar sein.
                  </div>
                </div>
              )}

              {activeCategory === 'appearance' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Darstellungseinstellungen</h4>
                    <p className="text-sm text-muted-foreground">
                      Passe das Erscheinungsbild der App an deine Vorlieben an.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Theme-Einstellungen werden in Kürze verfügbar sein.
                  </div>
                </div>
              )}

              {activeCategory === 'notifications' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Benachrichtigungseinstellungen</h4>
                    <p className="text-sm text-muted-foreground">
                      Verwalte, welche Benachrichtigungen du erhalten möchtest.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Benachrichtigungseinstellungen werden in Kürze verfügbar sein.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;