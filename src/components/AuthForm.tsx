import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FlagQuizLogo from '@/components/FlagQuizLogo';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be less than 20 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Only alphanumeric characters, dash and underscore allowed')
});

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required')
});

interface AuthFormProps {
  onSuccess: () => void;
  mode?: 'signin' | 'signup';
  message?: string;
}

const AuthForm = ({ onSuccess, mode = 'signin', message }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signInSchema.parse({ email, password });
      setIsLoading(true);

      const { error } = await signIn(validated.email, validated.password);

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
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signUpSchema.parse({ email, password, username });
      setIsLoading(true);

      const { error } = await signUp(validated.email, validated.password, validated.username);

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
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-4">
        <FlagQuizLogo size="md" variant="light" className="mb-2" />
        {message && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
            <p className="text-sm text-blue-400 font-medium">{message}</p>
          </div>
        )}
        <p className="text-sm text-white">
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
          <span className="bg-background px-2 text-white">oder</span>
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