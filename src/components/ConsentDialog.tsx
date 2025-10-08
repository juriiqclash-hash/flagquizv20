import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Flag, User, Monitor, ChevronDown, ChevronUp } from 'lucide-react';
import FlagQuizLogo from '@/components/FlagQuizLogo';

interface ConsentDialogProps {
  open: boolean;
  onConsent: (accepted: boolean) => void;
}

const ConsentDialog = ({ open, onConsent }: ConsentDialogProps) => {
  const [showMore, setShowMore] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('flagquiz_consent', 'accepted');
    onConsent(true);
  };

  const handleDecline = () => {
    localStorage.setItem('flagquiz_consent', 'declined');
    onConsent(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-lg max-h-[90vh] p-0 bg-white dark:bg-gray-900 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="overflow-y-auto flex-1 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <FlagQuizLogo size="lg" variant="light" />
          </div>

          {/* Main Text */}
          <div className="mb-6">
            <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed">
              <span className="font-medium">FlagQuiz.ch bittet um Einwilligung,</span><br />
              Ihre personenbezogenen Daten für Folgendes zu nutzen:
            </p>
          </div>

          {/* Consent Items */}
          <div className="space-y-4 mb-6">
            {/* Personalization */}
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Personalisierte Werbung und Inhalte, Messung von Werbeleistung und der Performance von Inhalten, Zielgruppenforschung sowie Entwicklung und Verbesserung von Angeboten
                </p>
              </div>
            </div>

            {/* Device Storage */}
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Speichern von oder Zugriff auf Informationen auf einem Endgerät
                </p>
              </div>
            </div>

            {/* More Information */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 transition-colors mt-2"
            >
              <ChevronDown className="w-4 h-4" />
              Weitere Informationen
            </button>

            {showMore && (
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="space-y-2">
                  <p className="font-medium">Wie kann ich meine Auswahl nachträglich ändern?</p>
                  <p className="font-medium">Was passiert, wenn ich nicht einwillige?</p>
                  <p className="font-medium">Was bedeutet ein berechtigtes Interesse?</p>
                  <p className="font-medium">Muss ich für alles meine Einwilligung erteilen?</p>
                </div>
                <p className="text-xs leading-relaxed pt-2">
                  141 TCF-konforme Anzeigentechnologie-Anbieter und 69 Werbepartner werden Ihre personenbezogenen Daten verarbeiten und dürfen Informationen von Ihrem Gerät (Cookies, eindeutige IDs und andere Gerätedaten) speichern und darauf zugreifen. Die Informationen von Ihrem Gerät können mit den Anbietern und Werbepartnern geteilt oder speziell von dieser Website oder App verwendet werden.
                </p>
                <p className="text-xs leading-relaxed">
                  Einige Anbieter nutzen Ihre personenbezogenen Daten möglicherweise auf Grundlage ihres berechtigten Interesses. Dagegen können Sie unten über die Schaltfläche zum Verwalten Ihrer Optionen Einspruch erheben. Unten auf dieser Seite oder im Menü der Website finden Sie einen Link, über den Sie die Einwilligung in die Datenschutz- und Cookie-Einstellungen verwalten oder widerrufen können.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer with Buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleDecline}
              className="flex-1 h-14 px-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-medium text-base transition-colors"
            >
              Nicht einwilligen
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 h-14 px-6 rounded-full bg-teal-700 hover:bg-teal-800 text-white font-medium text-base transition-colors"
            >
              Einwilligen
            </button>
          </div>

          {/* Manage Options Link */}
          <div className="text-center">
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-sm text-cyan-700 dark:text-cyan-400 hover:underline font-medium"
            >
              Optionen verwalten
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsentDialog;