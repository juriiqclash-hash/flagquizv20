import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Globe, Code, Shield, Mail, Phone, MapPin, Users, Briefcase, FileText, HelpCircle, Building2, Lock, Newspaper, Facebook, Twitter, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Info className="h-6 w-6" />
            Info
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="about">Über flagquiz.ch</TabsTrigger>
            <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
            <TabsTrigger value="legal">Impressum</TabsTrigger>
            <TabsTrigger value="faq">FAQ / Hilfe</TabsTrigger>
            <TabsTrigger value="howto">Wie funktioniert das Quiz?</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Mission & Vision</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      <strong>Mission:</strong> Wir machen Geographie-Lernen spielerisch und unterhaltsam. FlagQuiz bringt Menschen zusammen, um spielerisch ihr Wissen über Länder, Flaggen und Kulturen zu erweitern.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      <strong>Vision:</strong> Eine Welt, in der geografisches Wissen für jeden zugänglich und spannend ist. Wir wollen die führende Plattform für geografisches Lernen und Community-Building werden.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong>Werte:</strong> Bildung, Spaß, Gemeinschaft, Innovation und Fairness stehen im Mittelpunkt unserer Arbeit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Code className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Geschichte & Hintergrund</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      FlagQuiz wurde 2025 mit dem Ziel gegründet, eine moderne und ansprechende Plattform für geografisches Wissen zu schaffen. Was als einfaches Flaggen-Quiz begann, hat sich zu einer umfassenden Lern- und Gaming-Plattform entwickelt.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Heute bieten wir verschiedene Quiz-Modi, Multiplayer-Spiele, ein Rangsystem und eine aktive Community mit Clans und Freundeslisten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Team & Gründer</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      <strong>Gründer:</strong> ijuriqu
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Unser Team besteht aus leidenschaftlichen Entwicklern, Designern und Geographie-Enthusiasten, die gemeinsam daran arbeiten, FlagQuiz ständig zu verbessern und zu erweitern.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">Kontakt</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Hast du Fragen, Feedback oder technische Probleme? Kontaktiere uns!
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-medium">E-Mail:</span>
                        <a href="mailto:flagquiz.support@gmail.com" className="text-primary hover:underline">
                          flagquiz.support@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">Folge uns</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Folge uns auf Social Media für Updates und Community-Events!
                    </p>

                    <div className="flex gap-4">
                      <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                      <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.525.02l1.62 4.985H19.5l-4.266 3.1 1.631 5.015-4.34-3.152-4.341 3.153 1.632-5.015L5.55 5.005h5.355L12.525.019z"/>
                        </svg>
                        TikTok
                      </a>
                      <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Twitter className="h-4 w-4" />
                        X
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Impressum</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Verantwortlich für den Inhalt:</strong></p>
                      <p>ijuriqu</p>
                      <p>FlagQuiz</p>

                      <Separator className="my-3" />

                      <p><strong>Kontakt:</strong></p>
                      <p>E-Mail: flagquiz.support@gmail.com</p>

                      <Separator className="my-3" />

                      <p className="text-xs leading-relaxed">
                        <strong>Haftungsausschluss:</strong> Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Datenschutzerklärung</h3>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <div>
                        <p className="font-semibold text-foreground mb-1">1. Datenerhebung & Verarbeitung</p>
                        <p>Wir erheben nur die notwendigsten Daten: E-Mail-Adresse, Benutzername und Spiel-Statistiken. Diese Daten werden ausschließlich zur Bereitstellung unserer Dienste verwendet.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">2. DSGVO-Konformität</p>
                        <p>Diese Plattform ist DSGVO-konform. Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner Daten.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">3. Cookies & Tracking</p>
                        <p>Wir verwenden notwendige Cookies zur Authentifizierung und Session-Verwaltung. Tracking-Cookies werden nur mit deiner Zustimmung verwendet.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">4. Datensicherheit</p>
                        <p>Alle Daten werden verschlüsselt gespeichert und übertragen. Wir verwenden moderne Sicherheitsstandards zum Schutz deiner Informationen.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">5. Deine Rechte</p>
                        <p>Du kannst jederzeit Auskunft über deine gespeicherten Daten verlangen oder die Löschung deines Kontos beantragen. Kontaktiere uns unter: flagquiz.support@gmail.com</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">6. Datenweitergabe</p>
                        <p>Wir geben deine Daten nicht an Dritte weiter, außer wenn dies gesetzlich vorgeschrieben ist oder zur Bereitstellung unserer Dienste notwendig ist.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="howto" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Wie funktioniert das Quiz?</h3>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <div>
                        <p className="font-semibold text-foreground mb-1">1. Spielmodus auswählen</p>
                        <p>Wähle aus verschiedenen Modi: Flaggen, Hauptstädte, Weltwissen, Combi-Quiz oder Multiplayer.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">2. Einstellungen anpassen</p>
                        <p>Wähle Schwierigkeitsgrad, Zeitlimit und weitere Optionen nach deinen Wünschen.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">3. Quiz starten</p>
                        <p>Beantworte die Fragen so schnell und korrekt wie möglich. Je schneller du antwortest, desto mehr Punkte erhältst du.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">4. XP sammeln</p>
                        <p>Für jedes Quiz erhältst du XP (Erfahrungspunkte), mit denen du dein Level erhöhst und in den Rängen aufsteigst.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">5. Rang aufsteigen</p>
                        <p>Mit steigendem XP erreichst du höhere Ränge: Bronze, Silber, Gold, Platin, Diamant, Master und Legend.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Häufig gestellte Fragen (FAQ)</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground mb-1">Wie erstelle ich ein Konto?</p>
                        <p className="text-muted-foreground">Klicke auf "Anmelden" und wähle "Registrieren". Gib deine E-Mail und ein sicheres Passwort ein.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Wie funktioniert das Rangsystem?</p>
                        <p className="text-muted-foreground">Du erhältst XP für jedes gespielte Quiz. Mit steigendem XP erhöhst du dein Level und steigst in den Rängen auf (Bronze, Silber, Gold, etc.).</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Was sind Clans?</p>
                        <p className="text-muted-foreground">Clans sind Gruppen von Spielern, die gemeinsam spielen und in Clan-Bestenlisten konkurrieren können.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Wie funktioniert der Multiplayer-Modus?</p>
                        <p className="text-muted-foreground">Erstelle eine Lobby oder tritt einer bei. Sobald alle Spieler bereit sind, startet das Quiz in Echtzeit.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Kann ich mein Konto löschen?</p>
                        <p className="text-muted-foreground">Ja, in den Profil-Einstellungen findest du die Option "Konto löschen".</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Ich habe einen Bug gefunden. Was soll ich tun?</p>
                        <p className="text-muted-foreground">Bitte kontaktiere uns unter flagquiz.support@gmail.com und beschreibe das Problem so genau wie möglich.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Gibt es eine mobile App?</p>
                        <p className="text-muted-foreground">Aktuell ist FlagQuiz als Web-App verfügbar, die auf allen Geräten funktioniert. Eine native App ist in Planung.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 pb-2 border-t">
          <p className="text-sm text-muted-foreground">
            © 2025 FlagQuiz. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Version 1.0.0 • Letztes Update: Oktober 2025
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
