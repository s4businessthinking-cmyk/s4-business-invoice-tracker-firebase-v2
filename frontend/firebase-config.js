// ============================================================
// PER-SHOP FIREBASE CONFIG
// ============================================================
// প্রতিটা দোকানের জন্য আলাদা এই ফাইল বসাতে হবে, build/release করার আগে।
//
// কোথা থেকে পাবে:
// 1) https://console.firebase.google.com এ গিয়ে সেই দোকানের জন্য
//    নতুন Firebase Project খুলুন (দোকান মালিকের বা আপনার নিজের Gmail দিয়ে)
// 2) Project Settings → General → "Your apps" → Web app (</>) যোগ করুন
// 3) সেখানে যে firebaseConfig object দেখাবে, সেটা নিচে বসিয়ে দিন
// 4) Firestore Database চালু করুন (Build → Firestore Database → Create database)
// 5) Authentication চালু করুন → Sign-in method → Anonymous → Enable
// 6) Firestore Rules ট্যাবে গিয়ে ../firestore.rules এর কনটেন্ট বসিয়ে Publish করুন
//
// এই ফাইলটা GitHub-এ প্রতিটা শপ-বিল্ডের জন্য আলাদা থাকবে —
// মূল কোডের (index.html) সাথে কখনো কোনো দোকানের real key কমিট করবেন না
// public repo-তে। প্রতিটা শপ-বিল্ডের জন্য এই একটা ফাইল বদলে
// exe/apk বানাবেন।
// ============================================================

export const firebaseConfig = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
