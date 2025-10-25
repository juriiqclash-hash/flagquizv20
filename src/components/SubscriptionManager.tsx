import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Crown, Star, Zap, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export const SubscriptionManager = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { subscription, loading, cancelSubscription } = useSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Crown className="w-8 h-8 text-amber-500" />;
      case 'ultimate':
        return <Star className="w-8 h-8 text-purple-500" />;
      default:
        return <Zap className="w-8 h-8 text-blue-500" />;
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'FlagMaster';
      case 'ultimate':
        return 'World Genius';
      default:
        return 'Free';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'from-amber-500 to-amber-600';
      case 'ultimate':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      await cancelSubscription();
      toast.success('Abo gekündigt', {
        description: 'Dein Abo wurde zum Ende der Laufzeit gekündigt.',
      });
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Fehler', {
        description: 'Das Abo konnte nicht gekündigt werden.',
      });
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) return null;

  return (
    <>
      <Card className={`bg-gradient-to-br ${getPlanColor(subscription.plan)} border-2 border-white/30 text-white`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getPlanIcon(subscription.plan)}
            <div>
              <CardTitle className="text-2xl text-white">{getPlanName(subscription.plan)}</CardTitle>
              <CardDescription className="text-white/80">
                {subscription.plan === 'free'
                  ? 'Kostenloser Plan'
                  : 'Premium aktiv'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {subscription.plan !== 'free' && (
            <div className="space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Status:</span>
                <span className="font-semibold">
                  {subscription.status === 'active'
                    ? 'Aktiv'
                    : subscription.status === 'canceled'
                    ? 'Gekündigt'
                    : 'Abgelaufen'}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Verlängert am:</span>
                  <span className="font-semibold">
                    {new Date(subscription.current_period_end).toLocaleDateString('de-DE')}
                  </span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="flex items-center gap-2 text-sm text-yellow-200 mt-2 p-2 bg-yellow-900/30 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Wird zum Ende der Laufzeit gekündigt</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {subscription.plan === 'free' ? (
            <Button
              onClick={() => navigate('/premium')}
              className="w-full bg-white text-blue-900 hover:bg-white/90"
            >
              Upgrade zu Premium
            </Button>
          ) : (
            <>
              {subscription.plan === 'premium' && (
                <Button
                  onClick={() => navigate('/premium')}
                  className="w-full bg-white text-purple-900 hover:bg-white/90"
                >
                  Upgrade zu Ultimate
                </Button>
              )}
              {!subscription.cancel_at_period_end && (
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  variant="outline"
                  className="w-full bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  Abo kündigen
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Abo kündigen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du dein Abo kündigen möchtest? Du hast noch bis zum Ende der aktuellen Laufzeit Zugriff auf alle Premium-Features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {canceling ? 'Lädt...' : 'Bestätigen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
