import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { enableContentProtection } from './lib/protect.js';
import './styles/index.css';

// Content protection: right-click, copy, DevTools detection.
// Phones and addresses remain copyable via `.copyable` class on those elements.
enableContentProtection();

// Browsers try to restore scroll across navigations; we handle it ourselves
// via <ScrollToTop /> so route changes always start at the top.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <App />
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Cairo' } }} />
    </BrowserRouter>
  </React.StrictMode>
);

// Register the service worker (enables PWA install + APK/TWA wrapping)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
