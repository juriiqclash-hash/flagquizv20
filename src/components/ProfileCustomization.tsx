import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Paintbrush, X, CreditCard } from 'lucide-react';
import { SubscriptionSettings } from './SubscriptionSettings';

interface ProfileCustomizationProps {
  userId: string;
  currentUsernameColor?: string;
  currentBackgroundColor?: string;
  currentBorderStyle?: string;
  onClose: () => void;
  onUpdate: () => void;
}

const PRESET_COLORS = [
  { name: 'Weiß', value: '#FFFFFF' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Silber', value: '#C0C0C0' },
  { name: 'Rot', value: '#FF0000' },
  { name: 'Blau', value: '#0066FF' },
  { name: 'Grün', value: '#00FF00' },
  { name: 'Lila', value: '#9933FF' },
  { name: 'Pink', value: '#FF69B4' },
  { name: 'Orange', value: '#FF8800' },
  { name: 'Türkis', value: '#00CED1' },
];

const BORDER_STYLES = [
  { name: 'Standard', value: 'solid' },
  { name: 'Doppelt', value: 'double' },
  { name: 'Gestrichelt', value: 'dashed' },
  { name: 'Gepunktet', value: 'dotted' },
  { name: 'Glow', value: 'glow' },
];

export const ProfileCustomization = ({
  userId,
  currentUsernameColor,
  currentBackgroundColor,
  currentBorderStyle,
  onClose,
  onUpdate,
}: ProfileCustomizationProps) => {
  const [usernameColor, setUsernameColor] = useState(currentUsernameColor || '#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState(currentBackgroundColor || '');
  const [borderStyle, setBorderStyle] = useState(currentBorderStyle || 'solid');
  const [saving, setSaving] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username_color: usernameColor,
          background_color: backgroundColor || null,
          profile_border_style: borderStyle,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Profil angepasst!', {
        description: 'Deine Änderungen wurden gespeichert.',
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Fehler', {
        description: 'Deine Änderungen konnten nicht gespeichert werden.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110]">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-2xl">Profil anpassen</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Username Color */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Benutzername Farbe</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setUsernameColor(color.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    usernameColor === color.value
                      ? 'border-blue-600 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {usernameColor === color.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-black/50 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Hintergrundfarbe (Optional)</Label>
            <div className="grid grid-cols-5 gap-2">
              <button
                onClick={() => setBackgroundColor('')}
                className={`h-12 rounded-lg border-2 transition-all bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 ${
                  backgroundColor === ''
                    ? 'border-blue-600 scale-110'
                    : 'border-gray-300 hover:scale-105'
                }`}
                title="Standard"
              >
                {backgroundColor === '' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                )}
              </button>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBackgroundColor(color.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    backgroundColor === color.value
                      ? 'border-blue-600 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {backgroundColor === color.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-black/50 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Border Style */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Rahmen-Stil</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {BORDER_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setBorderStyle(style.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    borderStyle === style.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-semibold text-center">{style.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Vorschau</Label>
            <div 
              className="p-8 rounded-2xl"
              style={{
                background: backgroundColor || 'linear-gradient(to bottom right, rgb(23 37 84), rgb(30 58 138), rgb(29 78 216))',
              }}
            >
              <h1 
                className="text-5xl font-bold text-center"
                style={{ 
                  color: usernameColor,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Benutzername
              </h1>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Abonnement</Label>
            <Button
              onClick={() => setSubscriptionOpen(true)}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Abonnement verwalten
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </div>
      </div>
      
      <SubscriptionSettings
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
      />
    </div>
  );
};
