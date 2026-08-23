// ============================================================
// S4 INVOICE TRACKER — Electron desktop shell (main process)
// ------------------------------------------------------------
// এই ফাইলে কোনো shop-specific কিছু নেই, সব shop-build একই main.js
// ব্যবহার করে। Firebase config frontend/firebase-config.js থেকে
// আসে, GitHub owner/repo package.json এর build.publish থেকে আসে।
// ============================================================
const { app, BrowserWindow, dialog, Menu, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

log.transports.file.level = "info";
autoUpdater.logger = log;
autoUpdater.autoDownload = false; // ইউজারকে জিজ্ঞেস করেই ডাউনলোড শুরু হবে
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow = null;
const isDev = !app.isPackaged;

function frontendIndexPath(){
  // dev: desktop/ থেকে ../frontend | packaged: asar-এর ভিতর frontend/
  const rel = isDev
    ? path.join(__dirname, "..", "frontend", "index.html")
    : path.join(__dirname, "frontend", "index.html");
  return rel;
}

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: "#f6f3ec",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadFile(frontendIndexPath());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if(isDev){
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function checkForUpdatesSilently(){
  if(isDev) return; // dev/unpacked অবস্থায় GitHub feed চেক করার দরকার নেই
  autoUpdater.checkForUpdates().catch(err => log.error("update check failed", err));
}

autoUpdater.on("update-available", (info) => {
  dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["এখনই ডাউনলোড করুন", "পরে"],
    defaultId: 0,
    cancelId: 1,
    title: "নতুন আপডেট পাওয়া গেছে",
    message: `নতুন ভার্সন v${info.version} পাওয়া গেছে।`,
    detail: "ডাউনলোড শেষ হলে অ্যাপ রিস্টার্ট করে ইনস্টল করার অপশন দেখাবে।"
  }).then(result => {
    if(result.response === 0){
      autoUpdater.downloadUpdate().catch(err => log.error("download failed", err));
    }
  });
});

autoUpdater.on("update-not-available", () => {
  log.info("no update available");
});

autoUpdater.on("error", (err) => {
  log.error("autoUpdater error", err);
});

autoUpdater.on("download-progress", (progress) => {
  if(mainWindow){
    mainWindow.setTitle(`S4 Invoice Tracker — ডাউনলোড হচ্ছে ${Math.round(progress.percent)}%`);
  }
});

autoUpdater.on("update-downloaded", (info) => {
  if(mainWindow){
    mainWindow.setTitle("S4 Invoice Tracker");
  }
  dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["এখনই রিস্টার্ট করুন", "পরে (পরের বার বন্ধ করলে ইনস্টল হবে)"],
    defaultId: 0,
    cancelId: 1,
    title: "আপডেট ডাউনলোড সম্পন্ন",
    message: `v${info.version} ইনস্টলের জন্য প্রস্তুত।`
  }).then(result => {
    if(result.response === 0){
      autoUpdater.quitAndInstall();
    }
  });
});

app.whenReady().then(() => {
  createWindow();
  checkForUpdatesSilently();
  setInterval(checkForUpdatesSilently, 4 * 60 * 60 * 1000); // প্রতি ৪ ঘণ্টায়

  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if(process.platform !== "darwin") app.quit();
});
