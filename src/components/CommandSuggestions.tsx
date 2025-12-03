import { ChatCommand } from '@/hooks/useChatCommands';
import { Shield, Terminal } from 'lucide-react';

interface CommandSuggestionsProps {
  commands: ChatCommand[];
  selectedIndex: number;
  onSelect: (command: ChatCommand) => void;
}

export function CommandSuggestions({ commands, selectedIndex, onSelect }: CommandSuggestionsProps) {
  if (commands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-blue-950/95 backdrop-blur-xl border border-blue-400/20 rounded-lg overflow-hidden shadow-xl">
      <div className="p-2 border-b border-blue-400/20 flex items-center gap-2 text-white/60 text-xs">
        <Terminal className="h-3 w-3" />
        Befehle
      </div>
      <div className="max-h-64 overflow-y-auto">
        {commands.map((cmd, index) => (
          <button
            key={cmd.name}
            onClick={() => onSelect(cmd)}
            className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
              index === selectedIndex 
                ? 'bg-blue-600/40 text-white' 
                : 'text-white/80 hover:bg-blue-600/20'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-blue-300">/{cmd.name}</span>
                {cmd.args && (
                  <span className="text-white/40 text-sm">{cmd.args}</span>
                )}
                {cmd.adminOnly && (
                  <Shield className="h-3 w-3 text-yellow-400" />
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">{cmd.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
