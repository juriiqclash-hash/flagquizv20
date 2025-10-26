import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Volume2, Type, ZoomIn, Moon, Globe, Sparkles, Image, Bell, Maximize, Focus, Trash2, RotateCcw, Info, Copy, Check } from 'lucide-react';
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
    localStorage.setItem('serverRegion', serverRegion);
    saveToDatabase({ server_region: serverRegion });
  }, [serverRegion]);

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

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
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
      }
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setFullscreenMode(true);
      }).catch((err) => {
        toast({
          title: 'Fehler',
          description: 'Vollbildmodus konnte nicht aktiviert werden.',
          variant: 'destructive',
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setFullscreenMode(false);
      });
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
              <Select value={serverRegion} onValueChange={setServerRegion}>
                <SelectTrigger id="server-region">
                  <SelectValue />
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
                  {notificationPermission === 'granted' ? 'Erlaubt' : notificationPermission === 'denied' ? 'Blockiert' : 'Nicht aktiviert'}
                </span>
                {notificationPermission !== 'granted' && (
                  <Button size="sm" onClick={handleRequestNotifications}>
                    Aktivieren
                  </Button>
                )}
              </div>
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
                <Button size="sm" onClick={handleToggleFullscreen}>
                  {fullscreenMode ? 'Deaktivieren' : 'Aktivieren'}
                </Button>
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
