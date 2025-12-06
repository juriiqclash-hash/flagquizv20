import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Paintbrush, X, CreditCard, Award, Check, Plus, Minus } from 'lucide-react';
import { SubscriptionSettings } from './SubscriptionSettings';
import { useUserPerks, UserBadge } from '@/hooks/useUserPerks';

interface ProfileCustomizationProps {
  userId: string;
  currentUsernameColor?: string;
  currentBackgroundColor?: string;
  currentBorderStyle?: string;
  currentEquippedBadges?: string[];
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

const BACKGROUND_PRESETS = [
  { name: 'Standard', value: '', preview: 'linear-gradient(to bottom right, rgb(23 37 84), rgb(30 58 138), rgb(29 78 216))' },
  { name: 'Dunkelblau', value: 'linear-gradient(135deg, #1e3a5f 0%, #0a1628 100%)', preview: 'linear-gradient(135deg, #1e3a5f 0%, #0a1628 100%)' },
  { name: 'Dunkelgrün', value: 'linear-gradient(135deg, #1a472a 0%, #0a1f12 100%)', preview: 'linear-gradient(135deg, #1a472a 0%, #0a1f12 100%)' },
  { name: 'Dunkelrot', value: 'linear-gradient(135deg, #5c1a1a 0%, #1f0808 100%)', preview: 'linear-gradient(135deg, #5c1a1a 0%, #1f0808 100%)' },
  { name: 'Dunkelviolett', value: 'linear-gradient(135deg, #2d1f4e 0%, #0f0a1a 100%)', preview: 'linear-gradient(135deg, #2d1f4e 0%, #0f0a1a 100%)' },
  { name: 'Schwarz', value: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)', preview: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #191970 0%, #0a0a2e 100%)', preview: 'linear-gradient(135deg, #191970 0%, #0a0a2e 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #0077b6 0%, #023e8a 50%, #03045e 100%)', preview: 'linear-gradient(135deg, #0077b6 0%, #023e8a 50%, #03045e 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #9b2335 100%)', preview: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #9b2335 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #00d4aa 0%, #7b68ee 50%, #ff1493 100%)', preview: 'linear-gradient(135deg, #00d4aa 0%, #7b68ee 50%, #ff1493 100%)' },
];

const BORDER_STYLES = [
  { name: 'Standard', value: 'solid', className: 'ring-4 ring-white' },
  { name: 'Doppelt', value: 'double', className: 'ring-4 ring-white ring-offset-2 ring-offset-blue-500' },
  { name: 'Gold', value: 'gold', className: 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' },
  { name: 'Rainbow', value: 'rainbow', className: 'ring-4 ring-purple-400 animate-pulse' },
  { name: 'Glow', value: 'glow', className: 'ring-4 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.7)]' },
];

export const ProfileCustomization = ({
  userId,
  currentUsernameColor,
  currentBackgroundColor,
  currentBorderStyle,
  currentEquippedBadges,
  onClose,
  onUpdate,
}: ProfileCustomizationProps) => {
  const [usernameColor, setUsernameColor] = useState(currentUsernameColor || '#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState(currentBackgroundColor || '');
  const [borderStyle, setBorderStyle] = useState(currentBorderStyle || 'solid');
  const [equippedBadges, setEquippedBadges] = useState<string[]>(currentEquippedBadges || []);
  const [saving, setSaving] = useState(false);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const { badges: availableBadges } = useUserPerks(userId);

  // Initialize equipped badges from props
  useEffect(() => {
    if (currentEquippedBadges) {
      setEquippedBadges(currentEquippedBadges);
    }
  }, [currentEquippedBadges]);

  const toggleBadge = (badgeId: string) => {
    setEquippedBadges(prev => {
      if (prev.includes(badgeId)) {
        return prev.filter(id => id !== badgeId);
      } else {
        // Max 4 badges
        if (prev.length >= 4) {
          toast.error('Maximum 4 Badges', {
            description: 'Du kannst maximal 4 Badges gleichzeitig ausrüsten.',
          });
          return prev;
        }
        return [...prev, badgeId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username_color: usernameColor,
          background_color: backgroundColor || null,
          profile_border_style: borderStyle,
          equipped_badges: equippedBadges,
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

  const getEquippedBadgeObjects = () => {
    return availableBadges.filter(b => equippedBadges.includes(b.id));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120]">
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
                      <Check className="w-5 h-5 text-black/50" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Hintergrund</Label>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_PRESETS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => setBackgroundColor(bg.value)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    backgroundColor === bg.value
                      ? 'border-blue-600 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ background: bg.preview }}
                  title={bg.name}
                >
                  {backgroundColor === bg.value && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Border Style */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Avatar Rahmen</Label>
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

          {/* Available Badges with Equip/Unequip */}
          {availableBadges.length > 0 && (
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Deine Badges ({availableBadges.length}) - Ausgerüstet: {equippedBadges.length}/4
              </Label>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl">
                {availableBadges.map((badge) => {
                  const isEquipped = equippedBadges.includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      onClick={() => toggleBadge(badge.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-sm transition-all ${
                        isEquipped ? 'ring-2 ring-blue-500 ring-offset-2' : 'opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: badge.badge_color ? `${badge.badge_color}30` : 'rgba(147, 51, 234, 0.2)',
                        color: badge.badge_color || '#9333ea',
                        border: `1px solid ${badge.badge_color || '#9333ea'}50`,
                      }}
                    >
                      {badge.badge_emoji && <span>{badge.badge_emoji}</span>}
                      <span>{badge.badge_name}</span>
                      {isEquipped ? (
                        <Minus className="w-3 h-3 ml-1" />
                      ) : (
                        <Plus className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-gray-500">
                Klicke auf ein Badge um es auszurüsten oder zu entfernen. Max. 4 Badges.
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Vorschau</Label>
            <div 
              className="p-8 rounded-2xl flex flex-col items-center"
              style={{
                background: backgroundColor || 'linear-gradient(to bottom right, rgb(23 37 84), rgb(30 58 138), rgb(29 78 216))',
              }}
            >
              {/* Preview Avatar with border style */}
              <div className={`w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mb-4 ${
                BORDER_STYLES.find(s => s.value === borderStyle)?.className || 'ring-4 ring-white'
              }`}>
                U
              </div>
              <h1 
                className="text-4xl font-bold text-center"
                style={{ 
                  color: usernameColor,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Benutzername
              </h1>
              {getEquippedBadgeObjects().length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {getEquippedBadgeObjects().map((badge) => (
                    <div
                      key={badge.id}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-xs"
                      style={{
                        backgroundColor: badge.badge_color ? `${badge.badge_color}30` : 'rgba(147, 51, 234, 0.2)',
                        color: badge.badge_color || '#9333ea',
                        border: `1px solid ${badge.badge_color || '#9333ea'}50`,
                      }}
                    >
                      {badge.badge_emoji && <span>{badge.badge_emoji}</span>}
                      <span>{badge.badge_name}</span>
                    </div>
                  ))}
                </div>
              )}
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