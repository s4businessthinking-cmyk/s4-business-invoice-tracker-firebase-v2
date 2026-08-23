# S4-BUSINESS INVOICE TRACKER — Architecture Guide

> এই ডকুমেন্টটা ZIP পাওয়া যে কেউ (developer / shop owner) পড়লে বুঝতে
> পারবে **প্রজেক্টটা কীভাবে কাজ করে**, কোথায় কী বসাতে হয়, আর নতুন
> দোকানের build কীভাবে বের করতে হয়।

---

## ১. সংক্ষিপ্ত ধারণা

```
┌─────────────────────────────────────────────────────────────┐
│  User devices (Phone PWA / Browser / Windows .exe)          │
│  frontend/index.html + JS modules                           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Firebase SDK (Firestore + Auth)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Firebase Project (প্রতি দোকান = আলাদা project)             │
│  • shop/info        — দোকানের তথ্য + password hash          │
│  • invoices/*       — সব invoice রেকর্ড                     │
│  • activity/*       — staff audit log (append-only)         │
└───────────────────────────┬─────────────────────────────────┘
                            │ optional extra safety
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Google Drive (drive.file scope) — JSON backup snapshots    │
└─────────────────────────────────────────────────────────────┘

Auto-update path (optional):
  GitHub Releases ← electron-updater (.exe) / update-checker.js (.apk banner)
```

**কোনো VPS/backend server নেই।** সব ডেটা Firebase Firestore-এ; app offline-
first (local cache) + online হলে real-time sync।

---

## ২. ফোল্ডার স্ট্রাকচার

```
S4-BUSINESS-INVOICE-TRACKER-firebase-v2/
├── ARCHITECTURE.md          ← এই ফাইল (পুরো সিস্টেম ব্যাখ্যা)
├── README.md                ← quick start
├── firestore.rules          ← Firebase Console-এ paste করতে হবে
│
├── frontend/                ← মূল app (PWA + APK WebView + exe ভিতর)
│   ├── index.html           ← UI + Firestore logic (main entry)
│   ├── firebase-config.js   ← PER-SHOP: Firebase keys
│   ├── update-config.js     ← PER-SHOP: GitHub repo + version
│   ├── drive-backup-config.js ← PER-SHOP: Google OAuth Client ID
│   ├── staff.js             ← mandatory staff name session
│   ├── activity-log.js      ← Firestore audit trail
│   ├── reports.js           ← monthly/annual reports + CSV + aging
│   ├── update-checker.js    ← APK/web update banner
│   ├── drive-backup.js      ← Google Drive JSON backup
│   ├── install-prompt.js    ← PWA install (Android/iOS)
│   ├── sw.js                ← service worker (offline shell)
│   ├── manifest.webmanifest
│   └── icons/               ← PWA icons (180/192/512)
│
└── desktop/                 ← Windows .exe shell (optional)
    ├── main.js              ← Electron + electron-updater
    ├── preload.js
    ├── package.json         ← PER-SHOP: GitHub publish + version
    ├── build/icon.ico
    └── README.md            ← exe build + release steps
```

---

## ৩. Feature map (আপনার numbered list)

| # | Feature | Status | ফাইল / নোট |
|---|---------|--------|-------------|
| 1 | Multi-branch | **Skipped** (এখন লাগবে না) | — |
| 2 | Auto-update (exe + apk) | **Done** | `desktop/`, `update-checker.js`, `update-config.js` |
| 3 | Google Drive backup | **Done** | `drive-backup.js` — Firebase-ই main DB |
| 4 | PWA / iPhone install | **Done** | `install-prompt.js`, Apple meta tags, icons |
| 5 | Monthly + Annual reports (৫ ধরন) | **Done** | `reports.js` — summary, customer, status, collections, outstanding + staff + aging |
| 6 | CSV export | **Done** | Reports sheet → ⬇️ CSV |
| 7 | Due aging report | **Done** | Reports → section 7 (0–30 / 31–60 / 61–90 / 90+ days) |
| 8 | Mandatory staff name | **Done** | `staff.js` — add/edit/delete/clear-all এ বাধ্যতামূলক |

### Staff tracking (#8 + invoice metadata)

- Header-এ **👤 স্টাফ: নাম** badge — tap করে বদলানো যায়
- Invoice form-এ **Staff Name *** field (save এর আগে validate)
- Firestore invoice fields: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- Card-এ staff name দেখায়
- `activity` collection-এ log: add / edit / delete / clear_all

---

## ৪. Firebase data model

### `shop/info` (single document)

```json
{
  "name": "Modern Auto Care",
  "addr": "Mirpur, Dhaka",
  "phone": "01XXXXXXXXX",
  "passwordHash": "<sha256 hex>",
  "createdAt": 1710000000000
}
```

Login: client-side password → SHA-256 → hash compare (Firebase Auth = anonymous, invisible).

### `invoices/{id}`

```json
{
  "customer": "Modern Technica",
  "car": "Toyota Premio",
  "invNo": "INV-2026-001",
  "invDate": "2026-08-01",
  "paidDate": "2026-08-10",
  "total": 15000,
  "paid": 10000,
  "notes": "",
  "createdBy": "Rahim",
  "updatedBy": "Karim",
  "createdAt": 1710000000000,
  "updatedAt": 1710000000000
}
```

### `activity/{id}` (append-only audit)

```json
{
  "action": "add|edit|delete|clear_all",
  "staffName": "Rahim",
  "invoiceId": "...",
  "customer": "...",
  "summary": "ইনভয়েস যোগ INV-001",
  "at": 1710000000000
}
```

**Rules:** `firestore.rules` Firebase Console → Firestore → Rules → paste → Publish.

---

## ৫. Per-shop setup (নতুন দোকান — একবার)

1. **Firebase project** বানান → Firestore + Anonymous Auth চালু
2. `frontend/firebase-config.js` — real config বসান
3. `firestore.rules` paste করে Publish
4. (Optional) `frontend/update-config.js` — GitHub owner/repo + `currentVersion`
5. (Optional) `frontend/drive-backup-config.js` — Google OAuth Client ID
6. (Optional exe) `desktop/package.json` → `build.publish` owner/repo + version sync

Local test:

```bash
cd frontend
python -m http.server 8080
# browser: http://localhost:8080
```

---

## ৬. Build & distribute

### PWA / hosted web
- `frontend/` folder HTTPS-এ host করুন (Firebase Hosting / Cloudflare / VPS static)
- Drive backup OAuth-এ hosted origin add করুন

### Android APK (sideload)
- WebView/Capacitor shell দিয়ে `frontend/` wrap করুন
- GitHub Release-এ `.apk` attach করুন (tag `vX.Y.Z`)
- `update-checker.js` banner দেখাবে → tap → download → Android install prompt

### Windows .exe
```bash
cd desktop
npm install
npm run build          # test
npm run release        # GH_TOKEN দিয়ে GitHub Release
```
বিস্তারিত: `desktop/README.md`

**Version sync:** `desktop/package.json` `"version"` === `frontend/update-config.js` `currentVersion`

---

## ৭. Module wiring (কী কাকে call করে)

```
index.html
  ├── firebase-config.js     → Firebase init
  ├── staff.js               → getStaffName / requireStaffName
  ├── activity-log.js        → logActivity / subscribeRecentActivity
  ├── reports.js             → buildReportBundle / CSV
  ├── drive-backup.js        → backupToDrive / restore
  ├── update-checker.js      → GitHub release check (skips if window.s4Desktop)
  └── install-prompt.js      → PWA banners

desktop/preload.js           → window.s4Desktop = { platform: "desktop" }
desktop/main.js              → load frontend/index.html + electron-updater
```

---

## ৮. Security notes

- Shop password = SHA-256 hash in Firestore (not plain text)
- Firebase Auth = anonymous (per device session)
- Firestore rules = any signed-in user can read/write (single-shop project model)
- Drive scope = `drive.file` only (app-created files)
- Staff name = accountability layer (not cryptographic auth)

---

## ৯. Troubleshooting

| সমস্যা | সমাধান |
|--------|---------|
| Firebase connect error | `firebase-config.js` real keys? Anonymous Auth on? |
| Drive backup fail on exe | OAuth needs HTTPS origin — use hosted PWA, not file:// |
| Update banner না আসে | GitHub repo public? `update-config.js` owner/repo/version? |
| Activity log empty | `firestore.rules`-এ activity collection add করেছেন? Publish? |
| SW install fail | `frontend/icons/` files exist? `sw.js` v4 cache |

---

## ১০. Contact / handoff checklist

ZIP পাওয়া developer-এর জন্য:

- [ ] Firebase project + rules deployed
- [ ] `firebase-config.js` filled
- [ ] Icons present in `frontend/icons/`
- [ ] (Optional) update + drive configs filled
- [ ] Test: add invoice with staff name → see on card + activity log
- [ ] Test: Reports → monthly + CSV download
- [ ] (Optional) exe build from `desktop/`

**Version:** Firebase Edition v2 — reports + staff + audit (Aug 2026)
