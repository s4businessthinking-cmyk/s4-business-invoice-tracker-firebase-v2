# S4-BUSINESS INVOICE TRACKER — Firebase Edition

কোনো backend/VPS নেই — প্রতি দোকানের ডেটা **সেই দোকানের Firebase**-এ।  
সফটওয়্যার **একই**; ইনস্টলের পর Firebase config paste (B1)।

Current release: **v1.0.10**  
https://github.com/s4businessthinking-cmyk/s4-business-invoice-tracker-firebase-v2/releases

## Install

| Platform | How |
|----------|-----|
| **Windows** | Release থেকে `S4-Invoice-Tracker-Setup-1.0.10.exe` → ইনস্টল |
| **Android** | `S4-Invoice-Tracker-1.0.10.apk` সাইডলোড (Unknown sources ON) |
| **iPhone PWA** | Safari-এ খুলুন: https://s4-business-thinking-31213.web.app → Share → **Add to Home Screen** |
| **PWA zip** | `S4-Invoice-Tracker-PWA-1.0.10.zip` — বিকল্প host (Firebase Hosting / Netlify / IIS) |

## লকড Login / Firebase (ARCHITECTURE.md §০)

- B1 — একই app; ইনস্টলের পর দোকানের Firebase config paste  
- **Login/Setup যাচাই:** Firebase Authentication **Email/Password**  
- **Email verification বাধ্যতামূলক** — verify না হলে active member নয় (`firestore.rules` → `isActiveMember()`)  
- Owner / Staff: Settings → Users & Roles → invite + invite code/QR  
- প্রতি দোকান = আলাদা Firebase project  

পুরনো: Google / Anonymous / client-side SHA-256 shop password — **বাদ**।

বিস্তারিত: **`ARCHITECTURE.md`**

## Local test

```bash
cd frontend
python -m http.server 8080
```

Browser: `http://localhost:8080` → Firebase config paste → Create Account / Login।

## Features

1. Auto-update (exe + apk) via GitHub Releases  
2. Google Drive + local backup (Settings)  
3. PWA / iPhone Add to Home Screen  
4. Owner invite staff + module permissions  
5. Reports + CSV archive  

## প্রতি নতুন দোকান

1. Firebase project + Email/Password ON + `firestore.rules` **Publish**  
2. সফটওয়্যার ইনস্টল → config paste (বা invite code)  
3. Owner account তৈরি → email verify → Login  
