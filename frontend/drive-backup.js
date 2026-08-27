// ============================================================
// GOOGLE DRIVE BACKUP MODULE
// ------------------------------------------------------------
// Firebase is the primary DB. This module uploads JSON snapshots
// to the shop owner's Google Drive (drive.file scope).
//
// Token acquisition by platform:
//   • Browser / PWA  → Google Identity Services popup (unchanged)
//   • Desktop Electron → OAuth 2.0 loopback (system browser + local HTTP)
//   • Android Capacitor → Authorization Code + PKCE via Custom Tabs
// ============================================================
import { driveBackupConfig } from "./drive-backup-config.js";

const BACKUP_FOLDER_NAME = "S4 Invoice Backups";
const SCOPE = "https://www.googleapis.com/auth/drive.file";
export const DRIVE_CLIENT_STORAGE_KEY = "s4_drive_client_id_v1";
export const BACKUP_HISTORY_KEY = "s4_backup_history_v1";

let gisScriptLoading = null;
let tokenClient = null;
let cachedToken = null;
let cachedTokenExpiry = 0;
let runtimeClientId = null;

export function getDriveClientId(){
  if(runtimeClientId && !String(runtimeClientId).startsWith("PASTE_")) return runtimeClientId;
  try{
    const saved = localStorage.getItem(DRIVE_CLIENT_STORAGE_KEY);
    if(saved && !saved.startsWith("PASTE_") && saved.includes("apps.googleusercontent.com")) return saved.trim();
  }catch(_){}
  return (driveBackupConfig.googleClientId || "").trim();
}

export function saveDriveClientId(id){
  const v = String(id || "").trim();
  if(!v || v.startsWith("PASTE_") || !v.includes("apps.googleusercontent.com")){
    throw new Error("Paste a valid Google OAuth Client ID (…apps.googleusercontent.com)");
  }
  runtimeClientId = v;
  localStorage.setItem(DRIVE_CLIENT_STORAGE_KEY, v);
  tokenClient = null;
  cachedToken = null;
  return v;
}

export function clearDriveClientId(){
  runtimeClientId = null;
  try{ localStorage.removeItem(DRIVE_CLIENT_STORAGE_KEY); }catch(_){}
  tokenClient = null;
  cachedToken = null;
}

function loadGisScript(){
  if(window.google && window.google.accounts && window.google.accounts.oauth2){
    return Promise.resolve();
  }
  if(gisScriptLoading) return gisScriptLoading;
  gisScriptLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Google sign-in script — check your internet connection."));
    document.head.appendChild(s);
  });
  return gisScriptLoading;
}

function isConfigured(){
  const id = getDriveClientId();
  return !!id && !id.startsWith("PASTE_");
}

function isDesktopShell(){
  return typeof window !== "undefined" && !!window.s4Desktop?.driveOAuthLoopback;
}

function isAndroidNative(){
  try{
    return !!(window.Capacitor?.isNativePlatform?.() &&
      String(window.Capacitor.getPlatform?.() || "").toLowerCase() === "android");
  }catch(_){ return false; }
}

function oauthRedirectUriAndroid(){
  // Must match Google Cloud Console → OAuth client → Authorized redirect URIs
  return (driveBackupConfig.androidRedirectUri || "com.s4business.invoicetracker:/oauth2redirect").trim();
}

function randomString(len = 64){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for(let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

async function sha256Base64Url(plain){
  const data = new TextEncoder().encode(plain);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let bin = "";
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildAuthUrl({ clientId, redirectUri, codeChallenge, state, scopes }){
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", scopes || SCOPE);
  u.searchParams.set("access_type", "online");
  u.searchParams.set("include_granted_scopes", "true");
  u.searchParams.set("prompt", "consent");
  u.searchParams.set("code_challenge", codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  u.searchParams.set("state", state);
  return u.toString();
}

async function exchangeCodeForToken({ code, redirectUri, codeVerifier, clientId }){
  const body = new URLSearchParams({
    client_id: clientId,
    code,
    code_verifier: codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri
  });
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await res.json().catch(() => ({}));
  if(!res.ok || !data.access_token){
    const err = data.error_description || data.error || `HTTP ${res.status}`;
    throw new Error("Google token exchange failed: " + err);
  }
  return data;
}

function cacheAccessToken(accessToken, expiresIn){
  cachedToken = accessToken;
  cachedTokenExpiry = Date.now() + (Number(expiresIn) || 3600) * 1000;
  return cachedToken;
}

function friendlyOAuthError(err){
  const raw = String(err?.message || err?.type || err || "");
  if(/disallowed_useragent|403|not.?secure|embedded/i.test(raw)){
    return "Google Drive sign-in isn't supported in this app version yet — use Local Backup for now, or back up via the browser/PWA version";
  }
  if(/cancelled|access_denied|popup_closed/i.test(raw)){
    return "Google Drive sign-in was cancelled.";
  }
  return raw || "Google Drive sign-in failed.";
}

/** Desktop: system browser + loopback HTTP server in Electron main process */
async function getAccessTokenDesktop(){
  const clientId = getDriveClientId();
  const codeVerifier = randomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state = randomString(24);
  const result = await window.s4Desktop.driveOAuthLoopback({
    clientId,
    scope: SCOPE,
    codeChallenge,
    state
  });
  if(!result?.code){
    throw new Error(result?.error || "Google Drive sign-in was cancelled or failed.");
  }
  if(result.state && result.state !== state){
    throw new Error("OAuth state mismatch — try Drive backup again.");
  }
  const redirectUri = result.redirectUri;
  const token = await exchangeCodeForToken({
    code: result.code,
    redirectUri,
    codeVerifier,
    clientId
  });
  return cacheAccessToken(token.access_token, token.expires_in);
}

/** Android: Custom Tabs + app URL scheme + PKCE */
async function getAccessTokenAndroid(){
  const clientId = getDriveClientId();
  const redirectUri = oauthRedirectUriAndroid();
  const codeVerifier = randomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);
  const state = randomString(24);
  const authUrl = buildAuthUrl({ clientId, redirectUri, codeChallenge, state, scopes: SCOPE });

  const Browser = window.Capacitor?.Plugins?.Browser;
  const App = window.Capacitor?.Plugins?.App;
  if(!Browser?.open || !App?.addListener){
    throw new Error("Android Browser/App plugins missing — run npm install @capacitor/browser and npx cap sync android.");
  }

  const code = await new Promise((resolve, reject) => {
    let settled = false;
    let listenerHandle = null;
    const cleanup = async () => {
      try{ if(listenerHandle?.remove) await listenerHandle.remove(); }catch(_){}
      try{ await Browser.close?.(); }catch(_){}
    };
    const fail = async (msg) => {
      if(settled) return;
      settled = true;
      await cleanup();
      reject(new Error(msg));
    };
    const ok = async (c) => {
      if(settled) return;
      settled = true;
      await cleanup();
      resolve(c);
    };

    const timer = setTimeout(() => fail("Google Drive sign-in timed out."), 5 * 60 * 1000);

    App.addListener("appUrlOpen", (event) => {
      try{
        const rawUrl = String(event?.url || "");
        if(!rawUrl.includes("oauth2redirect")) return;
        const qIndex = rawUrl.indexOf("?");
        const q = new URLSearchParams(qIndex >= 0 ? rawUrl.slice(qIndex + 1) : "");
        const err = q.get("error");
        if(err){
          clearTimeout(timer);
          fail("Google Drive permission was not granted: " + err);
          return;
        }
        const returnedState = q.get("state");
        if(returnedState && returnedState !== state){
          clearTimeout(timer);
          fail("OAuth state mismatch — try again.");
          return;
        }
        const c = q.get("code");
        if(!c) return;
        clearTimeout(timer);
        ok(c);
      }catch(e){
        clearTimeout(timer);
        fail(String(e?.message || e));
      }
    }).then(h => { listenerHandle = h; }).catch(e => fail(String(e?.message || e)));

    Browser.open({ url: authUrl }).catch(e => {
      clearTimeout(timer);
      fail(String(e?.message || e));
    });
  });

  const token = await exchangeCodeForToken({ code, redirectUri, codeVerifier, clientId });
  return cacheAccessToken(token.access_token, token.expires_in);
}

/** Browser / PWA: GIS token client popup */
async function getAccessTokenGis(){
  await loadGisScript();
  if(!tokenClient){
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: getDriveClientId(),
      scope: SCOPE,
      callback: () => {}
    });
  }
  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if(resp.error){
        reject(new Error(friendlyOAuthError({ message: resp.error })));
        return;
      }
      resolve(cacheAccessToken(resp.access_token, resp.expires_in));
    };
    tokenClient.error_callback = (err) => {
      console.error("Google Drive OAuth error:", err);
      reject(new Error(friendlyOAuthError(err)));
    };
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

async function getAccessToken(){
  if(!isConfigured()){
    throw new Error("Drive backup is not configured (paste Client ID in Settings or drive-backup-config.js).");
  }
  if(cachedToken && Date.now() < cachedTokenExpiry - 30000){
    return cachedToken;
  }
  try{
    if(isDesktopShell()) return await getAccessTokenDesktop();
    if(isAndroidNative()) return await getAccessTokenAndroid();
    return await getAccessTokenGis();
  }catch(err){
    throw new Error(friendlyOAuthError(err));
  }
}

async function driveFetch(url, token, options = {}){
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
  if(!res.ok){
    const body = await res.text().catch(() => "");
    throw new Error(`Drive API failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return res;
}

async function findOrCreateBackupFolder(token){
  const q = encodeURIComponent(`name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const listRes = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    token
  );
  const listData = await listRes.json();
  if(listData.files && listData.files.length > 0){
    return listData.files[0].id;
  }
  const createRes = await driveFetch(
    "https://www.googleapis.com/drive/v3/files?fields=id",
    token,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: BACKUP_FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder"
      })
    }
  );
  const created = await createRes.json();
  return created.id;
}

/**
 * Upload dataObj as JSON into Drive folder "S4 Invoice Backups".
 * Returns { id, name, webViewLink }
 */
export async function backupToDrive(filename, dataObj){
  const token = await getAccessToken();
  const folderId = await findOrCreateBackupFolder(token);
  const jsonText = JSON.stringify(dataObj, null, 2);

  const metadata = { name: filename, parents: [folderId], mimeType: "application/json" };
  const boundary = "s4invoice" + Date.now();
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${jsonText}\r\n` +
    `--${boundary}--`;

  const res = await driveFetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    token,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body
    }
  );
  return res.json();
}

export async function listBackups(){
  const token = await getAccessToken();
  const folderId = await findOrCreateBackupFolder(token);
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false and mimeType='application/json'`);
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)&pageSize=50`,
    token
  );
  const data = await res.json();
  return data.files || [];
}

export function loadBackupHistory(){
  try{
    return JSON.parse(localStorage.getItem(BACKUP_HISTORY_KEY) || "[]");
  }catch{ return []; }
}

export function recordBackupHistory(entry){
  const list = loadBackupHistory();
  list.unshift({
    at: entry.at || Date.now(),
    name: entry.name || "backup.json",
    size: entry.size || 0,
    type: entry.type || "Manual",
    status: entry.status || "Successful",
    driveId: entry.driveId || ""
  });
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(list.slice(0, 40)));
  return list;
}

export function formatBytes(n){
  const b = Number(n) || 0;
  if(b < 1024) return b + " B";
  if(b < 1024*1024) return (b/1024).toFixed(1) + " KB";
  return (b/(1024*1024)).toFixed(2) + " MB";
}

export async function downloadBackup(fileId){
  const token = await getAccessToken();
  const res = await driveFetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    token
  );
  return res.json();
}

export function isDriveBackupConfigured(){
  return isConfigured();
}
