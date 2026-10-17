import { useRef } from 'react';
import {
  X, MapPin, Calendar, Star, Heart, Pencil, Trash2, ExternalLink, ChefHat, StickyNote,
} from 'lucide-react';
import StarDisplay from './StarDisplay';
import { PintGlass, BeerGlassRating, BeerColorBadge } from './BeerGlass';
import { isBeer, getSrm } from '../data/beer';
import { hasAmenities, activeAmenities } from '../data/amenities';
import { formatDate, getMapsUrl, scoreBarColor, isPackaged, getDishes, dishesTotal, formatMoney, currencyOf } from '../utils/helpers';
import { ENTRY_TYPES, TYPE_THEME } from '../data/mockData';

const ScoreBar = ({ label, emoji, score }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
        <span>{emoji}</span>{label}
      </span>
      <div className="flex items-center gap-1.5">
        <StarDisplay score={score} size="sm" />
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-6 text-right">{score.toFixed(1)}</span>
      </div>
    </div>
    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${scoreBarColor(score)} rounded-full score-bar-fill`}
        style={{ width: `${(score / 5) * 100}%` }}
      />
    </div>
  </div>
);

export default function EntryDetail({ entry, onClose, onEdit, onDelete }) {
  const {
    name, type, subCategory, location, visitDate, priceTier,
    overall, taste, value, atmosphere,
    wantToReturn, imageUrl, highlightMenus, mustTryDishes, notes,
  } = entry;
  const dishes    = getDishes(entry);
  const dishTotal = dishesTotal(dishes);
  const cur       = currencyOf(entry);
  const typeInfo = ENTRY_TYPES.find((x) => x.id === type);
  const th       = TYPE_THEME[type] || TYPE_THEME.food;
  const mapsUrl  = getMapsUrl(entry);
  const packaged = isPackaged(entry);

  const overlayRef = useRef(null);
  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div className="w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up overflow-hidden">

        {/* Hero */}
        <div className={`relative h-52 sm:h-56 ${th.bg} flex-shrink-0`}>
          {imageUrl
            ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            : <div className="flex items-center justify-center h-full text-8xl opacity-20">{typeInfo?.emoji}</div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

          {/* Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={onEdit} className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl shadow text-gray-700 hover:bg-white transition">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl shadow text-rose-500 hover:bg-rose-50 transition">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-xl shadow text-gray-700 hover:bg-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Name + meta overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${th.badge}`}>
                    {typeInfo?.emoji} {subCategory}
                  </span>
                  <span className="px-2 py-0.5 bg-black/40 text-white/90 text-xs font-bold rounded-lg">{priceTier}</span>
                </div>
                <h2 className="text-white text-xl font-bold leading-tight drop-shadow">{name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <MapPin className="w-3 h-3" />{location}
                  </span>
                  <span className="flex items-center gap-1 text-white/80 text-xs">
                    <Calendar className="w-3 h-3" />{formatDate(visitDate)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold text-white">{overall.toFixed(1)}</p>
                <p className="text-xs text-white/80">คะแนน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Google Maps CTA (shop only) */}
          {!packaged && <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">เปิดใน Google Maps</p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  {entry.mapsUrl ? 'ลิงก์ที่บันทึกไว้' : 'ค้นหาอัตโนมัติ'}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>}

          {/* Must return */}
          {wantToReturn && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-xl">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">อยากกลับไปซ้ำ!</span>
            </div>
          )}

          {/* Score bars */}
          <div className={`space-y-4 p-4 ${th.bg} rounded-2xl border ${th.border}`}>
            <ScoreBar label="ความอร่อย / รสชาติ"   emoji="😋" score={taste} />
            <ScoreBar label="ความคุ้มค่า"            emoji="💰" score={value} />
            {!packaged && <ScoreBar label="บรรยากาศ / การบริการ"  emoji="✨" score={atmosphere} />}
            <div className={`pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between`}>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">คะแนนรวมเฉลี่ย</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className={`text-lg font-bold ${th.accent}`}>{overall.toFixed(1)}</span>
                <span className="text-sm text-gray-400">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Beer tasting specs */}
          {isBeer(entry) && (
            <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">🍺 Beer Tasting</h3>
              <div className="flex items-center gap-3">
                <PintGlass size={40} fill={getSrm(entry.srm ?? 6).hex} />
                <div className="flex flex-wrap gap-1.5">
                  {entry.beerStyle && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-bold">🍻 {entry.beerStyle}</span>
                  )}
                  <BeerColorBadge srm={entry.srm ?? 6} />
                  {entry.abv !== '' && entry.abv != null && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold">ABV: {entry.abv}%</span>
                  )}
                  {entry.ibu !== '' && entry.ibu != null && (
                    <span className="px-2 py-0.5 rounded-md bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-300 text-xs font-bold">IBU: {entry.ibu}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                <span>🌿 Aroma (ความหอม)</span>
                <BeerGlassRating score={entry.aroma ?? 0} size={18} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                <span>🍺 Bitterness (ความขม)</span>
                <BeerGlassRating score={entry.bitterness ?? 0} size={18} />
              </div>
            </div>
          )}

          {/* Cafe amenities */}
          {hasAmenities(entry) && activeAmenities(entry).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">☕ Cafe Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {activeAmenities(entry).map((a) => (
                  <span key={a.id} className="px-3 py-1 rounded-full text-sm font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300">
                    {a.emoji} {a.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ordered dishes */}
          {dishes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-500" /> เมนูที่สั่ง
              </h3>
              <ul className={`rounded-xl border ${th.border} ${th.bg} divide-y divide-black/5 dark:divide-white/5 overflow-hidden`}>
                {dishes.map((d, i) => (
                  <li key={d.id || i} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 min-w-0 text-gray-800 dark:text-gray-200">
                      <span className="text-xs text-gray-400 w-4 text-right flex-shrink-0">{i + 1}</span>
                      <span className={`truncate ${d.mustTry ? 'font-bold' : ''}`}>{d.name}</span>
                      {d.mustTry && (
                        <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-bold">
                          ⭐ Must-Try
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {d.price !== '' && d.price != null ? `${cur}${formatMoney(d.price)}` : '—'}
                    </span>
                  </li>
                ))}
                {dishTotal > 0 && (
                  <li className="flex items-center justify-between px-3 py-2.5 bg-white/60 dark:bg-gray-900/40">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">🧾 ยอดรวม (Total)</span>
                    <span className={`text-base font-bold ${th.accent}`}>{cur}{formatMoney(dishTotal)}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4 text-amber-500" /> รีวิวส่วนตัว
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                {notes}
              </p>
            </div>
          )}
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}
