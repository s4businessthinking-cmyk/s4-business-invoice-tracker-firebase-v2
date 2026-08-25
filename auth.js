// ============================================================
// AUTH — Owner + Staff accounts
// Email/Password + Email Verification (Facebook-style)
// Any personal email allowed (not restricted to Gmail).
// Owner: shop setup · Staff: owner invite → own account
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  reload
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let _auth = null;
let _db = null;
let currentMember = null;

export function initAuthModule(auth, db){
  _auth = auth;
  _db = db;
}

export function normalizeEmail(email){
  return String(email || "").trim().toLowerCase();
}

/** Any real email address is allowed — owner's personal email, not restricted to Gmail. */
export function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

// Kept as an alias so any old callers don't break; no longer Gmail-only.
export function isGmailEmail(email){
  return isValidEmail(email);
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

/** On app start: only restore a session if the saved user is signed in AND verified. */
export async function tryRestoreSession(){
  const user = await waitForAuthReady();
  if(!user) return null;
  try{ await reload(user); }catch(_e){ /* ignore, use cached state */ }
  if(!user.emailVerified){
    await signOut(_auth);
    return null;
  }
  const member = await loadMember(user.uid);
  if(!member) return null;
  return { user, member };
}

/**
 * Owner creates account + shop in one step (Facebook-style signup):
 * account is created, shop/member docs are written, a verification email
 * is sent, then the session is immediately signed out. The owner must
 * click the verification link in their inbox and then log in.
 */
export async function ownerSetupShop({ email, password, shopName, addr, phone, ownerDisplayName }){
  const em = normalizeEmail(email);
  if(!isValidEmail(em)) throw new Error("EMAIL_INVALID");
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

  await sendEmailVerification(cred.user);
  await signOut(_auth);

  return { email: em };
}

export async function loginWithEmail({ email, password }){
  const em = normalizeEmail(email);
  if(!isValidEmail(em)) throw new Error("EMAIL_INVALID");
  const cred = await signInWithEmailAndPassword(_auth, em, password);

  try{ await reload(cred.user); }catch(_e){ /* ignore */ }

  if(!cred.user.emailVerified){
    await signOut(_auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const member = await loadMember(cred.user.uid);
  if(!member){
    await signOut(_auth);
    throw new Error("NOT_A_MEMBER");
  }
  return member;
}

/** Staff creates their own account after owner invites their email; same verification flow. */
export async function staffAcceptInvite({ email, password, displayName }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  if(!isValidEmail(em)) throw new Error("EMAIL_INVALID");
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

  await sendEmailVerification(cred.user);
  await signOut(_auth);

  return { email: em };
}

/**
 * Resend the verification email. Needs the password again because the user
 * isn't kept signed in after signup — this signs in briefly, resends, then
 * signs back out.
 */
export async function resendVerificationEmail({ email, password }){
  const em = normalizeEmail(email);
  if(!isValidEmail(em)) throw new Error("EMAIL_INVALID");
  if(!password) throw new Error("PASSWORD_REQUIRED_FOR_RESEND");

  const cred = await signInWithEmailAndPassword(_auth, em, password);
  try{
    await reload(cred.user);
    if(cred.user.emailVerified){
      await signOut(_auth);
      throw new Error("ALREADY_VERIFIED");
    }
    await sendEmailVerification(cred.user);
  }finally{
    await signOut(_auth);
  }
}

export async function logoutUser(){
  currentMember = null;
  if(_auth) await signOut(_auth);
}

export async function sendPasswordReset(email){
  const em = normalizeEmail(email);
  if(!isValidEmail(em)) throw new Error("EMAIL_INVALID");
  await sendPasswordResetEmail(_auth, em);
}

export async function inviteStaff({ email, displayName, invitedByUid }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  if(!isValidEmail(em)) throw new Error("EMAIL_INVALID");
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
    EMAIL_INVALID: "সঠিক email address লিখুন।",
    SHOP_NAME_REQUIRED: "দোকানের নাম লিখুন।",
    PASSWORD_SHORT: "Password কমপক্ষে 6 অক্ষরের হতে হবে।",
    PASSWORD_REQUIRED_FOR_RESEND: "Verification email আবার পাঠাতে password লিখুন।",
    DISPLAY_NAME_REQUIRED: "স্টাফের নাম লিখুন।",
    SHOP_EXISTS: "দোকান আগে থেকেই setup হয়েছে — Login করুন।",
    NOT_A_MEMBER: "এই account দোকানের member নয়। Owner invite করেছেন কিনা বা owner setup সম্পন্ন হয়েছে কিনা দেখুন।",
    EMAIL_NOT_VERIFIED: "আগে email verify করুন। Inbox-এ verification link পাঠানো হয়েছে — link-এ ক্লিক করে তারপর Login করুন।",
    ALREADY_VERIFIED: "এই email আগে থেকেই verified — সরাসরি Login করুন।",
    NO_INVITE: "এই email-এ কোনো pending invite নেই। Owner-কে আগে invite করতে বলুন।",
    ALREADY_MEMBER: "এই email ইতিমধ্যে active member।",
    INVITE_PENDING: "এই email-এ ইতিমধ্যে pending invite আছে।",
    "auth/email-already-in-use": "এই email দিয়ে account আগে থেকেই আছে — Login করুন।",
    "auth/invalid-credential": "Email বা password ভুল।",
    "auth/invalid-email": "Email ঠিক নয়।",
    "auth/weak-password": "Password খুব দুর্বল।",
    "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার করুন।",
    "auth/user-not-found": "Account পাওয়া যায়নি।",
    "auth/wrong-password": "Password ভুল।"
  };
  const en = {
    EMAIL_INVALID: "Enter a valid email address.",
    SHOP_NAME_REQUIRED: "Enter shop name.",
    PASSWORD_SHORT: "Password must be at least 6 characters.",
    PASSWORD_REQUIRED_FOR_RESEND: "Enter your password to resend the verification email.",
    DISPLAY_NAME_REQUIRED: "Enter staff display name.",
    SHOP_EXISTS: "Shop is already set up — use Login.",
    NOT_A_MEMBER: "This account is not a shop member. Ask the owner to send an invite first.",
    EMAIL_NOT_VERIFIED: "Please verify your email first. Check your inbox for the verification link, then log in.",
    ALREADY_VERIFIED: "This email is already verified — log in directly.",
    NO_INVITE: "No pending invite for this email. Ask the owner to invite you first.",
    ALREADY_MEMBER: "This email is already an active member.",
    INVITE_PENDING: "A pending invite already exists for this email.",
    "auth/email-already-in-use": "This email already has an account — use Login.",
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
