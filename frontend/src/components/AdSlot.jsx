import { useEffect, useRef, useState } from 'react';

// Non-intrusive AdSense slot — gated behind explicit opt-in.
// CRITICAL: until VITE_ADS_ENABLED=true is set at build time, the component
// renders NOTHING and the AdSense script is NEVER loaded. This is on purpose:
// AdSense reviewers reject sites that serve live ad code during review.
//
// Configure at frontend/.env.production AFTER AdSense approval:
//   VITE_ADS_ENABLED=true
//   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//   VITE_ADSENSE_SLOT_INLINE=0000000000
//   VITE_ADSENSE_SLOT_INFEED=1111111111
//   VITE_ADSENSE_SLOT_SIDEBAR=2222222222

const ADS_ENABLED = String(import.meta.env.VITE_ADS_ENABLED || '').toLowerCase() === 'true';
const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || '';
const ADSENSE_SCRIPT_SRC = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

let scriptLoaded = false;
function loadAdsenseScript() {
  if (!ADS_ENABLED || scriptLoaded || !CLIENT) return;
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
    if (!ADS_ENABLED || !CLIENT || !slot) return;
    loadAdsenseScript();
    if (pushedRef.current) return;
    try {
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (_) { /* ignore */ }
  }, [slot]);

  useEffect(() => {
    if (!ADS_ENABLED || !insRef.current || typeof MutationObserver === 'undefined') return undefined;
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

  // Until AdSense approves and VITE_ADS_ENABLED=true is flipped at build
  // time, render absolutely nothing. No clutter, no placeholder, no
  // adsbygoogle.push call, no script tag — clean as the day the site shipped.
  if (!ADS_ENABLED || !CLIENT || !slot) return null;
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
AdSlot.INLINE = import.meta.env.VITE_ADSENSE_SLOT_INLINE || '';
AdSlot.INFEED = import.meta.env.VITE_ADSENSE_SLOT_INFEED || '';
AdSlot.SIDEBAR = import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '';
