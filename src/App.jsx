import { useState, useMemo } from 'react';
import { Plus, UtensilsCrossed, Moon, Sun, LayoutGrid, Map } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_MOCK_DATA, ENTRY_TYPES, TYPE_THEME } from './data/mockData';
import { sortEntries, filterEntries } from './utils/helpers';
import Dashboard from './components/Dashboard';
import SearchFilter from './components/SearchFilter';
import { EntryCard, EntryRow } from './components/RestaurantCard';
import EntryDetail from './components/RestaurantDetail';
import EntryForm from './components/RestaurantForm';
import DataActions from './components/DataActions';
import MapView from './components/MapView';

// Page-level view modes
const PAGE_VIEWS = [
  { id: 'list', Icon: LayoutGrid, label: 'รายการ' },
  { id: 'map',  Icon: Map,        label: 'แผนที่' },
];

export default function App() {
  // Persistent data
  const [entries,  setEntries]  = useLocalStorage('aroilog_entries_v2', INITIAL_MOCK_DATA);
  const [darkMode, setDarkMode] = useLocalStorage('aroilog_dark', false);

  // Section tab: 'all' | 'food' | 'drinks' | 'desserts' | 'snacks'
  const [typeTab, setTypeTab]   = useLocalStorage('aroilog_type_tab', 'all');

  // Page view: 'list' | 'map'
  const [pageView, setPageView] = useState('list');

  // Filter/sort state
  const [search,      setSearch]      = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [mustReturn,  setMustReturn]  = useState(false);
  const [sortBy,      setSortBy]      = useState('date_desc');
  const [cardView,    setCardView]    = useState('grid');

  // Modal state
  const [detailId,      setDetailId]      = useState(null);
  const [editEntry,     setEditEntry]     = useState(null);
  const [showForm,      setShowForm]      = useState(false);

  // Filtered + sorted list
  const filtered = useMemo(
    () => sortEntries(
      filterEntries(entries, { search, typeTab, subCategory, mustReturn }),
      sortBy,
    ),
    [entries, search, typeTab, subCategory, mustReturn, sortBy],
  );

  const detailEntry = detailId ? entries.find((r) => r.id === detailId) : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = (data) => {
    setEntries((prev) => {
      const idx = prev.findIndex((r) => r.id === data.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = data; return next; }
      return [data, ...prev];
    });
  };

  const handleDelete = (id) => { setEntries((prev) => prev.filter((r) => r.id !== id)); setDetailId(null); };
  const openNew  = (type) => { setEditEntry(null); setShowForm(true); };
  const openEdit = (r)    => { setEditEntry(r);    setShowForm(true); };

  const handleImport = (data) => {
    setEntries((prev) => {
      const ids   = new Set(prev.map((r) => r.id));
      const fresh = data.filter((r) => !ids.has(r.id));
      return [...fresh, ...prev];
    });
  };

  // When type tab changes, reset sub-category filter
  const handleTypeTab = (t) => {
    setTypeTab(t);
    setSubCategory('');
  };

  // ── Derived theme for active tab ──────────────────────────────────────────
  const activeTheme = typeTab !== 'all' ? TYPE_THEME[typeTab] : null;
  const activeTypeInfo = ENTRY_TYPES.find((t) => t.id === typeTab);

  // ── Empty-state messages ──────────────────────────────────────────────────
  const emptyEmoji = activeTypeInfo?.emoji || '🍽️';
  const emptyLabel = entries.length === 0 ? 'ยังไม่มีรายการ' : 'ไม่พบรายการที่ตรงกัน';
  const emptySub   = entries.length === 0 ? 'เริ่มบันทึกมื้ออร่อยของคุณได้เลย!' : 'ลองเปลี่ยนตัวกรองหรือคำค้นหา';

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

        {/* ── Sticky header ──────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-2xl mx-auto px-4">

            {/* Top bar */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 dark:text-gray-50 leading-tight">AroiLog</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight hidden sm:block">อร่อยล็อก · บันทึกทุกความอร่อย</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Page view toggle — desktop only */}
                <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  {PAGE_VIEWS.map(({ id, Icon, label }) => (
                    <button key={id} onClick={() => setPageView(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pageView === id
                          ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}>
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                  {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
                <button onClick={() => openNew(typeTab !== 'all' ? typeTab : 'food')}
                  className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">เพิ่มรายการ</span>
                </button>
              </div>
            </div>

            {/* ── Section type tabs ─────────────────────────────────────── */}
            <div className="flex gap-1 pb-2 overflow-x-auto scrollbar-none">
              {/* All tab */}
              <button
                onClick={() => handleTypeTab('all')}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  typeTab === 'all'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                🌟 <span>ทั้งหมด</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeTab === 'all' ? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {entries.length}
                </span>
              </button>

              {ENTRY_TYPES.map((type) => {
                const th      = TYPE_THEME[type.id];
                const count   = entries.filter((r) => r.type === type.id).length;
                const isActive = typeTab === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeTab(type.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? `${th.iconBg} text-white shadow-sm`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{type.emoji}</span>
                    <span className="hidden sm:inline">{type.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="max-w-2xl mx-auto px-4 py-5 space-y-5 pb-28">

          {/* Mobile page-view toggle */}
          <div className="sm:hidden flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            {PAGE_VIEWS.map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setPageView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pageView === id
                    ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* ── LIST PAGE ──────────────────────────────────────────────── */}
          {pageView === 'list' && (
            <>
              {/* Dashboard — pass typeTab + handler so type cards are clickable */}
              {entries.length > 0 && (
                <Dashboard
                  entries={entries}
                  activeType={typeTab}
                  onTypeChange={handleTypeTab}
                />
              )}

              {/* Search / Filter / Sort */}
              <SearchFilter
                search={search}         onSearch={setSearch}
                activeType={typeTab}
                subCategory={subCategory} onSubCategory={setSubCategory}
                mustReturn={mustReturn}  onMustReturn={setMustReturn}
                sortBy={sortBy}         onSort={setSortBy}
                view={cardView}         onView={setCardView}
                resultCount={filtered.length}
              />

              {/* Empty state */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-5xl">{emptyEmoji}</p>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{emptyLabel}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{emptySub}</p>
                  {entries.length === 0 && (
                    <button onClick={() => openNew('food')} className="btn-primary mt-2">✨ เพิ่มรายการแรก</button>
                  )}
                </div>
              ) : cardView === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((r) => (
                    <EntryCard key={r.id} entry={r}
                      onClick={() => setDetailId(r.id)}
                      onEdit={() => openEdit(r)}
                      onDelete={() => handleDelete(r.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((r) => (
                    <EntryRow key={r.id} entry={r}
                      onClick={() => setDetailId(r.id)}
                      onEdit={() => openEdit(r)}
                      onDelete={() => handleDelete(r.id)}
                    />
                  ))}
                </div>
              )}

              {/* Data backup */}
              {entries.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">ข้อมูล & สำรอง</p>
                  <DataActions
                    restaurants={entries}
                    onImport={handleImport}
                    onClearAll={() => setEntries([])}
                  />
                </div>
              )}
            </>
          )}

          {/* ── MAP PAGE ───────────────────────────────────────────────── */}
          {pageView === 'map' && (
            <>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Map className="w-5 h-5 text-green-600" /> แผนที่รายการทั้งหมด
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  แตะหมุดเพื่อดูข้อมูลและเปิด Google Maps · แสดงตามแท็บที่เลือก
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-5xl">🗺️</p>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">ไม่มีรายการบนแผนที่</p>
                  <button onClick={() => setPageView('list')} className="btn-secondary">
                    กลับไปยังรายการ
                  </button>
                </div>
              ) : (
                <MapView
                  entries={filtered}
                  onSelectEntry={(id) => { setDetailId(id); setPageView('list'); }}
                />
              )}
            </>
          )}
        </main>

        {/* ── FAB ──────────────────────────────────────────────────────── */}
        <button
          onClick={() => openNew(typeTab !== 'all' ? typeTab : 'food')}
          className="sm:hidden fixed bottom-6 right-5 z-30 w-14 h-14 bg-gradient-to-br from-amber-400 to-rose-500 rounded-2xl shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform shadow-amber-200 dark:shadow-none"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* ── Modals ────────────────────────────────────────────────────── */}
        {showForm && (
          <EntryForm
            entry={editEntry}
            defaultType={typeTab !== 'all' ? typeTab : 'food'}
            onSave={handleSave}
            onClose={() => setShowForm(false)}
          />
        )}
        {detailEntry && (
          <EntryDetail
            entry={detailEntry}
            onClose={() => setDetailId(null)}
            onEdit={() => { setEditEntry(detailEntry); setDetailId(null); setShowForm(true); }}
            onDelete={() => handleDelete(detailId)}
          />
        )}
      </div>
    </div>
  );
}
