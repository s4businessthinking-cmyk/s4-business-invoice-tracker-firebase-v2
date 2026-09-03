# S4 Workshop ERP — Firebase Edition

কোনো backend/VPS নেই — প্রতি workshop/দোকানের ডেটা **সেই দোকানের Firebase**-এ।  
সফটওয়্যার **একই**; ইনস্টলের পর Firebase config paste (B1)।

Current release: **v1.0.11**  
https://github.com/s4businessthinking-cmyk/s4-business-invoice-tracker-firebase-v2/releases

## Architecture (single source of truth)

**সব product/module design শুধু এই ফাইল অনুযায়ী:**

**`S4_Workshop_ERP_A_to_Z_HTML_Architecture.html`** — repo root-এ browser-এ খুলুন।

এতে আছে: FULL MODE vs TOTAL MODE, Masters, Workshop, Purchase, Stock, Sales, Accounts, VAT, HR, Expenses, Assets, Reports, Security, UI/UX, end-to-end connections, build order, production acceptance।

পুরনো `ARCHITECTURE.md` সরানো হয়েছে — নতুন কাজ/মডিউল এই A–Z architecture-এর বিরুদ্ধে হবে।

## Install

| Platform | How |
|----------|-----|
| **Windows** | Release থেকে `S4-Invoice-Tracker-Setup-1.0.11.exe` → ইনস্টল |
| **Android** | `S4-Invoice-Tracker-1.0.11.apk` সাইডলোড (Unknown sources ON) |
| **iPhone PWA** | Safari-এ খুলুন: https://s4-business-thinking-31213.web.app → Share → **Add to Home Screen** |
| **PWA zip** | `S4-Invoice-Tracker-PWA-1.0.11.zip` — বিকল্প host (Firebase Hosting / Netlify / IIS) |

## Login / Firebase (platform — unchanged)

- B1 — একই app; ইনস্টলের পর দোকানের Firebase config paste  
- **Login/Setup:** Firebase Authentication **Email/Password**  
- **Email verification বাধ্যতামূলক** — verify না হলে active member নয় (`firestore.rules` → `isActiveMember()`)  
- Owner / Staff: Settings → Users & Roles → invite + invite code/QR  
- প্রতি দোকান = আলাদা Firebase project  

পুরনো: Google / Anonymous / client-side SHA-256 shop password — **বাদ**।

## Local test

```bash
cd frontend
python -m http.server 8080
```

Browser: `http://localhost:8080` → Firebase config paste → Create Account / Login।

## প্রতি নতুন দোকান

1. Firebase project + Email/Password ON + `firestore.rules` **Publish**  
2. সফটওয়্যার ইনস্টল → config paste (বা invite code)  
3. Owner account তৈরি → email verify → Login  
