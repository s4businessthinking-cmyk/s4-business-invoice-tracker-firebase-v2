// ============================================================
// AUTH — Owner + Staff accounts
// Email/Password ONLY — no Google Sign-In
// Email verification required before login is accepted
// Owner: shop setup · Staff: owner invite → own account
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
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

// ============================================================
// OWNER SETUP — email/password, send verification, sign out
// ============================================================
export async function ownerSetupShop({ email, password, shopName, addr, phone, ownerDisplayName }){
  const em = normalizeEmail(email);
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");
  if(!shopName?.trim()) throw new Error("SHOP_NAME_REQUIRED");
  if(String(password || "").length < 6) throw new Error("PASSWORD_SHORT");

  const shopSnap = await getDoc(doc(_db, "shop", "info"));
  if(shopSnap.exists()) throw new Error("SHOP_EXISTS");

  const cred = await createUserWithEmailAndPassword(_auth, em, password);
  const uid = cred.user.uid;
  const displayName = (ownerDisplayName || shopName).trim();

  // send verification email before writing to Firestore
  await sendEmailVerification(cred.user);

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

  // sign out immediately — must verify email before logging in
  await signOut(_auth);
  currentMember = null;
  return { emailSent: true, email: em };
}

// ============================================================
// LOGIN — email/password, block if not verified
// ============================================================
export async function loginWithEmail({ email, password }){
  const em = normalizeEmail(email);
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");

  const cred = await signInWithEmailAndPassword(_auth, em, password);

  // reload to get latest emailVerified status
  await reload(cred.user);

  if(!cred.user.emailVerified){
    await signOut(_auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  const member = await loadMember(cred.user.uid);
  if(!member) throw new Error("NOT_A_MEMBER");
  return member;
}

// ============================================================
// STAFF INVITE ACCEPT — email/password, send verification, sign out
// ============================================================
export async function staffAcceptInvite({ email, password, displayName }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");
  if(!name) throw new Error("DISPLAY_NAME_REQUIRED");
  if(String(password || "").length < 6) throw new Error("PASSWORD_SHORT");

  const inviteSnap = await getDocs(
    query(
      collection(_db, "invites"),
      where("email", "==", em),
      where("status", "==", "pending")
    )
  );

  if(inviteSnap.empty) throw new Error("NO_INVITE");

  const cred = await createUserWithEmailAndPassword(_auth, em, password);
  const uid = cred.user.uid;
  const inviteDocRef = inviteSnap.docs[0];
  const inviteId = inviteDocRef.id;

  await sendEmailVerification(cred.user);

  await setDoc(doc(_db, "members", uid), {
    uid,
    email: em,
    displayName: name,
    role: "staff",
    status: "active",
    inviteId,
    invitedBy: inviteDocRef.data().invitedBy || "",
    permissions: { ...DEFAULT_STAFF_PERMISSIONS },
    joinedAt: Date.now()
  });

  await updateDoc(doc(_db, "invites", inviteId), {
    status: "accepted",
    acceptedAt: Date.now(),
    memberUid: uid
  });

  // sign out immediately — must verify email before logging in
  await signOut(_auth);
  currentMember = null;
  return { emailSent: true, email: em };
}

// ============================================================
// RESEND VERIFICATION — user signs in, resend, sign out
// ============================================================
export async function resendVerificationEmail({ email, password }){
  const em = normalizeEmail(email);
  const cred = await signInWithEmailAndPassword(_auth, em, password);
  if(cred.user.emailVerified){
    await signOut(_auth);
    throw new Error("ALREADY_VERIFIED");
  }
  await sendEmailVerification(cred.user);
  await signOut(_auth);
  return { emailSent: true };
}

export async function logoutUser(){
  currentMember = null;
  if(_auth) await signOut(_auth);
}

export async function sendPasswordReset(email){
  const em = normalizeEmail(email);
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");
  await sendPasswordResetEmail(_auth, em);
}

export async function inviteStaff({ email, displayName, invitedByUid }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");
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

/** Default staff module permissions (owner always has all) */
export const DEFAULT_STAFF_PERMISSIONS = {
  dashboard: true,
  customers: true,
  ledger: true,
  statements: true,
  aging: true,
  invoices: true,
  "credit-notes": true,
  "debit-notes": true,
  receipts: true,
  allocation: true,
  cheques: true,
  discounts: true,
  reports: true,
  communication: true,
  users: false,
  audit: false,
  settings: false
};

export const PERMISSION_LABELS = [
  ["dashboard", "Dashboard"],
  ["customers", "Customer Master"],
  ["ledger", "Ledger"],
  ["statements", "Statements"],
  ["aging", "Aging"],
  ["invoices", "Invoices"],
  ["credit-notes", "Credit Notes"],
  ["debit-notes", "Debit Notes"],
  ["receipts", "Receipts"],
  ["allocation", "Allocation"],
  ["cheques", "Cheque / PDC"],
  ["discounts", "Discounts"],
  ["reports", "Reports"],
  ["communication", "WhatsApp"],
  ["users", "Users & Roles"],
  ["audit", "Audit"],
  ["settings", "Settings"]
];

export function resolvePermissions(member){
  if(!member) return { ...DEFAULT_STAFF_PERMISSIONS };
  if(member.role === "owner"){
    const all = {};
    PERMISSION_LABELS.forEach(([k])=> { all[k] = true; });
    return all;
  }
  return { ...DEFAULT_STAFF_PERMISSIONS, ...(member.permissions || {}) };
}

export function memberCan(member, pageId){
  return !!resolvePermissions(member)[pageId];
}

export async function updateStaffPermissions(staffUid, permissions){
  await updateDoc(doc(_db, "members", staffUid), {
    permissions: permissions || {},
    permissionsUpdatedAt: Date.now()
  });
}

export function authErrorText(code, lang = "bn"){
  const bn = {
    EMAIL_REQUIRED: "সঠিক email address লিখুন।",
    SHOP_NAME_REQUIRED: "দোকানের নাম লিখুন।",
    PASSWORD_SHORT: "Password কমপক্ষে ৬ অক্ষরের হতে হবে।",
    DISPLAY_NAME_REQUIRED: "স্টাফের নাম লিখুন।",
    SHOP_EXISTS: "দোকান আগে থেকেই setup হয়েছে — Login করুন।",
    NOT_A_MEMBER: "এই account দোকানের member নয়।",
    EMAIL_NOT_VERIFIED: "Email verify করা হয়নি। Inbox চেক করুন এবং verification link-এ ক্লিক করুন।",
    ALREADY_VERIFIED: "Email আগে থেকেই verified।",
    NO_INVITE: "এই email-এ কোনো pending invite নেই। Owner-কে আগে invite করতে বলুন।",
    ALREADY_MEMBER: "এই email ইতিমধ্যে active member।",
    INVITE_PENDING: "এই email-এ ইতিমধ্যে pending invite আছে।",
    "auth/invalid-api-key": "Firebase API key ভুল — firebase-config.js চেক করুন।",
    "auth/operation-not-allowed": "Firebase Console-এ Email/Password Sign-In enable করুন।",
    "auth/configuration-not-found": "Firebase Authentication এখনো চালু হয়নি। Console → Authentication → Get started → Email/Password ON করুন।",
    "auth/unauthorized-domain": "এই domain authorized নয়। Console → Authorized domains-এ localhost যোগ করুন।",
    "auth/email-already-in-use": "এই email দিয়ে account আগে থেকেই আছে — Login করুন।",
    "auth/invalid-credential": "Email বা password ভুল।",
    "auth/invalid-email": "Email ঠিক নয়।",
    "auth/weak-password": "Password খুব দুর্বল।",
    "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার করুন।",
    "auth/user-not-found": "Account পাওয়া যায়নি।",
    "auth/wrong-password": "Password ভুল।"
  };
  const en = {
    EMAIL_REQUIRED: "Enter a valid email address.",
    SHOP_NAME_REQUIRED: "Enter shop name.",
    PASSWORD_SHORT: "Password must be at least 6 characters.",
    DISPLAY_NAME_REQUIRED: "Enter staff display name.",
    SHOP_EXISTS: "Shop is already set up — use Login.",
    NOT_A_MEMBER: "This account is not a shop member.",
    EMAIL_NOT_VERIFIED: "Email not verified. Check your inbox and click the verification link.",
    ALREADY_VERIFIED: "Email is already verified.",
    NO_INVITE: "No pending invite for this email. Ask the owner to invite you first.",
    ALREADY_MEMBER: "This email is already an active member.",
    INVITE_PENDING: "A pending invite already exists for this email.",
    "auth/invalid-api-key": "Invalid Firebase API key — check firebase-config.js.",
    "auth/operation-not-allowed": "Enable Email/Password sign-in in Firebase Console.",
    "auth/configuration-not-found": "Firebase Authentication is not enabled. Console → Authentication → Get started → turn ON Email/Password.",
    "auth/unauthorized-domain": "This domain is not authorized. Add localhost under Authorized domains in Firebase Console.",
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
