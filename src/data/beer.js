export const BEER_SUBCATEGORY = 'Beer & Craft Beer';

/** A drinks entry in the "Beer & Craft Beer" sub-category gets the beer tasting mode */
export function isBeer(entry) {
  return entry?.type === 'drinks' && entry?.subCategory === BEER_SUBCATEGORY;
}

// SRM 1–24: approximate display colours + style names
export const SRM_COLORS = [
  { srm: 1,  hex: '#F8F753', name: 'Pale Straw' },
  { srm: 2,  hex: '#F6F513', name: 'Straw' },
  { srm: 3,  hex: '#ECE61A', name: 'Pale Gold' },
  { srm: 4,  hex: '#D5BC26', name: 'Gold' },
  { srm: 5,  hex: '#BF923B', name: 'Deep Gold' },
  { srm: 6,  hex: '#BF813A', name: 'Light Amber' },
  { srm: 7,  hex: '#BC6733', name: 'Amber' },
  { srm: 8,  hex: '#B64933', name: 'Deep Amber' },
  { srm: 9,  hex: '#B26033', name: 'Amber-Copper' },
  { srm: 10, hex: '#A85839', name: 'Copper' },
  { srm: 11, hex: '#98511F', name: 'Light Brown' },
  { srm: 12, hex: '#8D4C32', name: 'Amber / Copper' },
  { srm: 13, hex: '#7C452D', name: 'Brown' },
  { srm: 14, hex: '#6B3A1E', name: 'Medium Brown' },
  { srm: 15, hex: '#5D341A', name: 'Dark Brown' },
  { srm: 16, hex: '#4E2A0C', name: 'Deep Brown' },
  { srm: 17, hex: '#4A2727', name: 'Ruby Brown' },
  { srm: 18, hex: '#361F1B', name: 'Dark Ruby' },
  { srm: 19, hex: '#261716', name: 'Near Black' },
  { srm: 20, hex: '#231716', name: 'Black' },
  { srm: 21, hex: '#19100F', name: 'Black' },
  { srm: 22, hex: '#16100F', name: 'Deep Black' },
  { srm: 23, hex: '#120D0C', name: 'Opaque Black' },
  { srm: 24, hex: '#100B0A', name: 'Black / Stout' },
];

export const getSrm = (n) => SRM_COLORS[Math.min(24, Math.max(1, Number(n) || 1)) - 1];

export const BEER_STYLES = [
  'IPA', 'Hazy / NEIPA', 'Double IPA', 'Stout', 'Porter', 'Wheat / Weizen',
  'Pilsner', 'Lager', 'Sour / Gose', 'Pale Ale', 'Belgian Ale',
];
