/**
 * Pan-African Country Taxonomy Data
 * Re-exports the complete 54-country dataset and regional helper functions.
 */

export * from '@/utils/countryData';
export {
  AFRICAN_COUNTRIES,
  AFRICAN_REGIONS,
  AFRICAN_INTERESTS,
  getCountryByCode,
  getCountriesByRegion,
} from '@/utils/countryData';
