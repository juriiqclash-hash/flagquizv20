import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import QuizHomeButton from "@/components/QuizHomeButton";
import { countries, getFlagUrl, type Country } from "@/data/countries";

interface FlagArchiveProps {
  onBackToStart: () => void;
}

export default function FlagArchive({ onBackToStart }: FlagArchiveProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCountries = [...countries].sort((a, b) =>
    a.name.localeCompare(b.name, 'de')
  );

  const filteredCountries = sortedCountries.filter((country) => {
    const query = searchQuery.toLowerCase();
    return (
      country.name.toLowerCase().includes(query) ||
      country.capital.toLowerCase().includes(query) ||
      country.continent.toLowerCase().includes(query)
    );
  });

  const groupedCountries: { [key: string]: Country[] } = {};
  filteredCountries.forEach((country) => {
    const firstLetter = country.name[0].toUpperCase();
    if (!groupedCountries[firstLetter]) {
      groupedCountries[firstLetter] = [];
    }
    groupedCountries[firstLetter].push(country);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <QuizHomeButton onNavigateHome={onBackToStart} />
        </div>

        <Card>
          <CardContent className="py-8">
            <h2 className="text-3xl font-bold text-center mb-2">Flaggen-Archiv</h2>
            <p className="text-center text-muted-foreground mb-6">
              Alle {countries.length} Flaggen von A-Z
            </p>

            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Nach Land, Hauptstadt oder Kontinent suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>

            {Object.keys(groupedCountries).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Keine Ergebnisse gefunden</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.keys(groupedCountries).sort().map((letter) => (
                  <div key={letter}>
                    <h3 className="text-2xl font-bold mb-4 text-primary sticky top-0 bg-background/95 backdrop-blur-sm py-2">
                      {letter}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {groupedCountries[letter].map((country) => (
                        <div
                          key={country.code}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center text-center gap-3">
                            <img
                              src={getFlagUrl(country.code)}
                              alt={`Flagge von ${country.name}`}
                              className="w-full h-24 object-cover rounded-md shadow-md border border-border"
                              loading="lazy"
                            />
                            <div>
                              <h4 className="font-bold text-base">{country.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {country.capital}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {country.continent}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
