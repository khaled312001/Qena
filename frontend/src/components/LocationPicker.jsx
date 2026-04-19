import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Loader2, X } from 'lucide-react';

const pinIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Qena city center as default
const QENA_DEFAULT = { lat: 26.158, lng: 32.718 };

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], Math.max(map.getZoom(), 15));
  }, [position?.lat, position?.lng]);
  return null;
}

/**
 * LocationPicker — interactive map for selecting a coordinate.
 * Props:
 *   value:   { lat, lng } | null
 *   onChange: fn(next)
 *   height:  CSS height (default 280px)
 */
export default function LocationPicker({ value, onChange, height = 280 }) {
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState(null);
  const markerRef = useRef(null);

  const center = useMemo(() => value || QENA_DEFAULT, [value?.lat, value?.lng]);

  function useMyLocation() {
    if (!('geolocation' in navigator)) { setErr('المتصفح لا يدعم تحديد الموقع'); return; }
    setErr(null); setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => { setErr('تعذّر تحديد موقعك — يمكنك الضغط على الخريطة بدلاً من ذلك'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function clear() { onChange(null); }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {value
            ? <>تم اختيار الموقع — <span dir="ltr" className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{value.lat.toFixed(5)}, {value.lng.toFixed(5)}</span></>
            : <>اضغط على الخريطة لتحديد موقع المكان، أو استخدم زر "موقعي الحالي"</>}
        </div>
        <div className="flex items-center gap-1.5">
          {value && (
            <button type="button" onClick={clear}
              className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition">
              <X className="w-3 h-3" /> مسح
            </button>
          )}
          <button type="button" onClick={useMyLocation} disabled={locating}
            className="inline-flex items-center gap-1 text-xs bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1.5 rounded-lg transition">
            {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
            موقعي الحالي
          </button>
        </div>
      </div>
      {err && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{err}</div>
      )}
      <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height }}>
        <MapContainer center={[center.lat, center.lng]} zoom={value ? 15 : 13} style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onPick={onChange} />
          {value && (
            <Marker
              position={[value.lat, value.lng]}
              icon={pinIcon}
              draggable={true}
              ref={markerRef}
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng();
                  onChange({ lat: latlng.lat, lng: latlng.lng });
                },
              }}
            />
          )}
          {value && <FlyTo position={value} />}
        </MapContainer>
      </div>
    </div>
  );
}
