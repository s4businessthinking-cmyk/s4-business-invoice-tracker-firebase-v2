// ============================================================
// SPLASH / LOADING SCREEN — 0% থেকে 100% animate
// ============================================================

const SPLASH_MIN_MS = 1600;

let splashDone = false;
let splashStartedAt = 0;
let splashTimer = null;
let finishTimer = null;
let currentProgress = 0;

function splashEl(){
  return document.getElementById("s4Splash");
}

function splashBar(){
  return document.getElementById("s4SplashBar");
}

function splashStatus(){
  return document.getElementById("s4SplashStatus");
}

function paintProgress(p, statusText){
  currentProgress = Math.max(0, Math.min(100, p));
  if(splashBar()) splashBar().value = Math.round(currentProgress);
  if(splashStatus() && statusText != null){
    splashStatus().textContent = statusText;
  }
}

export function startSplash(lang = "bn"){
  const el = splashEl();
  if(!el) return;
  splashStartedAt = Date.now();
  splashDone = false;
  currentProgress = 0;
  el.classList.remove("hidden");
  el.style.display = "flex";
  el.style.pointerEvents = "auto";
  paintProgress(0, lang === "en" ? "Loading… 0%" : "লোড হচ্ছে… 0%");
  if(splashTimer) clearInterval(splashTimer);
  if(finishTimer) clearTimeout(finishTimer);
  splashTimer = setInterval(()=>{
    if(splashDone) return;
    if(currentProgress < 88){
      paintProgress(currentProgress + 2);
    }else if(currentProgress < 95){
      paintProgress(currentProgress + 1);
    }
    if(splashStatus()){
      splashStatus().textContent = (lang === "en" ? "Loading… " : "লোড হচ্ছে… ") + Math.round(currentProgress) + "%";
    }
  }, 45);
}

function animateTo100(lang, onDone){
  if(finishTimer) clearTimeout(finishTimer);
  const step = ()=>{
    if(currentProgress >= 100){
      paintProgress(100, lang === "en" ? "Ready — 100%" : "প্রস্তুত — 100%");
      onDone();
      return;
    }
    paintProgress(currentProgress + 3);
    if(splashStatus()){
      splashStatus().textContent = (lang === "en" ? "Loading… " : "লোড হচ্ছে… ") + Math.round(currentProgress) + "%";
    }
    finishTimer = setTimeout(step, 35);
  };
  step();
}

export function hideSplash(lang = "bn"){
  const el = splashEl();
  if(!el) return Promise.resolve();
  if(splashDone && el.classList.contains("hidden")) return Promise.resolve();

  return new Promise(resolve=>{
    splashDone = true;
    if(splashTimer){
      clearInterval(splashTimer);
      splashTimer = null;
    }
    const wait = Math.max(0, SPLASH_MIN_MS - (Date.now() - splashStartedAt));
    setTimeout(()=>{
      animateTo100(lang, ()=>{
        setTimeout(()=>{
          el.style.display = "none";
          el.style.pointerEvents = "none";
          el.classList.add("hidden");
          resolve();
        }, 220);
      });
    }, wait);
  });
}

export function setSplashStatus(text){
  const el = splashStatus();
  if(el) el.textContent = text || "";
}
