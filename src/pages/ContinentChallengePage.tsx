import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { continentEmojis } from '@/data/countries';
import ContinentChallengeGame from '@/components/ContinentChallengeGame';

const continents = [
  { name: 'Afrika', description: '50 Länder' },
  { name: 'Asien', description: '48 Länder' },
  { name: 'Europa', description: '43 Länder' },
  { name: 'Nordamerika', description: '16 Länder' },
  { name: 'Südamerika', description: '12 Länder' },
  { name: 'Ozeanien', description: '3 Länder' },
];

export default function ContinentChallengePage() {
  const navigate = useNavigate();
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  if (selectedContinent) {
    return (
      <ContinentChallengeGame
        continent={selectedContinent}
        showMap={showMap}
        onBack={() => setSelectedContinent(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Kontinent Challenge
          </h1>
          <p className="text-lg text-muted-foreground">
            Nenne alle Länder eines Kontinents so schnell wie möglich!
          </p>
        </div>

        {/* Map Toggle */}
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="map-toggle" className="text-base font-medium">
                  Karte anzeigen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Zeige eine Karte zur Hilfe (ohne Ländernamen)
                </p>
              </div>
              <Switch
                id="map-toggle"
                checked={showMap}
                onCheckedChange={setShowMap}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {continents.map((continent) => (
            <Card 
              key={continent.name}
              className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => setSelectedContinent(continent.name)}
            >
              <CardHeader className="text-center pb-3">
                <div className="text-4xl mb-2">
                  {continentEmojis[continent.name as keyof typeof continentEmojis]}
                </div>
                <CardTitle className="text-xl">{continent.name}</CardTitle>
                <CardDescription>{continent.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Starten
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/quizmenu')}>
            ← Zurück zur Übersicht
          </Button>
        </div>
      </div>
    </div>
  );
}
