// ============================================================
// PER-SHOP / PER-BUILD UPDATE CONFIG
// ============================================================
// এই ফাইলটা firebase-config.js এর মতোই — প্রতিটা release build এর
// আগে এখানে current version এবং GitHub repo বসাতে হবে।
//
// - githubOwner / githubRepo: যেই GitHub repo-তে exe/apk এর release
//   push করা হবে (Releases ট্যাবে .exe এবং .apk ফাইল asset হিসেবে
//   attach থাকতে হবে, tag নাম হতে হবে "vX.Y.Z" ফরম্যাটে, যেমন v1.0.0)
// - currentVersion: এই বিল্ডের নিজের ভার্সন — desktop/package.json
//   এর "version" ফিল্ডের সাথে অবশ্যই মিলতে হবে, নইলে update loop হবে
// - exeAssetKeyword: GitHub release-এর asset ফাইলগুলোর মধ্যে কোনটা
//   .exe সেটা খুঁজে বের করার জন্য ফাইলনামের অংশ (যেমন "Setup" বা
//   ".exe" দিয়ে filter হবে, .exe সবসময় auto-match হয়)
// - apkAssetKeyword: .apk ফাইল খুঁজে বের করার জন্য (optional, .apk
//   auto-match হয়, আলাদা কিছু না দিলে প্রথম .apk asset নেবে)
// ============================================================

export const updateConfig = {
  githubOwner: "s4businessthinking-cmyk",
  githubRepo: "s4-business-invoice-tracker-firebase-v2",
  currentVersion: "1.0.3",
  exeAssetKeyword: "",
  apkAssetKeyword: ""
};
