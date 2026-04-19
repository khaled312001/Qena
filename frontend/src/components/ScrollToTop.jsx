import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 *
 * Forces the viewport back to the top on every route change.
 * Multiple reset paths because browsers/apps vary:
 *   - some engines scroll <html>, some <body>, some a wrapper
 *   - Safari/iOS sometimes ignores scrollTo({ behavior: 'instant' })
 *   - a layout-phase reset prevents the brief flash of the old scroll position
 *     before the new page paints
 *
 * If the URL has a #hash, we scroll to that element instead.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  // Run synchronously before the browser paints the new route → no jump/flash.
  useLayoutEffect(() => {
    if (hash) return;
    // Legacy 2-arg form works everywhere, including iOS Safari.
    try { window.scrollTo(0, 0); } catch (_) {}
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    // Any scroll container inside #root (for layouts that scroll internally).
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  }, [pathname, hash]);

  // After paint, if there's a hash target, snap to it. Also double-check scroll
  // in case images/fonts loaded and shifted layout.
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
    }
    try { window.scrollTo(0, 0); } catch (_) {}
  }, [pathname, hash]);

  return null;
}
