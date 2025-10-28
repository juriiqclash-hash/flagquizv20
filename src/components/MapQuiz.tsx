import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Flag, Building, Languages, Mountain, Info } from "lucide-react";
import { ALL_COUNTRIES } from "@/data/countries-full";
import { capitals } from "@/data/capitals";
import { countryMountains } from "@/data/mountains";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/data/translations";
import QuizHomeButton from "./QuizHomeButton";

interface MapQuizProps {
  onBack: () => void;
}

type QuizCategory = 'flags' | 'capitals' | 'languages' | 'mountains';

interface QuizQuestion {
  countryCode: string;
  question: string;
  answer: string;
  lat: number;
  lng: number;
}

const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  AF: { lat: 33.9391, lng: 67.7100 },
  AL: { lat: 41.1533, lng: 20.1683 },
  DZ: { lat: 28.0339, lng: 1.6596 },
  AD: { lat: 42.5063, lng: 1.5218 },
  AO: { lat: -11.2027, lng: 17.8739 },
  AG: { lat: 17.0608, lng: -61.7964 },
  AR: { lat: -38.4161, lng: -63.6167 },
  AM: { lat: 40.0691, lng: 45.0382 },
  AU: { lat: -25.2744, lng: 133.7751 },
  AT: { lat: 47.5162, lng: 14.5501 },
  AZ: { lat: 40.1431, lng: 47.5769 },
  BS: { lat: 25.0343, lng: -77.3963 },
  BH: { lat: 26.0667, lng: 50.5577 },
  BD: { lat: 23.6850, lng: 90.3563 },
  BB: { lat: 13.1939, lng: -59.5432 },
  BY: { lat: 53.7098, lng: 27.9534 },
  BE: { lat: 50.5039, lng: 4.4699 },
  BZ: { lat: 17.1899, lng: -88.4976 },
  BJ: { lat: 9.3077, lng: 2.3158 },
  BT: { lat: 27.5142, lng: 90.4336 },
  BO: { lat: -16.2902, lng: -63.5887 },
  BA: { lat: 43.9159, lng: 17.6791 },
  BW: { lat: -22.3285, lng: 24.6849 },
  BR: { lat: -14.2350, lng: -51.9253 },
  BN: { lat: 4.5353, lng: 114.7277 },
  BG: { lat: 42.7339, lng: 25.4858 },
  BF: { lat: 12.2383, lng: -1.5616 },
  BI: { lat: -3.3731, lng: 29.9189 },
  CV: { lat: 16.5388, lng: -23.0418 },
  KH: { lat: 12.5657, lng: 104.9910 },
  CM: { lat: 7.3697, lng: 12.3547 },
  CA: { lat: 56.1304, lng: -106.3468 },
  CF: { lat: 6.6111, lng: 20.9394 },
  TD: { lat: 15.4542, lng: 18.7322 },
  CL: { lat: -35.6751, lng: -71.5430 },
  CN: { lat: 35.8617, lng: 104.1954 },
  CO: { lat: 4.5709, lng: -74.2973 },
  KM: { lat: -11.6455, lng: 43.3333 },
  CG: { lat: -0.2280, lng: 15.8277 },
  CR: { lat: 9.7489, lng: -83.7534 },
  HR: { lat: 45.1000, lng: 15.2000 },
  CU: { lat: 21.5218, lng: -77.7812 },
  CY: { lat: 35.1264, lng: 33.4299 },
  CZ: { lat: 49.8175, lng: 15.4730 },
  CD: { lat: -4.0383, lng: 21.7587 },
  DK: { lat: 56.2639, lng: 9.5018 },
  DJ: { lat: 11.8251, lng: 42.5903 },
  DM: { lat: 15.4150, lng: -61.3710 },
  DO: { lat: 18.7357, lng: -70.1627 },
  EC: { lat: -1.8312, lng: -78.1834 },
  EG: { lat: 26.8206, lng: 30.8025 },
  SV: { lat: 13.7942, lng: -88.8965 },
  GQ: { lat: 1.6508, lng: 10.2679 },
  ER: { lat: 15.1794, lng: 39.7823 },
  EE: { lat: 58.5953, lng: 25.0136 },
  SZ: { lat: -26.5225, lng: 31.4659 },
  ET: { lat: 9.1450, lng: 40.4897 },
  FJ: { lat: -17.7134, lng: 178.0650 },
  FI: { lat: 61.9241, lng: 25.7482 },
  FR: { lat: 46.2276, lng: 2.2137 },
  GA: { lat: -0.8037, lng: 11.6094 },
  GM: { lat: 13.4432, lng: -15.3101 },
  GE: { lat: 42.3154, lng: 43.3569 },
  DE: { lat: 51.1657, lng: 10.4515 },
  GH: { lat: 7.9465, lng: -1.0232 },
  GR: { lat: 39.0742, lng: 21.8243 },
  GD: { lat: 12.1165, lng: -61.6790 },
  GT: { lat: 15.7835, lng: -90.2308 },
  GN: { lat: 9.9456, lng: -9.6966 },
  GW: { lat: 11.8037, lng: -15.1804 },
  GY: { lat: 4.8604, lng: -58.9302 },
  HT: { lat: 18.9712, lng: -72.2852 },
  HN: { lat: 15.2000, lng: -86.2419 },
  HU: { lat: 47.1625, lng: 19.5033 },
  IS: { lat: 64.9631, lng: -19.0208 },
  IN: { lat: 20.5937, lng: 78.9629 },
  ID: { lat: -0.7893, lng: 113.9213 },
  IR: { lat: 32.4279, lng: 53.6880 },
  IQ: { lat: 33.2232, lng: 43.6793 },
  IE: { lat: 53.4129, lng: -8.2439 },
  IL: { lat: 31.0461, lng: 34.8516 },
  IT: { lat: 41.8719, lng: 12.5674 },
  CI: { lat: 7.5400, lng: -5.5471 },
  JM: { lat: 18.1096, lng: -77.2975 },
  JP: { lat: 36.2048, lng: 138.2529 },
  JO: { lat: 30.5852, lng: 36.2384 },
  KZ: { lat: 48.0196, lng: 66.9237 },
  KE: { lat: -0.0236, lng: 37.9062 },
  KI: { lat: -3.3704, lng: -168.7340 },
  XK: { lat: 42.6026, lng: 20.9030 },
  KW: { lat: 29.3117, lng: 47.4818 },
  KG: { lat: 41.2044, lng: 74.7661 },
  LA: { lat: 19.8563, lng: 102.4955 },
  LV: { lat: 56.8796, lng: 24.6032 },
  LB: { lat: 33.8547, lng: 35.8623 },
  LS: { lat: -29.6100, lng: 28.2336 },
  LR: { lat: 6.4281, lng: -9.4295 },
  LY: { lat: 26.3351, lng: 17.2283 },
  LI: { lat: 47.1660, lng: 9.5554 },
  LT: { lat: 55.1694, lng: 23.8813 },
  LU: { lat: 49.8153, lng: 6.1296 },
  MG: { lat: -18.7669, lng: 46.8691 },
  MW: { lat: -13.2543, lng: 34.3015 },
  MY: { lat: 4.2105, lng: 101.9758 },
  MV: { lat: 3.2028, lng: 73.2207 },
  ML: { lat: 17.5707, lng: -3.9962 },
  MT: { lat: 35.9375, lng: 14.3754 },
  MH: { lat: 7.1315, lng: 171.1845 },
  MR: { lat: 21.0079, lng: -10.9408 },
  MU: { lat: -20.3484, lng: 57.5522 },
  MX: { lat: 23.6345, lng: -102.5528 },
  FM: { lat: 7.4256, lng: 150.5508 },
  MD: { lat: 47.4116, lng: 28.3699 },
  MC: { lat: 43.7384, lng: 7.4246 },
  MN: { lat: 46.8625, lng: 103.8467 },
  ME: { lat: 42.7087, lng: 19.3744 },
  MA: { lat: 31.7917, lng: -7.0926 },
  MZ: { lat: -18.6657, lng: 35.5296 },
  MM: { lat: 21.9162, lng: 95.9560 },
  NA: { lat: -22.9576, lng: 18.4904 },
  NR: { lat: -0.5228, lng: 166.9315 },
  NP: { lat: 28.3949, lng: 84.1240 },
  NL: { lat: 52.1326, lng: 5.2913 },
  NZ: { lat: -40.9006, lng: 174.8860 },
  NI: { lat: 12.8654, lng: -85.2072 },
  NE: { lat: 17.6078, lng: 8.0817 },
  NG: { lat: 9.0820, lng: 8.6753 },
  KP: { lat: 40.3399, lng: 127.5101 },
  MK: { lat: 41.6086, lng: 21.7453 },
  NO: { lat: 60.4720, lng: 8.4689 },
  OM: { lat: 21.4735, lng: 55.9754 },
  PK: { lat: 30.3753, lng: 69.3451 },
  PW: { lat: 7.5150, lng: 134.5825 },
  PS: { lat: 31.9522, lng: 35.2332 },
  PA: { lat: 8.5380, lng: -80.7821 },
  PG: { lat: -6.3150, lng: 143.9555 },
  PY: { lat: -23.4425, lng: -58.4438 },
  PE: { lat: -9.1900, lng: -75.0152 },
  PH: { lat: 12.8797, lng: 121.7740 },
  PL: { lat: 51.9194, lng: 19.1451 },
  PT: { lat: 39.3999, lng: -8.2245 },
  QA: { lat: 25.3548, lng: 51.1839 },
  RO: { lat: 45.9432, lng: 24.9668 },
  RU: { lat: 61.5240, lng: 105.3188 },
  RW: { lat: -1.9403, lng: 29.8739 },
  KN: { lat: 17.3578, lng: -62.7830 },
  LC: { lat: 13.9094, lng: -60.9789 },
  VC: { lat: 12.9843, lng: -61.2872 },
  WS: { lat: -13.7590, lng: -172.1046 },
  SM: { lat: 43.9424, lng: 12.4578 },
  ST: { lat: 0.1864, lng: 6.6131 },
  SA: { lat: 23.8859, lng: 45.0792 },
  SN: { lat: 14.4974, lng: -14.4524 },
  RS: { lat: 44.0165, lng: 21.0059 },
  SC: { lat: -4.6796, lng: 55.4920 },
  SL: { lat: 8.4606, lng: -11.7799 },
  SG: { lat: 1.3521, lng: 103.8198 },
  SK: { lat: 48.6690, lng: 19.6990 },
  SI: { lat: 46.1512, lng: 14.9955 },
  SB: { lat: -9.6457, lng: 160.1562 },
  SO: { lat: 5.1521, lng: 46.1996 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  KR: { lat: 35.9078, lng: 127.7669 },
  SS: { lat: 6.8770, lng: 31.3070 },
  ES: { lat: 40.4637, lng: -3.7492 },
  LK: { lat: 7.8731, lng: 80.7718 },
  SD: { lat: 12.8628, lng: 30.2176 },
  SR: { lat: 3.9193, lng: -56.0278 },
  SE: { lat: 60.1282, lng: 18.6435 },
  CH: { lat: 46.8182, lng: 8.2275 },
  SY: { lat: 34.8021, lng: 38.9968 },
  TW: { lat: 23.6978, lng: 120.9605 },
  TJ: { lat: 38.8610, lng: 71.2761 },
  TZ: { lat: -6.3690, lng: 34.8888 },
  TH: { lat: 15.8700, lng: 100.9925 },
  TL: { lat: -8.8742, lng: 125.7275 },
  TG: { lat: 8.6195, lng: 0.8248 },
  TO: { lat: -21.1790, lng: -175.1982 },
  TT: { lat: 10.6918, lng: -61.2225 },
  TN: { lat: 33.8869, lng: 9.5375 },
  TR: { lat: 38.9637, lng: 35.2433 },
  TM: { lat: 38.9697, lng: 59.5563 },
  TV: { lat: -7.1095, lng: 177.6493 },
  UG: { lat: 1.3733, lng: 32.2903 },
  UA: { lat: 48.3794, lng: 31.1656 },
  AE: { lat: 23.4241, lng: 53.8478 },
  GB: { lat: 55.3781, lng: -3.4360 },
  US: { lat: 37.0902, lng: -95.7129 },
  UY: { lat: -32.5228, lng: -55.7658 },
  UZ: { lat: 41.3775, lng: 64.5853 },
  VU: { lat: -15.3767, lng: 166.9592 },
  VA: { lat: 41.9029, lng: 12.4534 },
  VE: { lat: 6.4238, lng: -66.5897 },
  VN: { lat: 14.0583, lng: 108.2772 },
  YE: { lat: 15.5527, lng: 48.5164 },
  ZM: { lat: -13.1339, lng: 27.8493 },
  ZW: { lat: -19.0154, lng: 29.1549 },
  AQ: { lat: -75.2509, lng: 0.0000 },
};

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const correctIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getScoreFromDistance(distance: number, isMountain: boolean = false): number {
  if (isMountain) {
    if (distance < 10) return 1000;
    if (distance < 25) return 950;
    if (distance < 50) return 900;
    if (distance < 100) return 800;
    if (distance < 200) return 600;
    if (distance < 500) return 400;
    if (distance < 1000) return 200;
    return 50;
  } else {
    if (distance < 50) return 1000;
    if (distance < 100) return 950;
    if (distance < 200) return 900;
    if (distance < 500) return 800;
    if (distance < 1000) return 600;
    if (distance < 2000) return 400;
    if (distance < 5000) return 200;
    return 50;
  }
}

function MapClickHandler({ onMapClick, disabled }: { onMapClick: (lat: number, lng: number) => void, disabled: boolean }) {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapQuiz({ onBack }: MapQuizProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);

  const generateQuestion = (category: QuizCategory): QuizQuestion | null => {
    const randomCountry = ALL_COUNTRIES[Math.floor(Math.random() * ALL_COUNTRIES.length)];
    const coords = countryCoordinates[randomCountry.code];

    if (!coords) return null;

    let question = '';
    let answer = randomCountry.name;
    let questionLat = coords.lat;
    let questionLng = coords.lng;

    switch (category) {
      case 'flags':
        question = `Wo liegt ${randomCountry.name}?`;
        break;
      case 'capitals': {
        const capital = capitals.find(c => c.code === randomCountry.code);
        if (capital) {
          question = `Wo liegt das Land mit der Hauptstadt ${capital.capital}?`;
          answer = randomCountry.name;
        } else {
          return generateQuestion(category);
        }
        break;
      }
      case 'languages':
        question = `Wo liegt ${randomCountry.name}?`;
        break;
      case 'mountains': {
        const mountain = countryMountains.find(m => m.code === randomCountry.code);
        if (mountain && mountain.coordinates) {
          question = `Wo liegt der Berg ${mountain.highestPeak}?`;
          answer = mountain.highestPeak;
          questionLat = mountain.coordinates.lat;
          questionLng = mountain.coordinates.lng;
        } else {
          return generateQuestion(category);
        }
        break;
      }
    }

    return {
      countryCode: randomCountry.code,
      question,
      answer,
      lat: questionLat,
      lng: questionLng
    };
  };

  const startQuiz = (category: QuizCategory) => {
    setSelectedCategory(category);
    const question = generateQuestion(category);
    setCurrentQuestion(question);
    setQuestionCount(0);
    setTotalScore(0);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (hasGuessed || !currentQuestion) return;

    setUserGuess({ lat, lng });

    const dist = getDistance(lat, lng, currentQuestion.lat, currentQuestion.lng);
    const isMountain = selectedCategory === 'mountains';
    const earnedScore = getScoreFromDistance(dist, isMountain);

    setDistance(Math.round(dist));
    setScore(earnedScore);
    setTotalScore(prev => prev + earnedScore);
    setHasGuessed(true);
  };

  const nextQuestion = () => {
    if (!selectedCategory) return;

    const question = generateQuestion(selectedCategory);
    setCurrentQuestion(question);
    setUserGuess(null);
    setHasGuessed(false);
    setDistance(null);
    setScore(0);
    setQuestionCount(prev => prev + 1);
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={onBack} variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold">Karten Quiz</h1>
          </div>

          <QuizHomeButton />

          <div className="mb-8">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold">So funktioniert das Karten Quiz:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Wähle eine Kategorie aus</li>
                      <li>Du bekommst eine Frage zu einem Land, einer Hauptstadt oder einem Berg</li>
                      <li>Klicke auf die interaktive Weltkarte, wo du denkst, dass es liegt</li>
                      <li>Du kannst zoomen und die Karte verschieben</li>
                      <li>Je näher dein Klick am richtigen Ort ist, desto mehr Punkte bekommst du</li>
                      <li>Bei Bergen: Je präziser auf dem Berg, desto höher die Punkte</li>
                      <li>Das Quiz läuft unendlich - spiele so lange du willst!</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startQuiz('flags')}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Flag className="h-12 w-12 text-blue-500" />
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Länder</h3>
                    <p className="text-sm text-muted-foreground">Finde Länder auf der Weltkarte</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startQuiz('capitals')}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Building className="h-12 w-12 text-amber-500" />
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Hauptstädte</h3>
                    <p className="text-sm text-muted-foreground">Finde Länder anhand ihrer Hauptstadt</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startQuiz('languages')}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Languages className="h-12 w-12 text-cyan-500" />
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Amtssprachen</h3>
                    <p className="text-sm text-muted-foreground">Finde Länder anhand ihrer Amtssprache</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => startQuiz('mountains')}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Mountain className="h-12 w-12 text-emerald-500" />
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Höchste Berge</h3>
                    <p className="text-sm text-muted-foreground">Finde den höchsten Berg eines Landes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => {
              setSelectedCategory(null);
              setUserGuess(null);
              setHasGuessed(false);
              setCurrentQuestion(null);
            }} variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Karten Quiz</h1>
              <p className="text-sm text-muted-foreground">
                Frage {questionCount + 1} • Gesamt: {totalScore} Punkte
              </p>
            </div>
          </div>

          <QuizHomeButton />
        </div>

        {currentQuestion && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">{currentQuestion.question}</h2>
                {!hasGuessed && (
                  <p className="text-muted-foreground">Klicke auf die Karte oder zoome für mehr Details</p>
                )}
                {hasGuessed && (
                  <div className="mt-4 space-y-2">
                    <p className="text-lg">
                      Antwort: <span className="font-bold">{currentQuestion.answer}</span>
                    </p>
                    {distance !== null && (
                      <p className="text-muted-foreground">
                        Du warst {distance} km entfernt • +{score} Punkte
                      </p>
                    )}
                    <Button onClick={nextQuestion} className="mt-4">
                      Nächste Frage
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="h-[600px] w-full rounded-lg overflow-hidden">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                minZoom={2}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                worldCopyJump={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} disabled={hasGuessed} />

                {userGuess && (
                  <Marker position={[userGuess.lat, userGuess.lng]} icon={userIcon}>
                    <Popup>Deine Vermutung</Popup>
                  </Marker>
                )}

                {hasGuessed && currentQuestion && (
                  <Marker position={[currentQuestion.lat, currentQuestion.lng]} icon={correctIcon}>
                    <Popup>
                      Richtige Position: {currentQuestion.answer}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
