import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, Type, ZoomIn, Moon } from 'lucide-react';

interface AppSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AppSettings = ({ open, onOpenChange }: AppSettingsProps) => {
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedVolume = localStorage.getItem('volume');
    const savedZoomLevel = localStorage.getItem('zoomLevel');

    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
    if (savedVolume) setVolume(Number(savedVolume));
    if (savedZoomLevel) setZoomLevel(Number(savedZoomLevel));
  }, []);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Einstellungen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppSettings;
