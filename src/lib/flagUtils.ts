import { ALL_COUNTRIES } from '@/data/countries-full';

export const getFlagEmoji = (countryCode: string): string => {
  const country = ALL_COUNTRIES.find(c => c.code === countryCode);
  if (country?.flag) {
    return country.flag;
  }

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
