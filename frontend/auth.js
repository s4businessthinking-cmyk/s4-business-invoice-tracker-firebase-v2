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
  const role = String(data.role || "staff").trim().toLowerCase();
  currentMember = { uid, ...data, role };
  return currentMember;
}

async function deletePendingSetup(uid){
  try{ await deleteDoc(doc(_db, "pendingSetups", uid)); }catch(_){}
}

/** After email verify: finish owner shop+member or staff member from pendingSetups/{uid}. */
async function completePendingSetup(user){
  if(!user?.uid || !_db) return null;
  const pendingRef = doc(_db, "pendingSetups", user.uid);
  const pendingSnap = await getDoc(pendingRef);
  if(!pendingSnap.exists()) return null;
  const pending = pendingSnap.data() || {};
  const em = normalizeEmail(user.email || pending.email);

  if(pending.type === "owner"){
    const shopRef = doc(_db, "shop", "info");
    const shopSnap = await getDoc(shopRef);
    if(shopSnap.exists()){
      const ownerUid = shopSnap.data()?.ownerUid;
      if(ownerUid && ownerUid !== user.uid){
        await deletePendingSetup(user.uid);
        throw new Error("SHOP_EXISTS");
      }
    }else{
      await setDoc(shopRef, {
        name: String(pending.shopName || "").trim(),
        addr: String(pending.addr || "").trim(),
        phone: String(pending.phone || "").trim(),
        operatingMode: "full",
        ownerUid: user.uid,
        ownerEmail: em,
        createdAt: pending.createdAt || Date.now()
      });
    }
    const memberRef = doc(_db, "members", user.uid);
    if(!(await getDoc(memberRef)).exists()){
      await setDoc(memberRef, {
        uid: user.uid,
        email: em,
        displayName: String(pending.displayName || pending.shopName || "").trim() || em,
        role: "owner",
        status: "active",
        joinedAt: Date.now()
      });
    }
    await deletePendingSetup(user.uid);
    return loadMember(user.uid);
  }

  if(pending.type === "staff"){
    const inviteId = String(pending.inviteId || "").trim();
    if(!inviteId){
      await deletePendingSetup(user.uid);
      throw new Error("NO_INVITE");
    }
    const inviteRef = doc(_db, "invites", inviteId);
    const inviteSnap = await getDoc(inviteRef);
    if(!inviteSnap.exists()){
      await deletePendingSetup(user.uid);
      throw new Error("NO_INVITE");
    }
    const inviteData = inviteSnap.data() || {};
    if(normalizeEmail(inviteData.email) !== em || inviteData.status !== "pending"){
      if(inviteData.status === "accepted" && inviteData.memberUid === user.uid){
        await deletePendingSetup(user.uid);
        return loadMember(user.uid);
      }
      await deletePendingSetup(user.uid);
      throw new Error("NO_INVITE");
    }
    const memberRef = doc(_db, "members", user.uid);
    if(!(await getDoc(memberRef)).exists()){
      await setDoc(memberRef, {
        uid: user.uid,
        email: em,
        displayName: String(pending.displayName || inviteData.displayName || "").trim() || em,
        role: "staff",
        status: "active",
        inviteId,
        invitedBy: inviteData.invitedBy || "",
        permissions: { ...DEFAULT_STAFF_PERMISSIONS },
        joinedAt: Date.now()
      });
    }
    if(inviteData.status === "pending"){
      await updateDoc(inviteRef, {
        status: "accepted",
        acceptedAt: Date.now(),
        memberUid: user.uid,
        email: em
      });
    }
    await deletePendingSetup(user.uid);
    return loadMember(user.uid);
  }

  await deletePendingSetup(user.uid);
  return null;
}

export async function tryRestoreSession(){
  const user = await waitForAuthReady();
  if(!user) return null;
  try{ await reload(user); }catch(_){}
  if(!user.emailVerified){
    await signOut(_auth);
    currentMember = null;
    return null;
  }
  let member = await loadMember(user.uid);
  if(!member){
    try{
      member = await completePendingSetup(user);
    }catch(err){
      console.warn("completePendingSetup failed:", err);
      member = null;
    }
  }
  if(!member) return null;
  return { user, member };
}

// ============================================================
// OWNER SETUP — Auth + pendingSetups only; Firestore shop after verify
// ============================================================
export async function ownerSetupShop({ email, password, shopName, addr, phone, ownerDisplayName }){
  const em = normalizeEmail(email);
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");
  if(!shopName?.trim()) throw new Error("SHOP_NAME_REQUIRED");
  if(String(password || "").length < 6) throw new Error("PASSWORD_SHORT");

  let cred;
  let createdNow = false;
  try{
    cred = await createUserWithEmailAndPassword(_auth, em, password);
    createdNow = true;
  }catch(e){
    if(e.code === "auth/email-already-in-use"){
      cred = await signInWithEmailAndPassword(_auth, em, password);
    }else{
      throw e;
    }
  }

  try{ await cred.user.getIdToken(true); }catch(_){}

  try{
    const shopSnap = await getDoc(doc(_db, "shop", "info"));
    if(shopSnap.exists()){
      const ownerUid = shopSnap.data()?.ownerUid;
      if(ownerUid && ownerUid !== cred.user.uid){
        await signOut(_auth);
        throw new Error("SHOP_EXISTS");
      }
      // Same owner recovering — refresh pending if member missing
      const mem = await getDoc(doc(_db, "members", cred.user.uid));
      if(mem.exists() && mem.data()?.status === "active"){
        await signOut(_auth);
        throw new Error("SHOP_EXISTS");
      }
    }

    const displayName = (ownerDisplayName || shopName).trim();
    await setDoc(doc(_db, "pendingSetups", cred.user.uid), {
      type: "owner",
      email: em,
      shopName: shopName.trim(),
      addr: (addr || "").trim(),
      phone: (phone || "").trim(),
      displayName,
      createdAt: Date.now()
    });

    if(!cred.user.emailVerified){
      await sendEmailVerification(cred.user);
    }else{
      await completePendingSetup(cred.user);
    }
  }catch(e){
    // Rules deny shop/info to non-owners once shop exists — treat as occupied.
    const denied = e?.code === "permission-denied"
      || /permission.?denied|insufficient permissions/i.test(String(e?.message || e || ""));
    if(denied){
      if(createdNow){
        try{ await cred.user.delete(); }catch(_){}
      }
      await signOut(_auth).catch(()=>{});
      currentMember = null;
      throw new Error("SHOP_EXISTS");
    }
    // Only remove brand-new Auth users blocked by an existing other-owner shop.
    // Keep the account if verification/pending write already started (retry via Login).
    if(createdNow && (e.message === "SHOP_EXISTS" || e.code === "SHOP_EXISTS")){
      try{ await cred.user.delete(); }catch(_){}
    }
    await signOut(_auth).catch(()=>{});
    currentMember = null;
    throw e;
  }

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

  await reload(cred.user);

  if(!cred.user.emailVerified){
    await signOut(_auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  let member = await loadMember(cred.user.uid);
  if(!member){
    member = await completePendingSetup(cred.user);
  }
  if(!member) throw new Error("NOT_A_MEMBER");
  return member;
}

// ============================================================
// STAFF INVITE ACCEPT — Auth first, pending until email verified
// ============================================================
export async function staffAcceptInvite({ email, password, displayName, inviteId = "" }){
  const em = normalizeEmail(email);
  const name = String(displayName || "").trim();
  const wantedInviteId = String(inviteId || "").trim();
  if(!em || !em.includes("@")) throw new Error("EMAIL_REQUIRED");
  if(!name) throw new Error("DISPLAY_NAME_REQUIRED");
  if(String(password || "").length < 6) throw new Error("PASSWORD_SHORT");

  let cred;
  let createdNow = false;
  try{
    cred = await createUserWithEmailAndPassword(_auth, em, password);
    createdNow = true;
  }catch(e){
    if(e.code === "auth/email-already-in-use"){
      cred = await signInWithEmailAndPassword(_auth, em, password);
      const existing = await getDoc(doc(_db, "members", cred.user.uid));
      if(existing.exists() && existing.data()?.status === "active"){
        await signOut(_auth);
        throw new Error("ALREADY_MEMBER");
      }
    }else{
      throw e;
    }
  }

  const uid = cred.user.uid;
  const authEmail = normalizeEmail(cred.user.email || em);

  try{ await cred.user.getIdToken(true); }catch(_){}

  try{
    let inviteDocRef = null;

    if(wantedInviteId){
      const byId = await getDoc(doc(_db, "invites", wantedInviteId));
      if(byId.exists()){
        const d = byId.data() || {};
        if(normalizeEmail(d.email) === authEmail && d.status === "pending"){
          inviteDocRef = byId;
        }
      }
    }

    if(!inviteDocRef){
      let inviteSnap;
      try{
        inviteSnap = await getDocs(
          query(
            collection(_db, "invites"),
            where("email", "==", authEmail),
            where("status", "==", "pending")
          )
        );
      }catch(_){
        inviteSnap = await getDocs(
          query(collection(_db, "invites"), where("email", "==", authEmail))
        );
      }
      inviteDocRef = inviteSnap.docs.find(d=> (d.data() || {}).status === "pending") || null;
    }

    if(!inviteDocRef){
      if(createdNow){
        try{ await cred.user.delete(); }catch(_){}
      }
      await signOut(_auth).catch(()=>{});
      throw new Error("NO_INVITE");
    }

    await setDoc(doc(_db, "pendingSetups", uid), {
      type: "staff",
      email: authEmail,
      displayName: name,
      inviteId: inviteDocRef.id,
      createdAt: Date.now()
    });

    if(!cred.user.emailVerified){
      await sendEmailVerification(cred.user);
    }else{
      await completePendingSetup(cred.user);
    }
  }catch(e){
    await signOut(_auth).catch(()=>{});
    throw e;
  }

  await signOut(_auth);
  currentMember = null;
  return { emailSent: true, email: authEmail };
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
    query(collection(_db, "invites"), where("email", "==", em))
  );
  if(pending.docs.some(d=> (d.data() || {}).status === "pending")) throw new Error("INVITE_PENDING");

  const ref = await addDoc(collection(_db, "invites"), {
    email: em,
    displayName: name,
    role: "staff",
    status: "pending",
    invitedBy: invitedByUid,
    createdAt: Date.now()
  });
  return { inviteId: ref.id, email: em, displayName: name };
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
  vehicles: true,
  "product-catalog": true,
  "service-catalog": true,
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
  suppliers: true,
  warehouses: true,
  inventory: true,
  "purchase-invoices": true,
  workshop: true,
  reports: true,
  communication: true,
  users: false,
  audit: false,
  settings: false
};

export const PERMISSION_LABELS = [
  ["dashboard", "Dashboard"],
  ["customers", "Customer Master"],
  ["vehicles", "Vehicles"],
  ["product-catalog", "Product Catalog"],
  ["service-catalog", "Service Catalog"],
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
  ["suppliers", "Supplier Master"],
  ["warehouses", "Warehouses"],
  ["inventory", "Stock & Ledger"],
  ["purchase-invoices", "Purchase Invoice"],
  ["workshop", "Workshop / Job Cards"],
  ["reports", "Reports"],
  ["communication", "WhatsApp"],
  ["users", "Users & Roles"],
  ["audit", "Audit"],
  ["settings", "Settings"]
];

export function resolvePermissions(member){
  const m = member || currentMember;
  if(!m) return { ...DEFAULT_STAFF_PERMISSIONS };
  if(m.role === "owner" && m.status === "active"){
    const all = {};
    PERMISSION_LABELS.forEach(([k])=> { all[k] = true; });
    return all;
  }
  return { ...DEFAULT_STAFF_PERMISSIONS, ...(m.permissions || {}) };
}

export function memberCan(member, pageId){
  const m = member || currentMember;
  if(m?.role === "owner" && m?.status === "active") return true;
  return !!resolvePermissions(m)[pageId];
}

export async function updateStaffPermissions(staffUid, permissions){
  await updateDoc(doc(_db, "members", staffUid), {
    permissions: permissions || {},
    permissionsUpdatedAt: Date.now()
  });
}

export function authErrorText(code, lang = "en"){
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
    "auth/email-already-in-use": "This email already has an account — press Create Account again with the same password, or Login.",
    "permission-denied": "Permission denied. Confirm owner invite, use the same email, and publish firestore.rules in Firebase Console.",
    "PERMISSION_DENIED": "Permission denied. Confirm owner invite, use the same email, and publish firestore.rules in Firebase Console.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/user-not-found": "No account for this email.",
    "auth/wrong-password": "Wrong password.",
    "auth/too-many-requests": "Too many attempts. Try again later."
  };
  return en[code] || en[String(code)] || String(code || "Unknown error");
}
