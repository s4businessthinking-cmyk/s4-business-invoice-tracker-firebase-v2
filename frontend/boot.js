import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  resolveFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig,
  parseFirebaseConfigPaste, isFirebaseConfigReady, parseInviteCode
} from "./firebase-config.js";
import "./update-checker.js";
import "./install-prompt.js";
import { initTheme } from "./theme.js";
import {
  initAuthModule, tryRestoreSession, ownerSetupShop, loginWithEmail,
  staffAcceptInvite, resendVerificationEmail, logoutUser, sendPasswordReset,
  getCurrentMember, authErrorText
} from "./auth.js?v=145";
import { initActivityLog } from "./activity-log.js";
import { startSplash, hideSplash, setSplashStatus } from "./splash.js";
import { startTracker, stopTracker } from "./app.js?v=177";
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
  authSubtitle.textContent = "Step 1 - Connect this shop-s Firebase";
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
  try{
    const pending = sessionStorage.getItem("s4_pending_invite_email");
    if(pending && document.getElementById("staffEmail")){
      document.getElementById("staffEmail").value = pending;
    }
  }catch(_){}
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
  let timer = null;
  return Promise.race([
    promise,
    new Promise((_r, reject)=>{ timer = setTimeout(()=> reject(new Error(label)), ms); })
  ]).finally(()=>{ if(timer) clearTimeout(timer); });
}

function wireFirebase(cfg){
  firebaseConfig = cfg;
  fbApp = initializeApp(cfg);
  auth = getAuth(fbApp);
  try{
    db = initializeFirestore(fbApp, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  }catch(e){
    console.warn("Firestore persistence unavailable, using memory cache:", e);
    db = getFirestore(fbApp);
  }
  initActivityLog(db);
  initAuthModule(auth, db);
  shopDocRef = doc(db, "shop", "info");
  firebaseReady = true;
}

async function enterAppFromShopDoc(data){
  // Fail closed: timeout/error must not open the app as a free trial.
  let access;
  try{
    access = await withTimeout(getAccessStatus(), 5000, "LICENSE_TIMEOUT");
  }catch(_){
    access = { allowed: false, reason: "LICENSE_VERIFY_FAILED", deviceFingerprint: "", maskedFingerprint: "-" };
  }
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
    setSplashStatus("Connecting-");
    // Keep the same promise - a timeout must neither abandon restore nor flash a false error.
    const restorePromise = restoreSession();
    restorePromise.catch(()=>{});
    let restored = false;
    try{
      restored = await withTimeout(restorePromise, 12000, "AUTH_TIMEOUT");
    }catch(e){
      if(String(e?.message || e) !== "AUTH_TIMEOUT") throw e;
      // restoreSession() has no internal timeout and can hang forever, so never keep
      // waiting here - that leaves an auth card with every field hidden. Show the login
      // form; if the in-flight restore later wins it calls hideAuth() on its own.
      await hideSplash(lang);
      showLogin();
      authSubtitle.textContent = "Still signing you in- you can also log in manually";
      return;
    }
    if(restored){
      await hideSplash(lang);
      return;
    }
    setSplashStatus("Almost ready-");
    // shop/info requires signed-in read - cannot probe existence before login.
    await hideSplash(lang);
    showLogin();
  }catch{
    stopTracker();
    await hideSplash(lang);
    showLogin();
    showAuthMessage("Connection failed. Check internet and try again.");
  }
}

async function bootApp(){
  startSplash(lang);
  showAuthScreen();
  // Never leave splash forever if license/Firebase hangs (must outlast restore soft-timeout).
  const splashWatchdog = setTimeout(()=>{
    hideSplash(lang).catch(()=>{});
  }, 15000);
  try{
    setSplashStatus("Starting-");
    // Start 15-day trial clock on first open (does not block login)
    try{
      await withTimeout(getAccessStatus(), 5000, "LICENSE_TIMEOUT");
    }catch(_){}
    const cfg = await withTimeout(resolveFirebaseConfig(), 5000, "CONFIG_TIMEOUT").catch(()=> null);
    if(!isFirebaseConfigReady(cfg)){
      await hideSplash(lang);
      showFirebaseConfigScreen();
      return;
    }
    wireFirebase(cfg);
    await startAuth();
  }catch(e){
    console.error("bootApp failed", e);
    await hideSplash(lang);
    showFirebaseConfigScreen();
    showAuthMessage("Could not start. Check Firebase config.");
  }finally{
    clearTimeout(splashWatchdog);
  }
}

async function doSaveInviteCode(){
  try{
    const { config, inviteEmail, inviteId } = parseInviteCode(document.getElementById("inviteCodePaste")?.value);
    await saveFirebaseConfig(config);
    showAuthMessage("Invite code accepted. Reloading-");
    try{
      if(inviteEmail) sessionStorage.setItem("s4_pending_invite_email", inviteEmail);
      if(inviteId) sessionStorage.setItem("s4_pending_invite_id", inviteId);
    }catch(_){}
    setTimeout(()=> location.reload(), 500);
  }catch(e){
    const map = {
      CONFIG_EMPTY: "Paste the invite code first.",
      CONFIG_INVALID: "Invalid invite code.",
      CONFIG_INCOMPLETE: "Invite code is missing Firebase fields."
    };
    showAuthMessage(map[e.message] || String(e.message || e));
  }
}

async function doSaveFirebaseConfig(){
  try{
    const cfg = parseFirebaseConfigPaste(document.getElementById("configPaste").value);
    await saveFirebaseConfig(cfg);
    showAuthMessage("Firebase connected. Reloading-");
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
    showAuthMessage("Creating account-");
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
    if(!snap.exists()){
      await logoutUser();
      return showAuthMessage("Shop not set up. Use Create Account (owner) first.");
    }
    await enterAppFromShopDoc(snap.data());
  }catch(e){
    if((e.code || e.message) === "EMAIL_NOT_VERIFIED"){
      showVerifyScreen(email, `${email} is not verified yet. Check inbox, click the link, then Login.`);
    } else if((e.code || e.message) === "SHOP_EXISTS"){
      showAuthMessage(authErrorText("SHOP_EXISTS", lang));
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
    showAuthMessage("Creating account-");
    _pendingVerifyPassword = p;
    await staffAcceptInvite({
      email,
      password: p,
      displayName,
      inviteId: (()=>{ try{ return sessionStorage.getItem("s4_pending_invite_id") || ""; }catch(_){ return ""; } })()
    });
    try{ sessionStorage.removeItem("s4_pending_invite_id"); }catch(_){}
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
    if((e.code || e.message) === "ALREADY_VERIFIED") showAuthMessage("Already verified - you can Login now.");
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
  // Cannot read shop/info while signed out - existence is enforced in ownerSetupShop after Auth.
  showSetup();
}

function startUi(){
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
  document.getElementById("inviteCodeSaveBtn")?.addEventListener("click", doSaveInviteCode);
  document.getElementById("changeFirebaseConfigBtn")?.addEventListener("click", doChangeFirebaseConfig);
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
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", startUi);
}else{
  startUi();
}

if(!isDesktopApp && "serviceWorker" in navigator){
  window.addEventListener("load", ()=> navigator.serviceWorker.register("./sw.js?v=177").catch(()=>{}));
}
