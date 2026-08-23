// ============================================================
// SPLASH / LOADING SCREEN
// ------------------------------------------------------------
// PyQt SplashScreen-এর web equivalent: app load হওয়ার সময়
// branding/background.jpg + logo + progress bar দেখায়।
// Firebase init + auth check শেষ হলে hideSplash() call করুন।
// ============================================================

const SPLASH_MIN_MS = 1800;

let splashDone = false;
let splashStartedAt = 0;
let splashTimer = null;

function splashEl(){
  return document.getElementById("s4Splash");
}

function splashBar(){
  return document.getElementById("s4SplashBar");
}

function splashStatus(){
  return document.getElementById("s4SplashStatus");
}

export function startSplash(lang = "bn"){
  const el = splashEl();
  if(!el) return;
  splashStartedAt = Date.now();
  splashDone = false;
  el.style.display = "flex";
  if(splashStatus()){
    splashStatus().textContent = lang === "en" ? "Loading S4 Invoice Tracker…" : "S4 Invoice Tracker লোড হচ্ছে…";
  }
  let p = 0;
  if(splashTimer) clearInterval(splashTimer);
  splashTimer = setInterval(()=>{
    if(splashDone) return;
    p = Math.min(p + (p < 70 ? 4 : 1), 92);
    if(splashBar()) splashBar().value = p;
  }, 40);
}

export function hideSplash(){
  const el = splashEl();
  if(!el || splashDone) return Promise.resolve();
  splashDone = true;
  if(splashTimer){
    clearInterval(splashTimer);
    splashTimer = null;
  }
  const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - splashStartedAt));
  return new Promise(resolve=>{
    setTimeout(()=>{
      if(splashBar()) splashBar().value = 100;
      setTimeout(()=>{
        el.style.display = "none";
        resolve();
      }, 180);
    }, wait);
  });
}

export function setSplashStatus(text){
  const el = splashStatus();
  if(el) el.textContent = text || "";
}
