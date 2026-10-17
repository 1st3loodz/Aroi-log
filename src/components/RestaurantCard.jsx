import { Star, MapPin, Calendar, Heart, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { formatDate, getMapsUrl, isPackaged, getDishes, dishesTotal, formatMoney, currencyOf } from '../utils/helpers';
import { BeerGlassRating, BeerColorBadge } from './BeerGlass';
import { hasAmenities, activeAmenities } from '../data/amenities';
import { isBeer } from '../data/beer';
import { ENTRY_TYPES, TYPE_THEME } from '../data/mockData';

/** Small type badge used in both card and row */
function TypeBadge({ type }) {
  const t = ENTRY_TYPES.find((x) => x.id === type);
  if (!t) return null;
  const th = TYPE_THEME[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${th.badge}`}>
      {t.emoji} {t.label}
    </span>
  );
}

/** Small green Maps link button */
export function MapsButton({ entry, compact = false }) {
  const url = getMapsUrl(entry);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title="เปิดใน Google Maps"
      className={`inline-flex items-center gap-1 rounded-lg font-medium transition-colors
        ${compact
          ? 'p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
          : 'px-2 py-1.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 border border-green-200 dark:border-green-900/40'
        }`}
    >
      <MapPin className="w-3.5 h-3.5" />
      {!compact && <><span>Maps</span><ExternalLink className="w-2.5 h-2.5 opacity-60" /></>}
    </a>
  );
}

// ── Card (grid) ───────────────────────────────────────────────────────────────
export function EntryCard({ entry, onClick, onEdit, onDelete }) {
  const { name, type, subCategory, location, visitDate, priceTier,
          overall, taste, value, atmosphere, wantToReturn, imageUrl, highlightMenus, mustTryDishes } = entry;
  const menus = [...getDishes(entry)].sort((a, b) => (b.mustTry ? 1 : 0) - (a.mustTry ? 1 : 0));
  const cardTotal = dishesTotal(getDishes(entry));
  const th    = TYPE_THEME[type] || TYPE_THEME.food;
  const typeInfo = ENTRY_TYPES.find((x) => x.id === type);

  return (
    <div
      className="card overflow-hidden cursor-pointer group hover:shadow-md transition-all active:scale-[0.99]"
      onClick={onClick}
    >
      {/* Image / hero */}
      <div className={`relative h-44 ${th.bg} dark:from-gray-800 dark:to-gray-900`}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl opacity-30">
            {typeInfo?.emoji || '🍽️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow text-gray-700 hover:bg-white transition">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow text-rose-500 hover:bg-rose-50 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-bold text-base leading-tight truncate drop-shadow">{name}</h3>
              <p className="text-white/75 text-xs mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />{location}
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-white font-bold text-sm bg-black/35 px-1.5 py-0.5 rounded-lg">{priceTier}</span>
              {wantToReturn && <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />}
            </div>
          </div>
        </div>

        {/* Type badge – top left */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
            {typeInfo?.emoji} {subCategory}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Score row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>😋 {taste.toFixed(1)}</span>
            <span>💰 {value.toFixed(1)}</span>
            {!isPackaged(entry) && <span>✨ {atmosphere.toFixed(1)}</span>}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{overall.toFixed(1)}</span>
          </div>
        </div>

        {/* Beer specs */}
        {isBeer(entry) && (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1">
              {entry.beerStyle && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-bold">🍻 {entry.beerStyle}</span>
              )}
              <BeerColorBadge srm={entry.srm ?? 6} />
              {entry.abv !== '' && entry.abv != null && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">ABV: {entry.abv}%</span>
              )}
              {entry.ibu !== '' && entry.ibu != null && (
                <span className="px-1.5 py-0.5 rounded-md bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300 text-xs font-bold">IBU: {entry.ibu}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">🌿 <BeerGlassRating score={entry.aroma ?? 0} size={12} /></span>
              <span className="flex items-center gap-1">🍺 <BeerGlassRating score={entry.bitterness ?? 0} size={12} /></span>
            </div>
          </div>
        )}

        {/* Cafe amenities */}
        {hasAmenities(entry) && activeAmenities(entry).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activeAmenities(entry).map((a) => (
              <span key={a.id} title={a.label}
                className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {a.emoji} {a.en}
              </span>
            ))}
          </div>
        )}

        {/* Dishes (must-try first) */}
        {menus.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {menus.slice(0, 2).map((d, i) => (
              <span key={d.id || i} className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${d.mustTry ? 'bg-amber-400 text-amber-950' : th.badge}`}>
                {d.mustTry ? '⭐ ' : ''}{d.name}
              </span>
            ))}
            {menus.length > 2 && <span className="text-xs text-gray-400">+{menus.length - 2}</span>}
            {cardTotal > 0 && (
              <span className="ml-auto text-xs font-bold text-gray-700 dark:text-gray-200">
                🧾 {currencyOf(entry)}{formatMoney(cardTotal)}
              </span>
            )}
          </div>
        )}

        {/* Footer: date + maps */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />{formatDate(visitDate)}
          </span>
          {!isPackaged(entry) && <MapsButton entry={entry} compact={false} />}
        </div>
      </div>
    </div>
  );
}

// ── Row (list) ────────────────────────────────────────────────────────────────
export function EntryRow({ entry, onClick, onEdit, onDelete }) {
  const { name, type, subCategory, location, visitDate, priceTier, overall, wantToReturn, imageUrl } = entry;
  const th       = TYPE_THEME[type] || TYPE_THEME.food;
  const typeInfo = ENTRY_TYPES.find((x) => x.id === type);

  return (
    <div
      className="card flex items-center gap-3 p-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.99] group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ${th.bg}`}>
        {imageUrl
          ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
          : <div className="flex items-center justify-center h-full text-2xl opacity-40">{typeInfo?.emoji}</div>
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{typeInfo?.emoji}</span>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">{name}</h3>
          {wantToReturn && <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 flex-shrink-0" />}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span className={`pill text-xs py-0.5 ${th.badge}`}>{subCategory}</span>
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />{location}
          </span>
          <span className="text-xs text-gray-500 font-medium">{priceTier}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(visitDate)}</span>
          {!isPackaged(entry) && <MapsButton entry={entry} compact={true} />}
        </div>
      </div>

      {/* Score + actions */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-0.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{overall.toFixed(1)}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-amber-100 transition">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-rose-500 hover:bg-rose-50 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
