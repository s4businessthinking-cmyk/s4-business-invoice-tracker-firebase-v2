// ============================================================
// GOOGLE DRIVE BACKUP MODULE
// ------------------------------------------------------------
// Firebase-ই মূল ডেটাবেস — এই মডিউলটা শুধু একটা extra safety layer:
// দোকান মালিকের নিজের Google Drive এ JSON স্ন্যাপশট ব্যাকআপ রাখা,
// যাতে Firebase project ভুলবশত ডিলিট/মিসকনফিগার হলেও ডেটা উদ্ধার
// করা যায়। Firestore-এর সাথে সরাসরি কোনো সম্পর্ক নেই — শুধু plain
// Drive REST API + Google Identity Services (GIS) token flow।
//
// scope: drive.file (শুধু এই app-এর বানানো ফাইল, বাকি Drive অদৃশ্য)
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
    s.onerror = () => reject(new Error("Google sign-in script লোড করা যায়নি — ইন্টারনেট চেক করুন।"));
    document.head.appendChild(s);
  });
  return gisScriptLoading;
}

function isConfigured(){
  const id = getDriveClientId();
  return !!id && !id.startsWith("PASTE_");
}

async function getAccessToken(){
  if(!isConfigured()){
    throw new Error("Drive backup configure করা হয়নি (drive-backup-config.js এ Client ID বসান)।");
  }
  if(cachedToken && Date.now() < cachedTokenExpiry - 30000){
    return cachedToken;
  }
  await loadGisScript();
  if(!tokenClient){
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: getDriveClientId(),
      scope: SCOPE,
      callback: () => {} // requestAccessToken() নিচে override করবে প্রতিবার
    });
  }
  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp) => {
      if(resp.error){
        reject(new Error("Google Drive অনুমতি পাওয়া যায়নি: " + resp.error));
        return;
      }
      cachedToken = resp.access_token;
      cachedTokenExpiry = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
      resolve(cachedToken);
    };
    tokenClient.error_callback = (err) => {
      console.error("Google Drive OAuth error:", err);
      const detail = err?.type || err?.message || "";
      reject(new Error(`Google Drive সাইন-ইন বাতিল হয়েছে বা ব্যর্থ হয়েছে।${detail ? " (" + detail + ")" : ""}`));
    };
    tokenClient.requestAccessToken({ prompt: "" });
  });
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
    throw new Error(`Drive API ব্যর্থ (${res.status}): ${body.slice(0, 200)}`);
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
 * dataObj কে JSON বানিয়ে Drive-এর "S4 Invoice Backups" ফোল্ডারে আপলোড করে।
 * রিটার্ন করে { id, name, webViewLink }
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

/**
 * ব্যাকআপ ফোল্ডারের সব JSON ফাইলের তালিকা (নতুন থেকে পুরনো), প্রতিটাতে
 * { id, name, createdTime }
 */
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

/**
 * নির্দিষ্ট fileId এর JSON কন্টেন্ট ডাউনলোড করে parse করে রিটার্ন করে
 */
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
