import { Star } from 'lucide-react';

const STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function StarPicker({ value, onChange, label, emoji }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <span>{emoji}</span> {label}
        </label>
        <span className="text-sm font-bold text-amber-500">{value.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = value >= star;
          const halfFilled = !filled && value >= star - 0.5;
          return (
            <button
              type="button"
              key={star}
              className="relative w-8 h-8 focus:outline-none group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const newVal = x < rect.width / 2 ? star - 0.5 : star;
                onChange(Math.max(1, newVal));
              }}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : halfFilled
                    ? 'fill-none text-amber-400'
                    : 'fill-none text-gray-300 group-hover:text-amber-200'
                }`}
              />
              {halfFilled && (
                <span className="absolute inset-0 overflow-hidden w-1/2 pointer-events-none">
                  <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
