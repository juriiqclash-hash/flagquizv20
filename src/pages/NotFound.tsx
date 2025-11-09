import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Compass, ArrowLeft, Flag } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayPath, setDisplayPath] = useState(location.pathname);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setDisplayPath(location.pathname);
  }, [location.pathname]);

  const suggestions = [
    { label: "Startseite", path: "/", icon: Home },
    { label: "Quiz Menü", path: "/quizmenu", icon: Flag },
    { label: "Bestenliste", path: "/leaderboards", icon: Compass },
    { label: "Multiplayer", path: "/multiplayer", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Animated 404 */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-[120px] md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-none animate-pulse">
              404
            </h1>
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            🗺️ Verloren im Quiz-Universum?
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            Die Seite <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{displayPath}</span> existiert nicht.
          </p>
          <p className="text-gray-500">
            Keine Sorge! Selbst die besten Entdecker verirren sich manchmal.
          </p>
        </div>

        {/* Navigation Suggestions */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-500 text-center mb-3">Versuche eine dieser Seiten:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <Button
                  key={suggestion.path}
                  onClick={() => navigate(suggestion.path)}
                  variant="outline"
                  className="w-full h-14 text-base hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {suggestion.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Home className="mr-2 h-4 w-4" />
            Zur Startseite
          </Button>
        </div>

        {/* Fun fact */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400 italic">
            💡 Wusstest du? Auch beim Flaggen-Quiz kann man sich verirren - aber hier gibt's immer einen Weg zurück!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
