import { computeStats } from '../utils/helpers';
import { ENTRY_TYPES, TYPE_THEME } from '../data/mockData';

const StatBadge = ({ emoji, label, score, accent }) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-base">{emoji}</span>
    <span className={`text-lg font-bold ${accent}`}>{score}</span>
    <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
  </div>
);

const TypeCount = ({ type, count, active, onClick }) => {
  const th = TYPE_THEME[type.id];
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all flex-1
        ${active
          ? `${th.bg} ${th.border} shadow-sm`
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
    >
      <span className="text-xl">{type.emoji}</span>
      <span className={`text-xl font-bold ${active ? th.accent : 'text-gray-800 dark:text-gray-100'}`}>{count}</span>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight text-center line-clamp-1">{type.thai}</span>
    </button>
  );
};

export default function Dashboard({ entries, activeType, onTypeChange }) {
  const stats = computeStats(entries);
  if (stats.total === 0) return null;

  return (
    <div className="card p-4 space-y-4">
      {/* Total + overall score */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">รายการทั้งหมด</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl">
          <span className="text-2xl font-bold text-amber-500">{stats.avgOverall}</span>
          <div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold leading-tight">คะแนนเฉลี่ย</p>
            <p className="text-xs text-gray-400 leading-tight">จาก 5.0</p>
          </div>
        </div>
      </div>

      {/* Type breakdown — clickable to set tab */}
      <div className="flex gap-2">
        {ENTRY_TYPES.map((type) => (
          <TypeCount
            key={type.id}
            type={type}
            count={stats.byType[type.id] || 0}
            active={activeType === type.id}
            onClick={() => onTypeChange(activeType === type.id ? 'all' : type.id)}
          />
        ))}
      </div>

      {/* Score badges */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <StatBadge emoji="😋" label="รสชาติ"   score={stats.avgTaste}      accent="text-amber-500" />
        <StatBadge emoji="💰" label="คุ้มค่า"   score={stats.avgValue}      accent="text-green-600" />
        <StatBadge emoji="✨" label="บรรยากาศ" score={stats.avgAtmosphere}  accent="text-purple-500" />
      </div>

      {/* Must return */}
      <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">❤️</span>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">อยากกลับไปอีก</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {entries.filter((r) => r.wantToReturn).length} จาก {stats.total} รายการ
            </p>
          </div>
        </div>
        <span className="text-2xl font-bold text-rose-500">{stats.mustReturnPct}%</span>
      </div>
    </div>
  );
}
