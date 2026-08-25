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
import { printHtmlDocument, downloadHtmlDocument, tableFromRows } from "./doc-export.js";
import { buildReportBundle, renderReportHtml, invoicesToCsv, downloadTextFile } from "./reports.js";
import {
  getAccessStatus, activateLicense, licenseErrorText, maskFingerprint
} from "./license.js";

let db = null;
let shop = {};
let member = null;
let _fullDeviceFingerprint = "";
const unsubs = [];
let customers = [];
let vehicles = [];
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
let _invoiceLineItems = [];
let _invoiceEntryModeMem = null;
let _currentSettingsView = "hub";

function col(name){ return collection(db, name); }
function today(){ return new Date().toISOString().slice(0,10); }
function num(v){ return Number(v) || 0; }
function esc(s){ return String(s||"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function cur(){ return shop.currency || "AED"; }
function money(n){ return cur() + " " + num(n).toLocaleString("en-AE", { maximumFractionDigits: 2 }); }
function who(){ return member?.displayName || "User"; }
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
    return "Firebase স্টোরেজ (1GB ফ্রি লিমিট) শেষ হয়ে গেছে। নতুন ডেটা সেভ হচ্ছে না। Firebase Console-এ গিয়ে Blaze প্ল্যানে upgrade করুন অথবা পুরনো ডেটা মুছে জায়গা খালি করুন।";
  }
  if(code === "permission-denied" || /insufficient permissions|permission.?denied/i.test(msg)){
    return "Permission নেই — email verify হয়েছে কি? Firebase Console-এ firestore.rules Publish করেছেন কি? Logout করে আবার Login করুন।";
  }
  return msg || "Save failed";
}
function isAppOnline(){
  try{ return navigator.onLine !== false; }catch(_){ return true; }
}
/** Fire Firestore write without blocking UI; toast now, report failures later. */
function commitWrite(writePromise, { okMsg = "Saved", offlineMsg = "সেভ হয়েছে — অনলাইনে এলে sync হবে" } = {}){
  toast(isAppOnline() ? okMsg : offlineMsg);
  Promise.resolve(writePromise).catch(err=>{
    console.error("Firestore write failed:", err);
    toast(friendlyFirestoreError(err));
  });
  return writePromise;
}
function openModal(id){
  try{
    document.documentElement.scrollLeft = 0;
    window.scrollTo({ left: 0, behavior: "auto" });
  }catch(_){}
  document.getElementById(id).classList.add("open");
}
function closeModal(id){ document.getElementById(id).classList.remove("open"); }

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

  const sidebar = document.getElementById("sidebar");
  if(sidebar?.classList.contains("open")){
    sidebar.classList.remove("open");
    return true;
  }

  const active = document.querySelector(".page.active");
  if(active && active.id !== "dashboard"){
    showPage("dashboard");
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

function showPage(id){
  if(!memberCan(member, id) && id !== "dashboard"){
    toast("No permission for this module");
    return;
  }
  document.querySelectorAll(".page").forEach(p=> p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".nav button[data-page]").forEach(n=> n.classList.toggle("active", n.dataset.page === id));
  document.getElementById("sidebar").classList.remove("open");
  const backBtn = document.getElementById("mobileBackBtn");
  if(backBtn) backBtn.hidden = (id === "dashboard");
  if(id === "ledger") fillLedger();
  if(id === "statements") fillStatement();
  if(id === "allocation") fillAllocSelect();
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

function invBalance(inv){ return Math.max(0, num(inv.total) - num(inv.paid) - num(inv.credited)); }

function receiptAffectsBalance(r){
  return !["Cancelled", "Bounced", "Pending", "Deposited"].includes(r.status || "Posted");
}

function invStatus(inv){
  if(inv.status === "Draft") return "Draft";
  const bal = invBalance(inv);
  if(bal <= 0.009) return "Paid";
  if(inv.dueDate && inv.dueDate < today() && bal > 0) return "Overdue";
  if(num(inv.paid) > 0) return "Partial";
  return inv.status || "Posted";
}

function badge(st){
  const cls = st === "Paid" || st === "Active" || st === "Posted" || st === "Cleared" ? "green"
    : st === "Overdue" || st === "Blocked" || st === "Bounced" ? "red"
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
  selectEl.innerHTML = `<option value="">Select…</option>` + customers.map(c=>
    `<option value="${esc(c.name)}" ${c.name===selected?"selected":""}>${esc(c.name)}</option>`
  ).join("");
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
  document.getElementById("app").classList.add("visible");
  document.getElementById("userName").textContent = member?.displayName || "User";
  document.getElementById("userRole").textContent = member?.role === "owner" ? "Owner" : "Staff";
  document.getElementById("userAvatar").textContent = (member?.displayName || "U").slice(0,2).toUpperCase();
  syncTopShopName();
  bindUi();
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
  listen("customers", rows => { customers = rows; renderCustomers(); refreshSelects(); renderDashboard(); });
  listen("vehicles", rows => { vehicles = rows; refreshSelects(); });
  listen("invoices", rows => { invoices = rows; renderInvoices(); renderCustomers(); renderDashboard(); renderAging(); fillLedger(); fillStatement(); fillAllocSelect(); refreshNotifications(); });
  listen("receipts", rows => { receipts = rows; renderReceipts(); renderCustomers(); renderDashboard(); fillAllocSelect(); fillLedger(); fillStatement(); refreshNotifications(); });
  listen("creditNotes", rows => { creditNotes = rows; renderNotes("cnRows", creditNotes, "cnNo"); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); });
  listen("debitNotes", rows => { debitNotes = rows; renderNotes("dnRows", debitNotes, "dnNo"); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); });
  listen("cheques", rows => { cheques = rows; renderCheques(); renderCustomers(); renderDashboard(); refreshNotifications(); });
  listen("discounts", rows => { discounts = rows; renderDiscounts(); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); });
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
  const msg = document.getElementById("gateLicenseMsg");
  if(msg) msg.textContent = licenseErrorText(access.reason || "TRIAL_EXPIRED");
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
  }, err=> toast(friendlyFirestoreError(err))));
}

function bindUi(){
  if(uiBound) return;
  uiBound = true;
  wireAppBackControls();
  document.querySelectorAll("[data-page]").forEach(n=>{
    n.onclick = ()=> showPage(n.dataset.page);
  });
  document.querySelectorAll("[data-open]").forEach(b=>{
    b.onclick = ()=> {
      if(b.dataset.open === "invoiceModal") openNewInvoice();
      if(b.dataset.open === "receiptModal") resetReceipt();
      if(b.dataset.open === "customerModal") resetCustomer();
      if(b.dataset.open === "cnModal") resetCn();
      if(b.dataset.open === "dnModal") resetDn();
      if(b.dataset.open === "chequeModal") resetCheque();
      if(b.dataset.open === "discModal") resetDisc();
      openModal(b.dataset.open);
    };
  });
  document.querySelectorAll("[data-close]").forEach(b=> b.onclick = ()=>{
    if(b.dataset.close === "invoiceModal") saveInvoiceWip();
    closeModal(b.dataset.close);
  });
  document.querySelectorAll(".drawer").forEach(d=> d.addEventListener("click", e=>{
    if(e.target === d){
      if(d.id === "invoiceModal") saveInvoiceWip();
      d.classList.remove("open");
    }
  }));
  document.getElementById("menu").onclick = ()=> document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("saveCustomerBtn").onclick = saveCustomer;
  document.getElementById("saveInvoiceBtn").onclick = ()=> saveInvoice("Posted");
  document.getElementById("draftInvoiceBtn").onclick = ()=> saveInvoice("Draft");
  document.getElementById("deleteInvoiceBtn")?.addEventListener("click", ()=>{
    if(invId.value) deleteInvoice(invId.value);
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
  document.getElementById("waStmtBtn")?.addEventListener("click", ()=>{
    const stmtCust = document.getElementById("stmtCustomer").value;
    try{ exportStatementPdf(true); }catch(_){}
    showPage("communication");
    const wt = document.getElementById("waType");
    if(wt) wt.value = "Statement";
    if(stmtCust) document.getElementById("waCustomer").value = stmtCust;
    fillWhatsapp();
    toast("PDF downloaded — attach it in WhatsApp");
  });
  document.getElementById("genStmtBtn")?.addEventListener("click", fillStatement);
  document.getElementById("waSendBtn").onclick = sendWhatsapp;
  document.getElementById("waAttachPdfBtn")?.addEventListener("click", ()=> downloadWaPdf());
  document.getElementById("qaInvoicePdf")?.addEventListener("click", ()=> exportLatestInvoicePdf());
  document.getElementById("qaStatementPdf")?.addEventListener("click", ()=>{ showPage("statements"); exportStatementPdf(true); });
  document.getElementById("qaReceiptPdf")?.addEventListener("click", ()=> exportLatestReceiptPdf());
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
  document.getElementById("exportAuditBtn")?.addEventListener("click", exportAudit);
  document.getElementById("exportLedgerCsvBtn")?.addEventListener("click", ()=> exportLedger("csv"));
  document.getElementById("exportLedgerPdfBtn")?.addEventListener("click", ()=> exportLedger("pdf"));
  document.getElementById("exportAgingCsvBtn")?.addEventListener("click", ()=> exportAging("csv"));
  document.getElementById("exportAgingPdfBtn")?.addEventListener("click", ()=> exportAging("pdf"));
  document.getElementById("runPeriodReportBtn")?.addEventListener("click", runPeriodReport);
  document.getElementById("exportPeriodCsvBtn")?.addEventListener("click", exportPeriodCsv);
  document.getElementById("exportReportCsvBtn")?.addEventListener("click", exportCurrentReportCsv);
  document.querySelectorAll("[data-report]").forEach(b=> b.onclick = ()=> showReport(b.dataset.report));
  document.getElementById("printReportBtn")?.addEventListener("click", ()=>{
    const html = document.getElementById("periodReportHtml");
    if(html && html.style.display !== "none" && html.innerHTML){
      printHtmlDocument(document.getElementById("reportTitle").textContent, html.innerHTML);
    }else window.print();
  });
  document.getElementById("allocReceipt").onchange = fillAllocRows;
  document.getElementById("saveAllocBtn").onclick = saveAllocation;
  document.getElementById("rvCustomer").onchange = fillRvAlloc;
  document.getElementById("rvAmount")?.addEventListener("input", fillRvAlloc);
  document.getElementById("rvMethod")?.addEventListener("change", ()=>{
    const m = rvMethod.value || "";
    if(rvStatus) rvStatus.value = m.includes("Cheque") ? "Pending" : "Posted";
  });
  document.getElementById("cnCustomer")?.addEventListener("change", ()=> fillNoteInvoices(cnInvoice, cnCustomer.value));
  document.getElementById("cnInvoice")?.addEventListener("change", ()=>{
    const inv = invoices.find(i=> i.invNo === cnInvoice.value);
    if(inv && !num(cnAmount.value)) cnAmount.value = invBalance(inv);
  });
  document.getElementById("invCustomer").onchange = ()=>{
    filterVehiclesForInvoice();
    queueInvoiceWipSave();
  };
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
    const p = document.getElementById("notifPanel");
    p.hidden = !p.hidden;
  });
  document.addEventListener("click", ()=>{
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
      if(!isOwnerRole()) return toast("Only owner can run backup");
      const payload = buildBackupSnapshot({ shop, invoices, customers, vehicles, receipts, creditNotes, debitNotes, cheques, discounts });
      const size = new Blob([JSON.stringify(payload)]).size;
      const name = `s4-backup-${today()}.json`;
      const file = await backupToDrive(name, payload);
      recordBackupHistory({ at: Date.now(), name: file.name || name, size, type: "Manual", status: "Successful", driveId: file.id || "" });
      toast("Backup saved to Drive");
      renderBackupPage();
    }catch(e){ toast(e.message || String(e)); }
  };
  document.getElementById("driveRestoreBtn").onclick = async ()=>{
    await refreshDriveBackupList();
  };
  document.getElementById("localBackupBtn")?.addEventListener("click", async ()=>{
    try{
      if(!isOwnerRole()) return toast("Only owner can run local backup");
      const res = await saveLocalBackup({ shop, invoices, customers, vehicles, receipts, creditNotes, debitNotes, cheques, discounts });
      recordBackupHistory({ at: Date.now(), name: res.filename, size: res.size, type: "Local", status: "Successful" });
      toast(res.mode === "desktop"
        ? `লোকাল ব্যাকআপ: ${res.path}`
        : `লোকাল ব্যাকআপ ডাউনলোড হয়েছে (${res.filename}) — Downloads চেক করুন`);
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
    if(!confirm("Restore from this local JSON? Existing records with same IDs will be merged.")) return;
    try{
      await restoreLocalBackup(db, file);
      await logActivity({ action:"restore", staffName: who(), module:"Backup", summary: "Local file restore " + file.name });
      toast("Local restore started — data will appear as sync completes");
    }catch(err){ toast(friendlyFirestoreError(err)); }
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
  ["ledgerCustomer","stmtCustomer","waCustomer","invCustomer","rvCustomer","cnCustomer","dnCustomer","chqCustomer","discCustomer"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) customerOptions(el, el.value);
  });
}

function renderDashboard(){
  const open = invoices.filter(i=> i.status !== "Draft" && invBalance(i) > 0);
  const overdue = invoices.filter(i=> invStatus(i) === "Overdue");
  const recToday = receipts.filter(r=> r.date === today() && r.status !== "Cancelled" && r.status !== "Bounced");
  const invToday = invoices.filter(i=> i.invDate === today() && i.status !== "Draft");
  const totalRec = open.reduce((s,i)=> s + invBalance(i), 0);
  const overdueAmt = overdue.reduce((s,i)=> s + invBalance(i), 0);
  document.getElementById("dashCards").innerHTML = [
    ["TOTAL RECEIVABLE", money(totalRec), "Open invoices"],
    ["TODAY SALES", money(invToday.reduce((s,i)=> s+num(i.total),0)), invToday.length + " invoices"],
    ["TODAY RECEIVED", money(recToday.reduce((s,i)=> s+num(i.amount),0)), recToday.length + " receipts"],
    ["OVERDUE", money(overdueAmt), overdue.length + " invoices"],
    ["CUSTOMERS", customers.length, customers.filter(c=>c.status==="Active").length + " active"],
    ["OPEN INVOICES", open.length, money(totalRec)]
  ].map(([a,b,c])=> `<div class="card"><div class="metric-label">${a}</div><div class="metric">${b}</div><div class="metric-note">${c}</div></div>`).join("");

  const buckets = agingSums();
  const max = Math.max(1, ...Object.values(buckets));
  const labels = [["current","Current"],["d30","1–30"],["d60","31–60"],["d90","61–90"],["d90p","90+"]];
  document.getElementById("dashAging").innerHTML = labels.map(([k,l])=>
    `<div class="age-row"><span>${l}</span><div class="bar"><i style="width:${Math.round(buckets[k]/max*100)}%"></i></div><b>${money(buckets[k])}</b></div>`
  ).join("");

  const byCust = {};
  overdue.forEach(i=>{ byCust[i.customer] = (byCust[i.customer]||0) + invBalance(i); });
  const top = Object.entries(byCust).sort((a,b)=> b[1]-a[1]).slice(0,6);
  document.getElementById("dashOverdue").innerHTML = top.length
    ? top.map(([n,a])=> `<tr><td>${esc(n)}</td><td class="red">${money(a)}</td></tr>`).join("")
    : `<tr><td colspan="2" class="empty">No overdue</td></tr>`;

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
  openModal("customerModal");
}

async function saveCustomer(){
  const name = cName.value.trim();
  if(!name) return toast("Company name required");
  const data = {
    code: cCode.value.trim(), name, contact: cContact.value.trim(), mobile: cMobile.value.trim(),
    whatsapp: cWhatsapp.value.trim() || cMobile.value.trim(), email: cEmail.value.trim(),
    trn: cTrn.value.trim(), type: cType.value, creditLimit: num(cLimit.value),
    creditDays: num(cDays.value), status: cStatus.value, salesman: (cSalesman?.value||"").trim(),
    paymentTerms: (cTerms?.value||"").trim(), addr: cAddr.value.trim(), notes: cNotes.value.trim(),
    updatedAt: Date.now(), updatedBy: who()
  };
  try{
    let write;
    if(cId.value) write = updateDoc(doc(db,"customers", cId.value), data);
    else { data.createdAt = Date.now(); data.createdBy = who(); write = addDoc(col("customers"), data); }
    closeModal("customerModal");
    commitWrite(
      Promise.resolve(write).then(()=> logActivity({ action:"edit", staffName: who(), customer: name, summary: "Customer saved " + name })),
      { okMsg: "Customer saved" }
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
  const i = invoices.find(x=> x.id === id);
  if(!i) return toast("Invoice not found");
  if(num(i.paid) > 0){
    return toast("Cannot delete — payment already allocated. Remove receipt allocation first.");
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

function getInvoiceEntryMode(){
  try{
    const m = localStorage.getItem(INVOICE_MODE_KEY);
    if(m === "simple" || m === "detailed"){
      _invoiceEntryModeMem = m;
      return m;
    }
  }catch(_){}
  return _invoiceEntryModeMem || "detailed";
}

function setInvoiceEntryMode(mode){
  const m = mode === "simple" ? "simple" : "detailed";
  _invoiceEntryModeMem = m;
  try{ localStorage.setItem(INVOICE_MODE_KEY, m); }catch(_){}
}

function selectInvoiceEntryMode(mode){
  if(mode !== "simple" && mode !== "detailed") return;
  setInvoiceEntryMode(mode);
  syncInvoiceModeSettingsUi();
  applyInvoiceEntryMode();
  toast(mode === "simple" ? "Simple total mode saved" : "Detailed line mode saved");
}

function wireInvoiceModeSettings(){
  const root = document.getElementById("settingsInvoice");
  if(!root || root._invModeWired) return;
  root._invModeWired = true;
  root.addEventListener("click", e=>{
    const btn = e.target.closest("[data-invoice-mode]");
    if(!btn) return;
    selectInvoiceEntryMode(btn.getAttribute("data-invoice-mode"));
  });
  syncInvoiceModeSettingsUi();
}

function syncInvoiceModeSettingsUi(){
  const mode = getInvoiceEntryMode();
  document.querySelectorAll("[data-invoice-mode]").forEach(btn=>{
    btn.classList.toggle("active", btn.getAttribute("data-invoice-mode") === mode);
  });
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
  toast("Edit করুন, তারপর Update চাপুন");
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
    tbody.innerHTML = `<tr><td colspan="8" class="empty">No items added yet — use Add above</td></tr>`;
    return;
  }
  tbody.innerHTML = _invoiceLineItems.map((it, idx)=>{
    const x = normalizeInvLineItem(it);
    return `<tr class="inv-line-row" data-edit-inv-item="${idx}" title="Double-click to edit">
      <td>${esc(x.name)}</td><td>${esc(x.code)}</td><td>${esc(x.qty)}</td>
      <td>${money(x.price)}</td><td>${money(x.disc)}</td><td>${esc(x.vat)}%</td>
      <td>${money(x.line)}</td>
      <td><button class="btn small danger" type="button" data-rm-inv-item="${idx}">×</button></td>
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
    mode: getInvoiceEntryMode(),
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
  setInvoiceEntryMode(state.mode || "detailed");
  applyInvoiceEntryMode();
  invoiceWipFieldIds().forEach(id=>{
    const el = document.getElementById(id);
    if(el && state[id] != null) el.value = state[id];
  });
  if(state.invCustomer){
    customerOptions(invCustomer, state.invCustomer);
    invCustomer.value = state.invCustomer;
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
  const after = due + num(grand);
  if(invLim) invLim.textContent = c ? money(limit) : "—";
  if(invDueNow) invDueNow.textContent = name ? money(due) : "—";
  if(invNowTot) invNowTot.textContent = money(grand);
  if(invAfter){
    invAfter.textContent = name ? money(after) : "—";
    invAfter.style.color = (limit > 0 && after > limit) ? "#d92d20" : "#079455";
  }
}

function filterVehiclesForInvoice(){
  const name = invCustomer.value;
  const c = customers.find(x=> x.name === name);
  if(invTerms) invTerms.value = c?.paymentTerms || (num(c?.creditDays)||shop.creditDays||30) + " Days Credit";
  const days = num(c?.creditDays) || num(shop.creditDays) || 30;
  if(invDate.value && !invId.value){
    const d = new Date(invDate.value + "T00:00:00");
    d.setDate(d.getDate() + days);
    invDue.value = d.toISOString().slice(0,10);
  }
  calcInvoice();
}

function resetInvoice(){
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
    if(simpleTotalEl) simpleTotalEl.value = i.total ?? "";
  }else if(simpleTotalEl) simpleTotalEl.value = "";
  setInvoiceLineItems(i.items || []);
  clearInvEntryFields();
  applyInvoiceEntryMode();
  updateInvoiceWipHint(false);
  const delBtn = document.getElementById("deleteInvoiceBtn");
  if(delBtn) delBtn.hidden = false;
  openModal("invoiceModal");
}

async function saveInvoice(status){
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
  const after = customerOutstanding(customer) - oldTotal + calc.grand;
  if(status === "Posted" && c && num(c.creditLimit) > 0 && after > num(c.creditLimit)){
    if(!confirm("After this invoice, outstanding exceeds credit limit. Post anyway?")) return;
  }
  const data = {
    invNo: invNo.value.trim(),
    computerNo: (document.getElementById("invComputer")?.value || "").trim(),
    manualNo: (invManual?.value||"").trim(),
    invDate: invDate.value, dueDate: invDue.value,
    customer, vehicle: invVehicle.value, driver: invDriver.value.trim(),
    receivedBy: invReceived.value.trim(), lpo: invLpo.value.trim(), notes: invNotes.value.trim(),
    deliveryNote: (invDn?.value||"").trim(), reference: (invRef?.value||"").trim(), paymentTerms: (invTerms?.value||"").trim(),
    items: calc.items, subtotal: calc.sub, discount: calc.disc, vat: calc.vat, total: calc.grand,
    paid: existingPaid,
    credited: num(existing?.credited),
    status, updatedAt: Date.now(), updatedBy: who()
  };
  try{
    let write;
    if(invId.value) write = updateDoc(doc(db,"invoices", invId.value), data);
    else {
      data.createdAt = Date.now(); data.createdBy = who(); data.paid = 0;
      write = addDoc(col("invoices"), data).then(ref=>{ invId.value = ref.id; return ref; });
    }
    clearInvoiceWip();
    _editingExistingInvoice = false;
    closeModal("invoiceModal");
    commitWrite(
      Promise.resolve(write).then(()=> logActivity({ action: status==="Draft"?"draft":"add", staffName: who(), module:"Invoice", record: data.invNo, customer, summary: (status==="Draft"?"Draft ":"Posted ") + data.invNo, newValue: money(data.total) })),
      { okMsg: status === "Draft" ? "Draft saved" : "Invoice posted" }
    );
  }catch(e){ toast(friendlyFirestoreError(e)); }
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
    return `<tr><td>${esc(r.rvNo)}</td><td>${esc(r.date)}</td><td>${esc(r.customer)}</td><td>${esc(r.method)}</td>
      <td>${esc(r.ref || r.chequeNo)}</td><td>${money(r.amount)}</td><td>${money(alloc)}</td>
      <td class="${un?"orange":""}">${money(un)}</td><td>${badge(r.status||"Posted")}</td></tr>`;
  }).join("") : `<tr><td colspan="9" class="empty">No receipts</td></tr>`;
}

function resetReceipt(){
  const rvNo = document.getElementById("rvNo");
  const rvDate = document.getElementById("rvDate");
  const rvAmount = document.getElementById("rvAmount");
  const rvRef = document.getElementById("rvRef");
  const rvChq = document.getElementById("rvChq");
  const rvBank = document.getElementById("rvBank");
  const rvCustomer = document.getElementById("rvCustomer");
  rvNo.value = nextNo(shop.rvPrefix || "RV-", receipts, "rvNo");
  rvDate.value = today();
  rvAmount.value = "";
  rvRef.value = "";
  rvChq.value = "";
  rvBank.value = "";
  const rvPdcDate = document.getElementById("rvPdcDate");
  const rvDisc = document.getElementById("rvDisc");
  const rvStatus = document.getElementById("rvStatus");
  const rvChqDate = document.getElementById("rvChqDate");
  if(rvPdcDate) rvPdcDate.value = "";
  if(rvChqDate) rvChqDate.value = "";
  if(rvDisc) rvDisc.value = 0;
  if(rvStatus) rvStatus.value = "Posted";
  customerOptions(rvCustomer, "");
  document.getElementById("rvAllocRows").innerHTML = `<tr><td colspan="6" class="empty">Select a customer to load invoices</td></tr>`;
  document.getElementById("rvAllocHead").textContent = "Select customer first";
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
    return `<tr>
      <td><b>${esc(i.invNo)}</b></td>
      <td>${esc(i.invDate)}</td>
      <td>${esc(i.dueDate)}</td>
      <td>${money(bal)}</td>
      <td><input type="number" min="0" step="0.01" data-inv="${i.id}" data-max="${bal}" value="${suggest || 0}"></td>
      <td>${badge(invStatus(i))}</td>
    </tr>`;
  }).join("");
}

async function saveReceipt(){
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
  const amount = num(rvAmount.value);
  if(!customer) return toast("Select customer first");
  if(amount <= 0) return toast("Enter receipt amount");
  const allocs = [...document.querySelectorAll("#rvAllocRows input[data-inv]")].map(inp=>({
    invoiceId: inp.dataset.inv, amount: Math.min(num(inp.value), num(inp.dataset.max))
  })).filter(a=> a.amount > 0);
  const allocated = allocs.reduce((s,a)=> s+a.amount, 0);
  if(allocated > amount + 0.01) return toast("Allocation exceeds receipt amount");
  const method = rvMethod.value;
  const isCheque = method.includes("Cheque");
  const status = isCheque ? (rvStatus?.value || "Pending") : (rvStatus?.value || "Posted");
  const applyNow = !isCheque || status === "Cleared";
  const data = {
    rvNo: rvNo.value.trim(), date: rvDate.value, customer, method,
    amount, allocated: applyNow ? allocated : 0, unallocated: applyNow ? amount - allocated : amount,
    ref: rvRef.value.trim(), chequeNo: rvChq.value.trim(), bank: rvBank.value.trim(),
    chequeDate: rvChqDate.value, pdcDate: rvPdcDate?.value || "", discount: num(rvDisc?.value),
    allocations: allocs, status, createdAt: Date.now(), createdBy: who(), applied: applyNow
  };
  try{
    const write = (async ()=>{
      const recRef = await addDoc(col("receipts"), data);
      if(applyNow){
        for(const a of allocs){
          const inv = invoices.find(i=> i.id === a.invoiceId);
          if(!inv) continue;
          await updateDoc(doc(db,"invoices", a.invoiceId), { paid: num(inv.paid) + a.amount, updatedAt: Date.now(), updatedBy: who() });
        }
      }
      if(isCheque && rvChq.value.trim()){
        await addDoc(col("cheques"), {
          chequeNo: rvChq.value.trim(), customer, bank: rvBank.value.trim(),
          chequeDate: rvChqDate.value || rvDate.value, pdcDate: rvPdcDate?.value || rvChqDate.value,
          amount, status: status === "Cleared" ? "Cleared" : "Pending",
          receiptId: recRef.id, receiptNo: data.rvNo, createdAt: Date.now()
        });
      }
      if(num(rvDisc?.value) > 0){
        await addDoc(col("discounts"), {
          date: rvDate.value, customer, type:"Payment", ref: data.rvNo, method:"Fixed",
          amount: num(rvDisc.value), reason: "Receipt discount", approvedBy: who(), createdAt: Date.now()
        });
      }
      await logActivity({ action:"add", staffName: who(), module:"Receipt", record: data.rvNo, customer, summary: "Receipt " + data.rvNo, newValue: money(amount) });
    })();
    closeModal("receiptModal");
    commitWrite(write, { okMsg: "Receipt posted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function fillAllocSelect(){
  const list = receipts.filter(r=> num(r.unallocated) > 0.009 && receiptAffectsBalance(r));
  allocReceipt.innerHTML = list.map(r=> `<option value="${r.id}">${esc(r.rvNo)} — ${money(r.unallocated)}</option>`).join("");
  fillAllocRows();
}

function fillAllocRows(){
  const r = receipts.find(x=> x.id === allocReceipt.value);
  if(!r){ allocCustomer.value = ""; allocUnalloc.value = ""; allocRows.innerHTML = ""; return; }
  allocCustomer.value = r.customer;
  allocUnalloc.value = money(r.unallocated);
  const open = invoices.filter(i=> i.customer === r.customer && i.status !== "Draft" && invBalance(i) > 0);
  allocRows.innerHTML = open.map(i=> `<tr>
    <td><input type="checkbox" checked></td>
    <td>${esc(i.invNo)}</td><td>${esc(i.invDate)}</td><td>${esc(i.dueDate)}</td>
    <td>${money(i.total)}</td><td>${money(invBalance(i))}</td>
    <td><input type="number" data-inv="${i.id}" data-max="${invBalance(i)}" value="0"></td>
    <td>${badge(invStatus(i))}</td>
  </tr>`).join("") || `<tr><td colspan="8" class="empty">No open invoices</td></tr>`;
}

async function saveAllocation(){
  const r = receipts.find(x=> x.id === allocReceipt.value);
  if(!r) return toast("Select a receipt");
  const allocs = [...document.querySelectorAll("#allocRows input")].map(inp=>({
    invoiceId: inp.dataset.inv, amount: Math.min(num(inp.value), num(inp.dataset.max))
  })).filter(a=> a.amount > 0);
  const sum = allocs.reduce((s,a)=> s+a.amount, 0);
  if(sum <= 0) return toast("Enter amounts");
  if(sum > num(r.unallocated) + 0.01) return toast("Exceeds unallocated");
  try{
    for(const a of allocs){
      const inv = invoices.find(i=> i.id === a.invoiceId);
      if(!inv) continue;
      await updateDoc(doc(db,"invoices", a.invoiceId), { paid: num(inv.paid)+a.amount, updatedAt: Date.now() });
    }
    await updateDoc(doc(db,"receipts", r.id), {
      allocated: num(r.allocated)+sum,
      unallocated: num(r.unallocated)-sum,
      allocations: [...(r.allocations||[]), ...allocs]
    });
    await logActivity({ action:"edit", staffName: who(), module:"Allocation", record: r.rvNo, customer: r.customer, summary: "Allocated " + money(sum) });
    toast("Allocation saved");
  }catch(e){ toast(e.message); }
}

function ledgerLines(name){
  const lines = [];
  invoices.filter(i=> i.customer===name && i.status !== "Draft").forEach(i=> lines.push({ date:i.invDate, ref:i.invNo, desc:"Credit Invoice", debit:num(i.total), credit:0 }));
  receipts.filter(r=> r.customer===name && receiptAffectsBalance(r)).forEach(r=> lines.push({ date:r.date, ref:r.rvNo, desc:"Receipt "+(r.method||""), debit:0, credit:num(r.amount) }));
  creditNotes.filter(n=> n.customer===name && n.status !== "Draft").forEach(n=> lines.push({ date:n.date, ref:n.cnNo, desc:"Credit Note", debit:0, credit:num(n.amount) }));
  debitNotes.filter(n=> n.customer===name && n.status !== "Draft").forEach(n=> lines.push({ date:n.date, ref:n.dnNo, desc:"Debit Note", debit:num(n.amount), credit:0 }));
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
  document.getElementById("ledgerClose").textContent = "Closing: " + money(customerOutstanding(name));
  body.innerHTML = rows.join("") || `<tr><td colspan="6" class="empty">No movements</td></tr>`;
}

function fillStatement(){
  const sel = document.getElementById("stmtCustomer");
  const asOf = document.getElementById("stmtAsOf")?.value || today();
  if(document.getElementById("stmtAsOf") && !document.getElementById("stmtAsOf").value) document.getElementById("stmtAsOf").value = today();
  const name = sel.value || customers[0]?.name || "";
  if(sel.value !== name && name) sel.value = name;
  document.getElementById("stmtTitle").textContent = name ? `${name} — as of ${asOf}` : "—";
  const body = document.getElementById("stmtRows");
  if(!name){ body.innerHTML = ""; return; }
  let bal = 0;
  body.innerHTML = ledgerLines(name).filter(l=> l.date <= asOf).map(l=>{
    bal += l.debit - l.credit;
    return `<tr><td>${esc(l.date)}</td><td>${esc(l.ref)}</td><td>${esc(l.desc)}</td><td>${l.debit?money(l.debit):"—"}</td><td>${l.credit?money(l.credit):"—"}</td><td>${money(bal)}</td></tr>`;
  }).join("") || `<tr><td colspan="6" class="empty">Empty</td></tr>`;
}

function renderNotes(tbodyId, list, noField){
  document.getElementById(tbodyId).innerHTML = list.length ? list.map(n=> `<tr>
    <td>${esc(n[noField])}</td><td>${esc(n.date)}</td><td>${esc(n.customer)}</td>
    <td>${esc(n.invoice||n.ref||"")}</td><td>${esc(n.reason)}</td><td>${money(n.amount)}</td><td>${badge(n.status||"Posted")}</td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">None</td></tr>`;
}

function fillNoteInvoices(sel, customer){
  const list = invoices.filter(i=> i.customer === customer && i.status !== "Draft");
  sel.innerHTML = `<option value="">—</option>` + list.map(i=> `<option value="${esc(i.invNo)}">${esc(i.invNo)} (${money(i.total)})</option>`).join("");
}

function resetCn(){
  cnId.value = "";
  cnNo.value = nextNo("CN-", creditNotes, "cnNo");
  cnDate.value = today(); cnAmount.value = ""; cnReason.value = ""; cnStatus.value = "Posted";
  customerOptions(cnCustomer, "");
  fillNoteInvoices(cnInvoice, "");
}

function resetDn(){
  dnId.value = "";
  dnNo.value = nextNo("DN-", debitNotes, "dnNo");
  dnDate.value = today(); dnAmount.value = ""; dnReason.value = ""; dnRef.value = ""; dnStatus.value = "Posted";
  customerOptions(dnCustomer, "");
}

async function saveCn(){
  const customer = cnCustomer.value;
  const amount = num(cnAmount.value);
  if(!customer) return toast("Select customer");
  if(amount <= 0) return toast("Enter amount");
  try{
    const write = (async ()=>{
      await addDoc(col("creditNotes"), {
        cnNo: cnNo.value, date: cnDate.value, customer, invoice: cnInvoice.value,
        reason: cnReason.value.trim(), amount, status: cnStatus.value,
        createdAt: Date.now(), createdBy: who()
      });
      if(cnStatus.value !== "Draft" && cnInvoice.value){
        const inv = invoices.find(i=> i.invNo === cnInvoice.value && i.customer === customer);
        if(inv) await updateDoc(doc(db,"invoices", inv.id), { credited: num(inv.credited) + amount, updatedAt: Date.now() });
      }
      await logActivity({ action:"add", staffName: who(), module:"Credit Note", record: cnNo.value, customer, summary: "CN " + cnNo.value, newValue: money(amount) });
    })();
    closeModal("cnModal");
    commitWrite(write, { okMsg: "Credit note posted" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function saveDn(){
  const customer = dnCustomer.value;
  const amount = num(dnAmount.value);
  if(!customer) return toast("Select customer");
  if(amount <= 0) return toast("Enter amount");
  try{
    const write = (async ()=>{
      await addDoc(col("debitNotes"), {
        dnNo: dnNo.value, date: dnDate.value, customer, ref: dnRef.value.trim(),
        reason: dnReason.value.trim(), amount, status: dnStatus.value,
        createdAt: Date.now(), createdBy: who()
      });
      await logActivity({ action:"add", staffName: who(), module:"Debit Note", record: dnNo.value, customer, summary: "DN " + dnNo.value, newValue: money(amount) });
    })();
    closeModal("dnModal");
    commitWrite(write, { okMsg: "Debit note posted" });
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
  chqId.value = ""; chqNo.value = ""; chqBank.value = ""; chqAmt.value = "";
  chqDate.value = today(); chqPdc.value = today(); chqStatus.value = "Pending";
  customerOptions(chqCustomer, "");
}

function editCheque(id){
  const c = cheques.find(x=> x.id === id);
  if(!c) return;
  chqId.value = c.id; chqNo.value = c.chequeNo||""; customerOptions(chqCustomer, c.customer);
  chqBank.value = c.bank||""; chqDate.value = c.chequeDate||""; chqPdc.value = c.pdcDate||"";
  chqAmt.value = c.amount||0; chqStatus.value = c.status||"Pending";
  openModal("chequeModal");
}

async function applyReceiptToInvoices(r){
  for(const a of (r.allocations||[])){
    const inv = invoices.find(i=> i.id === a.invoiceId);
    if(!inv) continue;
    await updateDoc(doc(db,"invoices", a.invoiceId), { paid: num(inv.paid)+num(a.amount), updatedAt: Date.now() });
  }
  const allocSum = (r.allocations||[]).reduce((s,a)=> s + num(a.amount), 0);
  await updateDoc(doc(db,"receipts", r.id), {
    applied: true, allocated: allocSum, unallocated: Math.max(0, num(r.amount) - allocSum), status: "Cleared"
  });
}

async function reverseReceiptFromInvoices(r){
  for(const a of (r.allocations||[])){
    const inv = invoices.find(i=> i.id === a.invoiceId);
    if(!inv) continue;
    await updateDoc(doc(db,"invoices", a.invoiceId), { paid: Math.max(0, num(inv.paid)-num(a.amount)), updatedAt: Date.now() });
  }
  await updateDoc(doc(db,"receipts", r.id), { applied: false, allocated: 0, unallocated: num(r.amount), status: "Bounced" });
}

function findChequeReceipt(chq){
  return receipts.find(x=> (chq.receiptId && x.id === chq.receiptId) || (chq.receiptNo && x.rvNo === chq.receiptNo));
}

async function saveCheque(){
  if(!chqNo.value.trim()) return toast("Cheque no required");
  const prev = cheques.find(x=> x.id === chqId.value);
  const data = {
    chequeNo: chqNo.value.trim(), customer: chqCustomer.value, bank: chqBank.value.trim(),
    chequeDate: chqDate.value, pdcDate: chqPdc.value, amount: num(chqAmt.value),
    status: chqStatus.value, updatedAt: Date.now()
  };
  try{
    const write = (async ()=>{
      if(chqId.value) await updateDoc(doc(db,"cheques", chqId.value), data);
      else await addDoc(col("cheques"), { ...data, createdAt: Date.now() });
      const r = findChequeReceipt(prev || data);
      if(r && prev && prev.status !== "Cleared" && data.status === "Cleared" && !r.applied){
        await applyReceiptToInvoices(r);
      }
      if(r && prev && prev.status === "Cleared" && data.status === "Bounced" && r.applied){
        await reverseReceiptFromInvoices(r);
      }
      await logActivity({ action:"edit", staffName: who(), module:"Cheque", record: data.chequeNo, oldValue: prev?.status||"", newValue: data.status, summary: "Cheque " + data.chequeNo });
    })();
    closeModal("chequeModal");
    commitWrite(write, { okMsg: "Cheque saved" });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function renderDiscounts(){
  document.getElementById("discRows").innerHTML = discounts.length ? discounts.map(d=> `<tr>
    <td>${esc(d.date)}</td><td>${esc(d.customer)}</td><td>${esc(d.type)}</td><td>${esc(d.ref)}</td>
    <td>${esc(d.method)}</td><td>${money(d.amount)}</td><td>${esc(d.reason)}</td><td>${esc(d.approvedBy)}</td>
  </tr>`).join("") : `<tr><td colspan="8" class="empty">No discounts</td></tr>`;
}

function resetDisc(){
  discDate.value = today(); discAmt.value = ""; discRef.value = ""; discReason.value = "";
  discType.value = "Payment"; discMethod.value = "Fixed";
  customerOptions(discCustomer, "");
}

async function saveDisc(){
  if(!discCustomer.value) return toast("Select customer");
  const amount = num(discAmt.value);
  if(amount <= 0) return toast("Enter amount");
  try{
    const write = (async ()=>{
      await addDoc(col("discounts"), {
        date: discDate.value, customer: discCustomer.value, type: discType.value, ref: discRef.value.trim(),
        method: discMethod.value, amount, reason: discReason.value.trim(),
        approvedBy: who(), createdAt: Date.now()
      });
      if(discType.value === "Invoice" && discRef.value.trim()){
        const inv = invoices.find(i=> i.invNo === discRef.value.trim() && i.customer === discCustomer.value);
        if(inv) await updateDoc(doc(db,"invoices", inv.id), { credited: num(inv.credited) + amount, updatedAt: Date.now() });
      }
      await logActivity({ action:"add", staffName: who(), module:"Discount", record: discRef.value.trim(), customer: discCustomer.value, summary: "Discount", newValue: money(amount) });
    })();
    closeModal("discModal");
    commitWrite(write, { okMsg: "Discount saved" });
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

function sendWhatsapp(){
  const mobile = document.getElementById("waSendBtn").dataset.mobile;
  const text = encodeURIComponent(document.getElementById("waMsg").value);
  if(!mobile) return toast("Add WhatsApp/mobile on customer");
  window.open(`https://wa.me/${mobile}?text=${text}`, "_blank");
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
    currency: setCurrency.value.trim() || "AED", creditDays: num(setCreditDays.value),
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
    panel.querySelector(".form-grid").style.display = "none";
    if(permPanel) permPanel.style.display = "none";
  }
  try{
    const { members, invites } = await listTeam();
    let html = `<table class="table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>`;
    html += members.map(m=> `<tr><td>${esc(m.displayName)}</td><td>${esc(m.email)}</td><td>${esc(m.role)}</td><td>${badge(m.status)}</td><td>${
      m.role==="staff"&&isOwnerRole()
        ? `<button class="btn small" data-perm="${m.uid}" data-name="${esc(m.displayName||m.email)}">Permissions</button>
           <button class="btn small danger" data-rm="${m.uid}">Remove</button>`
        : ""
    }</td></tr>`).join("");
    html += `</tbody></table>`;
    if(invites.length){
      html += `<p style="margin-top:12px"><b>Pending invites</b></p>` + invites.map(i=> `<div class="toolbar"><span>${esc(i.displayName)} · ${esc(i.email)}</span>${isOwnerRole()?`<button class="btn small" data-cancel="${i.id}">Cancel</button>`:""}</div>`).join("");
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

function openPermissions(m){
  if(!isOwnerRole()) return;
  const panel = document.getElementById("permPanel");
  panel.style.display = "";
  document.getElementById("permStaffUid").value = m.uid || m.id;
  document.getElementById("permStaffName").textContent = m.displayName || m.email || "Staff";
  const perms = { ...DEFAULT_STAFF_PERMISSIONS, ...(m.permissions || {}) };
  document.getElementById("permGrid").innerHTML = PERMISSION_LABELS.map(([key, label])=>
    `<label><input type="checkbox" data-perm-key="${key}" ${perms[key]?"checked":""}> ${esc(label)}</label>`
  ).join("");
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
  const cns = creditNotes.filter(n=> String(n.date || "") < before || nos.has(n.invoice));
  const dns = debitNotes.filter(n=> String(n.date || "") < before);
  const chqs = cheques.filter(c=> String(c.chequeDate || c.pdcDate || "") < before || ids.has(c.receiptId));
  return { invs, recs, cns, dns, chqs };
}

function archiveExportCsv(){
  if(!isOwnerRole()) return toast("Only owner can archive");
  const before = document.getElementById("archiveBefore")?.value;
  if(!before) return toast("Select cutoff date");
  const { invs, recs, cns, dns, chqs } = archiveCandidates(before);
  if(!invs.length && !recs.length) return toast("No records before this date");
  downloadCsv(`s4-archive-before-${before}.csv`,
    ["Type","Date","Ref","Customer","Amount","Extra"],
    [
      ...invs.map(i=> ["Invoice", i.invDate, i.invNo, i.customer, i.total, i.status]),
      ...recs.map(r=> ["Receipt", r.date, r.rvNo, r.customer, r.amount, r.method]),
      ...cns.map(n=> ["CreditNote", n.date, n.cnNo, n.customer, n.amount, n.invoice||""]),
      ...dns.map(n=> ["DebitNote", n.date, n.dnNo, n.customer, n.amount, ""]),
      ...chqs.map(c=> ["Cheque", c.chequeDate||c.pdcDate, c.chequeNo, c.customer, c.amount, c.status])
    ]
  );
  window._archiveReady = { before, ...archiveCandidates(before) };
  toast("CSV downloaded — now you can delete");
}

async function archiveDeleteOld(){
  if(!isOwnerRole()) return toast("Only owner can archive");
  const before = document.getElementById("archiveBefore")?.value;
  if(!before) return toast("Select cutoff date");
  if(!window._archiveReady || window._archiveReady.before !== before){
    return toast("First download CSV for this cutoff date");
  }
  if(!confirm("এই ডেটা স্থায়ীভাবে মুছে যাবে, আগে CSV ডাউনলোড হয়েছে তো?")) return;
  const word = prompt('Type DELETE to confirm permanent delete:');
  if(String(word || "").trim() !== "DELETE") return toast("Cancelled");
  const { invs, recs, cns, dns, chqs } = window._archiveReady;
  try{
    const ops = [
      ...invs.map(i=> ({ col:"invoices", id:i.id })),
      ...recs.map(r=> ({ col:"receipts", id:r.id })),
      ...cns.map(n=> ({ col:"creditNotes", id:n.id })),
      ...dns.map(n=> ({ col:"debitNotes", id:n.id })),
      ...chqs.map(c=> ({ col:"cheques", id:c.id }))
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

function downloadCsv(filename, header, rows){
  const csv = [header.map(csvCell).join(","), ...rows.map(r=> r.map(csvCell).join(","))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportAudit(){
  const rows = window._auditRows || [];
  if(!rows.length) return toast("No audit rows");
  downloadCsv("s4-audit.csv",
    ["Date/Time","User","Module","Action","Record","Old Value","New Value","Reason"],
    rows.map(r=>{
      const f = formatActivityRow(r, "en");
      return [f.when, f.who, r.module||"", r.action||"", r.record||r.invoiceId||"", r.oldValue||"", r.newValue||"", r.reason||f.what];
    })
  );
  toast("Audit CSV downloaded");
}

function statementTableHtml(name, asOf){
  let bal = 0;
  const rows = ledgerLines(name).filter(l=> l.date <= asOf).map(l=>{
    bal += l.debit - l.credit;
    return [l.date, l.ref, l.desc, l.debit||"", l.credit||"", bal];
  });
  return `<p class="muted">${esc(shop.name||"")} · As of ${esc(asOf)} · Closing ${money(bal)}</p>` +
    tableFromRows(["Date","Reference","Description","Debit","Credit","Balance"], rows);
}

function exportStatementPdf(download){
  const name = document.getElementById("stmtCustomer").value;
  const asOf = document.getElementById("stmtAsOf")?.value || today();
  if(!name) return toast("Select customer");
  fillStatement();
  const title = `Statement — ${name}`;
  const body = statementTableHtml(name, asOf);
  if(download) downloadHtmlDocument(`statement-${name.replace(/\s+/g,"_")}.html`, title, body);
  printHtmlDocument(title, body);
}

function exportLatestInvoicePdf(){
  const inv = [...invoices].filter(i=> i.status !== "Draft").sort((a,b)=> String(b.invDate).localeCompare(String(a.invDate)))[0];
  if(!inv) return toast("No invoice");
  const items = (inv.items||[]).map(it=> [it.name, it.qty, it.price, it.disc, it.vat, it.line]);
  const body = `<p class="muted">${esc(inv.customer)} · ${esc(inv.invDate)} · Due ${esc(inv.dueDate)} · Vehicle ${esc(inv.vehicle)}</p>` +
    `<p class="muted">Serial ${esc(inv.invNo)}${inv.computerNo?` · Computer ${esc(inv.computerNo)}`:""}${inv.manualNo?` · Manual ${esc(inv.manualNo)}`:""}</p>` +
    tableFromRows(["Item","Qty","Price","Disc","VAT%","Line"], items) +
    `<p><b>Total ${money(inv.total)}</b> · Paid ${money(inv.paid)} · Balance ${money(invBalance(inv))}</p>`;
  downloadHtmlDocument(`${inv.invNo}.html`, inv.invNo, body);
  printHtmlDocument(inv.invNo, body);
}

function exportLatestReceiptPdf(){
  const r = [...receipts].sort((a,b)=> String(b.date).localeCompare(String(a.date)))[0];
  if(!r) return toast("No receipt");
  const body = `<p class="muted">${esc(r.customer)} · ${esc(r.date)} · ${esc(r.method)}</p>
    <p>Amount: <b>${money(r.amount)}</b> · Allocated ${money(r.allocated)} · Unallocated ${money(r.unallocated)}</p>
    <p>Ref: ${esc(r.ref||r.chequeNo||"—")}</p>`;
  downloadHtmlDocument(`${r.rvNo}.html`, r.rvNo, body);
  printHtmlDocument(r.rvNo, body);
}

function downloadWaPdf(){
  const type = document.getElementById("waType")?.value || "Payment Reminder";
  const name = document.getElementById("waCustomer").value;
  if(type === "Statement" && name){
    document.getElementById("stmtCustomer").value = name;
    exportStatementPdf(true);
  }else if(type === "Invoice") exportLatestInvoicePdf();
  else{
    const body = `<pre style="white-space:pre-wrap;font-family:inherit">${esc(document.getElementById("waMsg").value)}</pre>`;
    downloadHtmlDocument(`reminder-${(name||"customer").replace(/\s+/g,"_")}.html`, "Payment Reminder", body);
  }
  toast("File downloaded — attach in WhatsApp chat");
}

function exportLedger(kind){
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
    downloadCsv(`ledger-${name.replace(/\s+/g,"_")}.csv`, ["Date","Reference","Description","Debit","Credit","Balance"], rows);
    toast("Ledger CSV downloaded");
  }else{
    const body = tableFromRows(["Date","Reference","Description","Debit","Credit","Balance"], rows);
    printHtmlDocument(`Ledger — ${name}`, body);
    downloadHtmlDocument(`ledger-${name.replace(/\s+/g,"_")}.html`, `Ledger — ${name}`, body);
  }
}

function exportAging(kind){
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
    downloadCsv("aging.csv", ["Customer","Current","1-30","31-60","61-90","90+","Total"], rows);
    toast("Aging CSV downloaded");
  }else{
    const body = tableFromRows(["Customer","Current","1-30","31-60","61-90","90+","Total"], rows);
    printHtmlDocument("Receivable Aging", body);
    downloadHtmlDocument("aging.html", "Receivable Aging", body);
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
      hits.push({ type:"Vehicle", ref:v.plate, detail:`${v.make} ${v.model} · ${v.vin||""}`, page:"invoices", go:()=>{ showPage("invoices"); invoiceSearch.value=v.plate||q; renderInvoices(); }});
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
      el.onclick = ()=>{ document.getElementById("notifPanel").hidden = true; showPage(el.dataset.page); };
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
  const bundle = buildReportBundle(invoices, mode, year, monthIndex0);
  window._periodBundle = bundle;
  const panel = document.getElementById("reportPanel");
  const htmlBox = document.getElementById("periodReportHtml");
  const head = document.getElementById("reportHead");
  const body = document.getElementById("reportRows");
  panel.style.display = "";
  document.getElementById("reportTitle").textContent = bundle.titleEn;
  htmlBox.style.display = "";
  htmlBox.innerHTML = renderReportHtml(bundle, "en").replace(/Tk/g, cur());
  head.innerHTML = "";
  body.innerHTML = "";
}

function exportPeriodCsv(){
  const mode = document.getElementById("rptMode").value;
  const year = num(document.getElementById("rptYear").value) || new Date().getFullYear();
  const monthIndex0 = num(document.getElementById("rptMonth").value);
  const bundle = window._periodBundle || buildReportBundle(invoices, mode, year, monthIndex0);
  downloadTextFile(`s4-report-${year}.csv`, invoicesToCsv(bundle.periodInvoices, "en"));
  toast("Period CSV downloaded");
}

function exportCurrentReportCsv(){
  if(window._periodBundle) return exportPeriodCsv();
  const title = (document.getElementById("reportTitle").textContent || "report").toLowerCase();
  if(title.includes("outstanding")){
    const names = [...new Set(customers.map(c=> c.name).concat(invoices.map(i=> i.customer)))].filter(Boolean);
    downloadCsv("outstanding.csv", ["Customer","Open","Outstanding","Overdue"],
      names.map(n=> [n, invoices.filter(i=> i.customer===n && invBalance(i)>0).length, customerOutstanding(n), customerOverdue(n)]).filter(r=> r[2]>0.009 || r[3]>0.009));
  }else if(title.includes("sales")){
    downloadCsv("sales.csv", ["Invoice","Date","Customer","Total","Paid","Balance"],
      invoices.filter(i=> i.status!=="Draft").map(i=> [i.invNo, i.invDate, i.customer, i.total, i.paid, invBalance(i)]));
  }else if(title.includes("collection")){
    downloadCsv("collection.csv", ["Receipt","Date","Customer","Method","Amount","Status"],
      receipts.map(r=> [r.rvNo, r.date, r.customer, r.method, r.amount, r.status]));
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
