import { useEffect, useRef, useState } from 'react';
import { MapPin, ExternalLink, Star, Heart, X } from 'lucide-react';
import { getMapsUrl } from '../utils/helpers';
import { BANGKOK_CENTER, ENTRY_TYPES, TYPE_THEME } from '../data/mockData';

function scoreToColor(score) {
  if (score >= 4.5) return '#f59e0b';
  if (score >= 3.5) return '#fb923c';
  if (score >= 2.5) return '#f97316';
  return '#f43f5e';
}

function buildPopupHTML(r) {
  const mapsUrl  = getMapsUrl(r);
  const typeInfo = ENTRY_TYPES.find((x) => x.id === r.type);
  const heart    = r.wantToReturn ? '❤️ ' : '';
  return `
    <div style="font-family:Inter,'Noto Sans Thai',sans-serif;min-width:180px;max-width:240px">
      ${r.imageUrl
        ? `<img src="${r.imageUrl}" alt="${r.name}"
             style="width:calc(100% + 16px);margin:-8px -8px 8px -8px;height:90px;object-fit:cover;border-radius:8px 8px 0 0"
             onerror="this.style.display='none'">`
        : ''}
      <strong style="font-size:13px;color:#1f2937">${heart}${r.name}</strong><br/>
      <span style="font-size:11px;color:#6b7280">${typeInfo?.emoji || ''} ${r.subCategory} · ${r.location}</span><br/>
      <div style="margin:5px 0;display:flex;align-items:center;gap:4px">
        <span style="font-size:14px;font-weight:700;color:#f59e0b">★ ${r.overall.toFixed(1)}</span>
        <span style="font-size:11px;color:#9ca3af">/ 5.0 · ${r.priceTier}</span>
      </div>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer"
         style="display:inline-flex;align-items:center;gap:4px;padding:5px 10px;background:#16a34a;color:#fff;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none;margin-top:4px">
        📍 เปิดใน Google Maps
      </a>
    </div>
  `;
}

export default function MapView({ entries, onSelectEntry }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const mappable = entries.filter((r) => r.lat && r.lng);
  const unmapped = entries.filter((r) => r.source !== 'packaged' && !(r.lat && r.lng)).length;

  useEffect(() => {
    if (leafletRef.current) return;
    import('leaflet').then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      const map = L.map(mapRef.current, { center: BANGKOK_CENTER, zoom: 12 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      leafletRef.current = { L, map };
      setMapReady(true);
    });
    return () => { if (leafletRef.current) { leafletRef.current.map.remove(); leafletRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapReady || !leafletRef.current) return;
    const { L, map } = leafletRef.current;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    mappable.forEach((r) => {
      const typeInfo = ENTRY_TYPES.find((x) => x.id === r.type);
      const color    = scoreToColor(r.overall);
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:38px;height:38px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:11px;font-weight:700;color:#fff;line-height:1">${typeInfo?.emoji || '📍'}</span>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });
      const marker = L.marker([r.lat, r.lng], { icon })
        .addTo(map)
        .bindPopup(buildPopupHTML(r), { maxWidth: 260, className: 'aroilog-popup' });
      marker.on('click', () => setActiveId(r.id));
      markersRef.current.push(marker);
    });
  }, [mapReady, entries]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || mappable.length === 0) return;
    leafletRef.current.map.fitBounds(mappable.map((r) => [r.lat, r.lng]), { padding: [40, 40], maxZoom: 14 });
  }, [mapReady]);

  const activeEntry = activeId ? entries.find((r) => r.id === activeId) : null;
  const activeType  = activeEntry ? ENTRY_TYPES.find((x) => x.id === activeEntry.type) : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          แสดง <strong className="text-gray-800 dark:text-gray-200">{mappable.length}</strong> จุดบนแผนที่
          {unmapped > 0 && <span className="ml-1 text-amber-600">({unmapped} ยังไม่มีพิกัด)</span>}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> ≥4.5
          <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> ≥3.5
          <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> &lt;3.5
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: 420 }}>
        <div ref={mapRef} className="w-full h-full" />

        {activeEntry && (
          <div className="absolute bottom-3 left-3 right-3 z-[500] animate-slide-up">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
              {activeEntry.imageUrl && (
                <img src={activeEntry.imageUrl} alt={activeEntry.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{activeType?.emoji}</span>
                  <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{activeEntry.name}</p>
                  {activeEntry.wantToReturn && <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500">{activeEntry.location} · {activeEntry.priceTier}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{activeEntry.overall.toFixed(1)}
                  </span>
                  <a href={getMapsUrl(activeEntry)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 font-semibold hover:underline">
                    <MapPin className="w-3 h-3" /> Maps <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => { onSelectEntry(activeEntry.id); setActiveId(null); }}
                  className="text-xs px-2 py-1 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition">
                  ดูรีวิว
                </button>
                <button onClick={() => setActiveId(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
