// Tiny entry — start splash BEFORE heavy Firebase/app modules load.
// If CDN/app.js hangs, user still sees progress + failsafe hide.
import { startSplash, hideSplash, setSplashStatus } from "./splash.js";
import { initTheme } from "./theme.js";

initTheme();
startSplash("en");
setSplashStatus("Loading modules…");

const failsafe = setTimeout(() => {
  const el = document.getElementById("s4Splash");
  if(el && !el.classList.contains("hidden")){
    setSplashStatus("Still loading… check internet / Firebase CDN");
  }
}, 8000);

const forceHide = setTimeout(() => {
  hideSplash("en").catch(()=>{});
  const auth = document.getElementById("authOverlay");
  if(auth) auth.style.display = "flex";
}, 20000);

import("./boot.js?v=47")
  .then(() => {
    clearTimeout(failsafe);
    clearTimeout(forceHide);
  })
  .catch(async (err) => {
    clearTimeout(failsafe);
    clearTimeout(forceHide);
    console.error("boot.js failed to load", err);
    const detail = (err && (err.message || err.stack)) ? String(err.message || err.stack) : String(err);
    setSplashStatus("Load failed");
    await hideSplash("en");
    const auth = document.getElementById("authOverlay");
    if(auth) auth.style.display = "flex";
    const msg = document.getElementById("authMsg");
    if(msg){
      msg.textContent = "App failed to load: " + detail.slice(0, 220) + " — Refresh after fixing, or clear site data if it persists.";
    }
  });
