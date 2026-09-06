import { COUNTRIES } from './types';

/** Assets oficiales provistos por ADIPA — se muestran junto al nombre de cada país. */
export const COUNTRY_FLAGS: Record<(typeof COUNTRIES)[number], string> = {
  chile: '/flag-chile.png',
  mexico: '/flag-mexico.png',
  colombia: '/flag-colombia.png',
};
