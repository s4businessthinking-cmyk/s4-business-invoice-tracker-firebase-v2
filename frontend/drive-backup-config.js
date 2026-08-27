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
//    OAuth client ID
//
// Desktop (.exe) — Application type: "Desktop app" (preferred), অথবা
//    "Web application" with Authorized redirect URI:
//      http://127.0.0.1:8765/oauth2redirect
//    (Electron loopback server এই exact URI ব্যবহার করে)
//
// Android (.apk) — same Client ID can work as "Web application" IF you
//    also add this Authorized redirect URI (REQUIRED once in Console):
//      com.s4business.invoicetracker:/oauth2redirect
//    Without this URI registered, Android Drive backup will fail at
//    Google's redirect step even though the in-app code is correct.
//
// Browser / PWA — Application type: "Web application" with Authorized
//    JavaScript origins (e.g. https://your-hosting.web.app) — existing
//    GIS popup flow, no redirect URI needed for token client.
//
// 4) তৈরি হওয়া Client ID (…apps.googleusercontent.com দিয়ে শেষ হয়)
//    নিচে বসিয়ে দিন (অথবা Backup page এ paste করে Save করুন)
//
// scope শুধু "drive.file" — মানে এই app যেসব ফাইল নিজে তৈরি করেছে
// শুধু সেগুলোতেই access থাকবে।
// ============================================================

export const driveBackupConfig = {
  googleClientId: "PASTE_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com",
  // OWNER ACTION (Google Cloud Console → OAuth client → Authorized redirect URIs):
  // add this exact value for Android Custom Tabs PKCE flow to work:
  androidRedirectUri: "com.s4business.invoicetracker:/oauth2redirect",
  // Desktop Electron loopback (also add in Console if using Web client type):
  desktopRedirectUri: "http://127.0.0.1:8765/oauth2redirect"
};
