// ============================================================
// B1 — Per-shop Firebase config (same app, different Firebase)
// ============================================================
// After install: paste this shop's Web config from Firebase Console
// → Project Settings → Your apps → Web app → firebaseConfig
// Saved in: Electron userData OR browser localStorage
// ============================================================

export const STORAGE_KEY = "s4_firebase_config_v1";

/** Empty template — app shows paste screen until a real config is saved */
export const emptyFirebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};

export function isFirebaseConfigReady(cfg){
  if(!cfg || typeof cfg !== "object") return false;
  const key = String(cfg.apiKey || "");
  const projectId = String(cfg.projectId || "");
  if(!key || key.includes("PASTE_")) return false;
  if(!projectId || projectId.includes("PASTE_")) return false;
  if(!cfg.authDomain || !cfg.appId) return false;
  return true;
}

/** Accept raw paste: full JS object, JSON, or firebaseConfig = {...} */
export function parseFirebaseConfigPaste(raw){
  let text = String(raw || "").trim();
  if(!text) throw new Error("CONFIG_EMPTY");

  // strip export / const firebaseConfig = ...
  text = text.replace(/^export\s+const\s+firebaseConfig\s*=\s*/i, "");
  text = text.replace(/^const\s+firebaseConfig\s*=\s*/i, "");
  text = text.replace(/^let\s+firebaseConfig\s*=\s*/i, "");
  text = text.replace(/^var\s+firebaseConfig\s*=\s*/i, "");
  text = text.replace(/;?\s*$/, "");

  // JS object → JSON-ish (quote keys, remove trailing commas)
  let jsonish = text;
  if(!text.startsWith("{")){
    throw new Error("CONFIG_INVALID");
  }
  if(!/"apiKey"/.test(text) && /apiKey\s*:/.test(text)){
    jsonish = text
      .replace(/([,{]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, "$1");
  }

  let cfg;
  try{
    cfg = JSON.parse(jsonish);
  }catch{
    throw new Error("CONFIG_INVALID");
  }

  const normalized = {
    apiKey: String(cfg.apiKey || "").trim(),
    authDomain: String(cfg.authDomain || "").trim(),
    projectId: String(cfg.projectId || "").trim(),
    storageBucket: String(cfg.storageBucket || "").trim(),
    messagingSenderId: String(cfg.messagingSenderId || "").trim(),
    appId: String(cfg.appId || "").trim()
  };
  if(cfg.measurementId) normalized.measurementId = String(cfg.measurementId).trim();

  if(!isFirebaseConfigReady(normalized)) throw new Error("CONFIG_INCOMPLETE");
  return normalized;
}

export async function loadSavedFirebaseConfig(){
  try{
    if(typeof window !== "undefined" && window.s4Desktop?.loadFirebaseConfig){
      const fromDesktop = await window.s4Desktop.loadFirebaseConfig();
      if(isFirebaseConfigReady(fromDesktop)) return fromDesktop;
    }
  }catch(_){ /* fall through */ }

  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    const cfg = JSON.parse(raw);
    return isFirebaseConfigReady(cfg) ? cfg : null;
  }catch{
    return null;
  }
}

export async function saveFirebaseConfig(cfg){
  if(!isFirebaseConfigReady(cfg)) throw new Error("CONFIG_INCOMPLETE");
  const payload = JSON.stringify(cfg);

  try{
    if(typeof window !== "undefined" && window.s4Desktop?.saveFirebaseConfig){
      await window.s4Desktop.saveFirebaseConfig(cfg);
    }
  }catch(_){ /* still save localStorage */ }

  localStorage.setItem(STORAGE_KEY, payload);
  return cfg;
}

export async function clearFirebaseConfig(){
  try{
    if(typeof window !== "undefined" && window.s4Desktop?.clearFirebaseConfig){
      await window.s4Desktop.clearFirebaseConfig();
    }
  }catch(_){}
  try{ localStorage.removeItem(STORAGE_KEY); }catch(_){}
}

export async function resolveFirebaseConfig(){
  const saved = await loadSavedFirebaseConfig();
  if(saved) return saved;
  return { ...emptyFirebaseConfig };
}
