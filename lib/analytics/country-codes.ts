// ISO-3166-1 alpha-2 → display name (Norwegian/English mix matching the
// rest of the dashboard's i18n style — full localization is out of scope
// for this PR; we prioritize the markets we actually serve).
//
// Falls back to the raw code for unknown countries. 'XX' is Vercel's
// placeholder for "unknown" and shows as "Ukjent".

const COUNTRY_NAMES: Record<string, string> = {
  // Nordics
  NO: 'Norge', SE: 'Sverige', DK: 'Danmark', FI: 'Finland', IS: 'Island',
  // Anglosphere
  GB: 'Storbritannia', US: 'USA', CA: 'Canada', AU: 'Australia', NZ: 'New Zealand', IE: 'Irland',
  // Western + Southern Europe
  ES: 'Spania', PT: 'Portugal', FR: 'Frankrike', DE: 'Tyskland',
  IT: 'Italia', NL: 'Nederland', BE: 'Belgia', LU: 'Luxembourg',
  AT: 'Østerrike', CH: 'Sveits', GR: 'Hellas',
  // Central + Eastern Europe
  PL: 'Polen', CZ: 'Tsjekkia', SK: 'Slovakia', HU: 'Ungarn',
  RO: 'Romania', BG: 'Bulgaria', HR: 'Kroatia', SI: 'Slovenia',
  EE: 'Estland', LV: 'Latvia', LT: 'Litauen',
  RU: 'Russland', UA: 'Ukraina',
  // Latin America
  BR: 'Brasil', AR: 'Argentina', MX: 'Mexico', CL: 'Chile',
  CO: 'Colombia', PE: 'Peru', VE: 'Venezuela',
  // Asia + Pacific
  PH: 'Filippinene', TH: 'Thailand', VN: 'Vietnam', ID: 'Indonesia',
  MY: 'Malaysia', SG: 'Singapore', JP: 'Japan', KR: 'Sør-Korea',
  CN: 'Kina', HK: 'Hongkong', TW: 'Taiwan', IN: 'India', PK: 'Pakistan',
  // Middle East + Africa
  AE: 'UAE', SA: 'Saudi-Arabia', QA: 'Qatar', KW: 'Kuwait',
  IL: 'Israel', TR: 'Tyrkia', EG: 'Egypt', ZA: 'Sør-Afrika', NG: 'Nigeria',
  // Sentinel
  XX: 'Ukjent',
}

export function getCountryName(code: string | null | undefined): string {
  if (!code) return 'Ukjent'
  return COUNTRY_NAMES[code.toUpperCase()] ?? code
}
