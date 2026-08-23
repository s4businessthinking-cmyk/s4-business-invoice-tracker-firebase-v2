# S4-BUSINESS INVOICE TRACKER — Firebase Edition

আগের ভার্সন FastAPI + SQLite backend দিয়ে ছিল (VPS/server দরকার হতো)।
এই ভার্সনে কোনো backend/server নেই — সরাসরি Firebase (Firestore + Auth)
ব্যবহার করে, ঠিক তোমার main spare-parts app-এর মতোই।

## যা বদলেছে (আগের zip থেকে)

- `backend/` (FastAPI+SQLite) সম্পূর্ণ সরিয়ে ফেলা হয়েছে — আর দরকার নেই
- `frontend/index.html` এখন সরাসরি Firestore-এর সাথে কথা বলে
  (আগে যেটা `/api/...` কল করত)
- Login/Setup password যাচাই হয় client-side SHA-256 hash দিয়ে
  (Firestore-এর `shop/info` ডকুমেন্টে হ্যাশ রাখা থাকে) — Firebase
  auth account আলাদা এবং invisible (anonymous sign-in, silent)
- একজন invoice add/edit/delete করলে সাথে সাথে সব ডিভাইসে
  real-time দেখা যাবে (`onSnapshot` — polling নেই আর)
- Offline-first: Firestore-এর `persistentLocalCache` দিয়ে —
  internet ছাড়াই app 100% কাজ করবে, internet এলে auto-sync

## প্রতিটা নতুন দোকানের জন্য যা করতে হবে (একবার, তোমাকে)

1. `frontend/firebase-config.js` ফাইলটা খুলো — ভেতরে ধাপে ধাপে
   নির্দেশ লেখা আছে (নতুন Firebase project বানানো, Firestore +
   Anonymous Auth চালু করা, `firestore.rules` পেস্ট করা)
2. সেই দোকানের real config বসিয়ে exe/apk build করো
3. Build/release GitHub-এ push করো ওই দোকানের জন্য

## Local এ টেস্ট করার জন্য

`frontend/` ফোল্ডারটা যেকোনো static file server দিয়ে serve করতে হবে
(module import ব্যবহারের কারণে সরাসরি `file://` দিয়ে খুললে কাজ
করবে না — browser CORS/module policy আটকাবে)। যেমন:

```bash
cd frontend
python3 -m http.server 8080
```

তারপর ব্রাউজারে `http://localhost:8080` খুলো। প্রথমবার
`firebase-config.js`-এ real config বসানো না থাকলে "Firebase
সংযোগ পাওয়া যাচ্ছে না" মেসেজ দেখাবে — এটাই স্বাভাবিক, config
বসালেই ঠিক হয়ে যাবে।

## যা যোগ হলো (এই আপডেটে)

### ১) Auto-update system
- **exe**: `desktop/` — Electron shell + `electron-updater`, GitHub
  Releases থেকে চেক করে, native dialog দিয়ে ডাউনলোড/ইনস্টল প্রম্পট
  দেয়। বিস্তারিত: `desktop/README.md`
- **apk**: `frontend/update-checker.js` — GitHub Releases API চেক
  করে, নতুন ভার্সন থাকলে নিচে ব্যানার দেখায়, ট্যাপ করলে `.apk`
  ডাউনলোড হয়ে Android নিজেই install prompt দেখায় (sideload বলে
  silent auto-install সম্ভব না)। কনফিগ: `frontend/update-config.js`

### ২) Google Drive backup
- `frontend/drive-backup.js` + `frontend/drive-backup-config.js` —
  Google Identity Services দিয়ে sign-in (scope শুধু `drive.file`,
  তাই দোকান মালিকের Drive-এর বাকি ফাইল কখনো ছোঁয় না), Shop Info
  পেজে "☁️ ব্যাকআপ নিন" / "⬇️ রিস্টোর করুন" বাটন। Firebase-ই মূল
  ডেটাবেস থাকছে — এটা শুধু বাড়তি সেফটি কপি।

### ৩) iPhone/iPad PWA ইনস্টল ফ্লো
- Apple-specific meta tags + সঠিক আকারের (180×180) apple-touch-icon
- `frontend/install-prompt.js` — Android/Desktop-এ কাস্টম "📲 ইনস্টল
  করুন" বাটন (`beforeinstallprompt` ধরে), iOS Safari-এ "Share বাটনে
  চেপে Add to Home Screen করুন" নির্দেশনার ব্যানার (Apple
  `beforeinstallprompt` সাপোর্ট করে না বলে আলাদাভাবে দেখাতে হয়)

### ৪) Staff name (বাধ্যতামূলক) + Activity log
- `frontend/staff.js` — প্রতি device/session এ স্টাফের নাম; invoice
  add/edit/delete/clear-all এ validate
- Invoice-এ `createdBy` / `updatedBy` + card-এ দেখায়
- `frontend/activity-log.js` — Firestore `activity` collection (audit trail)
- Shop Info sheet-এ recent activity list

### ৫) মাসিক / বার্ষিক রিপোর্ট (৫ ধরন + extras)
- `frontend/reports.js` — Summary, By Customer, By Status, Collections,
  Outstanding + Staff-wise + Due aging
- Header-এ **📊 রিপোর্ট** বাটন → মাস/বছর বেছে preview → প্রিন্ট / CSV

### ৬) CSV export
- Reports sheet → **⬇️ CSV** (selected period invoices)

### ৭) Due aging
- Reports-এ unpaid invoice 0–30 / 31–60 / 61–90 / 90+ day buckets

### ৮) Mandatory staff validation
- Staff field empty থাকলে save/delete/clear block; login-এ prompt

**Architecture guide:** `ARCHITECTURE.md` (ZIP-এর সাথে handoff document)

## প্রতিটা নতুন দোকানের জন্য (per-shop config ফাইল — একবার করে)

- `frontend/firebase-config.js` — Firebase project keys
- `frontend/update-config.js` — GitHub owner/repo + বর্তমান ভার্সন
- `frontend/drive-backup-config.js` — Google OAuth Client ID
- `desktop/package.json` (শুধু exe বানালে) — GitHub owner/repo +
  ভার্সন, `desktop/README.md`-এ ধাপে ধাপে লেখা আছে
