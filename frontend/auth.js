// ============================================================
// AUTH — Owner + Staff accounts
// Google Sign-In (primary) + Email/Password (fallback)
// Owner: shop setup · Staff: owner invite → own account
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let _auth = null;
let _db = null;
let currentMember = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function initAuthModule(auth, db){
  _auth = auth;
  _db = db;
}

export function normalizeEmail(email){
  return String(email || "").trim().toLowerCase();
}

/** Owner + staff invites must use Gmail */
export function isGmailEmail(email){
  return /^[^\s@]+@gmail\.com$/i.test(String(email || "").trim());
}

export function getCurrentMember(){
  return currentMember;
}

export function isOwnerRole(){
  return currentMember?.role === "owner" && currentMember?.status === "active";
}

export function isStaffRole(){
  return currentMember?.role === "staff" && currentMember?.status === "active";
}

export function getStaffDisplayName(){
  return (currentMember?.displayName || "").trim();
}

export function waitForAuthReady(){
  if(_auth?.currentUser) return Promise.resolve(_auth.currentUser);
  return new Promise((resolve)=>{
    const unsub = onAuthStateChanged(_auth, (user)=>{
      unsub();
      resolve(user || null);
    });
  });
}

export async function loadMember(uid){
  if(!uid || !_db) return null;
  const snap = await getDoc(doc(_db, "members", uid));
  if(!snap.exists()) return null;
  const data = snap.data();
  if(data.status !== "active") return null;
  currentMember = { uid, ...data };
  return currentMember;
}

export async function tryRestoreSession(){
  const user = await waitForAuthReady();
  if(!user) return null;
  const member = await loadMember(user.uid);
  if(!member) return null;
  return { user, member };
}

function requireSignedInUser(){
  const user = _auth?.currentUser;
  if(!user) throw new Error("NOT_SIGNED_IN");
  return user;
}

function assertGmailUser(user){
  const em = normalizeEmail(user.email);
  if(!isGmailEmail(em)){
    throw new Error("GMAIL_REQUIRED");
  }
  return em;
}

/** Cursor/GitHub-style Google popup login */
export async function signInWithGoogle(){
  const cred = await signInWithPopup(_auth, googleProvider);
  const em = assertGmailUser(cred.user);
  return { user: cred.user, email: em };
}

export async function ownerCompleteSetupAfterGoogle({ shopName, addr, phone, ownerDisplayName }){
  const user = requireSignedInUser();
  const em = assertGmailUser(user);
  if(!shopName?.trim()) throw new Error("SHOP_NAME_REQUIRED");

  const shopSnap = await getDoc(doc(_db, "shop", "info"));
  if(shopSnap.exists()) throw new Error("SHOP_EXISTS");

  const uid = user.uid;
  const displayName = (ownerDisplayName || user.displayName || shopName).trim();

  await setDoc(doc(_db, "shop", "info"), {
    name: shopName.trim(),
    addr: (addr || "").trim(),
    phone: (phone || "").trim(),
    ownerUid: uid,
    ownerEmail: em,
    authProvider: "google",
    createdAt: Date.now()
  });

  await setDoc(doc(_db, "members", uid), {
    uid,
    email: em,
    displayName,
    role: "owner",
    status: "active",
    authProvider: "google",
    joinedAt: Date.now()
  });

  currentMember = { uid, email: em, displayName, role: "owner", status: "active" };
  return currentMember;
}

export async function loginWithGoogle(){
  if(!_auth.currentUser){
    await signInWithGoogle();
  }else{
    assertGmailUser(_auth.currentUser);
  }
  const member = await loadMember(_auth.currentUser.uid);
  if(!member) throw new Error("NOT_A_MEMBER");
  return member;
}

export async function staffAcceptInviteGoogle({ displayName }){
  if(!_auth.currentUser){
    await signInWithGoogle();
  }
  const user = requireSignedInUser();
  const em = assertGmailUser(user);
  const name = String(displayName || user.displayName || "").trim();
  if(!name) throw new Error("DISPLAY_NAME_REQUIRED");

  const existing = await loadMember(user.uid);
  if(existing) return existing;

  const inviteSnap = await getDocs(
    query(
      collection(_db, "invites"),
      where("email", "==", em),
      where("status", "==", "pending")
    )
  );

  if(inviteSnap.empty){
    await signOut(_auth);
    throw new Error("NO_INVITE");
  }

  const inviteDoc = inviteSnap.docs[0];
  const inviteId = inviteDoc.id;
  const uid = user.uid;

  await setDoc(doc(_db, "members", uid), {
    uid,
    email: em,
    displayName: name,
    role: "staff",
    status: "active",
    inviteId,
    invitedBy: inviteDoc.data().invitedBy || "",
    authProvider: "google",
    joinedAt: Date.now()
  });

  await updateDoc(doc(_db, "invites", inviteId), {
    status: "accepted",
    acceptedAt: Date.now(),
    memberUid: uid
  });

  currentMember = { uid, email: em, displayName: name, role: "staff", status: "active" };
  return currentMember;
}

export async function ownerSetupShop({ email, password, shopName, addr, phone, ownerDisplayName }){
  const em = normalizeEmail(email);
  if(!isGmailEmail(em)) throw new Error("GMAIL_REQUIRED");
  if(!shopName?.trim()) throw new Error("SHOP_NAME_REQUIRED");
  if(String(password || "").length < 6) throw new Error("PASSWORD_SHORT");

  const cred = await createUserWithEmailAndPassword(_auth, em, password);
  const uid = cred.user.uid;
  const displayName = (ownerDisplayName || shopName).trim();

  await setDoc(doc(_db, "shop", "info"), {
    name: shopName.trim(),
    addr: (addr || "").trim(),
    phone: (phone || "").trim(),
    ownerUid: uid,
    ownerEmail: em,
    createdAt: Date.now()
  });

  await setDoc(doc(_db, "members", uid), {
    uid,
    email: em,
    displayName,
    role: "owner",
    status: "active",
    joinedAt: Date.now()
  });

  currentMember = { uid, email: em, displayName, role: "owner", status: "active" };
  return currentMember;
}

export async function loginWithEmail({ email, password }){
  const em = normalizeEmail(email);
  if(!isGmailEmail(em)) throw new Error("GMAIL_REQUIRED");
  const cred = await signInWithEmailAndPassword(_auth, em, password);
  const member = await loadMember(cred.user.uid);
  if(!member) throw new Error("NOT_A_MEMBER");
  return member;
}

export async function staffAcceptInvite({ email, password, displayName }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  if(!isGmailEmail(em)) throw new Error("GMAIL_REQUIRED");
  if(!name) throw new Error("DISPLAY_NAME_REQUIRED");
  if(String(password || "").length < 6) throw new Error("PASSWORD_SHORT");

  const cred = await createUserWithEmailAndPassword(_auth, em, password);
  const uid = cred.user.uid;

  const inviteSnap = await getDocs(
    query(
      collection(_db, "invites"),
      where("email", "==", em),
      where("status", "==", "pending")
    )
  );

  if(inviteSnap.empty){
    await signOut(_auth);
    throw new Error("NO_INVITE");
  }

  const inviteDoc = inviteSnap.docs[0];
  const inviteId = inviteDoc.id;

  await setDoc(doc(_db, "members", uid), {
    uid,
    email: em,
    displayName: name,
    role: "staff",
    status: "active",
    inviteId,
    invitedBy: inviteDoc.data().invitedBy || "",
    joinedAt: Date.now()
  });

  await updateDoc(doc(_db, "invites", inviteId), {
    status: "accepted",
    acceptedAt: Date.now(),
    memberUid: uid
  });

  currentMember = { uid, email: em, displayName: name, role: "staff", status: "active" };
  return currentMember;
}

export async function logoutUser(){
  currentMember = null;
  if(_auth) await signOut(_auth);
}

export async function sendPasswordReset(email){
  const em = normalizeEmail(email);
  if(!isGmailEmail(em)) throw new Error("GMAIL_REQUIRED");
  await sendPasswordResetEmail(_auth, em);
}

export async function inviteStaff({ email, displayName, invitedByUid }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  if(!isGmailEmail(em)) throw new Error("GMAIL_REQUIRED");
  if(!name) throw new Error("DISPLAY_NAME_REQUIRED");

  const existing = await getDocs(
    query(collection(_db, "members"), where("email", "==", em), where("status", "==", "active"))
  );
  if(!existing.empty) throw new Error("ALREADY_MEMBER");

  const pending = await getDocs(
    query(collection(_db, "invites"), where("email", "==", em), where("status", "==", "pending"))
  );
  if(!pending.empty) throw new Error("INVITE_PENDING");

  await addDoc(collection(_db, "invites"), {
    email: em,
    displayName: name,
    role: "staff",
    status: "pending",
    invitedBy: invitedByUid,
    createdAt: Date.now()
  });
}

export async function listTeam(){
  const membersSnap = await getDocs(query(collection(_db, "members"), orderBy("joinedAt", "desc")));
  const invitesSnap = await getDocs(
    query(collection(_db, "invites"), where("status", "==", "pending"))
  );
  const invites = invitesSnap.docs.map(d=>({ id: d.id, ...d.data() }));
  invites.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  return {
    members: membersSnap.docs.map(d=>({ id: d.id, ...d.data() })),
    invites
  };
}

export async function cancelInvite(inviteId){
  await deleteDoc(doc(_db, "invites", inviteId));
}

export async function deactivateStaff(staffUid){
  await updateDoc(doc(_db, "members", staffUid), { status: "removed", removedAt: Date.now() });
}

export function authErrorText(code, lang = "bn"){
  const bn = {
    GMAIL_REQUIRED: "Gmail (@gmail.com) বাধ্যতামূলক।",
    SHOP_NAME_REQUIRED: "দোকানের নাম লিখুন।",
    PASSWORD_SHORT: "Password কমপক্ষে 6 অক্ষরের হতে হবে।",
    DISPLAY_NAME_REQUIRED: "স্টাফের নাম লিখুন।",
    NOT_SIGNED_IN: "Google login সম্পন্ন হয়নি — আবার চেষ্টা করুন।",
    SHOP_EXISTS: "দোকান আগে থেকেই setup হয়েছে — Login করুন।",
    NOT_A_MEMBER: "এই account দোকানের member নয়। Owner invite করেছেন কিনা বা owner setup সম্পন্ন হয়েছে কিনা দেখুন।",
    "auth/popup-closed-by-user": "Google login বাতিল হয়েছে।",
    "auth/popup-blocked": "Popup ব্লক হয়েছে — browser/Electron popup allow করুন।",
    "auth/cancelled-popup-request": "Google login বাতিল হয়েছে।",
    "auth/invalid-api-key": "Firebase API key ভুল — firebase-config.js চেক করুন।",
    "auth/operation-not-allowed": "Firebase Console-এ Google Sign-In enable করুন।",
    NO_INVITE: "এই Gmail-এ কোনো pending invite নেই। Owner-কে আগে invite করতে বলুন।",
    ALREADY_MEMBER: "এই Gmail ইতিমধ্যে active member।",
    INVITE_PENDING: "এই Gmail-এ ইতিমধ্যে pending invite আছে।",
    "auth/email-already-in-use": "এই Gmail দিয়ে account আগে থেকেই আছে — Login করুন।",
    "auth/invalid-credential": "Email বা password ভুল।",
    "auth/invalid-email": "Email ঠিক নয়।",
    "auth/weak-password": "Password খুব দুর্বল।",
    "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার করুন।",
    "auth/user-not-found": "Account পাওয়া যায়নি।",
    "auth/wrong-password": "Password ভুল।"
  };
  const en = {
    GMAIL_REQUIRED: "Gmail address (@gmail.com) is required.",
    SHOP_NAME_REQUIRED: "Enter shop name.",
    PASSWORD_SHORT: "Password must be at least 6 characters.",
    DISPLAY_NAME_REQUIRED: "Enter staff display name.",
    NOT_SIGNED_IN: "Google sign-in did not complete — try again.",
    SHOP_EXISTS: "Shop is already set up — use Login.",
    NOT_A_MEMBER: "This account is not a shop member. Ask the owner to send an invite first.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/popup-blocked": "Popup blocked — allow popups in browser or Electron.",
    "auth/cancelled-popup-request": "Google sign-in was cancelled.",
    "auth/invalid-api-key": "Invalid Firebase API key — check firebase-config.js.",
    "auth/operation-not-allowed": "Enable Google Sign-In in Firebase Console.",
    NO_INVITE: "No pending invite for this Gmail. Ask the owner to invite you first.",
    ALREADY_MEMBER: "This Gmail is already an active member.",
    INVITE_PENDING: "A pending invite already exists for this Gmail.",
    "auth/email-already-in-use": "This Gmail already has an account — use Login.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Invalid email.",
    "auth/weak-password": "Password is too weak.",
    "auth/too-many-requests": "Too many attempts — try again later.",
    "auth/user-not-found": "Account not found.",
    "auth/wrong-password": "Wrong password."
  };
  const t = lang === "en" ? en : bn;
  return t[code] || code || (lang === "en" ? "Authentication failed." : "Login ব্যর্থ হয়েছে।");
}
