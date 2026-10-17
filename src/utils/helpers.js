import { ENTRY_TYPES } from '../data/mockData';

/** Returns the stored mapsUrl or a Google Maps search fallback */
export function getMapsUrl(entry) {
  if (entry.mapsUrl && entry.mapsUrl.trim()) return entry.mapsUrl.trim();
  const query = encodeURIComponent(`${entry.name} ${entry.location}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function isPackaged(entry) {
  return entry.source === 'packaged';
}

export function calcOverall(taste, value, atmosphere, source = 'shop') {
  if (source === 'packaged') return Math.round(((taste + value) / 2) * 10) / 10;
  return Math.round(((taste + value + atmosphere) / 3) * 10) / 10;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function exportToJSON(entries) {
  const data = JSON.stringify({ version: 2, exportDate: new Date().toISOString(), entries }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `aroilog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        // Support both v1 (restaurants) and v2 (entries)
        const list = parsed.entries || parsed.restaurants;
        if (Array.isArray(list)) resolve(list);
        else reject(new Error('Invalid file format'));
      } catch {
        reject(new Error('Failed to parse JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function sortEntries(list, sortBy) {
  const s = [...list];
  switch (sortBy) {
    case 'overall_desc':    return s.sort((a, b) => b.overall - a.overall);
    case 'taste_desc':      return s.sort((a, b) => b.taste  - a.taste);
    case 'value_desc':      return s.sort((a, b) => b.value  - a.value);
    case 'atmosphere_desc': return s.sort((a, b) => b.atmosphere - a.atmosphere);
    case 'name_asc':        return s.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    case 'date_desc':
    default:                return s.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  }
}

export function filterEntries(list, { search, typeTab, subCategory, mustReturn }) {
  return list.filter((r) => {
    const q = (search || '').toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      (r.subCategory || '').toLowerCase().includes(q) ||
      (r.highlightMenus || r.mustTryDishes || []).some((d) => d.toLowerCase().includes(q)) ||
      (r.notes || '').toLowerCase().includes(q);

    const matchType     = !typeTab || typeTab === 'all' || r.type === typeTab;
    const matchSub      = !subCategory || r.subCategory === subCategory;
    const matchReturn   = !mustReturn || r.wantToReturn;

    return matchSearch && matchType && matchSub && matchReturn;
  });
}

export function computeStats(entries) {
  const total = entries.length;
  if (total === 0) return {
    total: 0, byType: {}, avgOverall: 0, avgTaste: 0, avgValue: 0, avgAtmosphere: 0, mustReturnPct: 0,
  };

  const avgOverall     = +(entries.reduce((s, r) => s + r.overall,     0) / total).toFixed(1);
  const avgTaste       = +(entries.reduce((s, r) => s + r.taste,       0) / total).toFixed(1);
  const avgValue       = +(entries.reduce((s, r) => s + r.value,       0) / total).toFixed(1);
  const shopEntries    = entries.filter((r) => !isPackaged(r));
  const avgAtmosphere  = shopEntries.length ? +(shopEntries.reduce((s, r) => s + r.atmosphere, 0) / shopEntries.length).toFixed(1) : 0;
  const mustReturnPct  = Math.round((entries.filter((r) => r.wantToReturn).length / total) * 100);

  const byType = {};
  ENTRY_TYPES.forEach(({ id }) => {
    byType[id] = entries.filter((r) => r.type === id).length;
  });

  return { total, byType, avgOverall, avgTaste, avgValue, avgAtmosphere, mustReturnPct };
}

/** ISO yyyy-mm-dd -> dd/mm/yy with leading zeros, e.g. 2026-04-05 -> 05/04/26 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(dateStr);
  if (!m) return dateStr;
  const [, y, mo, d] = m;
  return `${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${y.slice(-2)}`;
}

/** dd/mm/yy (or dd/mm/yyyy) -> ISO yyyy-mm-dd, or null if invalid. 2-digit years map to 20yy. */
export function parseDMY(text) {
  const m = /^\s*(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})\s*$/.exec(text || '');
  if (!m) return null;
  const d = Number(m[1]), mo = Number(m[2]);
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Today's date as ISO yyyy-mm-dd in local time */
export function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

export function scoreBarColor(score) {
  if (score >= 4.5) return 'from-amber-400 to-yellow-300';
  if (score >= 3.5) return 'from-amber-500 to-amber-300';
  if (score >= 2.5) return 'from-orange-500 to-orange-300';
  return 'from-rose-500 to-rose-300';
}


/** Ordered dishes: new `dishes` list, or legacy highlightMenus/mustTryDishes strings */
export function getDishes(entry) {
  if (Array.isArray(entry.dishes)) return entry.dishes;
  return (entry.highlightMenus || entry.mustTryDishes || []).map((name) => ({ name, price: '' }));
}

export function dishesTotal(dishes) {
  return (dishes || []).reduce((s, d) => s + (Number(d.price) || 0), 0);
}

/** 1,234.50 style, trimming needless decimals */
export function formatMoney(n) {
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Currency symbol taken from the entry's price tier (default baht) */
export const CURRENCIES = [
  { code: 'THB', symbol: '฿', label: '฿ THB' },
  { code: 'JPY', symbol: '¥', label: '¥ JPY' },
  { code: 'CNY', symbol: '¥', label: '¥ CNY' },
  { code: 'USD', symbol: '$', label: '$ USD' },
];

export const currencySymbol = (code) => CURRENCIES.find((c) => c.code === code)?.symbol || '฿';

/** Symbol for an entry's bill: its chosen currency, else the price-tier symbol, else baht */
export function currencyOf(entry) {
  if (entry.currency) return currencySymbol(entry.currency);
  return Array.from(entry.priceTier || '')[0] || '฿';
}

/** Read a photo (camera/gallery), downscale and return a JPEG base64 data URL */
export function fileToDataUrl(file, maxSize = 1024, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}