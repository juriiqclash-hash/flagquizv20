import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FlagQuizLogo from '@/components/FlagQuizLogo';

interface AuthFormProps {
  onSuccess: () => void;
  mode?: 'signin' | 'signup';
}

const AuthForm = ({ onSuccess, mode = 'signin' }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Fehler beim Anmelden',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erfolgreich angemeldet!',
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(email, password, username);

    if (error) {
      toast({
        title: 'Fehler bei der Registrierung',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Registrierung erfolgreich!',
        description: 'Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.',
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-4">
        <FlagQuizLogo size="md" variant="light" className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {currentMode === 'signin' 
            ? 'Melde dich an, um fortzufahren' 
            : 'Erstelle ein neues Konto'}
        </p>
      </div>

      {currentMode === 'signin' ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="h-12 bg-muted/50 border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-semibold">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 bg-muted/50 border-border"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" 
            disabled={isLoading}
          >
            {isLoading ? 'Anmelden...' : 'Anmelden'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-base font-semibold">E-Mail</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="h-12 bg-muted/50 border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-semibold">Benutzername</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Dein Benutzername"
              className="h-12 bg-muted/50 border-border"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-base font-semibold">Passwort</Label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 bg-muted/50 border-border"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" 
            disabled={isLoading}
          >
            {isLoading ? 'Registrieren...' : 'Registrieren'}
          </Button>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">oder</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={() => {
          setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin');
          setEmail('');
          setPassword('');
          setUsername('');
        }}
      >
        {currentMode === 'signin' ? 'Registrieren' : 'Zur Anmeldung'}
      </Button>
    </div>
  );
};

export default AuthForm;