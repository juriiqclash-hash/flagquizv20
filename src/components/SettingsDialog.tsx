import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Bell, Palette, X, Settings as SettingsIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsCategory = 'appearance' | 'privacy' | 'notifications';

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance');

  const categories = [
    { id: 'appearance' as SettingsCategory, label: 'Darstellung', icon: Palette },
    { id: 'privacy' as SettingsCategory, label: 'Datenschutz', icon: Shield },
    { id: 'notifications' as SettingsCategory, label: 'Benachrichtigungen', icon: Bell },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-background w-full h-full max-w-7xl max-h-[90vh] rounded-lg shadow-2xl flex overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="w-64 bg-muted/30 border-r border-border p-6 space-y-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Einstellungen</h2>
            </div>
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold">
                {categories.find((c) => c.id === activeCategory)?.label}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeCategory === 'appearance' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Darstellungseinstellungen</h4>
                    <p className="text-sm text-muted-foreground">
                      Passe das Erscheinungsbild der App an deine Vorlieben an.
                    </p>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Theme-Einstellungen und weitere Darstellungsoptionen werden in Kürze verfügbar sein.
                  </div>
                </div>
              )}

              {activeCategory === 'privacy' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Datenschutzeinstellungen</h4>
                    <p className="text-sm text-muted-foreground">
                      Verwalte deine Datenschutzeinstellungen und lege fest, wer dein Profil sehen kann.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">Deine Rechte</h5>
                      <p className="text-sm text-muted-foreground">
                        Du hast jederzeit das Recht auf Auskunft, Berichtigung und Löschung deiner Daten.
                        Kontaktiere uns unter: flagquiz.support@gmail.com
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h5 className="font-medium mb-2">DSGVO-Konformität</h5>
                      <p className="text-sm text-muted-foreground">
                        Diese Plattform ist DSGVO-konform. Wir erheben nur die notwendigsten Daten und
                        geben diese nicht an Dritte weiter.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeCategory === 'notifications' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Benachrichtigungseinstellungen</h4>
                    <p className="text-sm text-muted-foreground">
                      Verwalte, welche Benachrichtigungen du erhalten möchtest.
                    </p>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Benachrichtigungseinstellungen werden in Kürze verfügbar sein.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;
