import { Star } from 'lucide-react';

// Renders star rating visually (read-only)
export default function StarDisplay({ score, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className={`${sizeClass} fill-amber-400 text-amber-400`} />
      ))}
      {half && (
        <span className="relative inline-block">
          <Star className={`${sizeClass} text-gray-300`} />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClass} fill-amber-400 text-amber-400`} />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className={`${sizeClass} fill-none text-gray-300`} />
      ))}
    </span>
  );
}
