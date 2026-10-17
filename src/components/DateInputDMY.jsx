import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate, parseDMY } from '../utils/helpers';

/**
 * Date field shown and typed as dd/mm/yy, stored as ISO yyyy-mm-dd.
 * The calendar button opens the native date picker.
 */
export default function DateInputDMY({ value, onChange, error }) {
  const pickerRef = useRef(null);
  const [text, setText] = useState(formatDate(value));
  const [invalid, setInvalid] = useState(false);

  // Keep the text in sync when the value changes from outside (e.g. the picker)
  useEffect(() => { setText(formatDate(value)); setInvalid(false); }, [value]);

  // Auto-insert slashes while typing: 171026 -> 17/10/26
  const handleType = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)].filter(Boolean);
    const next = parts.join('/');
    setText(next);
    setInvalid(false);
    if (digits.length === 6) {
      const iso = parseDMY(next);
      if (iso) onChange(iso); else setInvalid(true);
    }
  };

  const handleBlur = () => {
    if (!text) return;
    const iso = parseDMY(text);
    if (iso) { onChange(iso); setText(formatDate(iso)); }
    else setInvalid(true);
  };

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try { el.showPicker(); return; } catch { /* fall through */ }
    }
    el.focus();
    el.click();
  };

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yy"
          aria-label="Visit date (dd/mm/yy)"
          className={`input pr-10 tracking-wide ${error || invalid ? 'border-rose-400' : ''}`}
          value={text}
          onChange={(e) => handleType(e.target.value)}
          onBlur={handleBlur}
        />
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
          aria-label="Open calendar"
        >
          <Calendar className="w-4 h-4" />
        </button>
        {/* Native picker, visually hidden but still openable */}
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-px h-px opacity-0 pointer-events-none"
          value={value || ''}
          onChange={(e) => e.target.value && onChange(e.target.value)}
        />
      </div>
      {invalid
        ? <p className="text-rose-500 text-xs mt-1">รูปแบบวันที่ไม่ถูกต้อง (dd/mm/yy)</p>
        : <p className="text-[10px] text-gray-400 mt-1">รูปแบบ dd/mm/yy</p>}
    </div>
  );
}
