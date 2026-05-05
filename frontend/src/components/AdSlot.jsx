import { useEffect, useRef, useState } from 'react';

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

const DEFAULT_ADSENSE_CLIENT = 'ca-pub-3653156634481888';
const DEFAULT_INLINE_SLOT = '6375995832';
const ADSENSE_SCRIPT_SRC = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

// Fall back to the live site ad unit so production builds still render ads
// even when the server is missing frontend/.env.production.
const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || DEFAULT_ADSENSE_CLIENT;

let scriptLoaded = false;
function loadAdsenseScript() {
  if (scriptLoaded || !CLIENT) return;
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src*="${ADSENSE_SCRIPT_SRC}"]`)) { scriptLoaded = true; return; }
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.dataset.adsense = '1';
  s.src = `https://${ADSENSE_SCRIPT_SRC}?client=${CLIENT}`;
  document.head.appendChild(s);
  scriptLoaded = true;
}

export default function AdSlot({ slot, format = 'auto', responsive = true, className = '', label = true }) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const [adStatus, setAdStatus] = useState('pending');
  const resolvedFormat =
    format === 'fluid' && slot === AdSlot.INLINE && !AdSlot.INFEED
      ? 'auto'
      : format;

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

  useEffect(() => {
    if (!insRef.current || typeof MutationObserver === 'undefined') return undefined;
    const ins = insRef.current;
    const syncStatus = () => {
      const next = ins.getAttribute('data-ad-status');
      if (next) setAdStatus(next);
    };

    syncStatus();

    const observer = new MutationObserver(syncStatus);
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
    });

    return () => observer.disconnect();
  }, [slot]);

  // If not configured, render nothing — no clutter, no placeholder box.
  if (!CLIENT || !slot) return null;
  if (adStatus === 'unfilled' || adStatus === 'unfill-optimized') return null;

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
          data-ad-format={resolvedFormat}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}

// Convenience slot IDs (read from env at build time)
AdSlot.INLINE = import.meta.env.VITE_ADSENSE_SLOT_INLINE || DEFAULT_INLINE_SLOT;
AdSlot.INFEED = import.meta.env.VITE_ADSENSE_SLOT_INFEED || '';
AdSlot.SIDEBAR = import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '';
