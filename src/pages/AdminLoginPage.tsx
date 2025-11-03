import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import FlagQuizLogo from '@/components/FlagQuizLogo';
import { ArrowLeft, Shield } from 'lucide-react';

const ADMIN_PASSWORD = 'stalinnigga67';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password === ADMIN_PASSWORD) {
      // Store admin access in sessionStorage
      sessionStorage.setItem('admin_access', 'true');
      toast({
        title: 'Admin-Zugang gewährt',
        description: 'Willkommen im Admin-Bereich',
      });
      navigate('/admin');
    } else {
      toast({
        title: 'Zugang verweigert',
        description: 'Falsches Passwort',
        variant: 'destructive',
      });
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-800 to-red-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-border">
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-500/10 rounded-full">
                <Shield className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <FlagQuizLogo size="md" className="mb-2" />
            <h1 className="text-2xl font-bold">Admin-Bereich</h1>
            <p className="text-sm text-muted-foreground">
              Bitte Admin-Passwort eingeben
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Passwort
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 bg-muted/50 border-border"
                required
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Wird überprüft...' : 'Admin-Zugang'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
