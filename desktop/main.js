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
  let ok = false;
  try{
    writeJsonFile(path.join(app.getPath("userData"), "trial.json"), record);
    ok = true;
  }catch(err){
    log.warn("save trial userData failed", err?.message || err);
  }
  try{
    writeJsonFile(sharedFile("trial.json"), record);
    ok = true;
  }catch(err){
    log.warn("save trial ProgramData failed", err?.message || err);
  }
  return ok;
});
ipcMain.handle("s4:load-license-record", () => {
  return readJsonFile(sharedFile("license.json")) || readJsonFile(path.join(app.getPath("userData"), "license.json"));
});
ipcMain.handle("s4:save-license-record", (_e, record) => {
  let ok = false;
  try{
    writeJsonFile(path.join(app.getPath("userData"), "license.json"), record);
    ok = true;
  }catch(err){
    log.warn("save license userData failed", err?.message || err);
  }
  try{
    writeJsonFile(sharedFile("license.json"), record);
    ok = true;
  }catch(err){
    log.warn("save license ProgramData failed", err?.message || err);
  }
  return ok;
});
ipcMain.handle("s4:save-local-backup", (_e, payload) => {
  const rawName = String(payload?.filename || `backup-${Date.now()}.json`)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/^\.+/, "_");
  const filename = path.basename(rawName) || `backup-${Date.now()}.json`;
  const jsonText = String(payload?.jsonText || "{}");
  const dir = path.join(app.getPath("documents"), "S4 Invoice Backups");
  fs.mkdirSync(dir, { recursive: true });
  const full = path.resolve(path.join(dir, filename));
  const rootNorm = path.resolve(dir);
  const rootPrefix = rootNorm.endsWith(path.sep) ? rootNorm : rootNorm + path.sep;
  if(full !== rootNorm && !full.startsWith(rootPrefix)){
    throw new Error("Invalid backup filename");
  }
  fs.writeFileSync(full, jsonText, "utf8");
  return { path: full, filename };
});

// Google Drive OAuth for desktop: system browser + fixed loopback port.
// Redirect URI must be registered in Google Cloud Console when using a Web client:
//   http://127.0.0.1:8765/oauth2redirect
const DESKTOP_OAUTH_PORT = 8765;
const DESKTOP_OAUTH_PATH = "/oauth2redirect";
let oauthServer = null;

function stopOAuthServer(){
  if(oauthServer){
    try{ oauthServer.close(); }catch(_){}
    oauthServer = null;
  }
}

ipcMain.handle("s4:drive-oauth-loopback", async (_e, payload) => {
  const clientId = String(payload?.clientId || "").trim();
  const scope = String(payload?.scope || "https://www.googleapis.com/auth/drive.file");
  const codeChallenge = String(payload?.codeChallenge || "");
  const state = String(payload?.state || "");
  if(!clientId || !codeChallenge || !state){
    return { error: "Missing OAuth parameters" };
  }
  const redirectUri = `http://127.0.0.1:${DESKTOP_OAUTH_PORT}${DESKTOP_OAUTH_PATH}`;
  stopOAuthServer();

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if(settled) return;
      settled = true;
      clearTimeout(timer);
      stopOAuthServer();
      resolve(result);
    };
    const timer = setTimeout(() => finish({ error: "Google Drive sign-in timed out." }), 5 * 60 * 1000);

    oauthServer = http.createServer((req, res) => {
      try{
        const parsed = url.parse(req.url || "/", true);
        if(parsed.pathname !== DESKTOP_OAUTH_PATH){
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found");
          return;
        }
        const q = parsed.query || {};
        const htmlOk = "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:24px'><h2>Signed in</h2><p>You can close this tab and return to S4 Invoice Tracker.</p></body></html>";
        const htmlErr = "<!DOCTYPE html><html><body style='font-family:sans-serif;padding:24px'><h2>Sign-in failed</h2><p>You can close this tab.</p></body></html>";
        if(q.error){
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(htmlErr);
          finish({ error: String(q.error_description || q.error) });
          return;
        }
        if(!q.code){
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Missing code");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(htmlOk);
        finish({ code: String(q.code), state: String(q.state || ""), redirectUri });
      }catch(err){
        log.error("oauth callback error", err);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Error");
        finish({ error: String(err?.message || err) });
      }
    });

    oauthServer.on("error", (err) => {
      log.error("oauth server error", err);
      finish({ error: "Could not start local OAuth server (is port 8765 free?): " + (err?.message || err) });
    });

    oauthServer.listen(DESKTOP_OAUTH_PORT, "127.0.0.1", () => {
      const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      auth.searchParams.set("client_id", clientId);
      auth.searchParams.set("redirect_uri", redirectUri);
      auth.searchParams.set("response_type", "code");
      auth.searchParams.set("scope", scope);
      auth.searchParams.set("access_type", "online");
      auth.searchParams.set("include_granted_scopes", "true");
      auth.searchParams.set("prompt", "consent");
      auth.searchParams.set("code_challenge", codeChallenge);
      auth.searchParams.set("code_challenge_method", "S256");
      auth.searchParams.set("state", state);
      shell.openExternal(auth.toString()).catch(err => {
        finish({ error: "Could not open system browser: " + (err?.message || err) });
      });
    });
  });
});

ipcMain.handle("s4:ask-close-backup", async () => {
  const { dialog } = require("electron");
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  const result = await dialog.showMessageBox(win || undefined, {
    type: "question",
    buttons: ["Backup then close", "Close without backup", "Stay open"],
    defaultId: 2,
    cancelId: 2,
    title: "Close S4 Invoice Tracker",
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
  const rootNorm = path.normalize(root);
  const rootPrefix = rootNorm.endsWith(path.sep) ? rootNorm : rootNorm + path.sep;
  const rel = decodeURIComponent(requestPath).replace(/^\/+/, "").split("/").join(path.sep);
  const resolved = path.normalize(path.join(rootNorm, rel));
  // Containment: exact root or a path under root + separator (blocks sibling "frontend_evil")
  if(resolved !== rootNorm && !resolved.startsWith(rootPrefix)) return null;
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

async function isMainAppVisible(win){
  if(!win || win.isDestroyed()) return false;
  try{
    return await win.webContents.executeJavaScript(
      "document.getElementById('app')?.classList.contains('visible') === true",
      true
    );
  }catch(err){
    log.warn("app visible check failed", err?.message || err);
    return false;
  }
}

async function promptCloseLoginScreen(win){
  const { dialog } = require("electron");
  const result = await dialog.showMessageBox(win, {
    type: "question",
    buttons: ["Close app", "Stay open"],
    defaultId: 1,
    cancelId: 1,
    title: "Close S4 Invoice Tracker",
    message: "Close the application?"
  });
  return result.response === 0;
}

async function handleWindowCloseRequest(){
  if(allowWindowClose || !mainWindow || mainWindow.isDestroyed()) return;
  const appVisible = await isMainAppVisible(mainWindow);
  if(!appVisible){
    if(await promptCloseLoginScreen(mainWindow)){
      allowWindowClose = true;
      mainWindow.close();
    }
    return;
  }
  mainWindow.webContents.send("s4:request-close-backup");
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
    handleWindowCloseRequest().catch(err => log.error("close request failed", err));
  });

  // Always open external URLs in the system browser (never in-app).
  // Google OAuth blocks Electron's embedded user-agent (disallowed_useragent);
  // Drive backup uses the loopback OAuth IPC path instead of GIS popups.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try{
      const parsed = new URL(url);
      if(parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:"){
        shell.openExternal(url);
      }else{
        log.warn("blocked openExternal protocol", parsed.protocol);
      }
    }catch(err){
      log.warn("blocked openExternal url", err?.message || err);
    }
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
