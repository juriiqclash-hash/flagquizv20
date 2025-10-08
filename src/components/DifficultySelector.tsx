import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Target, Zap } from "lucide-react";
import { DifficultyLevel } from "@/data/worldKnowledge";
interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
  onBack: () => void;
}
export default function DifficultySelector({
  onSelectDifficulty,
  onBack
}: DifficultySelectorProps) {
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 my-0 mx-0">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        
        <h1 className="text-xl font-bold mx-0 my-px">Weltwissen Quiz </h1>
        <div></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Wähle deinen Schwierigkeitsgrad
            </h2>
            <p className="text-muted-foreground text-lg">
              Teste dein Weltwissen mit Wahr-oder-Falsch-Fragen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Easy */}
            <Card className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-700">
                  Einfach
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4 flex-1 flex flex-col">
                <p className="text-gray-600 leading-relaxed flex-1">
                  Grundlegendes Weltwissen über Länder, Hauptstädte und bekannte Fakten
                </p>
                <Button onClick={() => onSelectDifficulty('easy')} className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                  Einfach starten
                </Button>
              </CardContent>
            </Card>

            {/* Medium */}
            <Card className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-blue-200 flex flex-col">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-700">
                  Mittel
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4 flex-1 flex flex-col">
                <p className="text-gray-600 leading-relaxed flex-1">
                  Detaillierteres Wissen über Länder, Grenzen und geografische Besonderheiten
                </p>
                <Button onClick={() => onSelectDifficulty('medium')} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  Mittel starten
                </Button>
              </CardContent>
            </Card>

            {/* Hard */}
            <Card className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex flex-col">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-700">
                  Schwer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4 flex-1 flex flex-col">
                <p className="text-gray-600 leading-relaxed flex-1">
                  Expertenwissen über komplexe geografische und politische Details
                </p>
                <Button onClick={() => onSelectDifficulty('hard')} className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                  Schwer starten
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>;
}