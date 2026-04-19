// Content-protection hooks. This is UX-level deterrence only — a determined
// user can always bypass via DevTools or OS-level tools. Specifically we:
//  - Block right-click except on inputs / selectable .copyable / tel:/map links
//  - Block common copy shortcuts (Ctrl+C / Ctrl+S / Ctrl+U) outside .copyable
//  - Warn (once per session) if DevTools is detected opened
//
// The *only* selection allowed by default is inside .copyable (phone & address).
// Screenshot blocking is NOT achievable on the web; we add a print deterrent
// via CSS (@media print) + a console hint. We DO NOT break accessibility:
// form inputs remain fully usable.

let warnedDevtools = false;

function shouldAllow(el) {
  if (!el || el === document) return false;
  // Allow interactions inside inputs / editable fields / our opted-in zones
  if (el.closest('input, textarea, select, [contenteditable="true"], .copyable')) return true;
  // Allow interactions on tel: / mailto: links so the browser can open them
  const a = el.closest && el.closest('a');
  if (a && /^(tel:|mailto:|sms:|whatsapp:)/i.test(a.getAttribute('href') || '')) return true;
  return false;
}

export function enableContentProtection() {
  // Context menu (right-click / long-press)
  document.addEventListener('contextmenu', (e) => {
    if (shouldAllow(e.target)) return;
    e.preventDefault();
  });

  // Keyboard shortcuts: copy / cut / save / view-source / print
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    // Copy / cut / save / view-source / print → block unless inside .copyable
    if (['c', 'x', 's', 'u', 'p'].includes(k)) {
      if (shouldAllow(document.activeElement)) return;
      e.preventDefault();
    }
  });

  // Drag (of text / images)
  document.addEventListener('dragstart', (e) => {
    if (shouldAllow(e.target)) return;
    e.preventDefault();
  });

  // Copy event: replace clipboard with attribution if outside .copyable
  document.addEventListener('copy', (e) => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
      if (shouldAllow(node)) return;   // allow inside .copyable
      e.preventDefault();
      e.clipboardData && e.clipboardData.setData('text/plain', 'قناوي — دليل قنا · qinawy.com');
    }
  });

  // DevTools detection (rough — works on most desktop Chromes/Firefox)
  const check = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if ((widthDiff > threshold || heightDiff > threshold) && !warnedDevtools) {
      warnedDevtools = true;
      try {
        // eslint-disable-next-line no-console
        console.warn('%cقناوي — دليل قنا', 'color:#0c4a6e;font-size:22px;font-weight:900');
        // eslint-disable-next-line no-console
        console.warn('%cالمحتوى محمي بحقوق ملكية. النسخ غير المصرح به ممنوع.', 'color:#b91c1c;font-size:14px');
      } catch (_) {}
    }
  };
  setInterval(check, 1500);
}
