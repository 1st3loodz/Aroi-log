export const AMENITIES = [
  { id: 'plug',    emoji: '🔌', label: 'มีปลั๊ก',          en: 'Plug' },
  { id: 'work',    emoji: '💻', label: 'นั่งทำงานได้',     en: 'Work-friendly' },
  { id: 'parking', emoji: '🚗', label: 'มีที่จอดรถ',       en: 'Parking' },
  { id: 'pet',     emoji: '🐾', label: 'Pet-Friendly',     en: 'Pet-Friendly' },
];

/** Amenities only apply to the "Desserts, Bakery & Cafe" type */
export const hasAmenities = (entry) => entry?.type === 'desserts';

export const activeAmenities = (entry) =>
  AMENITIES.filter((a) => entry?.amenities?.[a.id]);
