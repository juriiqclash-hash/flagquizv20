import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClanCreatorProps {
  onClose: () => void;
  onClanCreated: (clan: { id: string; name: string; emoji: string; createdBy: string }) => void;
}

export const ClanCreator = ({ onClose, onClanCreated }: ClanCreatorProps) => {
  const { toast } = useToast();
  const [clanName, setClanName] = useState('');
  const [clanEmoji, setClanEmoji] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!clanName.trim() || !clanEmoji.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle beide Felder aus',
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