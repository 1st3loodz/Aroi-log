import { useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'ยืนยันการลบรายการ',
  message = 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
  itemName = '',
  confirmLabel = 'ยืนยันลบ',
  cancelLabel = 'ยกเลิก',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center transform transition-all"
      >
        {/* Warning Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 ring-8 ring-rose-50 dark:ring-rose-950/30">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 id="confirm-modal-title" className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1.5">
          {title}
        </h3>

        {/* Optional Item Name Display */}
        {itemName && (
          <div className="mb-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-full truncate">
            {itemName}
          </div>
        )}

        {/* Warning Message */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 active:scale-95 transition min-h-[46px] flex items-center justify-center"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition shadow-sm shadow-rose-200 dark:shadow-none min-h-[46px] flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
