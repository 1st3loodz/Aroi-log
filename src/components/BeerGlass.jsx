import { useId } from 'react';
import { SRM_COLORS, getSrm } from '../data/beer';

/** Tall pint glass. `fill` = liquid colour (null = empty glass). */
export function PintGlass({ fill = null, size = 24, foam = true, className = '' }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 32" width={size} height={size * (32 / 24)} className={className} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d="M4.6 2.6h14.8l-2 26.2a1.6 1.6 0 0 1-1.6 1.5H8.2a1.6 1.6 0 0 1-1.6-1.5z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="24" height="32" fill="rgba(148,163,184,0.12)" />
        {fill && <rect x="0" y="8" width="24" height="24" fill={fill} />}
        {fill && foam && <path d="M3 2h18v6.5c-2 1.4-4 .4-6 1.2s-4 .6-6-.2-4 .4-6-.8z" fill="#FFF8E7" />}
        {fill && <rect x="7" y="11" width="2" height="16" rx="1" fill="#fff" opacity="0.18" />}
      </g>
      <path
        d="M4.6 2.6h14.8l-2 26.2a1.6 1.6 0 0 1-1.6 1.5H8.2a1.6 1.6 0 0 1-1.6-1.5z"
        fill="none" stroke={fill ? '#78716c' : '#cbd5e1'} strokeWidth="1.4" strokeLinejoin="round"
      />
    </svg>
  );
}

const BEER_GOLD = '#F5A623';

/** Read-only 1–5 beer glass rating */
export function BeerGlassRating({ score = 0, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <PintGlass key={n} size={size} fill={n <= Math.round(score) ? BEER_GOLD : null} />
      ))}
    </span>
  );
}

/** Interactive 1–5 beer glass picker (tap the selected glass again to step down) */
export function BeerGlassPicker({ label, emoji, value, onChange }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <span>{emoji}</span> {label}
        </label>
        <span className="text-sm font-bold text-amber-500">{value}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-1 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/20 active:scale-90 transition"
            aria-label={`${label} ${n}`}
          >
            <PintGlass size={26} fill={n <= value ? BEER_GOLD : null} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Small badge: glass filled with the SRM colour + shade number */
export function BeerColorBadge({ srm, className = '' }) {
  const c = getSrm(srm);
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 ${className}`}
      title={`SRM ${c.srm} · ${c.name}`}
    >
      <PintGlass size={10} fill={c.hex} />
      SRM {c.srm}
    </span>
  );
}

/** 24-shade SRM palette + big preview glass */
export function SrmPicker({ value, onChange }) {
  const current = getSrm(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <PintGlass size={44} fill={current.hex} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">SRM {current.srm}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{current.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {SRM_COLORS.map((c) => (
          <button
            key={c.srm}
            type="button"
            onClick={() => onChange(c.srm)}
            title={`SRM ${c.srm} · ${c.name}`}
            aria-label={`SRM ${c.srm} ${c.name}`}
            className={`relative h-9 rounded-lg border transition active:scale-90 ${
              current.srm === c.srm ? 'ring-2 ring-amber-500 ring-offset-1 border-white' : 'border-black/10'
            }`}
            style={{ backgroundColor: c.hex }}
          >
            <span className={`text-[10px] font-bold ${c.srm <= 8 ? 'text-gray-800' : 'text-white'}`}>{c.srm}</span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400">1 = Pale Straw → 12 = Amber/Copper → 24 = Black/Stout</p>
    </div>
  );
}
