import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentSingleTabManager,
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  resolveFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig,
  parseFirebaseConfigPaste, isFirebaseConfigReady
} from "./firebase-config.js";
import "./update-checker.js";
import "./install-prompt.js";
import { initTheme } from "./theme.js";
import {
  initAuthModule, tryRestoreSession, ownerSetupShop, loginWithEmail,
  staffAcceptInvite, resendVerificationEmail, logoutUser, sendPasswordReset,
  getCurrentMember, authErrorText
} from "./auth.js";
import { initActivityLog } from "./activity-log.js";
import { startSplash, hideSplash, setSplashStatus } from "./splash.js";
import { startTracker, stopTracker } from "./app.js";
import { getAccessStatus } from "./license.js";

const isDesktopApp = typeof window !== "undefined" && !!window.s4Desktop;
const lang = "en";

let firebaseConfig = null;
let fbApp = null;
let auth = null;
let db = null;
let shopDocRef = null;
let firebaseReady = false;
let _pendingVerifyEmail = "";
let _pendingVerifyPassword = "";

function isFirebaseConfigured(){
  return firebaseReady && isFirebaseConfigReady(firebaseConfig);
}

function showAuthMessage(x){
  const el = document.getElementById("authMsg");
  if(el) el.textContent = x || "";
}

function requireFirebaseReady(){
  if(isFirebaseConfigured()) return true;
  showAuthMessage("Connect Firebase config first.");
  showFirebaseConfigScreen();
  return false;
}

function hideAllAuthFields(){
  setupFields.classList.remove("open");
  loginFields.classList.remove("open");
  staffSignupFields.classList.remove("open");
  document.getElementById("configFields").classList.remove("open");
  document.getElementById("verifyFields").classList.remove("open");
  document.getElementById("configFields").style.display = "none";
  document.getElementById("verifyFields").style.display = "none";
}

function showFirebaseConfigScreen(){
  hideAllAuthFields();
  const cfg = document.getElementById("configFields");
  cfg.classList.add("open");
  cfg.style.display = "block";
  authSubtitle.textContent = "Step 1 — Connect this shop’s Firebase";
  showAuthMessage("");
}

function showLogin(){
  hideAllAuthFields();
  loginFields.classList.add("open");
  authSubtitle.textContent = "Login to your shop account";
  showAuthMessage("");
}

function showSetup(){
  hideAllAuthFields();
  setupFields.classList.add("open");
  authSubtitle.textContent = "Create your shop account";
  showAuthMessage("");
}

function showStaffSignup(){
  hideAllAuthFields();
  staffSignupFields.classList.add("open");
  authSubtitle.textContent = "Create staff account (invite required)";
  showAuthMessage("");
}

function showAuthScreen(){
  document.getElementById("authOverlay").style.display = "flex";
}

function hideAuth(){
  document.getElementById("authOverlay").style.display = "none";
}

function showVerifyScreen(email, msg){
  _pendingVerifyEmail = email;
  hideAllAuthFields();
  const vf = document.getElementById("verifyFields");
  vf.classList.add("open");
  vf.style.display = "block";
  document.getElementById("verifyMsg").textContent = msg;
  showAuthMessage("");
}

function withTimeout(promise, ms, label = "TIMEOUT"){
  return Promise.race([
    promise,
    new Promise((_r, reject)=> setTimeout(()=> reject(new Error(label)), ms))
  ]);
}

function wireFirebase(cfg){
  firebaseConfig = cfg;
  fbApp = initializeApp(cfg);
  auth = getAuth(fbApp);
  db = isDesktopApp
    ? getFirestore(fbApp)
    : initializeFirestore(fbApp, {
        localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) })
      });
  initActivityLog(db);
  initAuthModule(auth, db);
  shopDocRef = doc(db, "shop", "info");
  firebaseReady = true;
}

async function enterAppFromShopDoc(data){
  // Start / continue 15-day trial (or use existing license) before opening app
  const access = await getAccessStatus();
  hideAuth();
  startTracker({ db, shop: data, member: getCurrentMember(), access });
}

async function restoreSession(){
  try{
    const session = await tryRestoreSession();
    if(!session) return false;
    const snap = await getDoc(shopDocRef);
    if(!snap.exists()) return false;
    await enterAppFromShopDoc(snap.data());
    return true;
  }catch{
    return false;
  }
}

async function startAuth(){
  showAuthScreen();
  authSubtitle.textContent = "";
  try{
    if(!isFirebaseConfigured()){
      await hideSplash(lang);
      showFirebaseConfigScreen();
      return;
    }
    setSplashStatus("Connecting…");
    if(await withTimeout(restoreSession(), 8000, "AUTH_TIMEOUT")){
      await hideSplash(lang);
      return;
    }
    setSplashStatus("Almost ready…");
    const snap = await withTimeout(getDoc(shopDocRef), 8000, "FIRESTORE_TIMEOUT");
    await hideSplash(lang);
    if(snap.exists()) showLogin(); else showSetup();
  }catch{
    stopTracker();
    await hideSplash(lang);
    showSetup();
    showAuthMessage("Connection failed. Check internet and try again.");
  }
}

async function bootApp(){
  startSplash(lang);
  showAuthScreen();
  try{
    setSplashStatus("Starting…");
    // Start 15-day trial clock on first open (does not block login)
    try{ await getAccessStatus(); }catch(_){}
    const cfg = await resolveFirebaseConfig();
    if(!isFirebaseConfigReady(cfg)){
      await hideSplash(lang);
      showFirebaseConfigScreen();
      return;
    }
    wireFirebase(cfg);
    await startAuth();
  }catch{
    await hideSplash(lang);
    showFirebaseConfigScreen();
    showAuthMessage("Could not start. Check Firebase config.");
  }
}

async function doSaveFirebaseConfig(){
  try{
    const cfg = parseFirebaseConfigPaste(document.getElementById("configPaste").value);
    await saveFirebaseConfig(cfg);
    showAuthMessage("Firebase connected. Reloading…");
    setTimeout(()=> location.reload(), 500);
  }catch(e){
    const map = {
      CONFIG_EMPTY: "Paste the Firebase config first.",
      CONFIG_INVALID: "Invalid config. Paste the full { ... } object.",
      CONFIG_INCOMPLETE: "Need apiKey, authDomain, projectId, appId."
    };
    showAuthMessage(map[e.message] || String(e.message || e));
  }
}

async function doChangeFirebaseConfig(){
  if(!confirm("Change Firebase config? You will paste the shop config again.")) return;
  await clearFirebaseConfig();
  location.reload();
}

async function doSetup(){
  if(!requireFirebaseReady()) return;
  const email = setupEmail.value.trim();
  const ownerName = setupOwnerName.value.trim();
  const name = setupName.value.trim();
  const addr = setupAddr.value.trim();
  const phone = setupPhone.value.trim();
  const p = setupPassword.value;
  if(!email.includes("@")) return showAuthMessage(authErrorText("EMAIL_REQUIRED", lang));
  if(!name) return showAuthMessage(authErrorText("SHOP_NAME_REQUIRED", lang));
  if(p.length < 6) return showAuthMessage(authErrorText("PASSWORD_SHORT", lang));
  if(p !== setupPassword2.value) return showAuthMessage("Passwords do not match.");
  try{
    showAuthMessage("Creating account…");
    _pendingVerifyPassword = p;
    await ownerSetupShop({ email, password: p, shopName: name, addr, phone, ownerDisplayName: ownerName || name });
    showVerifyScreen(email, `Account created. A verification email was sent to ${email}. Click the link, then Login.`);
  }catch(e){
    showAuthMessage(authErrorText(e.code || e.message, lang));
  }
}

async function doLogin(){
  if(!requireFirebaseReady()) return;
  const email = loginEmail.value.trim();
  const p = loginPassword.value;
  if(!email.includes("@")) return showAuthMessage(authErrorText("EMAIL_REQUIRED", lang));
  if(!p) return showAuthMessage("Enter password.");
  _pendingVerifyPassword = p;
  try{
    await loginWithEmail({ email, password: p });
    const snap = await getDoc(shopDocRef);
    if(!snap.exists()) return showAuthMessage("Shop not set up.");
    await enterAppFromShopDoc(snap.data());
  }catch(e){
    if((e.code || e.message) === "EMAIL_NOT_VERIFIED"){
      showVerifyScreen(email, `${email} is not verified yet. Check inbox, click the link, then Login.`);
    } else {
      showAuthMessage(authErrorText(e.code || e.message, lang));
    }
  }
}

async function doStaffSignup(){
  if(!requireFirebaseReady()) return;
  const email = staffEmail.value.trim();
  const displayName = staffDisplayName.value.trim();
  const p = staffPassword.value;
  if(!email.includes("@")) return showAuthMessage(authErrorText("EMAIL_REQUIRED", lang));
  if(!displayName) return showAuthMessage(authErrorText("DISPLAY_NAME_REQUIRED", lang));
  if(p.length < 6) return showAuthMessage(authErrorText("PASSWORD_SHORT", lang));
  if(p !== staffPassword2.value) return showAuthMessage("Passwords do not match.");
  try{
    showAuthMessage("Creating account…");
    _pendingVerifyPassword = p;
    await staffAcceptInvite({ email, password: p, displayName });
    showVerifyScreen(email, `Account created. Verify ${email}, then Login.`);
  }catch(e){
    showAuthMessage(authErrorText(e.code || e.message, lang));
  }
}

async function doResendVerify(){
  if(!_pendingVerifyEmail || !_pendingVerifyPassword){
    return showAuthMessage("Go back and enter your password first.");
  }
  try{
    await resendVerificationEmail({ email: _pendingVerifyEmail, password: _pendingVerifyPassword });
    showAuthMessage(`Verification email re-sent to ${_pendingVerifyEmail}.`);
  }catch(e){
    if((e.code || e.message) === "ALREADY_VERIFIED") showAuthMessage("Already verified — you can Login now.");
    else showAuthMessage(authErrorText(e.code || e.message, lang));
  }
}

async function doForgotPassword(){
  const email = loginEmail.value.trim() || prompt("Enter your email:");
  if(!email) return;
  try{
    await sendPasswordReset(email);
    showAuthMessage("Password reset email sent.");
  }catch(e){
    showAuthMessage(authErrorText(e.code || e.message, lang));
  }
}

async function doLogout(){
  stopTracker();
  await logoutUser();
  showAuthScreen();
  startAuth();
}

async function doTryOwnerSetup(){
  if(!requireFirebaseReady()) return;
  try{
    const snap = await getDoc(shopDocRef);
    if(snap.exists()){
      showAuthMessage("This Firebase shop already has an owner. Use Login or Forgot password.");
      return;
    }
    showSetup();
  }catch(e){
    showAuthMessage(authErrorText(e.code || e.message, lang));
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  setupBtn.addEventListener("click", doSetup);
  loginBtn.addEventListener("click", doLogin);
  staffSignupBtn.addEventListener("click", doStaffSignup);
  forgotBtn.addEventListener("click", doForgotPassword);
  showStaffSignupBtn.addEventListener("click", showStaffSignup);
  showLoginBtn.addEventListener("click", showLogin);
  document.getElementById("showOwnerSetupBtn")?.addEventListener("click", doTryOwnerSetup);
  document.getElementById("showLoginFromSetupBtn")?.addEventListener("click", showLogin);
  document.getElementById("configSaveBtn").addEventListener("click", doSaveFirebaseConfig);
  document.getElementById("resendVerifyBtn").addEventListener("click", doResendVerify);
  document.getElementById("verifyBackBtn").addEventListener("click", showLogin);
  loginPassword.addEventListener("keydown", e=>{ if(e.key === "Enter") doLogin(); });
  document.getElementById("logoutBtn").addEventListener("click", doLogout);
  document.querySelectorAll(".pw-toggle").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const inp = document.getElementById(btn.dataset.pw);
      if(!inp) return;
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
    });
  });
  bootApp();
});

if(!isDesktopApp && "serviceWorker" in navigator){
  window.addEventListener("load", ()=> navigator.serviceWorker.register("sw.js").catch(()=>{}));
}
