const CACHE='s4-invoice-v16-brand-cover';
const CORE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './tracker.css',
  './boot.js',
  './app.js',
  './theme.js',
  './firebase-config.js',
  './update-config.js',
  './update-checker.js',
  './drive-backup-config.js',
  './drive-backup.js',
  './local-backup.js',
  './doc-export.js',
  './license.js',
  './install-prompt.js',
  './auth.js',
  './staff.js',
  './activity-log.js',
  './reports.js',
  './splash.js',
  './branding/logo.png',
  './branding/logo-full.png',
  './branding/logo-full.jpg',
  './branding/background.jpg',
  './icons/favicon.ico',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', e=>e.waitUntil(
  caches.open(CACHE).then(c=>
    Promise.allSettled(CORE_ASSETS.map(u=>c.add(u).catch(()=>{})))
  )
));
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  // Never cache Firebase/Google network calls — those must always hit
  // the network (or fail fast so Firestore's own offline cache kicks in).
  if(e.request.url.includes('googleapis.com') || e.request.url.includes('gstatic.com')) return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
