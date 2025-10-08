export interface Capital {
  country: string;
  capital: string;
  code: string; // Country code for consistency
}

export const capitals: Capital[] = [
  { country: "Deutschland", capital: "Berlin", code: "DE" },
  { country: "Frankreich", capital: "Paris", code: "FR" },
  { country: "Italien", capital: "Rom", code: "IT" },
  { country: "Spanien", capital: "Madrid", code: "ES" },
  { country: "Niederlande", capital: "Amsterdam", code: "NL" },
  { country: "Belgien", capital: "Brüssel", code: "BE" },
  { country: "Österreich", capital: "Wien", code: "AT" },
  { country: "Schweiz", capital: "Bern", code: "CH" },
  { country: "Polen", capital: "Warschau", code: "PL" },
  { country: "Tschechien", capital: "Prag", code: "CZ" },
  { country: "Ungarn", capital: "Budapest", code: "HU" },
  { country: "Slowakei", capital: "Bratislava", code: "SK" },
  { country: "Slowenien", capital: "Ljubljana", code: "SI" },
  { country: "Kroatien", capital: "Zagreb", code: "HR" },
  { country: "Serbien", capital: "Belgrad", code: "RS" },
  { country: "Bulgarien", capital: "Sofia", code: "BG" },
  { country: "Rumänien", capital: "Bukarest", code: "RO" },
  { country: "Griechenland", capital: "Athen", code: "GR" },
  { country: "Portugal", capital: "Lissabon", code: "PT" },
  { country: "Norwegen", capital: "Oslo", code: "NO" },
  { country: "Schweden", capital: "Stockholm", code: "SE" },
  { country: "Dänemark", capital: "Kopenhagen", code: "DK" },
  { country: "Finnland", capital: "Helsinki", code: "FI" },
  { country: "Island", capital: "Reykjavik", code: "IS" },
  { country: "Irland", capital: "Dublin", code: "IE" },
  { country: "Vereinigtes Königreich", capital: "London", code: "GB" },
  { country: "Russland", capital: "Moskau", code: "RU" },
  { country: "Ukraine", capital: "Kiew", code: "UA" },
  { country: "Belarus", capital: "Minsk", code: "BY" },
  { country: "Litauen", capital: "Vilnius", code: "LT" },
  { country: "Lettland", capital: "Riga", code: "LV" },
  { country: "Estland", capital: "Tallinn", code: "EE" },
  { country: "USA", capital: "Washington D.C.", code: "US" },
  { country: "Kanada", capital: "Ottawa", code: "CA" },
  { country: "Mexiko", capital: "Mexiko-Stadt", code: "MX" },
  { country: "Brasilien", capital: "Brasília", code: "BR" },
  { country: "Argentinien", capital: "Buenos Aires", code: "AR" },
  { country: "Chile", capital: "Santiago", code: "CL" },
  { country: "Peru", capital: "Lima", code: "PE" },
  { country: "Kolumbien", capital: "Bogotá", code: "CO" },
  { country: "Venezuela", capital: "Caracas", code: "VE" },
  { country: "Japan", capital: "Tokio", code: "JP" },
  { country: "China", capital: "Peking", code: "CN" },
  { country: "Indien", capital: "Neu-Delhi", code: "IN" },
  { country: "Südkorea", capital: "Seoul", code: "KR" },
  { country: "Thailand", capital: "Bangkok", code: "TH" },
  { country: "Vietnam", capital: "Hanoi", code: "VN" },
  { country: "Indonesien", capital: "Jakarta", code: "ID" },
  { country: "Malaysia", capital: "Kuala Lumpur", code: "MY" },
  { country: "Singapur", capital: "Singapur", code: "SG" },
  { country: "Philippinen", capital: "Manila", code: "PH" },
  { country: "Australien", capital: "Canberra", code: "AU" },
  { country: "Neuseeland", capital: "Wellington", code: "NZ" },
  { country: "Südafrika", capital: "Kapstadt", code: "ZA" },
  { country: "Ägypten", capital: "Kairo", code: "EG" },
  { country: "Marokko", capital: "Rabat", code: "MA" },
  { country: "Nigeria", capital: "Abuja", code: "NG" },
  { country: "Kenia", capital: "Nairobi", code: "KE" },
  { country: "Ghana", capital: "Accra", code: "GH" },
  { country: "Türkei", capital: "Ankara", code: "TR" },
  { country: "Israel", capital: "Jerusalem", code: "IL" },
  { country: "Saudi-Arabien", capital: "Riad", code: "SA" },
  { country: "Vereinigte Arabische Emirate", capital: "Abu Dhabi", code: "AE" },
  { country: "Iran", capital: "Teheran", code: "IR" },
  { country: "Irak", capital: "Bagdad", code: "IQ" },
];

export const checkCapitalAnswer = (userAnswer: string, capital: Capital, mode: 'country-capital' | 'capital-country'): boolean => {
  const answer = userAnswer.toLowerCase().trim();
  
  if (mode === 'country-capital') {
    // User should provide the capital
    const correctAnswer = capital.capital.toLowerCase();
    return answer === correctAnswer || correctAnswer.includes(answer) || answer.includes(correctAnswer);
  } else {
    // User should provide the country
    const correctAnswer = capital.country.toLowerCase();
    return answer === correctAnswer || correctAnswer.includes(answer) || answer.includes(correctAnswer);
  }
};