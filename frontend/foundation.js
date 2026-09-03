// ============================================================
// FOUNDATION — Build Order §1 (S4 Workshop ERP A–Z Architecture)
// Tenant (per-shop Firebase), branches, operating mode, roles,
// module visibility, document numbering, audit context.
// ============================================================

import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot,
  runTransaction, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export const OPERATING_MODE = { FULL: "full", TOTAL: "total" };

/** Architecture §13 roles (staff legacy maps to advisor). */
export const ROLES = {
  owner: "owner",
  branch_manager: "branch_manager",
  advisor: "advisor",
  technician: "technician",
  accountant: "accountant",
  staff: "staff"
};

export const ROLE_LABELS = {
  owner: "Owner",
  branch_manager: "Branch Manager",
  advisor: "Advisor / Salesman",
  technician: "Technician",
  accountant: "Accountant",
  staff: "Staff"
};

/** Sidebar structure — Architecture §14 UI/UX */
export const NAV_GROUPS = [
  {
    title: "MAIN",
    items: [{ id: "dashboard", label: "Dashboard", icon: "▦" }]
  },
  {
    title: "MASTERS",
    items: [
      { id: "customers", label: "Customer Master", icon: "♙" },
      { id: "vehicles", label: "Vehicles", icon: "🚙" },
      { id: "product-catalog", label: "Product Master", icon: "▣" },
      { id: "service-catalog", label: "Service Master", icon: "◉" },
      { id: "suppliers", label: "Vendor Master", icon: "♙" },
      { id: "warehouses", label: "Warehouses", icon: "▥" }
    ]
  },
  {
    title: "WORKSHOP",
    items: [{ id: "workshop", label: "Workshop Ops", icon: "🔧" }]
  },
  {
    title: "PURCHASE",
    items: [{ id: "purchase-invoices", label: "Purchase Invoice", icon: "▤" }]
  },
  {
    title: "INVENTORY",
    items: [{ id: "inventory", label: "Stock & Ledger", icon: "▥" }]
  },
  {
    title: "SALES",
    items: [
      { id: "invoices", label: "Invoices", icon: "▤" },
      { id: "credit-notes", label: "Credit Notes", icon: "↩" },
      { id: "debit-notes", label: "Debit Notes", icon: "↗" }
    ]
  },
  {
    title: "RECEIVABLES",
    items: [
      { id: "ledger", label: "Customer Ledger", icon: "▤" },
      { id: "statements", label: "Statements", icon: "▥" },
      { id: "aging", label: "Aging", icon: "◷" },
      { id: "receipts", label: "Receipts", icon: "▣" },
      { id: "allocation", label: "Allocation", icon: "⇄" },
      { id: "cheques", label: "Cheque / PDC", icon: "▭" },
      { id: "discounts", label: "Discounts", icon: "%" }
    ]
  },
  {
    title: "ACCOUNTS",
    items: [{ id: "accounts", label: "Accounting", icon: "◎", placeholder: true }]
  },
  {
    title: "VAT",
    items: [{ id: "vat", label: "VAT & Tax", icon: "◈", placeholder: true }]
  },
  {
    title: "HR",
    items: [{ id: "hr", label: "Staff & Payroll", icon: "♟", placeholder: true }]
  },
  {
    title: "EXPENSES",
    items: [{ id: "expenses", label: "Expenses", icon: "₿", placeholder: true }]
  },
  {
    title: "ASSETS",
    items: [{ id: "assets", label: "Fixed Assets", icon: "⬡", placeholder: true }]
  },
  {
    title: "REPORTS",
    items: [
      { id: "reports", label: "Reports", icon: "▥" },
      { id: "communication", label: "WhatsApp / Reminders", icon: "◉" }
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { id: "users", label: "Users & Roles", icon: "♙" },
      { id: "audit", label: "Audit Trail", icon: "◷" },
      { id: "settings", label: "Settings", icon: "⚙" }
    ]
  }
];

/** Architecture §1 TOTAL MODE — unavailable modules (menu + access). */
export const TOTAL_MODE_BLOCKED = new Set([
  "vehicles",
  "product-catalog",
  "service-catalog",
  "suppliers",
  "warehouses",
  "inventory",
  "purchase-invoices",
  "workshop",
  "inventory",
  "accounts",
  "vat",
  "hr",
  "expenses",
  "assets"
]);

const BRANCH_SESSION_KEY = "s4_current_branch_v1";

let _db = null;
let _shop = {};
let _branches = [];
let _currentBranchId = null;
let _branchUnsub = null;

export function initFoundation(db, shop){
  _db = db;
  _shop = shop || {};
  try{
    _currentBranchId = sessionStorage.getItem(BRANCH_SESSION_KEY) || "";
  }catch(_){
    _currentBranchId = "";
  }
}

export function setFoundationShop(shop){
  _shop = shop || {};
}

export function getOperatingMode(shop){
  const s = shop || _shop;
  const m = String(s?.operatingMode || OPERATING_MODE.FULL).toLowerCase();
  return m === OPERATING_MODE.TOTAL ? OPERATING_MODE.TOTAL : OPERATING_MODE.FULL;
}

export function isTotalMode(shop){
  return getOperatingMode(shop) === OPERATING_MODE.TOTAL;
}

export function isFullMode(shop){
  return !isTotalMode(shop);
}

export function isModuleAllowedInMode(pageId, shop){
  if(!pageId) return false;
  if(!isTotalMode(shop)) return true;
  return !TOTAL_MODE_BLOCKED.has(pageId);
}

export function roleLabel(role){
  const r = String(role || "staff").toLowerCase();
  return ROLE_LABELS[r] || ROLE_LABELS.staff;
}

export function memberBranchIds(member){
  const ids = member?.branchIds;
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
}

export function memberCanAccessBranch(member, branchId){
  if(!branchId) return true;
  if(member?.role === "owner") return true;
  const allowed = memberBranchIds(member);
  if(!allowed.length) return true;
  return allowed.includes(branchId);
}

export function getBranches(){
  return _branches.slice();
}

export function getCurrentBranch(){
  return _branches.find(b=> b.id === _currentBranchId) || _branches.find(b=> b.isDefault) || _branches[0] || null;
}

export function getCurrentBranchId(){
  const b = getCurrentBranch();
  return b?.id || _currentBranchId || "";
}

export function setCurrentBranchId(branchId){
  _currentBranchId = String(branchId || "");
  try{ sessionStorage.setItem(BRANCH_SESSION_KEY, _currentBranchId); }catch(_){}
}

export function branchAuditContext(){
  const b = getCurrentBranch();
  return {
    branchId: b?.id || "",
    branchCode: b?.code || "",
    branchName: b?.name || ""
  };
}

export async function ensureDefaultBranch(db, shop){
  if(!db) return null;
  const snap = await getDocs(query(collection(db, "branches"), orderBy("code")));
  if(snap.size > 0) return null;
  const ref = doc(collection(db, "branches"));
  const payload = {
    code: "MAIN",
    name: String(shop?.name || "Main Branch").trim() || "Main Branch",
    addr: String(shop?.addr || "").trim(),
    phone: String(shop?.phone || "").trim(),
    isDefault: true,
    status: "active",
    createdAt: Date.now()
  };
  await setDoc(ref, payload);
  if(shop && !shop.defaultBranchId){
    try{
      await updateDoc(doc(db, "shop", "info"), { defaultBranchId: ref.id, updatedAt: Date.now() });
    }catch(_){}
  }
  return ref.id;
}

export function subscribeBranches(db, member, onChange){
  if(_branchUnsub){ try{ _branchUnsub(); }catch(_){ } _branchUnsub = null; }
  if(!db) return ()=>{};
  const q = query(collection(db, "branches"), orderBy("code"));
  _branchUnsub = onSnapshot(q, snap=>{
    let rows = snap.docs.map(d=> ({ id: d.id, ...d.data() }));
    if(member && member.role !== "owner"){
      const allowed = memberBranchIds(member);
      if(allowed.length) rows = rows.filter(b=> allowed.includes(b.id));
    }
    _branches = rows;
    const cur = getCurrentBranch();
    if(!cur && rows[0]){
      setCurrentBranchId(rows[0].id);
    }else if(cur && !rows.some(b=> b.id === cur.id)){
      setCurrentBranchId(rows[0]?.id || "");
    }
    onChange?.(rows, getCurrentBranch());
  }, err=> console.warn("[S4 branches]", err));
  return _branchUnsub;
}

export function stopBranchSubscription(){
  if(_branchUnsub){ try{ _branchUnsub(); }catch(_){ } _branchUnsub = null; }
}

export async function saveBranch(db, id, data){
  const payload = {
    code: String(data.code || "").trim().toUpperCase(),
    name: String(data.name || "").trim(),
    addr: String(data.addr || "").trim(),
    phone: String(data.phone || "").trim(),
    status: data.status === "inactive" ? "inactive" : "active",
    updatedAt: Date.now()
  };
  if(!payload.code || !payload.name) throw new Error("BRANCH_REQUIRED");
  if(id){
    await updateDoc(doc(db, "branches", id), payload);
    return id;
  }
  const ref = doc(collection(db, "branches"));
  await setDoc(ref, { ...payload, isDefault: false, createdAt: Date.now() });
  return ref.id;
}

/** Atomic document number — counters/{branchId}_{docKey} */
export async function reserveDocNumber(db, docKey, prefix){
  if(!db) throw new Error("NO_DB");
  const branchId = getCurrentBranchId() || "default";
  const counterId = `${branchId}_${docKey}`;
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", counterId);
  const seq = await runTransaction(db, async tx=>{
    const snap = await tx.get(counterRef);
    const data = snap.exists() ? snap.data() : { year, seq: 0 };
    let nextSeq = Number(data.seq) || 0;
    if(Number(data.year) !== year){ nextSeq = 0; }
    nextSeq += 1;
    tx.set(counterRef, { year, seq: nextSeq, prefix, branchId, updatedAt: Date.now() }, { merge: true });
    return nextSeq;
  });
  const p = String(prefix || "");
  return `${p}${year}-${String(seq).padStart(4, "0")}`;
}

export function renderSidebarNav(container, { memberCan, shop }){
  if(!container) return;
  const html = NAV_GROUPS.map(group=>{
    const items = group.items.filter(item=>{
      if(item.placeholder) return isFullMode(shop);
      return isModuleAllowedInMode(item.id, shop) && memberCan(item.id);
    });
    if(!items.length) return "";
    const buttons = items.map(item=>{
      const ph = item.placeholder ? ' data-placeholder="1"' : "";
      return `<button data-page="${item.id}"${ph}><span class="ico">${item.icon}</span>${item.label}</button>`;
    }).join("");
    return `<div class="nav-title">${group.title}</div>${buttons}`;
  }).join("");
  container.innerHTML = html;
}

export function allNavPageIds(){
  const ids = [];
  NAV_GROUPS.forEach(g=> g.items.forEach(i=> ids.push(i.id)));
  return ids;
}
