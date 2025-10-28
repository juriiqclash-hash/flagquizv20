import { countryEnglishNames } from './country-english-names';

export interface Country {
  name: string;
  code: string; // ISO 2-letter country code
  continent: string;
  capital: string;
  aliases?: string[]; // alternative names for input matching
  emojis?: string; // emoji representation of the country
  englishName?: string; // English name for input matching
}

export function getFlagUrl(code: string): string {
  return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
}

export const countries: Country[] = [
  // Afrika (54 Länder)
  { name: "Ägypten", code: "EG", continent: "Afrika", capital: "Kairo", emojis: "🏜️🕌🐪", englishName: "Egypt" },
  { name: "Äquatorialguinea", code: "GQ", continent: "Afrika", capital: "Malabo", emojis: "🌴🐒🦁", englishName: "Equatorial Guinea" },
  { name: "Äthiopien", code: "ET", continent: "Afrika", capital: "Addis Abeba", emojis: "🏔️🦁☕", englishName: "Ethiopia" },
  { name: "Algerien", code: "DZ", continent: "Afrika", capital: "Algier", emojis: "🏜️🌴🕌", englishName: "Algeria" },
  { name: "Angola", code: "AO", continent: "Afrika", capital: "Luanda", emojis: "🥭⛏️🦁", englishName: "Angola" },
  { name: "Benin", code: "BJ", continent: "Afrika", capital: "Porto-Novo", emojis: "🌾🦁🎶", englishName: "Benin" },
  { name: "Botswana", code: "BW", continent: "Afrika", capital: "Gaborone", emojis: "🐘🏜️🌾", englishName: "Botswana" },
  { name: "Burkina Faso", code: "BF", continent: "Afrika", capital: "Ouagadougou", emojis: "🌾🦁🎶", englishName: "Burkina Faso" },
  { name: "Burundi", code: "BI", continent: "Afrika", capital: "Gitega", emojis: "🌾🐒🏞️", englishName: "Burundi" },
  { name: "Dschibuti", code: "DJ", continent: "Afrika", capital: "Dschibuti", emojis: "🌊🏜️🦎", englishName: "Djibouti" },
  { name: "Elfenbeinküste", code: "CI", continent: "Afrika", capital: "Yamoussoukro", aliases: ["Côte d'Ivoire", "Cote d'Ivoire"], emojis: "🌴🐘🥭", englishName: "Ivory Coast" },
  { name: "Eritrea", code: "ER", continent: "Afrika", capital: "Asmara", emojis: "🏜️⛵🦎", englishName: "Eritrea" },
  { name: "Eswatini", code: "SZ", continent: "Afrika", capital: "Mbabane", aliases: ["Swasiland"], emojis: "🏞️🦁🥁", englishName: "Eswatini" },
  { name: "Gabun", code: "GA", continent: "Afrika", capital: "Libreville", emojis: "🌴🐒🦁", englishName: "Gabon" },
  { name: "Gambia", code: "GM", continent: "Afrika", capital: "Banjul", emojis: "🌊🐘🌴", englishName: "Gambia" },
  { name: "Ghana", code: "GH", continent: "Afrika", capital: "Accra", emojis: "🥭🦁🎶", englishName: "Ghana" },
  { name: "Guinea", code: "GN", continent: "Afrika", capital: "Conakry", emojis: "🌾🦁🥭", englishName: "Guinea" },
  { name: "Guinea-Bissau", code: "GW", continent: "Afrika", capital: "Bissau", emojis: "🏖️🌴🦁", englishName: "Guinea-Bissau" },
  { name: "Kamerun", code: "CM", continent: "Afrika", capital: "Yaoundé", emojis: "🌴🦁🍍", englishName: "Cameroon" },
  { name: "Kap Verde", code: "CV", continent: "Afrika", capital: "Praia", emojis: "🏝️🌊⛵", englishName: "Cabo Verde" },
  { name: "Kenia", code: "KE", continent: "Afrika", capital: "Nairobi", emojis: "🦁🏞️🌾", englishName: "Kenya" },
  { name: "Komoren", code: "KM", continent: "Afrika", capital: "Moroni", emojis: "🏝️🌊🐠", englishName: "Comoros" },
  { name: "Kongo, Demokratische Republik", code: "CD", continent: "Afrika", capital: "Kinshasa", aliases: ["Demokratische Republik Kongo", "DR Kongo"], emojis: "🌴🏞️🐒", englishName: "DR Congo" },
  { name: "Kongo, Republik", code: "CG", continent: "Afrika", capital: "Brazzaville", aliases: ["Republik Kongo"], emojis: "🌴🏞️🦁", englishName: "Congo" },
  { name: "Lesotho", code: "LS", continent: "Afrika", capital: "Maseru", emojis: "🏔️🛖🦘", englishName: "Lesotho" },
  { name: "Liberia", code: "LR", continent: "Afrika", capital: "Monrovia", emojis: "🌊🏖️🦁", englishName: "Liberia" },
  { name: "Libyen", code: "LY", continent: "Afrika", capital: "Tripolis", emojis: "🏜️🌴🕌", englishName: "Libya" },
  { name: "Madagaskar", code: "MG", continent: "Afrika", capital: "Antananarivo", emojis: "🌴🦎🐒", englishName: "Madagascar" },
  { name: "Malawi", code: "MW", continent: "Afrika", capital: "Lilongwe", emojis: "🌄🦁🌾", englishName: "Malawi" },
  { name: "Mali", code: "ML", continent: "Afrika", capital: "Bamako", emojis: "🌾🦁🌴", englishName: "Mali" },
  { name: "Marokko", code: "MA", continent: "Afrika", capital: "Rabat", emojis: "🏜️🕌🐪", englishName: "Morocco" },
  { name: "Mauretanien", code: "MR", continent: "Afrika", capital: "Nouakchott", emojis: "🏜️🐪🌴", englishName: "Mauritania" },
  { name: "Mauritius", code: "MU", continent: "Afrika", capital: "Port Louis", emojis: "🏝️🌴🐠", englishName: "Mauritius" },
  { name: "Mosambik", code: "MZ", continent: "Afrika", capital: "Maputo", emojis: "🌾🐘🛶", englishName: "Mozambique" },
  { name: "Namibia", code: "NA", continent: "Afrika", capital: "Windhoek", emojis: "🏜️🦁🐘", englishName: "Namibia" },
  { name: "Niger", code: "NE", continent: "Afrika", capital: "Niamey", emojis: "🏜️🌾🦁", englishName: "Niger" },
  { name: "Nigeria", code: "NG", continent: "Afrika", capital: "Abuja", emojis: "🌾🦁🥭", englishName: "Nigeria" },
  { name: "Ruanda", code: "RW", continent: "Afrika", capital: "Kigali", emojis: "🦍🌾🏞️", englishName: "Rwanda" },
  { name: "Sambia", code: "ZM", continent: "Afrika", capital: "Lusaka", emojis: "🦁🌾🏞️", englishName: "Zambia" },
  { name: "São Tomé und Príncipe", code: "ST", continent: "Afrika", capital: "São Tomé", aliases: ["Sao Tome und Principe"], emojis: "🌴🐒🍍", englishName: "Sao Tome and Principe" },
  { name: "Senegal", code: "SN", continent: "Afrika", capital: "Dakar", emojis: "🌴🦁🎶", englishName: "Senegal" },
  { name: "Seychellen", code: "SC", continent: "Afrika", capital: "Victoria", emojis: "🏝️🌴🐠", englishName: "Seychelles" },
  { name: "Sierra Leone", code: "SL", continent: "Afrika", capital: "Freetown", emojis: "🌴🌊🦁", englishName: "Sierra Leone" },
  { name: "Simbabwe", code: "ZW", continent: "Afrika", capital: "Harare", aliases: ["Zimbabwe"], emojis: "🦁🏞️🌾", englishName: "Zimbabwe" },
  { name: "Somalia", code: "SO", continent: "Afrika", capital: "Mogadischu", emojis: "🏖️🌴🐪", englishName: "Somalia" },
  { name: "Südafrika", code: "ZA", continent: "Afrika", capital: "Kapstadt", emojis: "🦁🏞️🌊", englishName: "South Africa" },
  { name: "Sudan", code: "SD", continent: "Afrika", capital: "Khartum", emojis: "🏜️🌾🐪", englishName: "Sudan" },
  { name: "Südsudan", code: "SS", continent: "Afrika", capital: "Juba", emojis: "🌾🦁🏞️", englishName: "South Sudan" },
  { name: "Tansania", code: "TZ", continent: "Afrika", capital: "Dodoma", emojis: "🦁🌴🏞️", englishName: "Tanzania" },
  { name: "Togo", code: "TG", continent: "Afrika", capital: "Lomé", emojis: "🌴🥭🦁", englishName: "Togo" },
  { name: "Tschad", code: "TD", continent: "Afrika", capital: "N'Djamena", emojis: "🏜️🌾🦁", englishName: "Chad" },
  { name: "Tunesien", code: "TN", continent: "Afrika", capital: "Tunis", emojis: "🏜️🕌🌊", englishName: "Tunisia" },
  { name: "Uganda", code: "UG", continent: "Afrika", capital: "Kampala", emojis: "🦁🌾🏞️", englishName: "Uganda" },
  { name: "Zentralafrikanische Republik", code: "CF", continent: "Afrika", capital: "Bangui", emojis: "🦁🌴🏞️", englishName: "Central African Republic" },

  // Asien (49 Länder)
  { name: "Afghanistan", code: "AF", continent: "Asien", capital: "Kabul", emojis: "🏔️🕌🐪" },
  { name: "Armenien", code: "AM", continent: "Asien", capital: "Eriwan", emojis: "🏔️🍇⛪" },
  { name: "Aserbaidschan", code: "AZ", continent: "Asien", capital: "Baku", emojis: "🌊🕌🏞️" },
  { name: "Bahrain", code: "BH", continent: "Asien", capital: "Manama", emojis: "🏜️🌴🕌" },
  { name: "Bangladesch", code: "BD", continent: "Asien", capital: "Dhaka", emojis: "🌾🐅🏞️" },
  { name: "Bhutan", code: "BT", continent: "Asien", capital: "Thimphu", emojis: "🏔️🐉🛕" },
  { name: "Brunei", code: "BN", continent: "Asien", capital: "Bandar Seri Begawan", emojis: "🕌🌴🐅" },
  { name: "China", code: "CN", continent: "Asien", capital: "Peking", emojis: "🏯🐉🥢" },
  { name: "Georgien", code: "GE", continent: "Asien", capital: "Tiflis", emojis: "🏔️⛪🍇" },
  { name: "Indien", code: "IN", continent: "Asien", capital: "Neu-Delhi", emojis: "🛕🐘🥭" },
  { name: "Indonesien", code: "ID", continent: "Asien", capital: "Jakarta", emojis: "🌴🏝️🍚" },
  { name: "Irak", code: "IQ", continent: "Asien", capital: "Bagdad", emojis: "🏜️🕌🐪" },
  { name: "Iran", code: "IR", continent: "Asien", capital: "Teheran", emojis: "🕌🏜️🌹" },
  { name: "Israel", code: "IL", continent: "Asien", capital: "Jerusalem", emojis: "🕍🌊🕊️" },
  { name: "Japan", code: "JP", continent: "Asien", capital: "Tokio", emojis: "🌸🍣🏯" },
  { name: "Jemen", code: "YE", continent: "Asien", capital: "Sanaa", emojis: "🏜️🐪🕌" },
  { name: "Jordanien", code: "JO", continent: "Asien", capital: "Amman", emojis: "🏜️🕌🕊️" },
  { name: "Kambodscha", code: "KH", continent: "Asien", capital: "Phnom Penh", emojis: "🛕🌿🐘" },
  { name: "Kasachstan", code: "KZ", continent: "Asien", capital: "Nur-Sultan", emojis: "🏜️🐎🌾" },
  { name: "Katar", code: "QA", continent: "Asien", capital: "Doha", aliases: ["Qatar"], emojis: "🏜️⛵🕌" },
  { name: "Kirgisistan", code: "KG", continent: "Asien", capital: "Bischkek", aliases: ["Kirgistan"], emojis: "🏔️🐎⛺" },
  { name: "Kuwait", code: "KW", continent: "Asien", capital: "Kuwait-Stadt", emojis: "🏜️🕌🌴" },
  { name: "Laos", code: "LA", continent: "Asien", capital: "Vientiane", emojis: "🌿🏞️🛕" },
  { name: "Libanon", code: "LB", continent: "Asien", capital: "Beirut", emojis: "🌲⛪🏔️" },
  { name: "Malaysia", code: "MY", continent: "Asien", capital: "Kuala Lumpur", emojis: "🏝️🕌🐅" },
  { name: "Malediven", code: "MV", continent: "Asien", capital: "Malé", emojis: "🏝️🌊🐠" },
  { name: "Mongolei", code: "MN", continent: "Asien", capital: "Ulaanbaatar", emojis: "🏔️🐎⛺" },
  { name: "Myanmar", code: "MM", continent: "Asien", capital: "Naypyidaw", aliases: ["Burma"], emojis: "🏞️🛕🐘" },
  { name: "Nepal", code: "NP", continent: "Asien", capital: "Kathmandu", emojis: "🏔️🛕🕊️" },
  { name: "Nordkorea", code: "KP", continent: "Asien", capital: "Pjöngjang", emojis: "🏔️🚩🕌" },
  { name: "Oman", code: "OM", continent: "Asien", capital: "Maskat", emojis: "🏜️🕌🐪" },
  { name: "Pakistan", code: "PK", continent: "Asien", capital: "Islamabad", emojis: "🕌🌾🐅" },
  { name: "Palästina", code: "PS", continent: "Asien", capital: "Ramallah", aliases: ["Palestina"], emojis: "🏜️🕊️🕌" },
  { name: "Philippinen", code: "PH", continent: "Asien", capital: "Manila", emojis: "🏝️🌊🐒" },
  { name: "Russland", code: "RU", continent: "Asien", capital: "Moskau", emojis: "🏔️🏰❄️" },
  { name: "Saudi-Arabien", code: "SA", continent: "Asien", capital: "Riad", emojis: "🏜️🕌🐪" },
  { name: "Singapur", code: "SG", continent: "Asien", capital: "Singapur", emojis: "🌆🛳️🌴" },
  { name: "Sri Lanka", code: "LK", continent: "Asien", capital: "Sri Jayawardenepura Kotte", emojis: "🌴🐘🍛" },
  { name: "Südkorea", code: "KR", continent: "Asien", capital: "Seoul", emojis: "🏙️⚽🥢" },
  { name: "Syrien", code: "SY", continent: "Asien", capital: "Damaskus", emojis: "🏜️🕌🕊️" },
  { name: "Tadschikistan", code: "TJ", continent: "Asien", capital: "Duschanbe", emojis: "🏔️🍇🌾" },
  { name: "Thailand", code: "TH", continent: "Asien", capital: "Bangkok", emojis: "🛕🐘🥥" },
  { name: "Timor-Leste", code: "TL", continent: "Asien", capital: "Dili", emojis: "🌴🏝️🐟" },
  { name: "Türkei", code: "TR", continent: "Asien", capital: "Ankara", aliases: ["Turkei"], emojis: "🕌🐓🌊" },
  { name: "Turkmenistan", code: "TM", continent: "Asien", capital: "Aschgabat", emojis: "🏜️🕌🐎" },
  { name: "Usbekistan", code: "UZ", continent: "Asien", capital: "Taschkent", emojis: "🏜️🕌🐎" },
  { name: "Vereinigte Arabische Emirate", code: "AE", continent: "Asien", capital: "Abu Dhabi", aliases: ["VAE"], emojis: "🏙️🏜️🕌" },
  { name: "Taiwan", code: "TW", continent: "Asien", capital: "Taipeh", emojis: "🏙️🌸🍵" },
  { name: "Vietnam", code: "VN", continent: "Asien", capital: "Hanoi", emojis: "🛕🌾🐉" },
  { name: "Zypern", code: "CY", continent: "Asien", capital: "Nikosia", emojis: "🏖️🕊️⛪" },

  // Europa (44 Länder)
  { name: "Albanien", code: "AL", continent: "Europa", capital: "Tirana", emojis: "🦅🏰🌊" },
  { name: "Andorra", code: "AD", continent: "Europa", capital: "Andorra la Vella", emojis: "🏔️🏰⛷️" },
  { name: "Belgien", code: "BE", continent: "Europa", capital: "Brüssel", emojis: "🏰🍺⚽" },
  { name: "Bosnien und Herzegowina", code: "BA", continent: "Europa", capital: "Sarajevo", emojis: "⛰️🌊🕌" },
  { name: "Bulgarien", code: "BG", continent: "Europa", capital: "Sofia", emojis: "🏰🌲🥛" },
  { name: "Dänemark", code: "DK", continent: "Europa", capital: "Kopenhagen", aliases: ["Daenemark"], emojis: "🏰⛵🍰" },
  { name: "Deutschland", code: "DE", continent: "Europa", capital: "Berlin", emojis: "🏰🍺🥨" },
  { name: "Estland", code: "EE", continent: "Europa", capital: "Tallinn", emojis: "🌲🏞️⛵" },
  { name: "Finnland", code: "FI", continent: "Europa", capital: "Helsinki", emojis: "🌲🏞️🛶" },
  { name: "Frankreich", code: "FR", continent: "Europa", capital: "Paris", emojis: "🗼🍷🥖" },
  { name: "Griechenland", code: "GR", continent: "Europa", capital: "Athen", emojis: "🏛️🌊🥗" },
  { name: "Irland", code: "IE", continent: "Europa", capital: "Dublin", emojis: "🌿🍀🍺" },
  { name: "Island", code: "IS", continent: "Europa", capital: "Reykjavík", emojis: "🏔️🌋🛶" },
  { name: "Italien", code: "IT", continent: "Europa", capital: "Rom", emojis: "🍕⛪🌿" },
  { name: "Kosovo", code: "XK", continent: "Europa", capital: "Prishtina", emojis: "🏰🦅🌄" },
  { name: "Kroatien", code: "HR", continent: "Europa", capital: "Zagreb", emojis: "🏰⚓🌊" },
  { name: "Lettland", code: "LV", continent: "Europa", capital: "Riga", emojis: "🌲🏞️🍞" },
  { name: "Liechtenstein", code: "LI", continent: "Europa", capital: "Vaduz", emojis: "🏰⛰️⛷️" },
  { name: "Litauen", code: "LT", continent: "Europa", capital: "Vilnius", emojis: "🌲🏞️🥛" },
  { name: "Luxemburg", code: "LU", continent: "Europa", capital: "Luxemburg", emojis: "🏰🌲🍺" },
  { name: "Malta", code: "MT", continent: "Europa", capital: "Valletta", emojis: "🏝️⛪🛳️" },
  { name: "Moldau", code: "MD", continent: "Europa", capital: "Chișinău", aliases: ["Moldawien"], emojis: "🌾⛪🦅" },
  { name: "Monaco", code: "MC", continent: "Europa", capital: "Monaco", emojis: "🏰⛵🎲" },
  { name: "Montenegro", code: "ME", continent: "Europa", capital: "Podgorica", emojis: "🏔️🏰🦅" },
  { name: "Niederlande", code: "NL", continent: "Europa", capital: "Amsterdam", aliases: ["Holland"], emojis: "🌷🏰⛵" },
  { name: "Nordmazedonien", code: "MK", continent: "Europa", capital: "Skopje", aliases: ["Mazedonien"], emojis: "🏔️🌞🦅" },
  { name: "Norwegen", code: "NO", continent: "Europa", capital: "Oslo", emojis: "🏔️🌊⛷️" },
  { name: "Österreich", code: "AT", continent: "Europa", capital: "Wien", aliases: ["Oesterreich"], emojis: "🏔️🏰🥨" },
  { name: "Polen", code: "PL", continent: "Europa", capital: "Warschau", emojis: "🏰🌲🥖" },
  { name: "Portugal", code: "PT", continent: "Europa", capital: "Lissabon", emojis: "🏖️🍷⛵" },
  { name: "Rumänien", code: "RO", continent: "Europa", capital: "Bukarest", aliases: ["Rumaenien"], emojis: "🏰🌲🥖" },
  { name: "San Marino", code: "SM", continent: "Europa", capital: "San Marino", emojis: "🏰⛰️⛪" },
  { name: "Schweden", code: "SE", continent: "Europa", capital: "Stockholm", emojis: "🏞️🌲🛶" },
  { name: "Schweiz", code: "CH", continent: "Europa", capital: "Bern", emojis: "🏔️⛪🍫" },
  { name: "Serbien", code: "RS", continent: "Europa", capital: "Belgrad", emojis: "🏰🦅🥖" },
  { name: "Slowakei", code: "SK", continent: "Europa", capital: "Bratislava", emojis: "🏰⛰️🌲" },
  { name: "Slowenien", code: "SI", continent: "Europa", capital: "Ljubljana", emojis: "🏔️🏰🌊" },
  { name: "Spanien", code: "ES", continent: "Europa", capital: "Madrid", emojis: "🏰🍷💃" },
  { name: "Tschechien", code: "CZ", continent: "Europa", capital: "Prag", aliases: ["Tschechische Republik"], emojis: "🏰⛪🍺" },
  { name: "Ukraine", code: "UA", continent: "Europa", capital: "Kiew", emojis: "🌾🌊⛅" },
  { name: "Ungarn", code: "HU", continent: "Europa", capital: "Budapest", emojis: "🏰🌲🥖" },
  { name: "Vatikanstadt", code: "VA", continent: "Europa", capital: "Vatikanstadt", aliases: ["Vatikan"], emojis: "⛪📜👑" },
  { name: "Vereinigtes Königreich", code: "GB", continent: "Europa", capital: "London", aliases: ["Großbritannien", "UK", "England"], emojis: "🏰🌊☕" },
  { name: "Weißrussland", code: "BY", continent: "Europa", capital: "Minsk", aliases: ["Belarus", "Weissrussland"], emojis: "🌲🏰🎭" },

  // Nordamerika (23 Länder)
  { name: "Antigua und Barbuda", code: "AG", continent: "Nordamerika", capital: "Saint John's", emojis: "🏖️🌅⛵" },
  { name: "Bahamas", code: "BS", continent: "Nordamerika", capital: "Nassau", emojis: "🏝️🌊🐠" },
  { name: "Barbados", code: "BB", continent: "Nordamerika", capital: "Bridgetown", emojis: "🏖️🌴🎶" },
  { name: "Belize", code: "BZ", continent: "Nordamerika", capital: "Belmopan", emojis: "🌴🐒🏝️" },
  { name: "Costa Rica", code: "CR", continent: "Nordamerika", capital: "San José", emojis: "🌴🏖️🦥" },
  { name: "Dominica", code: "DM", continent: "Nordamerika", capital: "Roseau", emojis: "🌴🍌🦜" },
  { name: "Dominikanische Republik", code: "DO", continent: "Nordamerika", capital: "Santo Domingo", emojis: "🌴⚾🌊" },
  { name: "El Salvador", code: "SV", continent: "Nordamerika", capital: "San Salvador", emojis: "🌋🏝️⚓" },
  { name: "Grenada", code: "GD", continent: "Nordamerika", capital: "Saint George's", emojis: "🌴🥥🍍" },
  { name: "Guatemala", code: "GT", continent: "Nordamerika", capital: "Guatemala-Stadt", emojis: "🏞️🦜🌽" },
  { name: "Haiti", code: "HT", continent: "Nordamerika", capital: "Port-au-Prince", emojis: "🏝️🦜🎶" },
  { name: "Honduras", code: "HN", continent: "Nordamerika", capital: "Tegucigalpa", emojis: "🌴🏝️🐒" },
  { name: "Jamaika", code: "JM", continent: "Nordamerika", capital: "Kingston", emojis: "🌴🎶🏖️" },
  { name: "Kanada", code: "CA", continent: "Nordamerika", capital: "Ottawa", emojis: "🍁🦌🏒" },
  { name: "Kuba", code: "CU", continent: "Nordamerika", capital: "Havanna", emojis: "🌴🎶🚬" },
  { name: "Mexiko", code: "MX", continent: "Nordamerika", capital: "Mexiko-Stadt", emojis: "🌮🦅⛪" },
  { name: "Nicaragua", code: "NI", continent: "Nordamerika", capital: "Managua", emojis: "🌋🏖️🌴" },
  { name: "Panama", code: "PA", continent: "Nordamerika", capital: "Panama-Stadt", emojis: "🌴🌊🛶" },
  { name: "St. Kitts und Nevis", code: "KN", continent: "Nordamerika", capital: "Basseterre", aliases: ["Saint Kitts und Nevis"], emojis: "🏝️🌴🎶" },
  { name: "St. Lucia", code: "LC", continent: "Nordamerika", capital: "Castries", aliases: ["Saint Lucia"], emojis: "🏝️⛰️🌊" },
  { name: "St. Vincent und die Grenadinen", code: "VC", continent: "Nordamerika", capital: "Kingstown", aliases: ["Saint Vincent und die Grenadinen"], emojis: "🏝️🌊🍌" },
  { name: "Trinidad und Tobago", code: "TT", continent: "Nordamerika", capital: "Port of Spain", emojis: "🌴🎶🏖️" },
  { name: "USA", code: "US", continent: "Nordamerika", capital: "Washington D.C.", aliases: ["Vereinigte Staaten", "Amerika"], emojis: "🦅🏙️🗽" },

  // Südamerika (12 Länder)
  { name: "Argentinien", code: "AR", continent: "Südamerika", capital: "Buenos Aires", emojis: "🥩⚽🏔️" },
  { name: "Bolivien", code: "BO", continent: "Südamerika", capital: "Sucre", emojis: "🦙🏔️🌾" },
  { name: "Brasilien", code: "BR", continent: "Südamerika", capital: "Brasília", emojis: "⚽🏖️🦜" },
  { name: "Chile", code: "CL", continent: "Südamerika", capital: "Santiago", emojis: "🏔️🍷🐧" },
  { name: "Ecuador", code: "EC", continent: "Südamerika", capital: "Quito", emojis: "🌋🐢🦙" },
  { name: "Guyana", code: "GY", continent: "Südamerika", capital: "Georgetown", emojis: "🌾🦜🏞️" },
  { name: "Kolumbien", code: "CO", continent: "Südamerika", capital: "Bogotá", emojis: "☕🦋💃" },
  { name: "Paraguay", code: "PY", continent: "Südamerika", capital: "Asunción", emojis: "🌾🦙🌊" },
  { name: "Peru", code: "PE", continent: "Südamerika", capital: "Lima", emojis: "🦙🏔️🌽" },
  { name: "Suriname", code: "SR", continent: "Südamerika", capital: "Paramaribo", emojis: "🌊🦜🌴" },
  { name: "Uruguay", code: "UY", continent: "Südamerika", capital: "Montevideo", emojis: "⚽🥩🌊" },
  { name: "Venezuela", code: "VE", continent: "Südamerika", capital: "Caracas", emojis: "🌊💎🦜" },

  // Ozeanien (14 Länder)
  { name: "Australien", code: "AU", continent: "Ozeanien", capital: "Canberra", emojis: "🦘🕷️🏖️" },
  { name: "Fidschi", code: "FJ", continent: "Ozeanien", capital: "Suva", aliases: ["Fiji"], emojis: "🏝️🌺🦈" },
  { name: "Kiribati", code: "KI", continent: "Ozeanien", capital: "South Tarawa", emojis: "🏝️🌊🐠" },
  { name: "Marshallinseln", code: "MH", continent: "Ozeanien", capital: "Majuro", emojis: "🏝️🌊⛵" },
  { name: "Mikronesien", code: "FM", continent: "Ozeanien", capital: "Palikir", emojis: "🏝️🐠🌊" },
  { name: "Nauru", code: "NR", continent: "Ozeanien", capital: "Yaren", emojis: "🏝️🐟⛵" },
  { name: "Neuseeland", code: "NZ", continent: "Ozeanien", capital: "Wellington", emojis: "🐑🏔️🦘" },
  { name: "Palau", code: "PW", continent: "Ozeanien", capital: "Ngerulmud", emojis: "🏝️🐠🌺" },
  { name: "Papua-Neuguinea", code: "PG", continent: "Ozeanien", capital: "Port Moresby", emojis: "🦜🌴🏔️" },
  { name: "Salomonen", code: "SB", continent: "Ozeanien", capital: "Honiara", emojis: "🏝️🐠🦜" },
  { name: "Samoa", code: "WS", continent: "Ozeanien", capital: "Apia", emojis: "🏝️🌺⛵" },
  { name: "Tonga", code: "TO", continent: "Ozeanien", capital: "Nukuʻalofa", emojis: "🏝️👑🌊" },
  { name: "Tuvalu", code: "TV", continent: "Ozeanien", capital: "Funafuti", emojis: "🏝️🌊🐠" },
  { name: "Vanuatu", code: "VU", continent: "Ozeanien", capital: "Port Vila", emojis: "🌋🏝️🦜" },
];

export const continentEmojis = {
  "Afrika": "🌍",
  "Asien": "🌏", 
  "Europa": "🇪🇺",
  "Nordamerika": "🌎",
  "Südamerika": "🌎", 
  "Ozeanien": "🌏",
  "Inselstaaten": "🏝️"
};

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function normalizeInput(input: string): string {
  return input.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .trim();
}

export function checkAnswer(input: string, country: Country): boolean {
  const normalizedInput = normalizeInput(input);
  const normalizedName = normalizeInput(country.name);

  if (normalizedInput === normalizedName) return true;

  const englishName = country.englishName || countryEnglishNames[country.code];
  if (englishName) {
    const normalizedEnglishName = normalizeInput(englishName);
    if (normalizedInput === normalizedEnglishName) return true;
  }

  if (country.aliases) {
    return country.aliases.some(alias =>
      normalizeInput(alias) === normalizedInput
    );
  }

  return false;
}