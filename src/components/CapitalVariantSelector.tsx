import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin } from 'lucide-react';

interface CapitalVariantSelectorProps {
  onSelectVariant: (variant: 'capital-to-country' | 'country-to-capital') => void;
  onBack: () => void;
}

const CapitalVariantSelector = ({ onSelectVariant, onBack }: CapitalVariantSelectorProps) => {
  const variants = [
    {
      id: 'capital-to-country' as const,
      title: 'Hauptstadt → Land',
      description: 'Eine Hauptstadt wird angezeigt und du musst das richtige Land nennen',
      example: 'Helsinki → ?',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'country-to-capital' as const,
      title: 'Land → Hauptstadt', 
      description: 'Ein Land wird angezeigt und du musst die richtige Hauptstadt nennen',
      example: 'Finnland → ?',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Wähle deine Variante</h1>
            <p className="text-muted-foreground">Entscheide, wie du die Hauptstädte lernen möchtest</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {variants.map((variant) => (
            <Card 
              key={variant.id}
              className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => onSelectVariant(variant.id)}
            >
              <CardHeader>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${variant.color} text-white mb-2`}>
                  <MapPin className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{variant.title}</CardTitle>
                <CardDescription className="text-lg">{variant.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Beispiel:</p>
                  <p className="font-semibold text-lg">{variant.example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapitalVariantSelector;