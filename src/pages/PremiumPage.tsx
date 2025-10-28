import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Star, Zap, X, ArrowLeft, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/data/translations';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingPlan {
  id: 'free' | 'premium' | 'ultimate';
  name: string;
  price: { monthly: string; yearly: string };
  description: string;
  features: string[];
  icon: JSX.Element;
  color: string;
  popular?: boolean;
}

export default function PremiumPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success('Zahlung erfolgreich!', {
        description: 'Dein Premium-Plan wird in Kürze aktiviert. Bitte warte einen Moment.',
      });
      // Remove params from URL
      window.history.replaceState({}, '', '/premium');
    } else if (canceled === 'true') {
      toast.error('Zahlung abgebrochen', {
        description: 'Du hast die Zahlung abgebrochen.',
      });
      // Remove params from URL
      window.history.replaceState({}, '', '/premium');
    }
  }, [searchParams]);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: '0', yearly: '0' },
      description: 'Kostenlos',
      features: [
        'Zugriff auf Standard-Quiz',
        'Multiplayer',
        'Clans',
        'Freunde',
        '✕ Account-Änderungen limitiert',
        '✕ Limitierte Freundesliste',
      ],
      icon: <Zap className="w-10 h-10 text-blue-500" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: '3.99', yearly: '19.99' },
      description: '🇨🇭 CHF / Monat',
      features: [
        'Alle Free-Features',
        'Mehrsprachige Übersetzung',
        'Mehrere Benutzerkonten gleichzeitig eingeloggt',
        'Profil-View anpassbar (Hintergrundfarbe, Benutzername-Farbe)',
        'Unlimitierte Änderungen: Benutzername, Herkunftsland, Freundesliste',
        'Clans mit mehr als 30 Mitgliedern erstellen',
      ],
      icon: <Crown className="w-10 h-10 text-amber-500" />,
      color: 'from-amber-500 to-amber-600',
      popular: true,
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: { monthly: '7.99', yearly: '39.99' },
      description: '🇨🇭 CHF / Monat',
      features: [
        'Alle Premium-Features',
        'Spezielles Badge & Rahmen im Profil',
        'Menü-Design frei anpassbar',
        'Zugriff auf exklusive und noch nicht veröffentlichte Quiz',
        'Exklusive Discord-Rolle',
        'Doppelte XP und Rang-Boost',
      ],
      icon: <Star className="w-10 h-10 text-purple-500" />,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const handleSubscribe = async (plan: 'premium' | 'ultimate') => {
    if (!user) {
      toast.error('Error', {
        description: 'Bitte melde dich an, um fortzufahren.',
      });
      navigate('/login');
      return;
    }

    setLoading(plan);

    try {
      const priceId = billingCycle === 'monthly'
        ? (plan === 'premium' ? 'price_1SLrHPEgHdKvS0zO8QKasnnZ' : 'price_1SLrIOEgHdKvS0zOXc8g0xvR')
        : (plan === 'premium' ? 'price_1SLrKnEgHdKvS0zOzzDlmFkI' : 'price_1SLrL8EgHdKvS0zOFy0VgBSD');

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          success_url: `${window.location.origin}/premium?success=true`,
          cancel_url: `${window.location.origin}/premium?canceled=true`,
          mode: 'subscription',
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error((error as any).message || 'Failed to create checkout session');
      }

      const url = (data as any)?.url;
      if (!url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      toast.error('Fehler beim Checkout', {
        description: message,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url("/F5BD60DF-0BF3-4DCD-B9C2-C433C2CB0628.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-800/90 to-blue-900/90" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="mb-4 text-white hover:bg-white/20 rounded-lg"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Info Banner */}
        <div className="mb-8 bg-blue-500/20 border-2 border-blue-400/50 backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
          <p className="text-white/90 text-sm">
            <strong className="text-white">Hinweis:</strong> Einige Premium-Features befinden sich noch in der Entwicklung und werden in Kürze verfügbar sein. 
            Alle gekauften Pläne werden automatisch freigeschaltet, sobald die Features live gehen.
          </p>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Upgrade zu Premium
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Wähle den perfekten Plan für dein Flaggen-Quiz Erlebnis
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-900 font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-blue-900 font-semibold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Jährlich
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Spare 50%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden backdrop-blur-sm bg-white/95 border-2 transition-all hover:scale-105 ${
                plan.popular ? 'border-amber-500 shadow-2xl md:-mt-4 md:mb-[-16px]' : 'border-white/30'
              }`}
            >
              {plan.popular && (
                <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${plan.color} text-white text-center py-1 text-sm font-bold`}>
                  Am Beliebtesten
                </div>
              )}

              <CardHeader className={plan.popular ? 'pt-8' : ''}>
                <div className="flex items-center justify-between mb-4">
                  {plan.icon}
                  {plan.id !== 'free' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                      🇨🇭 CHF
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>

                <div className="mt-4">
                  {plan.id === 'free' ? (
                    <div className="text-4xl font-bold text-gray-900">
                      Kostenlos
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                        </span>
                        <span className="text-gray-600">CHF</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {billingCycle === 'monthly'
                          ? '/ Monat'
                          : '/ Jahr'}
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => {
                    const isLimited = feature.startsWith('✕ ');
                    const displayText = isLimited ? feature.slice(2) : feature;
                    return (
                      <li key={index} className="flex items-start gap-2">
                        {isLimited ? (
                          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-gray-700">{displayText}</span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.id === 'free' ? (
                  <Button
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700"
                    disabled
                  >
                    Aktueller Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id as 'premium' | 'ultimate')}
                    disabled={loading !== null}
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-bold text-lg py-6`}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Lädt...
                      </span>
                    ) : (
                      'Jetzt kaufen'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/70 text-sm">
            Sichere Zahlung mit Stripe. Unterstützt Kreditkarte, Apple Pay und Google Pay.
          </p>
        </div>
      </div>
    </div>
  );
}
