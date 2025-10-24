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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="about">Über uns</TabsTrigger>
            <TabsTrigger value="contact">Kontakt</TabsTrigger>
            <TabsTrigger value="legal">Impressum</TabsTrigger>
            <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
            <TabsTrigger value="terms">AGB</TabsTrigger>
            <TabsTrigger value="career">Karriere</TabsTrigger>
            <TabsTrigger value="press">Presse</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
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
                    <h3 className="font-semibold text-lg mb-3">Kontakt & Support</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Hast du Fragen, Feedback oder technische Probleme? Wir helfen dir gerne weiter!
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
                    <h3 className="font-semibold text-lg mb-3">Social Media</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Folge uns auf Social Media für Updates, Tipps und Community-Events!
                    </p>

                    <div className="flex gap-4">
                      <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                      <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                      <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Facebook className="h-4 w-4" />
                        Facebook
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

          <TabsContent value="terms" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Allgemeine Geschäftsbedingungen (AGB)</h3>
                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                      <div>
                        <p className="font-semibold text-foreground mb-1">1. Geltungsbereich</p>
                        <p>Diese AGB gelten für die Nutzung der FlagQuiz-Plattform. Mit der Registrierung akzeptierst du diese Bedingungen.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">2. Nutzerkonto</p>
                        <p>Du bist verpflichtet, deine Zugangsdaten geheim zu halten und uns unverzüglich zu informieren, wenn du Kenntnis von einem Missbrauch deines Kontos erhältst.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">3. Nutzungsregeln</p>
                        <p>Die Nutzung der Plattform erfolgt auf eigene Verantwortung. Verboten sind: Cheating, Belästigung anderer Nutzer, Spam und jede Form von missbräuchlicher Nutzung.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">4. Haftung</p>
                        <p>Wir haften nur für Vorsatz und grobe Fahrlässigkeit. Die Nutzung erfolgt auf eigenes Risiko.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">5. Änderungen der AGB</p>
                        <p>Wir behalten uns vor, diese AGB jederzeit zu ändern. Änderungen werden dir per E-Mail mitgeteilt.</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">6. Kündigung</p>
                        <p>Du kannst dein Konto jederzeit in den Einstellungen löschen. Wir behalten uns vor, Konten bei Verstößen gegen diese AGB zu sperren.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Karriere bei FlagQuiz</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Wir sind immer auf der Suche nach talentierten und motivierten Menschen, die unsere Mission teilen!
                    </p>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-foreground mb-1">Offene Stellen</p>
                        <p className="text-muted-foreground">Aktuell haben wir keine offenen Stellen, aber wir freuen uns über Initiativbewerbungen!</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Bewerbung</p>
                        <p className="text-muted-foreground">Sende deine Bewerbung an: flagquiz.support@gmail.com</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Unsere Kultur</p>
                        <p className="text-muted-foreground">
                          Bei FlagQuiz arbeiten wir remote, flexibel und auf Augenhöhe. Wir schätzen Innovation, Kreativität und den Mut, neue Wege zu gehen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="press" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Newspaper className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Presse & Medien</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      Medienvertreter finden hier alle relevanten Informationen und Materialien.
                    </p>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-foreground mb-1">Pressekontakt</p>
                        <p className="text-muted-foreground">E-Mail: flagquiz.support@gmail.com</p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Über FlagQuiz</p>
                        <p className="text-muted-foreground">
                          FlagQuiz ist eine interaktive Quiz-Plattform mit Fokus auf Geographie, Flaggen und Weltwissen. Mit verschiedenen Spielmodi, Multiplayer-Funktionen und einer aktiven Community bietet die Plattform eine moderne Möglichkeit, geografisches Wissen zu erweitern.
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-foreground mb-1">Fakten</p>
                        <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Gegründet: 2025</li>
                          <li>Gründer: ijuriqu</li>
                          <li>Version: 1.0.0</li>
                        </ul>
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
