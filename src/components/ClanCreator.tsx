import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClanCreatorProps {
  onClose: () => void;
  onClanCreated: (clan: { id: string; name: string; emoji: string; createdBy: string }) => void;
}

export const ClanCreator = ({ onClose, onClanCreated }: ClanCreatorProps) => {
  const { toast } = useToast();
  const [clanName, setClanName] = useState('');
  const [clanEmoji, setClanEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!clanName.trim() || !clanEmoji.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle Name und Emoji aus',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('clans')
        .insert({
          name: clanName.trim(),
          emoji: clanEmoji.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: 'Fehler',
            description: 'Ein Clan mit diesem Namen existiert bereits',
            variant: 'destructive'
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'Erfolg!',
        description: 'Dein Clan wurde erstellt',
      });

      onClanCreated({
        id: data.id,
        name: clanName.trim(),
        emoji: clanEmoji.trim(),
        createdBy: user.id
      });
      onClose();
    } catch (error: any) {
      console.error('Error creating clan:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Clan konnte nicht erstellt werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-2xl">Neuen Clan erstellen</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clan-name">Clan Name</Label>
            <Input
              id="clan-name"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              placeholder="z.B. Drachen"
              maxLength={30}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clan-emoji">Emoji</Label>
            <Input
              id="clan-emoji"
              value={clanEmoji}
              onChange={(e) => setClanEmoji(e.target.value)}
              placeholder="z.B. 🐉"
              maxLength={4}
            />
            <p className="text-xs text-muted-foreground">
              Tipp: Kopiere ein Emoji von deiner Tastatur oder verwende Windows + .
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clan-description">Beschreibung (optional)</Label>
            <Textarea
              id="clan-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibe deinen Clan..."
              maxLength={200}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clan-image">Bild-URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="clan-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://beispiel.com/bild.jpg"
                type="url"
              />
            </div>
            {imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border-2 border-border w-full h-32 bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                  src={imageUrl}
                  alt="Vorschau"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>';
                    }
                  }}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Nutze eine öffentlich zugängliche Bild-URL
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={loading} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Erstellen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};