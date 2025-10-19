import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QuizPage from "./pages/QuizPage";
import QuizMenuPage from "./pages/QuizMenuPage";
import ClansPage from "./pages/ClansPage";
import FriendsPage from "./pages/FriendsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import MultiplayerPage from "./pages/MultiplayerPage";
import DailyChallengePage from "./pages/DailyChallengePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SystemBanner from "./components/SystemBanner";
import MaintenanceScreen from "./components/MaintenanceScreen";
import ConsentDialog from "./components/ConsentDialog";
import { InvitationBanner } from "./components/InvitationBanner";
import { useAdmin } from "./hooks/useAdmin";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, needsConsent, setNeedsConsent } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const handleConsent = (accepted: boolean) => {
    if (user) {
      localStorage.setItem(`flagquiz_consent_${user.id}`, accepted ? 'accepted' : 'declined');
    }
    setNeedsConsent(false);
  };

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .single();

        if (data?.value) {
          const maintenance = data.value as unknown as { enabled: boolean; message: string };
          setMaintenanceMode(maintenance.enabled);
          setMaintenanceMessage(maintenance.message);
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenanceMode();

    // Subscribe to changes
    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.maintenance_mode'
        },
        (payload) => {
          const newData = payload.new as { value: unknown };
          const maintenance = newData?.value as { enabled: boolean; message: string };
          if (maintenance) {
            setMaintenanceMode(maintenance.enabled);
            setMaintenanceMessage(maintenance.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  // Only show maintenance screen to non-admin users
  if (maintenanceMode && !isAdmin) {
    return <MaintenanceScreen message={maintenanceMessage} />;
  }

  return (
    <LanguageProvider>
      <TooltipProvider>
        <SystemBanner />
        <Toaster />
        <Sonner />
        <ConsentDialog open={needsConsent} onConsent={handleConsent} />
        <BrowserRouter>
          <InvitationBanner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/clans" element={<ClansPage />} />
            <Route path="/leaderboards" element={<LeaderboardPage />} />
            <Route path="/quizmenu" element={<QuizMenuPage />} />
            <Route path="/quizmenu/:quizname" element={<QuizPage />} />
            <Route path="/dailychallenge" element={<DailyChallengePage />} />
            <Route path="/einstellungen" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/me" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/multiplayer" element={<MultiplayerPage />} />
            <Route path="/multiplayer/:roomCode" element={<MultiplayerPage />} />
            {/* Legacy routes for backwards compatibility */}
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/:quizname" element={<QuizPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
