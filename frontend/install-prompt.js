// ============================================================
// PWA INSTALL PROMPT
// ------------------------------------------------------------
// Android/Chrome/Edge/Desktop: `beforeinstallprompt` event নিজে
// থেকেই fire হয়, আমরা সেটা ধরে রেখে একটা কাস্টম "📲 Install" বাটন
// দেখাই (browser এর নিজস্ব address-bar আইকনের চেয়ে বেশি চোখে পড়ে)।
//
// iPhone/iPad Safari: `beforeinstallprompt` কখনো fire হয় না (Apple
// সাপোর্ট করে না) — তাই আলাদাভাবে iOS detect করে "Share বাটনে চেপে
// Add to Home Screen করুন" — এই নির্দেশনা একটা ব্যানারে দেখাই।
// ============================================================

const DISMISS_KEY = "s4_install_banner_dismissed_at_v1";
const DISMISS_DAYS = 14;

function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches ||
         window.navigator.standalone === true; // iOS Safari legacy flag
}

function isIOS(){
  const ua = window.navigator.userAgent || "";
  const isAppleTouch = /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && "ontouchend" in document); // iPadOS 13+ reports as Mac
  return isAppleTouch;
}

function currentLang(){
  try{ return localStorage.getItem("lang_pref_v1") || "en"; }catch(e){ return "en"; }
}

function recentlyDismissed(){
  try{
    const t = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
    if(!t) return false;
    return (Date.now() - t) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  }catch(e){ return false; }
}

function markDismissed(){
  try{ localStorage.setItem(DISMISS_KEY, String(Date.now())); }catch(e){}
}

function baseBannerEl(id){
  const bar = document.createElement("div");
  bar.id = id;
  // update-checker.js ও একই কায়দায় নিচে একটা ব্যানার দেখাতে পারে —
  // দুটো একসাথে থাকলে যাতে একটার উপর আরেকটা না বসে, সেজন্য আগে থেকে
  // থাকা ব্যানারের উচ্চতা মেপে এটাকে তার উপরে বসানো হচ্ছে।
  const existingUpdateBanner = document.getElementById("s4UpdateBanner");
  const bottomOffset = existingUpdateBanner ? existingUpdateBanner.offsetHeight : 0;
  bar.style.cssText = [
    "position:fixed", "left:0", "right:0", `bottom:${bottomOffset}px`, "z-index:9998",
    "background:#fff", "color:#1c1a17", "padding:12px 16px",
    "display:flex", "align-items:center", "justify-content:space-between",
    "gap:12px", "box-shadow:0 -2px 10px rgba(0,0,0,0.15)",
    "border-top:1px solid #e4ddcd",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans Bengali',Arial,sans-serif"
  ].join(";");
  return bar;
}

function showAndroidInstallBanner(deferredPrompt){
  if(document.getElementById("s4InstallBanner")) return;
  const bn = { title: "Install this app", sub: "Add it to your home screen for quick, offline-ready access.", install: "📲 Install", later: "Later" };
  const en = { title: "Install this app", sub: "Add it to your home screen for quick, offline-ready access.", install: "📲 Install", later: "Later" };
  const txt = currentLang() === "en" ? en : bn;

  const bar = baseBannerEl("s4InstallBanner");
  const textWrap = document.createElement("div");
  textWrap.style.cssText = "flex:1;min-width:0;";
  textWrap.innerHTML = `<div style="font-weight:700;font-size:0.85rem;">${txt.title}</div><div style="font-size:0.72rem;color:#6b6559;">${txt.sub}</div>`;

  const btnWrap = document.createElement("div");
  btnWrap.style.cssText = "display:flex;gap:8px;flex-shrink:0;";

  const laterBtn = document.createElement("button");
  laterBtn.textContent = txt.later;
  laterBtn.style.cssText = "background:none;border:1px solid #e4ddcd;color:#6b6559;padding:8px 12px;border-radius:8px;font-size:0.76rem;";
  laterBtn.addEventListener("click", () => { markDismissed(); bar.remove(); });

  const installBtn = document.createElement("button");
  installBtn.textContent = txt.install;
  installBtn.style.cssText = "background:#22344a;color:#fff;font-weight:700;padding:8px 14px;border-radius:8px;font-size:0.76rem;border:0;";
  installBtn.addEventListener("click", async () => {
    bar.remove();
    try{
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    }catch(e){ /* ব্যবহারকারী বাতিল করলে চুপচাপ ফিরে আসবে */ }
  });

  btnWrap.appendChild(laterBtn);
  btnWrap.appendChild(installBtn);
  bar.appendChild(textWrap);
  bar.appendChild(btnWrap);
  document.body.appendChild(bar);
}

function showIOSInstallBanner(){
  if(document.getElementById("s4InstallBanner")) return;
  const bn = { title: "Add to Home Screen", sub: "Tap the Share button below, then choose \"Add to Home Screen\".", got: "Got it" };
  const en = { title: "Add to Home Screen", sub: "Tap the Share button below, then choose \"Add to Home Screen\".", got: "Got it" };
  const txt = currentLang() === "en" ? en : bn;

  const bar = baseBannerEl("s4InstallBanner");
  const textWrap = document.createElement("div");
  textWrap.style.cssText = "flex:1;min-width:0;";
  textWrap.innerHTML = `<div style="font-weight:700;font-size:0.85rem;">⬆️ ${txt.title}</div><div style="font-size:0.72rem;color:#6b6559;">${txt.sub}</div>`;

  const gotBtn = document.createElement("button");
  gotBtn.textContent = txt.got;
  gotBtn.style.cssText = "background:#22344a;color:#fff;font-weight:700;padding:8px 14px;border-radius:8px;font-size:0.76rem;border:0;flex-shrink:0;";
  gotBtn.addEventListener("click", () => { markDismissed(); bar.remove(); });

  bar.appendChild(textWrap);
  bar.appendChild(gotBtn);
  document.body.appendChild(bar);
}

function init(){
  if(isStandalone() || recentlyDismissed()) return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    showAndroidInstallBanner(e);
  });

  if(isIOS()){
    // iOS-এ কোনো native event নেই, তাই ২ সেকেন্ড পর সরাসরি ব্যানার দেখাই
    setTimeout(() => {
      if(!isStandalone() && !document.getElementById("s4InstallBanner")){
        showIOSInstallBanner();
      }
    }, 2000);
  }
}

if(typeof document !== "undefined"){
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
}
