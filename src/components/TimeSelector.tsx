import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface TimeSelectorProps {
  onSelectTime: (seconds: number) => void;
  onBack: () => void;
}

const timeOptions = [
  { seconds: 30, label: '30 Sekunden', description: 'Blitz-Modus' },
  { seconds: 60, label: '1 Minute', description: 'Schnell-Modus' },
  { seconds: 300, label: '5 Minuten', description: 'Standard-Modus' },
  { seconds: 600, label: '10 Minuten', description: 'Ausdauer-Modus' }
];

export default function TimeSelector({ onSelectTime, onBack }: TimeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            ⏱️ Zeit auswählen
          </h1>
          <p className="text-lg text-muted-foreground">
            Wie lange möchtest du für den Speed-Rush haben?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {timeOptions.map((option) => (
            <Card 
              key={option.seconds}
              className="hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => onSelectTime(option.seconds)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                  <Timer className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">{option.label}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  size="lg" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Auswählen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="ghost" onClick={onBack}>
            ← Zurück zur Übersicht
          </Button>
        </div>
      </div>
    </div>
  );
}