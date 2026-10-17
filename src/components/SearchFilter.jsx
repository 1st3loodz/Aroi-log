import { useState } from 'react';
import { Search, X, Heart, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { ENTRY_TYPES, SUB_CATEGORIES, SORT_OPTIONS, TYPE_THEME } from '../data/mockData';

export default function SearchFilter({
  search, onSearch,
  activeType,                    // 'all' | 'food' | 'drinks' | 'desserts' | 'snacks'
  subCategory, onSubCategory,
  mustReturn, onMustReturn,
  sortBy, onSort,
  view, onView,
  resultCount,
}) {
  const [showSort, setShowSort] = useState(false);

  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'เรียงลำดับ';

  // Sub-categories available for active type (or none if 'all')
  const availableSubs = activeType && activeType !== 'all' ? SUB_CATEGORIES[activeType] : [];
  const th = activeType && activeType !== 'all' ? TYPE_THEME[activeType] : null;

  return (
    <div className="space-y-3">
      {/* Search + Sort + View */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            className="input pl-9 pr-8"
            placeholder="ค้นหาชื่อร้าน, ย่าน, เมนู..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => onSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSort((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
              sortBy !== 'date_desc'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-amber-300'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{currentSort}</span>
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => { onSort(opt.value); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    sortBy === opt.value
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid/List toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button onClick={() => onView('grid')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => onView('list')}
            className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-category pills + Must Return — only show sub-cats when a type tab is active */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Must Return filter */}
        <button
          onClick={() => onMustReturn(!mustReturn)}
          className={`pill flex-shrink-0 flex items-center gap-1 ${mustReturn ? 'bg-rose-500 text-white' : 'pill-inactive'}`}
        >
          <Heart className={`w-3 h-3 ${mustReturn ? 'fill-white' : ''}`} />
          กลับไปอีก
        </button>

        {availableSubs.length > 0 && (
          <>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <button
              onClick={() => onSubCategory('')}
              className={`pill flex-shrink-0 ${!subCategory ? (th ? th.pill_act : 'pill-active') : 'pill-inactive'}`}
            >
              ทั้งหมด
            </button>
            {availableSubs.map((cat) => (
              <button
                key={cat}
                onClick={() => onSubCategory(subCategory === cat ? '' : cat)}
                className={`pill flex-shrink-0 ${subCategory === cat ? (th ? th.pill_act : 'pill-active') : 'pill-inactive'}`}
              >
                {cat}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Result count */}
      {(search || subCategory || mustReturn) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          พบ <strong className="text-gray-700 dark:text-gray-300">{resultCount}</strong> รายการ
          {search && <span> สำหรับ "<span className="font-medium">{search}</span>"</span>}
        </p>
      )}
    </div>
  );
}
