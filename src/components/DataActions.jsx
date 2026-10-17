import { Upload, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useRef, useState } from 'react';
import { exportToJSON, importFromJSON } from '../utils/helpers';

export default function DataActions({ restaurants, onImport, onClearAll }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExport = () => {
    exportToJSON(restaurants);
    setStatus('✅ ส่งออกข้อมูลสำเร็จ!');
    setTimeout(() => setStatus(''), 3000);
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFromJSON(file);
      onImport(data);
      setStatus(`✅ นำเข้า ${data.length} ร้านสำเร็จ!`);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
    setTimeout(() => setStatus(''), 4000);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 btn-secondary text-xs py-1.5 px-3"
        >
          <Download className="w-3.5 h-3.5" /> Export JSON
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 btn-secondary text-xs py-1.5 px-3"
        >
          <Upload className="w-3.5 h-3.5" /> Import JSON
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" /> ล้างข้อมูล
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
      </div>

      {status && (
        <p className="text-xs text-gray-600 dark:text-gray-400 animate-fade-in">{status}</p>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">ล้างข้อมูลทั้งหมด?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              การกระทำนี้จะลบร้านอาหารทั้งหมด {restaurants.length} ร้าน และไม่สามารถกู้คืนได้ กรุณา Export ก่อนถ้าต้องการ
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 text-sm">
                ยกเลิก
              </button>
              <button
                onClick={() => { onClearAll(); setShowConfirm(false); }}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
              >
                ลบทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
