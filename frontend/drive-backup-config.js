// ============================================================
// PER-SHOP GOOGLE DRIVE BACKUP CONFIG
// ============================================================
// firebase-config.js এর মতোই — প্রতিটা shop build এ এখানে Google
// OAuth Client ID বসাতে হবে (Firebase-এর পাশাপাশি একটা extra safety
// backup layer, দোকানের নিজের Google Drive এ JSON ব্যাকআপ জমা রাখার
// জন্য)।
//
// কোথা থেকে পাবে:
// 1) https://console.cloud.google.com এ যান, Firebase project-টাই
//    এখানে auto-listed থাকবে (Firebase আর Google Cloud project একই)
// 2) APIs & Services → Library → "Google Drive API" সার্চ করে Enable
//    করুন
// 3) APIs & Services → Credentials → "+ CREATE CREDENTIALS" →
//    OAuth client ID → Application type: "Web application"
// 4) Authorized JavaScript origins এ app যেখান থেকে চলবে সেই origin
//    যোগ করুন (যেমন https://yourdomain.com, এবং Electron/local test
//    এর জন্য http://localhost:8080)
// 5) তৈরি হওয়া Client ID (…apps.googleusercontent.com দিয়ে শেষ হয়)
//    নিচে বসিয়ে দিন
//
// scope শুধু "drive.file" — মানে এই app যেসব ফাইল নিজে তৈরি করেছে
// শুধু সেগুলোতেই access থাকবে, দোকান মালিকের Drive এর অন্য কোনো
// ফাইল কখনো দেখতে/ছুঁতে পারবে না।
// ============================================================

// Runtime: Backup page এ Client ID paste করে Save করা যায়
// (localStorage key: s4_drive_client_id_v1) — নিচের placeholder-এর
// বদলে সেটা ব্যবহার হবে। অথবা এখানে সরাসরি বসান।
//
export const driveBackupConfig = {
  googleClientId: "PASTE_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com"
};
