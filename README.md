# S4-BUSINESS INVOICE TRACKER — Firebase Edition

কোনো backend/VPS নেই — প্রতি দোকানের ডেটা **সেই দোকানের Firebase**-এ।  
সফটওয়্যার **একই**; ইনস্টলের পর Firebase config paste (B1)।

## লকড Login / Firebase (ARCHITECTURE.md §০)

- B1 — একই app; ইনস্টলের পর দোকানের Firebase config paste  
- Email + Password (যেকোনো email) + **email verification**  
- Owner: Create Account → verify → Login  
- Staff: owner invite → নিজের account → verify → Login  
- প্রতি দোকান = আলাদা Firebase project  

পুরনো: Google / Anonymous / SHA-256 shop password — **বাদ**।

বিস্তারিত: **`ARCHITECTURE.md`**

## Local test

```bash
cd frontend
python -m http.server 8080
```

Browser: `http://localhost:8080` → প্রথমবার Firebase config paste → Create Account / Login।

## আগের ফিচার (অপরিবর্তিত)

1. Auto-update (exe + apk)  
2. Google Drive backup (optional)  
3. PWA / iPhone install  
4. Staff name + activity log  
5. Monthly / Annual reports + CSV + due aging  

## প্রতি নতুন দোকান

1. Firebase project + Email/Password ON + `firestore.rules` Publish  
2. সফটওয়্যার ইনস্টল → config paste  
3. Owner account তৈরি → verify → Login  

(Optional) `update-config.js`, `drive-backup-config.js`, `desktop/package.json` — release/Drive এর জন্য।
