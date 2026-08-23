# S4 Invoice Tracker — Desktop (exe) build + auto-update

## একবার সেটআপ (প্রথম শপ বিল্ডের আগে)

1. `package.json` এর `build.publish` এ `PASTE_GITHUB_OWNER` /
   `PASTE_GITHUB_REPO` বসান — যেই repo-তে release push হবে।
2. `../frontend/update-config.js` এ একই owner/repo বসান, এবং
   `currentVersion` কে এই `package.json` এর `"version"` এর সাথে
   হুবহু মিলিয়ে রাখুন (দুই জায়গায় ভার্সন আলাদা হলে infinite update
   loop বা ভুল detection হবে)।
3. `../frontend/firebase-config.js` এ সেই দোকানের real Firebase
   config বসান (এটা আলাদা এক-বারের কাজ, README.md এ ব্যাখ্যা আছে)।

## Local build (test)

```bash
cd desktop
npm install
npm run build
```

`desktop/release/` ফোল্ডারে `.exe` ইনস্টলার পাবেন।

## নতুন ভার্সন রিলিজ করা (auto-update পাঠানো)

1. `desktop/package.json` এর `"version"` বাড়ান (যেমন `1.0.0` →
   `1.0.1`)।
2. `../frontend/update-config.js` এর `currentVersion` একই ভ্যালুতে
   বাড়ান।
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
