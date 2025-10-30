import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Image, Bell, Shield, Activity, Zap, Music, Languages, Database, Trash2, Lock, Info, Gamepad2, Palette, Download, Timer, Keyboard, Menu, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Volume2, Type, ZoomIn, Moon, Globe, Sparkles, Maximize, Focus, RotateCcw, Copy, Check, Eye, EyeOff, Loader2, Monitor, Contrast, Save, Gauge, Vibrate } from 'lucide-react';
import { AccountManager } from '@/components/AccountManager';

const SERVER_REGIONS = [
  { value: 'auto', label: 'Automatisch', ping: 0 },
  { value: 'europe', label: 'Europa', ping: 0 },
  { value: 'north_america', label: 'Nordamerika', ping: 0 },
  { value: 'asia', label: 'Asien', ping: 0 },
  { value: 'oceania', label: 'Ozeanien', ping: 0 },
  { value: 'south_america', label: 'Südamerika', ping: 0 },
];

const CATEGORIES = [
  { id: 'general', label: 'Allgemein', icon: Settings },
  { id: 'gameplay', label: 'Spielmechanik', icon: Gamepad2 },
  { id: 'graphics', label: 'Grafik', icon: Image },
  { id: 'theme', label: 'Personalisierung', icon: Palette },
  { id: 'audio', label: 'Audio & Haptik', icon: Music },
  { id: 'controls', label: 'Steuerung', icon: Keyboard },
  { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
  { id: 'privacy', label: 'Datenschutz', icon: Shield },
  { id: 'performance', label: 'Leistung', icon: Zap },
  { id: 'language', label: 'Sprache', icon: Languages },
  { id: 'data', label: 'Daten', icon: Database },
  { id: 'importexport', label: 'Import/Export', icon: Download },
  { id: 'developer', label: 'Entwickler', icon: Activity },
  { id: 'cache', label: 'Cache', icon: Trash2 },
  { id: 'admin', label: 'Admin', icon: Lock },
  { id: 'info', label: 'System-Info', icon: Info },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('general');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [serverRegion, setServerRegion] = useState('auto');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [imageQuality, setImageQuality] = useState('high');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [blurIntensity, setBlurIntensity] = useState(10);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 KB');
  const [copiedId, setCopiedId] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [statisticsPublic, setStatisticsPublic] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [fpsDisplayEnabled, setFpsDisplayEnabled] = useState(false);
  const [fontFamily, setFontFamily] = useState('default');
  const [performanceMode, setPerformanceMode] = useState('high');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [networkStatsEnabled, setNetworkStatsEnabled] = useState(false);
  const [ping, setPing] = useState(0);
  const [latency, setLatency] = useState(0);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isConnectingToServer, setIsConnectingToServer] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [language, setLanguage] = useState('de');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [dataUsageMode, setDataUsageMode] = useState('normal');

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSpeed, setTimerSpeed] = useState(100);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [autoNextQuestion, setAutoNextQuestion] = useState(false);

  const [themeColor, setThemeColor] = useState('blue');
  const [backgroundStyle, setBackgroundStyle] = useState('gradient');
  const [uiLayout, setUiLayout] = useState('normal');
  const [buttonStyle, setButtonStyle] = useState('default');

  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  const [voiceVolume, setVoiceVolume] = useState(50);

  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = useState(true);
  const [touchGesturesEnabled, setTouchGesturesEnabled] = useState(true);
  const [mouseSpeed, setMouseSpeed] = useState(50);

  const [notifyFriendRequests, setNotifyFriendRequests] = useState(true);
  const [notifyGameInvites, setNotifyGameInvites] = useState(true);
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyLeaderboard, setNotifyLeaderboard] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationSound, setNotificationSound] = useState('default');

  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);

  const appVersion = '0.0.0';
  const buildNumber = Date.now().toString().slice(-8);

  useEffect(() => {
    loadSettings();
    calculateCacheSize();
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [user]);

  const loadSettings = async () => {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedVolume = localStorage.getItem('volume');
    const savedZoomLevel = localStorage.getItem('zoomLevel');
    const savedAnimations = localStorage.getItem('animationsEnabled');
    const savedImageQuality = localStorage.getItem('imageQuality');
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    const savedFullscreen = localStorage.getItem('fullscreenMode');
    const savedBlur = localStorage.getItem('blurEnabled');
    const savedBlurIntensity = localStorage.getItem('blurIntensity');
    const savedServerRegion = localStorage.getItem('serverRegion');

    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    if (savedVolume) setVolume(Number(savedVolume));
    if (savedZoomLevel) setZoomLevel(Number(savedZoomLevel));
    if (savedAnimations) setAnimationsEnabled(savedAnimations === 'true');
    if (savedImageQuality) setImageQuality(savedImageQuality);
    if (savedNotifications) setNotificationsEnabled(savedNotifications === 'true');
    if (savedFullscreen) setFullscreenMode(savedFullscreen === 'true');
    if (savedBlur) setBlurEnabled(savedBlur === 'true');
    if (savedBlurIntensity) setBlurIntensity(Number(savedBlurIntensity));
    if (savedServerRegion) setServerRegion(savedServerRegion);

    const savedProfileVisibility = localStorage.getItem('profileVisibility');
    const savedStatisticsPublic = localStorage.getItem('statisticsPublic');
    const savedAnalyticsEnabled = localStorage.getItem('analyticsEnabled');
    const savedFpsDisplay = localStorage.getItem('fpsDisplayEnabled');
    const savedFontFamily = localStorage.getItem('fontFamily');
    const savedPerformanceMode = localStorage.getItem('performanceMode');
    const savedHighContrast = localStorage.getItem('highContrastMode');
    const savedNetworkStats = localStorage.getItem('networkStatsEnabled');
    const savedAutoSave = localStorage.getItem('autoSaveEnabled');
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    const savedLanguage = localStorage.getItem('language');
    const savedSoundEffects = localStorage.getItem('soundEffectsEnabled');
    const savedHapticFeedback = localStorage.getItem('hapticFeedback');
    const savedDataUsageMode = localStorage.getItem('dataUsageMode');

    if (savedProfileVisibility) setProfileVisibility(savedProfileVisibility);
    if (savedStatisticsPublic) setStatisticsPublic(savedStatisticsPublic === 'true');
    if (savedAnalyticsEnabled) setAnalyticsEnabled(savedAnalyticsEnabled === 'true');
    if (savedFpsDisplay) setFpsDisplayEnabled(savedFpsDisplay === 'true');
    if (savedFontFamily) setFontFamily(savedFontFamily);
    if (savedPerformanceMode) setPerformanceMode(savedPerformanceMode);
    if (savedHighContrast) setHighContrastMode(savedHighContrast === 'true');
    if (savedNetworkStats) setNetworkStatsEnabled(savedNetworkStats === 'true');
    if (savedAutoSave) setAutoSaveEnabled(savedAutoSave === 'true');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedSoundEffects) setSoundEffectsEnabled(savedSoundEffects === 'true');
    if (savedHapticFeedback) setHapticFeedback(savedHapticFeedback === 'true');
    if (savedDataUsageMode) setDataUsageMode(savedDataUsageMode);

    if (user) {
      const { data, error } = await (supabase as any)
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setServerRegion(data.server_region || 'auto');
        setAnimationsEnabled(data.animations_enabled ?? true);
        setImageQuality(data.image_quality || 'high');
        setNotificationsEnabled(data.notifications_enabled ?? false);
        setFullscreenMode(data.fullscreen_mode ?? false);
        setBlurEnabled(data.blur_enabled ?? true);
        setBlurIntensity(data.blur_intensity ?? 10);
        setProfileVisibility(data.profile_visibility || 'public');
        setStatisticsPublic(data.statistics_public ?? true);
        setAnalyticsEnabled(data.analytics_enabled ?? true);
        setFpsDisplayEnabled(data.fps_display_enabled ?? false);
        setFontFamily(data.font_family || 'default');
        setPerformanceMode(data.performance_mode || 'high');
        setHighContrastMode(data.high_contrast_mode ?? false);
        setNetworkStatsEnabled(data.network_stats_enabled ?? false);
      }
    }
  };

  const saveToDatabase = async (settings: any) => {
    if (!user) return;

    const { error } = await (supabase as any)
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
      });

    if (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    document.body.style.zoom = `${zoomLevel}%`;
    localStorage.setItem('zoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  useEffect(() => {
    if (animationsEnabled) {
      document.documentElement.classList.remove('no-animations');
    } else {
      document.documentElement.classList.add('no-animations');
    }
    localStorage.setItem('animationsEnabled', animationsEnabled.toString());
    saveToDatabase({ animations_enabled: animationsEnabled });
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem('imageQuality', imageQuality);
    saveToDatabase({ image_quality: imageQuality });
  }, [imageQuality]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    saveToDatabase({ notifications_enabled: notificationsEnabled });
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('fullscreenMode', fullscreenMode.toString());
    saveToDatabase({ fullscreen_mode: fullscreenMode });
  }, [fullscreenMode]);

  useEffect(() => {
    if (blurEnabled) {
      document.documentElement.style.setProperty('--blur-enabled', 'blur(' + blurIntensity + 'px)');
    } else {
      document.documentElement.style.setProperty('--blur-enabled', 'none');
    }
    localStorage.setItem('blurEnabled', blurEnabled.toString());
    saveToDatabase({ blur_enabled: blurEnabled });
  }, [blurEnabled, blurIntensity]);

  useEffect(() => {
    if (blurEnabled) {
      document.documentElement.style.setProperty('--blur-enabled', 'blur(' + blurIntensity + 'px)');
    }
    localStorage.setItem('blurIntensity', blurIntensity.toString());
    saveToDatabase({ blur_intensity: blurIntensity });
  }, [blurIntensity]);

  useEffect(() => {
    const previousRegion = localStorage.getItem('serverRegion');
    if (previousRegion && previousRegion !== serverRegion) {
      setIsConnectingToServer(true);
      setTimeout(() => {
        setIsConnectingToServer(false);
        toast({
          title: '✓ Verbunden',
          description: `Sie sind mit dem Server "${SERVER_REGIONS.find(r => r.value === serverRegion)?.label}" verbunden`,
        });
      }, 1000);
    }
    localStorage.setItem('serverRegion', serverRegion);
    saveToDatabase({ server_region: serverRegion });
  }, [serverRegion]);

  useEffect(() => {
    localStorage.setItem('profileVisibility', profileVisibility);
    saveToDatabase({ profile_visibility: profileVisibility });
  }, [profileVisibility]);

  useEffect(() => {
    localStorage.setItem('statisticsPublic', statisticsPublic.toString());
    saveToDatabase({ statistics_public: statisticsPublic });
  }, [statisticsPublic]);

  useEffect(() => {
    localStorage.setItem('analyticsEnabled', analyticsEnabled.toString());
    saveToDatabase({ analytics_enabled: analyticsEnabled });
  }, [analyticsEnabled]);

  useEffect(() => {
    localStorage.setItem('fpsDisplayEnabled', fpsDisplayEnabled.toString());
    saveToDatabase({ fps_display_enabled: fpsDisplayEnabled });
  }, [fpsDisplayEnabled]);

  useEffect(() => {
    document.documentElement.style.fontFamily = fontFamily === 'default' ? '' : fontFamily;
    localStorage.setItem('fontFamily', fontFamily);
    saveToDatabase({ font_family: fontFamily });
  }, [fontFamily]);

  useEffect(() => {
    applyPerformanceMode(performanceMode);
    localStorage.setItem('performanceMode', performanceMode);
    saveToDatabase({ performance_mode: performanceMode });
  }, [performanceMode]);

  useEffect(() => {
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('highContrastMode', highContrastMode.toString());
    saveToDatabase({ high_contrast_mode: highContrastMode });
  }, [highContrastMode]);

  useEffect(() => {
    localStorage.setItem('networkStatsEnabled', networkStatsEnabled.toString());
    saveToDatabase({ network_stats_enabled: networkStatsEnabled });
    if (networkStatsEnabled) {
      measureNetworkStats();
    }
  }, [networkStatsEnabled]);

  useEffect(() => {
    localStorage.setItem('autoSaveEnabled', autoSaveEnabled.toString());
  }, [autoSaveEnabled]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('no-animations');
      setAnimationsEnabled(false);
    }
    localStorage.setItem('reducedMotion', reducedMotion.toString());
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('soundEffectsEnabled', soundEffectsEnabled.toString());
  }, [soundEffectsEnabled]);

  useEffect(() => {
    localStorage.setItem('hapticFeedback', hapticFeedback.toString());
  }, [hapticFeedback]);

  useEffect(() => {
    localStorage.setItem('dataUsageMode', dataUsageMode);
    if (dataUsageMode === 'low') {
      setImageQuality('low');
      setAnimationsEnabled(false);
    } else if (dataUsageMode === 'normal') {
      setImageQuality('high');
    }
  }, [dataUsageMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenMode(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const applyPerformanceMode = (mode: string) => {
    const root = document.documentElement;
    root.classList.remove('perf-bad', 'perf-performance', 'perf-high', 'perf-ultra');

    switch(mode) {
      case 'bad':
        root.classList.add('perf-bad');
        setAnimationsEnabled(false);
        setImageQuality('low');
        setBlurEnabled(false);
        break;
      case 'performance':
        root.classList.add('perf-performance');
        setAnimationsEnabled(false);
        setImageQuality('medium');
        setBlurIntensity(5);
        break;
      case 'high':
        root.classList.add('perf-high');
        setAnimationsEnabled(true);
        setImageQuality('high');
        setBlurIntensity(10);
        break;
      case 'ultra':
        root.classList.add('perf-ultra');
        setAnimationsEnabled(true);
        setImageQuality('ultra');
        setBlurIntensity(15);
        break;
    }
  };

  const measureNetworkStats = async () => {
    const measurePing = async () => {
      const start = performance.now();
      try {
        await fetch(window.location.origin, { method: 'HEAD', cache: 'no-cache' });
        const end = performance.now();
        const pingValue = Math.round(end - start);
        setPing(pingValue);
        setLatency(pingValue);
      } catch (error) {
        setPing(0);
        setLatency(0);
      }
    };

    measurePing();
    const interval = setInterval(measurePing, 5000);
    return () => clearInterval(interval);
  };

  const calculateCacheSize = () => {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeInKB = (totalSize / 1024).toFixed(2);
    setCacheSize(`${sizeInKB} KB`);
  };

  const handleClearCache = () => {
    const keysToKeep = ['fontSize', 'darkMode', 'volume', 'zoomLevel', 'animationsEnabled', 'imageQuality', 'notificationsEnabled', 'fullscreenMode', 'blurEnabled', 'blurIntensity', 'serverRegion'];

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    }

    calculateCacheSize();
    setShowClearCacheDialog(false);
    toast({
      title: 'Cache geleert',
      description: 'Der Cache wurde erfolgreich geleert.',
    });
  };

  const handleResetSettings = () => {
    setFontSize(16);
    setDarkMode(false);
    setVolume(50);
    setZoomLevel(100);
    setServerRegion('auto');
    setAnimationsEnabled(true);
    setImageQuality('high');
    setNotificationsEnabled(false);
    setFullscreenMode(false);
    setBlurEnabled(true);
    setBlurIntensity(10);

    localStorage.clear();

    if (user) {
      (supabase as any)
        .from('user_settings')
        .delete()
        .eq('user_id', user.id)
        .then(() => {
          setShowResetDialog(false);
          toast({
            title: 'Einstellungen zurückgesetzt',
            description: 'Alle Einstellungen wurden auf die Standardwerte zurückgesetzt.',
          });
          setTimeout(() => window.location.reload(), 1000);
        });
    } else {
      setShowResetDialog(false);
      toast({
        title: 'Einstellungen zurückgesetzt',
        description: 'Alle Einstellungen wurden auf die Standardwerte zurückgesetzt.',
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleNotificationsToggle = async (checked: boolean) => {
    if (!checked) {
      setNotificationsEnabled(false);
      return;
    }

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        toast({
          title: 'Benachrichtigungen aktiviert',
          description: 'Sie erhalten jetzt Benachrichtigungen.',
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('Benachrichtigungen aktiviert!', {
            body: 'Sie erhalten jetzt Benachrichtigungen von FlagQuiz.',
            icon: '/flagquiz-logo.png'
          });
          toast({
            title: 'Benachrichtigungen aktiviert',
            description: 'Sie erhalten jetzt Benachrichtigungen.',
          });
        } else {
          toast({
            title: 'Berechtigung verweigert',
            description: 'Benachrichtigungen wurden blockiert.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Blockiert',
          description: 'Benachrichtigungen sind in den Browser-Einstellungen blockiert.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFullscreenToggle = (checked: boolean) => {
    if (checked && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setFullscreenMode(true);
      }).catch(() => {
        setFullscreenMode(false);
        toast({
          title: 'Fehler',
          description: 'Vollbildmodus konnte nicht aktiviert werden.',
          variant: 'destructive',
        });
      });
    } else if (!checked && document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setFullscreenMode(false);
      }).catch(() => {
        toast({
          title: 'Fehler',
          description: 'Vollbildmodus konnte nicht deaktiviert werden.',
          variant: 'destructive',
        });
      });
    }
  };

  const getDailyAdminPassword = () => {
    const dayOfWeek = new Date().getDay();
    const passwords = {
      0: 'johnporkishere14',
      1: 'ihatejuice67',
      2: 'iloveagartha41',
      3: 'ihatenixxers83',
      4: 'jatehews99',
      5: 'gurtnibla56',
      6: 'skibidijohn89'
    };
    return passwords[dayOfWeek as keyof typeof passwords];
  };

  const handleAdminAccess = () => {
    const correctPassword = getDailyAdminPassword();
    if (adminPassword === correctPassword) {
      sessionStorage.setItem('adminAccess', 'true');
      sessionStorage.setItem('adminAccessTime', Date.now().toString());
      toast({
        title: 'Zugriff gewährt',
        description: 'Sie werden zum Admin-Panel weitergeleitet.',
      });
      navigate('/admin');
      setAdminPassword('');
    } else {
      toast({
        title: 'Zugriff verweigert',
        description: 'Falsches Passwort.',
        variant: 'destructive',
      });
      setAdminPassword('');
    }
  };

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      toast({
        title: 'ID kopiert',
        description: 'Benutzer-ID wurde in die Zwischenablage kopiert.',
      });
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Allgemeine Einstellungen</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Grundlegende Einstellungen für die Anwendung</p>
            </div>

            {/* Account Manager Section */}
            <div className="mb-6">
              <AccountManager />
            </div>

            <Separator />

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="server-region" className="flex items-center gap-2 text-base">
                  <Globe className="h-5 w-5" />
                  Server-Region
                </Label>
                <Select value={serverRegion} onValueChange={setServerRegion} disabled={isConnectingToServer}>
                  <SelectTrigger id="server-region">
                    {isConnectingToServer ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verbinde...</span>
                      </div>
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {SERVER_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Wählen Sie die Region für die beste Verbindung
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="font-size" className="flex items-center gap-2 text-base">
                  <Type className="h-5 w-5" />
                  Schriftgröße
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{fontSize}px</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="dark-mode" className="flex items-center gap-2 text-base">
                  <Moon className="h-5 w-5" />
                  Dark Mode
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {darkMode ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="volume" className="flex items-center gap-2 text-base">
                  <Volume2 className="h-5 w-5" />
                  Lautstärke
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{volume}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="zoom-level" className="flex items-center gap-2 text-base">
                  <ZoomIn className="h-5 w-5" />
                  Zoom Level
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="zoom-level"
                    min={75}
                    max={150}
                    step={5}
                    value={[zoomLevel]}
                    onValueChange={(value) => setZoomLevel(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{zoomLevel}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="fullscreen" className="flex items-center gap-2 text-base">
                  <Maximize className="h-5 w-5" />
                  Vollbildmodus
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {fullscreenMode ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="fullscreen"
                    checked={fullscreenMode}
                    onCheckedChange={handleFullscreenToggle}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Drücke F11 oder Esc zum Beenden
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="auto-save" className="flex items-center gap-2 text-base">
                  <Save className="h-5 w-5" />
                  Automatisches Speichern
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {autoSaveEnabled ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="auto-save"
                    checked={autoSaveEnabled}
                    onCheckedChange={setAutoSaveEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Speichert Fortschritt automatisch während des Spiels
                </p>
              </div>
            </div>
          </div>
        );

      case 'graphics':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Grafikeinstellungen</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Visuelle Einstellungen und Effekte</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="animations" className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5" />
                  Animationen
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {animationsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="animations"
                    checked={animationsEnabled}
                    onCheckedChange={setAnimationsEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deaktivieren für bessere Performance
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="image-quality" className="flex items-center gap-2 text-base">
                  <Image className="h-5 w-5" />
                  Bildqualität
                </Label>
                <Select value={imageQuality} onValueChange={setImageQuality}>
                  <SelectTrigger id="image-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="blur" className="flex items-center gap-2 text-base">
                  <Focus className="h-5 w-5" />
                  Hintergrund-Blur
                </Label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {blurEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="blur"
                    checked={blurEnabled}
                    onCheckedChange={setBlurEnabled}
                  />
                </div>
                {blurEnabled && (
                  <div className="flex items-center gap-4">
                    <Slider
                      id="blur-intensity"
                      min={0}
                      max={20}
                      step={1}
                      value={[blurIntensity]}
                      onValueChange={(value) => setBlurIntensity(value[0])}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">{blurIntensity}px</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="high-contrast" className="flex items-center gap-2 text-base">
                  <Contrast className="h-5 w-5" />
                  High-Contrast Modus
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {highContrastMode ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="high-contrast"
                    checked={highContrastMode}
                    onCheckedChange={setHighContrastMode}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Erhöhter Kontrast und Sättigung für bessere Lesbarkeit
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="reduced-motion" className="flex items-center gap-2 text-base">
                  <Gauge className="h-5 w-5" />
                  Bewegungen reduzieren
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {reducedMotion ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="reduced-motion"
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deaktiviert Animationen für Personen mit Bewegungsempfindlichkeit
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="colorblind-mode" className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5" />
                  Farbblindheitsmodus
                </Label>
                <Select value={colorBlindMode} onValueChange={setColorBlindMode}>
                  <SelectTrigger id="colorblind-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein</SelectItem>
                    <SelectItem value="protanopia">Protanopie (Rot-Schwäche)</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopie (Grün-Schwäche)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopie (Blau-Schwäche)</SelectItem>
                    <SelectItem value="monochromacy">Achromatopsie (Farbenblind)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Passt Farben für bessere Sichtbarkeit an
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="screen-reader" className="flex items-center gap-2 text-base">
                  Screen Reader Support
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {screenReaderMode ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="screen-reader"
                    checked={screenReaderMode}
                    onCheckedChange={setScreenReaderMode}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optimiert die App für Screenreader
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="text-to-speech" className="flex items-center gap-2 text-base">
                  Text-zu-Sprache
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {textToSpeech ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="text-to-speech"
                    checked={textToSpeech}
                    onCheckedChange={setTextToSpeech}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Liest Text-Inhalte laut vor
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="keyboard-nav" className="flex items-center gap-2 text-base">
                  <Keyboard className="h-5 w-5" />
                  Tastatur-Navigation
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {keyboardNavigation ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="keyboard-nav"
                    checked={keyboardNavigation}
                    onCheckedChange={setKeyboardNavigation}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Verbesserte Tastatur-Navigation mit visuellen Fokus-Indikatoren
                </p>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Benachrichtigungen</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Verwaltung von Push-Benachrichtigungen</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="notifications" className="flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5" />
                  Benachrichtigungen
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {notificationsEnabled ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={(checked) => {
                      setNotificationsEnabled(checked);
                      if (checked) {
                        handleNotificationsToggle(true);
                      }
                    }}
                    disabled={notificationPermission === 'denied'}
                  />
                </div>
                {notificationPermission === 'denied' && (
                  <p className="text-xs text-destructive">
                    Benachrichtigungen sind in Ihrem Browser blockiert.
                  </p>
                )}
              </div>

              {notificationsEnabled && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-medium">Benachrichtigungstypen</Label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-friend-requests" className="text-sm font-medium">
                            Freundschaftsanfragen
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Bei neuen Freundschaftsanfragen benachrichtigen
                          </p>
                        </div>
                        <Switch
                          id="notify-friend-requests"
                          checked={notifyFriendRequests}
                          onCheckedChange={setNotifyFriendRequests}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-game-invites" className="text-sm font-medium">
                            Spiel-Einladungen
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Bei Einladungen zu Multiplayer-Spielen
                          </p>
                        </div>
                        <Switch
                          id="notify-game-invites"
                          checked={notifyGameInvites}
                          onCheckedChange={setNotifyGameInvites}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-achievements" className="text-sm font-medium">
                            Achievements
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Bei erreichten Erfolgen und Meilensteinen
                          </p>
                        </div>
                        <Switch
                          id="notify-achievements"
                          checked={notifyAchievements}
                          onCheckedChange={setNotifyAchievements}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notify-leaderboard" className="text-sm font-medium">
                            Leaderboard-Updates
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Bei Änderungen in der Rangliste
                          </p>
                        </div>
                        <Switch
                          id="notify-leaderboard"
                          checked={notifyLeaderboard}
                          onCheckedChange={setNotifyLeaderboard}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label htmlFor="notification-sound" className="flex items-center gap-2 text-base">
                      <Music className="h-5 w-5" />
                      Benachrichtigungston
                    </Label>
                    <Select value={notificationSound} onValueChange={setNotificationSound}>
                      <SelectTrigger id="notification-sound">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Standard</SelectItem>
                        <SelectItem value="chime">Glockenspiel</SelectItem>
                        <SelectItem value="bell">Glocke</SelectItem>
                        <SelectItem value="ding">Ding</SelectItem>
                        <SelectItem value="none">Kein Ton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications" className="text-sm font-medium">
                          E-Mail-Benachrichtigungen
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Erhalte wichtige Updates per E-Mail
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Datenschutz</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Ihre Privatsphäre und Sichtbarkeit</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility" className="text-sm font-medium">
                      Profilsichtbarkeit
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {profileVisibility === 'public' ? 'Jeder kann Ihr Profil sehen' : 'Nur Sie können Ihr Profil sehen'}
                    </p>
                  </div>
                  <Switch
                    id="profile-visibility"
                    checked={profileVisibility === 'public'}
                    onCheckedChange={(checked) => setProfileVisibility(checked ? 'public' : 'private')}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="statistics-public" className="text-sm font-medium">
                      Statistiken öffentlich
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Andere können Ihre Spielstatistiken sehen
                    </p>
                  </div>
                  <Switch
                    id="statistics-public"
                    checked={statisticsPublic}
                    onCheckedChange={setStatisticsPublic}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics" className="text-sm font-medium">
                      Nutzungsdaten sammeln
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Hilft uns die App zu verbessern
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={analyticsEnabled}
                    onCheckedChange={setAnalyticsEnabled}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'developer':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Entwickler-Optionen</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Erweiterte Optionen für Entwickler und Debugging</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fps-display" className="text-sm font-medium">
                      FPS-Anzeige
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Zeigt Frames pro Sekunde in der Ecke an
                    </p>
                  </div>
                  <Switch
                    id="fps-display"
                    checked={fpsDisplayEnabled}
                    onCheckedChange={setFpsDisplayEnabled}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="network-stats" className="text-sm font-medium">
                      Netzwerkstatistiken
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Zeigt Ping und Latenz wie FPS an
                    </p>
                  </div>
                  <Switch
                    id="network-stats"
                    checked={networkStatsEnabled}
                    onCheckedChange={setNetworkStatsEnabled}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Leistung</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Optimierung der Performance</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="performance-mode" className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5" />
                  Leistungsmodus
                </Label>
                <Select value={performanceMode} onValueChange={setPerformanceMode}>
                  <SelectTrigger id="performance-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bad">Bad (Minimale Grafik)</SelectItem>
                    <SelectItem value="performance">Performance (Reduzierte Effekte)</SelectItem>
                    <SelectItem value="high">High (Empfohlen)</SelectItem>
                    <SelectItem value="ultra">Ultra (Maximale Qualität)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Passt Animationen, Bildqualität und Effekte automatisch an
                </p>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Audio & Haptik</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Sound und Vibration</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="music-volume" className="flex items-center gap-2 text-base">
                  <Music className="h-5 w-5" />
                  Musik-Lautstärke
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="music-volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[musicVolume]}
                    onValueChange={(value) => setMusicVolume(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{musicVolume}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="sfx-volume" className="flex items-center gap-2 text-base">
                  <Volume2 className="h-5 w-5" />
                  Soundeffekt-Lautstärke
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="sfx-volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[sfxVolume]}
                    onValueChange={(value) => setSfxVolume(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{sfxVolume}%</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="voice-volume" className="flex items-center gap-2 text-base">
                  Stimmen-Lautstärke
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="voice-volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[voiceVolume]}
                    onValueChange={(value) => setVoiceVolume(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{voiceVolume}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-effects" className="text-sm font-medium">
                      Soundeffekte
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Aktiviert Soundeffekte in der App
                    </p>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={soundEffectsEnabled}
                    onCheckedChange={setSoundEffectsEnabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="haptic-feedback" className="text-sm font-medium">
                      Haptisches Feedback
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Vibrationen bei Interaktionen (Mobilgeräte)
                    </p>
                  </div>
                  <Switch
                    id="haptic-feedback"
                    checked={hapticFeedback}
                    onCheckedChange={setHapticFeedback}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Sprache</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Spracheinstellungen</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="language" className="flex items-center gap-2 text-base">
                  <Languages className="h-5 w-5" />
                  Sprache
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  App-Sprache ändern (erfordert Neuladen)
                </p>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Datenverbrauch</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Verwaltung des Datenverbrauchs</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="data-usage" className="flex items-center gap-2 text-base">
                  <Database className="h-5 w-5" />
                  Datenverbrauch
                </Label>
                <Select value={dataUsageMode} onValueChange={setDataUsageMode}>
                  <SelectTrigger id="data-usage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig (Daten sparen)</SelectItem>
                    <SelectItem value="normal">Normal (Empfohlen)</SelectItem>
                    <SelectItem value="high">Hoch (Beste Qualität)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Steuert Bildqualität und Datenübertragung
                </p>
              </div>
            </div>
          </div>
        );

      case 'cache':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Cache-Verwaltung</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Verwaltung von zwischengespeicherten Daten</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Trash2 className="h-5 w-5" />
                  Cache-Verwaltung
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Cache-Größe: {cacheSize}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowClearCacheDialog(true)}
                  >
                    Cache leeren
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <RotateCcw className="h-5 w-5" />
                  Einstellungen zurücksetzen
                </Label>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowResetDialog(true)}
                >
                  Alle Einstellungen zurücksetzen
                </Button>
              </div>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Admin-Bereich</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Zugang zum Administrator-Panel</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Lock className="h-5 w-5" />
                  Admin-Bereich
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type={showAdminPassword ? 'text' : 'password'}
                      placeholder="Admin-Passwort eingeben"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button onClick={handleAdminAccess} disabled={!adminPassword}>
                      Zugriff
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nur für autorisierte Administratoren
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">System-Informationen</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Informationen über die Anwendung</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Info className="h-5 w-5" />
                  System-Informationen
                </Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">{appVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Build-Nummer:</span>
                    <span className="font-medium">{buildNumber}</span>
                  </div>
                  {user && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Benutzer-ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={copyUserId}
                        >
                          {copiedId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'gameplay':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Spielmechanik</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Passe das Spielverhalten an deine Bedürfnisse an</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="timer-enabled" className="flex items-center gap-2 text-base">
                  <Timer className="h-5 w-5" />
                  Timer
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {timerEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="timer-enabled"
                    checked={timerEnabled}
                    onCheckedChange={setTimerEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Zeit-Begrenzung für Quiz-Fragen
                </p>
              </div>

              {timerEnabled && (
                <div className="space-y-3">
                  <Label htmlFor="timer-speed" className="flex items-center gap-2 text-base">
                    Timer-Geschwindigkeit
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="timer-speed"
                      min={50}
                      max={150}
                      step={10}
                      value={[timerSpeed]}
                      onValueChange={(value) => setTimerSpeed(value[0])}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12 text-right">{timerSpeed}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    100% = Normal, 50% = Langsamer, 150% = Schneller
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="difficulty" className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5" />
                  Schwierigkeitsgrad
                </Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Einfach</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="hard">Schwer</SelectItem>
                    <SelectItem value="expert">Experte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="hints-enabled" className="flex items-center gap-2 text-base">
                  <Info className="h-5 w-5" />
                  Hinweise
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {hintsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="hints-enabled"
                    checked={hintsEnabled}
                    onCheckedChange={setHintsEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Hilfreiche Tipps während des Spiels
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="auto-next" className="flex items-center gap-2 text-base">
                  Automatisch zur nächsten Frage
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {autoNextQuestion ? 'ON' : 'OFF'}
                  </span>
                  <Switch
                    id="auto-next"
                    checked={autoNextQuestion}
                    onCheckedChange={setAutoNextQuestion}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Springt automatisch zur nächsten Frage nach Beantwortung
                </p>
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Personalisierung</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Passe das Aussehen der App an</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="theme-color" className="flex items-center gap-2 text-base">
                  <Palette className="h-5 w-5" />
                  Farbschema
                </Label>
                <Select value={themeColor} onValueChange={setThemeColor}>
                  <SelectTrigger id="theme-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blau</SelectItem>
                    <SelectItem value="green">Grün</SelectItem>
                    <SelectItem value="red">Rot</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="purple">Lila</SelectItem>
                    <SelectItem value="pink">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="background-style" className="flex items-center gap-2 text-base">
                  <Image className="h-5 w-5" />
                  Hintergrund-Stil
                </Label>
                <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
                  <SelectTrigger id="background-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Einfarbig</SelectItem>
                    <SelectItem value="gradient">Verlauf</SelectItem>
                    <SelectItem value="pattern">Muster</SelectItem>
                    <SelectItem value="image">Bild</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ui-layout" className="flex items-center gap-2 text-base">
                  <Monitor className="h-5 w-5" />
                  UI-Layout
                </Label>
                <Select value={uiLayout} onValueChange={setUiLayout}>
                  <SelectTrigger id="ui-layout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Kompakt</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="spacious">Geräumig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="button-style" className="flex items-center gap-2 text-base">
                  Button-Stil
                </Label>
                <Select value={buttonStyle} onValueChange={setButtonStyle}>
                  <SelectTrigger id="button-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Standard</SelectItem>
                    <SelectItem value="rounded">Abgerundet</SelectItem>
                    <SelectItem value="sharp">Eckig</SelectItem>
                    <SelectItem value="pill">Pill-Form</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'controls':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Steuerung</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Tastatur, Maus und Touch-Einstellungen</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="keyboard-shortcuts" className="flex items-center gap-2 text-base">
                  <Keyboard className="h-5 w-5" />
                  Tastaturkürzel
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {keyboardShortcutsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="keyboard-shortcuts"
                    checked={keyboardShortcutsEnabled}
                    onCheckedChange={setKeyboardShortcutsEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Schnellzugriff via Tastatur (z.B. Leertaste für weiter)
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="touch-gestures" className="flex items-center gap-2 text-base">
                  Touch-Gesten
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {touchGesturesEnabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  <Switch
                    id="touch-gestures"
                    checked={touchGesturesEnabled}
                    onCheckedChange={setTouchGesturesEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Wischen und Touch-Gesten auf Mobilgeräten
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="mouse-speed" className="flex items-center gap-2 text-base">
                  Maus-Empfindlichkeit
                </Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="mouse-speed"
                    min={10}
                    max={100}
                    step={10}
                    value={[mouseSpeed]}
                    onValueChange={(value) => setMouseSpeed(value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-12 text-right">{mouseSpeed}%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'importexport':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Import/Export</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Einstellungen sichern und wiederherstellen</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Download className="h-5 w-5" />
                  Einstellungen exportieren
                </Label>
                <Button
                  className="w-full"
                  onClick={() => {
                    const settings = {
                      fontSize,
                      darkMode,
                      volume,
                      zoomLevel,
                      serverRegion,
                      animationsEnabled,
                      imageQuality,
                      themeColor,
                      backgroundStyle,
                      timerEnabled,
                      timerSpeed,
                      difficultyLevel,
                    };
                    const dataStr = JSON.stringify(settings, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'flagquiz-settings.json';
                    link.click();
                    toast({
                      title: 'Export erfolgreich',
                      description: 'Einstellungen wurden exportiert.',
                    });
                  }}
                >
                  Als JSON-Datei herunterladen
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Download className="h-5 w-5" />
                  Einstellungen importieren
                </Label>
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const settings = JSON.parse(event.target?.result as string);
                          if (settings.fontSize) setFontSize(settings.fontSize);
                          if (settings.darkMode !== undefined) setDarkMode(settings.darkMode);
                          if (settings.volume) setVolume(settings.volume);
                          if (settings.themeColor) setThemeColor(settings.themeColor);
                          toast({
                            title: 'Import erfolgreich',
                            description: 'Einstellungen wurden importiert.',
                          });
                        } catch (error) {
                          toast({
                            title: 'Import fehlgeschlagen',
                            description: 'Ungültige Einstellungsdatei.',
                            variant: 'destructive',
                          });
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Importiere eine zuvor exportierte JSON-Datei
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  QR-Code für Einstellungen-Transfer
                </Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: 'In Entwicklung',
                      description: 'QR-Code Feature kommt bald!',
                    });
                  }}
                >
                  QR-Code generieren
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Zurück</span>
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Einstellungen</h1>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Passen Sie Ihre Präferenzen an</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div className={`
          fixed md:static inset-0 z-40 md:z-auto
          md:w-64 border-slate-800 bg-slate-900/95 md:bg-slate-900/30 backdrop-blur-lg md:backdrop-blur-none
          md:border-r overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Kategorien</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
          <nav className="flex flex-col space-y-1 p-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
            {renderCategoryContent()}
          </div>
        </div>
      </div>

      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cache leeren?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich den Cache leeren? Dies entfernt gespeicherte Daten wie Spielstände und temporäre Dateien. Ihre Einstellungen bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCache}>Cache leeren</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alle Einstellungen zurücksetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion setzt alle Einstellungen auf die Standardwerte zurück und lädt die Seite neu. Dies kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Zurücksetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
