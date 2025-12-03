import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatCommand {
  name: string;
  description: string;
  args?: string;
  adminOnly?: boolean;
  execute: (args: string[], context: CommandContext) => Promise<void>;
}

interface CommandContext {
  userId: string;
  navigate: ReturnType<typeof useNavigate>;
  onClose: () => void;
  setSelectedUserId: (id: string | null) => void;
}

export const chatCommands: ChatCommand[] = [
  {
    name: 'delete',
    description: 'Löscht Nachrichten (username/all)',
    args: '<username|all>',
    adminOnly: true,
    execute: async (args) => {
      if (!args[0]) {
        toast.error('Bitte gib einen Benutzernamen oder "all" an');
        return;
      }
      
      if (args[0].toLowerCase() === 'all') {
        const { error } = await supabase.from('global_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          toast.error('Fehler beim Löschen');
          return;
        }
        toast.success('Alle Nachrichten gelöscht');
      } else {
        const { error } = await supabase.from('global_messages').delete().eq('username', args[0]);
        if (error) {
          toast.error('Fehler beim Löschen');
          return;
        }
        toast.success(`Nachrichten von ${args[0]} gelöscht`);
      }
    }
  },
  {
    name: 'kick',
    description: 'Kickt einen Spieler (muss neu einloggen)',
    args: '<username>',
    adminOnly: true,
    execute: async (args) => {
      if (!args[0]) {
        toast.error('Bitte gib einen Benutzernamen an');
        return;
      }
      
      // Get user_id from username
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', args[0])
        .single();
      
      if (!profile) {
        toast.error('Benutzer nicht gefunden');
        return;
      }
      
      // Send kick event via realtime
      await supabase.channel('admin_actions').send({
        type: 'broadcast',
        event: 'kick',
        payload: { user_id: profile.user_id }
      });
      
      toast.success(`${args[0]} wurde gekickt`);
    }
  },
  {
    name: 'ban',
    description: 'Bannt einen Spieler',
    args: '<username> [grund]',
    adminOnly: true,
    execute: async (args) => {
      if (!args[0]) {
        toast.error('Bitte gib einen Benutzernamen an');
        return;
      }
      
      const reason = args.slice(1).join(' ') || 'Kein Grund angegeben';
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          banned: true, 
          ban_reason: reason,
          banned_at: new Date().toISOString()
        })
        .eq('username', args[0]);
      
      if (error) {
        toast.error('Fehler beim Bannen');
        return;
      }
      
      toast.success(`${args[0]} wurde gebannt`);
    }
  },
  {
    name: 'watch',
    description: 'Zeigt ein Profil an',
    args: '<username>',
    execute: async (args, context) => {
      if (!args[0]) {
        toast.error('Bitte gib einen Benutzernamen an');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', args[0])
        .single();
      
      if (!profile) {
        toast.error('Benutzer nicht gefunden');
        return;
      }
      
      context.setSelectedUserId(profile.user_id);
    }
  },
  {
    name: 'ddos',
    description: 'Fake DDoS-Angriff auf Spieler',
    args: '<username>',
    adminOnly: true,
    execute: async (args) => {
      if (!args[0]) {
        toast.error('Bitte gib einen Benutzernamen an');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', args[0])
        .single();
      
      if (!profile) {
        toast.error('Benutzer nicht gefunden');
        return;
      }
      
      await supabase.channel('admin_actions').send({
        type: 'broadcast',
        event: 'ddos',
        payload: { user_id: profile.user_id }
      });
      
      toast.success(`DDoS-Angriff auf ${args[0]} gestartet`);
    }
  },
  {
    name: 'attack',
    description: 'Fake Daten-Angriff auf Spieler',
    args: '<username>',
    adminOnly: true,
    execute: async (args) => {
      if (!args[0]) {
        toast.error('Bitte gib einen Benutzernamen an');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', args[0])
        .single();
      
      if (!profile) {
        toast.error('Benutzer nicht gefunden');
        return;
      }
      
      await supabase.channel('admin_actions').send({
        type: 'broadcast',
        event: 'attack',
        payload: { user_id: profile.user_id }
      });
      
      toast.success(`Angriff auf ${args[0]} gestartet`);
    }
  },
  {
    name: 'quit',
    description: 'Schließt alles und loggt aus',
    execute: async (_, context) => {
      await supabase.auth.signOut();
      context.onClose();
      context.navigate('/');
      toast.success('Ausgeloggt');
    }
  },
  {
    name: 'leave',
    description: 'Verlässt aktuellen Bereich',
    execute: async (_, context) => {
      context.onClose();
      toast.success('Chat verlassen');
    }
  },
  {
    name: 'back',
    description: 'Geht eine Seite zurück',
    execute: async (_, context) => {
      context.onClose();
      window.history.back();
    }
  },
  {
    name: 'quizmenu',
    description: 'Öffnet Quiz-Menü',
    execute: async (_, context) => {
      context.onClose();
      context.navigate('/quiz-menu');
    }
  },
  {
    name: 'multiplayer',
    description: 'Öffnet Multiplayer',
    execute: async (_, context) => {
      context.onClose();
      context.navigate('/multiplayer');
    }
  },
  {
    name: 'timed',
    description: 'Startet Zeit-Modus',
    execute: async (_, context) => {
      context.onClose();
      context.navigate('/quiz?mode=timed');
    }
  },
  {
    name: 'help',
    description: 'Zeigt alle Befehle',
    execute: async () => {
      const commandList = chatCommands.map(c => `/${c.name} ${c.args || ''}`).join('\n');
      toast.info('Verfügbare Befehle:\n' + commandList, { duration: 10000 });
    }
  }
];

export function parseCommand(input: string): { command: string; args: string[] } | null {
  if (!input.startsWith('/')) return null;
  
  const parts = input.slice(1).trim().split(/\s+/);
  const command = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);
  
  return { command, args };
}

export function getCommandSuggestions(input: string, isAdmin: boolean): ChatCommand[] {
  if (!input.startsWith('/')) return [];
  
  const query = input.slice(1).toLowerCase();
  return chatCommands.filter(cmd => {
    if (cmd.adminOnly && !isAdmin) return false;
    return cmd.name.startsWith(query);
  });
}
