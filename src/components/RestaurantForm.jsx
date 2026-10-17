import { useState, useEffect, useRef } from 'react';
import {
  X, ImageIcon, ToggleLeft, ToggleRight, ChevronDown, MapPin, ExternalLink, Camera, ImagePlus,
} from 'lucide-react';
import StarPicker from './StarPicker';
import DishList from './DishList';
import { BeerGlassPicker, SrmPicker } from './BeerGlass';
import { isBeer, BEER_STYLES } from '../data/beer';
import { ENTRY_TYPES, SUB_CATEGORIES, HIGHLIGHT_PLACEHOLDER, TYPE_THEME } from '../data/mockData';

// Price level 1–4 is shown with the chosen currency symbol (฿ for local, $ ¥ € £ ₩ for abroad)
const CURRENCY_SYMBOLS = ['฿', '$', '¥', '€', '£', '₩'];
import { calcOverall, generateId, getMapsUrl, getDishes, fileToDataUrl, todayISO } from '../utils/helpers';
import DateInputDMY from './DateInputDMY';
import { AMENITIES, hasAmenities } from '../data/amenities';

const EMPTY_FORM = {
  source: 'shop',
  type: 'food',
  name: '',
  subCategory: 'อาหารไทย',
  location: '',
  visitDate: todayISO(),
  priceTier: '฿฿',
  taste: 4.0,
  value: 4.0,
  atmosphere: 4.0,
  dishes: [],
  wantToReturn: true,
  notes: '',
  imageUrl: '',
  mapsUrl: '',
  beerStyle: '',
  abv: '',
  ibu: '',
  srm: 6,
  aroma: 3,
  bitterness: 3,
  currency: 'THB',
  amenities: {},
};

export default function EntryForm({ entry, defaultType, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    if (entry) {
      const sym = Array.from(entry.priceTier || '')[0];
      const legacyCurrency = sym === '$' ? 'USD' : sym === '¥' ? 'JPY' : 'THB';
      return { source: 'shop', abv: '', ibu: '', srm: 6, aroma: 3, bitterness: 3, beerStyle: '', amenities: {}, currency: legacyCurrency, ...entry, dishes: getDishes(entry).map((d) => ({ id: generateId(), ...d })) };
    }
    return { ...EMPTY_FORM, type: defaultType || 'food', subCategory: SUB_CATEGORIES[defaultType || 'food'][0] };
  });
  const [imgError, setImgError] = useState(false);
  const [errors, setErrors]     = useState({});
  const overlayRef = useRef(null);
  const cameraRef  = useRef(null);
  const galleryRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const isUploaded = (form.imageUrl || '').startsWith('data:');

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setPhotoError('');
      setImgError(false);
      setForm((f) => ({ ...f, imageUrl: '' }));
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    } catch {
      setPhotoError('อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง');
    }
  };

  const packaged = form.source === 'packaged';
  const beer     = isBeer(form);
  const overall  = calcOverall(form.taste, form.value, form.atmosphere, form.source);
  const theme    = TYPE_THEME[form.type];
  const subCats  = SUB_CATEGORIES[form.type];
  const priceCurrency = Array.from(form.priceTier || '฿')[0] || '฿';
  const priceLevel    = Math.min(4, Math.max(1, Array.from(form.priceTier || '฿').length));

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // When type changes, reset subCategory to first in the new list
  const handleTypeChange = (newType) => {
    setForm((f) => ({ ...f, type: newType, subCategory: SUB_CATEGORIES[newType][0] }));
  };

  const effectiveMapsUrl = (!packaged && (form.name || form.location))
    ? getMapsUrl({ name: form.name || '?', location: form.location || '', mapsUrl: form.mapsUrl })
    : '';

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = packaged ? 'กรุณาระบุชื่อสินค้า' : 'กรุณาระบุชื่อร้าน/สถานที่';
    if (!form.location.trim()) e.location  = packaged ? 'กรุณาระบุแหล่งที่ซื้อ' : 'กรุณาระบุสถานที่';
    if (!form.visitDate)       e.visitDate = 'กรุณาเลือกวันที่';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = { ...form, overall, id: form.id || generateId() };
    data.dishes = (form.dishes || [])
      .filter((d) => d.name.trim() || d.price !== '')
      .map((d) => ({ ...d, name: d.name.trim() || 'Dish' }));
    data.highlightMenus = data.dishes.map((d) => d.name);
    if (packaged) { data.mapsUrl = ''; delete data.lat; delete data.lng; }
    if (!beer) { ['abv', 'ibu', 'srm', 'aroma', 'bitterness', 'beerStyle'].forEach((k) => delete data[k]); }
    if (!hasAmenities(form)) delete data.amenities;
    onSave(data);
    onClose();
  };

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div className="w-full sm:max-w-lg max-h-[95dvh] sm:max-h-[92vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-3 sm:hidden" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {entry ? '✏️ แก้ไขรายการ' : '✨ เพิ่มรายการใหม่'}
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* ── Entry source toggle ── */}
          <div>
            <label className="label">แหล่งที่มา</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'shop',     title: '🏬 Dine-in / Specific Shop',       sub: 'ร้านอาหาร / คาเฟ่' },
                { id: 'packaged', title: '🛒 Packaged / Convenience Store', sub: 'ซื้อจาก 7-11 / ร้านชำ / ซูเปอร์มาร์เก็ต' },
              ].map((s) => (
                <button key={s.id} type="button" onClick={() => set('source', s.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all ${
                    form.source === s.id
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">{s.title}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{s.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Primary type selector ── */}
          <div>
            <label className="label">ประเภท</label>
            <div className="grid grid-cols-4 gap-2">
              {ENTRY_TYPES.map((t) => {
                const th = TYPE_THEME[t.id];
                const active = form.type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeChange(t.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-xs font-medium transition-all
                      ${active
                        ? `${th.bg} ${th.border} ${th.accent} shadow-sm`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Image: camera / gallery upload or URL ── */}
          <div className="space-y-2">
            <label className="label">📸 รูปภาพ (Photo)</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => cameraRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-300 active:scale-95 transition">
                <Camera className="w-4 h-4" /> ถ่ายรูป
              </button>
              <button type="button" onClick={() => galleryRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-300 active:scale-95 transition">
                <ImagePlus className="w-4 h-4" /> เลือกจากอัลบั้ม
              </button>
            </div>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

            {isUploaded ? (
              <p className="text-xs text-green-600 dark:text-green-400">✅ อัปโหลดรูปจากเครื่องแล้ว</p>
            ) : (
              <input className="input" placeholder="หรือวางลิงก์รูป https://..."
                value={form.imageUrl}
                onChange={(e) => { set('imageUrl', e.target.value); setImgError(false); }}
              />
            )}
            {photoError && <p className="text-rose-500 text-xs">{photoError}</p>}

            {form.imageUrl && !imgError && (
              <div className="relative rounded-xl overflow-hidden h-36 bg-gray-100 dark:bg-gray-800">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                  onError={() => setImgError(true)} />
                <button type="button" onClick={() => { set('imageUrl', ''); setImgError(false); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  aria-label="Remove photo">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {imgError && (
              <div className="flex items-center justify-center h-16 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm gap-2">
                <ImageIcon className="w-4 h-4" /> ไม่สามารถโหลดรูปได้
              </div>
            )}
          </div>

          {/* ── Name ── */}
          <div>
            <label className="label">{packaged ? '🛍️ Product / Item Name (Brand) *' : '🏪 ชื่อร้าน / สถานที่ *'}</label>
            <input
              className={`input ${errors.name ? 'border-rose-400' : ''}`}
              placeholder={packaged ? 'เช่น เลย์ รสเห็ดทรัฟเฟิล' : 'ชื่อร้าน, คาเฟ่, สแตนด์...'}
              value={form.name}
              onChange={(e) => { set('name', e.target.value); setErrors((err) => ({ ...err, name: '' })); }}
            />
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* ── Sub-category & Price ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">🏷️ หมวดหมู่ย่อย</label>
              <div className="relative">
                <select className="input appearance-none pr-8" value={form.subCategory}
                  onChange={(e) => set('subCategory', e.target.value)}>
                  {subCats.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label flex items-center justify-between">
                <span>💰 ราคา / Price</span>
                <select
                  aria-label="Currency symbol"
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-1.5 py-0.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  value={priceCurrency}
                  onChange={(e) => set('priceTier', e.target.value.repeat(priceLevel))}
                >
                  {CURRENCY_SYMBOLS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <button key={lvl} type="button" title={`Level ${lvl} / 4`}
                    onClick={() => set('priceTier', priceCurrency.repeat(lvl))}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      priceLevel === lvl
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                    }`}>
                    {priceCurrency.repeat(lvl)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Location & Date ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{packaged ? '🛒 Bought From (ซื้อจาก) *' : '📍 Location / Area (สถานที่ / ย่าน) *'}</label>
              <input
                className={`input ${errors.location ? 'border-rose-400' : ''}`}
                placeholder={packaged ? '7-11, CJ More, Lawson Tokyo, ตลาดนัด...' : 'Tokyo, Japan / Shibuya / สยาม / อารีย์'}
                value={form.location}
                onChange={(e) => { set('location', e.target.value); setErrors((err) => ({ ...err, location: '' })); }}
              />
              {errors.location && <p className="text-rose-500 text-xs mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="label">📅 วันที่ไป (dd/mm/yy)</label>
              <DateInputDMY
                value={form.visitDate}
                error={errors.visitDate}
                onChange={(iso) => { set('visitDate', iso); setErrors((err) => ({ ...err, visitDate: '' })); }}
              />
            </div>
          </div>

          {/* ── Google Maps (shop only) ── */}
          {!packaged && <div className="space-y-2">
            <label className="label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-green-600" /> Google Maps Link
              <span className="text-gray-400 font-normal text-xs">(ไม่บังคับ)</span>
            </label>
            <input className="input" placeholder="https://maps.app.goo.gl/..."
              value={form.mapsUrl} onChange={(e) => set('mapsUrl', e.target.value)} />
            {effectiveMapsUrl && (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400 flex-1 truncate">
                  {form.mapsUrl ? 'ใช้ลิงก์ที่กำหนด' : 'ค้นหาอัตโนมัติจากชื่อ+ที่ตั้ง'}
                </p>
                <a href={effectiveMapsUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 font-semibold hover:underline flex-shrink-0">
                  ทดสอบ <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>}

          {/* ── Ratings ── */}
          <div className={`space-y-4 p-4 ${theme.bg} rounded-2xl border ${theme.border}`}>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">⭐ ให้คะแนน</h3>
            <StarPicker label="ความอร่อย / รสชาติ"   emoji="😋" value={form.taste}       onChange={(v) => set('taste', v)} />
            <StarPicker label="ความคุ้มค่า"            emoji="💰" value={form.value}       onChange={(v) => set('value', v)} />
            {!packaged && <StarPicker label="บรรยากาศ / การบริการ"  emoji="✨" value={form.atmosphere}  onChange={(v) => set('atmosphere', v)} />}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">คะแนนรวม</span>
              <span className={`text-2xl font-bold ${theme.accent}`}>{overall.toFixed(1)}</span>
            </div>
          </div>

          {/* ── Beer tasting mode ── */}
          {beer && (
            <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">🍺 Beer & Craft Beer Tasting</h3>

              <div>
                <label className="label">🍻 Beer Style</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {BEER_STYLES.map((s) => (
                    <button key={s} type="button"
                      onClick={() => set('beerStyle', form.beerStyle === s ? '' : s)}
                      className={`pill ${form.beerStyle === s ? 'bg-amber-500 text-white' : 'pill-inactive'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <input className="input" placeholder="Custom style, e.g. Saison, Barleywine..."
                  value={form.beerStyle || ''} onChange={(e) => set('beerStyle', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">ABV (% Alcohol by Volume)</label>
                  <div className="relative">
                    <input type="number" inputMode="decimal" min="0" max="70" step="0.1"
                      className="input pr-8" placeholder="5.2"
                      value={form.abv} onChange={(e) => set('abv', e.target.value === '' ? '' : Number(e.target.value))} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="label">IBU (Bitterness Units)</label>
                  <input type="number" inputMode="numeric" min="0" max="120" step="1"
                    className="input" placeholder="25, 45, 60"
                    value={form.ibu} onChange={(e) => set('ibu', e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
              </div>

              <BeerGlassPicker label="Aroma (ความหอม)"      emoji="🌿" value={form.aroma}      onChange={(v) => set('aroma', v)} />
              <BeerGlassPicker label="Bitterness (ความขม)"  emoji="🍺" value={form.bitterness} onChange={(v) => set('bitterness', v)} />

              <div>
                <label className="label">🎨 Beer Color (SRM 1–24)</label>
                <SrmPicker value={form.srm} onChange={(v) => set('srm', v)} />
              </div>
            </div>
          )}

          {/* ── Cafe amenities (Desserts, Bakery & Cafe only) ── */}
          {hasAmenities(form) && (
            <div>
              <label className="label">☕ Cafe Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES.map((a) => {
                  const on = !!form.amenities?.[a.id];
                  return (
                    <button key={a.id} type="button"
                      onClick={() => set('amenities', { ...(form.amenities || {}), [a.id]: !on })}
                      aria-pressed={on}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                        on
                          ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      <span className="text-lg">{a.emoji}</span>
                      <span className="text-left leading-tight">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Itemized dishes ── */}
          <div>
            <label className="label">🌟 เมนูที่สั่ง / เมนูเด่น (Dishes)</label>
            <DishList
              dishes={form.dishes}
              onChange={(d) => set('dishes', d)}
              placeholder={HIGHLIGHT_PLACEHOLDER[form.type]}
              currencyCode={form.currency}
              onCurrencyChange={(c) => set('currency', c)}
            />
          </div>

          {/* ── Want to return ── */}
          <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">อยากกลับไปซ้ำ? 🔄</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {form.wantToReturn ? 'อยากกลับมาแน่นอน! ❤️' : 'อาจไม่ได้กลับมาแล้ว'}
              </p>
            </div>
            <button type="button" onClick={() => set('wantToReturn', !form.wantToReturn)} className="transition-transform active:scale-90">
              {form.wantToReturn
                ? <ToggleRight className="w-10 h-10 text-rose-500" />
                : <ToggleLeft  className="w-10 h-10 text-gray-400" />
              }
            </button>
          </div>

          {/* ── Notes ── */}
          <div>
            <label className="label">📝 รีวิวส่วนตัว</label>
            <textarea className="input min-h-[90px] resize-none"
              placeholder="เขียนความรู้สึก หรือ tip ที่อยากจำ..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className="h-4" />
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">ยกเลิก</button>
          <button type="button" onClick={handleSubmit} className="btn-primary flex-1">
            {entry ? 'บันทึก' : '✨ เพิ่มรายการ'}
          </button>
        </div>
      </div>
    </div>
  );
}

