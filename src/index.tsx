import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// React 18's createRoot, not the legacy ReactDOM.render this used to call --
// that API logs a hard deprecation error under React 18 and falls back to
// legacy mode. Deliberately NOT wrapped in <StrictMode>: it double-invokes
// effects in development, and react-wordcloud / react-chrono are not
// verified safe under that. Add it once those are checked.
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root not found in index.html');
}
createRoot(container).render(<App />);

// CRA shipped a serviceWorker.ts helper whose only live call here was
// unregister() (register() was never invoked, so this app never installed a
// service worker). That file depended on process.env, which Vite doesn't
// provide, so it's gone -- but the unregister is kept inline so any stale
// worker left over from an older deploy still gets torn down rather than
// serving cached assets indefinitely.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch(() => { /* no registration to remove */ });
}
