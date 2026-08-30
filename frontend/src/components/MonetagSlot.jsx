import { useEffect, useRef, useState } from 'react';

// Monetag ad slot — gated behind explicit opt-in.
// Until VITE_MONETAG_ENABLED=true is set at build time, this component renders
// NOTHING and the Monetag script is NEVER loaded. Same defensive pattern as
// AdSlot.jsx (which is for AdSense).
//
// Configure at frontend/.env.production:
//   VITE_MONETAG_ENABLED=true
//   VITE_MONETAG_ZONE_ID=1234567          # from monetag.com dashboard after site approval
//   VITE_MONETAG_SDK_URL=https://groleegni.net/401/YYYYYYY   # SDK URL Monetag gives you
//
// The zone ID and SDK URL come from monetag.com after:
//   1. Sign up + verify email
//   2. Add site (qinawy.com) → get instant approval (Arabic MENA site accepted)
//   3. Create "Native Banner" or "In-Page Push" ad unit
//   4. Copy the zone ID from the ad unit's dashboard

const MONETAG_ENABLED = String(import.meta.env.VITE_MONETAG_ENABLED || '').toLowerCase() === 'true';
const ZONE_ID = import.meta.env.VITE_MONETAG_ZONE_ID || '';
const SDK_URL = import.meta.env.VITE_MONETAG_SDK_URL || '';

let scriptLoaded = false;
function loadMonetagScript() {
  if (!MONETAG_ENABLED || scriptLoaded || !SDK_URL) return;
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src*="${SDK_URL}"]`)) { scriptLoaded = true; return; }
  const s = document.createElement('script');
  s.async = true;
  s.dataset.monetag = '1';
  s.src = SDK_URL;
  document.head.appendChild(s);
  scriptLoaded = true;
}

// A native-banner style slot. Monetag "Native Banner" injects itself into the
// container element identified by data-zone; we just render the div and let
// Monetag's script fill it. Non-intrusive, matches site look.
export default function MonetagSlot({ zoneId, className = '', label = true }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const zid = zoneId || ZONE_ID;

  useEffect(() => {
    if (!MONETAG_ENABLED || !zid) return;
    loadMonetagScript();
  }, [zid]);

  if (!MONETAG_ENABLED || !zid) return null;
  if (!visible) return null;

  return (
    <div className={`ad-slot my-6 ${className}`} dir="rtl">
      {label && (
        <div className="text-[10px] text-slate-400 mb-1.5 text-center tracking-wide uppercase">
          إعلان
        </div>
      )}
      <div className="card overflow-hidden p-0 bg-slate-50/60">
        <div ref={containerRef}
             className="monetag-slot block"
             style={{ display: 'block', minHeight: 90 }}
             data-zone={zid}
        />
      </div>
    </div>
  );
}

// Convenience zone IDs (read from env at build time). One-per-placement so
// Monetag can report performance by placement.
MonetagSlot.INLINE = import.meta.env.VITE_MONETAG_ZONE_INLINE || '';
MonetagSlot.SIDEBAR = import.meta.env.VITE_MONETAG_ZONE_SIDEBAR || '';
MonetagSlot.INFEED = import.meta.env.VITE_MONETAG_ZONE_INFEED || '';
