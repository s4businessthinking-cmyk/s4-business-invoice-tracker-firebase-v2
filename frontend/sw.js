// CORE_ASSETS - keep every frontend/*.js module listed (except sw.js itself).
// In v1.0.4, license.js and doc-export.js were missing here ? blank screen on
// second offline launch (fixed in v1.0.6). Run: node scripts/check-sw-cache.js
// before cutting a release (see RELEASE.md).
const CACHE='s4-invoice-v177-pi-mobile';
const CORE_ASSETS=[
  './',
  './index.html',
  './manifest.webmanifest',
  './tracker.css',
  './boot-entry.js',
  './boot.js',
  './app.js',
  './theme.js',
  './firebase-config.js',
  './update-config.js',
  './update-checker.js',
  './drive-backup-config.js',
  './drive-backup.js',
  './local-backup.js',
  './file-delivery.js',
  './doc-export.js',
  './pdf-export.js',
  './vendor/jspdf.umd.min.js',
  './vendor/jspdf.plugin.autotable.min.js',
  './license.js',
  './install-prompt.js',
  './auth.js',
  './staff.js',
  './activity-log.js',
  './foundation.js',
  './masters.js',
  './inventory.js',
  './reports.js',
  './purchase.js',
  './grn.js',
  './po.js',
  './purchase-requisition.js',
  './purchase-return.js',
  './vendor-payment.js',
  './workshop.js',
  './product-master-bridge.js',
  './vendor/product-master/product-master.js',
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
self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>
      Promise.allSettled(CORE_ASSETS.map(u=>c.add(u).catch(()=>{})))
    )
  );
});
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=> self.clients.claim())
  );
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  // Never cache Firebase/Google network calls - those must always hit
  // the network (or fail fast so Firestore's own offline cache kicks in).
  if(e.request.url.includes('googleapis.com') || e.request.url.includes('gstatic.com')) return;
  e.respondWith(
    fetch(e.request).catch(()=>
      // ignoreSearch: ./app.js?v=67 must hit precached ./app.js (URL-exact match fails offline)
      caches.match(e.request, { ignoreSearch: true })
    )
  );
});
