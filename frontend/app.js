import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query,
  setDoc, getDoc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { logActivity, subscribeRecentActivity, formatActivityRow } from "./activity-log.js";
import {
  inviteStaff, listTeam, cancelInvite, deactivateStaff,
  isOwnerRole, getCurrentMember, authErrorText,
  resolvePermissions, memberCan, updateStaffPermissions,
  PERMISSION_LABELS, DEFAULT_STAFF_PERMISSIONS
} from "./auth.js";
import {
  backupToDrive, listBackups, isDriveBackupConfigured,
  getDriveClientId, saveDriveClientId, loadBackupHistory, recordBackupHistory, formatBytes
} from "./drive-backup.js";
import { buildBackupSnapshot, saveLocalBackup, restoreLocalBackup } from "./local-backup.js";
import { loadSavedFirebaseConfig, buildInviteCode } from "./firebase-config.js";
import { printHtmlDocument, downloadHtmlDocument, tableFromRows } from "./doc-export.js?v=66";
import {
  downloadInvoicePdf, downloadStatementPdf, downloadReceiptPdf, downloadReminderPdf, downloadTablePdf
} from "./pdf-export.js?v=66";
import { deliverText, openExternalUrl, deliveryToast, isAndroidNative } from "./file-delivery.js?v=66";
import { buildReportBundle, renderReportHtml, invoicesToCsv, downloadTextFile } from "./reports.js";
import {
  getAccessStatus, activateLicense, licenseErrorText, maskFingerprint
} from "./license.js";
import { setMemberDisplayName, getStaffName } from "./staff.js";

const MODAL_PERM = {
  customerModal: "customers",
  vehicleModal: "vehicles",
  productModal: "product-catalog",
  serviceModal: "service-catalog",
  invoiceModal: "invoices",
  receiptModal: "receipts",
  cnModal: "credit-notes",
  dnModal: "debit-notes",
  chequeModal: "cheques",
  discModal: "discounts"
};

let db = null;
let shop = {};
let member = null;
let _fullDeviceFingerprint = "";
const unsubs = [];
let customers = [];
let vehicles = [];
let products = [];
let services = [];
let invoices = [];
let receipts = [];
let creditNotes = [];
let debitNotes = [];
let cheques = [];
let discounts = [];
let customerFilter = "";
let invoiceFilter = "";
let receiptFilter = "";
let uiBound = false;
const INVOICE_WIP_KEY = "s4_invoice_wip_v1";
const INVOICE_MODE_KEY = "s4_invoice_entry_mode_v1";
let _invoiceWipTimer = null;
let _editingExistingInvoice = false;
// Guards a double-click on Post/Draft creating the same invoice twice, since a new
// invoice has no invId until its addDoc resolves.
let _invoiceSaving = false;
let _receiptSaving = false;
let _allocSaving = false;
let _cnAllocSaving = false;
let _invoiceLineItems = [];
let _invoiceEntryModeMem = null;
/** Temporary mode while editing one invoice (WIP) — must NOT overwrite shop preference */
let _formInvoiceMode = null;
let _currentSettingsView = "hub";

function col(name){ return collection(db, name); }
function today(){ return new Date().toISOString().slice(0,10); }
function num(v){ return Number(v) || 0; }
function esc(s){ return String(s||"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function cur(){ return sanitizeCurrency(shop.currency); }
function sanitizeCurrency(v){
  const s = String(v || "AED").trim().replace(/[<>"'&\\/]/g, "").slice(0, 12);
  return s || "AED";
}
function money(n){ return cur() + " " + num(n).toLocaleString("en-AE", { maximumFractionDigits: 2 }); }
function who(){ return member?.displayName || getStaffName() || "User"; }
function requireModule(pageId){
  if(memberCan(member, pageId)) return true;
  toast("You do not have permission for this action.");
  return false;
}
function requireAnyModule(pageIds, msg){
  if(pageIds.some(id=> memberCan(member, id))) return true;
  toast(msg || "You do not have permission for this action.");
  return false;
}
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(window._tt);
  window._tt = setTimeout(()=> t.style.display = "none", 2500);
}
function friendlyFirestoreError(e){
  const code = String(e?.code || "").replace(/^firestore\//, "");
  const msg = String(e?.message || e || "");
  if(code === "resource-exhausted" || /resource.?exhausted/i.test(msg)){
    return "Firebase storage (1GB free limit) is full. New data is not saving. Upgrade to Blaze in Firebase Console, or delete old data to free space.";
  }
  if(code === "permission-denied" || /insufficient permissions|permission.?denied/i.test(msg)){
    return "No permission — is email verified? Did you Publish firestore.rules in Firebase Console? Logout and login again.";
  }
  return msg || "Save failed";
}
function isAppOnline(){
  try{ return navigator.onLine !== false; }catch(_){ return true; }
}
/** Fire Firestore write without blocking UI; toast only after success (or offline queue note). */
function commitWrite(writePromise, { okMsg = "Saved", offlineMsg = "Saved — will sync when online" } = {}){
  const p = Promise.resolve(writePromise);
  p.then(()=>{
    toast(isAppOnline() ? okMsg : offlineMsg);
  }).catch(err=>{
    console.error("Firestore write failed:", err);
    toast(friendlyFirestoreError(err));
  });
  return p;
}
let _ignoreDrawerCloseUntil = 0;

function openModal(id, opts = {}){
  const el = document.getElementById(id);
  if(!el){
    console.error("openModal: missing element", id);
    toast("Cannot open form: " + id);
    return false;
  }
  try{
    document.documentElement.scrollLeft = 0;
    window.scrollTo({ left: 0, behavior: "auto" });
  }catch(_){}
  const keep = new Set(opts.keepOpen || []);
  // Close other drawers unless caller asked to stack (e.g. Vehicle on top of Invoice)
  document.querySelectorAll(".drawer.open").forEach(d=>{
    if(d === el) return;
    if(keep.has(d.id)) return;
    d.classList.remove("open");
    d.style.display = "";
    d.style.zIndex = "";
  });
  el.classList.add("open");
  // Inline styles beat any stale CSS/cache fighting .drawer.open
  el.style.display = "block";
  el.style.zIndex = keep.size ? "6100" : "6000";
  // Same click that opened the button must not instantly close the backdrop
  _ignoreDrawerCloseUntil = Date.now() + 600;
  return true;
}
function closeModal(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove("open");
  el.style.display = "";
  el.style.zIndex = "";
}

function prepareOpenModal(id){
  if(id === "invoiceModal") openNewInvoice();
  else if(id === "receiptModal") resetReceipt();
  else if(id === "customerModal") resetCustomer();
  else if(id === "cnModal") resetCn();
  else if(id === "dnModal") resetDn();
  else if(id === "chequeModal") resetCheque();
  else if(id === "discModal") resetDisc();
  else if(id === "vehicleModal") resetVehicle();
  else if(id === "productModal") resetProduct();
  else if(id === "serviceModal") resetService();
}

function openFormModal(id, opts = {}){
  const el = document.getElementById(id);
  const info = {
    id,
    found: !!el,
    opened: false,
    display: "",
    prepareError: null
  };
  const need = MODAL_PERM[id];
  if(need && !memberCan(member, need)){
    toast("You do not have permission for this action.");
    return info;
  }
  if(!openModal(id, opts)) return info;
  info.opened = true;
  try{ info.display = getComputedStyle(el).display; }catch(_){}
  try{
    prepareOpenModal(id);
  }catch(err){
    info.prepareError = String(err && err.message ? err.message : err);
    console.error("open form prepare failed", id, err);
    toast(info.prepareError || ("Could not prepare form: " + id));
  }
  // Keep open even if prepare failed
  if(el && !el.classList.contains("open")){
    el.classList.add("open");
    el.style.display = "block";
    el.style.zIndex = (opts.keepOpen && opts.keepOpen.length) ? "6100" : "6000";
  }
  return info;
}

function wireModalOpeners(){
  document.querySelectorAll("[data-open]").forEach(b=>{
    if(b._s4OpenBound) return;
    b._s4OpenBound = true;
    b.addEventListener("click", e=>{
      e.preventDefault();
      e.stopPropagation();
      const id = b.getAttribute("data-open");
      if(!id) return;
      openFormModal(id);
    });
  });
}

/** ESC / mobile Back / Android browser back — close overlays first, then settings sub, then sidebar, then page→dashboard */
function handleAppBack(){
  const app = document.getElementById("app");
  if(!app?.classList.contains("visible")) return false;

  const gate = document.getElementById("licenseGateOverlay");
  if(gate && !gate.hidden) return false;

  const search = document.getElementById("searchOverlay");
  if(search && !search.hidden){
    search.hidden = true;
    return true;
  }

  const notif = document.getElementById("notifPanel");
  if(notif && !notif.hidden){
    notif.hidden = true;
    return true;
  }

  const openDrawer = document.querySelector(".drawer.open");
  if(openDrawer){
    if(openDrawer.id === "invoiceModal"){
      try{ saveInvoiceWip(); }catch(_){}
    }
    openDrawer.classList.remove("open");
    openDrawer.style.display = "";
    openDrawer.style.zIndex = "";
    return true;
  }

  const settingsPage = document.getElementById("settings");
  if(settingsPage?.classList.contains("active")){
    const hub = document.getElementById("settingsHub");
    if(hub && hub.hidden){
      _currentSettingsView = "hub";
      showSettingsView("hub");
      return true;
    }
  }

  const reportsPage = document.getElementById("reports");
  const reportPanel = document.getElementById("reportPanel");
  if(reportsPage?.classList.contains("active") && reportPanel && reportPanel.style.display !== "none"){
    reportPanel.style.display = "none";
    return true;
  }

  const usersPage = document.getElementById("users");
  if(usersPage?.classList.contains("active") && usersPage.classList.contains("users-perm-open")){
    closePermissions();
    return true;
  }

  const sidebar = document.getElementById("sidebar");
  if(sidebar?.classList.contains("open")){
    sidebar.classList.remove("open");
    return true;
  }

  const active = document.querySelector(".page.active");
  const home = firstAllowedPage();
  if(active && home && active.id !== home){
    showPage(home);
    return true;
  }
  return false;
}

function wireAppBackControls(){
  if(window._s4BackWired) return;
  window._s4BackWired = true;

  document.addEventListener("keydown", e=>{
    if(e.key !== "Escape") return;
    if(handleAppBack()) e.preventDefault();
  });

  document.getElementById("mobileBackBtn")?.addEventListener("click", ()=>{
    if(!handleAppBack()) toast("Already at home");
  });

  try{
    if(!history.state?.s4root) history.pushState({ s4root: true }, "");
  }catch(_){}

  window.addEventListener("popstate", ()=>{
    if(handleAppBack()){
      try{ history.pushState({ s4root: true }, ""); }catch(_){}
    }
  });
}

function firstAllowedPage(){
  const order = [
    "dashboard","customers","vehicles","product-catalog","service-catalog","ledger","statements","aging",
    "invoices","credit-notes","debit-notes","receipts","allocation","cheques","discounts","reports",
    "communication","users","audit","settings"
  ];
  for(const id of order){
    if(memberCan(member, id)) return id;
  }
  return null;
}

function showPage(id){
  if(!id){
    toast("No modules enabled for your account");
    return;
  }
  if(!memberCan(member, id)){
    toast("No permission for this module");
    return;
  }
  if(id !== "users") closePermissions();
  document.querySelectorAll(".page").forEach(p=> p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".nav button[data-page]").forEach(n=> n.classList.toggle("active", n.dataset.page === id));
  document.getElementById("sidebar").classList.remove("open");
  const backBtn = document.getElementById("mobileBackBtn");
  if(backBtn){
    const home = firstAllowedPage();
    backBtn.hidden = !home || id === home;
  }
  if(id === "vehicles") renderVehicles();
  if(id === "product-catalog") renderProducts();
  if(id === "service-catalog") renderServices();
  if(id === "ledger") fillLedger();
  if(id === "statements") fillStatement();
  if(id === "allocation"){ fillAllocSelect(); fillCnAllocSelect(); }
  if(id === "communication") fillWhatsapp();
  if(id === "users") renderTeam();
  if(id === "settings") fillSettings();
  if(id === "reports"){
    const p = document.getElementById("reportPanel");
    if(p) p.style.display = "none";
    initReportPeriodControls();
  }
}

function applyNavPermissions(){
  const perms = resolvePermissions(member);
  document.querySelectorAll(".nav button[data-page]").forEach(btn=>{
    const page = btn.dataset.page;
    const ok = !!perms[page];
    btn.classList.toggle("nav-locked", !ok);
    btn.disabled = !ok;
  });
}

function nextNo(prefix, list, field){
  const year = new Date().getFullYear();
  const re = new RegExp("^" + prefix.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + year + "-(\\d+)$");
  let max = 0;
  list.forEach(row=>{
    const m = String(row[field]||"").match(re);
    if(m) max = Math.max(max, Number(m[1]));
  });
  return `${prefix}${year}-${String(max+1).padStart(4,"0")}`;
}

/** If `value` is already used on another row, return the next auto serial instead. */
function uniqueSerial(list, field, value, prefix, excludeId){
  const v = String(value || "").trim();
  const taken = list.some(row=>
    row.id !== excludeId && String(row[field] || "").trim().toLowerCase() === v.toLowerCase()
  );
  if(v && !taken) return { value: v, bumped: false };
  return { value: nextNo(prefix, list, field), bumped: true };
}

function invBalance(inv){ return Math.max(0, num(inv.total) - num(inv.paid) - num(inv.credited)); }

function roundMoney(n){ return Math.round((num(n) + Number.EPSILON) * 100) / 100; }

/** Split `total` across `weights` proportionally; last item absorbs rounding remainder. */
function distributeProportionally(total, weights){
  const t = roundMoney(total);
  const ws = weights.map(w=> Math.max(0, num(w)));
  const sumW = ws.reduce((s,w)=> s + w, 0);
  if(t <= 0 || sumW <= 0) return ws.map(()=> 0);
  const shares = ws.map(w=> roundMoney(t * w / sumW));
  const diff = roundMoney(t - shares.reduce((s,x)=> s + x, 0));
  if(shares.length) shares[shares.length - 1] = roundMoney(shares[shares.length - 1] + diff);
  return shares;
}

/**
 * Build invoice paid/credited/paidDate patch after a payment or credit change.
 * paidDate set when balance reaches ~0; cleared when a reversal leaves unpaid.
 */
function invoiceMoneyPatch(inv, { paidDelta = 0, creditedDelta = 0, updatedBy } = {}){
  // Never allow negative paid/credited (double bounce / bad reverse would gormil books)
  const paid = roundMoney(Math.max(0, num(inv.paid) + paidDelta));
  const credited = roundMoney(Math.max(0, num(inv.credited) + creditedDelta));
  const bal = Math.max(0, roundMoney(num(inv.total) - paid - credited));
  const patch = { paid, credited, updatedAt: Date.now() };
  if(updatedBy) patch.updatedBy = updatedBy;
  if(bal <= 0.009) patch.paidDate = inv.paidDate || today();
  else if(paidDelta < 0 || creditedDelta < 0) patch.paidDate = "";
  return patch;
}

function receiptAffectsBalance(r){
  // Must match saveReceipt apply rules — otherwise ledger vs invoice.paid diverge
  const st = r.status || "Posted";
  if(st === "Cancelled" || st === "Bounced" || st === "Pending" || st === "Deposited" || st === "Voided") return false;
  const isCheque = String(r.method || "").includes("Cheque");
  if(isCheque) return st === "Cleared";
  return st === "Posted";
}

/** CN/DN count on ledger & money links only when live (not Draft/Voided/Cancelled). */
function noteIsLive(n){
  const st = n?.status || "Posted";
  return st !== "Draft" && st !== "Voided" && st !== "Cancelled";
}

/** Unallocated credit still available to put on invoices (customer-level CN). */
function cnOpenCredit(n){
  if(!noteIsLive(n)) return 0;
  const amt = roundMoney(num(n.amount));
  if(Array.isArray(n.allocations) && n.allocations.length){
    const used = n.allocations.reduce((s, a)=> s + num(a.amount), 0);
    return Math.max(0, roundMoney(amt - used));
  }
  if(num(n.allocated) > 0.009) return Math.max(0, roundMoney(amt - num(n.allocated)));
  // Legacy: invoice field set at create ⇒ fully applied to that invoice
  if(String(n.invoice || "").trim()) return 0;
  return amt;
}

function invStatus(inv){
  if(inv.status === "Draft") return "Draft";
  const bal = invBalance(inv);
  if(bal <= 0.009) return "Paid";
  if(inv.dueDate && inv.dueDate < today() && bal > 0) return "Overdue";
  if(num(inv.paid) > 0 || num(inv.credited) > 0) return "Partial";
  return inv.status || "Posted";
}

function badge(st){
  const cls = st === "Paid" || st === "Active" || st === "Posted" || st === "Cleared" ? "green"
    : st === "Overdue" || st === "Blocked" || st === "Bounced" || st === "Voided" || st === "Cancelled" ? "red"
    : st === "Partial" || st === "Hold" || st === "Pending" || st === "Draft" || st === "Deposited" ? "orange" : "blue";
  return `<span class="badge ${cls}">${esc(st)}</span>`;
}

function daysPastDue(dueDate){
  if(!dueDate) return 0;
  const d = new Date(dueDate + "T00:00:00");
  const n = new Date(); n.setHours(0,0,0,0);
  return Math.floor((n - d) / 86400000);
}

function agingBucket(inv){
  if(inv.status === "Draft") return null;
  const bal = invBalance(inv);
  if(bal <= 0) return null;
  const d = daysPastDue(inv.dueDate);
  if(d <= 0) return "current";
  if(d <= 30) return "d30";
  if(d <= 60) return "d60";
  if(d <= 90) return "d90";
  return "d90p";
}

function customerOutstanding(name){
  return ledgerLines(name).reduce((bal, l)=> bal + l.debit - l.credit, 0);
}

function customerOverdue(name){
  return invoices.filter(i=> i.customer === name && invStatus(i) === "Overdue").reduce((s,i)=> s + invBalance(i), 0);
}

function customerOptions(selectEl, selected){
  if(!selectEl) return;
  const sel = selected || "";
  selectEl.innerHTML = `<option value="">Select…</option>` + customers.map(c=>
    `<option value="${esc(c.name)}" ${c.name===sel?"selected":""}>${esc(c.name)}</option>`
  ).join("");
  if(sel) selectEl.value = sel;
  syncCustomerComboInput(selectEl);
}

function syncCustomerComboInput(selectEl){
  const wrap = selectEl?.closest?.(".cust-combo");
  if(!wrap) return;
  const input = wrap.querySelector(".cust-combo-input");
  if(input) input.value = selectEl.value || "";
}

function filterCustomersForCombo(q){
  const ql = String(q || "").toLowerCase().trim();
  return customers.filter(c=>{
    if(!ql) return true;
    return `${c.name||""} ${c.code||""} ${c.mobile||""} ${c.whatsapp||""}`.toLowerCase().includes(ql);
  });
}

function closeAllCustomerCombos(except){
  document.querySelectorAll(".cust-combo").forEach(wrap=>{
    if(except && wrap === except) return;
    const input = wrap.querySelector(".cust-combo-input");
    if(input) input.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".cust-combo-list").forEach(list=>{
    if(except){
      const ownerId = except.getAttribute("data-combo") || "";
      if(ownerId && list.dataset.comboOwner === ownerId) return;
      // same wrap's list may still be inside wrap (not yet portaled)
      if(except.contains(list)) return;
    }
    list.hidden = true;
  });
}

function positionCustomerComboList(wrap, list){
  // Portal to <body> — .modal uses transform, which breaks position:fixed
  if(list.parentElement !== document.body){
    list.dataset.comboOwner = wrap.getAttribute("data-combo") || "";
    document.body.appendChild(list);
  }
  const r = wrap.getBoundingClientRect();
  const width = Math.max(Math.round(r.width), 240);
  let left = Math.round(r.left);
  if(left + width > window.innerWidth - 8){
    left = Math.max(8, window.innerWidth - width - 8);
  }
  if(left < 8) left = 8;

  const maxH = 240;
  const gap = 4;
  const spaceBelow = window.innerHeight - r.bottom - 8;
  const spaceAbove = r.top - 8;
  const openUp = spaceBelow < 140 && spaceAbove > spaceBelow;
  const height = Math.max(80, Math.min(maxH, openUp ? spaceAbove : spaceBelow));
  const top = openUp
    ? Math.round(r.top - height - gap)
    : Math.round(r.bottom + gap);

  list.style.position = "fixed";
  list.style.left = left + "px";
  list.style.top = top + "px";
  list.style.width = width + "px";
  list.style.right = "auto";
  list.style.maxHeight = height + "px";
  list.style.zIndex = "7000";
  list.hidden = false;
}

function renderCustomerComboList(wrap, q){
  const list = wrap.querySelector(".cust-combo-list")
    || document.querySelector(`.cust-combo-list[data-combo-owner="${wrap.getAttribute("data-combo") || ""}"]`);
  const input = wrap.querySelector(".cust-combo-input");
  if(!list) return;
  closeAllCustomerCombos(wrap);
  const rows = filterCustomersForCombo(q).slice(0, 80);
  if(!rows.length){
    list.innerHTML = `<li class="cust-combo-empty">${customers.length ? "No match" : "No customers yet"}</li>`;
  }else{
    list.innerHTML = rows.map(c=> `<li role="option" data-name="${esc(c.name)}" title="${esc(c.name)}">${esc(c.name)}</li>`).join("");
  }
  positionCustomerComboList(wrap, list);
  if(input) input.setAttribute("aria-expanded", "true");
}

function pickCustomerCombo(wrap, name){
  const sel = wrap.querySelector("select");
  const input = wrap.querySelector(".cust-combo-input");
  const owner = wrap.getAttribute("data-combo") || "";
  const list = wrap.querySelector(".cust-combo-list")
    || document.querySelector(`.cust-combo-list[data-combo-owner="${owner}"]`);
  if(!sel) return;
  const n = String(name || "").trim();
  customerOptions(sel, n);
  sel.value = n;
  if(input) input.value = n;
  if(list) list.hidden = true;
  if(input) input.setAttribute("aria-expanded", "false");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
}

function commitCustomerComboInput(wrap){
  const sel = wrap.querySelector("select");
  const input = wrap.querySelector(".cust-combo-input");
  if(!sel || !input) return;
  const typed = input.value.trim();
  if(!typed){
    pickCustomerCombo(wrap, "");
    return;
  }
  const exact = customers.find(c=> String(c.name||"").toLowerCase() === typed.toLowerCase());
  const partial = exact || customers.find(c=> String(c.name||"").toLowerCase().includes(typed.toLowerCase()));
  if(partial) pickCustomerCombo(wrap, partial.name);
  else{
    input.value = sel.value || "";
    closeAllCustomerCombos();
  }
}

function wireCustomerCombos(){
  if(window._s4CustComboWired) return;
  window._s4CustComboWired = true;

  document.querySelectorAll(".cust-combo").forEach(wrap=>{
    const input = wrap.querySelector(".cust-combo-input");
    const btn = wrap.querySelector(".cust-combo-btn");
    let list = wrap.querySelector(".cust-combo-list");
    const sel = wrap.querySelector("select");
    if(!input || !sel || !list) return;
    const owner = wrap.getAttribute("data-combo") || sel.id || "";
    if(owner) wrap.setAttribute("data-combo", owner);

    const getList = ()=> wrap.querySelector(".cust-combo-list")
      || document.querySelector(`.cust-combo-list[data-combo-owner="${owner}"]`)
      || list;

    input.addEventListener("focus", ()=> renderCustomerComboList(wrap, input.value));
    input.addEventListener("input", ()=> renderCustomerComboList(wrap, input.value));
    input.addEventListener("keydown", e=>{
      const lst = getList();
      if(e.key === "Escape"){
        if(lst) lst.hidden = true;
        input.setAttribute("aria-expanded", "false");
        input.value = sel.value || "";
        return;
      }
      if(e.key === "Enter"){
        e.preventDefault();
        const first = lst && lst.querySelector("li[data-name]");
        if(first) pickCustomerCombo(wrap, first.getAttribute("data-name"));
        else commitCustomerComboInput(wrap);
      }
      if(e.key === "ArrowDown"){
        e.preventDefault();
        renderCustomerComboList(wrap, input.value);
      }
    });
    input.addEventListener("blur", ()=>{
      setTimeout(()=>{
        const lst = getList();
        if(lst && lst.contains(document.activeElement)) return;
        if(wrap.contains(document.activeElement)) return;
        commitCustomerComboInput(wrap);
      }, 150);
    });

    btn?.addEventListener("mousedown", e=>{
      e.preventDefault();
      const lst = getList();
      if(!lst || lst.hidden){
        closeAllCustomerCombos(wrap);
        input.focus();
        renderCustomerComboList(wrap, "");
      }else{
        lst.hidden = true;
        input.setAttribute("aria-expanded", "false");
      }
    });

    list.addEventListener("mousedown", e=>{
      const li = e.target.closest("li[data-name]");
      if(!li) return;
      e.preventDefault();
      pickCustomerCombo(wrap, li.getAttribute("data-name"));
    });
  });

  document.addEventListener("mousedown", e=>{
    if(e.target.closest(".cust-combo") || e.target.closest(".cust-combo-list")) return;
    closeAllCustomerCombos();
  });
  window.addEventListener("resize", ()=> closeAllCustomerCombos());
  document.addEventListener("scroll", ()=> closeAllCustomerCombos(), true);
}

/* ——— Invoice number typeahead (CN / DN / Cheque) ——— */
function invoicesForCustomer(customer, q){
  const ql = String(q || "").toLowerCase().trim();
  return invoices
    .filter(i=>{
      if(customer && i.customer !== customer) return false;
      if(i.status === "Draft") return false;
      if(!ql) return true;
      const blob = `${i.invNo||""} ${i.manualNo||""} ${i.computerNo||""} ${i.vehicle||""}`.toLowerCase();
      return blob.includes(ql);
    })
    .sort((a,b)=> String(b.invDate||"").localeCompare(String(a.invDate||"")));
}

function syncInvoiceComboInput(selectEl){
  const wrap = selectEl?.closest?.(".inv-combo");
  if(!wrap) return;
  const input = wrap.querySelector(".inv-combo-input");
  if(input) input.value = selectEl.value || "";
}

function closeAllInvoiceCombos(except){
  document.querySelectorAll(".inv-combo").forEach(wrap=>{
    if(except && wrap === except) return;
    const input = wrap.querySelector(".inv-combo-input");
    if(input) input.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".inv-combo-list").forEach(list=>{
    if(except){
      const ownerId = except.getAttribute("data-inv-combo") || "";
      if(ownerId && list.dataset.invComboOwner === ownerId) return;
      if(except.contains(list)) return;
    }
    list.hidden = true;
  });
}

function positionInvoiceComboList(wrap, list){
  if(list.parentElement !== document.body){
    list.dataset.invComboOwner = wrap.getAttribute("data-inv-combo") || "";
    document.body.appendChild(list);
  }
  const r = wrap.getBoundingClientRect();
  const width = Math.max(Math.round(r.width), 280);
  let left = Math.round(r.left);
  if(left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
  if(left < 8) left = 8;
  const maxH = 260;
  const gap = 4;
  const spaceBelow = window.innerHeight - r.bottom - 8;
  const spaceAbove = r.top - 8;
  const openUp = spaceBelow < 140 && spaceAbove > spaceBelow;
  const height = Math.max(80, Math.min(maxH, openUp ? spaceAbove : spaceBelow));
  const top = openUp ? Math.round(r.top - height - gap) : Math.round(r.bottom + gap);
  list.style.position = "fixed";
  list.style.left = left + "px";
  list.style.top = top + "px";
  list.style.width = width + "px";
  list.style.right = "auto";
  list.style.maxHeight = height + "px";
  list.style.zIndex = "7000";
  list.hidden = false;
}

function renderInvoiceComboList(wrap, q){
  const owner = wrap.getAttribute("data-inv-combo") || "";
  const list = wrap.querySelector(".inv-combo-list")
    || document.querySelector(`.inv-combo-list[data-inv-combo-owner="${owner}"]`);
  const input = wrap.querySelector(".inv-combo-input");
  const custId = wrap.getAttribute("data-inv-customer") || "";
  const custSel = custId ? document.getElementById(custId) : null;
  const customer = custSel?.value || "";
  if(!list) return;
  closeAllInvoiceCombos(wrap);
  closeAllCustomerCombos();
  if(!customer){
    list.innerHTML = `<li class="inv-combo-empty">Select customer first</li>`;
    positionInvoiceComboList(wrap, list);
    if(input) input.setAttribute("aria-expanded", "true");
    return;
  }
  const rows = invoicesForCustomer(customer, q).slice(0, 80);
  if(!rows.length){
    list.innerHTML = `<li class="inv-combo-empty">${q ? "No matching invoice" : "No invoices for this customer"}</li>`;
  }else{
    list.innerHTML = rows.map(i=>{
      const bal = invBalance(i);
      const meta = `${i.invDate||""} · Due ${money(bal)} · Total ${money(i.total)}`;
      return `<li role="option" data-invno="${esc(i.invNo)}" title="${esc(i.invNo)}">
        <b>${esc(i.invNo)}</b>
        <span class="inv-meta">${esc(meta)}${i.manualNo ? " · Manual " + esc(i.manualNo) : ""}${i.computerNo ? " · Comp " + esc(i.computerNo) : ""}</span>
      </li>`;
    }).join("");
  }
  positionInvoiceComboList(wrap, list);
  if(input) input.setAttribute("aria-expanded", "true");
}

function pickInvoiceCombo(wrap, invNo){
  const sel = wrap.querySelector("select");
  const input = wrap.querySelector(".inv-combo-input");
  const owner = wrap.getAttribute("data-inv-combo") || "";
  const list = wrap.querySelector(".inv-combo-list")
    || document.querySelector(`.inv-combo-list[data-inv-combo-owner="${owner}"]`);
  if(!sel) return;
  const n = String(invNo || "").trim();
  if(n && ![...sel.options].some(o=> o.value === n)){
    sel.insertAdjacentHTML("beforeend", `<option value="${esc(n)}">${esc(n)}</option>`);
  }
  sel.value = n;
  if(input) input.value = n;
  if(list) list.hidden = true;
  if(input) input.setAttribute("aria-expanded", "false");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
}

function commitInvoiceComboInput(wrap){
  const sel = wrap.querySelector("select");
  const input = wrap.querySelector(".inv-combo-input");
  const custId = wrap.getAttribute("data-inv-customer") || "";
  const customer = custId ? (document.getElementById(custId)?.value || "") : "";
  if(!sel || !input) return;
  const typed = input.value.trim();
  if(!typed){
    pickInvoiceCombo(wrap, "");
    return;
  }
  const rows = invoicesForCustomer(customer, typed);
  const exact = rows.find(i=> String(i.invNo||"").toLowerCase() === typed.toLowerCase());
  const partial = exact || rows[0];
  if(partial) pickInvoiceCombo(wrap, partial.invNo);
  else{
    input.value = sel.value || "";
    closeAllInvoiceCombos();
  }
}

function wireInvoiceCombos(){
  if(window._s4InvComboWired) return;
  window._s4InvComboWired = true;

  document.querySelectorAll(".inv-combo").forEach(wrap=>{
    const input = wrap.querySelector(".inv-combo-input");
    const btn = wrap.querySelector(".inv-combo-btn");
    let list = wrap.querySelector(".inv-combo-list");
    const sel = wrap.querySelector("select");
    if(!input || !sel || !list) return;
    const owner = wrap.getAttribute("data-inv-combo") || sel.id || "";
    if(owner) wrap.setAttribute("data-inv-combo", owner);

    const getList = ()=> wrap.querySelector(".inv-combo-list")
      || document.querySelector(`.inv-combo-list[data-inv-combo-owner="${owner}"]`)
      || list;

    input.addEventListener("focus", ()=> renderInvoiceComboList(wrap, input.value));
    input.addEventListener("input", ()=> renderInvoiceComboList(wrap, input.value));
    input.addEventListener("keydown", e=>{
      const lst = getList();
      if(e.key === "Escape"){
        if(lst) lst.hidden = true;
        input.setAttribute("aria-expanded", "false");
        input.value = sel.value || "";
        return;
      }
      if(e.key === "Enter"){
        e.preventDefault();
        const first = lst && lst.querySelector("li[data-invno]");
        if(first) pickInvoiceCombo(wrap, first.getAttribute("data-invno"));
        else commitInvoiceComboInput(wrap);
      }
      if(e.key === "ArrowDown"){
        e.preventDefault();
        renderInvoiceComboList(wrap, input.value);
      }
    });
    input.addEventListener("blur", ()=>{
      setTimeout(()=>{
        const lst = getList();
        if(lst && lst.contains(document.activeElement)) return;
        if(wrap.contains(document.activeElement)) return;
        commitInvoiceComboInput(wrap);
      }, 150);
    });

    btn?.addEventListener("mousedown", e=>{
      e.preventDefault();
      const lst = getList();
      if(!lst || lst.hidden){
        closeAllInvoiceCombos(wrap);
        input.focus();
        renderInvoiceComboList(wrap, "");
      }else{
        lst.hidden = true;
        input.setAttribute("aria-expanded", "false");
      }
    });

    list.addEventListener("mousedown", e=>{
      const li = e.target.closest("li[data-invno]");
      if(!li) return;
      e.preventDefault();
      pickInvoiceCombo(wrap, li.getAttribute("data-invno"));
    });
  });

  document.addEventListener("mousedown", e=>{
    if(e.target.closest(".inv-combo") || e.target.closest(".inv-combo-list")) return;
    closeAllInvoiceCombos();
  });
  window.addEventListener("resize", ()=> closeAllInvoiceCombos());
  document.addEventListener("scroll", ()=> closeAllInvoiceCombos(), true);
}

export function stopTracker(){
  unsubs.splice(0).forEach(u=>{ try{ u(); }catch(_){ } });
  document.getElementById("app").classList.remove("visible");
}

function syncTopShopName(){
  const el = document.getElementById("topShopName");
  if(!el) return;
  const name = String(shop?.name || "S4 BUSINESS").trim() || "S4 BUSINESS";
  el.textContent = name;
  el.title = name;
}

export function startTracker(opts){
  stopTracker();
  db = opts.db;
  shop = opts.shop || {};
  member = opts.member || getCurrentMember();
  setMemberDisplayName(member?.displayName || "");
  document.getElementById("app").classList.add("visible");
  document.getElementById("userName").textContent = member?.displayName || "User";
  document.getElementById("userRole").textContent = member?.role === "owner" ? "Owner" : "Staff";
  document.getElementById("userAvatar").textContent = (member?.displayName || "U").slice(0,2).toUpperCase();
  syncTopShopName();
  bindUi();
  // bindUi() only runs once per page load, so re-wire modal openers on every login.
  wireModalOpeners();
  applyNavPermissions();
  enforceAccessGate(opts.access);
  const driveSt = document.getElementById("driveBackupStatus");
  if(driveSt){
    driveSt.textContent = isDriveBackupConfigured()
      ? "Firebase is the main database. Drive is an extra snapshot copy."
      : "Paste Google OAuth Client ID below (or in drive-backup-config.js).";
  }
  const driveInp = document.getElementById("driveClientIdInput");
  if(driveInp) driveInp.value = getDriveClientId().startsWith("PASTE_") ? "" : getDriveClientId();
  renderBackupPage();
  refreshNotifications();
  initReportPeriodControls();
  listenIfAllowed("customers", rows => { customers = rows; renderCustomers(); refreshSelects(); renderDashboard(); });
  listenIfAllowed("vehicles", rows => { vehicles = rows; renderVehicles(); refreshSelects(); filterVehiclesForInvoice(); });
  listenIfAllowed("productCatalog", rows => { products = rows; renderProducts(); });
  listenIfAllowed("serviceCatalog", rows => { services = rows; renderServices(); });
  // Live shop settings (invoice entry mode sync Owner → Staff)
  unsubs.push(onSnapshot(doc(db, "shop", "info"), snap=>{
    if(!snap.exists()) return;
    const next = snap.data() || {};
    const modeChanged = (next.invoiceEntryMode || "") !== (shop?.invoiceEntryMode || "");
    shop = next;
    syncTopShopName();
    if(modeChanged){
      _formInvoiceMode = null;
      applyInvoiceEntryMode();
    }
    syncInvoiceModeSettingsUi();
  }, err=> toast(friendlyFirestoreError(err))));
  listenIfAllowed("invoices", rows => { invoices = rows; renderInvoices(); renderCustomers(); renderDashboard(); renderAging(); fillLedger(); fillStatement(); fillAllocSelect(); fillCnAllocSelect(); refreshNotifications(); });
  listenIfAllowed("receipts", rows => { receipts = rows; renderReceipts(); renderCustomers(); renderDashboard(); fillAllocSelect(); fillLedger(); fillStatement(); refreshNotifications(); });
  listenIfAllowed("creditNotes", rows => { creditNotes = rows; renderNotes("cnRows", creditNotes, "cnNo"); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); fillCnAllocSelect(); });
  listenIfAllowed("debitNotes", rows => { debitNotes = rows; renderNotes("dnRows", debitNotes, "dnNo"); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); });
  listenIfAllowed("cheques", rows => { cheques = rows; renderCheques(); renderCustomers(); renderDashboard(); refreshNotifications(); });
  listenIfAllowed("discounts", rows => { discounts = rows; renderDiscounts(); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); });
  if(memberCan(member, "audit")){
    unsubs.push(subscribeRecentActivity(rows=>{
      window._auditRows = rows;
      document.getElementById("auditRows").innerHTML = rows.length
        ? rows.map(r=>{
            const f = formatActivityRow(r, "en");
            return `<tr><td>${esc(f.when)}</td><td>${esc(f.who)}</td><td>${esc(r.module||"")}</td><td>${esc(r.action||"")}</td>
              <td>${esc(r.record||r.invoiceId||"")}</td><td>${esc(r.oldValue||"")}</td><td>${esc(r.newValue||"")}</td><td>${esc(r.reason||f.what)}</td></tr>`;
          }).join("")
        : `<tr><td colspan="8" class="empty">No activity yet</td></tr>`;
    }));
  }else{
    const auditRows = document.getElementById("auditRows");
    if(auditRows) auditRows.innerHTML = `<tr><td colspan="8" class="empty">No permission for audit</td></tr>`;
  }
  wireIdleDashboardReset();
  wireCloseBackupHooks();
  wireExpiryReminders();
  wireCustomerCombos();
  wireInvoiceCombos();
  wireCatalogSuggest();
  // Debug helper: in Console run s4OpenForm('receiptModal')
  try{ window.s4OpenForm = openFormModal; }catch(_){}
  const home = firstAllowedPage();
  if(home) showPage(home);
  else {
    document.querySelectorAll(".page").forEach(p=> p.classList.remove("active"));
    toast("No modules enabled for your account");
  }
}

async function enforceAccessGate(accessHint){
  let access = accessHint;
  try{
    if(!access) access = await getAccessStatus();
  }catch{
    access = { allowed:false, reason:"LICENSE_VERIFY_FAILED", deviceFingerprint:"", maskedFingerprint:"—" };
  }
  _fullDeviceFingerprint = access.deviceFingerprint || "";
  const overlay = document.getElementById("licenseGateOverlay");
  if(!overlay) return;
  if(access.allowed){
    overlay.hidden = true;
    return;
  }
  const fpEl = document.getElementById("gateLicenseFp");
  if(fpEl) fpEl.textContent = access.maskedFingerprint || maskFingerprint(_fullDeviceFingerprint);
  const title = document.getElementById("gateLicenseTitle");
  const lead = document.getElementById("gateLicenseLead");
  const reason = access.reason || "TRIAL_EXPIRED";
  if(reason === "LICENSE_EXPIRED"){
    if(title) title.textContent = "License expired";
    if(lead) lead.textContent = "Your S4 license on this PC has expired. Activate a renewed license key to continue.";
  }else{
    if(title) title.textContent = "Trial ended";
    if(lead) lead.textContent = "Your 15-day free trial on this PC is over. Activate an S4 license to continue.";
  }
  const msg = document.getElementById("gateLicenseMsg");
  if(msg) msg.textContent = licenseErrorText(reason);
  overlay.hidden = false;
}

async function copyFullFingerprint(){
  const fp = _fullDeviceFingerprint || (await getAccessStatus()).deviceFingerprint || "";
  _fullDeviceFingerprint = fp;
  if(!fp) throw new Error("Fingerprint not ready");
  await navigator.clipboard.writeText(fp);
}

async function doActivateFromUi(textareaId, msgId){
  const key = document.getElementById(textareaId)?.value || "";
  const msgEl = msgId ? document.getElementById(msgId) : null;
  const setMsg = (t)=>{ if(msgEl) msgEl.textContent = t; else toast(t); };
  try{
    setMsg("Verifying…");
    const result = await activateLicense(key);
    if(!result.ok){
      setMsg(licenseErrorText(result.reason));
      return;
    }
    setMsg("License activated.");
    toast("License activated");
    const access = await getAccessStatus();
    enforceAccessGate(access);
    refreshLicenseSettingsBox();
  }catch(e){
    setMsg(e.message || String(e));
  }
}

function listen(name, cb){
  const q = query(col(name));
  unsubs.push(onSnapshot(q, snap=>{
    cb(snap.docs.map(d=>({ id:d.id, ...d.data() })));
  }, err=> toast(friendlyFirestoreError(err) + " [" + name + "]")));
}

// Firestore read rules gate every collection by module (firestore.rules 176-223).
// Subscribing without a granting module fires permission-denied, which listen()
// surfaces as a toast — restricted staff got one toast per collection on login.
// Module lists below must stay in sync with the `allow read` conditions.
const COLLECTION_READ_ACCESS = {
  customers:      { mods: ["customers","invoices","ledger","statements","dashboard","communication"], rows: "customerRows", cols: 9 },
  vehicles:       { mods: ["vehicles","invoices"], rows: "vehicleRows", cols: 7 },
  productCatalog: { mods: ["product-catalog","invoices"], rows: "productRows", cols: 7 },
  serviceCatalog: { mods: ["service-catalog","invoices"], rows: "serviceRows", cols: 6 },
  invoices:       { mods: ["invoices","ledger","statements","aging","reports","dashboard"], rows: "invoiceRows", cols: 10 },
  receipts:       { mods: ["receipts","ledger","statements","allocation","reports","dashboard"], rows: "receiptRows", cols: 10 },
  creditNotes:    { mods: ["credit-notes","ledger","statements","allocation"], rows: "cnRows", cols: 9 },
  debitNotes:     { mods: ["debit-notes","ledger","statements","aging","dashboard"], rows: "dnRows", cols: 8 },
  cheques:        { mods: ["cheques","ledger","receipts"], rows: "chequeRows", cols: 8 },
  discounts:      { mods: ["discounts","ledger","statements","receipts"], rows: "discRows", cols: 9 }
};

function listenIfAllowed(name, cb){
  const access = COLLECTION_READ_ACCESS[name];
  if(access && !access.mods.some(m=> memberCan(member, m))){
    // stopTracker() only drops subscriptions, so clear the cached rows too —
    // otherwise a re-login as restricted staff would keep the previous user's data.
    try{ cb([]); }catch(err){ console.warn("clear on denied listen failed:", name, err); }
    const el = document.getElementById(access.rows);
    if(el) el.innerHTML = `<tr><td colspan="${access.cols}" class="empty">No permission for this module</td></tr>`;
    return false;
  }
  listen(name, cb);
  return true;
}

function bindUi(){
  if(uiBound) return;
  uiBound = true;
  wireAppBackControls();
  wireModalOpeners();
  document.querySelectorAll("[data-page]").forEach(n=>{
    n.onclick = ()=> showPage(n.dataset.page);
  });
  document.querySelectorAll("[data-close]").forEach(b=> b.onclick = ()=>{
    if(b.dataset.close === "invoiceModal") saveInvoiceWip();
    closeModal(b.dataset.close);
  });
  document.querySelectorAll(".drawer").forEach(d=>{
    if(d._s4BackdropBound) return;
    d._s4BackdropBound = true;
    d.addEventListener("click", e=>{
      if(e.target !== d) return;
      if(Date.now() < _ignoreDrawerCloseUntil) return;
      if(d.id === "invoiceModal"){
        try{ saveInvoiceWip(); }catch(_){}
      }
      d.classList.remove("open");
      d.style.display = "";
      d.style.zIndex = "";
    });
  });
  document.getElementById("menu").onclick = ()=> document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("saveCustomerBtn").onclick = saveCustomer;
  document.getElementById("saveVehicleBtn")?.addEventListener("click", saveVehicle);
  document.getElementById("addVehicleBtn")?.addEventListener("click", e=>{
    e.preventDefault();
    e.stopPropagation();
    openFormModal("vehicleModal");
  });
  document.getElementById("invAddVehicleBtn")?.addEventListener("click", e=>{
    e.preventDefault();
    e.stopPropagation();
    // Keep invoice open underneath — do not wipe WIP / in-progress edits
    openFormModal("vehicleModal", { keepOpen: ["invoiceModal"] });
    const cust = invCustomer?.value || "";
    if(cust) customerOptions(vCustomer, cust);
  });
  document.getElementById("vehicleSearch")?.addEventListener("input", renderVehicles);
  document.getElementById("saveProductBtn")?.addEventListener("click", saveProduct);
  document.getElementById("addProductBtn")?.addEventListener("click", e=>{
    e.preventDefault();
    e.stopPropagation();
    openFormModal("productModal");
  });
  document.getElementById("productSearch")?.addEventListener("input", renderProducts);
  document.getElementById("importProductsBtn")?.addEventListener("click", ()=> document.getElementById("importProductsFile")?.click());
  document.getElementById("importProductsFile")?.addEventListener("change", e=>{
    const f = e.target.files?.[0];
    e.target.value = "";
    if(f) importCatalogCsv("product", f);
  });
  document.getElementById("saveServiceBtn")?.addEventListener("click", saveService);
  document.getElementById("addServiceBtn")?.addEventListener("click", e=>{
    e.preventDefault();
    e.stopPropagation();
    openFormModal("serviceModal");
  });
  document.getElementById("serviceSearch")?.addEventListener("input", renderServices);
  document.getElementById("importServicesBtn")?.addEventListener("click", ()=> document.getElementById("importServicesFile")?.click());
  document.getElementById("importServicesFile")?.addEventListener("change", e=>{
    const f = e.target.files?.[0];
    e.target.value = "";
    if(f) importCatalogCsv("service", f);
  });
  document.getElementById("deleteSelectedServicesBtn")?.addEventListener("click", deleteSelectedServices);
  document.getElementById("deleteAllServicesBtn")?.addEventListener("click", deleteAllServices);
  document.getElementById("serviceSelectAll")?.addEventListener("change", e=>{
    document.querySelectorAll('#serviceRows input.catalog-check').forEach(cb=>{ cb.checked = !!e.target.checked; });
  });
  document.getElementById("deleteSelectedProductsBtn")?.addEventListener("click", deleteSelectedProducts);
  document.getElementById("deleteAllProductsBtn")?.addEventListener("click", deleteAllProducts);
  document.getElementById("productSelectAll")?.addEventListener("change", e=>{
    document.querySelectorAll('#productRows input.catalog-check').forEach(cb=>{ cb.checked = !!e.target.checked; });
  });
  document.getElementById("saveEntryToCatalogBtn")?.addEventListener("click", saveEntryToCatalog);
  document.getElementById("saveInvoiceBtn").onclick = ()=> saveInvoice("Posted");
  document.getElementById("draftInvoiceBtn").onclick = ()=> saveInvoice("Draft");
  document.getElementById("deleteInvoiceBtn")?.addEventListener("click", ()=>{
    const invId = document.getElementById("invId");
    if(invId?.value) deleteInvoice(invId.value);
  });
  document.getElementById("saveReceiptBtn").onclick = saveReceipt;
  document.getElementById("invStartFreshBtn")?.addEventListener("click", startFreshInvoice);
  document.getElementById("addInvItemBtn")?.addEventListener("click", commitInvEntryLine);
  ["invEntryName","invEntryCode","invEntryQty","invEntryPrice","invEntryDisc","invEntryVat"].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("input", ()=>{
      updateInvEntryPreview();
      queueInvoiceWipSave();
    });
    if(id === "invEntryName"){
      el.addEventListener("keydown", e=>{
        if(e.key === "Enter"){ e.preventDefault(); commitInvEntryLine(); }
      });
    }
  });
  document.getElementById("invSimpleTotal")?.addEventListener("input", ()=>{
    calcInvoice();
    queueInvoiceWipSave();
  });
  wireInvoiceModeSettings();
  wireInvoiceWipFields();
  document.getElementById("saveCnBtn").onclick = saveCn;
  document.getElementById("saveDnBtn").onclick = saveDn;
  document.getElementById("saveChequeBtn").onclick = saveCheque;
  document.getElementById("saveDiscBtn").onclick = saveDisc;
  document.getElementById("customerSearch").oninput = renderCustomers;
  document.getElementById("invoiceSearch").oninput = renderInvoices;
  document.getElementById("receiptSearch")?.addEventListener("input", renderReceipts);
  document.getElementById("receiptFilters")?.addEventListener("click", e=>{
    const m = e.target.dataset.method;
    if(m === undefined) return;
    receiptFilter = m;
    renderReceipts();
  });
  document.getElementById("customerFilters").onclick = e=>{
    const st = e.target.dataset.status;
    if(st === undefined) return;
    customerFilter = st;
    renderCustomers();
  };
  document.getElementById("invoiceFilters").onclick = e=>{
    const st = e.target.dataset.status;
    if(st === undefined) return;
    invoiceFilter = st;
    renderInvoices();
  };
  document.getElementById("ledgerCustomer").onchange = fillLedger;
  document.getElementById("ledgerFrom")?.addEventListener("change", fillLedger);
  document.getElementById("ledgerTo")?.addEventListener("change", fillLedger);
  document.getElementById("stmtCustomer").onchange = fillStatement;
  document.getElementById("stmtAsOf")?.addEventListener("change", fillStatement);
  document.getElementById("waCustomer").onchange = fillWhatsapp;
  document.getElementById("waType")?.addEventListener("change", fillWhatsapp);
  document.getElementById("printStmtBtn").onclick = ()=> exportStatementPdf(false);
  document.getElementById("pdfStmtBtn")?.addEventListener("click", ()=> exportStatementPdf(true));
  document.getElementById("waStmtBtn")?.addEventListener("click", async ()=>{
    const stmtCust = document.getElementById("stmtCustomer").value;
    try{ await exportStatementPdf(true); }catch(_){}
    showPage("communication");
    const wt = document.getElementById("waType");
    if(wt) wt.value = "Statement";
    if(stmtCust) document.getElementById("waCustomer").value = stmtCust;
    fillWhatsapp();
    toast("PDF ready — attach it in WhatsApp");
  });
  document.getElementById("genStmtBtn")?.addEventListener("click", fillStatement);
  document.getElementById("stmtFrom")?.addEventListener("change", fillStatement);
  document.getElementById("waSendBtn").onclick = sendWhatsapp;
  document.getElementById("waAttachPdfBtn")?.addEventListener("click", ()=> downloadWaPdf());
  document.getElementById("qaInvoicePdf")?.addEventListener("click", ()=> exportLatestInvoicePdf());
  document.getElementById("qaStatementPdf")?.addEventListener("click", ()=>{ showPage("statements"); exportStatementPdf(true); });
  document.getElementById("qaReceiptPdf")?.addEventListener("click", ()=>{
    showPage("receipts");
    toast("Tap PDF on the receipt you need");
  });
  document.getElementById("waQuickRemind")?.addEventListener("click", ()=>{ showPage("communication"); fillWhatsapp(); });
  document.getElementById("saveSettingsBtn").onclick = saveSettings;
  document.querySelectorAll("[data-settings-view]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      _currentSettingsView = btn.dataset.settingsView || "hub";
      showSettingsView(_currentSettingsView);
    });
  });
  document.querySelectorAll("[data-settings-back]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      _currentSettingsView = "hub";
      showSettingsView("hub");
    });
  });
  document.getElementById("showLicenseInfoBtn")?.addEventListener("click", refreshLicenseSettingsBox);
  document.getElementById("settingsActivateLicenseBtn")?.addEventListener("click", ()=> doActivateFromUi("settingsLicensePaste"));
  document.getElementById("copySettingsFpBtn")?.addEventListener("click", async ()=>{
    try{ await copyFullFingerprint(); toast("Full fingerprint copied"); }
    catch{ toast("Copy failed"); }
  });
  document.getElementById("gateActivateLicenseBtn")?.addEventListener("click", ()=> doActivateFromUi("gateLicensePaste", "gateLicenseMsg"));
  document.getElementById("copyGateFpBtn")?.addEventListener("click", async ()=>{
    try{
      await copyFullFingerprint();
      const msg = document.getElementById("gateLicenseMsg");
      if(msg) msg.textContent = "Full fingerprint copied.";
    }catch(e){
      const msg = document.getElementById("gateLicenseMsg");
      if(msg) msg.textContent = "Copy failed — ask support for help.";
    }
  });
  document.getElementById("inviteBtn").onclick = doInvite;
  document.getElementById("savePermBtn")?.addEventListener("click", savePermissions);
  document.getElementById("permBackBtn")?.addEventListener("click", closePermissions);
  document.getElementById("exportAuditBtn")?.addEventListener("click", exportAudit);
  document.getElementById("exportLedgerCsvBtn")?.addEventListener("click", ()=> exportLedger("csv"));
  document.getElementById("exportLedgerPdfBtn")?.addEventListener("click", ()=> exportLedger("pdf"));
  document.getElementById("exportAgingCsvBtn")?.addEventListener("click", ()=> exportAging("csv"));
  document.getElementById("exportAgingPdfBtn")?.addEventListener("click", ()=> exportAging("pdf"));
  document.getElementById("runPeriodReportBtn")?.addEventListener("click", runPeriodReport);
  document.getElementById("exportPeriodCsvBtn")?.addEventListener("click", exportPeriodCsv);
  document.getElementById("exportReportCsvBtn")?.addEventListener("click", exportCurrentReportCsv);
  document.querySelectorAll("[data-report]").forEach(b=> b.onclick = ()=> showReport(b.dataset.report));
  document.getElementById("printReportBtn")?.addEventListener("click", async ()=>{
    const html = document.getElementById("periodReportHtml");
    if(html && html.style.display !== "none" && html.innerHTML){
      const printed = await printHtmlDocument(document.getElementById("reportTitle").textContent, html.innerHTML);
      if(!printed) toast("File ready — open it to print or share");
    }else window.print();
  });
  document.getElementById("allocReceipt").onchange = fillAllocRows;
  document.getElementById("saveAllocBtn").onclick = saveAllocation;
  document.getElementById("saveCnAllocBtn")?.addEventListener("click", saveCnAllocation);
  document.getElementById("allocCn")?.addEventListener("change", fillCnAllocRows);
  document.getElementById("invCustomer")?.addEventListener("change", ()=>{
    filterVehiclesForInvoice();
    queueInvoiceWipSave();
  });
  document.getElementById("rvCustomer")?.addEventListener("change", fillRvAlloc);
  document.getElementById("rvAmount")?.addEventListener("input", fillRvAlloc);
  document.getElementById("rvMethod")?.addEventListener("change", ()=>{
    syncRvMethodUi({ setDefaultStatus: true });
  });
  document.getElementById("cnCustomer")?.addEventListener("change", ()=>{
    const cnCustomer = document.getElementById("cnCustomer");
    const cnInvoice = document.getElementById("cnInvoice");
    if(cnCustomer && cnInvoice) fillNoteInvoices(cnInvoice, cnCustomer.value);
  });
  document.getElementById("dnCustomer")?.addEventListener("change", ()=>{
    const dnCustomer = document.getElementById("dnCustomer");
    const dnInvoice = document.getElementById("dnInvoice");
    if(dnCustomer && dnInvoice) fillNoteInvoices(dnInvoice, dnCustomer.value);
  });
  document.getElementById("chqCustomer")?.addEventListener("change", ()=>{
    const chqCustomer = document.getElementById("chqCustomer");
    const chqInvoice = document.getElementById("chqInvoice");
    if(chqCustomer && chqInvoice) fillNoteInvoices(chqInvoice, chqCustomer.value);
  });
  document.getElementById("cnInvoice")?.addEventListener("change", ()=>{
    const cnInvoice = document.getElementById("cnInvoice");
    const cnAmount = document.getElementById("cnAmount");
    const inv = invoices.find(i=> i.invNo === cnInvoice?.value);
    if(inv && cnAmount && !num(cnAmount.value)) cnAmount.value = invBalance(inv);
  });
  document.getElementById("dnInvoice")?.addEventListener("change", ()=>{
    // Debit note is an additional charge — do not auto-fill amount from invoice balance
  });
  document.getElementById("chqInvoice")?.addEventListener("change", ()=>{
    const chqInvoice = document.getElementById("chqInvoice");
    const chqAmt = document.getElementById("chqAmt");
    const inv = invoices.find(i=> i.invNo === chqInvoice?.value);
    if(inv && chqAmt && !num(chqAmt.value)) chqAmt.value = invBalance(inv);
  });
  document.getElementById("globalSearch").onkeydown = e=>{
    if(e.key === "Enter") runGlobalSearch(e.target.value.trim());
  };
  document.getElementById("searchCloseBtn")?.addEventListener("click", ()=>{
    document.getElementById("searchOverlay").hidden = true;
  });
  document.getElementById("searchOverlay")?.addEventListener("click", e=>{
    if(e.target.id === "searchOverlay") e.target.hidden = true;
  });
  document.getElementById("notifBtn")?.addEventListener("click", e=>{
    e.stopPropagation();
    e.preventDefault();
    const p = document.getElementById("notifPanel");
    if(!p) return;
    const opening = !!p.hidden;
    if(opening){
      // Anchor under the bell (works with position:fixed; avoids clip under .main overflow)
      try{
        const r = e.currentTarget.getBoundingClientRect();
        p.style.top = Math.round(r.bottom + 8) + "px";
        p.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + "px";
        p.style.left = "";
        if(window.matchMedia("(max-width:760px)").matches){
          p.style.left = "10px";
          p.style.right = "10px";
        }
      }catch(_){}
      // Mobile WebView often fires a follow-up document click that would instantly close
      window._s4NotifIgnoreCloseUntil = Date.now() + 450;
    }
    p.hidden = !opening;
  });
  document.addEventListener("click", ()=>{
    if(Date.now() < (window._s4NotifIgnoreCloseUntil || 0)) return;
    const p = document.getElementById("notifPanel");
    if(p) p.hidden = true;
  });
  document.getElementById("notifPanel")?.addEventListener("click", e=> e.stopPropagation());
  document.getElementById("saveDriveClientBtn")?.addEventListener("click", ()=>{
    try{
      saveDriveClientId(document.getElementById("driveClientIdInput").value);
      toast("Drive Client ID saved");
      renderBackupPage();
    }catch(err){ toast(err.message); }
  });
  const backupBtn = document.getElementById("driveBackupBtn");
  backupBtn.onclick = async ()=>{
    try{
      await runFullBackup({ mode: "drive", silent: false });
      toast("Backup saved to Drive");
      renderBackupPage();
    }catch(e){ toast(e.message || String(e)); }
  };
  document.getElementById("driveRestoreBtn").onclick = async ()=>{
    await refreshDriveBackupList();
  };
  document.getElementById("localBackupBtn")?.addEventListener("click", async ()=>{
    try{
      const res = await runFullBackup({ mode: "local", silent: false });
      toast(res.local?.mode === "desktop"
        ? `Local backup: ${res.local.path}`
        : `Local backup downloaded (${res.local?.filename || ""}) — check Downloads`);
      renderBackupPage();
    }catch(e){ toast(friendlyFirestoreError(e)); }
  });
  document.getElementById("localRestoreBtn")?.addEventListener("click", ()=>{
    if(!isOwnerRole()) return toast("Only owner can restore");
    document.getElementById("localRestoreFile")?.click();
  });
  document.getElementById("localRestoreFile")?.addEventListener("change", async e=>{
    const file = e.target.files?.[0];
    e.target.value = "";
    if(!file) return;
    if(!confirm("Restore merges into Firestore (same IDs overwritten). Records missing from this backup file are NOT deleted. Continue?")) return;
    try{
      await restoreLocalBackup(db, file);
      await logActivity({ action:"restore", staffName: who(), module:"Backup", summary: "Local file restore " + file.name });
      toast("Local restore started — data will appear as sync completes");
    }catch(err){ toast(friendlyFirestoreError(err)); }
  });
  document.getElementById("recalcBalancesBtn")?.addEventListener("click", async ()=>{
    try{
      if(!isOwnerRole()) return toast("Only owner can recalculate");
      if(!confirm("Recalculate paid/credited/paidDate on all non-draft invoices from source records?")) return;
      const res = await recalculateInvoiceBalances();
      toast(`Checked ${res.checked}, fixed ${res.fixed}`);
      if(res.details.length) console.info("Recalculate details", res.details);
      await logActivity({ action:"edit", staffName: who(), module:"Settings", summary: `Recalculate balances fixed ${res.fixed}/${res.checked}` });
    }catch(e){ toast(friendlyFirestoreError(e)); }
  });
  document.getElementById("archiveExportBtn")?.addEventListener("click", archiveExportCsv);
  document.getElementById("archiveDeleteBtn")?.addEventListener("click", archiveDeleteOld);
  document.getElementById("copyInviteCodeBtn")?.addEventListener("click", async ()=>{
    const code = document.getElementById("inviteCodeOut")?.textContent || "";
    if(!code) return;
    try{ await navigator.clipboard.writeText(code); toast("Invite code copied"); }
    catch{ toast("Copy failed"); }
  });
  wireFirebaseUsageLink();
}

function refreshSelects(){
  ["ledgerCustomer","stmtCustomer","waCustomer","invCustomer","rvCustomer","cnCustomer","dnCustomer","chqCustomer","discCustomer","vCustomer"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) customerOptions(el, el.value);
  });
  filterVehiclesForInvoice();
}

/**
 * Shared backup entry for Settings buttons + close/exit paths.
 * mode: "local" | "drive" | "full" (Local + Drive when Drive configured)
 * silent: skip toasts; skip browser download spam (Drive-only / no-op local on PWA)
 */
async function runFullBackup({ mode = "full", silent = false } = {}){
  if(!isOwnerRole()){
    if(!silent) toast(mode === "local" ? "Only owner can run local backup" : "Only owner can run backup");
    throw new Error("Only owner can run backup");
  }
  const parts = { shop, invoices, customers, vehicles, products, services, receipts, creditNotes, debitNotes, cheques, discounts };
  const payload = buildBackupSnapshot(parts);
  const size = new Blob([JSON.stringify(payload)]).size;
  const name = `s4-backup-${today()}.json`;
  const result = { local: null, drive: null };
  const canFileLocal = !!(window.s4Desktop?.saveLocalBackup);
  // Silent on browser/PWA: never trigger repeated download dialogs
  const doLocal = (mode === "local" || mode === "full") && (!silent || canFileLocal);

  if(doLocal){
    result.local = await saveLocalBackup(parts);
    recordBackupHistory({
      at: Date.now(),
      name: result.local.filename || name,
      size: result.local.size || size,
      type: silent ? "Auto Local" : "Local",
      status: "Successful"
    });
  }

  if(mode === "drive" || mode === "full"){
    if(!isDriveBackupConfigured()){
      if(mode === "drive") throw new Error("Drive Client ID not configured");
    }else{
      try{
        const file = await backupToDrive(name, payload);
        result.drive = file;
        recordBackupHistory({
          at: Date.now(),
          name: file.name || name,
          size,
          type: silent ? "Auto Drive" : "Manual",
          status: "Successful",
          driveId: file.id || ""
        });
      }catch(e){
        if(mode === "drive" || !silent) throw e;
        console.warn("Silent Drive backup skipped", e);
      }
    }
  }
  return result;
}

/** Idle return → Dashboard: visibilitychange only (not a reading-time timer). Invoice WIP localStorage is preserved. */
const IDLE_RESET_MS = 300000; // 5 min; change to 600000 for 10 min
const IDLE_HIDDEN_KEY = "s4_hidden_at";

function wireIdleDashboardReset(){
  if(window._s4IdleWired) return;
  window._s4IdleWired = true;
  document.addEventListener("visibilitychange", ()=>{
    if(document.visibilityState === "hidden"){
      try{ sessionStorage.setItem(IDLE_HIDDEN_KEY, String(Date.now())); }catch(_){}
      return;
    }
    let hiddenAt = 0;
    try{ hiddenAt = Number(sessionStorage.getItem(IDLE_HIDDEN_KEY) || 0); }catch(_){}
    if(!hiddenAt) return;
    try{ sessionStorage.removeItem(IDLE_HIDDEN_KEY); }catch(_){}
    if(Date.now() - hiddenAt < IDLE_RESET_MS) return;
    // Fresh boot lands on Dashboard; do not clear s4_invoice_wip_v1
    location.reload();
  });
}

async function promptCloseBackupChoice(){
  // Returns "yes" | "no" | "cancel"
  if(window.s4Desktop?.askCloseBackup){
    return await window.s4Desktop.askCloseBackup();
  }
  // Android / web: two-step confirm approximates Yes / No / Cancel
  const msg = "Backup all data before closing? (Local + Google Drive)";
  if(window.confirm(msg + "\n\nOK = Yes (backup then close)\nCancel = other options")){
    return "yes";
  }
  if(window.confirm("Close without backup?\n\nOK = No backup, close anyway\nCancel = stay open")){
    return "no";
  }
  return "cancel";
}

async function handleExitWithBackupPrompt(){
  const choice = await promptCloseBackupChoice();
  if(choice === "cancel") return false;
  if(choice === "yes"){
    try{
      toast("Backup in progress…");
      await runFullBackup({ mode: "full", silent: false });
      toast("Backup complete");
    }catch(e){
      toast(e.message || String(e));
      if(!window.confirm("Backup failed. Close anyway?")) return false;
    }
  }
  return true;
}

function wireCloseBackupHooks(){
  if(window._s4CloseBackupWired) return;
  window._s4CloseBackupWired = true;

  // Desktop Electron: main process prevents close and pings renderer
  if(window.s4Desktop?.onCloseBackupRequest){
    window.s4Desktop.onCloseBackupRequest(async ()=>{
      const ok = await handleExitWithBackupPrompt();
      if(ok) window.s4Desktop.allowClose?.();
    });
  }

  const platform = String(window.Capacitor?.getPlatform?.() || "").toLowerCase();
  const isAndroid = !!(window.Capacitor?.isNativePlatform?.() && platform === "android");
  // iPhone PWA/browser: NO close popup — silent periodic + pagehide only.
  const isIosOrBrowser = !isAndroid && !window.s4Desktop;

  if(isAndroid){
    const App = window.Capacitor?.Plugins?.App;
    if(App?.addListener){
      App.addListener("backButton", async ()=>{
        if(handleAppBack()) return;
        const ok = await handleExitWithBackupPrompt();
        if(ok) App.exitApp?.();
      });
      App.addListener("appStateChange", ({ isActive })=>{
        if(isActive) return;
        runFullBackup({ mode: "full", silent: true }).catch(()=>{});
      });
    }else{
      console.warn("@capacitor/app not registered — install plugin and cap sync");
    }
  }

  if(isIosOrBrowser){
    const SILENT_MS = 10 * 60 * 1000;
    setInterval(()=>{
      if(!document.getElementById("app")?.classList.contains("visible")) return;
      if(!isOwnerRole()) return;
      runFullBackup({ mode: "full", silent: true }).catch(()=>{});
    }, SILENT_MS);
    window.addEventListener("pagehide", ()=>{
      if(!isOwnerRole()) return;
      runFullBackup({ mode: "full", silent: true }).catch(()=>{});
    });
  }
}

function unlinkedDebitNotes(customerName){
  return debitNotes.filter(n=>{
    if(!noteIsLive(n)) return false;
    if(customerName && n.customer !== customerName) return false;
    const invNo = String(n.invoice || "").trim();
    if(!invNo) return true;
    // Linked but invoice missing/deleted → still count so money is not lost
    const inv = invoices.find(i=> i.invNo === invNo && i.customer === n.customer);
    return !inv;
  });
}

function unlinkedDebitTotal(customerName){
  return unlinkedDebitNotes(customerName).reduce((s,n)=> s + num(n.amount), 0);
}

/** Posted debit notes linked to a specific invoice (amount already applied onto invoice.total) */
function linkedDebitTotalForInvoice(invNo, customer){
  const no = String(invNo || "").trim();
  if(!no) return 0;
  return debitNotes.filter(n=>{
    if(!noteIsLive(n)) return false;
    if(String(n.invoice || "").trim() !== no) return false;
    if(customer && n.customer !== customer) return false;
    return true;
  }).reduce((s,n)=> s + num(n.amount), 0);
}

function totalReceivableAmount(){
  // Same book as Customer Outstanding / Ledger — net all customers (advances reduce total)
  const names = new Set();
  customers.forEach(c=>{ if(c.name) names.add(c.name); });
  invoices.forEach(i=>{ if(i.customer) names.add(i.customer); });
  debitNotes.forEach(n=>{ if(n.customer) names.add(n.customer); });
  receipts.forEach(r=>{ if(r.customer) names.add(r.customer); });
  creditNotes.forEach(n=>{ if(n.customer) names.add(n.customer); });
  discounts.forEach(d=>{ if(d.customer) names.add(d.customer); });
  let s = 0;
  names.forEach(n=>{ s += customerOutstanding(n); });
  return s;
}

function renderDashboard(){
  const open = invoices.filter(i=> i.status !== "Draft" && invBalance(i) > 0);
  const overdue = invoices.filter(i=> invStatus(i) === "Overdue");
  const recToday = receipts.filter(r=> r.date === today() && receiptAffectsBalance(r));
  const invToday = invoices.filter(i=> i.invDate === today() && i.status !== "Draft");
  const totalRec = totalReceivableAmount();
  const overdueAmt = overdue.reduce((s,i)=> s + invBalance(i), 0);
  document.getElementById("dashCards").innerHTML = [
    ["TOTAL RECEIVABLE", money(totalRec), "Ledger outstanding (all customers)"],
    ["TODAY SALES", money(invToday.reduce((s,i)=> s+num(i.total),0)), invToday.length + " invoices"],
    ["TODAY RECEIVED", money(recToday.reduce((s,i)=> s+num(i.amount),0)), recToday.length + " receipts"],
    ["OVERDUE", money(overdueAmt), overdue.length + " invoices"],
    ["CUSTOMERS", customers.length, customers.filter(c=>c.status==="Active").length + " active"],
    ["OPEN INVOICE BAL.", money(open.reduce((s,i)=> s + invBalance(i), 0)), open.length + " invoices · unpaid invoice totals only (excludes advances)"]
  ].map(([a,b,c])=> `<div class="card"><div class="metric-label">${a}</div><div class="metric">${b}</div><div class="metric-note">${c}</div></div>`).join("");

  const buckets = agingSums();
  const max = Math.max(1, ...Object.values(buckets));
  const labels = [["current","Current"],["d30","1–30"],["d60","31–60"],["d90","61–90"],["d90p","90+"]];
  document.getElementById("dashAging").innerHTML = labels.map(([k,l])=>
    `<div class="age-row"><span class="age-label">${l}</span><div class="bar"><i style="width:${Math.round(buckets[k]/max*100)}%"></i></div><b class="age-amt">${money(buckets[k])}</b></div>`
  ).join("");

  const byCust = {};
  overdue.forEach(i=>{ byCust[i.customer] = (byCust[i.customer]||0) + invBalance(i); });
  const top = Object.entries(byCust).sort((a,b)=> b[1]-a[1]).slice(0,6);
  document.getElementById("dashOverdue").innerHTML = top.length
    ? `<div class="dash-overdue-list">${top.map(([n,a])=>
        `<div class="dash-overdue-row"><span class="dash-overdue-name">${esc(n)}</span><b class="red dash-overdue-amt">${money(a)}</b></div>`
      ).join("")}</div>`
    : `<div class="muted">No overdue</div>`;

  const recent = [
    ...invoices.map(i=>({ date:i.invDate, type:"Invoice", ref:i.invNo, customer:i.customer, amount:i.total, status:invStatus(i) })),
    ...receipts.map(r=>({ date:r.date, type:"Receipt", ref:r.rvNo, customer:r.customer, amount:r.amount, status:r.status||"Posted" }))
  ].sort((a,b)=> String(b.date).localeCompare(String(a.date))).slice(0,8);
  document.getElementById("dashRecent").innerHTML = recent.length
    ? recent.map(r=> `<tr><td>${esc(r.date)}</td><td>${esc(r.type)}</td><td>${esc(r.ref)}</td><td>${esc(r.customer)}</td><td>${money(r.amount)}</td><td>${badge(r.status)}</td></tr>`).join("")
    : `<tr><td colspan="6" class="empty">No transactions yet</td></tr>`;
}

function agingSums(){
  const buckets = { current:0, d30:0, d60:0, d90:0, d90p:0 };
  invoices.forEach(i=>{
    const b = agingBucket(i);
    if(b) buckets[b] += invBalance(i);
  });
  // Customer-level debit notes (no invoice link) sit in Current
  buckets.current += unlinkedDebitTotal();
  return buckets;
}

function renderAging(){
  const b = agingSums();
  document.getElementById("agingCards").innerHTML = [
    ["CURRENT", b.current],["1–30 DAYS", b.d30],["31–60 DAYS", b.d60],["61–90 DAYS", b.d90],["90+ DAYS", b.d90p],
    ["TOTAL", b.current+b.d30+b.d60+b.d90+b.d90p]
  ].map(([l,v])=> `<div class="card"><div class="metric-label">${l}</div><div class="metric">${money(v)}</div></div>`).join("");

  const map = {};
  invoices.forEach(i=>{
    const name = i.customer || "—";
    if(!map[name]) map[name] = { current:0, d30:0, d60:0, d90:0, d90p:0 };
    const k = agingBucket(i);
    if(k) map[name][k] += invBalance(i);
  });
  unlinkedDebitNotes().forEach(n=>{
    const name = n.customer || "—";
    if(!map[name]) map[name] = { current:0, d30:0, d60:0, d90:0, d90p:0 };
    map[name].current += num(n.amount);
  });
  document.getElementById("agingRows").innerHTML = Object.entries(map).map(([name,x])=>{
    const tot = x.current+x.d30+x.d60+x.d90+x.d90p;
    if(tot<=0) return "";
    return `<tr><td>${esc(name)}</td><td>${money(x.current)}</td><td>${money(x.d30)}</td><td>${money(x.d60)}</td><td>${money(x.d90)}</td><td class="red">${money(x.d90p)}</td><td><b>${money(tot)}</b></td>
      <td><button class="btn small" type="button" data-stmt="${esc(name)}">Statement</button></td></tr>`;
  }).join("") || `<tr><td colspan="8" class="empty">No receivables</td></tr>`;
  document.querySelectorAll("[data-stmt]").forEach(b=> b.onclick = ()=>{
    showPage("statements");
    document.getElementById("stmtCustomer").value = b.dataset.stmt;
    fillStatement();
  });
}

function renderCustomers(){
  const q = (document.getElementById("customerSearch").value||"").toLowerCase();
  const rows = customers.filter(c=>{
    if(customerFilter && c.status !== customerFilter) return false;
    const blob = `${c.code} ${c.name} ${c.mobile} ${c.trn}`.toLowerCase();
    return blob.includes(q);
  });
  document.getElementById("customerRows").innerHTML = rows.length ? rows.map(c=> `<tr>
    <td>${esc(c.code)}</td><td>${esc(c.name)}</td><td>${esc(c.contact)}</td><td>${esc(c.mobile)}</td>
    <td>${money(c.creditLimit)}</td><td>${money(customerOutstanding(c.name))}</td>
    <td class="${customerOverdue(c.name)?"red":""}">${money(customerOverdue(c.name))}</td>
    <td>${badge(c.status||"Active")}</td>
    <td><button class="btn small" type="button" data-edit-c="${c.id}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="9" class="empty">No customers — add one</td></tr>`;
  document.querySelectorAll("[data-edit-c]").forEach(b=> b.onclick = ()=> editCustomer(b.dataset.editC));
}

function resetCustomer(){
  cId.value = "";
  cCode.value = `CUS-${String(customers.length + 1).padStart(4, "0")}`;
  cName.value = cContact.value = cMobile.value = cWhatsapp.value = cEmail.value = cTrn.value = cAddr.value = cNotes.value = "";
  if(cSalesman) cSalesman.value = "";
  if(cTerms) cTerms.value = "30 Days Credit";
  cLimit.value = 0; cDays.value = shop.creditDays || 30; cStatus.value = "Active"; cType.value = "Garage";
}

function editCustomer(id){
  const c = customers.find(x=> x.id === id);
  if(!c) return;
  cId.value = c.id;
  cCode.value = c.code||""; cName.value = c.name||""; cContact.value = c.contact||"";
  cMobile.value = c.mobile||""; cWhatsapp.value = c.whatsapp||""; cEmail.value = c.email||"";
  cTrn.value = c.trn||""; cType.value = c.type||"Garage"; cLimit.value = c.creditLimit||0;
  cDays.value = c.creditDays||30; cStatus.value = c.status||"Active"; cAddr.value = c.addr||""; cNotes.value = c.notes||"";
  if(cSalesman) cSalesman.value = c.salesman||"";
  if(cTerms) cTerms.value = c.paymentTerms || "30 Days Credit";
  openFormModal("customerModal");
}

// Long-term: store customerId on invoices/receipts/notes and match by ID (not name
// string). Until then a rename must carry every linked record with it, so these are
// the collections that hold a customer NAME, with the modules their write rules need.
const CUSTOMER_NAME_REFS = [
  { coll: "invoices",    mods: ["invoices"],                  rows: ()=> invoices },
  { coll: "receipts",    mods: ["receipts","allocation"],     rows: ()=> receipts },
  { coll: "creditNotes", mods: ["credit-notes","allocation"], rows: ()=> creditNotes },
  { coll: "debitNotes",  mods: ["debit-notes"],               rows: ()=> debitNotes },
  { coll: "cheques",     mods: ["cheques"],                   rows: ()=> cheques },
  { coll: "discounts",   mods: ["discounts","receipts"],      rows: ()=> discounts },
  { coll: "vehicles",    mods: ["vehicles"],                  rows: ()=> vehicles }
];

function collectCustomerNameRefs(oldName){
  const refs = [];
  const blocked = [];
  CUSTOMER_NAME_REFS.forEach(({ coll, mods, rows })=>{
    const hits = (rows() || []).filter(row=> row && row.id && row.customer === oldName);
    if(!hits.length) return;
    if(!mods.some(m=> memberCan(member, m))){
      blocked.push(coll);
      return;
    }
    hits.forEach(row=> refs.push({ coll, row }));
  });
  return { refs, blocked };
}

async function saveCustomer(){
  if(!requireModule("customers")) return;
  const name = cName.value.trim();
  if(!name) return toast("Company name required");
  const dup = customers.find(x=> x.id !== cId.value && String(x.name||"").trim().toLowerCase() === name.toLowerCase());
  if(dup && !confirm(`A customer named '${dup.name}' already exists (Code: ${dup.code||"—"}, Status: ${dup.status||"—"}). Adding a duplicate can cause the wrong customer record's credit limit/block-status to apply on invoices. Continue anyway?`)) return;
  const prevCustomer = cId.value ? customers.find(x=> x.id === cId.value) : null;
  const oldName = String(prevCustomer?.name || "").trim();
  const renaming = !!(cId.value && oldName && oldName !== name);
  let renameRefs = [];
  if(renaming){
    const { refs, blocked } = collectCustomerNameRefs(oldName);
    if(blocked.length){
      return toast(`Cannot rename — you lack write permission for ${blocked.join(", ")}. Ask the owner to rename.`);
    }
    renameRefs = refs;
    const ok = confirm(
      `Rename customer "${oldName}" → "${name}"?\n\n` +
      `Invoices, receipts, notes, cheques, discounts and vehicles are linked by NAME, ` +
      `so ${renameRefs.length} linked record(s) will be updated too.\n\n` +
      `OK = rename and update linked records\nCancel = do not save`
    );
    if(!ok) return;
  }
  const data = {
    code: cCode.value.trim(), name, contact: cContact.value.trim(), mobile: cMobile.value.trim(),
    whatsapp: cWhatsapp.value.trim() || cMobile.value.trim(), email: cEmail.value.trim(),
    trn: cTrn.value.trim(), type: cType.value, creditLimit: num(cLimit.value),
    creditDays: num(cDays.value), status: cStatus.value, salesman: (cSalesman?.value||"").trim(),
    paymentTerms: (cTerms?.value||"").trim(), addr: cAddr.value.trim(), notes: cNotes.value.trim(),
    updatedAt: Date.now(), updatedBy: who()
  };
  try{
    const write = (async ()=>{
      if(!cId.value){
        data.createdAt = Date.now();
        data.createdBy = who();
        await addDoc(col("customers"), data);
        return;
      }
      const custRef = doc(db, "customers", cId.value);
      if(!renaming){
        await updateDoc(custRef, data);
        return;
      }
      const patch = { customer: name, updatedAt: Date.now() };
      // Under the 500-op batch limit the whole rename is one atomic write.
      if(renameRefs.length <= 498){
        const batch = writeBatch(db);
        renameRefs.forEach(({ coll, row })=> batch.update(doc(db, coll, row.id), patch));
        batch.update(custRef, data);
        await batch.commit();
      }else{
        // Too many links for one batch: move the links first, rename the customer last,
        // so a mid-way failure leaves the remaining links still matching the old name.
        const CHUNK = 450;
        for(let i = 0; i < renameRefs.length; i += CHUNK){
          const batch = writeBatch(db);
          renameRefs.slice(i, i + CHUNK).forEach(({ coll, row })=> batch.update(doc(db, coll, row.id), patch));
          await batch.commit();
          renameRefs.slice(i, i + CHUNK).forEach(({ row })=> { row.customer = name; });
        }
        await updateDoc(custRef, data);
      }
      renameRefs.forEach(({ row })=> { row.customer = name; });
    })();
    commitWrite(
      write.then(()=>{
        closeModal("customerModal");
        return logActivity({
          action: "edit", staffName: who(), customer: name,
          summary: renaming
            ? `Customer renamed ${oldName} → ${name} (${renameRefs.length} linked record(s))`
            : "Customer saved " + name,
          oldValue: renaming ? oldName : "",
          newValue: renaming ? name : ""
        });
      }),
      { okMsg: renaming ? `Customer renamed — ${renameRefs.length} linked record(s) updated` : "Customer saved" }
    );
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function renderInvoices(){
  const q = (document.getElementById("invoiceSearch").value||"").toLowerCase();
  const rows = invoices.filter(i=>{
    const st = invStatus(i);
    if(invoiceFilter && st !== invoiceFilter) return false;
    return `${i.invNo} ${i.computerNo||""} ${i.manualNo||""} ${i.customer} ${i.vehicle}`.toLowerCase().includes(q);
  }).sort((a,b)=> String(b.invDate).localeCompare(String(a.invDate)));
  document.getElementById("invoiceRows").innerHTML = rows.length ? rows.map(i=> `<tr>
    <td>${esc(i.invNo)}${i.computerNo?`<div class="muted" style="font-size:11px">PC: ${esc(i.computerNo)}</div>`:""}${i.manualNo?`<div class="muted" style="font-size:11px">Manual: ${esc(i.manualNo)}</div>`:""}</td><td>${esc(i.invDate)}</td><td>${esc(i.customer)}</td><td>${esc(i.vehicle)}</td>
    <td>${esc(i.dueDate)}</td><td>${money(i.total)}</td><td>${money(i.paid)}</td>
    <td>${money(invBalance(i))}</td><td>${badge(invStatus(i))}</td>
    <td class="actions" style="white-space:nowrap">
      <button class="btn small" type="button" data-open-inv="${i.id}">Open</button>
      <button class="btn small danger" type="button" data-del-inv="${i.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="10" class="empty">No invoices</td></tr>`;
  document.querySelectorAll("[data-open-inv]").forEach(b=> b.onclick = ()=> editInvoice(b.dataset.openInv));
  document.querySelectorAll("[data-del-inv]").forEach(b=> b.onclick = ()=> deleteInvoice(b.dataset.delInv));
}

async function deleteInvoice(id){
  if(!requireModule("invoices")) return;
  const i = invoices.find(x=> x.id === id);
  if(!i) return toast("Invoice not found");
  if(num(i.paid) > 0){
    return toast("Cannot delete — payment already allocated. Remove receipt allocation first.");
  }
  if(num(i.credited) > 0){
    return toast("Cannot delete — credit/discount already applied on this invoice.");
  }
  const linkedDn = debitNotes.some(n=>
    noteIsLive(n)
    && String(n.invoice || "").trim() === String(i.invNo || "").trim()
    && n.customer === i.customer
  );
  if(linkedDn){
    return toast("Cannot delete — a debit note is linked to this invoice.");
  }
  const linkedCn = creditNotes.some(n=>
    noteIsLive(n)
    && (
      String(n.invoice || "").trim() === String(i.invNo || "").trim()
      || (n.allocations || []).some(a=> a.invoiceId === i.id || a.invoiceNo === i.invNo)
    )
    && n.customer === i.customer
  );
  if(linkedCn){
    return toast("Cannot delete — a credit note is linked to this invoice.");
  }
  const msg = `Delete invoice ${i.invNo} (${money(i.total)})?\nCustomer: ${i.customer}\n\nThis cannot be undone.`;
  if(!confirm(msg)) return;
  try{
    await deleteDoc(doc(db, "invoices", id));
    await logActivity({
      action: "delete",
      staffName: who(),
      module: "Invoice",
      record: i.invNo,
      customer: i.customer,
      summary: "Deleted invoice " + i.invNo,
      oldValue: money(i.total)
    });
    if(invId?.value === id){
      clearInvoiceWip();
      _editingExistingInvoice = false;
      closeModal("invoiceModal");
    }
    toast("Invoice deleted");
  }catch(e){ toast(e.message || String(e)); }
}

function getShopInvoiceEntryMode(){
  const fromShop = shop?.invoiceEntryMode;
  if(fromShop === "simple" || fromShop === "detailed"){
    _invoiceEntryModeMem = fromShop;
    return fromShop;
  }
  try{
    const m = localStorage.getItem(INVOICE_MODE_KEY);
    if(m === "simple" || m === "detailed"){
      _invoiceEntryModeMem = m;
      return m;
    }
  }catch(_){}
  return _invoiceEntryModeMem || "detailed";
}

function getInvoiceEntryMode(){
  // Active invoice form may temporarily differ (WIP) without changing shop preference
  if(_formInvoiceMode === "simple" || _formInvoiceMode === "detailed") return _formInvoiceMode;
  return getShopInvoiceEntryMode();
}

function setInvoiceEntryMode(mode, { persist = true, formOnly = false } = {}){
  const m = mode === "simple" ? "simple" : "detailed";
  if(formOnly){
    _formInvoiceMode = m;
    return m;
  }
  _formInvoiceMode = null;
  _invoiceEntryModeMem = m;
  if(persist){
    try{ localStorage.setItem(INVOICE_MODE_KEY, m); }catch(_){}
  }
  return m;
}

async function selectInvoiceEntryMode(mode){
  if(mode !== "simple" && mode !== "detailed") return;
  if(!isOwnerRole()){
    toast("Only the Owner can change invoice entry mode");
    syncInvoiceModeSettingsUi();
    return;
  }
  setInvoiceEntryMode(mode, { persist: true });
  // Drop stale WIP mode so next invoice uses the new shop preference
  try{
    const raw = localStorage.getItem(INVOICE_WIP_KEY);
    if(raw){
      const wip = JSON.parse(raw);
      if(wip && typeof wip === "object"){
        wip.mode = mode;
        localStorage.setItem(INVOICE_WIP_KEY, JSON.stringify(wip));
      }
    }
  }catch(_){}
  syncInvoiceModeSettingsUi();
  applyInvoiceEntryMode();
  try{
    await setDoc(doc(db, "shop", "info"), { invoiceEntryMode: mode, updatedAt: Date.now() }, { merge: true });
    toast(mode === "simple" ? "Simple total mode — applied for all staff" : "Detailed line mode — applied for all staff");
  }catch(e){
    toast(friendlyFirestoreError(e));
  }
}

function wireInvoiceModeSettings(){
  const root = document.getElementById("settingsInvoice");
  if(!root) return;
  const bindBtn = (id, mode)=>{
    const btn = document.getElementById(id);
    if(!btn || btn._invModeClick) return;
    btn._invModeClick = true;
    btn.addEventListener("click", e=>{
      e.preventDefault();
      e.stopPropagation();
      selectInvoiceEntryMode(mode);
    });
  };
  bindBtn("invoiceModeDetailedBtn", "detailed");
  bindBtn("invoiceModeSimpleBtn", "simple");
  if(!root._invModeWired){
    root._invModeWired = true;
    root.addEventListener("click", e=>{
      const btn = e.target.closest("[data-invoice-mode]");
      if(!btn || btn.disabled) return;
      e.preventDefault();
      selectInvoiceEntryMode(btn.getAttribute("data-invoice-mode"));
    });
  }
  syncInvoiceModeSettingsUi();
}

function syncInvoiceModeSettingsUi(){
  const mode = getShopInvoiceEntryMode();
  const owner = isOwnerRole();
  document.querySelectorAll("[data-invoice-mode]").forEach(btn=>{
    btn.classList.toggle("active", btn.getAttribute("data-invoice-mode") === mode);
    btn.disabled = !owner;
  });
  const hint = document.getElementById("invoiceModeHint");
  if(hint){
    hint.textContent = owner
      ? "Owner: pick a mode with one click — the same mode applies automatically on every salesman PC."
      : `Current shop mode: ${mode === "simple" ? "Total amount only" : "Detailed entry"} (only the Owner can change it).`;
  }
}

function applyInvoiceEntryMode(){
  const simple = getInvoiceEntryMode() === "simple";
  const detailed = document.getElementById("invDetailedBlock");
  const simpleBlock = document.getElementById("invSimpleBlock");
  if(detailed) detailed.hidden = simple;
  if(simpleBlock) simpleBlock.hidden = !simple;
  const vatInfo = document.getElementById("invSimpleVatInfo");
  if(vatInfo) vatInfo.value = `VAT ${num(shop.vatRate) || 5}% included in total`;
  calcInvoice();
}

/** Daily 11:00 reminder starting 10 days before expiry (trial or license). */
const EXPIRY_WARN_DAYS = 10;
const EXPIRY_NOTIF_HOUR = 11;
const EXPIRY_NOTIF_KEY = "s4_expiry_notif_day_v1";

/** OS / system tray notification — Web Notification fails inside Android WebView. */
async function showSystemNotification(title, body){
  try{
    if(isAndroidNative()){
      const LN = window.Capacitor?.Plugins?.LocalNotifications;
      if(LN?.schedule){
        try{
          if(LN.createChannel){
            await LN.createChannel({
              id: "s4-alerts",
              name: "S4 Alerts",
              description: "Expiry and important alerts",
              importance: 5,
              visibility: 1
            });
          }
        }catch(_){}
        try{
          const perm = await LN.requestPermissions?.();
          if(perm && perm.display === "denied") return false;
        }catch(_){}
        const id = Math.floor(Date.now() % 100000) + 1;
        await LN.schedule({
          notifications: [{
            id,
            title: String(title || "S4 Invoice Tracker"),
            body: String(body || ""),
            channelId: "s4-alerts",
            schedule: { at: new Date(Date.now() + 800) }
          }]
        });
        return true;
      }
    }
    if(window.Notification && Notification.permission === "granted"){
      new Notification(String(title || "S4 Invoice Tracker"), { body: String(body || "") });
      return true;
    }
    if(window.Notification && Notification.permission !== "denied"){
      const p = await Notification.requestPermission();
      if(p === "granted"){
        new Notification(String(title || "S4 Invoice Tracker"), { body: String(body || "") });
        return true;
      }
    }
  }catch(err){
    console.warn("System notification failed", err);
  }
  return false;
}

function wireExpiryReminders(){
  if(window._s4ExpiryWired) return;
  window._s4ExpiryWired = true;
  // Ask Android notification permission once after login (WebView has no Web Notification API)
  if(isAndroidNative()){
    setTimeout(()=>{
      const LN = window.Capacitor?.Plugins?.LocalNotifications;
      LN?.requestPermissions?.().catch(()=>{});
    }, 2500);
  }
  const tick = ()=> maybeShowExpiryReminder().catch(()=>{});
  tick();
  setInterval(tick, 60 * 1000);
  document.addEventListener("visibilitychange", ()=>{
    if(document.visibilityState === "visible") tick();
  });
}

async function maybeShowExpiryReminder(){
  const access = await getAccessStatus();
  if(!access?.allowed) return;
  const days = Number(access.daysRemaining);
  if(!Number.isFinite(days) || days < 0 || days > EXPIRY_WARN_DAYS){
    window._s4ExpiryBanner = null;
    return;
  }
  const now = new Date();
  if(now.getHours() < EXPIRY_NOTIF_HOUR){
    // Still keep in-app bell item once past midnight of warn window
    const end = access.expiresAt || access.trialEndsAt || "";
    window._s4ExpiryBanner = {
      title: days === 0 ? "Software expires today" : `Software expires in ${days} day(s)`,
      detail: end
        ? `Expire date: ${String(end).slice(0, 10)} · Help & Support → Contact S4 Business Thinking`
        : "Help & Support → Contact S4 Business Thinking",
      days,
      at: Date.now()
    };
    refreshNotifications();
    return;
  }
  const dayKey = now.toISOString().slice(0, 10);
  let already = false;
  try{ already = localStorage.getItem(EXPIRY_NOTIF_KEY) === dayKey; }catch(_){}
  const end = access.expiresAt || access.trialEndsAt || "";
  const title = days === 0
    ? "Software expires today"
    : `Software expires in ${days} day(s)`;
  const detail = end
    ? `Expire date: ${String(end).slice(0, 10)} · Help & Support → Contact S4 Business Thinking`
    : "Help & Support → Contact S4 Business Thinking";
  window._s4ExpiryBanner = { title, detail, days, at: Date.now() };
  refreshNotifications();
  if(already) return;
  toast(`${title} — ${detail}`);
  await showSystemNotification(title, detail);
  try{ localStorage.setItem(EXPIRY_NOTIF_KEY, dayKey); }catch(_){}
}

function invoiceWipFieldIds(){
  return ["invId","invNo","invComputer","invManual","invDate","invDue","invCustomer","invVehicle","invDriver","invReceived","invDn","invLpo","invRef","invTerms","invNotes","invSimpleTotal"];
}

function normalizeInvLineItem(raw){
  const qty = num(raw.qty) || 1;
  const price = num(raw.price);
  const disc = num(raw.disc) || 0;
  const vat = num(raw.vat ?? shop.vatRate ?? 5);
  const name = String(raw.name || "").trim();
  const code = String(raw.code || "").trim();
  const net = Math.max(0, qty * price - disc);
  const vatAmt = net * vat / 100;
  return { name, code, qty, price, disc, vat, net, vatAmt, line: net + vatAmt };
}

function readInvEntryDraft(){
  return {
    name: document.getElementById("invEntryName")?.value || "",
    code: document.getElementById("invEntryCode")?.value || "",
    qty: document.getElementById("invEntryQty")?.value ?? 1,
    price: document.getElementById("invEntryPrice")?.value ?? 0,
    disc: document.getElementById("invEntryDisc")?.value ?? 0,
    vat: document.getElementById("invEntryVat")?.value ?? (shop.vatRate ?? 5)
  };
}

function setInvAddBtnLabel(label){
  const btn = document.getElementById("addInvItemBtn");
  if(btn) btn.textContent = label || "Add";
}

function loadInvLineForEdit(idx){
  const it = _invoiceLineItems[idx];
  if(!it) return;
  const x = normalizeInvLineItem(it);
  const set = (id, val)=>{
    const el = document.getElementById(id);
    if(el) el.value = val;
  };
  set("invEntryName", x.name);
  set("invEntryCode", x.code);
  set("invEntryQty", x.qty);
  set("invEntryPrice", x.price);
  set("invEntryDisc", x.disc);
  set("invEntryVat", x.vat);
  _invoiceLineItems.splice(idx, 1);
  renderInvItemList();
  updateInvEntryPreview();
  calcInvoice();
  queueInvoiceWipSave();
  setInvAddBtnLabel("Update");
  document.getElementById("invEntryName")?.focus();
  toast("Edit the fields, then press Update");
}

function clearInvEntryFields(){
  ["invEntryName","invEntryCode","invEntryPrice","invEntryDisc"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("invEntryQty");
  const vat = document.getElementById("invEntryVat");
  if(qty) qty.value = 1;
  if(vat) vat.value = shop.vatRate ?? 5;
  hideCatalogSuggest();
  updateInvEntryPreview();
  setInvAddBtnLabel("Add");
  document.getElementById("invEntryName")?.focus();
}

function updateInvEntryPreview(){
  const el = document.getElementById("invEntryPreview");
  if(!el) return;
  const draft = readInvEntryDraft();
  if(!String(draft.name).trim()){
    el.textContent = "—";
    return;
  }
  el.textContent = money(normalizeInvLineItem(draft).line);
}

function renderInvItemList(){
  const tbody = document.getElementById("invItemRows");
  if(!tbody) return;
  if(!_invoiceLineItems.length){
    tbody.innerHTML = `<tr class="inv-empty-row"><td colspan="8" class="empty" data-label="">No items added yet — use Add above</td></tr>`;
    return;
  }
  tbody.innerHTML = _invoiceLineItems.map((it, idx)=>{
    const x = normalizeInvLineItem(it);
    return `<tr class="inv-line-row" data-edit-inv-item="${idx}" title="Double-click to edit">
      <td class="inv-name-cell" data-label="Item / Product">${esc(x.name)}</td>
      <td data-label="Code">${esc(x.code)}</td>
      <td data-label="Qty">${esc(x.qty)}</td>
      <td data-label="Unit Price">${money(x.price)}</td>
      <td data-label="Discount">${money(x.disc)}</td>
      <td data-label="VAT %">${esc(x.vat)}%</td>
      <td data-label="Line total">${money(x.line)}</td>
      <td class="inv-entry-actions-cell" data-label=""><button class="btn small danger" type="button" data-rm-inv-item="${idx}">Remove</button></td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("[data-edit-inv-item]").forEach(row=>{
    row.addEventListener("dblclick", e=>{
      if(e.target.closest("[data-rm-inv-item]")) return;
      loadInvLineForEdit(Number(row.dataset.editInvItem));
    });
  });
  tbody.querySelectorAll("[data-rm-inv-item]").forEach(btn=>{
    btn.onclick = e=>{
      e.stopPropagation();
      _invoiceLineItems.splice(Number(btn.dataset.rmInvItem), 1);
      renderInvItemList();
      calcInvoice();
      queueInvoiceWipSave();
    };
  });
}

function commitInvEntryLine(){
  const draft = readInvEntryDraft();
  if(!String(draft.name).trim()) return toast("Enter product / service name");
  _invoiceLineItems.push({
    name: String(draft.name).trim(),
    code: String(draft.code).trim(),
    qty: draft.qty,
    price: draft.price,
    disc: draft.disc,
    vat: draft.vat
  });
  clearInvEntryFields();
  renderInvItemList();
  calcInvoice();
  queueInvoiceWipSave();
  setInvAddBtnLabel("Add");
}

/** Silent flush so Post/Draft does not drop a line sitting in the entry fields. */
function flushInvDraftLine(){
  if(getInvoiceEntryMode() === "simple") return;
  const draft = readInvEntryDraft();
  if(!String(draft.name).trim()) return;
  _invoiceLineItems.push({
    name: String(draft.name).trim(),
    code: String(draft.code).trim(),
    qty: draft.qty,
    price: draft.price,
    disc: draft.disc,
    vat: draft.vat
  });
  clearInvEntryFields();
  renderInvItemList();
}

function setInvoiceLineItems(items){
  _invoiceLineItems = (items || [])
    .filter(it=> String(it?.name || "").trim())
    .map(it=>({
      name: String(it.name).trim(),
      code: String(it.code || "").trim(),
      qty: it.qty ?? 1,
      price: it.price ?? 0,
      disc: it.disc ?? 0,
      vat: it.vat ?? (shop.vatRate ?? 5)
    }));
  renderInvItemList();
}

function collectInvoiceFormState(){
  const entryDraft = readInvEntryDraft();
  const state = {
    savedAt: Date.now(),
    mode: getShopInvoiceEntryMode(),
    lineItems: _invoiceLineItems,
    entryDraft
  };
  invoiceWipFieldIds().forEach(id=>{
    const el = document.getElementById(id);
    if(el) state[id] = el.value;
  });
  return state;
}

function applyInvoiceFormState(state){
  if(!state) return false;
  // Always follow current shop preference — never lock UI to a stale WIP mode
  _formInvoiceMode = null;
  applyInvoiceEntryMode();
  invoiceWipFieldIds().forEach(id=>{
    const el = document.getElementById(id);
    if(el && state[id] != null) el.value = state[id];
  });
  if(state.invCustomer){
    const invCustomer = document.getElementById("invCustomer");
    if(invCustomer){
      customerOptions(invCustomer, state.invCustomer);
      invCustomer.value = state.invCustomer;
    }
  }
  const savedLines = state.lineItems || state.items || [];
  const committed = savedLines.filter(it=>{
    const name = String(it?.name || "").trim();
    if(!name) return false;
    if(state.entryDraft && name === String(state.entryDraft.name || "").trim()
      && num(it.price) === num(state.entryDraft.price)
      && num(it.qty) === num(state.entryDraft.qty)) return false;
    return true;
  });
  setInvoiceLineItems(committed);
  clearInvEntryFields();
  if(state.entryDraft){
    const d = state.entryDraft;
    if(document.getElementById("invEntryName")) document.getElementById("invEntryName").value = d.name || "";
    if(document.getElementById("invEntryCode")) document.getElementById("invEntryCode").value = d.code || "";
    if(document.getElementById("invEntryQty")) document.getElementById("invEntryQty").value = d.qty ?? 1;
    if(document.getElementById("invEntryPrice")) document.getElementById("invEntryPrice").value = d.price ?? 0;
    if(document.getElementById("invEntryDisc")) document.getElementById("invEntryDisc").value = d.disc ?? 0;
    if(document.getElementById("invEntryVat")) document.getElementById("invEntryVat").value = d.vat ?? (shop.vatRate ?? 5);
    updateInvEntryPreview();
  }
  calcInvoice();
  updateInvoiceWipHint(true);
  return true;
}

function saveInvoiceWip(){
  if(_editingExistingInvoice) return;
  try{
    const state = collectInvoiceFormState();
    const hasHeader = state.invCustomer || state.invManual || state.invComputer || state.invVehicle || state.invNotes || state.invSimpleTotal;
    const hasItems = (state.lineItems || []).length > 0;
    const draft = state.entryDraft || {};
    const hasDraft = String(draft.name || "").trim() || num(draft.price) > 0;
    if(!hasHeader && !hasItems && !hasDraft) return;
    localStorage.setItem(INVOICE_WIP_KEY, JSON.stringify(state));
    updateInvoiceWipHint(true);
  }catch(_){}
}

function queueInvoiceWipSave(){
  clearTimeout(_invoiceWipTimer);
  _invoiceWipTimer = setTimeout(saveInvoiceWip, 350);
}

function loadInvoiceWip(){
  try{
    const raw = localStorage.getItem(INVOICE_WIP_KEY);
    if(!raw) return null;
    return JSON.parse(raw);
  }catch(_){
    return null;
  }
}

function clearInvoiceWip(){
  try{ localStorage.removeItem(INVOICE_WIP_KEY); }catch(_){}
  updateInvoiceWipHint(false);
}

function updateInvoiceWipHint(on){
  const el = document.getElementById("invWipHint");
  if(el) el.style.display = on ? "" : "none";
}

function wireInvoiceWipFields(){
  invoiceWipFieldIds().forEach(id=>{
    const el = document.getElementById(id);
    if(!el || el._wipWired) return;
    el._wipWired = true;
    if(id === "invCustomer") return;
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, ()=>{
      queueInvoiceWipSave();
    });
  });
}

function openNewInvoice(){
  _editingExistingInvoice = false;
  const wip = loadInvoiceWip();
  if(wip && applyInvoiceFormState(wip)){
    toast("Continuing previous invoice entry");
  }else{
    resetInvoice();
  }
  applyInvoiceEntryMode();
}

function startFreshInvoice(){
  if(!confirm("Clear this invoice and start fresh? Unsaved entry on this PC will be removed.")) return;
  clearInvoiceWip();
  _editingExistingInvoice = false;
  resetInvoice();
  applyInvoiceEntryMode();
}

function readItems(){
  if(getInvoiceEntryMode() === "simple"){
    const total = num(document.getElementById("invSimpleTotal")?.value);
    if(total <= 0) return [];
    const vat = num(shop.vatRate) || 5;
    const net = total / (1 + vat / 100);
    const vatAmt = total - net;
    return [{ name:"Invoice Total", code:"", qty:1, price:net, disc:0, vat, net, vatAmt, line:total }];
  }
  return _invoiceLineItems.map(it=> normalizeInvLineItem(it)).filter(x=> x.name);
}

function calcInvoice(){
  if(getInvoiceEntryMode() === "simple"){
    const total = num(document.getElementById("invSimpleTotal")?.value);
    const vatRate = num(shop.vatRate) || 5;
    const net = total > 0 ? total / (1 + vatRate / 100) : 0;
    const vatAmt = total - net;
    if(invSub) invSub.textContent = money(net);
    if(invDisc) invDisc.textContent = money(0);
    if(invVat) invVat.textContent = money(vatAmt);
    if(invGrand) invGrand.textContent = money(total);
    const simpleGrand = document.getElementById("invSimpleGrand");
    if(simpleGrand) simpleGrand.textContent = money(total);
    updateCreditCards(total);
    return { sub: net, disc: 0, vat: vatAmt, grand: total, items: readItems() };
  }
  const items = readItems();
  const sub = items.reduce((s,i)=> s + i.qty * i.price, 0);
  const disc = items.reduce((s,i)=> s + i.disc, 0);
  const vat = items.reduce((s,i)=> s + i.vatAmt, 0);
  const grand = items.reduce((s,i)=> s + i.line, 0);
  invSub.textContent = money(sub);
  invDisc.textContent = money(disc);
  invVat.textContent = money(vat);
  invGrand.textContent = money(grand);
  updateCreditCards(grand);
  return { sub, disc, vat, grand, items };
}

function updateCreditCards(grand){
  const name = invCustomer?.value;
  const c = customers.find(x=> x.name === name);
  const limit = num(c?.creditLimit);
  const due = name ? customerOutstanding(name) : 0;
  // Editing existing invoice: outstanding already includes old total — don't double-count
  const existing = invId?.value ? invoices.find(x=> x.id === invId.value) : null;
  const oldTotal = existing && existing.status !== "Draft" ? num(existing.total) : 0;
  const dnLinked = linkedDebitTotalForInvoice(invNo?.value, name);
  const after = due - oldTotal + num(grand) + dnLinked;
  if(invLim) invLim.textContent = c ? money(limit) : "—";
  if(invDueNow) invDueNow.textContent = name ? money(due) : "—";
  if(invNowTot) invNowTot.textContent = money(roundMoney(num(grand) + dnLinked));
  if(invAfter){
    invAfter.textContent = name ? money(after) : "—";
    invAfter.style.color = (limit > 0 && after > limit) ? "#d92d20" : "#079455";
  }
}

function filterVehiclesForInvoice(){
  const name = invCustomer?.value || "";
  const c = customers.find(x=> x.name === name);
  if(invTerms) invTerms.value = c?.paymentTerms || (num(c?.creditDays)||shop.creditDays||30) + " Days Credit";
  const days = num(c?.creditDays) || num(shop.creditDays) || 30;
  if(invDate?.value && !invId?.value){
    const d = new Date(invDate.value + "T00:00:00");
    d.setDate(d.getDate() + days);
    invDue.value = d.toISOString().slice(0,10);
  }
  const list = document.getElementById("invVehicleList");
  if(list){
    const rows = vehicles.filter(v=> !name || v.customer === name);
    list.innerHTML = rows.map(v=>{
      const label = [v.plate, v.make, v.model].filter(Boolean).join(" · ");
      return `<option value="${esc(v.plate || "")}">${esc(label)}</option>`;
    }).join("");
  }
  if(document.getElementById("invGrand") || document.getElementById("invSimpleTotal")) calcInvoice();
}

function renderVehicles(){
  const tbody = document.getElementById("vehicleRows");
  if(!tbody) return;
  const q = (document.getElementById("vehicleSearch")?.value || "").toLowerCase();
  const rows = vehicles.filter(v=>{
    const blob = `${v.plate} ${v.customer} ${v.make} ${v.model} ${v.vin} ${v.engine}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(a.plate||"").localeCompare(String(b.plate||"")));
  tbody.innerHTML = rows.length ? rows.map(v=> `<tr>
    <td>${esc(v.plate)}</td><td>${esc(v.customer)}</td><td>${esc(v.make)}</td><td>${esc(v.model)}</td>
    <td>${esc(v.vin)}</td><td>${esc(v.engine)}</td>
    <td>
      <button class="btn small" type="button" data-edit-v="${v.id}">Open</button>
      <button class="btn small danger" type="button" data-del-v="${v.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">No vehicles — add one</td></tr>`;
  tbody.querySelectorAll("[data-edit-v]").forEach(b=> b.onclick = ()=> editVehicle(b.dataset.editV));
  tbody.querySelectorAll("[data-del-v]").forEach(b=> b.onclick = ()=> deleteVehicle(b.dataset.delV));
}

function resetVehicle(){
  vId.value = "";
  vPlate.value = vMake.value = vModel.value = vVin.value = vEngine.value = "";
  if(vNotes) vNotes.value = "";
  customerOptions(vCustomer, "");
}

function editVehicle(id){
  const v = vehicles.find(x=> x.id === id);
  if(!v) return;
  vId.value = v.id;
  vPlate.value = v.plate || "";
  customerOptions(vCustomer, v.customer || "");
  vMake.value = v.make || "";
  vModel.value = v.model || "";
  vVin.value = v.vin || "";
  vEngine.value = v.engine || "";
  if(vNotes) vNotes.value = v.notes || "";
  openFormModal("vehicleModal");
}

async function saveVehicle(){
  if(!requireModule("vehicles")) return;
  const plate = (vPlate.value || "").trim();
  if(!plate) return toast("Plate number required");
  const customer = (vCustomer.value || "").trim();
  const dup = vehicles.find(x=>
    x.id !== vId.value
    && String(x.plate||"").trim().toLowerCase() === plate.toLowerCase()
    && String(x.customer||"").trim().toLowerCase() === customer.toLowerCase()
  );
  if(dup && !confirm(`Plate '${dup.plate}' already exists for ${dup.customer || "—"}. Continue anyway?`)) return;
  const data = {
    plate, customer, make: (vMake.value||"").trim(), model: (vModel.value||"").trim(),
    vin: (vVin.value||"").trim(), engine: (vEngine.value||"").trim(),
    notes: (vNotes?.value||"").trim(),
    updatedAt: Date.now(), updatedBy: who()
  };
  const invoiceOpen = document.getElementById("invoiceModal")?.classList.contains("open");
  try{
    let write;
    if(vId.value) write = updateDoc(doc(db, "vehicles", vId.value), data);
    else { data.createdAt = Date.now(); data.createdBy = who(); write = addDoc(col("vehicles"), data); }
    commitWrite(
      Promise.resolve(write).then(()=>{
        closeModal("vehicleModal");
        if(invoiceOpen){
          const invVehicle = document.getElementById("invVehicle");
          if(invVehicle) invVehicle.value = plate;
          filterVehiclesForInvoice();
          queueInvoiceWipSave();
        }
        return logActivity({ action:"edit", staffName: who(), customer, summary: "Vehicle saved " + plate });
      }),
      { okMsg: "Vehicle saved" }
    );
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function deleteVehicle(id){
  if(!requireModule("vehicles")) return;
  const v = vehicles.find(x=> x.id === id);
  if(!v) return;
  if(!confirm(`Delete vehicle ${v.plate || id}?`)) return;
  try{
    commitWrite(deleteDoc(doc(db, "vehicles", id)), { okMsg: "Vehicle deleted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

/* ——— Product / Service catalog ——— */
function shopDefaultVat(){ return num(shop.vatRate) || 5; }

function renderProducts(){
  const tbody = document.getElementById("productRows");
  if(!tbody) return;
  const q = (document.getElementById("productSearch")?.value || "").toLowerCase();
  const rows = products.filter(p=>{
    const blob = `${p.name} ${p.code} ${p.category}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
  tbody.innerHTML = rows.length ? rows.map(p=> `<tr>
    <td><input type="checkbox" class="catalog-check" data-kind="product" value="${esc(p.id)}"></td>
    <td>${esc(p.name)}</td><td>${esc(p.code)}</td><td>${money(p.price)}</td><td>${esc(p.vat ?? "")}%</td><td>${esc(p.category)}</td>
    <td>
      <button class="btn small" type="button" data-edit-p="${p.id}">Open</button>
      <button class="btn small danger" type="button" data-del-p="${p.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">No products — add one</td></tr>`;
  const selAll = document.getElementById("productSelectAll");
  if(selAll) selAll.checked = false;
  tbody.querySelectorAll("[data-edit-p]").forEach(b=> b.onclick = ()=> editProduct(b.dataset.editP));
  tbody.querySelectorAll("[data-del-p]").forEach(b=> b.onclick = ()=> deleteProduct(b.dataset.delP));
}

function resetProduct(){
  pId.value = "";
  pName.value = pCode.value = pCategory.value = "";
  if(pNotes) pNotes.value = "";
  pPrice.value = 0;
  pVat.value = shopDefaultVat();
}

function editProduct(id){
  const p = products.find(x=> x.id === id);
  if(!p) return;
  pId.value = p.id;
  pName.value = p.name || "";
  pCode.value = p.code || "";
  pPrice.value = p.price ?? 0;
  pVat.value = p.vat ?? shopDefaultVat();
  pCategory.value = p.category || "";
  if(pNotes) pNotes.value = p.notes || "";
  openFormModal("productModal");
}

async function saveProduct(){
  if(!requireModule("product-catalog")) return;
  const name = (pName.value || "").trim();
  if(!name) return toast("Product name required");
  const code = (pCode.value || "").trim();
  if(!pId.value && code){
    const dup = products.find(x=> String(x.code||"").trim().toLowerCase() === code.toLowerCase());
    if(dup && !confirm(`Part number '${dup.code}' already exists (${dup.name}). Continue anyway?`)) return;
  }
  const data = {
    name, code, price: num(pPrice.value), vat: num(pVat.value),
    category: (pCategory.value||"").trim(), notes: (pNotes?.value||"").trim(),
    updatedAt: Date.now(), updatedBy: who()
  };
  try{
    let write;
    if(pId.value) write = updateDoc(doc(db, "productCatalog", pId.value), data);
    else { data.createdAt = Date.now(); data.createdBy = who(); write = addDoc(col("productCatalog"), data); }
    commitWrite(
      Promise.resolve(write).then(()=>{
        closeModal("productModal");
        return logActivity({ action:"edit", staffName: who(), summary: "Product saved " + name });
      }),
      { okMsg: "Product saved" }
    );
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function deleteProduct(id){
  if(!requireModule("product-catalog")) return;
  const p = products.find(x=> x.id === id);
  if(!p) return;
  if(!confirm(`Delete product ${p.name || id}?`)) return;
  try{
    commitWrite(deleteDoc(doc(db, "productCatalog", id)), { okMsg: "Product deleted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function renderServices(){
  const tbody = document.getElementById("serviceRows");
  if(!tbody) return;
  const q = (document.getElementById("serviceSearch")?.value || "").toLowerCase();
  const rows = services.filter(s=>{
    const blob = `${s.name} ${s.category}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
  tbody.innerHTML = rows.length ? rows.map(s=> `<tr>
    <td><input type="checkbox" class="catalog-check" data-kind="service" value="${esc(s.id)}"></td>
    <td>${esc(s.name)}</td><td>${money(s.price)}</td><td>${esc(s.vat ?? "")}%</td><td>${esc(s.category)}</td>
    <td>
      <button class="btn small" type="button" data-edit-s="${s.id}">Open</button>
      <button class="btn small danger" type="button" data-del-s="${s.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="6" class="empty">No services — add one</td></tr>`;
  const selAll = document.getElementById("serviceSelectAll");
  if(selAll) selAll.checked = false;
  tbody.querySelectorAll("[data-edit-s]").forEach(b=> b.onclick = ()=> editService(b.dataset.editS));
  tbody.querySelectorAll("[data-del-s]").forEach(b=> b.onclick = ()=> deleteService(b.dataset.delS));
}

function resetService(){
  sId.value = "";
  sName.value = sCategory.value = "";
  if(sNotes) sNotes.value = "";
  sPrice.value = 0;
  sVat.value = shopDefaultVat();
}

function editService(id){
  const s = services.find(x=> x.id === id);
  if(!s) return;
  sId.value = s.id;
  sName.value = s.name || "";
  sPrice.value = s.price ?? 0;
  sVat.value = s.vat ?? shopDefaultVat();
  sCategory.value = s.category || "";
  if(sNotes) sNotes.value = s.notes || "";
  openFormModal("serviceModal");
}

async function saveService(){
  if(!requireModule("service-catalog")) return;
  const name = (sName.value || "").trim();
  if(!name) return toast("Service description required");
  if(!sId.value){
    const dup = services.find(x=> String(x.name||"").trim().toLowerCase() === name.toLowerCase());
    if(dup && !confirm(`Service '${dup.name}' already exists. Continue anyway?`)) return;
  }
  const data = {
    name, price: num(sPrice.value), vat: num(sVat.value),
    category: (sCategory.value||"").trim(), notes: (sNotes?.value||"").trim(),
    updatedAt: Date.now(), updatedBy: who()
  };
  try{
    let write;
    if(sId.value) write = updateDoc(doc(db, "serviceCatalog", sId.value), data);
    else { data.createdAt = Date.now(); data.createdBy = who(); write = addDoc(col("serviceCatalog"), data); }
    commitWrite(
      Promise.resolve(write).then(()=>{
        closeModal("serviceModal");
        return logActivity({ action:"edit", staffName: who(), summary: "Service saved " + name });
      }),
      { okMsg: "Service saved" }
    );
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function deleteService(id){
  if(!requireModule("service-catalog")) return;
  const s = services.find(x=> x.id === id);
  if(!s) return;
  if(!confirm(`Delete service ${s.name || id}?`)) return;
  try{
    commitWrite(deleteDoc(doc(db, "serviceCatalog", id)), { okMsg: "Service deleted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

/** Firestore batch delete (max 450 per commit). */
async function deleteCatalogDocs(collectionName, ids){
  const list = [...new Set((ids || []).filter(Boolean))];
  if(!list.length) return 0;
  const CHUNK = 450;
  for(let i = 0; i < list.length; i += CHUNK){
    const slice = list.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    slice.forEach(id=> batch.delete(doc(db, collectionName, id)));
    await batch.commit();
  }
  return list.length;
}

async function deleteSelectedServices(){
  if(!requireModule("service-catalog")) return;
  const ids = [...document.querySelectorAll('#serviceRows input.catalog-check:checked')].map(el=> el.value);
  if(!ids.length) return toast("Select at least one service");
  if(!confirm(`Delete ${ids.length} selected service(s)?\nThis cannot be undone.`)) return;
  try{
    toast(`Deleting ${ids.length}…`);
    const n = await deleteCatalogDocs("serviceCatalog", ids);
    await logActivity({ action:"delete", staffName: who(), module:"Service Catalog", summary: `Bulk deleted ${n} services` });
    toast(`Deleted ${n} service(s)`);
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function deleteAllServices(){
  if(!requireModule("service-catalog")) return;
  const n = services.length;
  if(!n) return toast("Service catalog is empty");
  if(!confirm(`Delete ALL ${n} services from catalog?\nThis cannot be undone.`)) return;
  if(!confirm(`Final confirm: permanently delete all ${n} services?`)) return;
  try{
    toast(`Deleting ${n}…`);
    const count = await deleteCatalogDocs("serviceCatalog", services.map(s=> s.id));
    await logActivity({ action:"delete", staffName: who(), module:"Service Catalog", summary: `Cleared all ${count} services` });
    toast(`Deleted all ${count} services`);
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function deleteSelectedProducts(){
  if(!requireModule("product-catalog")) return;
  const ids = [...document.querySelectorAll('#productRows input.catalog-check:checked')].map(el=> el.value);
  if(!ids.length) return toast("Select at least one product");
  if(!confirm(`Delete ${ids.length} selected product(s)?\nThis cannot be undone.`)) return;
  try{
    toast(`Deleting ${ids.length}…`);
    const n = await deleteCatalogDocs("productCatalog", ids);
    await logActivity({ action:"delete", staffName: who(), module:"Product Catalog", summary: `Bulk deleted ${n} products` });
    toast(`Deleted ${n} product(s)`);
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function deleteAllProducts(){
  if(!requireModule("product-catalog")) return;
  const n = products.length;
  if(!n) return toast("Product catalog is empty");
  if(!confirm(`Delete ALL ${n} products from catalog?\nThis cannot be undone.`)) return;
  if(!confirm(`Final confirm: permanently delete all ${n} products?`)) return;
  try{
    toast(`Deleting ${n}…`);
    const count = await deleteCatalogDocs("productCatalog", products.map(p=> p.id));
    await logActivity({ action:"delete", staffName: who(), module:"Product Catalog", summary: `Cleared all ${count} products` });
    toast(`Deleted all ${count} products`);
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function catalogMatches(q){
  const ql = String(q || "").trim().toLowerCase();
  const out = [];
  products.forEach(p=>{
    const blob = `${p.name} ${p.code} ${p.category}`.toLowerCase();
    if(!ql || blob.includes(ql)) out.push({ kind:"product", id:p.id, name:p.name||"", code:p.code||"", price:num(p.price), vat:num(p.vat ?? shopDefaultVat()), category:p.category||"" });
  });
  services.forEach(s=>{
    const blob = `${s.name} ${s.category}`.toLowerCase();
    if(!ql || blob.includes(ql)) out.push({ kind:"service", id:s.id, name:s.name||"", code:"", price:num(s.price), vat:num(s.vat ?? shopDefaultVat()), category:s.category||"" });
  });
  out.sort((a,b)=> String(a.name).localeCompare(String(b.name)));
  return out;
}

function hideCatalogSuggest(){
  const list = document.getElementById("invCatalogSuggest");
  if(list){
    list.hidden = true;
    list.innerHTML = "";
  }
}

function positionCatalogSuggest(input, list){
  if(!input || !list) return;
  if(list.parentElement !== document.body) document.body.appendChild(list);
  const r = input.getBoundingClientRect();
  const gap = 4;
  const width = Math.max(r.width, Math.min(360, window.innerWidth - 16));
  const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
  const spaceBelow = window.innerHeight - r.bottom - 8;
  const spaceAbove = r.top - 8;
  const preferBelow = spaceBelow >= 140 || spaceBelow >= spaceAbove;
  const height = Math.min(240, Math.max(120, preferBelow ? spaceBelow : spaceAbove));
  const top = preferBelow
    ? Math.round(r.bottom + gap)
    : Math.round(r.top - gap - height);
  list.style.position = "fixed";
  list.style.left = left + "px";
  list.style.top = top + "px";
  list.style.width = width + "px";
  list.style.right = "auto";
  list.style.maxHeight = height + "px";
  list.style.zIndex = "7000";
  list.hidden = false;
}

function renderCatalogSuggest(q){
  const input = document.getElementById("invEntryName");
  const list = document.getElementById("invCatalogSuggest");
  if(!input || !list) return;
  const rows = catalogMatches(q).slice(0, 40);
  if(!rows.length){
    list.innerHTML = `<li class="cust-combo-empty">${(products.length || services.length) ? "No match — free type OK" : "Catalog empty — type freely or add Product/Service"}</li>`;
  }else{
    list.innerHTML = rows.map(r=>{
      const tag = r.kind === "product" ? "Product" : "Service";
      const meta = [r.code, money(r.price), `${r.vat}% VAT`].filter(Boolean).join(" · ");
      return `<li role="option" data-cat-kind="${r.kind}" data-cat-id="${esc(r.id)}" title="${esc(r.name)}">
        ${esc(r.name)}<span class="cat-tag">[${tag}]</span>
        <span class="cat-meta">${esc(meta)}</span>
      </li>`;
    }).join("");
  }
  positionCatalogSuggest(input, list);
}

function applyCatalogPick(kind, id){
  const row = kind === "product"
    ? products.find(x=> x.id === id)
    : services.find(x=> x.id === id);
  if(!row) return;
  const nameEl = document.getElementById("invEntryName");
  const codeEl = document.getElementById("invEntryCode");
  const priceEl = document.getElementById("invEntryPrice");
  const vatEl = document.getElementById("invEntryVat");
  if(nameEl) nameEl.value = row.name || "";
  if(codeEl) codeEl.value = kind === "product" ? (row.code || "") : "";
  if(priceEl) priceEl.value = row.price ?? 0;
  if(vatEl) vatEl.value = row.vat ?? shopDefaultVat();
  hideCatalogSuggest();
  updateInvEntryPreview();
  queueInvoiceWipSave();
  document.getElementById("invEntryQty")?.focus();
}

async function saveEntryToCatalog(){
  const name = (document.getElementById("invEntryName")?.value || "").trim();
  if(!name) return toast("Type an item name first");
  const code = (document.getElementById("invEntryCode")?.value || "").trim();
  const price = num(document.getElementById("invEntryPrice")?.value);
  const vat = num(document.getElementById("invEntryVat")?.value ?? shopDefaultVat());
  const ans = (prompt("Save to catalog as Product or Service?\nType P = Product, S = Service", "P") || "").trim().toLowerCase();
  if(!ans) return;
  const asProduct = ans.startsWith("p");
  const asService = ans.startsWith("s");
  if(!asProduct && !asService) return toast("Type P or S");
  if(asProduct){
    if(!requireModule("product-catalog")) return;
    if(code){
      const dup = products.find(x=> String(x.code||"").trim().toLowerCase() === code.toLowerCase());
      if(dup && !confirm(`Part number '${dup.code}' already exists. Continue anyway?`)) return;
    }
    const data = { name, code, price, vat, category: "", notes: "", createdAt: Date.now(), createdBy: who(), updatedAt: Date.now(), updatedBy: who() };
    try{
      commitWrite(addDoc(col("productCatalog"), data), { okMsg: "Saved to Product Catalog" });
    }catch(e){ toast(friendlyFirestoreError(e)); }
  }else{
    if(!requireModule("service-catalog")) return;
    const dup = services.find(x=> String(x.name||"").trim().toLowerCase() === name.toLowerCase());
    if(dup && !confirm(`Service '${dup.name}' already exists. Continue anyway?`)) return;
    const data = { name, price, vat, category: "", notes: "", createdAt: Date.now(), createdBy: who(), updatedAt: Date.now(), updatedBy: who() };
    try{
      commitWrite(addDoc(col("serviceCatalog"), data), { okMsg: "Saved to Service Catalog" });
    }catch(e){ toast(friendlyFirestoreError(e)); }
  }
}

// CSV import for Product / Service catalogs
// Columns: Name/Description, Code (products only), Price, VAT%, Category
function parseCsvText(text){
  const raw = String(text || "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], cell = "", i = 0, inQ = false;
  while(i < raw.length){
    const ch = raw[i];
    if(inQ){
      if(ch === '"'){
        if(raw[i + 1] === '"'){ cell += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      cell += ch; i++; continue;
    }
    if(ch === '"'){ inQ = true; i++; continue; }
    if(ch === ","){ row.push(cell); cell = ""; i++; continue; }
    if(ch === "\n"){ row.push(cell); rows.push(row); row = []; cell = ""; i++; continue; }
    if(ch === "\r"){ i++; continue; }
    cell += ch; i++;
  }
  if(cell.length || row.length){ row.push(cell); rows.push(row); }
  return rows.filter(r=> r.some(c=> String(c || "").trim()));
}

function csvHeaderMap(headerRow){
  const map = {};
  (headerRow || []).forEach((h, idx)=>{
    const k = String(h || "").trim().toLowerCase();
    if(!k) return;
    if(/^(name|description|desc|item|product|service)$/.test(k)) map.name = idx;
    else if(/^(code|part|part\s*no|part\s*number|sku|pn)$/.test(k)) map.code = idx;
    else if(/^(price|default\s*price|labour|amount)$/.test(k)) map.price = idx;
    else if(/^(vat|vat\s*%|tax)$/.test(k)) map.vat = idx;
    else if(/^(category|cat|group)$/.test(k)) map.category = idx;
  });
  return map;
}

async function importCatalogCsv(kind, file){
  if(kind === "product"){
    if(!requireModule("product-catalog")) return;
  }else if(!requireModule("service-catalog")) return;
  try{
    const text = await file.text();
    const rows = parseCsvText(text);
    if(rows.length < 2) return toast("CSV has no data rows");
    const map = csvHeaderMap(rows[0]);
    if(map.name == null) map.name = 0;
    if(kind === "product" && map.code == null && rows[0].length > 1) map.code = 1;
    if(map.price == null) map.price = kind === "product" ? 2 : 1;
    if(map.vat == null) map.vat = kind === "product" ? 3 : 2;
    if(map.category == null) map.category = kind === "product" ? 4 : 3;
    const dataRows = rows.slice(1);
    if(!confirm(`Import ${dataRows.length} ${kind === "product" ? "product" : "service"} row(s) from CSV?`)) return;
    let ok = 0, skip = 0;
    for(const r of dataRows){
      const name = String(r[map.name] ?? "").trim();
      if(!name){ skip++; continue; }
      const code = map.code != null ? String(r[map.code] ?? "").trim() : "";
      const price = num(r[map.price]);
      const vat = map.vat != null && String(r[map.vat] ?? "").trim() !== "" ? num(r[map.vat]) : shopDefaultVat();
      const category = map.category != null ? String(r[map.category] ?? "").trim() : "";
      const payload = {
        name, price, vat, category, notes: "",
        createdAt: Date.now(), createdBy: who(), updatedAt: Date.now(), updatedBy: who()
      };
      if(kind === "product"){
        payload.code = code;
        await addDoc(col("productCatalog"), payload);
      }else{
        await addDoc(col("serviceCatalog"), payload);
      }
      ok++;
    }
    toast(`Imported ${ok}${skip ? ` · skipped ${skip}` : ""}`);
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function wireCatalogSuggest(){
  if(window._s4CatalogWired) return;
  window._s4CatalogWired = true;
  const input = document.getElementById("invEntryName");
  const list = document.getElementById("invCatalogSuggest");
  if(!input || !list) return;
  if(list.parentElement !== document.body) document.body.appendChild(list);

  input.addEventListener("focus", ()=> renderCatalogSuggest(input.value));
  input.addEventListener("input", ()=> renderCatalogSuggest(input.value));
  input.addEventListener("keydown", e=>{
    if(e.key === "Escape"){
      hideCatalogSuggest();
      return;
    }
    if(e.key === "ArrowDown"){
      e.preventDefault();
      renderCatalogSuggest(input.value);
      const first = list.querySelector("li[data-cat-id]");
      if(first) first.focus?.();
      return;
    }
    if(e.key === "Enter"){
      const first = !list.hidden && list.querySelector("li[data-cat-id]");
      if(first){
        e.preventDefault();
        e.stopImmediatePropagation();
        applyCatalogPick(first.getAttribute("data-cat-kind"), first.getAttribute("data-cat-id"));
      }
    }
  }, true);

  list.addEventListener("mousedown", e=>{
    const li = e.target.closest("li[data-cat-id]");
    if(!li) return;
    e.preventDefault();
    applyCatalogPick(li.getAttribute("data-cat-kind"), li.getAttribute("data-cat-id"));
  });

  document.addEventListener("click", e=>{
    if(e.target.closest("#invEntryName") || e.target.closest("#invCatalogSuggest")) return;
    hideCatalogSuggest();
  });
  window.addEventListener("resize", hideCatalogSuggest);
  document.getElementById("invoiceModal")?.addEventListener("scroll", hideCatalogSuggest, true);
}

function resetInvoice(){
  _formInvoiceMode = null;
  invId.value = "";
  invNo.value = nextNo(shop.invPrefix || "INV-", invoices, "invNo");
  const invComputer = document.getElementById("invComputer");
  if(invComputer) invComputer.value = "";
  if(invManual) invManual.value = "";
  invDate.value = today();
  const days = num(shop.creditDays) || 30;
  const d = new Date(); d.setDate(d.getDate()+days);
  invDue.value = d.toISOString().slice(0,10);
  customerOptions(invCustomer, "");
  filterVehiclesForInvoice();
  invDriver.value = invReceived.value = invLpo.value = invNotes.value = "";
  if(invDn) invDn.value = "";
  if(invRef) invRef.value = "";
  if(invTerms) invTerms.value = (shop.creditDays || 30) + " Days Credit";
  if(document.getElementById("invSimpleTotal")) document.getElementById("invSimpleTotal").value = "";
  setInvoiceLineItems([]);
  clearInvEntryFields();
  applyInvoiceEntryMode();
  updateInvoiceWipHint(!!loadInvoiceWip());
  const delBtn = document.getElementById("deleteInvoiceBtn");
  if(delBtn) delBtn.hidden = true;
}

function editInvoice(id){
  _editingExistingInvoice = true;
  clearInvoiceWip();
  const i = invoices.find(x=> x.id === id);
  if(!i) return;
  invId.value = i.id; invNo.value = i.invNo; invDate.value = i.invDate; invDue.value = i.dueDate;
  const invComputer = document.getElementById("invComputer");
  if(invComputer) invComputer.value = i.computerNo || "";
  if(invManual) invManual.value = i.manualNo || "";
  customerOptions(invCustomer, i.customer); filterVehiclesForInvoice(); invVehicle.value = i.vehicle||"";
  invDriver.value = i.driver||""; invReceived.value = i.receivedBy||""; invLpo.value = i.lpo||""; invNotes.value = i.notes||"";
  if(invDn) invDn.value = i.deliveryNote||"";
  if(invRef) invRef.value = i.reference||"";
  if(invTerms) invTerms.value = i.paymentTerms||"";
  const simpleTotalEl = document.getElementById("invSimpleTotal");
  if(getInvoiceEntryMode() === "simple" || (i.items||[]).length === 1 && (i.items[0].name||"").toLowerCase().includes("total")){
    // Stored total may already include linked debit notes — show base only so re-save does not double-add
    const dnPart = linkedDebitTotalForInvoice(i.invNo, i.customer);
    if(simpleTotalEl) simpleTotalEl.value = roundMoney(Math.max(0, num(i.total) - dnPart));
  }else if(simpleTotalEl) simpleTotalEl.value = "";
  setInvoiceLineItems(i.items || []);
  clearInvEntryFields();
  applyInvoiceEntryMode();
  updateInvoiceWipHint(false);
  const delBtn = document.getElementById("deleteInvoiceBtn");
  if(delBtn) delBtn.hidden = false;
  openFormModal("invoiceModal");
}

async function saveInvoice(status){
  if(!requireModule("invoices")) return;
  if(_invoiceSaving) return toast("Save already in progress…");
  flushInvDraftLine();
  const calc = calcInvoice();
  const customer = invCustomer.value;
  if(!customer) return toast("Select customer");
  if(!calc.items.length) return toast(getInvoiceEntryMode() === "simple" ? "Enter total amount" : "Add at least one product line");
  const c = customers.find(x=> x.name === customer);
  if(c && c.status === "Blocked") return toast("Customer is blocked");
  if(c && c.status === "Hold" && status === "Posted") return toast("Customer is on hold");
  const existing = invId.value ? invoices.find(x=>x.id===invId.value) : null;
  const existingPaid = num(existing?.paid);
  const oldTotal = existing && existing.status !== "Draft" ? num(existing.total) : 0;
  if(!invId.value){
    const hadNo = !!String(invNo.value || "").trim();
    const serial = uniqueSerial(invoices, "invNo", invNo.value, shop.invPrefix || "INV-");
    if(serial.bumped){
      if(invNo) invNo.value = serial.value;
      if(hadNo) toast("Invoice No. already used — posting as " + serial.value);
    }
  }
  // Preserve linked debit-note charges when re-saving line items
  const dnLinked = linkedDebitTotalForInvoice(invNo.value, customer);
  const grandWithDn = roundMoney(calc.grand + dnLinked);
  const existingCredited = num(existing?.credited);
  const floorPaidCred = roundMoney(existingPaid + existingCredited);
  if(existing && status !== "Draft" && grandWithDn + 0.009 < floorPaidCred){
    return toast(
      `Cannot save — total ${money(grandWithDn)} is below paid+credited ${money(floorPaidCred)}. ` +
      `Reverse receipts / credit notes first, or raise the invoice total.`
    );
  }
  const after = customerOutstanding(customer) - oldTotal + grandWithDn;
  if(status === "Posted" && c && num(c.creditLimit) > 0 && after > num(c.creditLimit)){
    if(!confirm("After this invoice, outstanding exceeds credit limit. Post anyway?")) return;
  }
  const manualNo = (invManual?.value||"").trim();
  const computerNo = (document.getElementById("invComputer")?.value || "").trim();
  if(manualNo){
    const dupM = invoices.find(i=> i.id !== invId.value && String(i.manualNo||"").trim().toLowerCase() === manualNo.toLowerCase());
    if(dupM && !confirm(`This Manual Invoice No. is already used on invoice ${dupM.invNo} (${dupM.customer}, ${money(dupM.total)}). Continue anyway?`)) return;
  }
  if(computerNo){
    const dupC = invoices.find(i=> i.id !== invId.value && String(i.computerNo||"").trim().toLowerCase() === computerNo.toLowerCase());
    if(dupC && !confirm(`This Computer Invoice No. is already used on invoice ${dupC.invNo} (${dupC.customer}, ${money(dupC.total)}). Continue anyway?`)) return;
  }
  const data = {
    invNo: invNo.value.trim(),
    computerNo,
    manualNo,
    invDate: invDate.value, dueDate: invDue.value,
    customer, vehicle: invVehicle.value, driver: invDriver.value.trim(),
    receivedBy: invReceived.value.trim(), lpo: invLpo.value.trim(), notes: invNotes.value.trim(),
    deliveryNote: (invDn?.value||"").trim(), reference: (invRef?.value||"").trim(), paymentTerms: (invTerms?.value||"").trim(),
    items: calc.items, subtotal: calc.sub, discount: calc.disc, vat: calc.vat, total: grandWithDn,
    paid: existingPaid,
    credited: existingCredited,
    status, updatedAt: Date.now(), updatedBy: who()
  };
  try{
    let write;
    _invoiceSaving = true;
    if(invId.value) write = updateDoc(doc(db,"invoices", invId.value), data);
    else {
      data.createdAt = Date.now(); data.createdBy = who(); data.paid = 0;
      write = addDoc(col("invoices"), data).then(ref=>{ invId.value = ref.id; return ref; });
    }
    commitWrite(
      Promise.resolve(write).then(()=>{
        clearInvoiceWip();
        _editingExistingInvoice = false;
        closeModal("invoiceModal");
        return logActivity({ action: status==="Draft"?"draft":"add", staffName: who(), module:"Invoice", record: data.invNo, customer, summary: (status==="Draft"?"Draft ":"Posted ") + data.invNo, newValue: money(data.total) });
      }),
      { okMsg: status === "Draft" ? "Draft saved" : "Invoice posted" }
    ).catch(()=>{}).finally(()=>{ _invoiceSaving = false; });
  }catch(e){
    _invoiceSaving = false;
    toast(friendlyFirestoreError(e));
  }
}

function renderReceipts(){
  const q = (document.getElementById("receiptSearch")?.value||"").toLowerCase();
  const rows = receipts.filter(r=>{
    if(receiptFilter === "Cheque") return String(r.method||"").includes("Cheque");
    if(receiptFilter && r.method !== receiptFilter) return false;
    return `${r.rvNo} ${r.customer} ${r.chequeNo} ${r.ref}`.toLowerCase().includes(q);
  }).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  document.getElementById("receiptRows").innerHTML = rows.length ? rows.map(r=>{
    const alloc = num(r.allocated);
    const un = Math.max(0, num(r.amount) - alloc);
    const st = r.status || "Posted";
    const canVoid = st !== "Voided" && st !== "Cancelled" && st !== "Bounced";
    const actions = [
      `<button class="btn small" type="button" data-receipt-pdf="${r.id}">PDF</button>`,
      canVoid ? `<button class="btn small danger" type="button" data-void-rv="${r.id}">Void</button>` : ""
    ].filter(Boolean).join(" ");
    return `<tr><td>${esc(r.rvNo)}</td><td>${esc(r.date)}</td><td>${esc(r.customer)}</td><td>${esc(r.method)}</td>
      <td>${esc(r.ref || r.chequeNo)}</td><td>${money(r.amount)}</td><td>${money(alloc)}</td>
      <td class="${un?"orange":""}">${money(un)}</td><td>${badge(st)}</td>
      <td>${actions || "—"}</td></tr>`;
  }).join("") : `<tr><td colspan="10" class="empty">No receipts</td></tr>`;
  document.querySelectorAll("[data-void-rv]").forEach(b=> b.onclick = ()=> voidReceipt(b.dataset.voidRv));
  document.querySelectorAll("[data-receipt-pdf]").forEach(b=> b.onclick = ()=> exportReceiptPdfById(b.dataset.receiptPdf));
}

function syncRvMethodUi({ setDefaultStatus = false } = {}){
  const rvMethod = document.getElementById("rvMethod");
  const rvStatus = document.getElementById("rvStatus");
  const m = rvMethod?.value || "Cash";
  const isCheque = m.includes("Cheque");
  const isPdc = m === "PDC Cheque";
  document.querySelectorAll(".cheque-only").forEach(el=>{ el.style.display = isCheque ? "" : "none"; });
  document.querySelectorAll(".pdc-only").forEach(el=>{ el.style.display = isPdc ? "" : "none"; });
  if(rvStatus){
    const cashOk = new Set(["Posted", "Cancelled"]);
    const chequeOk = new Set(["Pending", "Deposited", "Cleared", "Bounced", "Cancelled"]);
    [...rvStatus.options].forEach(opt=>{
      const allow = isCheque ? chequeOk.has(opt.value) : cashOk.has(opt.value);
      opt.hidden = !allow;
      opt.disabled = !allow;
    });
    if(setDefaultStatus){
      rvStatus.value = isCheque ? "Pending" : "Posted";
    }else if(rvStatus.selectedOptions[0]?.hidden || rvStatus.selectedOptions[0]?.disabled){
      rvStatus.value = isCheque ? "Pending" : "Posted";
    }
  }
}

function resetReceipt(){
  const rvNo = document.getElementById("rvNo");
  const rvDate = document.getElementById("rvDate");
  const rvAmount = document.getElementById("rvAmount");
  const rvRef = document.getElementById("rvRef");
  const rvChq = document.getElementById("rvChq");
  const rvBank = document.getElementById("rvBank");
  const rvCustomer = document.getElementById("rvCustomer");
  const rvMethod = document.getElementById("rvMethod");
  if(rvNo) rvNo.value = nextNo(shop.rvPrefix || "RV-", receipts, "rvNo");
  if(rvDate) rvDate.value = today();
  if(rvAmount) rvAmount.value = "";
  if(rvRef) rvRef.value = "";
  if(rvChq) rvChq.value = "";
  if(rvBank) rvBank.value = "";
  const rvPdcDate = document.getElementById("rvPdcDate");
  const rvDisc = document.getElementById("rvDisc");
  const rvStatus = document.getElementById("rvStatus");
  const rvChqDate = document.getElementById("rvChqDate");
  if(rvPdcDate) rvPdcDate.value = "";
  if(rvChqDate) rvChqDate.value = "";
  if(rvDisc) rvDisc.value = 0;
  if(rvMethod) rvMethod.value = "Cash";
  if(rvStatus) rvStatus.value = "Posted";
  if(rvCustomer) customerOptions(rvCustomer, "");
  syncRvMethodUi({ setDefaultStatus: true });
  const allocRows = document.getElementById("rvAllocRows");
  const allocHead = document.getElementById("rvAllocHead");
  if(allocRows) allocRows.innerHTML = `<tr><td colspan="6" class="empty">Select a customer to load invoices</td></tr>`;
  if(allocHead) allocHead.textContent = "Select customer first";
}

function fillRvAlloc(){
  const rvCustomer = document.getElementById("rvCustomer");
  const rvAmount = document.getElementById("rvAmount");
  const rvAllocHead = document.getElementById("rvAllocHead");
  const rvAllocRows = document.getElementById("rvAllocRows");
  if(!rvCustomer || !rvAllocRows) return;
  const name = rvCustomer.value;
  const amt = num(rvAmount?.value);
  if(!name){
    rvAllocHead.textContent = "Select customer first";
    rvAllocRows.innerHTML = `<tr><td colspan="6" class="empty">Select a customer to load invoices</td></tr>`;
    return;
  }
  const open = invoices
    .filter(i=> i.customer === name && i.status !== "Draft" && invBalance(i) > 0.009)
    .sort((a,b)=> String(a.dueDate||a.invDate).localeCompare(String(b.dueDate||b.invDate)));
  rvAllocHead.textContent = open.length
    ? `${open.length} open invoice(s) · Receipt ${money(amt)}`
    : `No open invoices · Receipt ${money(amt)}`;
  if(!open.length){
    rvAllocRows.innerHTML = `<tr><td colspan="6" class="empty">No open invoices for this customer — post invoice first, or leave unallocated</td></tr>`;
    return;
  }
  let left = amt;
  rvAllocRows.innerHTML = open.map(i=>{
    const bal = invBalance(i);
    let suggest = 0;
    if(left > 0.009){
      suggest = Math.min(left, bal);
      left -= suggest;
    }
    return `<tr data-inv-no="${esc(i.invNo)}">
      <td><b>${esc(i.invNo)}</b>${i.manualNo ? `<br><span class="inv-meta">Manual ${esc(i.manualNo)}</span>` : ""}${i.computerNo ? `<br><span class="inv-meta">Comp ${esc(i.computerNo)}</span>` : ""}</td>
      <td>${esc(i.invDate)}</td>
      <td>${esc(i.dueDate)}</td>
      <td>${money(bal)}</td>
      <td><input type="number" min="0" step="0.01" data-inv="${esc(i.id)}" data-max="${bal}" value="${suggest || 0}"></td>
      <td>${badge(invStatus(i))}</td>
    </tr>`;
  }).join("");
}

async function saveReceipt(){
  if(!requireModule("receipts")) return;
  if(_receiptSaving) return toast("Save already in progress…");
  const rvCustomer = document.getElementById("rvCustomer");
  const rvAmount = document.getElementById("rvAmount");
  const rvMethod = document.getElementById("rvMethod");
  const rvStatus = document.getElementById("rvStatus");
  const rvNo = document.getElementById("rvNo");
  const rvDate = document.getElementById("rvDate");
  const rvRef = document.getElementById("rvRef");
  const rvChq = document.getElementById("rvChq");
  const rvBank = document.getElementById("rvBank");
  const rvChqDate = document.getElementById("rvChqDate");
  const rvPdcDate = document.getElementById("rvPdcDate");
  const rvDisc = document.getElementById("rvDisc");
  const customer = rvCustomer.value;
  let amount = num(rvAmount.value);
  if(!customer) return toast("Select customer first");
  if(amount <= 0) return toast("Enter receipt amount");
  const rvHadNo = !!rvNo.value.trim();
  let rvNoTrim = rvNo.value.trim();
  const rvSerial = uniqueSerial(receipts, "rvNo", rvNoTrim, shop.rvPrefix || "RV-");
  if(rvSerial.bumped){
    rvNoTrim = rvSerial.value;
    if(rvNo) rvNo.value = rvNoTrim;
    if(rvHadNo) toast("Receipt No. already used — posting as " + rvNoTrim);
  }
  let allocs = [...document.querySelectorAll("#rvAllocRows input[data-inv]")].map(inp=>({
    invoiceId: inp.dataset.inv, amount: Math.min(num(inp.value), num(inp.dataset.max))
  })).filter(a=> a.amount > 0);
  let allocated = roundMoney(allocs.reduce((s,a)=> s + a.amount, 0));
  let discTotal = num(rvDisc?.value);
  // Amount = cash/cheque face only. Discount is a separate ledger credit + invoice.credited.
  // If user puts full bill in Amount AND Discount (Amount ≈ Allocate), ledger would show fake advance.
  if(discTotal > 0.009 && allocated > 0.009 && Math.abs(amount - allocated) <= 0.01){
    const netCash = roundMoney(amount - discTotal);
    if(netCash > 0.009){
      const ok = confirm(
        `Discount ${money(discTotal)} detected.\n\n` +
        `AMOUNT must be cash received only.\n` +
        `Fix now? Amount ${money(amount)} → ${money(netCash)}, and allocations will match cash.\n\n` +
        `OK = auto-fix (recommended)\nCancel = stop so you can edit`
      );
      if(!ok) return;
      amount = netCash;
      if(rvAmount) rvAmount.value = String(netCash);
      let left = netCash;
      allocs = allocs.map(a=>{
        const take = roundMoney(Math.min(a.amount, left));
        left = roundMoney(left - take);
        return { ...a, amount: take };
      }).filter(a=> a.amount > 0.009);
      allocated = roundMoney(allocs.reduce((s,a)=> s + a.amount, 0));
    }
  }
  if(allocated > amount + 0.01) return toast("Allocation exceeds receipt amount");
  // Guard: taking more cash than customer currently owes → advance (must confirm)
  const dueNow = roundMoney(customerOutstanding(customer));
  const dueSafe = Math.max(0, dueNow);
  if(amount > dueSafe + 0.01){
    const extra = roundMoney(amount - dueSafe);
    const okAdvance = confirm(
      `Receipt amount is MORE than this customer's outstanding.\n\n` +
      `Customer outstanding (due): ${money(dueSafe)}\n` +
      `Receipt amount: ${money(amount)}\n` +
      `Extra: ${money(extra)}\n\n` +
      `Are you sure?\n` +
      `• OK (Yes) = post anyway — extra will be CUSTOMER ADVANCE\n` +
      `• Cancel (No) = do not save — fix the amount first`
    );
    if(!okAdvance) return;
  }
  const method = rvMethod.value;
  const isCheque = method.includes("Cheque");
  if(isCheque && (rvChq?.value || "").trim() && !memberCan(member, "cheques")){
    return toast("Cheque module permission is required to post a cheque receipt.");
  }
  const status = isCheque ? (rvStatus?.value || "Pending") : (rvStatus?.value || "Posted");
  // Cash/bank: apply only when Posted. Cheque/PDC: apply only when Cleared.
  // Never apply Cancelled / Bounced / Pending / Deposited to invoice.paid
  const applyNow = isCheque ? (status === "Cleared") : (status === "Posted");
  if(applyNow && allocated < amount - 0.01){
    const left = roundMoney(amount - allocated);
    if(!confirm(`Unallocated ${money(left)} will stay as customer advance on the ledger (not on invoice paid). Continue?`)) return;
  }
  const data = {
    rvNo: rvNoTrim, date: rvDate.value, customer, method,
    amount, allocated: applyNow ? allocated : 0, unallocated: applyNow ? amount - allocated : amount,
    ref: rvRef.value.trim(),
    chequeNo: isCheque ? rvChq.value.trim() : "",
    bank: isCheque ? rvBank.value.trim() : "",
    chequeDate: isCheque ? rvChqDate.value : "",
    pdcDate: method === "PDC Cheque" ? (rvPdcDate?.value || "") : "",
    discount: discTotal,
    allocations: allocs, status, createdAt: Date.now(), createdBy: who(), applied: applyNow
  };
  try{
    _receiptSaving = true;
    const write = (async ()=>{
      const recRef = doc(col("receipts"));
      const batch = writeBatch(db);
      batch.set(recRef, data);
      if(applyNow){
        const discShares = (allocs.length && discTotal > 0)
          ? distributeProportionally(discTotal, allocs.map(a=> a.amount))
          : allocs.map(()=> 0);
        for(let i = 0; i < allocs.length; i++){
          const a = allocs[i];
          const inv = invoices.find(x=> x.id === a.invoiceId);
          if(!inv) continue;
          const patch = invoiceMoneyPatch(inv, {
            paidDelta: a.amount,
            creditedDelta: discShares[i] || 0,
            updatedBy: who()
          });
          batch.update(doc(db, "invoices", a.invoiceId), patch);
          Object.assign(inv, patch);
        }
      }
      if(isCheque && rvChq.value.trim()){
        let chqStatus = "Pending";
        if(status === "Cleared") chqStatus = "Cleared";
        else if(status === "Bounced") chqStatus = "Bounced";
        else if(status === "Cancelled") chqStatus = "Cancelled";
        else if(status === "Deposited") chqStatus = "Deposited";
        batch.set(doc(col("cheques")), {
          chequeNo: rvChq.value.trim(), customer, bank: rvBank.value.trim(),
          chequeDate: rvChqDate.value || rvDate.value, pdcDate: rvPdcDate?.value || rvChqDate.value,
          amount, status: chqStatus,
          receiptId: recRef.id, receiptNo: data.rvNo, createdAt: Date.now()
        });
      }
      if(applyNow && discTotal > 0){
        batch.set(doc(col("discounts")), {
          date: rvDate.value, customer, type:"Payment", ref: data.rvNo, method:"Fixed",
          amount: discTotal, reason: "Receipt discount", approvedBy: who(), createdAt: Date.now()
        });
      }
      await batch.commit();
      await logActivity({ action:"add", staffName: who(), module:"Receipt", record: data.rvNo, customer, summary: "Receipt " + data.rvNo, newValue: money(amount) });
      return { id: recRef.id, ...data };
    })();
    commitWrite(
      write.then(saved => {
        closeModal("receiptModal");
        if(saved?.id && confirm(`Receipt ${saved.rvNo} posted.\n\nPrint / share this receipt now?`)){
          exportReceiptPdf(saved).catch(err => toast(String(err?.message || err)));
        }
        return saved;
      }),
      { okMsg: "Receipt posted" }
    ).catch(()=>{}).finally(()=>{ _receiptSaving = false; });
  }catch(e){
    _receiptSaving = false;
    toast(friendlyFirestoreError(e));
  }
}

function fillAllocSelect(){
  const allocReceipt = document.getElementById("allocReceipt");
  if(!allocReceipt) return;
  const list = receipts.filter(r=> num(r.unallocated) > 0.009 && receiptAffectsBalance(r));
  allocReceipt.innerHTML = list.map(r=> `<option value="${esc(r.id)}">${esc(r.rvNo)} — ${money(r.unallocated)}</option>`).join("");
  fillAllocRows();
}

function fillAllocRows(){
  const allocReceipt = document.getElementById("allocReceipt");
  const allocCustomer = document.getElementById("allocCustomer");
  const allocUnalloc = document.getElementById("allocUnalloc");
  const allocRows = document.getElementById("allocRows");
  if(!allocReceipt || !allocRows) return;
  const r = receipts.find(x=> x.id === allocReceipt.value);
  if(!r){ if(allocCustomer) allocCustomer.value = ""; if(allocUnalloc) allocUnalloc.value = ""; allocRows.innerHTML = ""; return; }
  if(allocCustomer) allocCustomer.value = r.customer;
  if(allocUnalloc) allocUnalloc.value = money(r.unallocated);
  const open = invoices.filter(i=> i.customer === r.customer && i.status !== "Draft" && invBalance(i) > 0);
  allocRows.innerHTML = open.map(i=> `<tr>
    <td><input type="checkbox" checked></td>
    <td>${esc(i.invNo)}</td><td>${esc(i.invDate)}</td><td>${esc(i.dueDate)}</td>
    <td>${money(i.total)}</td><td>${money(invBalance(i))}</td>
    <td><input type="number" data-inv="${esc(i.id)}" data-max="${invBalance(i)}" value="0"></td>
    <td>${badge(invStatus(i))}</td>
  </tr>`).join("") || `<tr><td colspan="8" class="empty">No open invoices</td></tr>`;
}

async function saveAllocation(){
  if(!requireModule("allocation")) return;
  if(_allocSaving) return toast("Save already in progress…");
  const allocReceipt = document.getElementById("allocReceipt");
  const r = receipts.find(x=> x.id === allocReceipt?.value);
  if(!r) return toast("Select a receipt");
  const allocs = [...document.querySelectorAll("#allocRows input[data-inv]")].map(inp=>({
    invoiceId: inp.dataset.inv, amount: Math.min(num(inp.value), num(inp.dataset.max))
  })).filter(a=> a.amount > 0);
  const sum = allocs.reduce((s,a)=> s+a.amount, 0);
  if(sum <= 0) return toast("Enter amounts");
  if(sum > num(r.unallocated) + 0.01) return toast("Exceeds unallocated");
  try{
    _allocSaving = true;
    const batch = writeBatch(db);
    for(const a of allocs){
      const inv = invoices.find(i=> i.id === a.invoiceId);
      if(!inv) continue;
      const patch = invoiceMoneyPatch(inv, { paidDelta: a.amount });
      batch.update(doc(db,"invoices", a.invoiceId), patch);
      Object.assign(inv, patch);
    }
    const nextAllocated = num(r.allocated)+sum;
    const nextUnallocated = num(r.unallocated)-sum;
    const nextAllocs = [...(r.allocations||[]), ...allocs];
    batch.update(doc(db,"receipts", r.id), {
      allocated: nextAllocated,
      unallocated: nextUnallocated,
      allocations: nextAllocs
    });
    await batch.commit();
    Object.assign(r, { allocated: nextAllocated, unallocated: nextUnallocated, allocations: nextAllocs });
    await logActivity({ action:"edit", staffName: who(), module:"Allocation", record: r.rvNo, customer: r.customer, summary: "Allocated " + money(sum) });
    toast("Allocation saved");
  }catch(e){ toast(e.message); }
  finally { _allocSaving = false; }
}

function fillCnAllocSelect(preferId){
  const sel = document.getElementById("allocCn");
  if(!sel) return;
  const list = creditNotes.filter(n=> cnOpenCredit(n) > 0.009)
    .sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  const keep = preferId || sel.value || "";
  sel.innerHTML = list.length
    ? list.map(n=> `<option value="${esc(n.id)}">${esc(n.cnNo)} — ${money(cnOpenCredit(n))} open · ${esc(n.customer)}</option>`).join("")
    : `<option value="">No open credit notes</option>`;
  if(keep && [...sel.options].some(o=> o.value === keep)) sel.value = keep;
  fillCnAllocRows();
}

function fillCnAllocRows(){
  const sel = document.getElementById("allocCn");
  const custEl = document.getElementById("allocCnCustomer");
  const openEl = document.getElementById("allocCnOpen");
  const rows = document.getElementById("cnAllocRows");
  if(!rows) return;
  const n = creditNotes.find(x=> x.id === sel?.value);
  if(!n){
    if(custEl) custEl.value = "";
    if(openEl) openEl.value = "";
    rows.innerHTML = `<tr><td colspan="6" class="empty">Select a credit note with open credit</td></tr>`;
    return;
  }
  const open = cnOpenCredit(n);
  if(custEl) custEl.value = n.customer || "";
  if(openEl) openEl.value = money(open);
  const invs = invoices
    .filter(i=> i.customer === n.customer && i.status !== "Draft" && invBalance(i) > 0.009)
    .sort((a,b)=> String(a.dueDate||a.invDate).localeCompare(String(b.dueDate||b.invDate)));
  let left = open;
  rows.innerHTML = invs.length ? invs.map(i=>{
    const bal = invBalance(i);
    let suggest = 0;
    if(left > 0.009){
      suggest = Math.min(left, bal);
      left = roundMoney(left - suggest);
    }
    return `<tr>
      <td><b>${esc(i.invNo)}</b></td><td>${esc(i.invDate)}</td><td>${esc(i.dueDate)}</td>
      <td>${money(bal)}</td>
      <td><input type="number" min="0" step="0.01" data-cn-inv="${esc(i.id)}" data-max="${bal}" value="${suggest || 0}"></td>
      <td>${badge(invStatus(i))}</td>
    </tr>`;
  }).join("") : `<tr><td colspan="6" class="empty">No open invoices for this customer</td></tr>`;
}

async function saveCnAllocation(){
  if(!requireModule("allocation")) return;
  if(_cnAllocSaving) return toast("Save already in progress…");
  const sel = document.getElementById("allocCn");
  const n = creditNotes.find(x=> x.id === sel?.value);
  if(!n) return toast("Select a credit note");
  const open = cnOpenCredit(n);
  if(open <= 0.009) return toast("No open credit on this CN");
  const allocs = [...document.querySelectorAll("#cnAllocRows input[data-cn-inv]")].map(inp=>{
    const inv = invoices.find(i=> i.id === inp.dataset.cnInv);
    return {
      invoiceId: inp.dataset.cnInv,
      invoiceNo: inv?.invNo || "",
      amount: Math.min(num(inp.value), num(inp.dataset.max))
    };
  }).filter(a=> a.amount > 0.009);
  const sum = roundMoney(allocs.reduce((s,a)=> s + a.amount, 0));
  if(sum <= 0) return toast("Enter credit amounts");
  if(sum > open + 0.01) return toast("Exceeds open credit on CN");
  try{
    _cnAllocSaving = true;
    const batch = writeBatch(db);
    for(const a of allocs){
      const inv = invoices.find(i=> i.id === a.invoiceId);
      if(!inv) continue;
      const patch = invoiceMoneyPatch(inv, { creditedDelta: a.amount, updatedBy: who() });
      batch.update(doc(db, "invoices", a.invoiceId), patch);
      Object.assign(inv, patch);
    }
    const prevAlloc = Array.isArray(n.allocations) ? n.allocations : [];
    // Migrate legacy single-invoice link into allocations list if needed
    let baseAlloc = prevAlloc;
    if(!prevAlloc.length && String(n.invoice || "").trim()){
      const inv = invoices.find(i=> i.invNo === n.invoice && i.customer === n.customer);
      baseAlloc = [{ invoiceId: inv?.id || "", invoiceNo: n.invoice, amount: num(n.amount) }];
    }
    const nextAlloc = [...baseAlloc, ...allocs];
    const allocated = roundMoney(nextAlloc.reduce((s,a)=> s + num(a.amount), 0));
    const patchCn = {
      allocations: nextAlloc,
      allocated,
      unallocated: Math.max(0, roundMoney(num(n.amount) - allocated)),
      updatedAt: Date.now(),
      updatedBy: who()
    };
    batch.update(doc(db, "creditNotes", n.id), patchCn);
    Object.assign(n, patchCn);
    await batch.commit();
    await logActivity({
      action: "edit", staffName: who(), module: "CN Allocation",
      record: n.cnNo, customer: n.customer, summary: "CN allocated " + money(sum)
    });
    toast("Credit note allocated to invoice(s)");
    fillCnAllocSelect(n.id);
  }catch(e){ toast(friendlyFirestoreError(e)); }
  finally { _cnAllocSaving = false; }
}

function ledgerLines(name){
  const lines = [];
  invoices.filter(i=> i.customer===name && i.status !== "Draft").forEach(i=> lines.push({ date:i.invDate, ref:i.invNo, desc:"Credit Invoice", debit:num(i.total), credit:0 }));
  receipts.filter(r=> r.customer===name && receiptAffectsBalance(r)).forEach(r=> lines.push({ date:r.date, ref:r.rvNo, desc:"Receipt "+(r.method||""), debit:0, credit:num(r.amount) }));
  creditNotes.filter(n=> n.customer===name && noteIsLive(n)).forEach(n=> lines.push({ date:n.date, ref:n.cnNo, desc:"Credit Note", debit:0, credit:num(n.amount) }));
  // Invoice-linked debit notes already increase invoice.total — only list unlinked DNs here
  unlinkedDebitNotes(name).forEach(n=> lines.push({ date:n.date, ref:n.dnNo, desc:"Debit Note", debit:num(n.amount), credit:0 }));
  discounts.filter(d=> d.customer===name).forEach(d=> lines.push({ date:d.date, ref:d.ref||"", desc:"Discount", debit:0, credit:num(d.amount) }));
  cheques.filter(c=> c.customer===name && c.status==="Cleared" && !findChequeReceipt(c)).forEach(c=>
    lines.push({ date:c.pdcDate||c.chequeDate, ref:c.chequeNo, desc:"Cheque cleared", debit:0, credit:num(c.amount) })
  );
  return lines.sort((a,b)=> String(a.date).localeCompare(String(b.date)));
}

function fillLedger(){
  const name = document.getElementById("ledgerCustomer").value;
  const from = document.getElementById("ledgerFrom")?.value || "";
  const to = document.getElementById("ledgerTo")?.value || "";
  const body = document.getElementById("ledgerRows");
  if(!name){ document.getElementById("ledgerTitle").textContent = "Select a customer"; document.getElementById("ledgerClose").textContent = "—"; body.innerHTML = ""; return; }
  const all = ledgerLines(name);
  let bal = from ? all.filter(l=> l.date < from).reduce((s,l)=> s + l.debit - l.credit, 0) : 0;
  const rows = [];
  if(from && bal){
    rows.push(`<tr><td>${esc(from)}</td><td>OPENING</td><td>Opening Balance</td><td>${bal>0?money(bal):"—"}</td><td>${bal<0?money(-bal):"—"}</td><td>${money(bal)}</td></tr>`);
  }
  all.filter(l=> (!from || l.date >= from) && (!to || l.date <= to)).forEach(l=>{
    bal += l.debit - l.credit;
    rows.push(`<tr><td>${esc(l.date)}</td><td>${esc(l.ref)}</td><td>${esc(l.desc)}</td><td>${l.debit?money(l.debit):"—"}</td><td>${l.credit?money(l.credit):"—"}</td><td>${money(bal)}</td></tr>`);
  });
  document.getElementById("ledgerTitle").textContent = name;
  // Closing must match filtered running balance (last row). Lifetime outstanding only when no date filter.
  document.getElementById("ledgerClose").textContent = (from || to)
    ? ("Closing (period): " + money(bal))
    : ("Closing: " + money(customerOutstanding(name)));
  body.innerHTML = rows.join("") || `<tr><td colspan="6" class="empty">No movements</td></tr>`;
}

function fillStatement(){
  const sel = document.getElementById("stmtCustomer");
  const asOf = document.getElementById("stmtAsOf")?.value || today();
  const from = document.getElementById("stmtFrom")?.value || "";
  if(document.getElementById("stmtAsOf") && !document.getElementById("stmtAsOf").value) document.getElementById("stmtAsOf").value = today();
  const name = sel.value || customers[0]?.name || "";
  if(sel.value !== name && name) sel.value = name;
  document.getElementById("stmtTitle").textContent = name ? `${name} — as of ${asOf}` : "—";
  const closeEl = document.getElementById("stmtClose");
  const body = document.getElementById("stmtRows");
  if(!name){
    if(closeEl) closeEl.textContent = "—";
    body.innerHTML = "";
    return;
  }
  const built = buildStatementRows(name, asOf, from);
  if(closeEl) closeEl.textContent = "Closing Balance: " + money(built.closing);
  body.innerHTML = built.htmlRows.join("") || `<tr><td colspan="6" class="empty">Empty</td></tr>`;
}

function buildStatementRows(name, asOf, from){
  const all = ledgerLines(name).filter(l=> l.date <= asOf);
  let bal = from ? all.filter(l=> l.date < from).reduce((s,l)=> s + l.debit - l.credit, 0) : 0;
  const htmlRows = [];
  const dataRows = [];
  if(from && bal){
    htmlRows.push(`<tr><td>${esc(from)}</td><td>OPENING</td><td>Opening Balance</td><td>${bal>0?money(bal):"—"}</td><td>${bal<0?money(-bal):"—"}</td><td>${money(bal)}</td></tr>`);
    dataRows.push([from, "OPENING", "Opening Balance", bal > 0 ? bal : "", bal < 0 ? -bal : "", bal]);
  }
  all.filter(l=> !from || l.date >= from).forEach(l=>{
    bal += l.debit - l.credit;
    htmlRows.push(`<tr><td>${esc(l.date)}</td><td>${esc(l.ref)}</td><td>${esc(l.desc)}</td><td>${l.debit?money(l.debit):"—"}</td><td>${l.credit?money(l.credit):"—"}</td><td>${money(bal)}</td></tr>`);
    dataRows.push([l.date, l.ref, l.desc, l.debit || "", l.credit || "", bal]);
  });
  return { closing: bal, htmlRows, dataRows };
}

function renderNotes(tbodyId, list, noField){
  const isCn = tbodyId === "cnRows";
  const isDn = tbodyId === "dnRows";
  const el = document.getElementById(tbodyId);
  if(!el) return;
  const cols = isCn ? 9 : (isDn ? 8 : 7);
  el.innerHTML = list.length ? list.map(n=>{
    const open = isCn ? cnOpenCredit(n) : 0;
    const live = noteIsLive(n);
    let actions = "—";
    if(live){
      const bits = [];
      if(isCn && open > 0.009){
        bits.push(`<button class="btn small" type="button" data-alloc-cn="${n.id}">Allocate</button>`);
      }
      bits.push(`<button class="btn small danger" type="button" data-void-note="${tbodyId}:${n.id}">Void</button>`);
      actions = bits.join(" ");
    }
    return `<tr>
      <td>${esc(n[noField])}</td><td>${esc(n.date)}</td><td>${esc(n.customer)}</td>
      <td>${esc(n.invoice||n.ref||"")}</td><td>${esc(n.reason)}</td><td>${money(n.amount)}</td>
      ${isCn ? `<td class="${open?"orange":""}">${money(open)}</td>` : ""}
      <td>${badge(n.status||"Posted")}</td>
      <td>${actions}</td>
    </tr>`;
  }).join("") : `<tr><td colspan="${cols}" class="empty">None</td></tr>`;
  el.querySelectorAll("[data-void-note]").forEach(b=>{
    b.onclick = ()=>{
      const [kind, id] = String(b.dataset.voidNote || "").split(":");
      if(kind === "cnRows") voidCreditNote(id);
      else if(kind === "dnRows") voidDebitNote(id);
    };
  });
  el.querySelectorAll("[data-alloc-cn]").forEach(b=>{
    b.onclick = ()=>{
      showPage("allocation");
      const sel = document.getElementById("allocCn");
      if(sel){ sel.value = b.dataset.allocCn; fillCnAllocRows(); }
      toast("Select invoices and Save CN Allocation");
    };
  });
}

function fillNoteInvoices(sel, customer, selected){
  if(!sel) return;
  const list = invoicesForCustomer(customer, "");
  const keep = selected != null ? selected : (sel.value || "");
  sel.innerHTML = `<option value="">—</option>` + list.map(i=>
    `<option value="${esc(i.invNo)}">${esc(i.invNo)} (${money(invBalance(i))} due)</option>`
  ).join("");
  if(keep && [...sel.options].some(o=> o.value === keep)) sel.value = keep;
  else sel.value = "";
  syncInvoiceComboInput(sel);
}

function resetCn(){
  const cnId = document.getElementById("cnId");
  const cnNo = document.getElementById("cnNo");
  const cnDate = document.getElementById("cnDate");
  const cnAmount = document.getElementById("cnAmount");
  const cnReason = document.getElementById("cnReason");
  const cnStatus = document.getElementById("cnStatus");
  const cnCustomer = document.getElementById("cnCustomer");
  const cnInvoice = document.getElementById("cnInvoice");
  if(cnId) cnId.value = "";
  if(cnNo) cnNo.value = nextNo("CN-", creditNotes, "cnNo");
  if(cnDate) cnDate.value = today();
  if(cnAmount) cnAmount.value = "";
  if(cnReason) cnReason.value = "";
  if(cnStatus) cnStatus.value = "Posted";
  if(cnCustomer) customerOptions(cnCustomer, "");
  if(cnInvoice) fillNoteInvoices(cnInvoice, "");
}

function resetDn(){
  const dnId = document.getElementById("dnId");
  const dnNo = document.getElementById("dnNo");
  const dnDate = document.getElementById("dnDate");
  const dnAmount = document.getElementById("dnAmount");
  const dnReason = document.getElementById("dnReason");
  const dnRef = document.getElementById("dnRef");
  const dnStatus = document.getElementById("dnStatus");
  const dnCustomer = document.getElementById("dnCustomer");
  const dnInvoice = document.getElementById("dnInvoice");
  if(dnId) dnId.value = "";
  if(dnNo) dnNo.value = nextNo("DN-", debitNotes, "dnNo");
  if(dnDate) dnDate.value = today();
  if(dnAmount) dnAmount.value = "";
  if(dnReason) dnReason.value = "";
  if(dnRef) dnRef.value = "";
  if(dnStatus) dnStatus.value = "Posted";
  if(dnCustomer) customerOptions(dnCustomer, "");
  if(dnInvoice) fillNoteInvoices(dnInvoice, "");
}

async function saveCn(){
  if(!requireModule("credit-notes")) return;
  const cnCustomer = document.getElementById("cnCustomer");
  const cnAmount = document.getElementById("cnAmount");
  const cnNo = document.getElementById("cnNo");
  const cnDate = document.getElementById("cnDate");
  const cnInvoice = document.getElementById("cnInvoice");
  const cnReason = document.getElementById("cnReason");
  const cnStatus = document.getElementById("cnStatus");
  const customer = cnCustomer?.value || "";
  const amount = num(cnAmount?.value);
  if(!customer) return toast("Select customer");
  if(amount <= 0) return toast("Enter amount");
  const cnTrimOrig = (cnNo?.value || "").trim();
  if(!cnTrimOrig) return toast("Credit Note No. required");
  const status = cnStatus?.value || "Posted";
  const invNo = (cnInvoice?.value || "").trim();
  if(invNo && status !== "Draft" && !invoices.find(i=> i.invNo === invNo && i.customer === customer)){
    if(!confirm(`Invoice ${invNo} was not found for ${customer}.\n\nPost as UNLINKED credit (sits on the customer ledger until allocated)?`)) return;
  }
  const cnSerial = uniqueSerial(creditNotes, "cnNo", cnTrimOrig, "CN-");
  const cnTrim = cnSerial.value;
  if(cnSerial.bumped){
    if(cnNo) cnNo.value = cnTrim;
    toast("Credit Note No. already used — posting as " + cnTrim);
  }
  try{
    const write = (async ()=>{
      const inv = invNo ? invoices.find(i=> i.invNo === invNo && i.customer === customer) : null;
      const linked = status !== "Draft" && !!inv;
      const allocations = linked
        ? [{ invoiceId: inv.id, invoiceNo: inv.invNo, amount }]
        : [];
      const batch = writeBatch(db);
      const cnRef = doc(col("creditNotes"));
      batch.set(cnRef, {
        cnNo: cnTrim, date: cnDate?.value || today(), customer, invoice: invNo,
        reason: (cnReason?.value || "").trim(), amount, status,
        allocations,
        allocated: linked ? amount : 0,
        unallocated: linked ? 0 : (status === "Draft" ? 0 : amount),
        createdAt: Date.now(), createdBy: who()
      });
      if(linked){
        const patch = invoiceMoneyPatch(inv, { creditedDelta: amount });
        batch.update(doc(db,"invoices", inv.id), patch);
        Object.assign(inv, patch);
      }
      await batch.commit();
      await logActivity({ action:"add", staffName: who(), module:"Credit Note", record: cnTrim, customer, summary: "CN " + cnTrim, newValue: money(amount) });
    })();
    commitWrite(write.then(()=> closeModal("cnModal")), { okMsg: "Credit note posted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function saveDn(){
  if(!requireModule("debit-notes")) return;
  const dnCustomer = document.getElementById("dnCustomer");
  const dnAmount = document.getElementById("dnAmount");
  const dnNo = document.getElementById("dnNo");
  const dnDate = document.getElementById("dnDate");
  const dnRef = document.getElementById("dnRef");
  const dnInvoice = document.getElementById("dnInvoice");
  const dnReason = document.getElementById("dnReason");
  const dnStatus = document.getElementById("dnStatus");
  const customer = dnCustomer?.value || "";
  const amount = num(dnAmount?.value);
  if(!customer) return toast("Select customer");
  if(amount <= 0) return toast("Enter amount");
  const dnTrimOrig = (dnNo?.value || "").trim();
  if(!dnTrimOrig) return toast("Debit Note No. required");
  const invNo = (dnInvoice?.value || "").trim();
  const status = dnStatus?.value || "Posted";
  if(invNo && noteIsLive({ status }) && !invoices.find(i=> i.invNo === invNo && i.customer === customer)){
    if(!confirm(`Invoice ${invNo} was not found for ${customer}.\n\nPost the debit note WITHOUT raising any invoice total?`)) return;
  }
  const dnSerial = uniqueSerial(debitNotes, "dnNo", dnTrimOrig, "DN-");
  const dnTrim = dnSerial.value;
  if(dnSerial.bumped){
    if(dnNo) dnNo.value = dnTrim;
    toast("Debit Note No. already used — posting as " + dnTrim);
  }
  try{
    const write = (async ()=>{
      const batch = writeBatch(db);
      const dnDocRef = doc(col("debitNotes"));
      batch.set(dnDocRef, {
        dnNo: dnTrim, date: dnDate?.value || today(), customer,
        invoice: invNo,
        ref: (dnRef?.value || "").trim(),
        reason: (dnReason?.value || "").trim(), amount, status,
        createdAt: Date.now(), createdBy: who()
      });
      // Linked + Posted → raise invoice.total so dashboard/aging/invBalance stay in sync
      if(noteIsLive({ status }) && invNo){
        const inv = invoices.find(i=> i.invNo === invNo && i.customer === customer);
        if(inv){
          const nextTotal = roundMoney(num(inv.total) + amount);
          const patch = { total: nextTotal, updatedAt: Date.now(), updatedBy: who() };
          batch.update(doc(db, "invoices", inv.id), patch);
          Object.assign(inv, patch);
        }
      }
      await batch.commit();
      await logActivity({ action:"add", staffName: who(), module:"Debit Note", record: dnTrim, customer, summary: "DN " + dnTrim, newValue: money(amount) });
    })();
    commitWrite(write.then(()=> closeModal("dnModal")), { okMsg: "Debit note posted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function voidCreditNote(id){
  if(!requireModule("credit-notes")) return;
  const n = creditNotes.find(x=> x.id === id);
  if(!n) return toast("Credit note not found");
  if(!noteIsLive(n)) return toast("Already voided / not active");
  const msg = `Void credit note ${n.cnNo} (${money(n.amount)})?\nCustomer: ${n.customer}\n\nThis reverses invoice credits and removes it from the ledger.`;
  if(!confirm(msg)) return;
  try{
    const write = (async ()=>{
      let targets = Array.isArray(n.allocations) ? n.allocations.filter(a=> num(a.amount) > 0) : [];
      if(!targets.length && String(n.invoice || "").trim()){
        const inv = invoices.find(i=> i.invNo === n.invoice && i.customer === n.customer);
        targets = [{ invoiceId: inv?.id, invoiceNo: n.invoice, amount: num(n.amount) }];
      }
      const batch = writeBatch(db);
      for(const a of targets){
        const inv = invoices.find(i=>
          (a.invoiceId && i.id === a.invoiceId) ||
          (a.invoiceNo && i.invNo === a.invoiceNo && i.customer === n.customer)
        );
        if(!inv) continue;
        const patch = invoiceMoneyPatch(inv, { creditedDelta: -num(a.amount), updatedBy: who() });
        batch.update(doc(db, "invoices", inv.id), patch);
        Object.assign(inv, patch);
      }
      const patchCn = {
        status: "Voided",
        voidedAt: Date.now(),
        voidedBy: who(),
        allocated: 0,
        unallocated: 0,
        allocations: [],
        invoice: "",
        updatedAt: Date.now()
      };
      batch.update(doc(db, "creditNotes", n.id), patchCn);
      Object.assign(n, patchCn);
      await batch.commit();
      await logActivity({
        action: "void", staffName: who(), module: "Credit Note",
        record: n.cnNo, customer: n.customer, summary: "Voided CN " + n.cnNo, oldValue: money(n.amount)
      });
    })();
    commitWrite(write, { okMsg: "Credit note voided" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function voidDebitNote(id){
  if(!requireModule("debit-notes")) return;
  const n = debitNotes.find(x=> x.id === id);
  if(!n) return toast("Debit note not found");
  if(!noteIsLive(n)) return toast("Already voided / not active");
  const invNo = String(n.invoice || "").trim();
  const inv = invNo ? invoices.find(i=> i.invNo === invNo && i.customer === n.customer) : null;
  if(inv){
    const nextTotal = roundMoney(num(inv.total) - num(n.amount));
    const floor = roundMoney(num(inv.paid) + num(inv.credited));
    if(nextTotal + 0.009 < floor){
      return toast(`Cannot void — invoice ${inv.invNo} paid/credited (${money(floor)}) exceeds total after void (${money(nextTotal)}). Reverse payments first.`);
    }
  }
  if(!confirm(`Void debit note ${n.dnNo} (${money(n.amount)})?\nCustomer: ${n.customer}`)) return;
  try{
    const write = (async ()=>{
      const batch = writeBatch(db);
      if(inv){
        const nextTotal = roundMoney(Math.max(0, num(inv.total) - num(n.amount)));
        const patch = { total: nextTotal, updatedAt: Date.now(), updatedBy: who() };
        batch.update(doc(db, "invoices", inv.id), patch);
        Object.assign(inv, patch);
      }
      const patchDn = { status: "Voided", voidedAt: Date.now(), voidedBy: who(), updatedAt: Date.now() };
      batch.update(doc(db, "debitNotes", n.id), patchDn);
      Object.assign(n, patchDn);
      await batch.commit();
      await logActivity({
        action: "void", staffName: who(), module: "Debit Note",
        record: n.dnNo, customer: n.customer, summary: "Voided DN " + n.dnNo, oldValue: money(n.amount)
      });
    })();
    commitWrite(write, { okMsg: "Debit note voided" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function voidReceipt(id){
  if(!requireModule("receipts")) return;
  const r = receipts.find(x=> x.id === id);
  if(!r) return toast("Receipt not found");
  const st = r.status || "Posted";
  if(st === "Voided" || st === "Cancelled" || st === "Bounced") return toast("Already voided / cancelled");
  const mustReverse = !!(r.applied || receiptAffectsBalance(r));
  const msg = mustReverse
    ? `Void receipt ${r.rvNo} (${money(r.amount)})?\nThis reverses invoice paid/discount and removes it from the ledger.`
    : `Cancel receipt ${r.rvNo} (${money(r.amount)})?\nNot yet applied to invoices (e.g. pending cheque).`;
  if(!confirm(msg)) return;
  const linkedChq = cheques.find(c=>
    (c.receiptId && c.receiptId === r.id) || (c.receiptNo && c.receiptNo === r.rvNo)
  );
  if(linkedChq && linkedChq.status !== "Cancelled" && linkedChq.status !== "Voided" && linkedChq.status !== "Bounced"){
    if(!memberCan(member, "cheques")){
      return toast("Cheque module permission is required to void this receipt (it has a linked cheque).");
    }
  }
  try{
    const write = (async ()=>{
      const batch = writeBatch(db);
      if(mustReverse){
        await reverseReceiptFromInvoices(r, "Cancelled", batch);
      }else{
        batch.update(doc(db, "receipts", r.id), {
          status: "Cancelled", applied: false, updatedAt: Date.now()
        });
        Object.assign(r, { status: "Cancelled", applied: false });
      }
      const chq = linkedChq;
      if(chq && chq.status !== "Cancelled" && chq.status !== "Voided" && chq.status !== "Bounced"){
        batch.update(doc(db, "cheques", chq.id), { status: "Cancelled", updatedAt: Date.now() });
        Object.assign(chq, { status: "Cancelled" });
      }
      await batch.commit();
      await logActivity({
        action: "void", staffName: who(), module: "Receipt",
        record: r.rvNo, customer: r.customer, summary: "Voided RV " + r.rvNo, oldValue: money(r.amount)
      });
    })();
    commitWrite(write, { okMsg: "Receipt voided" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function renderCheques(){
  document.getElementById("chequeRows").innerHTML = cheques.length ? cheques.map(c=> `<tr>
    <td>${esc(c.chequeNo)}</td><td>${esc(c.customer)}</td><td>${esc(c.bank)}</td>
    <td>${esc(c.chequeDate)}</td><td>${esc(c.pdcDate)}</td><td>${money(c.amount)}</td><td>${badge(c.status||"Pending")}</td>
    <td><button class="btn small" type="button" data-edit-chq="${c.id}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="8" class="empty">No cheques</td></tr>`;
  document.querySelectorAll("[data-edit-chq]").forEach(b=> b.onclick = ()=> editCheque(b.dataset.editChq));
}

function resetCheque(){
  const chqId = document.getElementById("chqId");
  const chqNo = document.getElementById("chqNo");
  const chqBank = document.getElementById("chqBank");
  const chqAmt = document.getElementById("chqAmt");
  const chqDate = document.getElementById("chqDate");
  const chqPdc = document.getElementById("chqPdc");
  const chqStatus = document.getElementById("chqStatus");
  const chqCustomer = document.getElementById("chqCustomer");
  const chqInvoice = document.getElementById("chqInvoice");
  if(chqId) chqId.value = "";
  if(chqNo) chqNo.value = "";
  if(chqBank) chqBank.value = "";
  if(chqAmt) chqAmt.value = "";
  if(chqDate) chqDate.value = today();
  if(chqPdc) chqPdc.value = today();
  if(chqStatus) chqStatus.value = "Pending";
  if(chqCustomer) customerOptions(chqCustomer, "");
  if(chqInvoice) fillNoteInvoices(chqInvoice, "");
}

function editCheque(id){
  const c = cheques.find(x=> x.id === id);
  if(!c) return;
  const chqId = document.getElementById("chqId");
  const chqNo = document.getElementById("chqNo");
  const chqBank = document.getElementById("chqBank");
  const chqAmt = document.getElementById("chqAmt");
  const chqDate = document.getElementById("chqDate");
  const chqPdc = document.getElementById("chqPdc");
  const chqStatus = document.getElementById("chqStatus");
  const chqCustomer = document.getElementById("chqCustomer");
  const chqInvoice = document.getElementById("chqInvoice");
  if(chqId) chqId.value = c.id;
  if(chqNo) chqNo.value = c.chequeNo||"";
  if(chqCustomer) customerOptions(chqCustomer, c.customer);
  if(chqInvoice) fillNoteInvoices(chqInvoice, c.customer || "", c.invoice || "");
  if(chqBank) chqBank.value = c.bank||"";
  if(chqDate) chqDate.value = c.chequeDate||"";
  if(chqPdc) chqPdc.value = c.pdcDate||"";
  if(chqAmt) chqAmt.value = c.amount||0;
  if(chqStatus) chqStatus.value = c.status||"Pending";
  openFormModal("chequeModal");
}

async function recalculateInvoiceBalances(){
  if(!isOwnerRole()) throw new Error("Only owner");
  const paidMap = {};
  const creditedMap = {};

  receipts.filter(r=> r.applied && receiptAffectsBalance(r)).forEach(r=>{
    const allocs = r.allocations || [];
    if(!allocs.length) return;
    const disc = num(r.discount);
    const shares = disc > 0 ? distributeProportionally(disc, allocs.map(a=> num(a.amount))) : allocs.map(()=> 0);
    allocs.forEach((a, i)=>{
      if(!a.invoiceId) return;
      paidMap[a.invoiceId] = roundMoney((paidMap[a.invoiceId] || 0) + num(a.amount));
      creditedMap[a.invoiceId] = roundMoney((creditedMap[a.invoiceId] || 0) + (shares[i] || 0));
    });
  });

  // Standalone cleared cheques applied directly to an invoice (no receipt)
  cheques.filter(c=> c.status === "Cleared" && c.appliedToInvoice && c.invoice).forEach(c=>{
    const inv = invoices.find(i=> i.invNo === c.invoice && i.customer === c.customer);
    if(!inv) return;
    paidMap[inv.id] = roundMoney((paidMap[inv.id] || 0) + num(c.appliedAmount || c.amount));
  });

  creditNotes.filter(n=> noteIsLive(n)).forEach(n=>{
    const parts = Array.isArray(n.allocations) && n.allocations.length
      ? n.allocations
      : (String(n.invoice || "").trim()
          ? [{ invoiceNo: n.invoice, amount: num(n.amount) }]
          : []);
    parts.forEach(a=>{
      const inv = invoices.find(i=>
        (a.invoiceId && i.id === a.invoiceId) ||
        (a.invoiceNo && i.invNo === a.invoiceNo && i.customer === n.customer)
      );
      if(!inv) return;
      creditedMap[inv.id] = roundMoney((creditedMap[inv.id] || 0) + num(a.amount));
    });
  });

  discounts.filter(d=> d.type === "Invoice" && d.ref).forEach(d=>{
    const inv = invoices.find(i=> i.invNo === d.ref && i.customer === d.customer);
    if(!inv) return;
    creditedMap[inv.id] = roundMoney((creditedMap[inv.id] || 0) + num(d.amount));
  });

  let fixed = 0;
  const details = [];
  const targets = invoices.filter(i=> i.status !== "Draft");
  for(const inv of targets){
    const paid = roundMoney(paidMap[inv.id] || 0);
    const credited = roundMoney(creditedMap[inv.id] || 0);
    const bal = Math.max(0, roundMoney(num(inv.total) - paid - credited));
    const paidDate = bal <= 0.009 ? (inv.paidDate || today()) : "";
    const oldPaid = roundMoney(num(inv.paid));
    const oldCredited = roundMoney(num(inv.credited));
    const changed =
      oldPaid !== paid ||
      oldCredited !== credited ||
      String(inv.paidDate || "") !== String(paidDate);
    if(!changed) continue;
    await updateDoc(doc(db, "invoices", inv.id), { paid, credited, paidDate, updatedAt: Date.now() });
    Object.assign(inv, { paid, credited, paidDate });
    fixed++;
    details.push(`${inv.invNo}: paid ${oldPaid}→${paid}, credited ${oldCredited}→${credited}`);
  }
  return { checked: targets.length, fixed, details };
}

// Money moves across invoices + receipt + discounts, so it must land atomically.
// Pass an existing batch to join a larger transaction (cheque clear/bounce);
// omit it and this commits its own batch.
async function applyReceiptToInvoices(r, externalBatch = null){
  const st = r?.status || "";
  if(st === "Cancelled" || st === "Voided" || st === "Bounced"){
    throw new Error("Receipt " + (r.rvNo || "") + " was voided/cancelled — cannot apply again");
  }
  if(r.applied){
    throw new Error("Receipt " + (r.rvNo || "") + " already applied");
  }
  const batch = externalBatch || writeBatch(db);
  const allocs = r.allocations || [];
  const discTotal = num(r.discount);
  const discShares = (allocs.length && discTotal > 0)
    ? distributeProportionally(discTotal, allocs.map(a=> num(a.amount)))
    : allocs.map(()=> 0);
  for(let i = 0; i < allocs.length; i++){
    const a = allocs[i];
    const inv = invoices.find(x=> x.id === a.invoiceId);
    if(!inv) continue;
    const patch = invoiceMoneyPatch(inv, {
      paidDelta: num(a.amount),
      creditedDelta: discShares[i] || 0
    });
    batch.update(doc(db,"invoices", a.invoiceId), patch);
    Object.assign(inv, patch);
  }
  // Ensure Payment discount exists on ledger when clearing a PDC that had discount at create
  if(discTotal > 0.009){
    const hasDisc = discounts.some(d=>
      d.type === "Payment"
      && d.customer === r.customer
      && String(d.ref || "") === String(r.rvNo || "")
    );
    if(!hasDisc){
      const ref = doc(col("discounts"));
      batch.set(ref, {
        date: r.date || today(), customer: r.customer, type: "Payment", ref: r.rvNo || "",
        method: "Fixed", amount: discTotal, reason: "Receipt discount",
        approvedBy: who(), createdAt: Date.now()
      });
      discounts.push({ id: ref.id, date: r.date || today(), customer: r.customer, type: "Payment", ref: r.rvNo || "", amount: discTotal });
    }
  }
  const allocSum = allocs.reduce((s,a)=> s + num(a.amount), 0);
  // Keep original non-cheque status as Posted; cheque/PDC clear → Cleared
  const nextStatus = String(r.method || "").includes("Cheque") ? "Cleared" : (r.status === "Posted" ? "Posted" : "Cleared");
  batch.update(doc(db,"receipts", r.id), {
    applied: true, allocated: allocSum, unallocated: Math.max(0, num(r.amount) - allocSum), status: nextStatus
  });
  Object.assign(r, { applied: true, allocated: allocSum, unallocated: Math.max(0, num(r.amount) - allocSum), status: nextStatus });
  if(!externalBatch) await batch.commit();
}

async function reverseReceiptFromInvoices(r, nextStatus = "Bounced", externalBatch = null){
  const batch = externalBatch || writeBatch(db);
  const allocs = r.allocations || [];
  const discTotal = num(r.discount);
  const discShares = (allocs.length && discTotal > 0)
    ? distributeProportionally(discTotal, allocs.map(a=> num(a.amount)))
    : allocs.map(()=> 0);
  for(let i = 0; i < allocs.length; i++){
    const a = allocs[i];
    const inv = invoices.find(x=> x.id === a.invoiceId);
    if(!inv) continue;
    const patch = invoiceMoneyPatch(inv, {
      paidDelta: -num(a.amount),
      creditedDelta: -(discShares[i] || 0)
    });
    batch.update(doc(db,"invoices", a.invoiceId), patch);
    Object.assign(inv, patch);
  }
  // Remove Payment discounts tied to this RV so ledger does not keep orphan credit
  const discRows = discounts.filter(d=>
    d.type === "Payment"
    && d.customer === r.customer
    && String(d.ref || "") === String(r.rvNo || "")
  );
  for(const d of discRows){
    batch.delete(doc(db, "discounts", d.id));
    const idx = discounts.findIndex(x=> x.id === d.id);
    if(idx >= 0) discounts.splice(idx, 1);
  }
  const st = nextStatus || "Bounced";
  batch.update(doc(db,"receipts", r.id), { applied: false, allocated: 0, unallocated: num(r.amount), status: st });
  Object.assign(r, { applied: false, allocated: 0, unallocated: num(r.amount), status: st });
  if(!externalBatch) await batch.commit();
}

function findChequeReceipt(chq){
  return receipts.find(x=> (chq.receiptId && x.id === chq.receiptId) || (chq.receiptNo && x.rvNo === chq.receiptNo));
}

async function saveCheque(){
  if(!requireModule("cheques")) return;
  const chqId = document.getElementById("chqId");
  const chqNo = document.getElementById("chqNo");
  const chqCustomer = document.getElementById("chqCustomer");
  const chqInvoice = document.getElementById("chqInvoice");
  const chqBank = document.getElementById("chqBank");
  const chqDate = document.getElementById("chqDate");
  const chqPdc = document.getElementById("chqPdc");
  const chqAmt = document.getElementById("chqAmt");
  const chqStatus = document.getElementById("chqStatus");
  if(!chqNo || !chqNo.value.trim()) return toast("Cheque no required");
  if(!chqCustomer?.value) return toast("Select customer");
  const chqTrim = chqNo.value.trim();
  const dupChq = cheques.find(c=> c.id !== (chqId?.value||"") && String(c.chequeNo||"").trim().toLowerCase() === chqTrim.toLowerCase());
  if(dupChq && !confirm(`This Cheque No. is already used (${dupChq.chequeNo}, ${dupChq.customer}, ${money(dupChq.amount)}, ${dupChq.chequeDate||"—"}). Continue anyway?`)) return;
  const prev = cheques.find(x=> x.id === chqId?.value);
  const data = {
    chequeNo: chqTrim, customer: chqCustomer.value, invoice: chqInvoice?.value || "",
    bank: (chqBank?.value || "").trim(),
    chequeDate: chqDate?.value || "", pdcDate: chqPdc?.value || "", amount: num(chqAmt?.value),
    status: chqStatus?.value || "Pending",
    appliedToInvoice: !!(prev && prev.appliedToInvoice),
    updatedAt: Date.now()
  };
  const wasCleared = (prev?.status || "") === "Cleared";
  const nowCleared = data.status === "Cleared";
  const linkedReceipt = findChequeReceipt(prev || data);
  if(!wasCleared && nowCleared && linkedReceipt && !linkedReceipt.applied){
    if(!requireAnyModule(["receipts","allocation"], "Receipt or allocation permission is required to clear this cheque onto invoices.")) return;
  }
  if(wasCleared && !nowCleared && linkedReceipt && linkedReceipt.applied){
    if(!requireAnyModule(["receipts","allocation"], "Receipt or allocation permission is required to reverse this cheque from invoices.")) return;
  }
  try{
    const write = (async ()=>{
      const r = linkedReceipt;
      // One batch for the whole transition — invoice paid and cheque status must
      // never disagree if a write fails halfway.
      const batch = writeBatch(db);

      // Entering Cleared
      if(!wasCleared && nowCleared){
        if(r){
          const rst = r.status || "";
          if(rst === "Cancelled" || rst === "Voided" || rst === "Bounced"){
            throw new Error("Linked receipt " + (r.rvNo || "") + " was voided — cannot clear this cheque. Create a new receipt.");
          }
          if(!r.applied){
            await applyReceiptToInvoices(r, batch);
          }
        }else if(data.invoice){
          const inv = invoices.find(i=> i.invNo === data.invoice && i.customer === data.customer);
          if(inv){
            const pay = Math.min(num(data.amount), invBalance(inv));
            if(pay > 0.009){
              const patch = invoiceMoneyPatch(inv, { paidDelta: pay, updatedBy: who() });
              batch.update(doc(db, "invoices", inv.id), patch);
              Object.assign(inv, patch);
              data.appliedToInvoice = true;
              data.appliedAmount = pay;
            }
          }
        }
      }

      // Leaving Cleared (Bounced / Pending / Cancelled / Deposited)
      if(wasCleared && !nowCleared){
        if(r && r.applied){
          await reverseReceiptFromInvoices(r, data.status || "Pending", batch);
        }else if(prev?.appliedToInvoice && prev.invoice){
          const inv = invoices.find(i=> i.invNo === prev.invoice && i.customer === prev.customer);
          const pay = num(prev.appliedAmount || prev.amount);
          if(inv && pay > 0.009){
            const patch = invoiceMoneyPatch(inv, { paidDelta: -pay, updatedBy: who() });
            batch.update(doc(db, "invoices", inv.id), patch);
            Object.assign(inv, patch);
          }
          data.appliedToInvoice = false;
          data.appliedAmount = 0;
        }
      }

      if(chqId?.value) batch.update(doc(db,"cheques", chqId.value), data);
      else batch.set(doc(col("cheques")), { ...data, createdAt: Date.now() });
      await batch.commit();
      await logActivity({ action:"edit", staffName: who(), module:"Cheque", record: data.chequeNo, oldValue: prev?.status||"", newValue: data.status, summary: "Cheque " + data.chequeNo });
    })();
    commitWrite(write.then(()=> closeModal("chequeModal")), { okMsg: "Cheque saved" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function renderDiscounts(){
  const el = document.getElementById("discRows");
  if(!el) return;
  el.innerHTML = discounts.length ? discounts.map(d=> `<tr>
    <td>${esc(d.date)}</td><td>${esc(d.customer)}</td><td>${esc(d.type)}</td><td>${esc(d.ref)}</td>
    <td>${esc(d.method)}</td><td>${money(d.amount)}</td><td>${esc(d.reason)}</td><td>${esc(d.approvedBy)}</td>
    <td><button class="btn small danger" type="button" data-void-disc="${d.id}">Void</button></td>
  </tr>`).join("") : `<tr><td colspan="9" class="empty">No discounts</td></tr>`;
  el.querySelectorAll("[data-void-disc]").forEach(b=> b.onclick = ()=> voidDiscount(b.dataset.voidDisc));
}

function resetDisc(){
  const discDate = document.getElementById("discDate");
  const discAmt = document.getElementById("discAmt");
  const discRef = document.getElementById("discRef");
  const discReason = document.getElementById("discReason");
  const discType = document.getElementById("discType");
  const discMethod = document.getElementById("discMethod");
  const discCustomer = document.getElementById("discCustomer");
  if(discDate) discDate.value = today();
  if(discAmt) discAmt.value = "";
  if(discRef) discRef.value = "";
  if(discReason) discReason.value = "";
  if(discType) discType.value = "Invoice";
  if(discMethod) discMethod.value = "Fixed";
  if(discCustomer) customerOptions(discCustomer, "");
}

async function voidDiscount(id){
  if(!requireModule("discounts")) return;
  const d = discounts.find(x=> x.id === id);
  if(!d) return toast("Discount not found");
  const isInvoice = d.type === "Invoice" && String(d.ref || "").trim();
  const isPayment = d.type === "Payment";
  const linkedRv = isPayment
    ? receipts.find(r=>
        String(r.rvNo || "").trim() === String(d.ref || "").trim()
        && r.customer === d.customer
        && r.applied
        && receiptAffectsBalance(r)
      )
    : null;
  const msg = isInvoice
    ? `Void discount ${money(d.amount)} on invoice ${d.ref}?\nThis reverses invoice credited and removes it from the ledger.`
    : linkedRv
      ? `Void payment discount ${money(d.amount)} on receipt ${d.ref}?\nThis reverses invoice credited from that receipt discount and removes the ledger credit.`
      : `Void payment discount ${money(d.amount)} for ${d.customer}?\nThis removes the ledger credit only.`;
  if(!confirm(msg)) return;
  if(linkedRv && !requireAnyModule(["receipts","allocation"], "Receipt or allocation permission is required to reverse this payment discount on the receipt.")) return;
  try{
    const write = (async ()=>{
      const batch = writeBatch(db);
      if(isInvoice){
        const inv = invoices.find(i=> i.invNo === String(d.ref).trim() && i.customer === d.customer);
        if(inv){
          const patch = invoiceMoneyPatch(inv, { creditedDelta: -num(d.amount), updatedBy: who() });
          batch.update(doc(db, "invoices", inv.id), patch);
          Object.assign(inv, patch);
        }
      }else if(linkedRv){
        const allocs = linkedRv.allocations || [];
        const discShares = (allocs.length && num(d.amount) > 0)
          ? distributeProportionally(num(d.amount), allocs.map(a=> num(a.amount)))
          : [];
        for(let i = 0; i < allocs.length; i++){
          const a = allocs[i];
          const inv = invoices.find(x=> x.id === a.invoiceId);
          if(!inv) continue;
          const patch = invoiceMoneyPatch(inv, {
            creditedDelta: -(discShares[i] || 0),
            updatedBy: who()
          });
          batch.update(doc(db, "invoices", inv.id), patch);
          Object.assign(inv, patch);
        }
        const nextDisc = Math.max(0, roundMoney(num(linkedRv.discount) - num(d.amount)));
        batch.update(doc(db, "receipts", linkedRv.id), { discount: nextDisc, updatedAt: Date.now() });
        Object.assign(linkedRv, { discount: nextDisc });
      }
      batch.delete(doc(db, "discounts", d.id));
      await batch.commit();
      const idx = discounts.findIndex(x=> x.id === d.id);
      if(idx >= 0) discounts.splice(idx, 1);
      await logActivity({
        action: "void", staffName: who(), module: "Discount",
        record: d.ref || d.id, customer: d.customer, summary: "Voided discount", oldValue: money(d.amount)
      });
    })();
    commitWrite(write, { okMsg: "Discount voided" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function saveDisc(){
  if(!requireModule("discounts")) return;
  const discCustomer = document.getElementById("discCustomer");
  const discAmt = document.getElementById("discAmt");
  const discDate = document.getElementById("discDate");
  const discType = document.getElementById("discType");
  const discRef = document.getElementById("discRef");
  const discMethod = document.getElementById("discMethod");
  const discReason = document.getElementById("discReason");
  if(!discCustomer?.value) return toast("Select customer");
  const amount = num(discAmt?.value);
  if(amount <= 0) return toast("Enter amount");
  const type = discType?.value || "Invoice";
  const ref = (discRef?.value || "").trim();
  if(type === "Invoice"){
    if(!ref) return toast("Invoice type requires Reference = invoice number");
    const inv = invoices.find(i=> i.invNo === ref && i.customer === discCustomer.value);
    if(!inv) return toast("Invoice not found for this customer — check Reference");
    if(inv.status === "Draft") return toast("Cannot discount a draft invoice");
  }else if(type === "Payment"){
    const ok = confirm(
      "Payment discount credits the CUSTOMER LEDGER only (like an advance/write-off).\n" +
      "It will NOT reduce any invoice balance.\n\n" +
      "For invoice write-off, choose Type = Invoice and set Reference to the invoice no.\n\nContinue?"
    );
    if(!ok) return;
  }
  try{
    const write = (async ()=>{
      const batch = writeBatch(db);
      batch.set(doc(col("discounts")), {
        date: discDate?.value || today(), customer: discCustomer.value, type, ref,
        method: discMethod?.value || "Fixed", amount, reason: (discReason?.value || "").trim(),
        approvedBy: who(), createdAt: Date.now()
      });
      if(type === "Invoice" && ref){
        const inv = invoices.find(i=> i.invNo === ref && i.customer === discCustomer.value);
        if(inv){
          const patch = invoiceMoneyPatch(inv, { creditedDelta: amount });
          batch.update(doc(db,"invoices", inv.id), patch);
          Object.assign(inv, patch);
        }
      }
      await batch.commit();
      await logActivity({
        action: "add", staffName: who(), module: "Discount",
        record: ref || type, customer: discCustomer.value,
        summary: `${type} discount`, newValue: money(amount)
      });
    })();
    commitWrite(write.then(()=> closeModal("discModal")), { okMsg: "Discount saved" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function fillWhatsapp(){
  const name = document.getElementById("waCustomer").value || customers[0]?.name;
  const c = customers.find(x=> x.name === name);
  const due = customerOutstanding(name||"");
  const od = customerOverdue(name||"");
  const type = document.getElementById("waType")?.value || "Payment Reminder";
  let msg = `Dear ${name || "Customer"},\n\n`;
  if(type === "Statement") msg += `Please find your account statement.\nOutstanding: ${money(due)}.\nOverdue: ${money(od)}.`;
  else if(type === "Invoice") msg += `An invoice is ready for your account.\nCurrent outstanding: ${money(due)}.`;
  else msg += `Your current outstanding balance is ${money(due)}.\nOverdue: ${money(od)}.\n\nPlease arrange payment.`;
  msg += `\n\n${shop.name || ""}`;
  document.getElementById("waMsg").value = msg;
  document.getElementById("waSendBtn").dataset.mobile = (c?.whatsapp || c?.mobile || "").replace(/\D/g,"");
}

async function sendWhatsapp(){
  const mobile = document.getElementById("waSendBtn").dataset.mobile;
  const text = encodeURIComponent(document.getElementById("waMsg").value);
  if(!mobile) return toast("Add WhatsApp/mobile on customer");
  try{
    await openExternalUrl(`https://wa.me/${mobile}?text=${text}`);
  }catch(err){
    toast(String(err?.message || err));
  }
}

function showSettingsView(view){
  _currentSettingsView = view || "hub";
  const hub = document.getElementById("settingsHub");
  const subs = {
    company: document.getElementById("settingsCompany"),
    license: document.getElementById("settingsLicense"),
    help: document.getElementById("settingsHelp"),
    invoice: document.getElementById("settingsInvoice"),
    backup: document.getElementById("settingsBackup"),
    appearance: document.getElementById("settingsAppearance")
  };
  const showHub = !view || view === "hub";
  if(hub) hub.hidden = !showHub;
  Object.entries(subs).forEach(([key, el])=>{
    if(el) el.hidden = showHub || view !== key;
  });
  if(view === "license") refreshLicenseSettingsBox();
  if(view === "invoice"){
    wireInvoiceModeSettings();
    syncInvoiceModeSettingsUi();
  }
  if(view === "backup") renderBackupPage();
}

function fillSettings(){
  showSettingsView(_currentSettingsView);
  setName.value = shop.name||"";
  setPhone.value = shop.phone||"";
  setAddr.value = shop.addr||"";
  if(setTrn) setTrn.value = shop.trn||"";
  setCurrency.value = shop.currency || "AED";
  setCreditDays.value = shop.creditDays || 30;
  setInvPrefix.value = shop.invPrefix || "INV-";
  setRvPrefix.value = shop.rvPrefix || "RV-";
  setVat.value = shop.vatRate ?? 5;
}

async function refreshLicenseSettingsBox(){
  const box = document.getElementById("licenseStatusBox");
  const fpEl = document.getElementById("settingsLicenseFp");
  if(!box) return;
  try{
    const access = await getAccessStatus();
    _fullDeviceFingerprint = access.deviceFingerprint || "";
    if(fpEl) fpEl.textContent = access.maskedFingerprint || maskFingerprint(_fullDeviceFingerprint);

    if(access.mode === "license"){
      const p = access.payload || {};
      box.innerHTML = `<b>Licensed</b> — ${esc(p.customerName||"")}${p.shopName ? " · " + esc(p.shopName) : ""}<br>
        Plan: ${esc(p.plan)} · Status: ACTIVE<br>
        Expires: ${esc(p.expiresAt || "Lifetime")}`;
      return;
    }
    if(access.mode === "trial"){
      box.innerHTML = `<b>Free trial</b> — ${esc(String(access.daysRemaining))} day(s) left<br>
        Trial ends: ${esc((access.trialEndsAt||"").slice(0,10))}<br>
        <span class="muted">Activate a license anytime below (one PC → one key).</span>`;
      return;
    }
    box.innerHTML = `<b>Trial ended</b> — activate a license to continue.<br>
      <span class="muted">${esc(licenseErrorText(access.reason || "TRIAL_EXPIRED"))}</span>`;
  }catch(e){
    box.textContent = e.message || "License status unavailable";
  }
}

async function saveSettings(){
  if(!isOwnerRole()) return toast("Only owner can change settings");
  const data = {
    name: setName.value.trim(), phone: setPhone.value.trim(), addr: setAddr.value.trim(),
    trn: (setTrn?.value||"").trim(),
    currency: sanitizeCurrency(setCurrency.value), creditDays: num(setCreditDays.value),
    invPrefix: setInvPrefix.value.trim() || "INV-", rvPrefix: setRvPrefix.value.trim() || "RV-",
    vatRate: num(setVat.value)
  };
  try{
    await setDoc(doc(db,"shop","info"), data, { merge: true });
    const snap = await getDoc(doc(db,"shop","info"));
    shop = snap.data() || shop;
    syncTopShopName();
    toast("Settings saved");
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function renderTeam(){
  const el = document.getElementById("teamList");
  const panel = document.getElementById("invitePanel");
  const permPanel = document.getElementById("permPanel");
  if(!isOwnerRole()){
    const fg = panel?.querySelector(".form-grid");
    if(fg) fg.style.display = "none";
    closePermissions();
  }
  try{
    const { members, invites } = await listTeam();
    let html = `<div class="users-team-list">`;
    html += members.map(m=>{
      const actions = m.role==="staff"&&isOwnerRole()
        ? `<div class="users-team-actions">
            <button class="btn small" type="button" data-perm="${m.uid}" data-name="${esc(m.displayName||m.email)}">Permissions</button>
            <button class="btn small danger" type="button" data-rm="${m.uid}">Remove</button>
          </div>`
        : "";
      return `<article class="users-team-card">
        <div class="users-team-main">
          <b class="users-team-name">${esc(m.displayName || "—")}</b>
          <span class="muted users-team-email">${esc(m.email || "")}</span>
          <div class="users-team-meta">${badge(m.role)} ${badge(m.status)}</div>
        </div>
        ${actions}
      </article>`;
    }).join("");
    html += `</div>`;
    if(invites.length){
      html += `<p style="margin-top:12px"><b>Pending invites</b></p>` + invites.map(i=> `<div class="toolbar users-invite-row"><span>${esc(i.displayName)} · ${esc(i.email)}</span>${isOwnerRole()?`<button class="btn small" type="button" data-cancel="${i.id}">Cancel</button>`:""}</div>`).join("");
    }
    el.innerHTML = html;
    el.querySelectorAll("[data-cancel]").forEach(b=> b.onclick = async ()=>{ await cancelInvite(b.dataset.cancel); renderTeam(); });
    el.querySelectorAll("[data-rm]").forEach(b=> b.onclick = async ()=>{
      if(!confirm("Remove this staff?")) return;
      await deactivateStaff(b.dataset.rm); renderTeam();
    });
    el.querySelectorAll("[data-perm]").forEach(b=> b.onclick = async ()=>{
      const { members: ms } = await listTeam();
      const m = ms.find(x=> x.uid === b.dataset.perm || x.id === b.dataset.perm);
      openPermissions(m || { uid: b.dataset.perm, displayName: b.dataset.name, permissions: {} });
    });
  }catch(e){ el.innerHTML = `<p class="red">${esc(e.message)}</p>`; }
}

function closePermissions(){
  const users = document.getElementById("users");
  const panel = document.getElementById("permPanel");
  users?.classList.remove("users-perm-open");
  if(panel){
    panel.hidden = true;
    panel.style.display = "none";
  }
}

function openPermissions(m){
  if(!isOwnerRole()) return;
  const users = document.getElementById("users");
  const panel = document.getElementById("permPanel");
  if(!panel) return;
  panel.hidden = false;
  panel.style.display = "";
  users?.classList.add("users-perm-open");
  document.getElementById("permStaffUid").value = m.uid || m.id;
  document.getElementById("permStaffName").textContent = m.displayName || m.email || "Staff";
  const perms = { ...DEFAULT_STAFF_PERMISSIONS, ...(m.permissions || {}) };
  document.getElementById("permGrid").innerHTML = PERMISSION_LABELS.map(([key, label])=>
    `<label><input type="checkbox" data-perm-key="${key}" ${perms[key]?"checked":""}> ${esc(label)}</label>`
  ).join("");
  try{ panel.scrollTop = 0; }catch(_){}
  try{ window.scrollTo(0, 0); }catch(_){}
}

async function savePermissions(){
  if(!isOwnerRole()) return toast("Only owner");
  const uid = document.getElementById("permStaffUid").value;
  if(!uid) return;
  const permissions = {};
  document.querySelectorAll("#permGrid [data-perm-key]").forEach(inp=>{
    permissions[inp.dataset.permKey] = !!inp.checked;
  });
  try{
    await updateStaffPermissions(uid, permissions);
    toast("Permissions saved");
    await logActivity({ action:"edit", staffName: who(), module:"Users", record: uid, summary: "Permissions updated" });
  }catch(e){ toast(e.message); }
}

async function doInvite(){
  try{
    const email = inviteEmail.value.trim();
    const created = await inviteStaff({ email, displayName: inviteName.value.trim(), invitedByUid: getCurrentMember().uid });
    const cfg = await loadSavedFirebaseConfig();
    const box = document.getElementById("inviteCodeBox");
    const out = document.getElementById("inviteCodeOut");
    if(cfg && out && box){
      const code = buildInviteCode(cfg, created.email || email, created.inviteId || "");
      out.textContent = code;
      box.style.display = "block";
      drawInviteQr(code);
    }
    inviteEmail.value = ""; inviteName.value = "";
    toast("Invite saved — share the invite code / QR with staff");
    renderTeam();
  }catch(e){ toast(authErrorText(e.code || e.message, "en")); }
}

function drawInviteQr(text){
  const canvas = document.getElementById("inviteQrCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  if(ctx){
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#667085";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Loading QR…", canvas.width / 2, canvas.height / 2);
  }
  const run = ()=>{
    try{
      if(window.QRCode && typeof window.QRCode.toCanvas === "function"){
        window.QRCode.toCanvas(canvas, text, { width: 160, margin: 1, color: { dark: "#101828", light: "#ffffff" } }, err=>{
          if(err){
            console.error(err);
            if(ctx){
              ctx.fillStyle = "#fff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = "#d92d20";
              ctx.fillText("QR failed — copy code", canvas.width / 2, canvas.height / 2);
            }
          }
        });
      }
    }catch(e){ console.error(e); }
  };
  if(window.QRCode && typeof window.QRCode.toCanvas === "function"){ run(); return; }
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js";
  s.onload = run;
  s.onerror = ()=>{
    if(ctx){
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#d92d20";
      ctx.fillText("QR offline — copy code", canvas.width / 2, canvas.height / 2);
    }
  };
  document.head.appendChild(s);
}

async function wireFirebaseUsageLink(){
  const a = document.getElementById("firebaseUsageLink");
  if(!a) return;
  try{
    const cfg = await loadSavedFirebaseConfig();
    if(cfg?.projectId){
      a.href = `https://console.firebase.google.com/project/${encodeURIComponent(cfg.projectId)}/usage`;
    }
  }catch(_){}
}

function archiveCandidates(before){
  const invs = invoices.filter(i=> String(i.invDate || "") < before);
  const ids = new Set(invs.map(i=> i.id));
  const nos = new Set(invs.map(i=> i.invNo));
  const recs = receipts.filter(r=> String(r.date || "") < before || (r.allocations||[]).some(a=> ids.has(a.invoiceId)));
  const recNos = new Set(recs.map(r=> r.rvNo));
  const cns = creditNotes.filter(n=> String(n.date || "") < before || nos.has(n.invoice));
  const dns = debitNotes.filter(n=> String(n.date || "") < before);
  const chqs = cheques.filter(c=> String(c.chequeDate || c.pdcDate || "") < before || ids.has(c.receiptId));
  const discs = discounts.filter(d=>{
    const ref = String(d.ref || "").trim();
    return String(d.date || "") < before || nos.has(ref) || recNos.has(ref);
  });
  return { invs, recs, cns, dns, chqs, discs };
}

async function archiveExportCsv(){
  if(!isOwnerRole()) return toast("Only owner can archive");
  const before = document.getElementById("archiveBefore")?.value;
  if(!before) return toast("Select cutoff date");
  const { invs, recs, cns, dns, chqs, discs } = archiveCandidates(before);
  if(!invs.length && !recs.length && !cns.length && !dns.length && !chqs.length && !discs.length){
    return toast("No records before this date");
  }
  const result = await downloadCsv(`s4-archive-before-${before}.csv`,
    ["Type","Date","Ref","Customer","Amount","Extra"],
    [
      ...invs.map(i=> ["Invoice", i.invDate, i.invNo, i.customer, i.total, i.status]),
      ...recs.map(r=> ["Receipt", r.date, r.rvNo, r.customer, r.amount, r.method]),
      ...cns.map(n=> ["CreditNote", n.date, n.cnNo, n.customer, n.amount, n.invoice||""]),
      ...dns.map(n=> ["DebitNote", n.date, n.dnNo, n.customer, n.amount, ""]),
      ...chqs.map(c=> ["Cheque", c.chequeDate||c.pdcDate, c.chequeNo, c.customer, c.amount, c.status]),
      ...discs.map(d=> ["Discount", d.date, d.ref, d.customer, d.amount, d.type||""])
    ]
  );
  window._archiveReady = { before, ...archiveCandidates(before) };
  toast(deliveryToast(result, "CSV downloaded — now you can delete"));
}

async function archiveDeleteOld(){
  if(!isOwnerRole()) return toast("Only owner can archive");
  const before = document.getElementById("archiveBefore")?.value;
  if(!before) return toast("Select cutoff date");
  if(!window._archiveReady || window._archiveReady.before !== before){
    return toast("First download CSV for this cutoff date");
  }
  if(!confirm("This data will be permanently deleted. Did you already download the CSV?")) return;
  const word = prompt('Type DELETE to confirm permanent delete:');
  if(String(word || "").trim() !== "DELETE") return toast("Cancelled");
  const { invs, recs, cns, dns, chqs, discs } = window._archiveReady;
  try{
    const ops = [
      ...invs.map(i=> ({ col:"invoices", id:i.id })),
      ...recs.map(r=> ({ col:"receipts", id:r.id })),
      ...cns.map(n=> ({ col:"creditNotes", id:n.id })),
      ...dns.map(n=> ({ col:"debitNotes", id:n.id })),
      ...chqs.map(c=> ({ col:"cheques", id:c.id })),
      ...(discs || []).map(d=> ({ col:"discounts", id:d.id }))
    ].filter(o=> o.id);
    for(let i = 0; i < ops.length; i += 400){
      const batch = writeBatch(db);
      ops.slice(i, i + 400).forEach(o=> batch.delete(doc(db, o.col, o.id)));
      await batch.commit();
    }
    await logActivity({
      action: "archive-delete",
      staffName: who(),
      module: "Reports",
      summary: `Archived and deleted ${invs.length} invoices before ${before}`
    });
    window._archiveReady = null;
    toast(`Deleted ${ops.length} documents`);
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function csvCell(v){ return `"${String(v??"").replace(/"/g,'""')}"`; }

async function downloadCsv(filename, header, rows){
  const csv = [header.map(csvCell).join(","), ...rows.map(r=> r.map(csvCell).join(","))].join("\n");
  const result = await deliverText(filename, "\uFEFF" + csv, "text/csv;charset=utf-8", filename);
  return result;
}

async function exportAudit(){
  const rows = window._auditRows || [];
  if(!rows.length) return toast("No audit rows");
  const result = await downloadCsv("s4-audit.csv",
    ["Date/Time","User","Module","Action","Record","Old Value","New Value","Reason"],
    rows.map(r=>{
      const f = formatActivityRow(r, "en");
      return [f.when, f.who, r.module||"", r.action||"", r.record||r.invoiceId||"", r.oldValue||"", r.newValue||"", r.reason||f.what];
    })
  );
  toast(deliveryToast(result, "Audit CSV downloaded"));
}

function statementTableHtml(name, asOf, from){
  const built = buildStatementRows(name, asOf, from || "");
  const range = from ? `From ${esc(from)} · ` : "";
  return `<p class="muted">${esc(shop.name||"")} · ${range}As of ${esc(asOf)} · Closing ${money(built.closing)}</p>` +
    tableFromRows(["Date","Reference","Description","Debit","Credit","Balance"], built.dataRows);
}

async function exportStatementPdf(download){
  const name = document.getElementById("stmtCustomer").value;
  const asOf = document.getElementById("stmtAsOf")?.value || today();
  const from = document.getElementById("stmtFrom")?.value || "";
  if(!name) return toast("Select customer");
  fillStatement();
  const title = `Statement — ${name}`;
  const body = statementTableHtml(name, asOf, from);
  const built = buildStatementRows(name, asOf, from);
  if(download){
    try{
      const result = await downloadStatementPdf({ shop, name, asOf, from, lines: built.dataRows, closing: built.closing });
      toast(deliveryToast(result, "PDF downloaded"));
    }catch(err){
      console.warn("Statement PDF failed", err);
      toast(String(err?.message || err));
    }
    return;
  }
  // Android WebView has no print dialog — share a real PDF instead
  if(isAndroidNative()){
    try{
      const result = await downloadStatementPdf({ shop, name, asOf, from, lines: built.dataRows, closing: built.closing });
      toast(deliveryToast(result, "PDF ready — open it to print"));
      return;
    }catch(err){
      console.warn("Statement Android print-PDF failed", err);
    }
  }
  try{
    const printed = await printHtmlDocument(title, body);
    if(!printed) toast("File ready — open it to print or share");
  }catch(err){
    console.warn("Statement print failed", err);
    await downloadHtmlDocument(`statement-${name.replace(/\s+/g,"_")}.html`, title, body);
    toast("Print blocked — file ready instead");
  }
}

async function exportLatestInvoicePdf(){
  const inv = [...invoices].filter(i=> i.status !== "Draft").sort((a,b)=> String(b.invDate).localeCompare(String(a.invDate)))[0];
  if(!inv) return toast("No invoice");
  try{
    const result = await downloadInvoicePdf(inv, shop);
    toast(deliveryToast(result, "PDF downloaded"));
  }catch(err){
    console.warn("Invoice PDF failed", err);
    toast(String(err?.message || err));
  }
}

async function exportReceiptPdf(r){
  if(!r) return toast("No receipt");
  try{
    const result = await downloadReceiptPdf(r, shop);
    toast(deliveryToast(result, "PDF downloaded"));
  }catch(err){
    console.warn("Receipt PDF failed", err);
    toast(String(err?.message || err));
  }
}

async function exportReceiptPdfById(id){
  const r = receipts.find(x=> x.id === id);
  if(!r) return toast("Receipt not found");
  return exportReceiptPdf(r);
}

async function downloadWaPdf(){
  const type = document.getElementById("waType")?.value || "Payment Reminder";
  const name = document.getElementById("waCustomer").value;
  try{
    if(type === "Statement" && name){
      document.getElementById("stmtCustomer").value = name;
      await exportStatementPdf(true);
    }else if(type === "Invoice"){
      await exportLatestInvoicePdf();
    }else{
      const msg = document.getElementById("waMsg")?.value || "";
      const result = await downloadReminderPdf(shop, name, msg);
      toast(deliveryToast(result, "PDF downloaded"));
    }
  }catch(err){
    toast(String(err?.message || err));
  }
}

async function exportLedger(kind){
  const name = document.getElementById("ledgerCustomer").value;
  if(!name) return toast("Select customer");
  const from = document.getElementById("ledgerFrom")?.value || "";
  const to = document.getElementById("ledgerTo")?.value || "";
  const lines = ledgerLines(name).filter(l=> (!from || l.date >= from) && (!to || l.date <= to));
  let bal = 0;
  const rows = lines.map(l=>{
    bal += l.debit - l.credit;
    return [l.date, l.ref, l.desc, l.debit||"", l.credit||"", bal];
  });
  if(kind === "csv"){
    const result = await downloadCsv(`ledger-${name.replace(/\s+/g,"_")}.csv`, ["Date","Reference","Description","Debit","Credit","Balance"], rows);
    toast(deliveryToast(result, "Ledger CSV downloaded"));
  }else{
    try{
      const range = [from ? "From " + from : "", to ? "To " + to : ""].filter(Boolean).join(" · ");
      const result = await downloadTablePdf({
        shop,
        title: `Ledger — ${name}`,
        subtitle: range,
        headers: ["Date","Reference","Description","Debit","Credit","Balance"],
        rows: rows.map(r => r.map(c => c === "" || c == null ? "" : String(c))),
        filename: `ledger-${name}`
      });
      toast(deliveryToast(result, "Ledger PDF downloaded"));
    }catch(err){
      console.warn("Ledger PDF failed", err);
      const body = tableFromRows(["Date","Reference","Description","Debit","Credit","Balance"], rows);
      await downloadHtmlDocument(`ledger-${name.replace(/\s+/g,"_")}.html`, `Ledger — ${name}`, body);
      toast("PDF failed — HTML file ready instead");
    }
  }
}

async function exportAging(kind){
  const map = {};
  invoices.forEach(i=>{
    const name = i.customer || "—";
    if(!map[name]) map[name] = { current:0, d30:0, d60:0, d90:0, d90p:0 };
    const k = agingBucket(i);
    if(k) map[name][k] += invBalance(i);
  });
  const rows = Object.entries(map).map(([name,x])=>{
    const tot = x.current+x.d30+x.d60+x.d90+x.d90p;
    if(tot<=0) return null;
    return [name, x.current, x.d30, x.d60, x.d90, x.d90p, tot];
  }).filter(Boolean);
  if(kind === "csv"){
    const result = await downloadCsv("aging.csv", ["Customer","Current","1-30","31-60","61-90","90+","Total"], rows);
    toast(deliveryToast(result, "Aging CSV downloaded"));
  }else{
    try{
      const result = await downloadTablePdf({
        shop,
        title: "Receivable Aging",
        subtitle: shop.name || "",
        headers: ["Customer","Current","1-30","31-60","61-90","90+","Total"],
        rows: rows.map(r => r.map(c => String(c))),
        filename: "aging"
      });
      toast(deliveryToast(result, "Aging PDF downloaded"));
    }catch(err){
      console.warn("Aging PDF failed", err);
      const body = tableFromRows(["Customer","Current","1-30","31-60","61-90","90+","Total"], rows);
      await downloadHtmlDocument("aging.html", "Receivable Aging", body);
      toast("PDF failed — HTML file ready instead");
    }
  }
}

function runGlobalSearch(q){
  if(!q) return;
  const ql = q.toLowerCase();
  const hits = [];
  invoices.forEach(i=>{
    if(`${i.invNo} ${i.customer} ${i.vehicle} ${i.lpo} ${i.manualNo||""} ${i.computerNo||""}`.toLowerCase().includes(ql))
      hits.push({ type:"Invoice", ref:i.invNo, detail:i.customer, page:"invoices", go:()=>{ showPage("invoices"); invoiceSearch.value=q; renderInvoices(); }});
  });
  customers.forEach(c=>{
    if(`${c.code} ${c.name} ${c.mobile} ${c.trn} ${c.contact}`.toLowerCase().includes(ql))
      hits.push({ type:"Customer", ref:c.code||c.name, detail:c.name, page:"customers", go:()=>{ showPage("customers"); customerSearch.value=q; renderCustomers(); }});
  });
  vehicles.forEach(v=>{
    if(`${v.plate} ${v.vin} ${v.make} ${v.model} ${v.customer} ${v.engine}`.toLowerCase().includes(ql))
      hits.push({ type:"Vehicle", ref:v.plate, detail:`${v.make} ${v.model} · ${v.vin||""}`, page:"vehicles", go:()=>{ showPage("vehicles"); const s=document.getElementById("vehicleSearch"); if(s){ s.value=v.plate||q; renderVehicles(); } }});
  });
  products.forEach(p=>{
    if(`${p.name} ${p.code} ${p.category}`.toLowerCase().includes(ql))
      hits.push({ type:"Product", ref:p.code||p.name, detail:p.name, page:"product-catalog", go:()=>{ showPage("product-catalog"); const s=document.getElementById("productSearch"); if(s){ s.value=q; renderProducts(); } }});
  });
  services.forEach(s=>{
    if(`${s.name} ${s.category}`.toLowerCase().includes(ql))
      hits.push({ type:"Service", ref:s.name, detail:s.category||"Service", page:"service-catalog", go:()=>{ showPage("service-catalog"); const el=document.getElementById("serviceSearch"); if(el){ el.value=q; renderServices(); } }});
  });
  cheques.forEach(c=>{
    if(`${c.chequeNo} ${c.customer} ${c.bank}`.toLowerCase().includes(ql))
      hits.push({ type:"Cheque", ref:c.chequeNo, detail:c.customer, page:"cheques", go:()=> showPage("cheques") });
  });
  receipts.forEach(r=>{
    if(`${r.rvNo} ${r.customer} ${r.chequeNo} ${r.ref}`.toLowerCase().includes(ql))
      hits.push({ type:"Receipt", ref:r.rvNo, detail:r.customer, page:"receipts", go:()=>{ showPage("receipts"); if(receiptSearch){ receiptSearch.value=q; renderReceipts(); }}});
  });
  const box = document.getElementById("searchResults");
  const overlay = document.getElementById("searchOverlay");
  if(!hits.length){
    box.innerHTML = `<p class="empty">No matches for “${esc(q)}”</p>`;
  }else{
    box.innerHTML = `<table class="table"><thead><tr><th>Type</th><th>Reference</th><th>Detail</th></tr></thead><tbody>` +
      hits.slice(0,40).map((h,i)=> `<tr data-hit="${i}" style="cursor:pointer"><td>${esc(h.type)}</td><td>${esc(h.ref)}</td><td>${esc(h.detail)}</td></tr>`).join("") +
      `</tbody></table>`;
    box.querySelectorAll("[data-hit]").forEach(tr=>{
      tr.onclick = ()=>{ overlay.hidden = true; hits[Number(tr.dataset.hit)].go(); };
    });
  }
  overlay.hidden = false;
}

function refreshNotifications(){
  const items = [];
  if(window._s4ExpiryBanner){
    items.push({
      title: window._s4ExpiryBanner.title,
      detail: window._s4ExpiryBanner.detail,
      page: "settings"
    });
  }
  const overdue = invoices.filter(i=> invStatus(i) === "Overdue");
  if(overdue.length) items.push({ title:`${overdue.length} overdue invoice(s)`, detail: money(overdue.reduce((s,i)=>s+invBalance(i),0)), page:"aging" });
  const pendingChq = cheques.filter(c=> c.status === "Pending" || c.status === "Deposited");
  if(pendingChq.length) items.push({ title:`${pendingChq.length} pending cheque(s)`, detail: money(pendingChq.reduce((s,c)=>s+num(c.amount),0)), page:"cheques" });
  const unalloc = receipts.filter(r=> num(r.unallocated) > 0.009 && receiptAffectsBalance(r));
  if(unalloc.length) items.push({ title:`${unalloc.length} unallocated receipt(s)`, detail: money(unalloc.reduce((s,r)=>s+num(r.unallocated),0)), page:"allocation" });
  const hold = customers.filter(c=> c.status === "Hold" || c.status === "Blocked");
  if(hold.length) items.push({ title:`${hold.length} customer(s) on hold/blocked`, detail:"", page:"customers" });
  const countEl = document.getElementById("notifCount");
  const list = document.getElementById("notifList");
  if(countEl){
    countEl.textContent = String(items.length);
    countEl.hidden = items.length === 0;
  }
  if(list){
    list.innerHTML = items.length
      ? items.map(it=> `<div class="notif-item" data-page="${it.page}"><b>${esc(it.title)}</b><span class="muted">${esc(it.detail)}</span></div>`).join("")
      : `<div class="notif-item muted">No alerts</div>`;
    list.querySelectorAll("[data-page]").forEach(el=>{
      el.onclick = ()=>{
        document.getElementById("notifPanel").hidden = true;
        if(el.dataset.page === "settings"){
          showPage("settings");
          showSettingsView("help");
        }else{
          showPage(el.dataset.page);
        }
      };
    });
  }
}

function renderBackupPage(){
  const hist = loadBackupHistory();
  const last = hist[0];
  const cards = document.getElementById("backupCards");
  if(cards){
    cards.innerHTML = [
      ["LAST BACKUP", last ? new Date(last.at).toLocaleString() : "—", last ? last.status : "None yet"],
      ["BACKUP SIZE", last ? formatBytes(last.size) : "—", last?.name || ""],
      ["RETENTION", "40 local entries", "Drive folder keeps files"]
    ].map(([a,b,c])=> `<div class="card"><div class="metric-label">${a}</div><div class="metric" style="font-size:17px">${esc(b)}</div><div class="metric-note">${esc(c)}</div></div>`).join("");
  }
  const rows = document.getElementById("backupHistoryRows");
  if(rows){
    rows.innerHTML = hist.length ? hist.map(h=> `<tr>
      <td>${esc(new Date(h.at).toLocaleString())}</td><td>${esc(h.type)}</td><td>${esc(formatBytes(h.size))}</td>
      <td>${badge(h.status||"Successful")}</td>
      <td>${h.driveId?`<button class="btn small" type="button" data-dl="${h.driveId}">Open list</button>`:"—"}</td>
    </tr>`).join("") : `<tr><td colspan="5" class="empty">No local backup history yet</td></tr>`;
    rows.querySelectorAll("[data-dl]").forEach(b=> b.onclick = ()=> refreshDriveBackupList());
  }
  const st = document.getElementById("driveBackupStatus");
  if(st){
    st.textContent = isDriveBackupConfigured()
      ? "Drive Client ID ready. Firebase remains the main database."
      : "Paste Google OAuth Web Client ID to enable Drive backups.";
  }
}

async function refreshDriveBackupList(){
  const el = document.getElementById("restoreList");
  if(!isDriveBackupConfigured()){
    el.innerHTML = `<p class="muted">Save a Google OAuth Client ID first.</p>`;
    return;
  }
  try{
    const list = await listBackups();
    el.innerHTML = `<p class="muted" style="margin:12px 0 8px">Drive folder files</p>` +
      (list.length ? `<table class="table"><thead><tr><th>Name</th><th>Date</th><th>Size</th></tr></thead><tbody>` +
        list.map(f=> `<tr><td>${esc(f.name)}</td><td>${esc(f.createdTime?new Date(f.createdTime).toLocaleString():"—")}</td><td>${esc(formatBytes(f.size))}</td></tr>`).join("") +
        `</tbody></table>` : `<p class="muted">No backups on Drive</p>`);
  }catch(e){ toast(e.message); }
}

function initReportPeriodControls(){
  const y = document.getElementById("rptYear");
  const m = document.getElementById("rptMonth");
  if(y && !y.value) y.value = new Date().getFullYear();
  if(m && (m.value === "" || m.selectedIndex < 0)) m.value = String(new Date().getMonth());
}

function runPeriodReport(){
  initReportPeriodControls();
  const mode = document.getElementById("rptMode").value;
  const year = num(document.getElementById("rptYear").value) || new Date().getFullYear();
  const monthIndex0 = num(document.getElementById("rptMonth").value);
  const posted = invoices.filter(i=> i.status !== "Draft");
  const bundle = buildReportBundle(posted, mode, year, monthIndex0);
  window._periodBundle = bundle;
  const panel = document.getElementById("reportPanel");
  const htmlBox = document.getElementById("periodReportHtml");
  const head = document.getElementById("reportHead");
  const body = document.getElementById("reportRows");
  panel.style.display = "";
  document.getElementById("reportTitle").textContent = bundle.titleEn;
  htmlBox.style.display = "";
  htmlBox.innerHTML = renderReportHtml(bundle, "en", cur());
  head.innerHTML = "";
  body.innerHTML = "";
}

async function exportPeriodCsv(){
  const mode = document.getElementById("rptMode").value;
  const year = num(document.getElementById("rptYear").value) || new Date().getFullYear();
  const monthIndex0 = num(document.getElementById("rptMonth").value);
  const posted = invoices.filter(i=> i.status !== "Draft");
  const bundle = window._periodBundle || buildReportBundle(posted, mode, year, monthIndex0);
  const result = await downloadTextFile(`s4-report-${year}.csv`, invoicesToCsv(bundle.periodInvoices, "en"));
  toast(deliveryToast(result, "Period CSV downloaded"));
}

async function exportCurrentReportCsv(){
  if(window._periodBundle) return exportPeriodCsv();
  const title = (document.getElementById("reportTitle").textContent || "report").toLowerCase();
  if(title.includes("outstanding")){
    const names = [...new Set(customers.map(c=> c.name).concat(invoices.map(i=> i.customer)))].filter(Boolean);
    const result = await downloadCsv("outstanding.csv", ["Customer","Open","Outstanding","Overdue"],
      names.map(n=> [n, invoices.filter(i=> i.customer===n && invBalance(i)>0).length, customerOutstanding(n), customerOverdue(n)]).filter(r=> r[2]>0.009 || r[3]>0.009));
    toast(deliveryToast(result, "CSV downloaded"));
  }else if(title.includes("sales")){
    const result = await downloadCsv("sales.csv", ["Invoice","Date","Customer","Total","Paid","Balance"],
      invoices.filter(i=> i.status!=="Draft").map(i=> [i.invNo, i.invDate, i.customer, i.total, i.paid, invBalance(i)]));
    toast(deliveryToast(result, "CSV downloaded"));
  }else if(title.includes("collection")){
    const result = await downloadCsv("collection.csv", ["Receipt","Date","Customer","Method","Amount","Status"],
      receipts.map(r=> [r.rvNo, r.date, r.customer, r.method, r.amount, r.status]));
    toast(deliveryToast(result, "CSV downloaded"));
  }else toast("Run a report first");
}

function showReport(type){
  const panel = document.getElementById("reportPanel");
  const head = document.getElementById("reportHead");
  const body = document.getElementById("reportRows");
  const title = document.getElementById("reportTitle");
  const htmlBox = document.getElementById("periodReportHtml");
  if(htmlBox){ htmlBox.style.display = "none"; htmlBox.innerHTML = ""; }
  window._periodBundle = null;
  if(!panel) return;
  panel.style.display = "";
  if(type === "outstanding"){
    title.textContent = "Outstanding Report";
    head.innerHTML = `<tr><th>Customer</th><th>Open Invoices</th><th>Outstanding</th><th>Overdue</th></tr>`;
    const names = [...new Set(customers.map(c=> c.name).concat(invoices.map(i=> i.customer)))].filter(Boolean);
    const rows = names.map(n=>{
      const open = invoices.filter(i=> i.customer===n && i.status!=="Draft" && invBalance(i)>0).length;
      const due = customerOutstanding(n);
      const od = customerOverdue(n);
      if(due <= 0.009 && od <= 0.009 && !open) return "";
      return `<tr><td>${esc(n)}</td><td>${open}</td><td>${money(due)}</td><td class="${od?"red":""}">${money(od)}</td></tr>`;
    }).filter(Boolean);
    body.innerHTML = rows.join("") || `<tr><td colspan="4" class="empty">No outstanding</td></tr>`;
  }else if(type === "sales"){
    title.textContent = "Sales Report";
    head.innerHTML = `<tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr>`;
    const list = invoices.filter(i=> i.status !== "Draft").sort((a,b)=> String(b.invDate).localeCompare(String(a.invDate)));
    body.innerHTML = list.length ? list.map(i=> `<tr>
      <td>${esc(i.invNo)}</td><td>${esc(i.invDate)}</td><td>${esc(i.customer)}</td><td>${esc(i.vehicle)}</td>
      <td>${money(i.total)}</td><td>${money(i.paid)}</td><td>${money(invBalance(i))}</td><td>${badge(invStatus(i))}</td>
    </tr>`).join("") : `<tr><td colspan="8" class="empty">No sales</td></tr>`;
  }else if(type === "collection"){
    title.textContent = "Collection Report";
    head.innerHTML = `<tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th></tr>`;
    const list = receipts.filter(r=> r.status !== "Cancelled").sort((a,b)=> String(b.date).localeCompare(String(a.date)));
    body.innerHTML = list.length ? list.map(r=> `<tr>
      <td>${esc(r.rvNo)}</td><td>${esc(r.date)}</td><td>${esc(r.customer)}</td><td>${esc(r.method)}</td>
      <td>${money(r.amount)}</td><td>${badge(r.status||"Posted")}</td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty">No collections</td></tr>`;
  }
}
