import { useEffect, useRef } from 'react';

// Non-intrusive AdSense slot.
// Behaviour:
//  - If publisher ID + slot ID are missing → renders nothing (zero impact on UX).
//  - If they are set → loads AdSense once per slot and shows the ad.
//  - Never popups, never overlays. Renders inline between content sections.
//  - Admin-controlled content filters are configured in the AdSense dashboard
//    (enable "Restricted categories" for sexually suggestive, gambling, alcohol, etc).
//
// Enable by setting in frontend/.env.production:
//   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//   VITE_ADSENSE_SLOT_INLINE=0000000000
//   VITE_ADSENSE_SLOT_INFEED=1111111111

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || '';

let scriptLoaded = false;
function loadAdsenseScript() {
  if (scriptLoaded || !CLIENT) return;
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[data-adsense]')) { scriptLoaded = true; return; }
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.dataset.adsense = '1';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  document.head.appendChild(s);
  scriptLoaded = true;
}

export default function AdSlot({ slot, format = 'auto', responsive = true, className = '', label = true }) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot) return;
    loadAdsenseScript();
    if (pushedRef.current) return;
    try {
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (_) { /* ignore */ }
  }, [slot]);

  // If not configured, render nothing — no clutter, no placeholder box.
  if (!CLIENT || !slot) return null;

  return (
    <div className={`ad-slot my-6 ${className}`} dir="rtl">
      {label && (
        <div className="text-[10px] text-slate-400 mb-1.5 text-center tracking-wide uppercase">
          إعلان
        </div>
      )}
      <div className="card overflow-hidden p-0 bg-slate-50/60">
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: 'block', minHeight: 90 }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}

// Convenience slot IDs (read from env at build time)
AdSlot.INLINE = import.meta.env.VITE_ADSENSE_SLOT_INLINE || '';
AdSlot.INFEED = import.meta.env.VITE_ADSENSE_SLOT_INFEED || '';
AdSlot.SIDEBAR = import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '';
