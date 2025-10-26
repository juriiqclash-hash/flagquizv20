import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Volume2, Type, ZoomIn, Moon, Globe, Sparkles, Image, Bell, Maximize, Focus, Trash2, RotateCcw, Info, Copy, Check, Shield, Eye, EyeOff, Activity, Lock, Loader2, Zap, Monitor, Contrast, Wifi } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface AppSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SERVER_REGIONS = [
  { value: 'auto', label: 'Automatisch', ping: 0 },
  { value: 'europe', label: 'Europa', ping: 0 },
  { value: 'north_america', label: 'Nordamerika', ping: 0 },
  { value: 'asia', label: 'Asien', ping: 0 },
  { value: 'oceania', label: 'Ozeanien', ping: 0 },
  { value: 'south_america', label: 'Südamerika', ping: 0 },
];

const AppSettings = ({ open, onOpenChange }: AppSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  const navigate = useNavigate();

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

    if (savedProfileVisibility) setProfileVisibility(savedProfileVisibility);
    if (savedStatisticsPublic) setStatisticsPublic(savedStatisticsPublic === 'true');
    if (savedAnalyticsEnabled) setAnalyticsEnabled(savedAnalyticsEnabled === 'true');
    if (savedFpsDisplay) setFpsDisplayEnabled(savedFpsDisplay === 'true');
    if (savedFontFamily) setFontFamily(savedFontFamily);
    if (savedPerformanceMode) setPerformanceMode(savedPerformanceMode);
    if (savedHighContrast) setHighContrastMode(savedHighContrast === 'true');
    if (savedNetworkStats) setNetworkStatsEnabled(savedNetworkStats === 'true');

    if (user) {
      const { data, error } = await supabase
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

    const { error } = await supabase
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
    if (fontFamily === 'default') {
      document.documentElement.style.fontFamily = '';
    } else {
      document.documentElement.style.fontFamily = fontFamily;
      document.body.style.fontFamily = fontFamily;
    }
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
        break;
      case 'performance':
        root.classList.add('perf-performance');
        break;
      case 'high':
        root.classList.add('perf-high');
        break;
      case 'ultra':
        root.classList.add('perf-ultra');
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
      supabase
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

  const handleAdminAccess = () => {
    if (adminPassword === 'ihatejuice67') {
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Einstellungen</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
              <Label htmlFor="notifications" className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {notificationsEnabled ? 'Aktiviert' : 'Deaktiviert'}
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

            <Separator />

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5" />
                Datenschutz
              </Label>

              <div className="space-y-4 pl-6">
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

            <Separator />

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5" />
                Entwickler-Optionen
              </Label>

              <div className="space-y-4 pl-6">
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="network-stats" className="text-sm font-medium">
                        Netzwerkstatistiken
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Zeigt Ping und Latenz an
                      </p>
                    </div>
                    <Switch
                      id="network-stats"
                      checked={networkStatsEnabled}
                      onCheckedChange={setNetworkStatsEnabled}
                    />
                  </div>
                  {networkStatsEnabled && (
                    <div className="pl-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-3 w-3" />
                        <span>Ping: {ping}ms | Latenz: {latency}ms</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base">
                <Type className="h-5 w-5" />
                Schriftart
              </Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Standard (System)</SelectItem>
                  <SelectItem value="'Arial', sans-serif">Arial</SelectItem>
                  <SelectItem value="'Helvetica', sans-serif">Helvetica</SelectItem>
                  <SelectItem value="'Verdana', sans-serif">Verdana</SelectItem>
                  <SelectItem value="'Georgia', serif">Georgia</SelectItem>
                  <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                  <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                  <SelectItem value="'Comic Sans MS', cursive">Comic Sans MS</SelectItem>
                  <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="space-y-3">
              <Label htmlFor="high-contrast" className="flex items-center gap-2 text-base">
                <Contrast className="h-5 w-5" />
                High-Contrast Modus
              </Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {highContrastMode ? 'Aktiviert' : 'Deaktiviert'}
                </span>
                <Switch
                  id="high-contrast"
                  checked={highContrastMode}
                  onCheckedChange={setHighContrastMode}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Gelb-Schwarz Farbschema mit hohem Kontrast
              </p>
            </div>

            <Separator />

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

            <Separator />

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

            <Separator />

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
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default AppSettings;
