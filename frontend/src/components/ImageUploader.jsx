import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api.js';

// Image uploader — accepts a single image file, uploads to the given endpoint,
// then calls onChange(url) with the server-returned URL. Also supports clearing.
// Props:
//   value:   current image URL (or empty)
//   onChange(url|null)
//   endpoint: '/services/upload' (admin, JWT) or '/services/submit/upload' (public)
//   maxMB:   default 5
//   label:   button label
export default function ImageUploader({
  value,
  onChange,
  endpoint = '/services/upload',
  maxMB = 5,
  label = 'اختر صورة',
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    setError('');
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      setError('صيغة غير مدعومة. استخدم JPG / PNG / WEBP / GIF');
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`الحجم أكبر من ${maxMB} ميجا`);
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      if (r.data && r.data.url) onChange(r.data.url);
      else setError('تعذّر قراءة رد الخادم');
    } catch (e) {
      setError(e.response?.data?.error || 'تعذّر رفع الصورة');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onInput(e) { handleFile(e.target.files && e.target.files[0]); }

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function clear() {
    onChange(null);
    setError('');
  }

  const hasImage = !!value;

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden" onChange={onInput} />

      {hasImage ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt="معاينة" className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> تم الرفع
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button type="button" onClick={() => inputRef.current && inputRef.current.click()}
              className="bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
              تغيير
            </button>
            <button type="button" onClick={clear}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold p-1.5 rounded-full shadow flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          disabled={uploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand-400 transition flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-brand-700">
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-sm font-medium">جاري الرفع...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <ImagePlus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-[11px] text-slate-400">اسحب وأفلت، أو اضغط للاختيار · حتى {maxMB} ميجا</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
