// ============================================================
// S4 INVOICE TRACKER — Electron desktop shell (main process)
// ============================================================
const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const url = require("url");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

function firebaseConfigPath(){
  return path.join(app.getPath("userData"), "firebase-config.json");
}

/** Survives typical per-user uninstall better than only userData */
function sharedDataDir(){
  if(process.platform === "win32" && process.env.PROGRAMDATA){
    return path.join(process.env.PROGRAMDATA, "S4-Invoice-Tracker");
  }
  return path.join(app.getPath("appData"), "S4-Invoice-Tracker-Shared");
}

function sharedFile(name){
  return path.join(sharedDataDir(), name);
}

function readJsonFile(p){
  try{
    if(!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }catch{
    return null;
  }
}

function writeJsonFile(p, data){
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  return true;
}

function readWindowsMachineGuid(){
  try{
    const { execSync } = require("child_process");
    const out = execSync(
      'powershell -NoProfile -Command "(Get-ItemProperty -Path \'HKLM:\\SOFTWARE\\Microsoft\\Cryptography\').MachineGuid"',
      { encoding: "utf8", windowsHide: true, timeout: 8000 }
    );
    const guid = String(out || "").trim();
    if(guid && guid.length >= 8) return guid;
  }catch(err){
    log.warn("MachineGuid read failed", err?.message || err);
  }
  try{
    const os = require("os");
    return ["fallback", os.hostname(), os.arch(), os.platform()].join(":");
  }catch{
    return "fallback-unknown";
  }
}

function readFirebaseConfigFile(){
  try{
    const p = firebaseConfigPath();
    if(!fs.existsSync(p)) return null;
    const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
    if(!cfg?.apiKey || String(cfg.apiKey).includes("PASTE_")) return null;
    return cfg;
  }catch(err){
    log.error("read firebase-config failed", err);
    return null;
  }
}

function writeFirebaseConfigFile(cfg){
  const p = firebaseConfigPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
  return true;
}

function clearFirebaseConfigFile(){
  const p = firebaseConfigPath();
  if(fs.existsSync(p)) fs.unlinkSync(p);
  return true;
}

ipcMain.handle("s4:load-firebase-config", () => readFirebaseConfigFile());
ipcMain.handle("s4:save-firebase-config", (_e, cfg) => {
  writeFirebaseConfigFile(cfg);
  return true;
});
ipcMain.handle("s4:clear-firebase-config", () => {
  clearFirebaseConfigFile();
  return true;
});
ipcMain.handle("s4:get-machine-id", () => readWindowsMachineGuid());
ipcMain.handle("s4:load-trial-record", () => {
  return readJsonFile(sharedFile("trial.json")) || readJsonFile(path.join(app.getPath("userData"), "trial.json"));
});
ipcMain.handle("s4:save-trial-record", (_e, record) => {
  writeJsonFile(sharedFile("trial.json"), record);
  writeJsonFile(path.join(app.getPath("userData"), "trial.json"), record);
  return true;
});
ipcMain.handle("s4:load-license-record", () => {
  return readJsonFile(sharedFile("license.json")) || readJsonFile(path.join(app.getPath("userData"), "license.json"));
});
ipcMain.handle("s4:save-license-record", (_e, record) => {
  writeJsonFile(sharedFile("license.json"), record);
  writeJsonFile(path.join(app.getPath("userData"), "license.json"), record);
  return true;
});
ipcMain.handle("s4:save-local-backup", (_e, payload) => {
  const filename = String(payload?.filename || `backup-${Date.now()}.json`).replace(/[<>:"/\\|?*]/g, "_");
  const jsonText = String(payload?.jsonText || "{}");
  const dir = path.join(app.getPath("documents"), "S4 Invoice Backups");
  fs.mkdirSync(dir, { recursive: true });
  const full = path.join(dir, filename);
  fs.writeFileSync(full, jsonText, "utf8");
  return { path: full, filename };
});

ipcMain.handle("s4:ask-close-backup", async () => {
  const { dialog } = require("electron");
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  const result = await dialog.showMessageBox(win || undefined, {
    type: "question",
    buttons: ["Yes (Backup)", "No", "Cancel"],
    defaultId: 0,
    cancelId: 2,
    title: "Data backup",
    message: "Backup all data before closing? (Local + Google Drive)"
  });
  if(result.response === 0) return "yes";
  if(result.response === 1) return "no";
  return "cancel";
});

let allowWindowClose = false;
ipcMain.handle("s4:allow-close", () => {
  allowWindowClose = true;
  if(mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
  return true;
});

log.transports.file.level = "info";
autoUpdater.logger = log;
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow = null;
let staticServer = null;
const isDev = !app.isPackaged;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml"
};

function frontendRoot(){
  if(isDev) return path.join(__dirname, "..", "frontend");
  return path.join(process.resourcesPath, "frontend");
}

function safeFilePath(root, requestPath){
  const rel = decodeURIComponent(requestPath).replace(/^\/+/, "").split("/").join(path.sep);
  const resolved = path.normalize(path.join(root, rel));
  if(!resolved.startsWith(path.normalize(root))) return null;
  return resolved;
}

function startStaticServer(root){
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try{
        const parsed = url.parse(req.url || "/");
        let pathname = parsed.pathname || "/";
        if(pathname === "/") pathname = "/index.html";

        let filePath = safeFilePath(root, pathname);
        if(!filePath || !fs.existsSync(filePath)){
          if(!pathname.endsWith(".html")){
            filePath = safeFilePath(root, "/index.html");
          }
        }
        if(!filePath || !fs.existsSync(filePath)){
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        fs.createReadStream(filePath).pipe(res);
      }catch(err){
        log.error("static server error", err);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Server error");
      }
    });

    server.on("error", reject);
    // Use localhost (not 127.0.0.1) — Firebase Auth authorized domains include localhost by default
    server.listen(0, "localhost", () => resolve(server));
  });
}

async function loadFrontend(win){
  const root = frontendRoot();
  if(!fs.existsSync(path.join(root, "index.html"))){
    throw new Error("frontend/index.html not found at " + root);
  }

  if(staticServer){
    staticServer.close();
    staticServer = null;
  }

  staticServer = await startStaticServer(root);
  const port = staticServer.address().port;
  const loadUrl = `http://localhost:${port}/index.html`;
  log.info("loading frontend from", loadUrl, "root=", root);
  await win.loadURL(loadUrl);
}

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: "#1e1e2e",
    title: "S4-BUSINESS-INVOICE TRACKER",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  allowWindowClose = false;
  mainWindow.on("close", (e) => {
    if(allowWindowClose) return;
    e.preventDefault();
    if(mainWindow && !mainWindow.isDestroyed()){
      mainWindow.webContents.send("s4:request-close-backup");
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if(
      url.includes("accounts.google.com") ||
      url.includes("firebaseapp.com") ||
      url.includes("__/auth/handler")
    ){
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("did-fail-load", (_event, code, desc, failedUrl) => {
    log.error("did-fail-load", code, desc, failedUrl);
  });

  loadFrontend(mainWindow).catch(err => {
    log.error("frontend load failed", err);
    mainWindow.loadURL(`data:text/html,<h2 style='font-family:sans-serif;padding:24px'>Frontend load failed</h2><pre>${encodeURIComponent(String(err.message || err))}</pre>`);
  });

  if(isDev){
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function checkForUpdatesSilently(){
  if(isDev) return;
  autoUpdater.checkForUpdates().catch(err => log.error("update check failed", err));
}

autoUpdater.on("update-available", (info) => {
  const { dialog } = require("electron");
  dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["Download now", "Later"],
    defaultId: 0,
    cancelId: 1,
    title: "Update available",
    message: `New version v${info.version} is available.`,
    detail: "After download finishes, you can restart the app to install."
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
    mainWindow.setTitle(`S4-BUSINESS-INVOICE TRACKER — Downloading ${Math.round(progress.percent)}%`);
  }
});

autoUpdater.on("update-downloaded", (info) => {
  const { dialog } = require("electron");
  if(mainWindow){
    mainWindow.setTitle("S4-BUSINESS-INVOICE TRACKER");
  }
  dialog.showMessageBox(mainWindow, {
    type: "info",
    buttons: ["Restart now", "Later (installs next time you quit)"],
    defaultId: 0,
    cancelId: 1,
    title: "Update downloaded",
    message: `v${info.version} is ready to install.`
  }).then(result => {
    if(result.response === 0){
      allowWindowClose = true;
      autoUpdater.quitAndInstall();
    }
  });
});

app.whenReady().then(() => {
  createWindow();
  checkForUpdatesSilently();
  setInterval(checkForUpdatesSilently, 4 * 60 * 60 * 1000);

  app.on("activate", () => {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if(staticServer){
    staticServer.close();
    staticServer = null;
  }
  if(process.platform !== "darwin") app.quit();
});
