import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayPath, setDisplayPath] = useState(location.pathname);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setDisplayPath(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-blue-900 flex flex-col items-center justify-center px-4 py-20">
      {/* Giant 404 */}
      <h1 
        className="text-[150px] md:text-[250px] lg:text-[300px] font-black text-white leading-none mb-8"
        style={{ fontFamily: '"VAG Rounded", sans-serif' }}
      >
        404
      </h1>

      {/* Fun Message */}
      <p className="text-white text-2xl md:text-3xl mb-4 text-center font-bold" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
        Oops – diese Flagge gibt's nicht!
      </p>

      {/* Error Message */}
      <p className="text-white text-lg md:text-xl mb-12 text-center" style={{ fontFamily: '"VAG Rounded", sans-serif' }}>
        Die Seite <span className="font-bold text-yellow-400">{displayPath}</span> existiert nicht
      </p>

      {/* Back to Main Menu Button */}
      <Button
        onClick={() => navigate("/")}
        size="lg"
        className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold text-lg px-8 py-6 rounded-full transition-all duration-300 shadow-lg"
        style={{ fontFamily: '"VAG Rounded", sans-serif' }}
      >
        <Home className="mr-2 h-6 w-6" />
        Zurück zu Hauptmenü
      </Button>
    </div>
  );
};

export default NotFound;
