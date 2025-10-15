import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";
import { ALL_COUNTRIES } from "@/data/countries-full";
import { getFlagUrl } from "@/data/countries";
import QuizHomeButton from "@/components/QuizHomeButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";

interface FlagArchiveProps {
  onBackToStart: () => void;
}

export default function FlagArchive({ onBackToStart }: FlagArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();
  const t = useTranslation(language);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_COUNTRIES;
    }

    const query = searchQuery.toLowerCase();
    return ALL_COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const sortedCountries = useMemo(() => {
    return [...filteredCountries].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [filteredCountries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <QuizHomeButton onNavigateHome={onBackToStart} />
        </div>

        <Card className="mb-6">
          <CardContent className="py-6">
            <h1 className="text-3xl font-bold text-center mb-2">
              {language === 'de' ? 'Flaggen-Archiv' :
               language === 'en' ? 'Flag Archive' :
               language === 'es' ? 'Archivo de Banderas' :
               language === 'fr' ? 'Archive des Drapeaux' :
               language === 'it' ? 'Archivio Bandiere' :
               'フラグアーカイブ'}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {language === 'de' ? 'Durchsuche alle 199 Flaggen der Welt' :
               language === 'en' ? 'Browse all 199 flags of the world' :
               language === 'es' ? 'Explora todas las 199 banderas del mundo' :
               language === 'fr' ? 'Parcourez tous les 199 drapeaux du monde' :
               language === 'it' ? 'Sfoglia tutte le 199 bandiere del mondo' :
               '世界の199の旗を閲覧'}
            </p>

            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder={
                  language === 'de' ? 'Land suchen...' :
                  language === 'en' ? 'Search country...' :
                  language === 'es' ? 'Buscar país...' :
                  language === 'fr' ? 'Rechercher un pays...' :
                  language === 'it' ? 'Cerca paese...' :
                  '国を検索...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {sortedCountries.length} {
                language === 'de' ? 'Länder gefunden' :
                language === 'en' ? 'countries found' :
                language === 'es' ? 'países encontrados' :
                language === 'fr' ? 'pays trouvés' :
                language === 'it' ? 'paesi trovati' :
                '国が見つかりました'
              }
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedCountries.map((country) => (
            <Card
              key={country.code}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
            >
              <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={getFlagUrl(country.code)}
                    alt={`Flag of ${country.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{country.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{country.flag} {country.code}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedCountries.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {language === 'de' ? 'Keine Länder gefunden' :
                 language === 'en' ? 'No countries found' :
                 language === 'es' ? 'No se encontraron países' :
                 language === 'fr' ? 'Aucun pays trouvé' :
                 language === 'it' ? 'Nessun paese trovato' :
                 '国が見つかりません'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
