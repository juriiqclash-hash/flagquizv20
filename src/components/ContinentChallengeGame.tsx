import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Check, MapPin } from 'lucide-react';
import { countries, checkAnswer } from '@/data/countries';
import { useToast } from '@/hooks/use-toast';
import { useUserStats } from '@/hooks/useUserStats';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ContinentChallengeGameProps {
  continent: string;
  showMap: boolean;
  onBack: () => void;
}

export default function ContinentChallengeGame({ continent, showMap, onBack }: ContinentChallengeGameProps) {
  const { toast } = useToast();
  const { addXP } = useUserStats();
  
  const [userInput, setUserInput] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [gameStatus, setGameStatus] = useState<'playing' | 'completed'>('playing');
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Get countries from selected continent
  const continentCountries = useMemo(() => {
    return countries.filter(c => c.continent === continent);
  }, [continent]);

  const totalCountries = continentCountries.length;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (!value.trim() || gameStatus !== 'playing') return;

    // Check if input matches any country from the continent
    for (const country of continentCountries) {
      if (!correctAnswers.has(country.name) && checkAnswer(value, country)) {
        const newCorrectAnswers = new Set(correctAnswers);
        newCorrectAnswers.add(country.name);
        setCorrectAnswers(newCorrectAnswers);
        setUserInput('');

        addXP(1);
        
        // Check if we got all countries
        if (newCorrectAnswers.size === totalCountries) {
          const time = Date.now();
          setEndTime(time);
          setGameStatus('completed');
          
          const timeTaken = Math.floor((time - startTime) / 1000);
          toast({
            title: '🎉 Geschafft!',
            description: `Alle ${totalCountries} Länder in ${timeTaken}s genannt!`,
            className: 'bg-success text-success-foreground',
          });
        }
        
        break;
      }
    }
  };

  const elapsedTime = useMemo(() => {
    if (endTime) {
      return Math.floor((endTime - startTime) / 1000);
    }
    return 0;
  }, [endTime, startTime]);

  // Create GeoJSON for continent countries (simplified)
  const continentGeoJSON = useMemo(() => {
    if (!showMap) return null;
    
    return {
      type: 'FeatureCollection',
      features: continentCountries.map(country => ({
        type: 'Feature',
        properties: {
          name: country.name,
          code: country.code
        },
        geometry: {
          type: 'Point',
          coordinates: [0, 0] // Would need actual coordinates
        }
      }))
    };
  }, [continentCountries, showMap]);

  if (gameStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/10 to-success/20 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full text-center">
            <CardContent className="py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4 text-success">Geschafft!</h2>
              <p className="text-muted-foreground mb-2">
                Du hast alle {totalCountries} Länder von {continent} genannt!
              </p>
              <p className="text-2xl font-bold mb-6">
                Zeit: {elapsedTime}s
              </p>
              <Button onClick={onBack} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Zurück zum Menü
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <Home className="w-4 h-4 mr-2" />
            Verlassen
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Input and Progress */}
          <div className="space-y-6">
            {/* Title */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardContent className="p-6 text-center">
                <h2 className="text-3xl font-bold mb-2">
                  {continent}
                </h2>
                <p className="text-muted-foreground">
                  Nenne alle Länder so schnell wie möglich!
                </p>
                <div className="mt-4">
                  <Badge variant="default" className="text-xl px-4 py-2">
                    {correctAnswers.size}/{totalCountries}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Input Field */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={(e) => e.preventDefault()}>
                  <Input
                    ref={inputRef}
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Land eingeben..."
                    className="text-center text-xl py-6"
                    autoFocus
                    disabled={gameStatus !== 'playing'}
                  />
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    Tippe die Ländernamen ein - Reihenfolge egal
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="w-full bg-muted rounded-full h-4 mb-2">
                  <div 
                    className="bg-primary h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(correctAnswers.size / totalCountries) * 100}%` }}
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {Math.round((correctAnswers.size / totalCountries) * 100)}% abgeschlossen
                </p>
              </CardContent>
            </Card>

            {/* Correctly guessed list */}
            {correctAnswers.size > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    Richtig erraten ({correctAnswers.size}/{totalCountries}):
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
                    {Array.from(correctAnswers).sort().map((name) => (
                      <Badge key={name} variant="default" className="bg-success text-success-foreground">
                        <Check className="w-3 h-3 mr-1" />
                        {name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Map (if enabled) */}
          {showMap && (
            <div className="space-y-6">
              <Card className="h-[600px]">
                <CardContent className="p-4 h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-medium">Karte zur Hilfe</h3>
                  </div>
                  <div className="h-[calc(100%-40px)] rounded-lg overflow-hidden border">
                    <MapContainer
                      center={[0, 0]}
                      zoom={2}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Die Karte zeigt nur die Grenzen, keine Namen
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
