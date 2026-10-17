import { Plus, Trash2, Star } from 'lucide-react';
import { dishesTotal, formatMoney, CURRENCIES } from '../utils/helpers';

const newDish = () => ({ id: Math.random().toString(36).slice(2), name: '', price: '', mustTry: false });

/** Itemized dish rows: name + optional price + must-try star + delete, with total and currency selector */
export default function DishList({ dishes, onChange, placeholder, currencyCode = 'THB', onCurrencyChange }) {
  const cur = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];
  const update = (i, patch) => onChange(dishes.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const remove = (i) => onChange(dishes.filter((_, idx) => idx !== i));
  // Only one "best dish": starring a row un-stars every other row
  const toggleMustTry = (i) =>
    onChange(dishes.map((d, idx) => ({ ...d, mustTry: idx === i ? !d.mustTry : false })));
  const total = dishesTotal(dishes);

  return (
    <div className="space-y-2">
      {dishes.length === 0 && (
        <p className="text-xs text-gray-400">ยังไม่มีเมนู — กดปุ่มด้านล่างเพื่อเพิ่ม</p>
      )}

      {dishes.map((d, i) => (
        <div key={d.id || i} className="flex items-center gap-1.5">
          <span className="w-4 text-xs font-semibold text-gray-400 text-right flex-shrink-0">{i + 1}</span>
          <input
            className="input flex-1 min-w-0"
            placeholder={`${placeholder || 'ชื่อเมนู'} (Dish ${i + 1})`}
            value={d.name}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <div className="relative w-20 flex-shrink-0">
            <input
              type="number" inputMode="decimal" min="0" step="any"
              className="input pr-5 text-right"
              placeholder="120"
              value={d.price}
              onChange={(e) => update(i, { price: e.target.value === '' ? '' : Number(e.target.value) })}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{cur.symbol}</span>
          </div>
          <button
            type="button"
            onClick={() => toggleMustTry(i)}
            title="⭐ Highlight / Must-Try (จานเด็ด)"
            aria-pressed={!!d.mustTry}
            aria-label={`Must-try dish ${i + 1}`}
            className={`p-2 rounded-xl transition flex-shrink-0 active:scale-90 ${
              d.mustTry ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Star className={`w-4 h-4 ${d.mustTry ? 'fill-amber-400 text-amber-500' : 'text-gray-400'}`} />
          </button>
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition flex-shrink-0"
            aria-label={`Delete dish ${i + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...dishes, newDish()])}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-amber-300 dark:border-amber-800 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition active:scale-[0.99]"
      >
        <Plus className="w-4 h-4" /> + เพิ่มเมนู (Add Dish)
      </button>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">🧾 ยอดรวม (Total Bill)</span>
        <div className="flex items-center gap-2">
          <select
            aria-label="Currency"
            value={currencyCode}
            onChange={(e) => onCurrencyChange?.(e.target.value)}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {cur.symbol}{formatMoney(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
