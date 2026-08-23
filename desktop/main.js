// ============================================================
// S4 INVOICE TRACKER — Electron desktop shell (main process)
// ============================================================
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");
const url = require("url");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

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
    server.listen(0, "127.0.0.1", () => resolve(server));
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
  const loadUrl = `http://127.0.0.1:${port}/index.html`;
  log.info("loading frontend from", loadUrl, "root=", root);
  await win.loadURL(loadUrl);
}

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: "#f6f3ec",
    title: "S4 Invoice Tracker",
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.setWindowOpenHandler(({ targetUrl }) => {
    shell.openExternal(targetUrl);
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
  const { dialog } = require("electron");
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
