# S4-BUSINESS-INVOICE TRACKER — Release v1.0.4

## Download

| Platform | File | Install |
|----------|------|---------|
| **Windows PC** | `S4-Invoice-Tracker-Setup-1.0.4.exe` | Run installer → desktop shortcut |
| **Android** | `S4-Invoice-Tracker-1.0.4.apk` | Download → Install (allow Unknown sources if asked) |
| **iPhone / iPad** | PWA (no App Store) | Safari → open hosted URL → Share → **Add to Home Screen** |

GitHub Releases: https://github.com/s4businessthinking-cmyk/s4-business-invoice-tracker-firebase-v2/releases

## Same account on PC + mobile (100% sync)

All devices use **the same Firebase project** + **same email/password**:

1. **First device (PC):** Install → paste shop Firebase config → Create/Login owner account.
2. **Mobile (APK or iPhone PWA):** Install → paste **the same Firebase config** → Login with **the same email + password**.
3. Data (invoices, customers, receipts) syncs via Firebase — same shop, same account everywhere.

> Firebase config is saved per device on first setup. Use the **exact same config** from Firebase Console on every phone/PC.

## iPhone install (Safari)

1. Open the app URL in **Safari** (not Chrome).
2. Tap **Share** (square with arrow).
3. Tap **Add to Home Screen**.
4. Open from home screen — works like an app.

## Auto-update

- **PC exe:** Opens app → checks GitHub Releases → download new `.exe` → restart to install.
- **Android APK:** In-app banner → tap → download new `.apk` → install over old.
- **iPhone PWA:** Safari cache — pull to refresh or re-open after server update.
