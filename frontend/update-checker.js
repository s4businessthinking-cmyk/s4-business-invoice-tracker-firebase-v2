// ============================================================
// UPDATE CHECKER — web / APK path
// ------------------------------------------------------------
// Desktop (.exe) আপডেট electron-updater দিয়ে নিজে থেকেই main
// process-এ হ্যান্ডেল হয় (দেখুন desktop/main.js) — সেখানে native
// dialog দেখানো হয়, তাই এই ফাইল desktop shell-এর ভেতরে চললে
// নিজে থেকে কিছু করে না (ডাবল-প্রম্পট এড়াতে)।
//
// Browser / APK (sideloaded, তাই Play Store auto-update নেই) এর
// জন্য: GitHub Releases API থেকে সর্বশেষ release চেক করে, বর্তমান
// ভার্সনের চেয়ে নতুন হলে উপরে একটা ব্যানার দেখায়, ট্যাপ করলে .apk
// asset ব্রাউজারে ডাউনলোড হয় (Android নিজেই ডাউনলোড ম্যানেজার +
// package installer prompt দেখাবে)।
// ============================================================
import { updateConfig } from "./update-config.js";

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // ৬ ঘন্টায় একবারের বেশি না
const LAST_CHECK_KEY = "s4_update_last_check_v1";
const DISMISSED_KEY = "s4_update_dismissed_version_v1";

function isDesktopShell(){
  return typeof window !== "undefined" && !!window.s4Desktop;
}

function parseVersion(v){
  return String(v || "0").replace(/^v/i, "").split(".").map(n => parseInt(n, 10) || 0);
}

function isNewerVersion(remote, local){
  const r = parseVersion(remote);
  const l = parseVersion(local);
  const len = Math.max(r.length, l.length);
  for(let i = 0; i < len; i++){
    const rv = r[i] || 0;
    const lv = l[i] || 0;
    if(rv > lv) return true;
    if(rv < lv) return false;
  }
  return false;
}

function pickAsset(assets, keyword, extension){
  const list = Array.isArray(assets) ? assets : [];
  if(keyword){
    const byKeyword = list.find(a => a.name && a.name.toLowerCase().includes(keyword.toLowerCase()) && a.name.toLowerCase().endsWith(extension));
    if(byKeyword) return byKeyword;
  }
  return list.find(a => a.name && a.name.toLowerCase().endsWith(extension)) || null;
}

function currentLang(){
  try{ return localStorage.getItem("lang_pref_v1") || "en"; }catch(e){ return "en"; }
}

function bannerText(version){
  return {
    title: `New version available (v${version})`,
    sub: "Download and install the update — your data stays safe (everything is stored in Firebase).",
    download: "⬇️ Download",
    later: "Later"
  };
}

function showBanner(release, asset, remoteVersion){
  if(document.getElementById("s4UpdateBanner")) return;

  const txt = bannerText(remoteVersion);
  const bar = document.createElement("div");
  bar.id = "s4UpdateBanner";
  bar.style.cssText = [
    "position:fixed", "left:0", "right:0", "bottom:0", "z-index:9999",
    "background:#22344a", "color:#fff", "padding:12px 16px",
    "display:flex", "align-items:center", "justify-content:space-between",
    "gap:12px", "box-shadow:0 -2px 10px rgba(0,0,0,0.25)",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans Bengali',Arial,sans-serif"
  ].join(";");

  const textWrap = document.createElement("div");
  textWrap.style.cssText = "flex:1;min-width:0;";
  const titleEl = document.createElement("div");
  titleEl.style.cssText = "font-weight:700;font-size:0.88rem;margin-bottom:2px;";
  titleEl.textContent = txt.title;
  const subEl = document.createElement("div");
  subEl.style.cssText = "font-size:0.72rem;color:#c7d3de;";
  subEl.textContent = txt.sub;
  textWrap.appendChild(titleEl);
  textWrap.appendChild(subEl);

  const btnWrap = document.createElement("div");
  btnWrap.style.cssText = "display:flex;gap:8px;flex-shrink:0;";

  const laterBtn = document.createElement("button");
  laterBtn.textContent = txt.later;
  laterBtn.style.cssText = "background:transparent;border:1px solid rgba(255,255,255,0.4);color:#fff;padding:8px 12px;border-radius:8px;font-size:0.78rem;";
  laterBtn.addEventListener("click", () => {
    try{ localStorage.setItem(DISMISSED_KEY, remoteVersion); }catch(e){}
    bar.remove();
  });

  const dlBtn = document.createElement("a");
  dlBtn.textContent = txt.download;
  const downloadUrl = asset ? asset.browser_download_url : release.html_url;
  dlBtn.href = downloadUrl;
  dlBtn.target = "_blank";
  dlBtn.rel = "noopener noreferrer";
  dlBtn.style.cssText = "background:#c8871e;color:#1c1a17;font-weight:700;padding:8px 14px;border-radius:8px;font-size:0.78rem;text-decoration:none;white-space:nowrap;cursor:pointer;";

  // Android WebView cannot download .apk via plain <a> — open system browser / Custom Tabs
  const isAndroid = (() => {
    try{
      return !!(window.Capacitor?.isNativePlatform?.() &&
        String(window.Capacitor.getPlatform?.() || "").toLowerCase() === "android");
    }catch(_){ return false; }
  })();
  if(isAndroid){
    dlBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try{
        const Browser = window.Capacitor?.Plugins?.Browser;
        if(Browser?.open){
          await Browser.open({ url: downloadUrl });
          return;
        }
      }catch(err){
        console.warn("Browser.open failed for update download", err);
      }
      window.open(downloadUrl, "_system");
    });
  }

  btnWrap.appendChild(laterBtn);
  btnWrap.appendChild(dlBtn);
  bar.appendChild(textWrap);
  bar.appendChild(btnWrap);
  document.body.appendChild(bar);
}

async function checkForUpdate(){
  if(isDesktopShell()) return; // electron-updater handles the exe path natively

  try{
    const last = parseInt(localStorage.getItem(LAST_CHECK_KEY) || "0", 10);
    if(Date.now() - last < CHECK_INTERVAL_MS) return;
  }catch(e){}

  const owner = updateConfig.githubOwner;
  const repo = updateConfig.githubRepo;
  if(!owner || owner.startsWith("PASTE_") || !repo || repo.startsWith("PASTE_")) return;

  try{
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: { "Accept": "application/vnd.github+json" }
    });
    if(!res.ok) return;
    const release = await res.json();
    const remoteVersion = String(release.tag_name || "").replace(/^v/i, "");
    if(!remoteVersion) return;

    try{ localStorage.setItem(LAST_CHECK_KEY, String(Date.now())); }catch(e){}

    if(!isNewerVersion(remoteVersion, updateConfig.currentVersion)) return;

    let dismissed = null;
    try{ dismissed = localStorage.getItem(DISMISSED_KEY); }catch(e){}
    if(dismissed === remoteVersion) return;

    const asset = pickAsset(release.assets, updateConfig.apkAssetKeyword, ".apk");
    showBanner(release, asset, remoteVersion);
  }catch(e){
    // নেটওয়ার্ক না থাকলে বা GitHub API ব্যর্থ হলে চুপচাপ ফিরে আসবে —
    // আপডেট-চেক app এর মূল কাজ (Firestore sync) কখনো ব্লক করবে না
  }
}

if(typeof document !== "undefined"){
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => setTimeout(checkForUpdate, 2000));
  }else{
    setTimeout(checkForUpdate, 2000);
  }
}

export { checkForUpdate, isNewerVersion };
