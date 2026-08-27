# S4 Invoice Tracker — Desktop (exe) build + auto-update

## একবার সেটআপ (প্রথম বিল্ডের আগে)

1. `package.json` → `build.publish` এ GitHub `owner` / `repo` আছে কিনা চেক করুন
   (বর্তমান: `s4businessthinking-cmyk` / `s4-business-invoice-tracker-firebase-v2`)।
2. `../frontend/update-config.js` এ একই owner/repo এবং
   `currentVersion` = এই `package.json` এর `"version"` (এখন `1.0.10`)।
   দুই জায়গায় ভার্সন আলাদা হলে update detection ভুল হবে।

**Firebase config ফাইলে bake করবেন না (B1)।**  
Customer ইনস্টলের পর Settings/Auth স্ক্রিনে নিজের Firebase Web config paste করে।  
`frontend/firebase-config.js` শুধু paste/parse/storage helper — shop keys সেখানে লেখা হয় না।

## Local build (test)

```bash
cd desktop
npm install
npm run build
```

`desktop/release/` ফোল্ডারে `.exe` ইনস্টলার পাবেন।

## নতুন ভার্সন রিলিজ করা (auto-update পাঠানো)

1. `desktop/package.json` এর `"version"` বাড়ান (যেমন `1.0.10` → `1.0.11`)।
2. `../frontend/update-config.js` এর `currentVersion` একই ভ্যালুতে বাড়ান।
3. GitHub-এ push করুন।
4. একটা GitHub Personal Access Token (repo scope) লাগবে —
   টার্মিনালে `GH_TOKEN` environment variable হিসেবে সেট করুন:
   ```bash
   set GH_TOKEN=ghp_xxxxxxxxxxxx   (Windows cmd)
   $env:GH_TOKEN="ghp_xxxxxxxxxxxx"   (PowerShell)
   ```
5. চালান:
   ```bash
   npm run release
   ```
   এটা build করবে এবং GitHub Releases-এ tag `vX.Y.Z` বানিয়ে `.exe`
   + `latest.yml` upload করে দেবে। যাদের কাছে আগের ভার্সন ইনস্টল
   আছে, তারা অ্যাপ চালু করলে (বা প্রতি ৪ ঘণ্টায়) স্বয়ংক্রিয়ভাবে
   নতুন ভার্সন দেখতে পাবে, ডাউনলোড শেষে রিস্টার্ট করলেই ইনস্টল
   হয়ে যাবে — কিছু manually পাঠাতে হবে না।

## APK এর জন্য

APK sideloaded (Play Store এ নেই) বলে Android-এ silent auto-install
সম্ভব না — একই GitHub release-এ `.apk` ফাইলটাও asset হিসেবে
attach করে দিলেই হবে (নাম যেন `.apk` দিয়ে শেষ হয়)। ফোনে অ্যাপ খুললে
`../frontend/update-checker.js` GitHub থেকে চেক করে, নতুন ভার্সন
পেলে নিচে ব্যানার দেখাবে — ট্যাপ করলে `.apk` ব্রাউজারে ডাউনলোড হয়ে
Android নিজেই "Install" prompt দেখাবে (প্রথমবার "Unknown sources"
পারমিশন চাইতে পারে, এটা Android এর normal security flow)।
