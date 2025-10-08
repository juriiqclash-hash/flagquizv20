import { Construction } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface MaintenanceScreenProps {
  message?: string;
}

export default function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <Construction className="h-32 w-32 text-yellow-500 animate-pulse" />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Wartungsarbeiten
          </h1>
          
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">
              {message || 'Wir führen gerade Wartungsarbeiten durch.'}
            </p>
            
            <p className="text-lg text-muted-foreground">
              Bitte versuche es in Kürze erneut.
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
