# S4-BUSINESS INVOICE TRACKER — Architecture Guide (LOCKED)

> **লকড সিদ্ধান্ত (Aug 2026):** Login/Firebase = B1। **সফটওয়্যারের স্ক্রিন/মডিউল = `frontend/index.html` + `frontend/*.js`।**

**প্রোডাক্ট UI (লক):** `frontend/` — Dashboard, Customer Master, Ledger, Statements, Aging, Invoices, Credit/Debit Notes, Receipts, Payment Allocation, Cheque/PDC, Discounts, Vehicle Master, Reports, WhatsApp, Users & Roles, Audit, Settings, Backup।

---

## ০. যা লক — কাস্টমার / Login / Firebase

| # | নিয়ম | স্ট্যাটাস |
|---|--------|-----------|
| 1 | **B1** — সফটওয়্যার একই (এক `.exe` / APK); ইনস্টলের পর সেই দোকানের Firebase **config paste** | LOCKED |
| 2 | **Email + Password** — যেকোনো personal email (শুধু Gmail নয়) | LOCKED |
| 3 | **Email verification** — link ছাড়া app-এ ঢোকা যাবে না | LOCKED |
| 4 | **Owner** — Create Account → inbox verify → Login | LOCKED |
| 5 | **Staff** — owner invite → নিজের email/password → verify → Login | LOCKED |
| 6 | **ডেটা Firebase-এ** — **প্রতি দোকান = আলাদা Firebase project** (মিক্স হয় না) | LOCKED |

### যা Login থেকে বাদ (আর ফিরবে না)

- Google Sign-In  
- Anonymous Auth  
- Shop password SHA-256 hash  
- Build-এর আগে `firebase-config.js`-এ keys লিখে প্রতি দোকানের আলাদা binary  

### যা Login বাদে আগের মতোই থাকবে

Invoice CRUD, payment (Edit → Paid Tk), reports, CSV, due aging, staff name on invoices, activity log, Google Drive backup, PWA/iPhone install, auto-update (exe/apk) — **অপরিবর্তিত**।

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
│  Firebase Project (প্রতি দোকান = আলাদা project) — B1       │
│  • shop/info        — দোকানের তথ্য + ownerUid/ownerEmail    │
│  • members/{uid}    — owner / staff accounts                │
│  • invites/{id}     — pending staff invites                 │
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

**কোনো VPS/backend server নেই।** সব ডেটা সেই দোকানের Firebase Firestore-এ;  
app offline-first (IndexedDB persistence; desktop falls back to memory if persistence fails) + online হলে real-time sync।

**একই সফটওয়্যার → আলাদা দোকান = আলাদা Firebase** (config paste দিয়ে জোড়া)।

### License / trial / pending setup
- `frontend/license.js` — ECDSA P-256 verify (public JWK baked in); offline trial + paid license gate
- `s4-license-generator/` — signs licenses with **private** JWK (gitignored); never ship private keys
- `pendingSetups/{uid}` — owner/staff signup snapshot before email verify; completed after verify → `shop` + `members`
- License `appId` (`com.s4.invoice.tracker`) is intentional and separate from Electron/Android package id
- `maxDevices` is stored on the payload; binding is device-fingerprint based (no online device registry)

---

## ২. ফোল্ডার স্ট্রাকচার

```
S4-BUSINESS-INVOICE-TRACKER-firebase-v2/
├── ARCHITECTURE.md          ← এই ফাইল (লকড সিদ্ধান্ত)
├── README.md                ← quick start
├── firestore.rules          ← প্রতি দোকানের Console-এ paste → Publish
├── firebase.json / .firebaserc
├── s4-license-generator/    ← offline license signing (private keys local only)
├── releases/                ← electron-builder publish artifacts
│
├── frontend/
│   ├── index.html           ← UI + Firestore + auth screens
│   ├── auth.js              ← Email/Password + verify + owner/staff
│   ├── license.js           ← trial / license verify (fail-closed)
│   ├── firebase-config.js   ← B1: load/save/parse pasted config (keys ফাইলে নয়)
│   ├── splash.js            ← loading splash
│   ├── update-config.js     ← GitHub repo + version (release)
│   ├── drive-backup-config.js ← Google OAuth Client ID (optional)
│   ├── staff.js             ← invoice staff name session
│   ├── activity-log.js
│   ├── reports.js
│   ├── update-checker.js
│   ├── drive-backup.js
│   ├── install-prompt.js
│   ├── boot.js / boot-entry.js
│   ├── pdf-export.js / file-delivery.js / local-backup.js
│   ├── doc-export.js
│   ├── sw.js / manifest / icons /
│   └── branding/            ← logo + login background
│
├── desktop/                 ← Windows .exe
│   ├── main.js              ← Electron + userData-এ Firebase config সেভ
│   ├── preload.js           ← s4Desktop + config IPC
│   ├── package.json
│   └── README.md
│
└── mobile/                  ← Capacitor APK (optional)
```

---

## ৩. Feature map (আগের numbered list — অপরিবর্তিত)

| # | Feature | Status | ফাইল / নোট |
|---|---------|--------|-------------|
| 1 | Multi-branch | **Skipped** | — |
| 2 | Auto-update (exe + apk) | **Done** | `desktop/`, `update-checker.js`, `update-config.js` |
| 3 | Google Drive backup | **Done** | `drive-backup.js` — Firebase-ই main DB |
| 4 | PWA / iPhone install | **Done** | `install-prompt.js`, Apple meta tags, icons |
| 5 | Monthly + Annual reports | **Done** | `reports.js` |
| 6 | CSV export | **Done** | Reports → CSV |
| 7 | Due aging report | **Done** | 0–30 / 31–60 / 61–90 / 90+ |
| 8 | Mandatory staff name | **Done** | `staff.js` — invoice add/edit/delete |

### Staff tracking (#8 + invoice metadata) — আগের মতো

- Header **👤 স্টাফ** badge  
- Invoice form Staff Name *  
- Fields: `createdBy`, `updatedBy`, `createdAt`, `updatedAt`  
- `activity` log: add / edit / delete / clear_all  

---

## ৪. Firebase data model

### `shop/info`

```json
{
  "name": "GOLDEN LINK AUTO SPARE PARTS LLC",
  "addr": "...",
  "phone": "...",
  "ownerUid": "<firebase uid>",
  "ownerEmail": "owner@email.com",
  "createdAt": 1710000000000
}
```

### `members/{uid}`

```json
{
  "uid": "...",
  "email": "owner@email.com",
  "displayName": "MOHAMMAD FAISAL",
  "role": "owner|staff",
  "status": "active|removed",
  "joinedAt": 1710000000000
}
```

### `invites/{id}` (staff)

```json
{
  "email": "staff@email.com",
  "displayName": "Rahim",
  "role": "staff",
  "status": "pending|accepted",
  "invitedBy": "<owner uid>",
  "createdAt": 1710000000000
}
```

### `customers/{id}` · `vehicles/{id}` · `productCatalog/{id}` · `serviceCatalog/{id}` · `receipts/{id}` · notes/cheques/discounts

`frontend/index.html` + modules — Customer Master, Vehicle Master, Product/Service Catalog, Receipt + allocation। Invoice field `vehicle` (plain string plate/description), `items[]`, `dueDate`, `paid`, `credited`, `total`।

```json
{
  "customer": "...",
  "vehicle": "...",
  "invNo": "...",
  "invDate": "2026-08-01",
  "paidDate": "2026-08-10",
  "total": 15000,
  "paid": 10000,
  "credited": 0,
  "notes": "",
  "createdBy": "Rahim",
  "updatedBy": "Karim",
  "createdAt": 1710000000000,
  "updatedAt": 1710000000000
}
```

`productCatalog`: `name`, `code`, `price`, `vat`, `category`.  
`serviceCatalog`: `name` (description), `price`, `vat`, `category` (no part number).  
Debit notes linked to an invoice raise that invoice's `total`; unlinked debit notes count in ledger + Current aging.

### `activity/{id}` — আগের মতো

```json
{
  "action": "add|edit|delete|clear_all",
  "staffName": "Rahim",
  "invoiceId": "...",
  "customer": "...",
  "summary": "...",
  "at": 1710000000000
}
```

**Rules:** `firestore.rules` → Console → Publish।  
Active member = signed-in + `email_verified` + `members/{uid}` status `active`।

---

## ৫. Per-shop setup (B1 — নতুন দোকান)

### আপনি (developer / installer)

1. সেই দোকানের **নতুন Firebase project**  
2. Authentication → **Email/Password ON** (Anonymous OFF, Google লাগবে না)  
3. Firestore create  
4. `firestore.rules` paste → **Publish**  
5. Authorized domains → `localhost` (প্রয়োজনমতো)  
6. Web app config **কপি**  

### কাস্টমারের PC-তে (ইনস্টলের পর)

1. একই সফটওয়্যার ইনস্টল  
2. প্রথম স্ক্রিনে **Firebase config paste** → সংযুক্ত  
3. Owner **Create Account** → inbox verification link  
4. **Login**  

Config সেভ: Desktop → Electron `userData`; Browser/PWA → `localStorage`।  
প্রতি দোকানের জন্য নতুন `.exe` build **লাগে না**।

Local test:

```bash
cd frontend
python -m http.server 8080
# http://localhost:8080
```

---

## ৬. Build & distribute — আগের মতো

### PWA / hosted web
- `frontend/` HTTPS-এ host  
- Drive OAuth-এ origin add  

### Android APK
- `mobile/` Capacitor / WebView wrap  
- GitHub Release-এ `.apk`  

### Windows .exe
```bash
cd desktop
npm install
npm run build
npm run release
```

**Version sync:** `desktop/package.json` `"version"` === `frontend/update-config.js` `currentVersion`

---

## ৭. Module wiring

```
index.html
  ├── firebase-config.js     → resolve / paste / save config (B1)
  ├── auth.js                → Email/Password + verify + invite
  ├── splash.js              → loading
  ├── staff.js               → invoice staff name
  ├── activity-log.js
  ├── reports.js
  ├── drive-backup.js
  ├── update-checker.js      → skips if window.s4Desktop
  └── install-prompt.js

desktop/preload.js  → s4Desktop + load/save/clear Firebase config
desktop/main.js     → localhost static server + userData config file + updater
```

---

## ৮. Security (লকড)

- Auth = **Email/Password** only; **email must be verified** before login accepted  
- Firestore = verified + active `members` only; owner-only shop update / invites  
- প্রতি দোকান আলাদা Firebase project → ডেটা আলাদা  
- Drive scope = `drive.file` only  
- Invoice staff name = accountability (অ্যাকাউন্ট Auth আলাদা)

---

## ৯. Troubleshooting

| সমস্যা | সমাধান |
|--------|---------|
| Config paste স্ক্রিন | ইনস্টলের পর প্রথম ধাপ — Web config paste করুন |
| `auth/configuration-not-found` | Console → Authentication → Email/Password ON |
| `auth/unauthorized-domain` | Authorized domains-এ `localhost` / `127.0.0.1` |
| EMAIL_NOT_VERIFIED | Inbox → verification link → তারপর Login |
| Drive backup fail on exe | Google Cloud OAuth client-এ redirect URI যোগ করুন: `http://127.0.0.1:8765/oauth2redirect` (Electron loopback). Client ID Settings → Backup-এ paste। |
| Update banner না আসে | `update-config.js` owner/repo/version |
| Activity খালি | `firestore.rules` Publish? |

---

## ১০. Handoff checklist

- [ ] দোকানের Firebase project + Email/Password ON  
- [ ] `firestore.rules` Published  
- [ ] সফটওয়্যার ইনস্টল → config paste → সংযুক্ত  
- [ ] Owner Create Account → verify → Login  
- [ ] Test: invoice + staff name + activity  
- [ ] Test: Reports + CSV  
- [ ] (Optional) Drive / update configs  

**Locked architecture:** B1 + Email/Password + Verify + Owner/Staff · Data per-shop Firebase · Rest of app unchanged (Aug 2026)
