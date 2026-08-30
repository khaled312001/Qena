import { useEffect, useRef, useState } from 'react';
import MonetagSlot from './MonetagSlot.jsx';

// Multi-network ad slot — routes to AdSense OR Monetag automatically based on
// which env flag is enabled at build time. Existing call sites (<AdSlot
// slot={AdSlot.INLINE} />) continue to work unchanged; they just render
// whatever network is currently configured.
//
// Precedence order (first that's enabled wins):
//   1. VITE_ADS_ENABLED=true          → render AdSense (traditional path)
//   2. VITE_MONETAG_ENABLED=true      → render Monetag (fallback for sites
//                                        AdSense keeps rejecting; MENA-heavy
//                                        advertiser base pays better on
//                                        Arabic Egyptian traffic anyway)
//   3. (neither)                      → render nothing (default; keeps the
//                                        site clean during network review)
//
// CRITICAL: neither script loads until its corresponding flag is set to true.
// Reviewers land on ad-free pages; ads activate only after the network approves.
//
// Configure AdSense (after AdSense approval):
//   VITE_ADS_ENABLED=true
//   VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
//   VITE_ADSENSE_SLOT_INLINE=0000000000
//   VITE_ADSENSE_SLOT_INFEED=1111111111
//   VITE_ADSENSE_SLOT_SIDEBAR=2222222222
//
// Configure Monetag (after Monetag approval):
//   VITE_MONETAG_ENABLED=true
//   VITE_MONETAG_SDK_URL=https://groleegni.net/401/YYYYYYY
//   VITE_MONETAG_ZONE_INLINE=1234567
//   VITE_MONETAG_ZONE_INFEED=1234568
//   VITE_MONETAG_ZONE_SIDEBAR=1234569

const ADS_ENABLED = String(import.meta.env.VITE_ADS_ENABLED || '').toLowerCase() === 'true';
const MONETAG_ENABLED = String(import.meta.env.VITE_MONETAG_ENABLED || '').toLowerCase() === 'true';
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

// Map "slot type" strings back to Monetag zone IDs. Existing call sites pass
// a numeric slot ID from AdSlot.INLINE/INFEED/SIDEBAR; we detect which one
// they passed and route to the matching Monetag zone.
function monetagZoneFor(slot) {
  if (slot === AdSlot.INLINE) return MonetagSlot.INLINE;
  if (slot === AdSlot.INFEED) return MonetagSlot.INFEED;
  if (slot === AdSlot.SIDEBAR) return MonetagSlot.SIDEBAR;
  return MonetagSlot.INLINE || '';
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
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, [slot]);

  // AdSense enabled → render AdSense
  if (ADS_ENABLED && CLIENT && slot) {
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

  // AdSense disabled but Monetag enabled → route to Monetag with same slot placement
  if (MONETAG_ENABLED) {
    return <MonetagSlot zoneId={monetagZoneFor(slot)} className={className} label={label} />;
  }

  // Neither enabled → render nothing (review-safe default)
  return null;
}

// Convenience slot IDs (read from env at build time)
AdSlot.INLINE = import.meta.env.VITE_ADSENSE_SLOT_INLINE || '';
AdSlot.INFEED = import.meta.env.VITE_ADSENSE_SLOT_INFEED || '';
AdSlot.SIDEBAR = import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR || '';
