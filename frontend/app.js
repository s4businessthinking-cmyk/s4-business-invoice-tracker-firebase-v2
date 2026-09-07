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
} from "./auth.js?v=188";
import {
  backupToDrive, listBackups, isDriveBackupConfigured,
  getDriveClientId, saveDriveClientId, loadBackupHistory, recordBackupHistory, formatBytes
} from "./drive-backup.js";
import { buildBackupSnapshot, saveLocalBackup, restoreLocalBackup } from "./local-backup.js";
import { loadSavedFirebaseConfig, buildInviteCode } from "./firebase-config.js";
import { printHtmlDocument, downloadHtmlDocument, tableFromRows } from "./doc-export.js?v=68";
import {
  downloadInvoicePdf, downloadStatementPdf, downloadReceiptPdf, downloadReminderPdf, downloadTablePdf
} from "./pdf-export.js?v=193";
import { deliverText, openExternalUrl, deliveryToast, isAndroidNative } from "./file-delivery.js?v=67";
import { buildReportBundle, renderReportHtml, invoicesToCsv, downloadTextFile } from "./reports.js";
import {
  getAccessStatus, activateLicense, licenseErrorText, maskFingerprint
} from "./license.js";
import { setMemberDisplayName, getStaffName } from "./staff.js";
import {
  setProductMasterContext, mountProductMasterPage, refreshProductMasterPage, unmountProductMasterPage,
  openProductMasterDrawer, closeProductMasterDrawer,
  openProductSearchDrawer, closeProductSearchDrawer
} from "./product-master-bridge.js?v=139";
import {
  initPurchase, wirePurchaseUi, preparePurchaseModal,
  onSuppliersLoaded, onPurchaseInvoicesLoaded,
  renderSuppliers, renderPurchaseInvoices, refreshSupplierSelects,
  filterSuppliersForCombo, pickSupplierCombo, getSuppliers, resetSupplier as resetSupplierForm,
  syncPurchaseStockLocations, findProductForLine, formatStockLocation
} from "./purchase.js?v=181";
import {
  initGrn, wireGrnUi, prepareGrnModal, onGoodsReceiptsLoaded, renderGoodsReceipts,
  refreshGrnSupplierSelect, syncGrnStockLocations, getGoodsReceipts, linkGrnToPurchase, unlinkGrnFromPurchase
} from "./grn.js?v=181";
import {
  initPo, wirePoUi, preparePoModal, preparePoFromPrq, onPurchaseOrdersLoaded, renderPurchaseOrders,
  refreshPoSupplierSelect
} from "./po.js?v=139";
import {
  initPurchaseRequisition, wirePrqUi, preparePrqModal, onPurchaseRequisitionsLoaded,
  renderPurchaseRequisitions
} from "./purchase-requisition.js?v=139";
import {
  initVendorPayment, wireVendorPaymentUi, prepareVendorPaymentModal,
  onVendorPaymentsLoaded, renderVendorPayments, refreshVpSupplierSelect
} from "./vendor-payment.js?v=181";
import {
  initPurchaseReturn, wirePurchaseReturnUi, preparePurchaseReturnModal,
  onPurchaseReturnsLoaded, renderPurchaseReturns, refreshPrtSupplierSelect, syncPrtStockLocations
} from "./purchase-return.js?v=139";
import {
  initFoundation, setFoundationShop, renderSidebarNav, allNavPageIds,
  isModuleAllowedInMode, isFullMode, isTotalMode, getOperatingMode,
  roleLabel, ensureDefaultBranch, subscribeBranches, stopBranchSubscription,
  setCurrentBranchId, getCurrentBranch, getCurrentBranchId, getBranches,
  saveBranch, branchAuditContext, OPERATING_MODE, reserveDocNumber
} from "./foundation.js?v=139";
import {
  initMasters, masterMeta, masterCreateMeta, subscribeWarehouses, stopWarehouseSubscription,
  getWarehouses, saveWarehouseRecord, fillWarehouseSelect, activeWarehouseCount,
  fillWarehouseSelectForBranch
} from "./masters.js?v=139";
import {
  initInventory, subscribeStockBalances, subscribeStockLedger, stopInventorySubscriptions,
  getStockBalances, getStockLedger, postStockAdjustment, applySalesStockDelta,
  applyCreditReturnStockDelta, validateStockForLines, catalogMatchedLines, inventoryErrorText,
  postStockTransfer, getBalance, postStockCount, normalizeWarehouseId,
  createBranchStockRequest, approveBranchStockRequest, rejectBranchStockRequest
} from "./inventory.js?v=150";
import {
  initWorkshop, wireWorkshopUi, prepareJobCardModal, onJobCardsLoaded, renderJobCards,
  preparePartsIssueModal, onPartsIssuesLoaded, renderPartsIssues,
  getJobCards, getPartsIssues, linkJobCardToInvoice, unlinkJobCardInvoice
} from "./workshop.js?v=154";

const FOUNDATION_PLACEHOLDER_PAGES = new Set([
  "accounts", "vat", "hr", "expenses", "assets"
]);

function canAccessPage(id){
  if(!id) return false;
  if(!isModuleAllowedInMode(id, shop)) return false;
  if(FOUNDATION_PLACEHOLDER_PAGES.has(id)) return isFullMode(shop);
  return memberCan(activeMember(), id);
}

const MODAL_PERM = {
  customerModal: "customers",
  vehicleModal: "vehicles",
  productModal: "product-catalog",
  productMasterModal: "product-catalog",
  serviceModal: "service-catalog",
  supplierModal: "suppliers",
  warehouseModal: "warehouses",
  stockAdjModal: "inventory",
  stockTransferModal: "inventory",
  stockCountModal: "inventory",
  branchRequestModal: "inventory",
  grnModal: "purchase-invoices",
  prqModal: "purchase-invoices",
  poModal: "purchase-invoices",
  vendorPaymentModal: "purchase-invoices",
  purchaseReturnModal: "purchase-invoices",
  purchaseModal: "purchase-invoices",
  jobCardModal: "workshop",
  partsIssueModal: "workshop",
  piHistoryModal: "purchase-invoices",
  piProductSearchModal: "product-catalog",
  piSelectProductModal: "product-catalog",
  piInvoiceSearchModal: "purchase-invoices",
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
let _invMoneyCache = null;
let stockTransfers = [];
let stockCounts = [];
let branchStockRequests = [];
let _stockCountLines = [];
let customerFilter = "";
let invoiceFilter = "";
let receiptFilter = "";
let uiBound = false;
const INVOICE_WIP_KEY = "s4_invoice_wip_v1";
const INVOICE_MODE_KEY = "s4_invoice_entry_mode_v1";
const INVOICE_BILLING_STYLE_KEY = "s4_invoice_billing_style_v1";
let _invoiceWipTimer = null;
let _editingExistingInvoice = false;
// Guards a double-click on Post/Draft creating the same invoice twice, since a new
// invoice has no invId until its addDoc resolves.
let _invoiceSaving = false;
let _receiptSaving = false;
let _editingExistingReceipt = false;
let _rvBillLines = [];
let _allocSaving = false;
let _cnAllocSaving = false;
let _invoiceLineItems = [];
let _customerSubAccounts = [];
let _invEntryDefaultDiscPct = 0;
let _invRestoreJobIssuedQty = 0;
let _invRestoreLineType = "";
let _invoiceEntryModeMem = null;
let _invoiceBillingStyleMem = null;
/** Temporary mode while editing one invoice (WIP) - must NOT overwrite shop preference */
let _formInvoiceMode = null;
let _currentSettingsView = "hub";

function col(name){ return collection(db, name); }
function today(){ return new Date().toISOString().slice(0,10); }
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
function monthRangeIso(year, monthIndex0){
  const y = num(year) || new Date().getFullYear();
  const mi = Math.max(0, Math.min(11, num(monthIndex0)));
  const mm = String(mi + 1).padStart(2, "0");
  const lastDay = new Date(y, mi + 1, 0).getDate();
  return {
    from: `${y}-${mm}-01`,
    to: `${y}-${mm}-${String(lastDay).padStart(2, "0")}`
  };
}
function initLedgerPeriodControls(){
  const y = document.getElementById("ledgerPeriodYear");
  const m = document.getElementById("ledgerPeriodMonth");
  if(y && !y.value) y.value = new Date().getFullYear();
  if(m && (m.value === "" || m.selectedIndex < 0)) m.value = String(new Date().getMonth());
}
function initStmtPeriodControls(){
  const y = document.getElementById("stmtPeriodYear");
  const m = document.getElementById("stmtPeriodMonth");
  if(y && !y.value) y.value = new Date().getFullYear();
  if(m && (m.value === "" || m.selectedIndex < 0)) m.value = String(new Date().getMonth());
}
function syncStmtPeriodUi(){
  const mode = document.getElementById("stmtPeriodMode")?.value || "custom";
  if(mode === "monthly") initStmtPeriodControls();
  // Must set real display values — clearing style lets CSS `.stmt-period-monthly{display:none}` hide again.
  document.querySelectorAll(".stmt-period-monthly").forEach(el=>{
    el.style.display = mode === "monthly" ? "block" : "none";
  });
  document.querySelectorAll(".stmt-period-custom").forEach(el=>{
    el.style.display = mode === "custom" ? "contents" : "none";
  });
}
function syncLedgerPeriodUi(){
  const mode = document.getElementById("ledgerPeriodMode")?.value || "monthly";
  document.querySelectorAll(".ledger-period-monthly").forEach(el=>{
    el.style.display = mode === "monthly" ? "" : "none";
  });
  document.querySelectorAll(".ledger-period-custom").forEach(el=>{
    el.style.display = mode === "custom" ? "" : "none";
  });
}
function readStmtPeriodBounds(){
  initStmtPeriodControls();
  const mode = document.getElementById("stmtPeriodMode")?.value || "custom";
  if(mode === "monthly"){
    const year = num(document.getElementById("stmtPeriodYear")?.value) || new Date().getFullYear();
    const monthIndex0 = num(document.getElementById("stmtPeriodMonth")?.value);
    const range = monthRangeIso(year, monthIndex0);
    return { mode, year, monthIndex0, from: range.from, asOf: range.to };
  }
  const asOfEl = document.getElementById("stmtAsOf");
  if(asOfEl && !asOfEl.value) asOfEl.value = today();
  return {
    mode: "custom",
    from: document.getElementById("stmtFrom")?.value || "",
    asOf: asOfEl?.value || today()
  };
}
function readLedgerPeriodBounds(){
  initLedgerPeriodControls();
  const mode = document.getElementById("ledgerPeriodMode")?.value || "monthly";
  if(mode === "monthly"){
    const year = num(document.getElementById("ledgerPeriodYear")?.value) || new Date().getFullYear();
    const monthIndex0 = num(document.getElementById("ledgerPeriodMonth")?.value);
    const range = monthRangeIso(year, monthIndex0);
    return { mode, year, monthIndex0, from: range.from, to: range.to };
  }
  return {
    mode: "custom",
    from: document.getElementById("ledgerFrom")?.value || "",
    to: document.getElementById("ledgerTo")?.value || ""
  };
}
function customerPeriodLabel(bounds, kind = "ledger"){
  if(bounds.mode === "monthly"){
    return `${MONTH_NAMES[bounds.monthIndex0]} ${bounds.year}`;
  }
  if(kind === "stmt"){
    const bits = [];
    if(bounds.from) bits.push("From " + bounds.from);
    if(bounds.asOf) bits.push("As of " + bounds.asOf);
    return bits.join(" - ") || "All dates";
  }
  const bits = [];
  if(bounds.from) bits.push("From " + bounds.from);
  if(bounds.to) bits.push("To " + bounds.to);
  return bits.join(" - ") || "All dates";
}
function num(v){ return Number(v) || 0; }
function esc(s){ return String(s||"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
function cur(){ return sanitizeCurrency(shop.currency); }
function sanitizeCurrency(v){
  const s = String(v || "AED").trim().replace(/[<>"'&\\/]/g, "").slice(0, 12);
  return s || "AED";
}
function money(n){ return cur() + " " + num(n).toLocaleString("en-AE", { maximumFractionDigits: 2 }); }
function ledgerCell(v){ return v && num(v) > 0.009 ? money(v) : ""; }
function who(){ return member?.displayName || getStaffName() || "User"; }
function activeMember(){
  return member || getCurrentMember();
}
function requireModule(pageId){
  if(!isModuleAllowedInMode(pageId, shop)){
    toast("Not available in TOTAL MODE");
    return false;
  }
  if(memberCan(activeMember(), pageId)) return true;
  toast("You do not have permission for this action.");
  return false;
}
function requireAnyModule(pageIds, msg){
  if(pageIds.some(id=> memberCan(activeMember(), id))) return true;
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
function showDupAlert(msg){
  const overlay = document.getElementById("dupAlertOverlay");
  const p = document.getElementById("dupAlertMsg");
  if(!overlay || !p){ toast(msg); return; }
  p.textContent = msg;
  overlay.hidden = false;
}
function hideDupAlert(){
  const overlay = document.getElementById("dupAlertOverlay");
  if(overlay) overlay.hidden = true;
}
let _lastInvoiceDupKey = "";
let _invoiceDupTimer = null;

function invoiceDupContext(){
  if(getShopInvoiceBillingStyle() === "monthly") syncInvDateFromBillingPeriod({ recalcDue: false });
  return {
    customer: invCustomer?.value || "",
    invDateStr: String(invDate?.value || "").slice(0, 10),
    manualNo: (invManual?.value || "").trim(),
    computerNo: (document.getElementById("invComputer")?.value || "").trim(),
    invSub: (document.getElementById("invSubAccount")?.value || "").trim(),
    excludeId: invId?.value || ""
  };
}

function invoiceDupPeriodLabel(ctx){
  if(getShopInvoiceBillingStyle() === "monthly"){
    const mk = String(ctx.invDateStr || "").slice(0, 7);
    const y = mk.slice(0, 4);
    const mi = num(mk.slice(5, 7)) - 1;
    if(y && mi >= 0 && mi <= 11) return `${MONTH_NAMES[mi]} ${y}`;
  }
  return ctx.invDateStr;
}

function findInvoiceDuplicate(ctx = invoiceDupContext()){
  const { customer, invDateStr, manualNo, computerNo, excludeId } = ctx;
  if(!customer || !invDateStr) return null;
  if(!manualNo && !computerNo) return null;
  return findDuplicatePartyDocInvoice({
    rows: invoices,
    excludeId,
    date: invDateStr,
    party: customer,
    partyField: "customer",
    dateField: "invDate",
    dateGranularity: getShopInvoiceBillingStyle() === "monthly" ? "month" : "day",
    numbers: [
      { label: "Manual Invoice No.", value: manualNo, field: "manualNo" },
      { label: "Computer Invoice No.", value: computerNo, field: "computerNo" }
    ]
  });
}

function formatInvoiceDupMessage(dupDoc, ctx){
  const existingSub = String(dupDoc.row.subAccount || "").trim();
  const subBit = existingSub ? `\nExisting sub-account on file: ${existingSub}` : "";
  const period = invoiceDupPeriodLabel(ctx);
  const periodWord = getShopInvoiceBillingStyle() === "monthly" ? "month" : "date";
  return (
    `${dupDoc.label} "${dupDoc.value}" is already saved for ${ctx.customer} for ${period}.${subBit}\n\n` +
    `Existing invoice: ${dupDoc.row.invNo}\n\n` +
    `Duplicate is not allowed (same customer, ${periodWord}, and invoice number). Sub-account is optional and does not allow a second copy. Change the number or open the existing invoice.`
  );
}

function refreshInvoiceDuplicateUi({ showPopup = false } = {}){
  const ctx = invoiceDupContext();
  const dup = findInvoiceDuplicate(ctx);
  const manualEl = invManual;
  const computerEl = document.getElementById("invComputer");
  const banner = document.getElementById("invDupBanner");
  const bannerField = document.getElementById("invDupBannerField");
  manualEl?.classList.toggle("field-dup-warn", !!(dup && dup.field === "manualNo"));
  computerEl?.classList.toggle("field-dup-warn", !!(dup && dup.field === "computerNo"));
  if(banner && bannerField){
    if(dup){
      bannerField.hidden = false;
      banner.textContent =
        `${dup.label} "${dup.value}" already exists on ${dup.row.invNo} (${invoiceDupPeriodLabel(ctx)}). Duplicate not allowed.`;
    }else{
      bannerField.hidden = true;
      banner.textContent = "";
    }
  }
  if(dup && showPopup){
    const key = `${dup.row.id}|${dup.field}|${dup.value}|${ctx.customer}|${ctx.invDateStr}`;
    if(key !== _lastInvoiceDupKey){
      _lastInvoiceDupKey = key;
      showDupAlert(formatInvoiceDupMessage(dup, ctx));
    }
  }
  if(!dup) _lastInvoiceDupKey = "";
  return dup;
}

function queueInvoiceDuplicateCheck(showPopup = false){
  clearTimeout(_invoiceDupTimer);
  _invoiceDupTimer = setTimeout(()=> refreshInvoiceDuplicateUi({ showPopup }), showPopup ? 0 : 350);
}
function ucText(v){
  return String(v ?? "").trim().toUpperCase();
}
const UPPER_SKIP_TYPES = new Set(["email", "password", "number", "date", "datetime-local", "file", "hidden", "search"]);
const UPPER_SKIP_IDS = new Set([
  "globalSearch", "customerSearch", "vehicleSearch", "productSearch", "serviceSearch",
  "invoiceSearch", "receiptSearch", "driveClientIdInput", "loginEmail", "setupEmail",
  "staffEmail", "inviteEmail", "cEmail", "configPaste", "inviteCodePaste", "settingsLicensePaste"
]);
function shouldAutoUppercase(el){
  if(!el || el.readOnly || el.disabled) return false;
  const tag = el.tagName;
  if(tag !== "INPUT" && tag !== "TEXTAREA") return false;
  if(el.closest("#authOverlay, #licenseGateOverlay")) return false;
  if(!el.closest("#app")) return false;
  const type = String(el.type || "text").toLowerCase();
  if(UPPER_SKIP_TYPES.has(type)) return false;
  if(el.id && UPPER_SKIP_IDS.has(el.id)) return false;
  if(el.classList.contains("search") || el.dataset.noUpper !== undefined) return false;
  if(el.closest(".pw-wrap")) return false;
  return true;
}
function applyAutoUppercase(el){
  if(!shouldAutoUppercase(el)) return;
  const val = el.value;
  const upper = val.toUpperCase();
  if(val === upper) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  el.value = upper;
  if(start != null && end != null){
    try{ el.setSelectionRange(start, end); }catch(_){}
  }
}
function wireAutoUppercase(){
  if(window._s4UpperWired) return;
  window._s4UpperWired = true;
  const root = document.getElementById("app");
  if(!root) return;
  root.addEventListener("input", e=> applyAutoUppercase(e.target));
  root.addEventListener("paste", e=>{
    requestAnimationFrame(()=> applyAutoUppercase(e.target));
  });
}

function isEnterTabField(el){
  if(!el || el.disabled) return false;
  const type = String(el.type || "").toLowerCase();
  if(["hidden","file","button","submit","reset","checkbox","radio","image"].includes(type)) return false;
  if(el.readOnly) return false;
  if(el.hidden || el.getAttribute("aria-hidden") === "true") return false;
  if(el.classList.contains("cust-combo-native") || el.classList.contains("inv-combo-native")) return false;
  if(el.classList.contains("search") || el.dataset.enterSkip !== undefined) return false;
  if(el.closest("[hidden], .toolbar")) return false;
  const st = window.getComputedStyle(el);
  if(st.display === "none" || st.visibility === "hidden") return false;
  const box = el.getBoundingClientRect();
  if(box.width < 2 && box.height < 2) return false;
  return true;
}

function enterTabRoot(el){
  if(!el?.closest) return null;
  if(el.closest("#authOverlay, #licenseGateOverlay, #searchOverlay, #s4Splash")) return null;
  const drawer = el.closest(".drawer.open");
  if(drawer) return drawer;
  if(el.classList.contains("search") || el.closest(".toolbar")) return null;
  const page = el.closest(".page.active");
  if(!page) return null;
  if(!el.closest(".form-grid, .settings-sub, .erp-legacy-body, .inv-legacy-body")) return null;
  return page;
}

function enterTabStops(root){
  const fields = [...root.querySelectorAll("input, select, textarea")].filter(isEnterTabField);
  const saves = [...root.querySelectorAll(".modal-foot .btn.primary, .pi-actions .btn.primary")]
    .filter(b=> !b.hidden && !b.disabled && b.getAttribute("aria-hidden") !== "true");
  if(saves.length) fields.push(saves[saves.length - 1]);
  return fields;
}

function focusEnterTabStop(el){
  if(!el) return;
  el.focus();
  if(el.tagName === "INPUT" && typeof el.select === "function"){
    const type = String(el.type || "text").toLowerCase();
    if(!["date","datetime-local","color","range","file","checkbox","radio"].includes(type)){
      try{ el.select(); }catch(_){}
    }
  }
}

function currentEnterTabIndex(stops, el){
  const direct = stops.indexOf(el);
  if(direct >= 0) return direct;
  const wrap = el.closest?.(".cust-combo, .inv-combo, .field, .field-with-btn");
  if(!wrap) return -1;
  return stops.findIndex(s=> wrap.contains(s));
}

/** Enter = next field (like Tab) on every ERP form, including future drawers. Line-add / combo-pick keep their own Enter. Shift+Enter in textarea = new line. */
function wireEnterAsTab(){
  if(window._s4EnterTabWired) return;
  window._s4EnterTabWired = true;
  document.addEventListener("keydown", e=>{
    if(e.key !== "Enter" || e.isComposing) return;
    if(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    const t = e.target;
    if(!(t instanceof HTMLElement)) return;
    if(t.matches("button, a") || t.closest("button, a")) return;
    if(t.tagName === "TEXTAREA" && e.shiftKey) return;
    const root = enterTabRoot(t);
    if(!root) return;
    const comboInput = t.classList.contains("cust-combo-input") || t.classList.contains("inv-combo-input");
    if(e.defaultPrevented && !comboInput) return;
    const stops = enterTabStops(root);
    if(stops.length < 2) return;
    const idx = currentEnterTabIndex(stops, t);
    if(idx < 0) return;
    const next = stops[idx + 1];
    if(!next) return;
    e.preventDefault();
    focusEnterTabStop(next);
  });
}
function friendlyFirestoreError(e){
  const code = String(e?.code || "").replace(/^firestore\//, "");
  const msg = String(e?.message || e || "");
  if(code === "resource-exhausted" || /resource.?exhausted/i.test(msg)){
    return "Firebase storage (1GB free limit) is full. New data is not saving. Upgrade to Blaze in Firebase Console, or delete old data to free space.";
  }
  if(code === "permission-denied" || /insufficient permissions|permission.?denied/i.test(msg)){
    return "No permission - is email verified? Did you Publish firestore.rules in Firebase Console? Logout and login again.";
  }
  return msg || "Save failed";
}
function isAppOnline(){
  try{ return navigator.onLine !== false; }catch(_){ return true; }
}
/** Fire Firestore write without blocking UI; toast only after success (or offline queue note). */
function commitWrite(writePromise, { okMsg = "Saved", offlineMsg = "Saved - will sync when online" } = {}){
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

function getOpenDrawers(){
  return [...document.querySelectorAll(".drawer.open")];
}

function topOpenDrawer(){
  const open = getOpenDrawers();
  if(!open.length) return null;
  return open.slice().sort((a, b)=>{
    const za = parseInt(a.style.zIndex, 10) || 0;
    const zb = parseInt(b.style.zIndex, 10) || 0;
    return zb - za;
  })[0];
}

function closeAllDrawers(exceptIds = []){
  const keep = new Set(exceptIds);
  getOpenDrawers().forEach(d=>{
    if(keep.has(d.id)) return;
    if(d.id === "invoiceModal"){
      try{ saveInvoiceWip(); }catch(_){}
    }
    closeModal(d.id);
  });
}

function hideAllPortaledSuggestLists(){
  document.querySelectorAll(".cust-combo-list, .inv-combo-list, .catalog-suggest-list").forEach(list=>{
    list.hidden = true;
    list.style.display = "";
  });
  document.querySelectorAll(".cust-combo-input, .inv-combo-input").forEach(input=>{
    input.setAttribute("aria-expanded", "false");
  });
}

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
  hideAllPortaledSuggestLists();
  const keep = new Set(opts.keepOpen || []);
  // Close every other drawer so the new form is always visible on top.
  getOpenDrawers().forEach(d=>{
    if(d.id === id) return;
    if(keep.has(d.id)) return;
    if(d.id === "invoiceModal"){
      try{ saveInvoiceWip(); }catch(_){}
    }
    closeModal(d.id);
  });
  el.classList.add("open");
  el.style.display = el.classList.contains("drawer--pane") ? "flex" : "block";
  const topZ = getOpenDrawers().reduce((max, d)=>{
    if(d === el) return max;
    return Math.max(max, parseInt(d.style.zIndex, 10) || 6000);
  }, 6000);
  el.style.zIndex = String(Math.max(topZ + 1, keep.size ? 6100 : 6001));
  _ignoreDrawerCloseUntil = Date.now() + 600;
  return true;
}
function closeModal(id){
  if(id === "productMasterModal"){
    closeProductMasterDrawer();
    hideAllPortaledSuggestLists();
    return;
  }
  if(id === "piProductSearchModal"){
    closeProductSearchDrawer();
    hideAllPortaledSuggestLists();
    return;
  }
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove("open");
  el.style.display = "none";
  el.style.zIndex = "";
  hideAllPortaledSuggestLists();
}

const FORM_LIST_PAGE = {
  invoiceModal: "invoices",
  receiptModal: "receipts",
  cnModal: "credit-notes",
  dnModal: "debit-notes",
  chequeModal: "cheques",
  discModal: "discounts",
  customerModal: "customers",
  vehicleModal: "vehicles",
  productModal: "product-catalog",
  serviceModal: "service-catalog",
  supplierModal: "suppliers",
  warehouseModal: "warehouses",
  purchaseModal: "purchase-invoices",
  grnModal: "purchase-invoices",
  prqModal: "purchase-invoices",
  poModal: "purchase-invoices",
  vendorPaymentModal: "purchase-invoices",
  purchaseReturnModal: "purchase-invoices",
  jobCardModal: "workshop",
  partsIssueModal: "workshop",
  stockAdjModal: "inventory",
  stockTransferModal: "inventory",
  stockCountModal: "inventory",
  branchRequestModal: "inventory"
};

/** After Save: keep form open and reset so the next entry is ready immediately. */
function leaveFormAfterSave(modalId){
  if(modalId === "invoiceModal"){
    try{ clearInvoiceWip(); }catch(_){}
    _editingExistingInvoice = false;
  }
  if(modalId === "receiptModal") _editingExistingReceipt = false;
  const el = document.getElementById(modalId);
  if(!el) return;
  if(!el.classList.contains("open")){
    el.classList.add("open");
    el.style.display = el.classList.contains("drawer--pane") ? "flex" : "block";
  }
  try{
    prepareOpenModal(modalId);
  }catch(err){
    console.warn("[S4 after-save ready next]", modalId, err);
  }
}

function reopenFormAfterSaveFail(modalId){
  // Form stays open with entered data when save fails (ready-next only runs after success).
  openFormModal(modalId, { skipPrepare: true });
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
  else if(id === "supplierModal") resetSupplierForm();
  else if(id === "warehouseModal") resetWarehouse();
  else if(id === "stockAdjModal") prepareStockAdjModal();
  else if(id === "stockTransferModal") prepareStockTransferModal();
  else if(id === "stockCountModal") prepareStockCountModal();
  else if(id === "branchRequestModal") prepareBranchRequestModal();
  else if(id === "grnModal") prepareGrnModal();
  else if(id === "prqModal") preparePrqModal();
  else if(id === "poModal") preparePoModal();
  else if(id === "vendorPaymentModal") prepareVendorPaymentModal();
  else if(id === "purchaseReturnModal") preparePurchaseReturnModal();
  else if(id === "purchaseModal") preparePurchaseModal();
  else if(id === "jobCardModal") prepareJobCardModal();
  else if(id === "partsIssueModal") preparePartsIssueModal();
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
  if(need && !isModuleAllowedInMode(need, shop)){
    toast("Not available in TOTAL MODE");
    return info;
  }
  if(need && !memberCan(activeMember(), need)){
    toast("You do not have permission for this action.");
    return info;
  }
  if(!openModal(id, opts)) return info;
  info.opened = true;
  try{ info.display = getComputedStyle(el).display; }catch(_){}
  try{
    if(!opts.skipPrepare) prepareOpenModal(id);
  }catch(err){
    info.prepareError = String(err && err.message ? err.message : err);
    console.error("open form prepare failed", id, err);
    toast(info.prepareError || ("Could not prepare form: " + id));
  }
  // Keep open even if prepare failed
  if(el && !el.classList.contains("open")){
    el.classList.add("open");
    el.style.display = el.classList.contains("drawer--pane") ? "flex" : "block";
    el.style.zIndex = (opts.keepOpen && opts.keepOpen.length) ? "6100" : "6001";
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

/** ESC / mobile Back / Android browser back - close overlays first, then settings sub, then sidebar, then page?dashboard */
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

  const openDrawer = topOpenDrawer();
  if(openDrawer){
    if(openDrawer.id === "invoiceModal"){
      try{ saveInvoiceWip(); }catch(_){}
    }
    closeModal(openDrawer.id);
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
  for(const id of allNavPageIds()){
    if(canAccessPage(id)) return id;
  }
  return null;
}

function showPage(id){
  if(!id){
    toast("No modules enabled for your account");
    return;
  }
  if(!canAccessPage(id)){
    toast(isTotalMode(shop) ? "Not available in TOTAL MODE" : "No permission for this module");
    return;
  }
  const prevPage = document.querySelector(".page.active")?.id || "";
  if(prevPage === "statements" && id !== "statements") clearStatementPage();
  if(id !== "users") closePermissions();
  closeAllDrawers();
  document.querySelectorAll(".page").forEach(p=> p.classList.toggle("active", p.id === id));
  document.querySelectorAll(".nav button[data-page]").forEach(n=> n.classList.toggle("active", n.dataset.page === id));
  document.getElementById("sidebar").classList.remove("open");
  const backBtn = document.getElementById("mobileBackBtn");
  if(backBtn){
    const home = firstAllowedPage();
    backBtn.hidden = !home || id === home;
  }
  if(id === "vehicles") renderVehicles();
  if(id === "product-catalog") mountProductMasterPage();
  if(id === "service-catalog") renderServices();
  if(id === "warehouses") renderWarehouses();
  if(id === "inventory") renderInventory();
  if(id === "suppliers") renderSuppliers();
  if(id === "purchase-invoices"){
    renderPurchaseRequisitions();
    renderPurchaseOrders();
    renderGoodsReceipts();
    renderPurchaseInvoices();
    renderVendorPayments();
    renderPurchaseReturns();
  }
  if(id === "workshop"){
    renderJobCards();
    renderPartsIssues();
  }
  if(id === "ledger"){ syncLedgerPeriodUi(); fillLedger(); }
  if(id === "statements"){ syncStmtPeriodUi(); fillStatement(); }
  if(id === "allocation"){ fillAllocSelect(); fillCnAllocSelect(); }
  if(id === "communication") fillWhatsapp();
  if(id === "users") renderTeam();
  if(id === "settings") fillSettings();
  if(id === "reports"){
    const p = document.getElementById("reportPanel");
    if(p) p.style.display = "none";
    initReportPeriodControls();
  }
  if(id === "cheques"){
    renderCheques();
    const items = buildNotificationItems();
    if(items.some(it=> it.page === "cheques")){
      acknowledgeNotifications(items);
      setNotifBadge(0);
    }
  }
}

function applyNavPermissions(){
  renderSidebarNav(document.getElementById("sidebarNav"), {
    memberCan: id => canAccessPage(id),
    shop
  });
  syncFoundationChrome();
}

function syncFoundationChrome(){
  const mode = getOperatingMode(shop);
  const badge = document.getElementById("topModeBadge");
  if(badge){
    badge.textContent = mode === OPERATING_MODE.TOTAL ? "TOTAL" : "FULL";
    badge.classList.toggle("top-mode-total", mode === OPERATING_MODE.TOTAL);
    badge.title = mode === OPERATING_MODE.TOTAL
      ? "TOTAL MODE - credit tracking only"
      : "FULL MODE - complete workshop ERP";
  }
  const sel = document.getElementById("topBranchSelect");
  const branches = getBranches();
  if(sel){
    const cur = getCurrentBranchId();
    sel.innerHTML = branches.length
      ? branches.map(b=> `<option value="${esc(b.id)}"${b.id === cur ? " selected" : ""}>${esc(b.code)} - ${esc(b.name)}</option>`).join("")
      : `<option value="">-</option>`;
    sel.disabled = branches.length <= 1;
  }
  document.querySelectorAll("[data-require-full]").forEach(el=>{
    el.hidden = isTotalMode(shop);
    el.disabled = isTotalMode(shop);
  });
  const dashSub = document.getElementById("dashSubtitle");
  if(dashSub){
    dashSub.textContent = isTotalMode(shop)
      ? "TOTAL MODE - credit customers, invoices, receipts"
      : "FULL MODE - sales, purchase, inventory, workshop";
  }
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

/** Foundation §1 - branch-scoped atomic serial (Firestore counters). Falls back to local nextNo offline. */
async function allocateDocSerial(docKey, prefix, { list = [], field = "", draftValue = "", excludeId = "", preferCounter = false } = {}){
  const draft = String(draftValue || "").trim();
  if(!preferCounter && draft){
    const taken = list.some(row=>
      row.id !== excludeId && String(row[field] || "").trim().toLowerCase() === draft.toLowerCase()
    );
    if(!taken) return { value: draft, bumped: false, source: "manual" };
  }
  try{
    const value = await reserveDocNumber(db, docKey, prefix);
    return { value, bumped: !draft || draft !== value, source: "counter" };
  }catch(err){
    console.warn("[S4 allocateDocSerial]", docKey, err);
    const value = nextNo(prefix, list, field);
    return { value, bumped: true, source: "fallback" };
  }
}

function invBalance(inv){
  const { paidMap, creditedMap } = getInvoiceMoneyMaps();
  const paid = roundMoney(paidMap[inv.id] || 0);
  const credited = roundMoney(creditedMap[inv.id] || 0);
  return Math.max(0, roundMoney(num(inv.total) - paid - credited));
}

function invalidateInvMoneyCache(){ _invMoneyCache = null; }

function getInvoiceMoneyMaps(){
  if(_invMoneyCache) return _invMoneyCache;
  _invMoneyCache = buildInvoicePaidCreditedMaps();
  return _invMoneyCache;
}

function receiptHasInvoiceApplication(r){
  if(!receiptAffectsBalance(r)) return false;
  if(r.applied) return true;
  return normalizeReceiptAllocations(r).length > 0;
}

function normalizeReceiptAllocations(r){
  const rows = Array.isArray(r?.allocations)
    ? r.allocations.filter(a=> num(a?.amount) > 0.009)
    : [];
  if(rows.length) return rows;
  const invNo = String(r?.invoice || "").trim();
  if(!invNo) return [];
  const amt = num(r?.allocated) > 0.009 ? num(r.allocated) : num(r?.amount);
  if(amt <= 0.009) return [];
  return [{ invoiceNo: invNo, amount: amt }];
}

function resolveAllocToInvoice(a, customer){
  if(a?.invoiceId){
    const hit = invoices.find(i=> i.id === a.invoiceId);
    if(hit) return hit;
  }
  const no = String(a?.invoiceNo || a?.invoice || "").trim();
  if(!no) return null;
  return invoices.find(i=> i.invNo === no && (!customer || i.customer === customer)) || null;
}

function invoiceDueBucket(inv){
  const d = daysPastDue(inv?.dueDate);
  if(d <= 0) return "current";
  if(d <= 30) return "d30";
  if(d <= 60) return "d60";
  if(d <= 90) return "d90";
  return "d90p";
}

/** Per-customer aging - capped at ledger outstanding (matches Statement closing). */
function customerAgingBuckets(name){
  const buckets = { current:0, d30:0, d60:0, d90:0, d90p:0 };
  let remaining = roundMoney(customerOutstanding(name));
  if(remaining <= 0.009){
    unlinkedDebitNotes(name).forEach(n=> { buckets.current = roundMoney(buckets.current + num(n.amount)); });
    return buckets;
  }
  const open = invoices
    .filter(i=> i.customer === name && i.status !== "Draft")
    .map(i=> ({ inv: i, bal: invBalance(i) }))
    .filter(x=> x.bal > 0.009)
    .sort((a,b)=> String(a.inv.dueDate || a.inv.invDate).localeCompare(String(b.inv.dueDate || b.inv.invDate)));
  for(const row of open){
    if(remaining <= 0.009) break;
    const take = roundMoney(Math.min(row.bal, remaining));
    const bucket = invoiceDueBucket(row.inv);
    if(bucket) buckets[bucket] = roundMoney(buckets[bucket] + take);
    remaining = roundMoney(remaining - take);
  }
  unlinkedDebitNotes(name).forEach(n=> { buckets.current = roundMoney(buckets.current + num(n.amount)); });
  if(remaining > 0.009) buckets.current = roundMoney(buckets.current + remaining);
  return buckets;
}

function allReceivableCustomers(){
  const names = new Set();
  invoices.forEach(i=> { if(i.customer) names.add(i.customer); });
  unlinkedDebitNotes().forEach(n=> { if(n.customer) names.add(n.customer); });
  return [...names];
}

/** Rebuild paid/credited per invoice from receipts, CN, invoice discounts, cheques (source of truth). */
function buildInvoicePaidCreditedMaps(){
  const paidMap = {};
  const creditedMap = {};

  receipts.filter(receiptHasInvoiceApplication).forEach(r=>{
    const allocs = normalizeReceiptAllocations(r).map(a=>{
      const inv = resolveAllocToInvoice(a, r.customer);
      return inv ? { invoiceId: inv.id, amount: num(a.amount) } : null;
    }).filter(Boolean);
    if(!allocs.length) return;
    const disc = num(r.discount);
    const shares = disc > 0 ? receiptAllocDiscShares(r, allocs) : allocs.map(()=> 0);
    allocs.forEach((a, i)=>{
      paidMap[a.invoiceId] = roundMoney((paidMap[a.invoiceId] || 0) + a.amount);
      creditedMap[a.invoiceId] = roundMoney((creditedMap[a.invoiceId] || 0) + (shares[i] || 0));
    });
  });

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

  // Backup: Payment discount ledger rows when receipt.discount field is missing on old data
  discounts.filter(d=> d.type === "Payment" && d.ref).forEach(d=>{
    const r = receipts.find(x=> String(x.rvNo || "") === String(d.ref || "") && x.customer === d.customer);
    if(!r || !receiptHasInvoiceApplication(r) || num(r.discount) > 0.009) return;
    const allocs = normalizeReceiptAllocations(r).map(a=>{
      const inv = resolveAllocToInvoice(a, r.customer);
      return inv ? { invoiceId: inv.id, amount: num(a.amount) } : null;
    }).filter(Boolean);
    if(!allocs.length) return;
    const shares = receiptAllocDiscShares({ ...r, discount: num(d.amount) }, allocs);
    allocs.forEach((a, i)=>{
      creditedMap[a.invoiceId] = roundMoney((creditedMap[a.invoiceId] || 0) + (shares[i] || 0));
    });
  });

  return { paidMap, creditedMap };
}

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
  // Must match saveReceipt apply rules - otherwise ledger vs invoice.paid diverge
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
  // Legacy: invoice field set at create ? fully applied to that invoice
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
  return daysPastDueAsOf(dueDate, today());
}

function daysPastDueAsOf(dueDate, asOf){
  if(!dueDate) return 0;
  const d = new Date(String(dueDate).slice(0, 10) + "T00:00:00");
  if(Number.isNaN(d.getTime())) return 0;
  const n = new Date(String(asOf || today()).slice(0, 10) + "T00:00:00");
  if(Number.isNaN(n.getTime())) return 0;
  return Math.floor((n - d) / 86400000);
}

/** Aging / statement color bucket from overdue days. */
function overdueBucketFromDays(days){
  const d = num(days);
  if(d <= 0) return null;
  if(d <= 30) return "d30";
  if(d <= 60) return "d60";
  if(d <= 90) return "d90";
  return "d90p";
}

function overdueRowClass(bucket, prefix = "stmt"){
  if(!bucket) return "";
  if(bucket === "d30") return `${prefix}-od-30`;
  if(bucket === "d60") return `${prefix}-od-60`;
  if(bucket === "d90") return `${prefix}-od-90`;
  if(bucket === "d90p") return `${prefix}-od-90p`;
  return "";
}

function agingBucket(inv){
  if(inv.status === "Draft") return null;
  const bal = invBalance(inv);
  if(bal <= 0) return null;
  return overdueBucketFromDays(daysPastDue(inv.dueDate)) || "current";
}

function customerOutstanding(name){
  return ledgerLines(name, "").reduce((bal, l)=> bal + ledgerMovement(l), 0);
}

function customerSubAccounts(customerName){
  const c = customers.find(x=> x.name === customerName);
  const list = Array.isArray(c?.subAccounts) ? c.subAccounts : [];
  return list
    .map(s=>({
      id: String(s?.id || "").trim(),
      name: String(s?.name || "").trim()
    }))
    .filter(s=> s.name);
}

/** Fill sub-account select. includeAll=true ? Ledger/Statement (blank = ALL). */
function fillSubAccountSelect(selectEl, customerName, selected, { includeAll = false, noneLabel = "- None -" } = {}){
  if(!selectEl) return [];
  const subs = customerSubAccounts(customerName);
  const sel = String(selected || "").trim();
  let html = includeAll
    ? `<option value="">ALL</option>`
    : `<option value="">${esc(noneLabel)}</option>`;
  html += subs.map(s=>
    `<option value="${esc(s.name)}" ${s.name === sel ? "selected" : ""}>${esc(s.name)}</option>`
  ).join("");
  selectEl.innerHTML = html;
  if(sel && subs.some(s=> s.name === sel)) selectEl.value = sel;
  else selectEl.value = "";
  return subs;
}

function syncInvoiceSubAccountField(selected){
  const sel = document.getElementById("invSubAccount");
  const wrap = document.getElementById("invSubAccountField");
  const name = invCustomer?.value || "";
  const subs = fillSubAccountSelect(sel, name, selected);
  if(wrap) wrap.hidden = !subs.length;
}

function syncReceiptSubAccountField(selected){
  const sel = document.getElementById("rvSubAccount");
  const wrap = document.getElementById("rvSubAccountField");
  const name = document.getElementById("rvCustomer")?.value || "";
  const subs = fillSubAccountSelect(sel, name, selected, { noneLabel: "- None / ALL bills -" });
  if(wrap) wrap.hidden = !subs.length;
}

function syncNoteSubAccountField(prefix, customerName, selected){
  const sel = document.getElementById(`${prefix}SubAccount`);
  const wrap = document.getElementById(`${prefix}SubAccountField`);
  if(!sel) return [];
  const subs = fillSubAccountSelect(sel, customerName, selected, { noneLabel: "- None -" });
  if(wrap) wrap.hidden = !subs.length;
  return subs;
}

function subAccountFromInvoiceNo(customer, invNo){
  if(!invNo) return "";
  const inv = invoices.find(i=> i.invNo === invNo && i.customer === customer);
  return String(inv?.subAccount || "").trim();
}

function syncLedgerSubAccountField(){
  const cust = document.getElementById("ledgerCustomer")?.value || "";
  const sel = document.getElementById("ledgerSubAccount");
  const prev = sel?.value || "";
  fillSubAccountSelect(sel, cust, prev, { includeAll: true });
}

function syncStmtSubAccountField(selected){
  const cust = document.getElementById("stmtCustomer")?.value || "";
  const sel = document.getElementById("stmtSubAccount");
  const hint = document.getElementById("stmtSubHint");
  const prev = selected != null ? selected : (sel?.value || "");
  const subs = fillSubAccountSelect(sel, cust, prev, { includeAll: true });
  if(hint) hint.hidden = !!subs.length;
  if(sel) sel.disabled = !cust;
}

function normalizeCustomerSubAccounts(list){
  const seen = new Set();
  const out = [];
  (list || []).forEach(raw=>{
    const name = String(raw?.name || raw || "").trim();
    if(!name) return;
    const key = name.toLowerCase();
    if(seen.has(key)) return;
    seen.add(key);
    out.push({
      id: String(raw?.id || "").trim() || (`sub_${Date.now()}_${out.length}`),
      name
    });
  });
  return out;
}

function renderCustomerSubRows(){
  const tbody = document.getElementById("cSubRows");
  if(!tbody) return;
  if(!_customerSubAccounts.length){
    tbody.innerHTML = `<tr><td colspan="2" class="empty">No sub-accounts</td></tr>`;
    return;
  }
  tbody.innerHTML = _customerSubAccounts.map((s, idx)=> `<tr>
    <td>${esc(s.name)}</td>
    <td><button class="btn small danger" type="button" data-rm-csub="${idx}">×</button></td>
  </tr>`).join("");
  tbody.querySelectorAll("[data-rm-csub]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      _customerSubAccounts.splice(Number(btn.dataset.rmCsub), 1);
      renderCustomerSubRows();
    });
  });
}

function addCustomerSubAccount(){
  const input = document.getElementById("cSubName");
  const name = String(input?.value || "").trim();
  if(!name) return toast("Enter sub-account name");
  if(_customerSubAccounts.some(s=> s.name.toLowerCase() === name.toLowerCase())){
    return toast("Sub-account already added");
  }
  _customerSubAccounts.push({ id: `sub_${Date.now()}`, name });
  if(input) input.value = "";
  renderCustomerSubRows();
  input?.focus();
}

function docMatchesSubAccount(doc, subFilter){
  const want = String(subFilter || "").trim();
  if(!want) return true;
  return String(doc?.subAccount || "").trim() === want;
}

function invoiceHasSubAccount(invoiceIdOrNo, customer, wantSub){
  const want = String(wantSub || "").trim();
  if(!want) return true;
  const inv = invoices.find(i=>
    i.id === invoiceIdOrNo
    || (i.invNo === invoiceIdOrNo && (!customer || i.customer === customer))
  );
  return !!(inv && String(inv.subAccount || "").trim() === want);
}

/** Receipt/CN may omit subAccount but still belong to a sub via allocated invoices. */
function receiptMatchesSubFilter(r, subFilter){
  const want = String(subFilter || "").trim();
  if(!want) return true;
  if(String(r?.subAccount || "").trim() === want) return true;
  return (r?.allocations || []).some(a=>
    invoiceHasSubAccount(a.invoiceId || a.invoiceNo, r.customer, want)
  );
}

function noteMatchesSubFilter(n, subFilter){
  const want = String(subFilter || "").trim();
  if(!want) return true;
  if(String(n?.subAccount || "").trim() === want) return true;
  if(n?.invoice && invoiceHasSubAccount(n.invoice, n.customer, want)) return true;
  return (n?.allocations || []).some(a=>
    invoiceHasSubAccount(a.invoiceId || a.invoiceNo, n.customer, want)
  );
}

function inferSubAccountFromAllocs(allocs, customer){
  const names = [];
  (allocs || []).forEach(a=>{
    const inv = invoices.find(i=> i.id === a.invoiceId || (a.invoiceNo && i.invNo === a.invoiceNo && i.customer === customer));
    const s = String(inv?.subAccount || "").trim();
    if(s) names.push(s);
  });
  if(!names.length) return "";
  const first = names[0];
  return names.every(n=> n === first) ? first : "";
}

function customerOverdue(name){
  return invoices.filter(i=> i.customer === name && invStatus(i) === "Overdue").reduce((s,i)=> s + invBalance(i), 0);
}

function customerOptions(selectEl, selected){
  if(!selectEl) return;
  const sel = selected || "";
  selectEl.innerHTML = `<option value="">Select...</option>` + customers.map(c=>
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

let _s4ComboListPick = false;

function comboScrollInsideList(target){
  return !!(target && target.closest && target.closest(".cust-combo-list, .inv-combo-list, .catalog-suggest-list"));
}

/** Shared up/down highlight for cust-combo, inv-combo, catalog suggest - keep focus on the input. */
function comboOptionItems(list, attr){
  if(!list) return [];
  return [...list.querySelectorAll(`li[${attr}]`)];
}

function setComboHighlight(list, attr, index){
  const opts = comboOptionItems(list, attr);
  if(!opts.length) return null;
  const i = Math.max(0, Math.min(opts.length - 1, index));
  opts.forEach((li, n)=> li.setAttribute("aria-selected", n === i ? "true" : "false"));
  const active = opts[i];
  try{ active.scrollIntoView({ block: "nearest" }); }catch(_){}
  return active;
}

function moveComboHighlight(list, attr, delta){
  const opts = comboOptionItems(list, attr);
  if(!opts.length) return null;
  let idx = opts.findIndex(li=> li.getAttribute("aria-selected") === "true");
  if(idx < 0) idx = delta > 0 ? 0 : opts.length - 1;
  else idx += delta;
  return setComboHighlight(list, attr, idx);
}

function activeComboOption(list, attr){
  return comboOptionItems(list, attr).find(li=> li.getAttribute("aria-selected") === "true") || null;
}

function bindComboListPick(list, wrap, dataAttr, pickFn){
  if(!list || list._s4ComboPickBound) return;
  list._s4ComboPickBound = true;
  list.addEventListener("pointerdown", e=>{
    const li = e.target.closest(`li[${dataAttr}]`);
    if(!li) return;
    e.preventDefault();
    e.stopPropagation();
    _s4ComboListPick = true;
    pickFn(wrap, li.getAttribute(dataAttr));
    requestAnimationFrame(()=>{ _s4ComboListPick = false; });
  });
}

function wireComboGlobalClose(){
  if(window._s4ComboGlobalWired) return;
  window._s4ComboGlobalWired = true;
  document.addEventListener("mousedown", e=>{
    if(e.target.closest(".cust-combo") || e.target.closest(".cust-combo-list")) return;
    if(e.target.closest(".inv-combo") || e.target.closest(".inv-combo-list")) return;
    closeAllCustomerCombos();
    closeAllInvoiceCombos();
  });
  document.addEventListener("scroll", e=>{
    if(comboScrollInsideList(e.target)) return;
    closeAllCustomerCombos();
    closeAllInvoiceCombos();
  }, true);
  window.addEventListener("resize", ()=>{
    closeAllCustomerCombos();
    closeAllInvoiceCombos();
  });
}

function positionCustomerComboList(wrap, list){
  // Portal to <body> - .modal uses transform, which breaks position:fixed
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
  const owner = wrap.getAttribute("data-combo") || "";
  if(owner === "piSupplier"){
    const rows = filterSuppliersForCombo(q).slice(0, 80);
    if(!rows.length){
      list.innerHTML = `<li class="cust-combo-empty">${getSuppliers().length ? "No match" : "No suppliers yet"}</li>`;
    }else{
      list.innerHTML = rows.map(s=> `<li role="option" data-name="${esc(s.name)}" title="${esc(s.name)}">${esc(s.name)}</li>`).join("");
    }
    positionCustomerComboList(wrap, list);
    if(input) input.setAttribute("aria-expanded", "true");
    return;
  }
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
  const owner = wrap.getAttribute("data-combo") || "";
  if(owner === "piSupplier") return pickSupplierCombo(wrap, name);
  const sel = wrap.querySelector("select");
  const input = wrap.querySelector(".cust-combo-input");
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
  const owner = wrap.getAttribute("data-combo") || "";
  const sel = wrap.querySelector("select");
  const input = wrap.querySelector(".cust-combo-input");
  if(!sel || !input) return;
  const typed = input.value.trim();
  if(!typed){
    if(owner === "piSupplier") pickSupplierCombo(wrap, "");
    else pickCustomerCombo(wrap, "");
    return;
  }
  if(owner === "piSupplier"){
    const exact = getSuppliers().find(s=> String(s.name||"").toLowerCase() === typed.toLowerCase());
    const partial = exact || getSuppliers().find(s=> String(s.name||"").toLowerCase().includes(typed.toLowerCase()));
    if(partial) pickSupplierCombo(wrap, partial.name);
    else{
      input.value = sel.value || "";
      closeAllCustomerCombos();
    }
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

  const ensureOwner = wrap=>{
    const sel = wrap.querySelector("select");
    const owner = wrap.getAttribute("data-combo") || sel?.id || "";
    if(owner) wrap.setAttribute("data-combo", owner);
    return owner;
  };

  const getList = wrap=>{
    const owner = wrap.getAttribute("data-combo") || "";
    return wrap.querySelector(".cust-combo-list")
      || document.querySelector(`.cust-combo-list[data-combo-owner="${owner}"]`);
  };

  document.querySelectorAll(".cust-combo").forEach(wrap=>{
    ensureOwner(wrap);
    const list = wrap.querySelector(".cust-combo-list");
    if(list) bindComboListPick(list, wrap, "data-name", pickCustomerCombo);
  });

  // Delegation so future .cust-combo fields get the same ?/? / Enter behavior
  document.addEventListener("focusin", e=>{
    const input = e.target.closest?.(".cust-combo-input");
    if(!input) return;
    const wrap = input.closest(".cust-combo");
    if(!wrap) return;
    ensureOwner(wrap);
    renderCustomerComboList(wrap, input.value);
  });

  document.addEventListener("input", e=>{
    const input = e.target.closest?.(".cust-combo-input");
    if(!input) return;
    const wrap = input.closest(".cust-combo");
    if(!wrap) return;
    renderCustomerComboList(wrap, input.value);
  });

  document.addEventListener("keydown", e=>{
    const input = e.target.closest?.(".cust-combo-input");
    if(!input) return;
    const wrap = input.closest(".cust-combo");
    if(!wrap) return;
    const sel = wrap.querySelector("select");
    const lst = getList(wrap);
    const open = !!(lst && !lst.hidden);

    if(e.key === "Escape"){
      if(lst) lst.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.value = sel?.value || "";
      return;
    }
    if(e.key === "ArrowDown"){
      e.preventDefault();
      e.stopPropagation();
      if(!open) renderCustomerComboList(wrap, input.value);
      moveComboHighlight(getList(wrap), "data-name", 1);
      return;
    }
    if(e.key === "ArrowUp"){
      e.preventDefault();
      e.stopPropagation();
      if(!open) renderCustomerComboList(wrap, input.value);
      moveComboHighlight(getList(wrap), "data-name", -1);
      return;
    }
    if(e.key === "Home" && open){
      e.preventDefault();
      setComboHighlight(lst, "data-name", 0);
      return;
    }
    if(e.key === "End" && open){
      e.preventDefault();
      setComboHighlight(lst, "data-name", comboOptionItems(lst, "data-name").length - 1);
      return;
    }
    if(e.key === "Enter"){
      e.preventDefault();
      e.stopPropagation();
      const hit = activeComboOption(lst, "data-name") || lst?.querySelector("li[data-name]");
      if(hit) pickCustomerCombo(wrap, hit.getAttribute("data-name"));
      else commitCustomerComboInput(wrap);
    }
  }, true);

  document.addEventListener("focusout", e=>{
    const input = e.target.closest?.(".cust-combo-input");
    if(!input) return;
    const wrap = input.closest(".cust-combo");
    if(!wrap) return;
    setTimeout(()=>{
      if(_s4ComboListPick) return;
      const lst = getList(wrap);
      if(lst && lst.contains(document.activeElement)) return;
      if(wrap.contains(document.activeElement)) return;
      commitCustomerComboInput(wrap);
    }, 250);
  });

  document.addEventListener("pointerdown", e=>{
    const btn = e.target.closest?.(".cust-combo-btn");
    if(!btn) return;
    const wrap = btn.closest(".cust-combo");
    if(!wrap) return;
    e.preventDefault();
    ensureOwner(wrap);
    const input = wrap.querySelector(".cust-combo-input");
    const lst = getList(wrap);
    if(!lst || lst.hidden){
      closeAllCustomerCombos(wrap);
      input?.focus();
      renderCustomerComboList(wrap, "");
    }else{
      lst.hidden = true;
      input?.setAttribute("aria-expanded", "false");
    }
  }, true);

  wireComboGlobalClose();
}

/* --- Invoice number typeahead (CN / DN / Cheque) --- */
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
      const meta = `${i.invDate||""} - Due ${money(bal)} - Total ${money(i.total)}`;
      return `<li role="option" data-invno="${esc(i.invNo)}" title="${esc(i.invNo)}">
        <b>${esc(i.invNo)}</b>
        <span class="inv-meta">${esc(meta)}${i.manualNo ? " - Manual " + esc(i.manualNo) : ""}${i.computerNo ? " - Comp " + esc(i.computerNo) : ""}</span>
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

  const ensureOwner = wrap=>{
    const sel = wrap.querySelector("select");
    const owner = wrap.getAttribute("data-inv-combo") || sel?.id || "";
    if(owner) wrap.setAttribute("data-inv-combo", owner);
    return owner;
  };

  const getList = wrap=>{
    const owner = wrap.getAttribute("data-inv-combo") || "";
    return wrap.querySelector(".inv-combo-list")
      || document.querySelector(`.inv-combo-list[data-inv-combo-owner="${owner}"]`);
  };

  document.querySelectorAll(".inv-combo").forEach(wrap=>{
    ensureOwner(wrap);
    const list = wrap.querySelector(".inv-combo-list");
    if(list) bindComboListPick(list, wrap, "data-invno", pickInvoiceCombo);
  });

  document.addEventListener("focusin", e=>{
    const input = e.target.closest?.(".inv-combo-input");
    if(!input) return;
    const wrap = input.closest(".inv-combo");
    if(!wrap) return;
    ensureOwner(wrap);
    renderInvoiceComboList(wrap, input.value);
  });

  document.addEventListener("input", e=>{
    const input = e.target.closest?.(".inv-combo-input");
    if(!input) return;
    const wrap = input.closest(".inv-combo");
    if(!wrap) return;
    renderInvoiceComboList(wrap, input.value);
  });

  document.addEventListener("keydown", e=>{
    const input = e.target.closest?.(".inv-combo-input");
    if(!input) return;
    const wrap = input.closest(".inv-combo");
    if(!wrap) return;
    const sel = wrap.querySelector("select");
    const lst = getList(wrap);
    const open = !!(lst && !lst.hidden);

    if(e.key === "Escape"){
      if(lst) lst.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.value = sel?.value || "";
      return;
    }
    if(e.key === "ArrowDown"){
      e.preventDefault();
      e.stopPropagation();
      if(!open) renderInvoiceComboList(wrap, input.value);
      moveComboHighlight(getList(wrap), "data-invno", 1);
      return;
    }
    if(e.key === "ArrowUp"){
      e.preventDefault();
      e.stopPropagation();
      if(!open) renderInvoiceComboList(wrap, input.value);
      moveComboHighlight(getList(wrap), "data-invno", -1);
      return;
    }
    if(e.key === "Home" && open){
      e.preventDefault();
      setComboHighlight(lst, "data-invno", 0);
      return;
    }
    if(e.key === "End" && open){
      e.preventDefault();
      setComboHighlight(lst, "data-invno", comboOptionItems(lst, "data-invno").length - 1);
      return;
    }
    if(e.key === "Enter"){
      e.preventDefault();
      e.stopPropagation();
      const hit = activeComboOption(lst, "data-invno") || lst?.querySelector("li[data-invno]");
      if(hit) pickInvoiceCombo(wrap, hit.getAttribute("data-invno"));
      else commitInvoiceComboInput(wrap);
    }
  }, true);

  document.addEventListener("focusout", e=>{
    const input = e.target.closest?.(".inv-combo-input");
    if(!input) return;
    const wrap = input.closest(".inv-combo");
    if(!wrap) return;
    setTimeout(()=>{
      if(_s4ComboListPick) return;
      const lst = getList(wrap);
      if(lst && lst.contains(document.activeElement)) return;
      if(wrap.contains(document.activeElement)) return;
      commitInvoiceComboInput(wrap);
    }, 250);
  });

  document.addEventListener("pointerdown", e=>{
    const btn = e.target.closest?.(".inv-combo-btn");
    if(!btn) return;
    const wrap = btn.closest(".inv-combo");
    if(!wrap) return;
    e.preventDefault();
    ensureOwner(wrap);
    const input = wrap.querySelector(".inv-combo-input");
    const lst = getList(wrap);
    if(!lst || lst.hidden){
      closeAllInvoiceCombos(wrap);
      input?.focus();
      renderInvoiceComboList(wrap, "");
    }else{
      lst.hidden = true;
      input?.setAttribute("aria-expanded", "false");
    }
  }, true);

  wireComboGlobalClose();
}

export function stopTracker(){
  unsubs.splice(0).forEach(u=>{ try{ u(); }catch(_){ } });
  stopBranchSubscription();
  stopWarehouseSubscription();
  stopInventorySubscriptions();
  const appEl = document.getElementById("app");
  appEl?.classList.remove("visible");
}

function syncTopUserChip(){
  const m = member || getCurrentMember();
  const name = m?.displayName || "User";
  const elName = document.getElementById("topUserName");
  const elAv = document.getElementById("topUserAvatar");
  const chip = document.getElementById("topUserChip");
  if(elName) elName.textContent = name;
  if(elAv) elAv.textContent = name.slice(0, 2).toUpperCase();
  if(chip) chip.title = `${name} - ${roleLabel(m?.role)}`;
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
  initFoundation(db, shop);
  initMasters({ db, col, who });
  initInventory({ db, col, num, roundMoney, who, findProductForLine });
  setMemberDisplayName(member?.displayName || "");
  document.getElementById("app").classList.add("visible");
  document.getElementById("userName").textContent = member?.displayName || "User";
  document.getElementById("userRole").textContent = roleLabel(member?.role);
  document.getElementById("userAvatar").textContent = (member?.displayName || "U").slice(0,2).toUpperCase();
  syncTopShopName();
  syncTopUserChip();
  bindUi();
  // bindUi() only runs once per page load, so re-wire modal openers on every login.
  wireModalOpeners();
  if(isOwnerRole()){
    ensureDefaultBranch(db, shop).catch(err=> console.warn("[S4 foundation] default branch", err));
  }
  subscribeBranches(db, member, ()=>{
    syncFoundationChrome();
    renderBranchSettingsRows();
    fillWarehouseBranchSelect();
    updateBranchRequestUi();
    fillBranchRequestSupplyBranches();
    fillBranchRequestWarehouses();
  });
  if(memberCan(member, "warehouses") || memberCan(member, "purchase-invoices")){
    subscribeWarehouses(()=>{
      renderWarehouses();
      syncPurchaseStockLocations();
      fillStockAdjWarehouses();
      fillStockTransferWarehouses();
      fillStockCountWarehouse();
      syncInvStockLocation();
      updateStockTransferUi();
      updateBranchRequestUi();
      fillBranchRequestWarehouses();
      syncGrnStockLocations();
      syncPrtStockLocations();
      fillCnReturnWarehouses();
    });
  }
  if(memberCan(member, "inventory") || memberCan(member, "purchase-invoices") || memberCan(member, "invoices") || memberCan(member, "credit-notes")){
    subscribeStockBalances(()=> renderInventory());
    subscribeStockLedger(()=> renderInventory());
  }
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
  listenIfAllowed("productCatalog", rows => { products = rows; refreshProductMasterPage(); });
  listenIfAllowed("suppliers", rows => {
    onSuppliersLoaded(rows);
    refreshGrnSupplierSelect();
    refreshPoSupplierSelect();
    refreshVpSupplierSelect();
    refreshPrtSupplierSelect();
  });
  listenIfAllowed("purchaseInvoices", rows => onPurchaseInvoicesLoaded(rows));
  listenIfAllowed("goodsReceipts", rows => onGoodsReceiptsLoaded(rows));
  listenIfAllowed("purchaseRequisitions", rows => onPurchaseRequisitionsLoaded(rows));
  listenIfAllowed("purchaseOrders", rows => onPurchaseOrdersLoaded(rows));
  listenIfAllowed("vendorPayments", rows => onVendorPaymentsLoaded(rows));
  listenIfAllowed("purchaseReturns", rows => onPurchaseReturnsLoaded(rows));
  initPurchase({
    db,
    col,
    getShop: ()=> shop,
    getProducts: ()=> products,
    shopDefaultVat,
    who,
    toast,
    esc,
    money,
    badge,
    num,
    roundMoney,
    nextNo,
    allocateDocSerial,
    requireModule,
    commitWrite,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    showPage,
    openProductMasterDrawer,
    openProductSearchDrawer,
    getGoodsReceipts,
    linkGrnToPurchase,
    unlinkGrnFromPurchase,
  });
  wirePurchaseUi();
  initGrn({
    db,
    col,
    getProducts: ()=> products,
    who,
    toast,
    esc,
    money,
    badge,
    num,
    nextNo,
    allocateDocSerial,
    requireModule,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    fillWarehouseSelect
  });
  wireGrnUi();
  initPurchaseRequisition({
    db,
    col,
    getProducts: ()=> products,
    shopDefaultVat,
    who,
    toast,
    esc,
    badge,
    num,
    nextNo,
    allocateDocSerial,
    requireModule,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    preparePoFromPrq
  });
  wirePrqUi();
  initPo({
    db,
    col,
    getProducts: ()=> products,
    shopDefaultVat,
    who,
    toast,
    esc,
    money,
    badge,
    num,
    roundMoney,
    nextNo,
    allocateDocSerial,
    requireModule,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal
  });
  wirePoUi();
  initVendorPayment({
    db,
    col,
    who,
    toast,
    esc,
    money,
    badge,
    num,
    roundMoney,
    nextNo,
    allocateDocSerial,
    requireModule,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    openModal,
    renderPurchaseInvoices
  });
  wireVendorPaymentUi();
  initPurchaseReturn({
    db,
    col,
    shopDefaultVat,
    who,
    toast,
    esc,
    money,
    badge,
    num,
    roundMoney,
    nextNo,
    allocateDocSerial,
    requireModule,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    fillWarehouseSelect,
    renderPurchaseInvoices
  });
  wirePurchaseReturnUi();
  initWorkshop({
    db,
    col,
    who,
    toast,
    esc,
    money,
    badge,
    num,
    roundMoney,
    nextNo,
    allocateDocSerial,
    shopDefaultVat,
    requireModule,
    logActivity,
    friendlyFirestoreError,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    customerOptions,
    getCustomers: ()=> customers,
    getVehicles: ()=> vehicles,
    getProducts: ()=> products,
    getServices: ()=> services,
    fillWarehouseSelect,
    openInvoiceFromJob
  });
  wireWorkshopUi();
  setProductMasterContext({
    db,
    col,
    shopId: loadSavedFirebaseConfig()?.projectId || "default",
    getProducts: ()=> products,
    shopDefaultVat,
    who,
    toast,
    requireModule,
    isOwnerRole,
    deleteCatalogDocs,
    logActivity,
    firstAllowedPage,
    showPage,
    openFormModal,
    closeModal,
    leaveFormAfterSave,
    shopPartEnabled: true,
  });
  listenIfAllowed("serviceCatalog", rows => { services = rows; renderServices(); });
  // Live shop settings (invoice entry mode sync Owner ? Staff)
  unsubs.push(onSnapshot(doc(db, "shop", "info"), snap=>{
    if(!snap.exists()) return;
    const next = snap.data() || {};
    const modeChanged = (next.operatingMode || "full") !== (shop?.operatingMode || "full");
    const invModeChanged = (next.invoiceEntryMode || "") !== (shop?.invoiceEntryMode || "");
    const invBillingChanged = (next.invoiceBillingStyle || "") !== (shop?.invoiceBillingStyle || "");
    shop = next;
    setFoundationShop(shop);
    syncTopShopName();
    if(modeChanged){
      applyNavPermissions();
      const active = document.querySelector(".page.active")?.id;
      if(active && !canAccessPage(active)){
        const home = firstAllowedPage();
        if(home) showPage(home);
      }
    }
    if(invModeChanged){
      _formInvoiceMode = null;
      applyInvoiceEntryMode();
    }
    if(invBillingChanged) applyInvoiceBillingUi();
    syncInvoiceModeSettingsUi();
    syncInvoiceBillingSettingsUi();
  }, err=> toast(friendlyFirestoreError(err))));
  listenIfAllowed("invoices", rows => { invalidateInvMoneyCache(); invoices = rows; renderInvoices(); renderCustomers(); renderDashboard(); renderAging(); fillLedger(); fillStatement(); fillAllocSelect(); fillCnAllocSelect(); refreshNotifications(); });
  listenIfAllowed("receipts", rows => { invalidateInvMoneyCache(); receipts = rows; renderReceipts(); renderCustomers(); renderDashboard(); fillAllocSelect(); fillLedger(); fillStatement(); refreshNotifications(); });
  listenIfAllowed("creditNotes", rows => { invalidateInvMoneyCache(); creditNotes = rows; renderNotes("cnRows", creditNotes, "cnNo"); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); fillCnAllocSelect(); });
  listenIfAllowed("debitNotes", rows => { invalidateInvMoneyCache(); debitNotes = rows; renderNotes("dnRows", debitNotes, "dnNo"); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); });
  listenIfAllowed("cheques", rows => { invalidateInvMoneyCache(); cheques = rows; renderCheques(); renderCustomers(); renderDashboard(); refreshNotifications(); });
  listenIfAllowed("discounts", rows => { invalidateInvMoneyCache(); discounts = rows; renderDiscounts(); renderCustomers(); fillLedger(); fillStatement(); renderDashboard(); renderAging(); });
  listenIfAllowed("stockTransfers", rows => { stockTransfers = rows; renderInventory(); });
  listenIfAllowed("stockCounts", rows => { stockCounts = rows; renderInventory(); });
  listenIfAllowed("branchStockRequests", rows => { branchStockRequests = rows; renderInventory(); });
  listenIfAllowed("jobCards", rows => onJobCardsLoaded(rows));
  listenIfAllowed("partsIssues", rows => onPartsIssuesLoaded(rows));
  if(memberCan(member, "audit")){
    unsubs.push(subscribeRecentActivity(rows=>{
      window._auditRows = rows;
      document.getElementById("auditRows").innerHTML = rows.length
        ? rows.map(r=>{
            const f = formatActivityRow(r, "en");
            return `<tr><td>${esc(f.when)}</td><td>${esc(f.who)}</td><td>${esc(r.branchCode || r.branchName || "")}</td><td>${esc(r.module||"")}</td><td>${esc(r.action||"")}</td>
              <td>${esc(r.record||r.invoiceId||"")}</td><td>${esc(r.oldValue||"")}</td><td>${esc(r.newValue||"")}</td><td>${esc(r.reason||f.what)}</td></tr>`;
          }).join("")
        : `<tr><td colspan="9" class="empty">No activity yet</td></tr>`;
    }));
  }else{
    const auditRows = document.getElementById("auditRows");
    if(auditRows) auditRows.innerHTML = `<tr><td colspan="9" class="empty">No permission for audit</td></tr>`;
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
    access = { allowed:false, reason:"LICENSE_VERIFY_FAILED", deviceFingerprint:"", maskedFingerprint:"-" };
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
    setMsg("Verifying-");
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
  }, err=>{
    const code = String(err?.code || "").replace(/^firestore\//, "");
    const isPerm = code === "permission-denied" || /insufficient permissions|permission.?denied/i.test(String(err?.message || err || ""));
    // Workshop collections were added later — if live rules are outdated, don't spam every login.
    const softCollections = new Set(["partsIssues", "jobCards"]);
    if(isPerm && softCollections.has(name)){
      console.warn("Firestore listen denied (soft):", name, err);
      try{ cb([]); }catch(_){}
      if(!window._s4SoftPermToast){
        window._s4SoftPermToast = true;
        toast("Workshop (partsIssues) blocked — publish latest firestore.rules on THIS shop Firebase project, then logout/login.");
      }
      return;
    }
    toast(friendlyFirestoreError(err) + " [" + name + "]");
  }));
}

// Firestore read rules gate every collection by module (firestore.rules 176-223).
// Subscribing without a granting module fires permission-denied, which listen()
// surfaces as a toast - restricted staff got one toast per collection on login.
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
  discounts:      { mods: ["discounts","ledger","statements","receipts"], rows: "discRows", cols: 9 },
  suppliers:      { mods: ["suppliers","purchase-invoices","dashboard"], rows: "supplierRows", cols: 8 },
  warehouses:     { mods: ["warehouses","purchase-invoices"], rows: "warehouseRows", cols: 6 },
  purchaseInvoices: { mods: ["purchase-invoices","dashboard"], rows: "purchaseRows", cols: 11 },
  goodsReceipts: { mods: ["purchase-invoices","inventory"], rows: "grnRows", cols: 9 },
  purchaseOrders: { mods: ["purchase-invoices","inventory"], rows: "poRows", cols: 7 },
  purchaseRequisitions: { mods: ["purchase-invoices","inventory"], rows: "prqRows", cols: 8 },
  vendorPayments: { mods: ["purchase-invoices"], rows: "vpRows", cols: 9 },
  purchaseReturns: { mods: ["purchase-invoices","inventory"], rows: "prtRows", cols: 7 },
  stockTransfers: { mods: ["inventory"], rows: "invTransferRows", cols: 7 },
  stockCounts: { mods: ["inventory"], rows: "invCountRows", cols: 6 },
  branchStockRequests: { mods: ["inventory"], rows: "invBranchReqRows", cols: 8 },
  jobCards: { mods: ["workshop", "dashboard"], rows: "jobCardRows", cols: 10 },
  partsIssues: { mods: ["workshop", "inventory", "dashboard"], rows: "partsIssueRows", cols: 8 }
};

const COLLECTION_MODE_PAGE = {
  vehicles: "vehicles",
  productCatalog: "product-catalog",
  serviceCatalog: "service-catalog",
  suppliers: "suppliers",
  warehouses: "warehouses",
  purchaseInvoices: "purchase-invoices",
  goodsReceipts: "purchase-invoices",
  purchaseOrders: "purchase-invoices",
  purchaseRequisitions: "purchase-invoices",
  vendorPayments: "purchase-invoices",
  purchaseReturns: "purchase-invoices",
  jobCards: "workshop",
  partsIssues: "workshop"
};

function listenIfAllowed(name, cb){
  const modePage = COLLECTION_MODE_PAGE[name];
  if(modePage && !isModuleAllowedInMode(modePage, shop)){
    try{ cb([]); }catch(err){ console.warn("clear on mode listen failed:", name, err); }
    const access = COLLECTION_READ_ACCESS[name];
    const el = access ? document.getElementById(access.rows) : null;
    if(el) el.innerHTML = `<tr><td colspan="${access.cols}" class="empty">Not available in TOTAL MODE</td></tr>`;
    return false;
  }
  const access = COLLECTION_READ_ACCESS[name];
  if(access && !access.mods.some(m=> memberCan(activeMember(), m))){
    // stopTracker() only drops subscriptions, so clear the cached rows too -
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
  wireAutoUppercase();
  wireEnterAsTab();
  const sidebarNav = document.getElementById("sidebarNav");
  if(sidebarNav && !sidebarNav._s4NavBound){
    sidebarNav._s4NavBound = true;
    sidebarNav.addEventListener("click", e=>{
      const btn = e.target.closest("button[data-page]");
      if(!btn || btn.disabled) return;
      showPage(btn.dataset.page);
    });
  }
  document.querySelectorAll("[data-page]").forEach(n=>{
    if(n.closest("#sidebarNav")) return;
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
      if(d.id === "productMasterModal"){
        closeProductMasterDrawer();
        return;
      }
      if(d.id === "piProductSearchModal"){
        closeProductSearchDrawer();
        return;
      }
      d.classList.remove("open");
      d.style.display = "";
      d.style.zIndex = "";
    });
  });
  document.getElementById("menu").onclick = ()=> document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("saveCustomerBtn").onclick = saveCustomer;
  document.getElementById("cDays")?.addEventListener("input", ()=>{
    const days = num(cDays?.value) || 30;
    if(cTerms) cTerms.value = `${days} Days Credit`;
  });
  document.getElementById("saveVehicleBtn")?.addEventListener("click", saveVehicle);
  document.getElementById("addVehicleBtn")?.addEventListener("click", e=>{
    e.preventDefault();
    e.stopPropagation();
    openFormModal("vehicleModal");
  });
  document.getElementById("invAddVehicleBtn")?.addEventListener("click", e=>{
    e.preventDefault();
    e.stopPropagation();
    // Keep invoice open underneath - do not wipe WIP / in-progress edits
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
      if(id === "invEntryName") _invEntryDefaultDiscPct = 0;
      if(id === "invEntryDisc") _invEntryDefaultDiscPct = 0;
      if(id === "invEntryQty" || id === "invEntryPrice") syncInvEntryDefaultDiscount();
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
  document.getElementById("ledgerCustomer").onchange = ()=>{
    syncLedgerSubAccountField();
    fillLedger();
  };
  document.getElementById("ledgerSubAccount")?.addEventListener("change", fillLedger);
  document.getElementById("ledgerFrom")?.addEventListener("change", fillLedger);
  document.getElementById("ledgerTo")?.addEventListener("change", fillLedger);
  document.getElementById("ledgerPeriodMode")?.addEventListener("change", e=>{
    if(e.target.value === "custom"){
      initLedgerPeriodControls();
      const year = num(document.getElementById("ledgerPeriodYear")?.value) || new Date().getFullYear();
      const monthIndex0 = num(document.getElementById("ledgerPeriodMonth")?.value);
      const range = monthRangeIso(year, monthIndex0);
      const fromEl = document.getElementById("ledgerFrom");
      const toEl = document.getElementById("ledgerTo");
      if(fromEl) fromEl.value = range.from;
      if(toEl) toEl.value = range.to;
    }
    syncLedgerPeriodUi();
    fillLedger();
  });
  ["ledgerPeriodMonth","ledgerPeriodYear"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change", ()=>{
      syncLedgerPeriodUi();
      fillLedger();
    });
  });
  document.getElementById("stmtCustomer").onchange = ()=>{
    syncStmtSubAccountField();
    fillStatement();
  };
  document.getElementById("stmtSubAccount")?.addEventListener("change", fillStatement);
  document.getElementById("stmtAsOf")?.addEventListener("change", fillStatement);
  document.getElementById("stmtOdFrom")?.addEventListener("change", fillStatement);
  document.getElementById("stmtPeriodMode")?.addEventListener("change", e=>{
    if(e.target.value === "custom"){
      initStmtPeriodControls();
      const year = num(document.getElementById("stmtPeriodYear")?.value) || new Date().getFullYear();
      const monthIndex0 = num(document.getElementById("stmtPeriodMonth")?.value);
      const range = monthRangeIso(year, monthIndex0);
      const fromEl = document.getElementById("stmtFrom");
      const asOfEl = document.getElementById("stmtAsOf");
      if(fromEl && !fromEl.value) fromEl.value = range.from;
      if(asOfEl && !asOfEl.value) asOfEl.value = range.to;
    }
    syncStmtPeriodUi();
    fillStatement();
  });
  ["stmtPeriodMonth","stmtPeriodYear"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change", ()=>{
      syncStmtPeriodUi();
      fillStatement();
    });
  });
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
    toast("PDF ready - attach it in WhatsApp");
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
  document.getElementById("topBranchSelect")?.addEventListener("change", e=>{
    setCurrentBranchId(e.target.value);
    syncFoundationChrome();
    toast(`Branch: ${getCurrentBranch()?.name || "-"}`);
  });
  document.getElementById("addBranchBtn")?.addEventListener("click", ()=>{
    if(!isOwnerRole()) return toast("Only owner can manage branches");
    resetBranchForm();
    document.getElementById("branchFormGrid")?.removeAttribute("hidden");
  });
  document.getElementById("cancelBranchBtn")?.addEventListener("click", ()=>{
    document.getElementById("branchFormGrid")?.setAttribute("hidden", "");
    resetBranchForm();
  });
  document.getElementById("saveBranchBtn")?.addEventListener("click", saveBranchForm);
  document.getElementById("saveWarehouseBtn")?.addEventListener("click", saveWarehouse);
  document.getElementById("warehouseSearch")?.addEventListener("input", renderWarehouses);
  document.getElementById("invBalanceSearch")?.addEventListener("input", renderInventory);
  document.getElementById("invLedgerSearch")?.addEventListener("input", renderInventory);
  document.getElementById("saveStockAdjBtn")?.addEventListener("click", saveStockAdjustment);
  document.getElementById("saveStockTransferBtn")?.addEventListener("click", saveStockTransfer);
  document.getElementById("saveStockCountBtn")?.addEventListener("click", saveStockCount);
  document.getElementById("saveBranchRequestBtn")?.addEventListener("click", saveBranchRequest);
  document.getElementById("stkCountLoadBtn")?.addEventListener("click", loadStockCountFromWarehouse);
  document.getElementById("stkCountAddLineBtn")?.addEventListener("click", ()=> addStockCountLine());
  document.getElementById("stkCountWarehouse")?.addEventListener("change", refreshStockCountSystemQty);
  document.getElementById("stkAdjType")?.addEventListener("change", syncStockAdjQtySign);
  document.getElementById("stkTrProduct")?.addEventListener("change", syncStockTransferAvail);
  document.getElementById("stkTrFrom")?.addEventListener("change", ()=>{
    syncStockTransferToWarehouse();
    syncStockTransferAvail();
  });
  document.getElementById("ibrSupplyBranch")?.addEventListener("change", ()=>{
    fillBranchRequestWarehouses();
    syncBranchRequestAvail();
  });
  document.getElementById("ibrProduct")?.addEventListener("change", syncBranchRequestAvail);
  document.getElementById("ibrFromWarehouse")?.addEventListener("change", syncBranchRequestAvail);
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
      if(msg) msg.textContent = "Copy failed - ask support for help.";
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
      if(!printed) toast("File ready - open it to print or share");
    }else window.print();
  });
  document.getElementById("allocReceipt").onchange = fillAllocRows;
  document.getElementById("saveAllocBtn").onclick = saveAllocation;
  document.getElementById("saveCnAllocBtn")?.addEventListener("click", saveCnAllocation);
  document.getElementById("allocCn")?.addEventListener("change", fillCnAllocRows);
  document.getElementById("invCustomer")?.addEventListener("change", ()=>{
    syncInvoiceCustomerFromMaster();
    queueInvoiceWipSave();
    queueInvoiceDuplicateCheck(true);
  });
  document.getElementById("invSubAccount")?.addEventListener("change", ()=>{
    queueInvoiceWipSave();
    queueInvoiceDuplicateCheck(true);
  });
  document.getElementById("invDate")?.addEventListener("change", ()=>{
    syncInvoiceCustomerFromMaster({ preserveSub: true });
    queueInvoiceWipSave();
    queueInvoiceDuplicateCheck(true);
  });
  document.getElementById("invBillMonth")?.addEventListener("change", ()=>{
    syncInvDateFromBillingPeriod({ recalcDue: true });
    queueInvoiceWipSave();
    queueInvoiceDuplicateCheck(true);
  });
  document.getElementById("invBillYear")?.addEventListener("change", ()=>{
    syncInvDateFromBillingPeriod({ recalcDue: true });
    queueInvoiceWipSave();
    queueInvoiceDuplicateCheck(true);
  });
  document.getElementById("invBillYear")?.addEventListener("input", ()=> queueInvoiceDuplicateCheck(false));
  document.getElementById("invManual")?.addEventListener("input", ()=> queueInvoiceDuplicateCheck(false));
  document.getElementById("invManual")?.addEventListener("blur", ()=> queueInvoiceDuplicateCheck(true));
  document.getElementById("invComputer")?.addEventListener("input", ()=> queueInvoiceDuplicateCheck(false));
  document.getElementById("invComputer")?.addEventListener("blur", ()=> queueInvoiceDuplicateCheck(true));
  document.getElementById("dupAlertOk")?.addEventListener("click", hideDupAlert);
  document.getElementById("dupAlertOverlay")?.addEventListener("click", e=>{
    if(e.target.id === "dupAlertOverlay") hideDupAlert();
  });
  document.getElementById("rvCustomer")?.addEventListener("change", ()=>{
    _rvBillLines = [];
    syncReceiptSubAccountField("");
    renderRvBillGrid();
    fillRvBillPick();
    updateRvCustomerSummary();
  });
  document.getElementById("rvSubAccount")?.addEventListener("change", ()=>{
    _rvBillLines = [];
    renderRvBillGrid();
    fillRvBillPick();
  });
  document.getElementById("cSubAddBtn")?.addEventListener("click", addCustomerSubAccount);
  document.getElementById("cSubName")?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){
      e.preventDefault();
      addCustomerSubAccount();
    }
  });
  wireRvBillUi();
  wireRvFindUi();
  wireMasterListDblOpen();
  document.getElementById("cnCustomer")?.addEventListener("change", ()=>{
    const cnCustomer = document.getElementById("cnCustomer");
    const cnInvoice = document.getElementById("cnInvoice");
    syncNoteSubAccountField("cn", cnCustomer?.value || "");
    if(cnCustomer && cnInvoice) fillNoteInvoices(cnInvoice, cnCustomer.value);
  });
  document.getElementById("cnInvoice")?.addEventListener("change", ()=>{
    const cnCustomer = document.getElementById("cnCustomer")?.value || "";
    const invNo = document.getElementById("cnInvoice")?.value || "";
    syncNoteSubAccountField("cn", cnCustomer, subAccountFromInvoiceNo(cnCustomer, invNo));
  });
  document.getElementById("dnCustomer")?.addEventListener("change", ()=>{
    const dnCustomer = document.getElementById("dnCustomer");
    const dnInvoice = document.getElementById("dnInvoice");
    syncNoteSubAccountField("dn", dnCustomer?.value || "");
    if(dnCustomer && dnInvoice) fillNoteInvoices(dnInvoice, dnCustomer.value);
  });
  document.getElementById("dnInvoice")?.addEventListener("change", ()=>{
    const dnCustomer = document.getElementById("dnCustomer")?.value || "";
    const invNo = document.getElementById("dnInvoice")?.value || "";
    syncNoteSubAccountField("dn", dnCustomer, subAccountFromInvoiceNo(dnCustomer, invNo));
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
    renderCnReturnRows(inv);
  });
  document.getElementById("dnInvoice")?.addEventListener("change", ()=>{
    // Debit note is an additional charge - do not auto-fill amount from invoice balance
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
      const items = buildNotificationItems();
      acknowledgeNotifications(items);
      setNotifBadge(0);
      p.hidden = false;
      refreshNotifications();
      return;
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
        : `Local backup downloaded (${res.local?.filename || ""}) - check Downloads`);
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
      toast("Local restore started - data will appear as sync completes");
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
  ["ledgerCustomer","stmtCustomer","waCustomer","invCustomer","rvCustomer","cnCustomer","dnCustomer","chqCustomer","discCustomer","vCustomer","jcCustomer"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) customerOptions(el, el.value);
  });
  filterVehiclesForInvoice();
  syncLedgerSubAccountField();
  syncStmtSubAccountField();
  syncLedgerPeriodUi();
  syncStmtPeriodUi();
  syncInvoiceSubAccountField(document.getElementById("invSubAccount")?.value || "");
  syncReceiptSubAccountField(document.getElementById("rvSubAccount")?.value || "");
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

/** Idle return ? Dashboard: visibilitychange only (not a reading-time timer). Invoice WIP localStorage is preserved. */
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
      toast("Backup in progress-");
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
  // iPhone PWA/browser: NO close popup - silent periodic + pagehide only.
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
      console.warn("@capacitor/app not registered - install plugin and cap sync");
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
    // Linked but invoice missing/deleted ? still count so money is not lost
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
  // Same book as Customer Outstanding / Ledger - net all customers (advances reduce total)
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
    ["OPEN INVOICE BAL.", money(open.reduce((s,i)=> s + invBalance(i), 0)), open.length + " invoices - unpaid invoice totals only (excludes advances)"]
  ].map(([a,b,c], i)=>
    `<div class="card dash-card dash-card--${i + 1}"><div class="metric-label">${a}</div><div class="metric">${b}</div><div class="metric-note">${c}</div></div>`
  ).join("");

  const buckets = agingSums();
  const max = Math.max(1, ...Object.values(buckets));
  const labels = [["current","Current"],["d30","1-30"],["d60","31-60"],["d90","61-90"],["d90p","90+"]];
  document.getElementById("dashAging").innerHTML = labels.map(([k,l])=>
    `<div class="age-row age-row--${k}"><span class="age-label">${l}</span><div class="bar"><i class="age-bar age-bar--${k}" style="width:${Math.round(buckets[k]/max*100)}%"></i></div><b class="age-amt">${money(buckets[k])}</b></div>`
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
  allReceivableCustomers().forEach(name=>{
    const b = customerAgingBuckets(name);
    Object.keys(buckets).forEach(k=> { buckets[k] = roundMoney(buckets[k] + b[k]); });
  });
  return buckets;
}

function renderAging(){
  const b = agingSums();
  const cardSpecs = [
    ["CURRENT", b.current, "aging-card--current"],
    ["1-30 DAYS", b.d30, "aging-card--d30"],
    ["31-60 DAYS", b.d60, "aging-card--d60"],
    ["61-90 DAYS", b.d90, "aging-card--d90"],
    ["90+ DAYS", b.d90p, "aging-card--d90p"],
    ["TOTAL", b.current+b.d30+b.d60+b.d90+b.d90p, "aging-card--total"]
  ];
  document.getElementById("agingCards").innerHTML = cardSpecs.map(([l,v,cls])=>
    `<div class="card aging-card ${cls}"><div class="metric-label">${l}</div><div class="metric">${money(v)}</div></div>`
  ).join("");

  const map = {};
  allReceivableCustomers().forEach(name=>{
    map[name] = customerAgingBuckets(name);
  });
  document.getElementById("agingRows").innerHTML = Object.entries(map).map(([name,x])=>{
    const tot = roundMoney(x.current+x.d30+x.d60+x.d90+x.d90p);
    if(tot <= 0.009) return "";
    const overdue = roundMoney(x.d30 + x.d60 + x.d90 + x.d90p);
    return `<tr>
      <td class="aging-cust" title="${esc(name)}">${esc(name)}</td>
      <td class="age-cell age-cell--current">${money(x.current)}</td>
      <td class="age-cell age-cell--d30">${money(x.d30)}</td>
      <td class="age-cell age-cell--d60">${money(x.d60)}</td>
      <td class="age-cell age-cell--d90">${money(x.d90)}</td>
      <td class="age-cell age-cell--d90p">${money(x.d90p)}</td>
      <td class="age-cell age-cell--total" title="Same as Statement closing${overdue > 0.009 ? ` · overdue ${money(overdue)}` : ""}"><b>${money(tot)}</b></td>
      <td class="aging-action"><button class="btn small" type="button" data-stmt="${esc(name)}">Statement</button></td>
    </tr>`;
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
    <td class="cust-code">${esc(c.code)}</td>
    <td class="cust-name cell-dbl-open" data-dbl-open="${esc(c.id)}" title="${esc(c.name)}">${esc(c.name)}</td>
    <td class="cust-contact">${esc(c.contact)}</td>
    <td class="cust-mobile">${esc(c.mobile)}</td>
    <td class="cust-num">${money(c.creditLimit)}</td>
    <td class="cust-num">${money(customerOutstanding(c.name))}</td>
    <td class="cust-num ${customerOverdue(c.name)?"red":""}">${money(customerOverdue(c.name))}</td>
    <td class="cust-status">${badge(c.status||"Active")}</td>
    <td class="cust-action"><button class="btn small" type="button" data-edit-c="${c.id}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="9" class="empty">No customers - add one</td></tr>`;
  document.querySelectorAll("[data-edit-c]").forEach(b=> b.onclick = ()=> editCustomer(b.dataset.editC));
}

function resetCustomer(){
  cId.value = "";
  cCode.value = `CUS-${String(customers.length + 1).padStart(4, "0")}`;
  cName.value = cContact.value = cMobile.value = cWhatsapp.value = cEmail.value = cTrn.value = cAddr.value = cNotes.value = "";
  if(cSalesman) cSalesman.value = "";
  if(cTerms) cTerms.value = "30 Days Credit";
  if(cOpening) cOpening.value = 0;
  cLimit.value = 0; cDays.value = shop.creditDays || 30; cStatus.value = "Active"; cType.value = "Garage";
  _customerSubAccounts = [];
  const cSubName = document.getElementById("cSubName");
  if(cSubName) cSubName.value = "";
  renderCustomerSubRows();
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
  if(cOpening) cOpening.value = c.openingBalance ?? 0;
  _customerSubAccounts = normalizeCustomerSubAccounts(c.subAccounts);
  const cSubName = document.getElementById("cSubName");
  if(cSubName) cSubName.value = "";
  renderCustomerSubRows();
  openFormModal("customerModal", { skipPrepare: true });
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
  if(dup && !confirm(`A customer named '${dup.name}' already exists (Code: ${dup.code||"-"}, Status: ${dup.status||"-"}). Adding a duplicate can cause the wrong customer record's credit limit/block-status to apply on invoices. Continue anyway?`)) return;
  const prevCustomer = cId.value ? customers.find(x=> x.id === cId.value) : null;
  const oldName = String(prevCustomer?.name || "").trim();
  const renaming = !!(cId.value && oldName && oldName !== name);
  let renameRefs = [];
  if(renaming){
    const { refs, blocked } = collectCustomerNameRefs(oldName);
    if(blocked.length){
      return toast(`Cannot rename - you lack write permission for ${blocked.join(", ")}. Ask the owner to rename.`);
    }
    renameRefs = refs;
    const ok = confirm(
      `Rename customer "${oldName}" ? "${name}"?\n\n` +
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
    paymentTerms: (cTerms?.value||"").trim(), openingBalance: num(cOpening?.value),
    addr: cAddr.value.trim(), notes: cNotes.value.trim(),
    subAccounts: normalizeCustomerSubAccounts(_customerSubAccounts),
    ...masterMeta()
  };
  if(prevCustomer){
    const oldSubs = normalizeCustomerSubAccounts(prevCustomer.subAccounts).map(s=> s.name);
    const nextNames = new Set(data.subAccounts.map(s=> s.name.toLowerCase()));
    const removed = oldSubs.filter(n=> !nextNames.has(n.toLowerCase()));
    const custKey = renaming ? oldName : name;
    for(const subName of removed){
      const used = invoices.some(i=> i.customer === custKey && String(i.subAccount || "").trim() === subName)
        || receipts.some(r=> r.customer === custKey && String(r.subAccount || "").trim() === subName);
      if(used && !confirm(
        `Sub-account "${subName}" is used on existing invoices/receipts.\n` +
        `Remove it from the master anyway?\n\n` +
        `(Old documents keep the name - filter will still work.)`
      )) return;
    }
  }
  try{
    const write = (async ()=>{
      if(!cId.value){
        const createMeta = masterCreateMeta();
        await addDoc(col("customers"), { ...data, ...createMeta });
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
        leaveFormAfterSave("customerModal");
        return logActivity({
          action: "edit", staffName: who(), customer: name,
          summary: renaming
            ? `Customer renamed ${oldName} ? ${name} (${renameRefs.length} linked record(s))`
            : "Customer saved " + name,
          oldValue: renaming ? oldName : "",
          newValue: renaming ? name : ""
        });
      }),
      { okMsg: renaming ? `Customer renamed - ${renameRefs.length} linked record(s) updated` : "Customer saved" }
    ).catch(()=> {});
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function renderInvoices(){
  const q = (document.getElementById("invoiceSearch").value||"").toLowerCase();
  const rows = invoices.filter(i=>{
    const st = invStatus(i);
    if(invoiceFilter && st !== invoiceFilter) return false;
    return `${i.invNo} ${i.computerNo||""} ${i.manualNo||""} ${i.customer} ${i.subAccount||""} ${i.vehicle}`.toLowerCase().includes(q);
  }).sort((a,b)=> String(b.invDate).localeCompare(String(a.invDate)));
  document.getElementById("invoiceRows").innerHTML = rows.length ? rows.map(i=>{
    const st = invStatus(i);
    const bucket = st === "Overdue" ? overdueBucketFromDays(daysPastDue(i.dueDate)) : null;
    const rowClass = overdueRowClass(bucket, "inv");
    return `<tr class="${rowClass}">
    <td class="cell-dbl-open" data-dbl-open="${esc(i.id)}" title="Double-click to open">${esc(i.invNo)}${i.computerNo?`<div class="muted" style="font-size:11px">PC: ${esc(i.computerNo)}</div>`:""}${i.manualNo?`<div class="muted" style="font-size:11px">Manual: ${esc(i.manualNo)}</div>`:""}</td><td>${esc(invoiceDateDisplay(i))}${i.billingStyle==="monthly"?`<div class="muted" style="font-size:11px">Monthly</div>`:""}</td><td class="cell-dbl-open" data-dbl-open="${esc(i.id)}" title="Double-click to open">${esc(i.customer)}${i.subAccount?`<div class="muted" style="font-size:11px">${esc(i.subAccount)}</div>`:""}</td><td>${esc(i.vehicle)}</td>
    <td>${esc(i.dueDate)}${st === "Overdue" ? `<div class="muted" style="font-size:11px">${daysPastDue(i.dueDate)}d overdue</div>` : ""}</td><td>${money(i.total)}</td><td>${money(i.paid)}</td>
    <td>${money(invBalance(i))}</td><td>${badge(st)}</td>
    <td class="actions" style="white-space:nowrap">
      <button class="btn small" type="button" data-open-inv="${i.id}">Edit</button>
      <button class="btn small danger" type="button" data-del-inv="${i.id}">Delete</button>
    </td>
  </tr>`;
  }).join("") : `<tr><td colspan="10" class="empty">No invoices</td></tr>`;
  document.querySelectorAll("[data-open-inv]").forEach(b=> b.onclick = ()=> editInvoice(b.dataset.openInv));
  document.querySelectorAll("[data-del-inv]").forEach(b=> b.onclick = ()=> deleteInvoice(b.dataset.delInv));
}

function stockableInvoiceItems(items){
  const rows = items || [];
  if(!rows.length) return [];
  if(rows.length === 1){
    const n = String(rows[0].name || "").toLowerCase();
    if(n.includes("invoice total") || n === "total") return [];
  }
  const out = [];
  for(const it of rows){
    if(String(it.lineType || "") === "labour") continue;
    const qty = num(it.qty);
    const issued = num(it.jobIssuedQty);
    const remain = qty - issued;
    if(remain <= 0.0001) continue;
    out.push(issued > 0 ? { ...it, qty: remain } : it);
  }
  return out;
}

async function applySalesStockDeltaLocal(items, direction, warehouseId, docRef){
  if(!items?.length) return;
  try{
    await applySalesStockDelta(items, warehouseId ?? "Main", direction, docRef);
  }catch(e){
    throw new Error(inventoryErrorText(e?.message || e));
  }
}

function catalogStockInvoiceItems(items){
  return catalogMatchedLines(stockableInvoiceItems(items));
}

async function applyInvoiceStockMoves(existing, status, newItems, invNo, warehouseId){
  const wh = warehouseId || existing?.stockLocation || "Main";
  const prevWh = existing?.stockLocation || "Main";
  const stockItems = stockableInvoiceItems(newItems);
  const oldStockItems = stockableInvoiceItems(existing?.items);
  if(existing?.status === "Posted" && status === "Posted"){
    await applySalesStockDeltaLocal(oldStockItems, 1, prevWh, invNo);
    try{
      await validateStockForLines(stockItems, wh, -1);
      await applySalesStockDeltaLocal(stockItems, -1, wh, invNo);
    }catch(e){
      await applySalesStockDeltaLocal(oldStockItems, -1, prevWh, invNo);
      throw e;
    }
  }else if(existing?.status !== "Posted" && status === "Posted"){
    await validateStockForLines(stockItems, wh, -1);
    await applySalesStockDeltaLocal(stockItems, -1, wh, invNo);
  }else if(existing?.status === "Posted" && status === "Draft"){
    await applySalesStockDeltaLocal(oldStockItems, 1, prevWh, invNo);
  }
}

async function rollbackInvoiceStockMoves(existing, status, newItems, invNo, warehouseId){
  const wh = warehouseId || existing?.stockLocation || "Main";
  const prevWh = existing?.stockLocation || "Main";
  const stockItems = stockableInvoiceItems(newItems);
  const oldStockItems = stockableInvoiceItems(existing?.items);
  if(existing?.status === "Posted" && status === "Posted"){
    await applySalesStockDeltaLocal(stockItems, 1, wh, invNo);
    await applySalesStockDeltaLocal(oldStockItems, -1, prevWh, invNo);
  }else if(existing?.status !== "Posted" && status === "Posted"){
    await applySalesStockDeltaLocal(stockItems, 1, wh, invNo);
  }else if(existing?.status === "Posted" && status === "Draft"){
    await applySalesStockDeltaLocal(oldStockItems, -1, prevWh, invNo);
  }
}

async function deleteInvoice(id){
  if(!requireModule("invoices")) return;
  const i = invoices.find(x=> x.id === id);
  if(!i) return toast("Invoice not found");
  if(num(i.paid) > 0){
    return toast("Cannot delete - payment already allocated. Remove receipt allocation first.");
  }
  if(num(i.credited) > 0){
    return toast("Cannot delete - credit/discount already applied on this invoice.");
  }
  const linkedDn = debitNotes.some(n=>
    noteIsLive(n)
    && String(n.invoice || "").trim() === String(i.invNo || "").trim()
    && n.customer === i.customer
  );
  if(linkedDn){
    return toast("Cannot delete - a debit note is linked to this invoice.");
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
    return toast("Cannot delete - a credit note is linked to this invoice.");
  }
  const msg = `Delete invoice ${i.invNo} (${money(i.total)})?\nCustomer: ${i.customer}\n\nThis cannot be undone.`;
  if(!confirm(msg)) return;
  const stockItems = stockableInvoiceItems(i.items);
  const stockWh = i.stockLocation || "Main";
  let stockReversed = false;
  try{
    if(i.status === "Posted" && stockItems.length){
      await applySalesStockDeltaLocal(stockItems, 1, stockWh, i.invNo);
      stockReversed = true;
    }
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
    if(i.jobCardId){
      try{ await unlinkJobCardInvoice(i.jobCardId, i.id); }catch(linkErr){ console.warn("[S4 job invoice unlink]", linkErr); }
    }
  }catch(e){
    if(stockReversed){
      try{
        await applySalesStockDeltaLocal(stockItems, -1, stockWh, i.invNo);
      }catch(undoErr){
        console.warn("[S4 invoice delete] stock undo failed", undoErr);
        return toast("Invoice not deleted - stock was adjusted; try again or fix stock manually.");
      }
    }
    toast(e?.message || String(e));
  }
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
  if(!(isOwnerRole(member) || isOwnerRole())){
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
    toast(mode === "simple" ? "Simple total mode - applied for all staff" : "Detailed line mode - applied for all staff");
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
  const bindBilling = (id, style)=>{
    const btn = document.getElementById(id);
    if(!btn || btn._invBillingClick) return;
    btn._invBillingClick = true;
    btn.addEventListener("click", e=>{
      e.preventDefault();
      e.stopPropagation();
      selectInvoiceBillingStyle(style);
    });
  };
  bindBilling("invoiceBillingMonthlyBtn", "monthly");
  bindBilling("invoiceBillingDateBtn", "date");
  if(!root._invModeWired){
    root._invModeWired = true;
    root.addEventListener("click", e=>{
      const modeBtn = e.target.closest("[data-invoice-mode]");
      if(modeBtn && !modeBtn.disabled){
        e.preventDefault();
        selectInvoiceEntryMode(modeBtn.getAttribute("data-invoice-mode"));
        return;
      }
      const billBtn = e.target.closest("[data-invoice-billing]");
      if(billBtn && !billBtn.disabled){
        e.preventDefault();
        selectInvoiceBillingStyle(billBtn.getAttribute("data-invoice-billing"));
      }
    });
  }
  syncInvoiceModeSettingsUi();
  syncInvoiceBillingSettingsUi();
}

function syncInvoiceModeSettingsUi(){
  const mode = getShopInvoiceEntryMode();
  const owner = isOwnerRole(member) || isOwnerRole();
  document.querySelectorAll("[data-invoice-mode]").forEach(btn=>{
    btn.classList.toggle("active", btn.getAttribute("data-invoice-mode") === mode);
    btn.disabled = !owner;
  });
  const hint = document.getElementById("invoiceModeHint");
  if(hint){
    hint.textContent = owner
      ? "Owner: pick a mode with one click - the same mode applies automatically on every salesman PC."
      : `Current shop mode: ${mode === "simple" ? "Total amount only" : "Detailed entry"} (only the Owner can change it).`;
  }
}

function getShopInvoiceBillingStyle(){
  const fromShop = shop?.invoiceBillingStyle;
  if(fromShop === "monthly" || fromShop === "date"){
    _invoiceBillingStyleMem = fromShop;
    return fromShop;
  }
  if(isTotalMode(shop)) return "monthly";
  try{
    const m = localStorage.getItem(INVOICE_BILLING_STYLE_KEY);
    if(m === "monthly" || m === "date") return m;
  }catch(_){}
  return _invoiceBillingStyleMem || "date";
}

function invoiceMonthYearFromDoc(inv){
  if(inv?.billingStyle === "monthly" && inv.billingYear != null && inv.billingMonth != null){
    return { year: num(inv.billingYear), monthIndex0: num(inv.billingMonth) };
  }
  const d = String(inv?.invDate || "").slice(0, 10);
  if(!d) return null;
  return { year: num(d.slice(0, 4)), monthIndex0: num(d.slice(5, 7)) - 1 };
}

function invoiceDateDisplay(inv){
  if(!inv) return "";
  if(inv.billingStyle === "monthly"){
    const my = invoiceMonthYearFromDoc(inv);
    if(my && my.monthIndex0 >= 0 && my.monthIndex0 <= 11) return `${MONTH_NAMES[my.monthIndex0]} ${my.year}`;
  }
  return inv.invDate || "";
}

function initInvBillPeriodControls(){
  const y = document.getElementById("invBillYear");
  const m = document.getElementById("invBillMonth");
  if(y && !y.value) y.value = new Date().getFullYear();
  if(m && (m.value === "" || m.selectedIndex < 0)) m.value = String(new Date().getMonth());
}

function syncInvDateFromBillingPeriod({ recalcDue = true } = {}){
  if(getShopInvoiceBillingStyle() !== "monthly") return;
  initInvBillPeriodControls();
  const year = num(document.getElementById("invBillYear")?.value) || new Date().getFullYear();
  const monthIndex0 = num(document.getElementById("invBillMonth")?.value);
  const range = monthRangeIso(year, monthIndex0);
  if(invDate) invDate.value = range.to;
  if(recalcDue && shouldAutoInvoiceDue()){
    const name = invCustomer?.value || "";
    const c = customers.find(x=> x.name === name);
    const days = num(c?.creditDays) || num(shop.creditDays) || 30;
    if(invDue) invDue.value = addDaysToIsoDate(range.to, days);
  }
}

function setInvBillPeriod(year, monthIndex0){
  const yEl = document.getElementById("invBillYear");
  const mEl = document.getElementById("invBillMonth");
  if(yEl) yEl.value = num(year) || new Date().getFullYear();
  if(mEl) mEl.value = String(Math.max(0, Math.min(11, num(monthIndex0))));
  syncInvDateFromBillingPeriod({ recalcDue: true });
}

function syncInvoiceBillingUi(){
  const monthly = getShopInvoiceBillingStyle() === "monthly";
  const dateWrap = document.querySelector(".inv-billing-date-wrap");
  const monthWrap = document.getElementById("invBillingMonthlyWrap");
  if(dateWrap) dateWrap.hidden = monthly;
  if(monthWrap) monthWrap.hidden = !monthly;
  if(monthly){
    initInvBillPeriodControls();
    syncInvDateFromBillingPeriod({ recalcDue: false });
  }
}

async function selectInvoiceBillingStyle(style){
  const s = style === "monthly" ? "monthly" : "date";
  if(!(isOwnerRole(member) || isOwnerRole())){
    toast("Only the Owner can change invoice billing style");
    syncInvoiceBillingSettingsUi();
    return;
  }
  _invoiceBillingStyleMem = s;
  try{ localStorage.setItem(INVOICE_BILLING_STYLE_KEY, s); }catch(_){}
  syncInvoiceBillingSettingsUi();
  applyInvoiceBillingUi();
  try{
    await setDoc(doc(db, "shop", "info"), { invoiceBillingStyle: s, updatedAt: Date.now() }, { merge: true });
    toast(s === "monthly" ? "Monthly billing (Month + Year) - applied for all staff" : "Specific date billing - applied for all staff");
  }catch(e){
    toast(friendlyFirestoreError(e));
  }
}

function syncInvoiceBillingSettingsUi(){
  const style = getShopInvoiceBillingStyle();
  const owner = isOwnerRole(member) || isOwnerRole();
  document.querySelectorAll("[data-invoice-billing]").forEach(btn=>{
    btn.classList.toggle("active", btn.getAttribute("data-invoice-billing") === style);
    btn.disabled = !owner;
  });
  const hint = document.getElementById("invoiceBillingHint");
  if(hint){
    hint.textContent = owner
      ? "Owner: monthly billing uses Month + Year on the invoice (one full-month invoice per customer)."
      : `Current billing: ${style === "monthly" ? "Month & Year" : "Specific date"} (only the Owner can change it).`;
  }
}

function applyInvoiceBillingUi(){
  syncInvoiceBillingUi();
  if(getShopInvoiceBillingStyle() === "monthly") syncInvDateFromBillingPeriod({ recalcDue: shouldAutoInvoiceDue() });
}

function applyInvoiceEntryMode(){
  const simple = getInvoiceEntryMode() === "simple";
  const detailed = document.getElementById("invDetailedBlock");
  const simpleBlock = document.getElementById("invSimpleBlock");
  if(detailed) detailed.hidden = simple;
  if(simpleBlock) simpleBlock.hidden = !simple;
  const vatInfo = document.getElementById("invSimpleVatInfo");
  if(vatInfo) vatInfo.value = `VAT ${num(shop.vatRate) || 5}% included in total`;
  applyInvoiceBillingUi();
  calcInvoice();
}

/** Daily 11:00 reminder starting 10 days before expiry (trial or license). */
const EXPIRY_WARN_DAYS = 10;
const EXPIRY_NOTIF_HOUR = 11;
const EXPIRY_NOTIF_KEY = "s4_expiry_notif_day_v1";
const NOTIF_ACK_KEY = "s4_notif_ack_fp_v1";

function buildNotificationItems(){
  const items = [];
  if(window._s4ExpiryBanner){
    items.push({
      fpKey: `expiry|${window._s4ExpiryBanner.days ?? ""}|${String(window._s4ExpiryBanner.title || "")}`,
      title: window._s4ExpiryBanner.title,
      detail: window._s4ExpiryBanner.detail,
      page: "settings"
    });
  }
  const overdue = invoices.filter(i=> invStatus(i) === "Overdue");
  if(overdue.length){
    const sum = roundMoney(overdue.reduce((s,i)=> s + invBalance(i), 0));
    items.push({
      fpKey: `aging|${overdue.length}|${sum}`,
      title:`${overdue.length} overdue invoice(s)`,
      detail: money(sum),
      page:"aging"
    });
  }
  const pendingChq = cheques.filter(c=> c.status === "Pending" || c.status === "Deposited");
  if(pendingChq.length){
    const sum = roundMoney(pendingChq.reduce((s,c)=> s + num(c.amount), 0));
    items.push({
      fpKey: `cheques|${pendingChq.length}|${sum}`,
      title:`${pendingChq.length} pending cheque(s)`,
      detail: money(sum),
      page:"cheques"
    });
  }
  const unalloc = receipts.filter(r=> num(r.unallocated) > 0.009 && receiptAffectsBalance(r));
  if(unalloc.length){
    const sum = roundMoney(unalloc.reduce((s,r)=> s + num(r.unallocated), 0));
    items.push({
      fpKey: `allocation|${unalloc.length}|${sum}`,
      title:`${unalloc.length} unallocated receipt(s)`,
      detail: money(sum),
      page:"allocation"
    });
  }
  const hold = customers.filter(c=> c.status === "Hold" || c.status === "Blocked");
  if(hold.length){
    items.push({
      fpKey: `customers|${hold.length}`,
      title:`${hold.length} customer(s) on hold/blocked`,
      detail:"",
      page:"customers"
    });
  }
  return items;
}

function notificationFingerprint(items){
  return items.map(it=> it.fpKey || it.page).join(";");
}

function loadNotifAck(){
  try{ return localStorage.getItem(NOTIF_ACK_KEY) || ""; }catch(_){ return ""; }
}

function acknowledgeNotifications(items){
  const fp = notificationFingerprint(items);
  window._s4NotifAckFp = fp;
  window._s4NotifBellOpened = true;
  try{ localStorage.setItem(NOTIF_ACK_KEY, fp); }catch(_){}
}

function setNotifBadge(unread){
  const countEl = document.getElementById("notifCount");
  if(!countEl) return;
  const n = Math.max(0, Number(unread) || 0);
  countEl.textContent = String(n);
  countEl.hidden = n === 0;
}

function unreadNotificationCount(items){
  if(!items.length) return 0;
  const fp = notificationFingerprint(items);
  if(window._s4NotifLastFp != null && fp !== window._s4NotifLastFp){
    window._s4NotifBellOpened = false;
  }
  window._s4NotifLastFp = fp;
  const acked = window._s4NotifAckFp ?? loadNotifAck();
  if(window._s4NotifAckFp == null) window._s4NotifAckFp = acked;
  if(window._s4NotifBellOpened || fp === acked) return 0;
  return items.length;
}

/** OS / system tray notification - Web Notification fails inside Android WebView. */
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
        ? `Expire date: ${String(end).slice(0, 10)} - Help & Support ? Contact S4 Business Thinking`
        : "Help & Support ? Contact S4 Business Thinking",
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
    ? `Expire date: ${String(end).slice(0, 10)} - Help & Support ? Contact S4 Business Thinking`
    : "Help & Support ? Contact S4 Business Thinking";
  window._s4ExpiryBanner = { title, detail, days, at: Date.now() };
  refreshNotifications();
  if(already) return;
  toast(`${title} - ${detail}`);
  await showSystemNotification(title, detail);
  try{ localStorage.setItem(EXPIRY_NOTIF_KEY, dayKey); }catch(_){}
}

function invoiceWipFieldIds(){
  return ["invId","invNo","invComputer","invManual","invDate","invDue","invBillMonth","invBillYear","invStockLoc","invCustomer","invSubAccount","invVehicle","invDriver","invReceived","invDn","invLpo","invRef","invTerms","invNotes","invSimpleTotal","invJobCardId","invJobNo"];
}

function productDefaultDiscountPct(product){
  const raw = String(product?.defaultDiscount ?? "").trim().replace(/%$/, "");
  const pct = num(raw);
  return pct > 0 ? pct : 0;
}

function syncInvEntryDefaultDiscount(){
  const discEl = document.getElementById("invEntryDisc");
  if(!discEl || !_invEntryDefaultDiscPct) return;
  const qty = num(document.getElementById("invEntryQty")?.value) || 1;
  const price = num(document.getElementById("invEntryPrice")?.value);
  discEl.value = roundMoney(qty * price * _invEntryDefaultDiscPct / 100);
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
  const jobIssuedQty = Math.max(0, num(raw.jobIssuedQty));
  const lineType = raw.lineType === "labour" ? "labour" : (raw.lineType === "part" ? "part" : "");
  return { name, code, qty, price, disc, vat, net, vatAmt, line: net + vatAmt, jobIssuedQty, lineType };
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
  _invEntryDefaultDiscPct = 0;
  _invRestoreJobIssuedQty = num(it.jobIssuedQty);
  _invRestoreLineType = it.lineType === "labour" ? "labour" : (it.lineType === "part" ? "part" : "");
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
  _invEntryDefaultDiscPct = 0;
  _invRestoreJobIssuedQty = 0;
  _invRestoreLineType = "";
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
    el.textContent = "-";
    return;
  }
  el.textContent = money(normalizeInvLineItem(draft).line);
}

function renderInvItemList(){
  const tbody = document.getElementById("invItemRows");
  if(!tbody) return;
  if(!_invoiceLineItems.length){
    tbody.innerHTML = `<tr class="inv-empty-row"><td colspan="8" class="empty" data-label="">No items added yet - use Add above</td></tr>`;
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
  if(_invRestoreJobIssuedQty && num(draft.qty) + 0.0001 < _invRestoreJobIssuedQty){
    return toast("Qty cannot be below already issued from the job");
  }
  _invoiceLineItems.push({
    name: String(draft.name).trim(),
    code: String(draft.code).trim(),
    qty: draft.qty,
    price: draft.price,
    disc: draft.disc,
    vat: draft.vat,
    jobIssuedQty: _invRestoreJobIssuedQty,
    lineType: _invRestoreLineType
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
  if(_invRestoreJobIssuedQty && num(draft.qty) + 0.0001 < _invRestoreJobIssuedQty){
    toast("Qty cannot be below already issued from the job");
    return false;
  }
  _invoiceLineItems.push({
    name: String(draft.name).trim(),
    code: String(draft.code).trim(),
    qty: draft.qty,
    price: draft.price,
    disc: draft.disc,
    vat: draft.vat,
    jobIssuedQty: _invRestoreJobIssuedQty,
    lineType: _invRestoreLineType
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
      vat: it.vat ?? (shop.vatRate ?? 5),
      jobIssuedQty: Math.max(0, num(it.jobIssuedQty)),
      lineType: it.lineType === "labour" ? "labour" : (it.lineType === "part" ? "part" : "")
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
  // Always follow current shop preference - never lock UI to a stale WIP mode
  _formInvoiceMode = null;
  applyInvoiceEntryMode();
  invoiceWipFieldIds().forEach(id=>{
    const el = document.getElementById(id);
    if(el && state[id] != null) el.value = state[id];
  });
  if(state.invCustomer){
    const invCustomerEl = document.getElementById("invCustomer");
    if(invCustomerEl){
      customerOptions(invCustomerEl, state.invCustomer);
      invCustomerEl.value = state.invCustomer;
    }
    const invCustomerInput = document.getElementById("invCustomerInput");
    if(invCustomerInput) invCustomerInput.value = state.invCustomer;
    syncInvoiceCustomerFromMaster({ recalcDue: false, preserveSub: true });
    if(state.invSubAccount != null) syncInvoiceSubAccountField(state.invSubAccount);
  }
  if(state.invStockLoc) syncInvStockLocation(state.invStockLoc);
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
  // Editing existing invoice: outstanding already includes old total - don't double-count
  const existing = invId?.value ? invoices.find(x=> x.id === invId.value) : null;
  const oldTotal = existing && existing.status !== "Draft" ? num(existing.total) : 0;
  const dnLinked = linkedDebitTotalForInvoice(invNo?.value, name);
  const after = due - oldTotal + num(grand) + dnLinked;
  if(invLim) invLim.textContent = c ? money(limit) : "-";
  if(invDueNow) invDueNow.textContent = name ? money(due) : "-";
  if(invNowTot) invNowTot.textContent = money(roundMoney(num(grand) + dnLinked));
  if(invAfter){
    invAfter.textContent = name ? money(after) : "-";
    invAfter.style.color = (limit > 0 && after > limit) ? "#d92d20" : "#079455";
  }
}

function addDaysToIsoDate(isoDate, days){
  const d = new Date(String(isoDate) + "T12:00:00");
  if(Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.max(0, num(days)));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Hard-block when same party + same date + same document number match.
 * Credit invoice: customer + invDate + manualNo OR computerNo (sub-account optional, not part of dup key)
 * Purchase invoice: supplier + date + supplierInvNo
 */
function findDuplicatePartyDocInvoice({ rows, excludeId, date, party, partyField, dateField, numbers, sameFields, dateGranularity = "day" }){
  const d = String(date || "").slice(0, 10);
  const p = String(party || "").trim().toLowerCase();
  if(!d || !p) return null;
  const list = rows || [];
  const dateMatches = (rowVal)=>{
    const rv = String(rowVal || "").slice(0, 10);
    if(dateGranularity === "month") return rv.slice(0, 7) === d.slice(0, 7);
    return rv === d;
  };
  for(const spec of numbers || []){
    const val = String(spec?.value || "").trim().toLowerCase();
    if(!val) continue;
    const field = spec.field;
    const hit = list.find(row=>{
      if(excludeId && row.id === excludeId) return false;
      if(!dateMatches(row[dateField])) return false;
      if(String(row[partyField] || "").trim().toLowerCase() !== p) return false;
      if(sameFields){
        for(const [k, v] of Object.entries(sameFields)){
          if(String(row[k] || "").trim().toLowerCase() !== String(v || "").trim().toLowerCase()) return false;
        }
      }
      return String(row[field] || "").trim().toLowerCase() === val;
    });
    if(hit) return { row: hit, label: spec.label || field, field, value: spec.value };
  }
  return null;
}

function shouldAutoInvoiceDue(){
  const existing = invId?.value ? invoices.find(x=> x.id === invId.value) : null;
  return !existing || existing.status === "Draft";
}

function syncInvoiceCustomerFromMaster(opts = {}){
  const recalcDue = opts.recalcDue !== false;
  const name = invCustomer?.value || "";
  const c = customers.find(x=> x.name === name);
  const days = num(c?.creditDays) || num(shop.creditDays) || 30;
  const invCustomerInput = document.getElementById("invCustomerInput");
  if(invCustomerInput && invCustomerInput.value !== name) invCustomerInput.value = name;
  if(invTerms) invTerms.value = c?.paymentTerms || `${days} Days Credit`;
  const invCreditDays = document.getElementById("invCreditDays");
  if(invCreditDays) invCreditDays.value = name ? String(days) : "";
  if(recalcDue && shouldAutoInvoiceDue()){
    if(getShopInvoiceBillingStyle() === "monthly") syncInvDateFromBillingPeriod({ recalcDue: true });
    else if(invDate?.value) invDue.value = addDaysToIsoDate(invDate.value, days);
  }
  const list = document.getElementById("invVehicleList");
  if(list){
    const rows = vehicles.filter(v=> !name || v.customer === name);
    list.innerHTML = rows.map(v=>{
      const label = [v.plate, v.make, v.model].filter(Boolean).join(" - ");
      return `<option value="${esc(v.plate || "")}">${esc(label)}</option>`;
    }).join("");
  }
  if(document.getElementById("invGrand") || document.getElementById("invSimpleTotal")) calcInvoice();
  else updateCreditCards(0);
  syncInvoiceSubAccountField(opts.preserveSub ? document.getElementById("invSubAccount")?.value : "");
}

function filterVehiclesForInvoice(){
  syncInvoiceCustomerFromMaster();
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
    <td>${esc(v.year || "")}</td><td>${esc(v.colour || "")}</td><td>${esc(v.vin)}</td>
    <td>
      <button class="btn small" type="button" data-edit-v="${v.id}">Open</button>
      <button class="btn small danger" type="button" data-del-v="${v.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="8" class="empty">No vehicles - add one</td></tr>`;
  tbody.querySelectorAll("[data-edit-v]").forEach(b=> b.onclick = ()=> editVehicle(b.dataset.editV));
  tbody.querySelectorAll("[data-del-v]").forEach(b=> b.onclick = ()=> deleteVehicle(b.dataset.delV));
}

function resetVehicle(){
  vId.value = "";
  vPlate.value = vMake.value = vModel.value = vVin.value = vEngine.value = "";
  if(vYear) vYear.value = "";
  if(vVariant) vVariant.value = "";
  if(vMileage) vMileage.value = "";
  if(vColour) vColour.value = "";
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
  if(vYear) vYear.value = v.year || "";
  if(vVariant) vVariant.value = v.variant || "";
  if(vMileage) vMileage.value = v.mileage ?? "";
  if(vColour) vColour.value = v.colour || "";
  if(vNotes) vNotes.value = v.notes || "";
  openFormModal("vehicleModal", { skipPrepare: true });
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
  if(dup && !confirm(`Plate '${dup.plate}' already exists for ${dup.customer || "-"}. Continue anyway?`)) return;
  const data = {
    plate, customer, make: (vMake.value||"").trim(), model: (vModel.value||"").trim(),
    year: String(vYear?.value || "").trim(),
    variant: (vVariant?.value||"").trim(),
    vin: (vVin.value||"").trim(), engine: (vEngine.value||"").trim(),
    mileage: num(vMileage?.value),
    colour: (vColour?.value||"").trim(),
    notes: (vNotes?.value||"").trim(),
    ...masterMeta()
  };
  const invoiceOpen = document.getElementById("invoiceModal")?.classList.contains("open");
  try{
    let write;
    if(vId.value) write = updateDoc(doc(db, "vehicles", vId.value), data);
    else { Object.assign(data, masterCreateMeta()); write = addDoc(col("vehicles"), data); }
    if(invoiceOpen) closeModal("vehicleModal");
    commitWrite(
      Promise.resolve(write).then(()=>{
        if(invoiceOpen){
          const invVehicle = document.getElementById("invVehicle");
          if(invVehicle) invVehicle.value = plate;
          filterVehiclesForInvoice();
          queueInvoiceWipSave();
        }else{
          leaveFormAfterSave("vehicleModal");
        }
        return logActivity({ action:"edit", staffName: who(), customer, summary: "Vehicle saved " + plate });
      }),
      { okMsg: "Vehicle saved" }
    ).catch(()=>{});
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

function fillWarehouseBranchSelect(selectedId){
  const sel = document.getElementById("whBranch");
  if(!sel) return;
  const branches = getBranches();
  sel.innerHTML = branches.length
    ? branches.map(b=> `<option value="${esc(b.id)}"${b.id === selectedId ? " selected" : ""}>${esc(b.code)} - ${esc(b.name)}</option>`).join("")
    : `<option value="${getCurrentBranchId()}">Current branch</option>`;
}

function renderWarehouses(){
  const tbody = document.getElementById("warehouseRows");
  if(!tbody) return;
  const q = (document.getElementById("warehouseSearch")?.value || "").toLowerCase();
  const branches = getBranches();
  const branchName = id=> branches.find(b=> b.id === id)?.code || "";
  const rows = getWarehouses().filter(w=>{
    const blob = `${w.code} ${w.name} ${w.addr} ${branchName(w.branchId)}`.toLowerCase();
    return blob.includes(q);
  });
  tbody.innerHTML = rows.length ? rows.map(w=> `<tr>
    <td>${esc(w.code)}</td><td>${esc(w.name)}</td><td>${esc(branchName(w.branchId))}</td>
    <td>${esc(w.addr||"")}</td><td>${badge(w.status === "inactive" ? "Inactive" : "Active")}</td>
    <td><button class="btn small" type="button" data-edit-wh="${esc(w.id)}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="6" class="empty">No warehouses - add one</td></tr>`;
  tbody.querySelectorAll("[data-edit-wh]").forEach(btn=>{
    btn.addEventListener("click", ()=> editWarehouse(btn.dataset.editWh));
  });
}

function resetWarehouse(){
  document.getElementById("whId").value = "";
  const n = getWarehouses().length + 1;
  document.getElementById("whCode").value = `WH-${String(n).padStart(2, "0")}`;
  document.getElementById("whName").value = "";
  document.getElementById("whAddr").value = "";
  document.getElementById("whStatus").value = "active";
  fillWarehouseBranchSelect(getCurrentBranchId());
}

function editWarehouse(id){
  const w = getWarehouses().find(x=> x.id === id);
  if(!w) return;
  document.getElementById("whId").value = w.id;
  document.getElementById("whCode").value = w.code || "";
  document.getElementById("whName").value = w.name || "";
  document.getElementById("whAddr").value = w.addr || "";
  document.getElementById("whStatus").value = w.status === "inactive" ? "inactive" : "active";
  fillWarehouseBranchSelect(w.branchId || getCurrentBranchId());
  openFormModal("warehouseModal", { skipPrepare: true });
}

async function saveWarehouse(){
  if(!requireModule("warehouses")) return;
  try{
    const id = document.getElementById("whId").value;
    await saveWarehouseRecord(id, {
      code: document.getElementById("whCode").value,
      name: document.getElementById("whName").value,
      branchId: document.getElementById("whBranch").value,
      addr: document.getElementById("whAddr").value,
      status: document.getElementById("whStatus").value
    });
    leaveFormAfterSave("warehouseModal");
    toast("Warehouse saved");
    await logActivity({ action: id ? "edit" : "add", staffName: who(), module: "warehouses", record: document.getElementById("whCode").value, summary: "Warehouse saved" });
  }catch(e){
    toast(e?.message === "WAREHOUSE_REQUIRED" ? "Warehouse code and name required" : friendlyFirestoreError(e));
  }
}

function fillStockAdjProducts(){
  const sel = document.getElementById("stkAdjProduct");
  if(!sel) return;
  const rows = products.slice().sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
  sel.innerHTML = `<option value="">- Select product -</option>` + rows.map(p=>
    `<option value="${esc(p.id)}">${esc(p.name)} (${esc(p.code||"-")})</option>`
  ).join("");
}

function syncInvStockLocation(preserveValue){
  const sel = document.getElementById("invStockLoc");
  if(!sel) return;
  fillWarehouseSelect(sel, preserveValue ?? sel.value);
}

function fillStockAdjWarehouses(){
  const sel = document.getElementById("stkAdjWarehouse");
  if(!sel) return;
  fillWarehouseSelect(sel, sel.value || "Main");
}

function prepareStockAdjModal(){
  fillStockAdjProducts();
  fillStockAdjWarehouses();
  const qty = document.getElementById("stkAdjQty");
  const cost = document.getElementById("stkAdjCost");
  const reason = document.getElementById("stkAdjReason");
  const type = document.getElementById("stkAdjType");
  if(qty) qty.value = "0";
  if(cost) cost.value = "0";
  if(reason) reason.value = "";
  if(type) type.value = "OPENING";
}

function fillStockTransferProducts(){
  const sel = document.getElementById("stkTrProduct");
  if(!sel) return;
  const rows = products.slice().sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
  sel.innerHTML = `<option value="">- Select product -</option>` + rows.map(p=>
    `<option value="${esc(p.id)}">${esc(p.name)} (${esc(p.code||"-")})</option>`
  ).join("");
}

function fillStockTransferWarehouses(){
  const fromSel = document.getElementById("stkTrFrom");
  const toSel = document.getElementById("stkTrTo");
  const fromVal = fromSel?.value;
  const toVal = toSel?.value;
  if(fromSel) fillWarehouseSelect(fromSel, fromVal);
  if(toSel) fillWarehouseSelect(toSel, toVal);
  syncStockTransferToWarehouse();
}

function activeBranchCount(){
  const rows = getBranches().filter(b=> b.status !== "inactive");
  return rows.length > 0 ? rows.length : getBranches().length;
}

function branchLabel(branchId){
  const b = getBranches().find(x=> x.id === branchId);
  return b ? `${b.code} - ${b.name}` : String(branchId || "-");
}

function canApproveBranchRequest(req){
  if(!req || req.status !== "pending") return false;
  if(isOwnerRole()) return true;
  return String(req.supplyingBranchId || "") === String(getCurrentBranchId() || "");
}

function updateBranchRequestUi(){
  const needSecond = activeBranchCount() < 2;
  const hint = document.getElementById("ibrHint");
  const listHint = document.getElementById("ibrListHint");
  const saveBtn = document.getElementById("saveBranchRequestBtn");
  const openBtn = document.getElementById("openBranchRequestBtn");
  if(hint) hint.hidden = !needSecond;
  if(listHint) listHint.hidden = !needSecond;
  if(saveBtn) saveBtn.disabled = needSecond;
  if(openBtn){
    openBtn.disabled = needSecond;
    openBtn.title = needSecond ? "Add a second branch in Settings ? Branches first" : "";
  }
}

function fillBranchRequestProducts(){
  const sel = document.getElementById("ibrProduct");
  if(!sel) return;
  const rows = products.slice().sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
  sel.innerHTML = `<option value="">- Select -</option>` + rows.map(p=>
    `<option value="${esc(p.id)}">${esc(p.name)} (${esc(p.code||"-")})</option>`
  ).join("");
}

function fillBranchRequestSupplyBranches(){
  const sel = document.getElementById("ibrSupplyBranch");
  if(!sel) return;
  const cur = getCurrentBranchId();
  const branches = getBranches().filter(b=> b.status !== "inactive" && b.id !== cur);
  const prev = sel.value;
  sel.innerHTML = branches.length
    ? branches.map(b=> `<option value="${esc(b.id)}">${esc(b.code)} - ${esc(b.name)}</option>`).join("")
    : `<option value="">No other branch</option>`;
  if(prev && branches.some(b=> b.id === prev)) sel.value = prev;
}

function fillBranchRequestWarehouses(){
  const reqBranch = getCurrentBranchId();
  const supBranch = document.getElementById("ibrSupplyBranch")?.value || "";
  fillWarehouseSelectForBranch(document.getElementById("ibrToWarehouse"), reqBranch);
  if(supBranch) fillWarehouseSelectForBranch(document.getElementById("ibrFromWarehouse"), supBranch);
}

function syncBranchRequestAvail(){
  const productId = document.getElementById("ibrProduct")?.value || "";
  const fromWh = document.getElementById("ibrFromWarehouse")?.value || "Main";
  const avail = document.getElementById("ibrAvail");
  if(!avail) return;
  if(!productId){ avail.value = "-"; return; }
  avail.value = String(getBalance(productId, fromWh).qty);
}

function prepareBranchRequestModal(){
  fillBranchRequestProducts();
  fillBranchRequestSupplyBranches();
  fillBranchRequestWarehouses();
  const no = document.getElementById("ibrReqNo");
  const date = document.getElementById("ibrReqDate");
  const qty = document.getElementById("ibrQty");
  const reason = document.getElementById("ibrReason");
  const reqBranch = document.getElementById("ibrRequestBranch");
  if(no) no.value = nextNo("IBR-", branchStockRequests, "requestNo");
  if(date) date.value = today();
  if(qty) qty.value = "1";
  if(reason) reason.value = "";
  if(reqBranch) reqBranch.value = branchLabel(getCurrentBranchId());
  updateBranchRequestUi();
  syncBranchRequestAvail();
}

async function saveBranchRequest(){
  if(!requireModule("inventory")) return;
  const supplyingBranchId = document.getElementById("ibrSupplyBranch")?.value || "";
  const productId = document.getElementById("ibrProduct")?.value || "";
  const product = products.find(p=> p.id === productId);
  if(!supplyingBranchId) return toast("Select supplying branch");
  if(!product) return toast("Select a product");
  const qty = num(document.getElementById("ibrQty")?.value);
  if(qty <= 0) return toast("Enter quantity");
  const requestSerial = await allocateDocSerial("branch_request", "IBR-", {
    list: branchStockRequests, field: "requestNo", draftValue: document.getElementById("ibrReqNo")?.value, preferCounter: true
  });
  const requestNo = requestSerial.value;
  try{
    await createBranchStockRequest({
      requestNo,
      date: document.getElementById("ibrReqDate")?.value || today(),
      requestingBranchId: getCurrentBranchId(),
      supplyingBranchId,
      productId,
      productCode: product.code || "",
      productName: product.name || "",
      qty,
      fromWarehouseId: document.getElementById("ibrFromWarehouse")?.value || "Main",
      toWarehouseId: document.getElementById("ibrToWarehouse")?.value || "Main",
      reason: document.getElementById("ibrReason")?.value || ""
    });
    leaveFormAfterSave("branchRequestModal");
    toast("Branch request created - awaiting approval");
    await logActivity({
      action: "add", staffName: who(), module: "inventory",
      record: requestNo, summary: `${qty} - ${product.name} from ${branchLabel(supplyingBranchId)}`
    });
    renderInventory();
  }catch(e){
    toast(inventoryErrorText(e?.message || e));
  }
}

async function approveBranchRequest(id){
  if(!requireModule("inventory")) return;
  const req = branchStockRequests.find(r=> r.id === id);
  if(!req) return toast("Request not found");
  if(!canApproveBranchRequest(req)) return toast("Only the supplying branch (or owner) can approve");
  const transferSerial = await allocateDocSerial("stock_transfer", "TR-", {
    list: stockTransfers, field: "transferNo", preferCounter: true
  });
  const transferNo = transferSerial.value;
  try{
    await approveBranchStockRequest(req, transferNo);
    toast("Request approved - stock transferred");
    await logActivity({
      action: "update", staffName: who(), module: "inventory",
      record: req.requestNo, summary: `Approved ? ${transferNo} - ${req.qty} - ${req.productName}`
    });
    renderInventory();
  }catch(e){
    toast(inventoryErrorText(e?.message || e));
  }
}

async function rejectBranchRequest(id){
  if(!requireModule("inventory")) return;
  const req = branchStockRequests.find(r=> r.id === id);
  if(!req) return toast("Request not found");
  if(!canApproveBranchRequest(req)) return toast("Only the supplying branch (or owner) can reject");
  try{
    await rejectBranchStockRequest(id, "");
    toast("Request rejected");
    await logActivity({
      action: "update", staffName: who(), module: "inventory",
      record: req.requestNo, summary: `Rejected - ${req.qty} - ${req.productName}`
    });
    renderInventory();
  }catch(e){
    toast(inventoryErrorText(e?.message || e));
  }
}

function syncStockTransferToWarehouse(){
  const fromSel = document.getElementById("stkTrFrom");
  const toSel = document.getElementById("stkTrTo");
  if(!fromSel || !toSel) return;
  if(fromSel.value && fromSel.value === toSel.value){
    const alt = [...toSel.options].find(o=> o.value && o.value !== fromSel.value);
    if(alt) toSel.value = alt.value;
  }
}

function updateStockTransferUi(){
  const whCount = activeWarehouseCount();
  const needSecond = whCount < 2;
  const hint = document.getElementById("stkTrHint");
  const saveBtn = document.getElementById("saveStockTransferBtn");
  const openBtn = document.querySelector('[data-open="stockTransferModal"]');
  if(hint) hint.hidden = !needSecond;
  if(saveBtn) saveBtn.disabled = needSecond;
  if(openBtn){
    openBtn.disabled = needSecond;
    openBtn.title = needSecond ? "Add 2+ warehouses in Warehouse Master first" : "";
  }
}

function prepareStockTransferModal(){
  fillStockTransferProducts();
  fillStockTransferWarehouses();
  const no = document.getElementById("stkTrNo");
  const date = document.getElementById("stkTrDate");
  const qty = document.getElementById("stkTrQty");
  const reason = document.getElementById("stkTrReason");
  if(no) no.value = nextNo("TR-", stockTransfers, "transferNo");
  if(date) date.value = today();
  if(qty) qty.value = "1";
  if(reason) reason.value = "";
  updateStockTransferUi();
  syncStockTransferAvail();
}

function syncStockTransferAvail(){
  const productId = document.getElementById("stkTrProduct")?.value || "";
  const fromWh = document.getElementById("stkTrFrom")?.value || "Main";
  const avail = document.getElementById("stkTrAvail");
  if(!avail) return;
  if(!productId){ avail.value = "-"; return; }
  const bal = getBalance(productId, fromWh);
  avail.value = String(bal.qty);
}

async function saveStockTransfer(){
  if(!requireModule("inventory")) return;
  const productId = document.getElementById("stkTrProduct")?.value || "";
  const product = products.find(p=> p.id === productId);
  if(!product) return toast("Select a product");
  const fromWh = document.getElementById("stkTrFrom")?.value || "Main";
  const toWh = document.getElementById("stkTrTo")?.value || "";
  const qty = num(document.getElementById("stkTrQty")?.value);
  if(!toWh) return toast("Select destination warehouse");
  if(fromWh === toWh) return toast("From and To warehouse must be different");
  if(qty <= 0) return toast("Enter quantity");
  const trSerial = await allocateDocSerial("stock_transfer", "TR-", {
    list: stockTransfers, field: "transferNo", draftValue: document.getElementById("stkTrNo")?.value, preferCounter: true
  });
  const transferNo = trSerial.value;
  try{
    await postStockTransfer({
      productId,
      productCode: product.code || "",
      productName: product.name || "",
      fromWarehouseId: fromWh,
      toWarehouseId: toWh,
      qty,
      reason: document.getElementById("stkTrReason")?.value || "",
      transferNo,
      date: document.getElementById("stkTrDate")?.value || today()
    });
    leaveFormAfterSave("stockTransferModal");
    toast("Stock transfer posted");
    await logActivity({
      action: "add", staffName: who(), module: "inventory",
      record: transferNo, summary: `${qty} - ${product.name}: ${formatStockLocation(fromWh)} ? ${formatStockLocation(toWh)}`
    });
    renderInventory();
  }catch(e){
    toast(inventoryErrorText(e?.message || e));
  }
}

function fillStockCountWarehouse(){
  const sel = document.getElementById("stkCountWarehouse");
  if(!sel) return;
  fillWarehouseSelect(sel, sel.value || "Main");
}

function prepareStockCountModal(){
  _stockCountLines = [];
  fillStockCountWarehouse();
  const no = document.getElementById("stkCountNo");
  const date = document.getElementById("stkCountDate");
  const notes = document.getElementById("stkCountNotes");
  if(no) no.value = nextNo("SC-", stockCounts, "countNo");
  if(date) date.value = today();
  if(notes) notes.value = "";
  renderStockCountRows();
}

function stockCountWarehouseId(){
  return document.getElementById("stkCountWarehouse")?.value || "Main";
}

function loadStockCountFromWarehouse(){
  const wh = stockCountWarehouseId();
  const balances = getStockBalances().filter(b=>
    normalizeWarehouseId(b.warehouseId) === normalizeWarehouseId(wh) && num(b.qty) > 0.0001
  );
  if(!balances.length) return toast("No stock in this warehouse - add lines manually");
  _stockCountLines = balances.map(b=>({
    productId: b.productId,
    productCode: b.productCode || "",
    productName: b.productName || "",
    systemQty: num(b.qty),
    physicalQty: num(b.qty),
    reason: ""
  }));
  renderStockCountRows();
  toast(`Loaded ${balances.length} product(s)`);
}

function addStockCountLine(){
  _stockCountLines.push({
    productId: "", productCode: "", productName: "",
    systemQty: 0, physicalQty: 0, reason: ""
  });
  renderStockCountRows();
}

function refreshStockCountSystemQty(){
  const wh = stockCountWarehouseId();
  _stockCountLines.forEach(line=>{
    if(!line.productId) return;
    line.systemQty = getBalance(line.productId, wh).qty;
  });
  renderStockCountRows();
}

function renderStockCountRows(){
  const body = document.getElementById("stkCountRows");
  if(!body) return;
  const wh = stockCountWarehouseId();
  const productOpts = products.slice().sort((a,b)=> String(a.name||"").localeCompare(String(b.name||"")));
  if(!_stockCountLines.length){
    body.innerHTML = `<tr><td colspan="7" class="empty">Load warehouse stock or add a product</td></tr>`;
    return;
  }
  body.innerHTML = _stockCountLines.map((line, idx)=>{
    const sys = line.productId ? getBalance(line.productId, wh).qty : num(line.systemQty);
    const phys = num(line.physicalQty);
    const variance = roundMoney(phys - sys);
    const opts = `<option value="">- Select -</option>` + productOpts.map(p=>
      `<option value="${esc(p.id)}"${p.id === line.productId ? " selected" : ""}>${esc(p.name)} (${esc(p.code||"-")})</option>`
    ).join("");
    return `<tr data-idx="${idx}">
      <td><select class="stk-count-product" data-idx="${idx}">${opts}</select></td>
      <td>${esc(line.productCode || "-")}</td>
      <td class="stk-count-sys">${esc(sys)}</td>
      <td><input class="stk-count-phys" data-idx="${idx}" type="number" step="0.01" value="${phys}"></td>
      <td class="stk-count-var">${variance > 0 ? "+" : ""}${esc(variance)}</td>
      <td><input class="stk-count-reason" data-idx="${idx}" type="text" value="${esc(line.reason || "")}" placeholder="Variance reason"></td>
      <td><button class="btn small danger stk-count-del" type="button" data-idx="${idx}">-</button></td>
    </tr>`;
  }).join("");

  body.querySelectorAll(".stk-count-product").forEach(sel=>{
    sel.addEventListener("change", e=>{
      const i = num(e.target.dataset.idx);
      const p = products.find(x=> x.id === e.target.value);
      if(!p || !_stockCountLines[i]) return;
      _stockCountLines[i].productId = p.id;
      _stockCountLines[i].productCode = p.code || "";
      _stockCountLines[i].productName = p.name || "";
      _stockCountLines[i].systemQty = getBalance(p.id, wh).qty;
      _stockCountLines[i].physicalQty = _stockCountLines[i].systemQty;
      renderStockCountRows();
    });
  });
  body.querySelectorAll(".stk-count-phys").forEach(inp=>{
    inp.addEventListener("input", e=>{
      const i = num(e.target.dataset.idx);
      if(_stockCountLines[i]) _stockCountLines[i].physicalQty = num(e.target.value);
      const row = e.target.closest("tr");
      const sys = num(row?.querySelector(".stk-count-sys")?.textContent);
      const varEl = row?.querySelector(".stk-count-var");
      const v = roundMoney(num(e.target.value) - sys);
      if(varEl) varEl.textContent = (v > 0 ? "+" : "") + String(v);
    });
  });
  body.querySelectorAll(".stk-count-reason").forEach(inp=>{
    inp.addEventListener("input", e=>{
      const i = num(e.target.dataset.idx);
      if(_stockCountLines[i]) _stockCountLines[i].reason = e.target.value;
    });
  });
  body.querySelectorAll(".stk-count-del").forEach(btn=>{
    btn.addEventListener("click", e=>{
      const i = num(e.target.dataset.idx);
      _stockCountLines.splice(i, 1);
      renderStockCountRows();
    });
  });
}

async function saveStockCount(){
  if(!requireModule("inventory")) return;
  const warehouseId = stockCountWarehouseId();
  if(!_stockCountLines.length) return toast("Add at least one product line");
  const lines = _stockCountLines.filter(l=> l.productId).map(l=>({
    productId: l.productId,
    productCode: l.productCode || "",
    productName: l.productName || "",
    physicalQty: num(l.physicalQty),
    reason: l.reason || ""
  }));
  if(!lines.length) return toast("Select products on each line");
  const countSerial = await allocateDocSerial("stock_count", "SC-", {
    list: stockCounts, field: "countNo", draftValue: document.getElementById("stkCountNo")?.value, preferCounter: true
  });
  const countNo = countSerial.value;
  try{
    await postStockCount({
      countNo,
      date: document.getElementById("stkCountDate")?.value || today(),
      warehouseId,
      notes: document.getElementById("stkCountNotes")?.value || "",
      lines
    });
    leaveFormAfterSave("stockCountModal");
    toast("Stock count posted");
    await logActivity({
      action: "add", staffName: who(), module: "inventory",
      record: countNo, summary: `Stock count - ${formatStockLocation(warehouseId)} - ${lines.length} line(s)`
    });
    renderInventory();
  }catch(e){
    toast(inventoryErrorText(e?.message || e));
  }
}

function syncStockAdjQtySign(){
  const type = document.getElementById("stkAdjType")?.value || "OPENING";
  const qty = document.getElementById("stkAdjQty");
  if(!qty) return;
  const v = Math.abs(num(qty.value));
  if(type === "ADJUSTMENT_OUT" || type === "DAMAGE") qty.value = v ? -v : 0;
  else if(v) qty.value = v;
}

function renderInventory(){
  const balBody = document.getElementById("invBalanceRows");
  const ledBody = document.getElementById("invLedgerRows");
  const cards = document.getElementById("invSummaryCards");
  if(!balBody && !ledBody) return;

  const bq = (document.getElementById("invBalanceSearch")?.value || "").toLowerCase();
  const balances = getStockBalances().filter(b=>{
    const wh = formatStockLocation(b.warehouseId);
    const blob = `${b.productName} ${b.productCode} ${wh}`.toLowerCase();
    return blob.includes(bq);
  });
  const totalQty = balances.reduce((s,b)=> s + num(b.qty), 0);
  const totalVal = balances.reduce((s,b)=> s + num(b.qty) * num(b.avgCost), 0);
  if(cards){
    cards.innerHTML = `
      <div class="card"><div class="metric-label">SKU LOCATIONS</div><div class="metric">${balances.length}</div></div>
      <div class="card"><div class="metric-label">TOTAL QTY</div><div class="metric">${totalQty.toLocaleString("en-AE",{maximumFractionDigits:2})}</div></div>
      <div class="card"><div class="metric-label">STOCK VALUE (WAC)</div><div class="metric">${money(totalVal)}</div></div>`;
  }
  updateStockTransferUi();
  if(balBody){
    balBody.innerHTML = balances.length ? balances.map(b=>{
      const val = num(b.qty) * num(b.avgCost);
      return `<tr>
        <td>${esc(b.productName)}</td><td>${esc(b.productCode)}</td>
        <td>${esc(formatStockLocation(b.warehouseId))}</td>
        <td>${esc(b.qty)}</td><td>${money(b.avgCost)}</td><td>${money(val)}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="6" class="empty">No stock balances - post opening stock or purchase</td></tr>`;
  }

  const lq = (document.getElementById("invLedgerSearch")?.value || "").toLowerCase();
  const ledger = getStockLedger().filter(r=>{
    const blob = `${r.docType} ${r.docRef} ${r.productName} ${r.productCode} ${r.reason}`.toLowerCase();
    return blob.includes(lq);
  });
  if(ledBody){
    ledBody.innerHTML = ledger.length ? ledger.map(r=> `<tr>
      <td>${esc(r.date || "")}</td><td>${esc(r.docType)}</td><td>${esc(r.docRef)}</td>
      <td>${esc(r.productName)}</td>
      <td>${r.qtyIn ? esc(r.qtyIn) : ""}</td><td>${r.qtyOut ? esc(r.qtyOut) : ""}</td>
      <td>${esc(r.balance)}</td><td>${money(r.totalCost || r.unitCost)}</td>
    </tr>`).join("") : `<tr><td colspan="8" class="empty">No ledger entries yet</td></tr>`;
  }

  const trBody = document.getElementById("invTransferRows");
  if(trBody){
    const rows = stockTransfers.slice().sort((a,b)=> String(b.date||"").localeCompare(String(a.date||""))).slice(0, 50);
    trBody.innerHTML = rows.length ? rows.map(t=> `<tr>
      <td>${esc(t.transferNo)}</td><td>${esc(t.date)}</td><td>${esc(t.productName)}</td>
      <td>${esc(formatStockLocation(t.fromWarehouseId))}</td><td>${esc(formatStockLocation(t.toWarehouseId))}</td>
      <td>${esc(t.qty)}</td><td>${esc(t.createdBy || "")}</td>
    </tr>`).join("") : `<tr><td colspan="7" class="empty">No transfers yet</td></tr>`;
  }

  const cntBody = document.getElementById("invCountRows");
  if(cntBody){
    const rows = stockCounts.slice().sort((a,b)=> String(b.date||"").localeCompare(String(a.date||""))).slice(0, 50);
    cntBody.innerHTML = rows.length ? rows.map(c=> `<tr>
      <td>${esc(c.countNo)}</td><td>${esc(c.date)}</td>
      <td>${esc(formatStockLocation(c.warehouseId))}</td>
      <td>${esc(c.lineCount ?? (c.lines?.length || 0))}</td>
      <td>${esc(c.varianceLines ?? 0)}</td>
      <td>${esc(c.createdBy || "")}</td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty">No stock counts yet</td></tr>`;
  }

  const ibrBody = document.getElementById("invBranchReqRows");
  if(ibrBody){
    const rows = branchStockRequests.slice().sort((a,b)=> String(b.createdAt||0).localeCompare(String(a.createdAt||0))).slice(0, 50);
    ibrBody.innerHTML = rows.length ? rows.map(r=>{
      const status = String(r.status || "pending");
      const statusLabel = status === "posted" ? "Posted" : status === "rejected" ? "Rejected" : "Pending";
      let actions = "";
      if(status === "pending" && canApproveBranchRequest(r)){
        actions = `<button class="btn small primary" type="button" data-approve-ibr="${esc(r.id)}">Approve</button>
          <button class="btn small" type="button" data-reject-ibr="${esc(r.id)}">Reject</button>`;
      }else if(status === "posted" && r.transferNo){
        actions = `<span class="muted">${esc(r.transferNo)}</span>`;
      }
      return `<tr>
        <td>${esc(r.requestNo)}</td><td>${esc(r.date)}</td>
        <td>${esc(r.productName)}</td><td>${esc(r.qty)}</td>
        <td>${esc(branchLabel(r.supplyingBranchId))}</td>
        <td>${esc(branchLabel(r.requestingBranchId))}</td>
        <td>${esc(statusLabel)}</td><td>${actions}</td>
      </tr>`;
    }).join("") : `<tr><td colspan="8" class="empty">No branch requests yet</td></tr>`;
    ibrBody.querySelectorAll("[data-approve-ibr]").forEach(btn=>{
      btn.addEventListener("click", ()=> approveBranchRequest(btn.dataset.approveIbr));
    });
    ibrBody.querySelectorAll("[data-reject-ibr]").forEach(btn=>{
      btn.addEventListener("click", ()=> rejectBranchRequest(btn.dataset.rejectIbr));
    });
  }
  updateBranchRequestUi();
}

async function saveStockAdjustment(){
  if(!requireModule("inventory")) return;
  const productId = document.getElementById("stkAdjProduct")?.value || "";
  const product = products.find(p=> p.id === productId);
  if(!product) return toast("Select a product");
  syncStockAdjQtySign();
  let qty = num(document.getElementById("stkAdjQty")?.value);
  const type = document.getElementById("stkAdjType")?.value || "OPENING";
  if(type === "ADJUSTMENT_OUT" || type === "DAMAGE") qty = -Math.abs(qty);
  else qty = Math.abs(qty);
  if(!qty) return toast("Enter quantity");
  try{
    await postStockAdjustment({
      productId,
      productCode: product.code || "",
      productName: product.name || "",
      warehouseId: document.getElementById("stkAdjWarehouse")?.value || "Main",
      qty,
      unitCost: num(document.getElementById("stkAdjCost")?.value),
      docType: type,
      reason: document.getElementById("stkAdjReason")?.value || type,
      docRef: type
    });
    leaveFormAfterSave("stockAdjModal");
    toast("Stock movement posted");
    await logActivity({ action: "add", staffName: who(), module: "inventory", record: product.code || product.name, summary: `${type} ${qty} - ${product.name}` });
    renderInventory();
  }catch(e){
    toast(inventoryErrorText(e?.message || e));
  }
}

/* --- Product / Service catalog --- */
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
      <button class="btn small" type="button" data-edit-p="${p.id}">Edit</button>
      <button class="btn small danger" type="button" data-del-p="${p.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">No products - add one</td></tr>`;
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
  openFormModal("productModal", { skipPrepare: true });
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
        leaveFormAfterSave("productModal");
        return logActivity({ action:"edit", staffName: who(), summary: "Product saved " + name });
      }),
      { okMsg: "Product saved" }
    ).catch(()=>{});
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
    <td>${esc(s.code || "")}</td>
    <td>${esc(s.name)}</td><td>${money(s.price)}</td><td>${esc(s.standardTime ?? "")}</td>
    <td>${esc(s.vat ?? "")}%</td><td>${esc(s.category)}</td>
    <td>${badge(s.active === false || s.status === "inactive" ? "Inactive" : "Active")}</td>
    <td>
      <button class="btn small" type="button" data-edit-s="${s.id}">Edit</button>
      <button class="btn small danger" type="button" data-del-s="${s.id}">Delete</button>
    </td>
  </tr>`).join("") : `<tr><td colspan="9" class="empty">No services - add one</td></tr>`;
  const selAll = document.getElementById("serviceSelectAll");
  if(selAll) selAll.checked = false;
  tbody.querySelectorAll("[data-edit-s]").forEach(b=> b.onclick = ()=> editService(b.dataset.editS));
  tbody.querySelectorAll("[data-del-s]").forEach(b=> b.onclick = ()=> deleteService(b.dataset.delS));
}

function resetService(){
  sId.value = "";
  if(sCode) sCode.value = `SRV-${String(services.length + 1).padStart(4, "0")}`;
  sName.value = sCategory.value = "";
  if(sNotes) sNotes.value = "";
  sPrice.value = 0;
  sVat.value = shopDefaultVat();
  if(sStdTime) sStdTime.value = 0;
  if(sActive) sActive.value = "active";
}

function editService(id){
  const s = services.find(x=> x.id === id);
  if(!s) return;
  sId.value = s.id;
  if(sCode) sCode.value = s.code || "";
  sName.value = s.name || "";
  sPrice.value = s.price ?? 0;
  sVat.value = s.vat ?? shopDefaultVat();
  sCategory.value = s.category || "";
  if(sStdTime) sStdTime.value = s.standardTime ?? 0;
  if(sActive) sActive.value = (s.active === false || s.status === "inactive") ? "inactive" : "active";
  if(sNotes) sNotes.value = s.notes || "";
  openFormModal("serviceModal", { skipPrepare: true });
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
    code: (sCode?.value||"").trim(),
    name, price: num(sPrice.value), vat: num(sVat.value),
    standardTime: num(sStdTime?.value),
    active: (sActive?.value || "active") !== "inactive",
    status: (sActive?.value || "active") === "inactive" ? "inactive" : "active",
    category: (sCategory.value||"").trim(), notes: (sNotes?.value||"").trim(),
    ...masterMeta()
  };
  try{
    let write;
    if(sId.value) write = updateDoc(doc(db, "serviceCatalog", sId.value), data);
    else { Object.assign(data, masterCreateMeta()); write = addDoc(col("serviceCatalog"), data); }
    commitWrite(
      Promise.resolve(write).then(()=>{
        leaveFormAfterSave("serviceModal");
        return logActivity({ action:"edit", staffName: who(), summary: "Service saved " + name });
      }),
      { okMsg: "Service saved" }
    ).catch(()=>{});
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
    toast(`Deleting ${ids.length}-`);
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
    toast(`Deleting ${n}-`);
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
    toast(`Deleting ${ids.length}-`);
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
    toast(`Deleting ${n}-`);
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
    list.innerHTML = `<li class="cust-combo-empty">${(products.length || services.length) ? "No match - free type OK" : "Catalog empty - type freely or add Product/Service"}</li>`;
  }else{
    list.innerHTML = rows.map(r=>{
      const tag = r.kind === "product" ? "Product" : "Service";
      const meta = [r.code, money(r.price), `${r.vat}% VAT`].filter(Boolean).join(" - ");
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
  const discEl = document.getElementById("invEntryDisc");
  if(kind === "product"){
    _invEntryDefaultDiscPct = productDefaultDiscountPct(row);
    if(discEl){
      if(_invEntryDefaultDiscPct){
        const qty = num(document.getElementById("invEntryQty")?.value) || 1;
        const price = num(row.price);
        discEl.value = roundMoney(qty * price * _invEntryDefaultDiscPct / 100);
      }else{
        discEl.value = 0;
      }
    }
  }else{
    _invEntryDefaultDiscPct = 0;
    if(discEl) discEl.value = 0;
  }
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
    toast(`Imported ${ok}${skip ? ` - skipped ${skip}` : ""}`);
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
    const open = list && !list.hidden;
    if(e.key === "ArrowDown"){
      e.preventDefault();
      e.stopPropagation();
      if(!open) renderCatalogSuggest(input.value);
      moveComboHighlight(list, "data-cat-id", 1);
      return;
    }
    if(e.key === "ArrowUp"){
      e.preventDefault();
      e.stopPropagation();
      if(!open) renderCatalogSuggest(input.value);
      moveComboHighlight(list, "data-cat-id", -1);
      return;
    }
    if(e.key === "Home" && open){
      e.preventDefault();
      setComboHighlight(list, "data-cat-id", 0);
      return;
    }
    if(e.key === "End" && open){
      e.preventDefault();
      setComboHighlight(list, "data-cat-id", comboOptionItems(list, "data-cat-id").length - 1);
      return;
    }
    if(e.key === "Enter"){
      const hit = activeComboOption(list, "data-cat-id") || (!list.hidden && list.querySelector("li[data-cat-id]"));
      if(hit){
        e.preventDefault();
        e.stopImmediatePropagation();
        applyCatalogPick(hit.getAttribute("data-cat-kind"), hit.getAttribute("data-cat-id"));
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

function setInvoiceModalSub(text){
  const el = document.getElementById("invModalSub");
  if(el) el.textContent = text || "Invoice builder";
}

function resetInvoice(){
  _formInvoiceMode = null;
  invId.value = "";
  const invJobCardId = document.getElementById("invJobCardId");
  const invJobNoEl = document.getElementById("invJobNo");
  if(invJobCardId) invJobCardId.value = "";
  if(invJobNoEl) invJobNoEl.value = "";
  invNo.value = nextNo(shop.invPrefix || "INV-", invoices, "invNo");
  const invComputer = document.getElementById("invComputer");
  if(invComputer) invComputer.value = "";
  if(invManual) invManual.value = "";
  if(getShopInvoiceBillingStyle() === "monthly"){
    setInvBillPeriod(new Date().getFullYear(), new Date().getMonth());
  }else{
    invDate.value = today();
    const days = num(shop.creditDays) || 30;
    invDue.value = addDaysToIsoDate(invDate.value, days);
  }
  customerOptions(invCustomer, "");
  filterVehiclesForInvoice();
  invDriver.value = invReceived.value = invLpo.value = invNotes.value = "";
  if(invDn) invDn.value = "";
  if(invRef) invRef.value = "";
  if(invTerms) invTerms.value = (shop.creditDays || 30) + " Days Credit";
  syncInvStockLocation("Main");
  syncInvoiceSubAccountField("");
  if(document.getElementById("invSimpleTotal")) document.getElementById("invSimpleTotal").value = "";
  setInvoiceLineItems([]);
  clearInvEntryFields();
  applyInvoiceEntryMode();
  updateInvoiceWipHint(!!loadInvoiceWip());
  const delBtn = document.getElementById("deleteInvoiceBtn");
  if(delBtn) delBtn.hidden = true;
  setInvoiceModalSub("Invoice builder");
  _lastInvoiceDupKey = "";
  refreshInvoiceDuplicateUi({ showPopup: false });
}

function editInvoice(id){
  _editingExistingInvoice = true;
  clearInvoiceWip();
  const i = invoices.find(x=> x.id === id);
  if(!i) return;
  invId.value = i.id; invNo.value = i.invNo;
  if(i.billingStyle === "monthly"){
    const my = invoiceMonthYearFromDoc(i);
    if(my) setInvBillPeriod(my.year, my.monthIndex0);
    else { invDate.value = i.invDate; invDue.value = i.dueDate; }
  }else{
    invDate.value = i.invDate; invDue.value = i.dueDate;
  }
  const invComputer = document.getElementById("invComputer");
  if(invComputer) invComputer.value = i.computerNo || "";
  if(invManual) invManual.value = i.manualNo || "";
  customerOptions(invCustomer, i.customer);
  syncInvoiceCustomerFromMaster({ recalcDue: false, preserveSub: true });
  syncInvoiceSubAccountField(i.subAccount || "");
  invVehicle.value = i.vehicle||"";
  invDriver.value = i.driver||""; invReceived.value = i.receivedBy||""; invLpo.value = i.lpo||""; invNotes.value = i.notes||"";
  if(invDn) invDn.value = i.deliveryNote||"";
  if(invRef) invRef.value = i.reference||"";
  if(invTerms) invTerms.value = i.paymentTerms||"";
  const invJobCardId = document.getElementById("invJobCardId");
  const invJobNoEl = document.getElementById("invJobNo");
  if(invJobCardId) invJobCardId.value = i.jobCardId || "";
  if(invJobNoEl) invJobNoEl.value = i.jobNo || "";
  syncInvStockLocation(i.stockLocation || "Main");
  const simpleTotalEl = document.getElementById("invSimpleTotal");
  if(getInvoiceEntryMode() === "simple" || (i.items||[]).length === 1 && (i.items[0].name||"").toLowerCase().includes("total")){
    // Stored total may already include linked debit notes - show base only so re-save does not double-add
    const dnPart = linkedDebitTotalForInvoice(i.invNo, i.customer);
    if(simpleTotalEl) simpleTotalEl.value = roundMoney(Math.max(0, num(i.total) - dnPart));
  }else if(simpleTotalEl) simpleTotalEl.value = "";
  setInvoiceLineItems(i.items || []);
  clearInvEntryFields();
  applyInvoiceEntryMode();
  updateInvoiceWipHint(false);
  const delBtn = document.getElementById("deleteInvoiceBtn");
  if(delBtn) delBtn.hidden = false;
  const st = i.status === "Draft" ? "Draft" : (invStatus(i) || "Posted");
  setInvoiceModalSub(
    i.jobNo
      ? `${i.invNo} - ${st} - Job ${i.jobNo}`
      : `${i.invNo} - ${st} - add lines or fix mistakes, then Post Invoice`
  );
  openFormModal("invoiceModal", { skipPrepare: true });
  refreshInvoiceDuplicateUi({ showPopup: false });
}

function jobItemsToInvoiceLines(job){
  return (job?.items || []).map(it=>({
    name: String(it.name || "").trim(),
    code: String(it.code || "").trim(),
    qty: it.qty ?? 1,
    price: it.rate ?? it.price ?? 0,
    disc: it.disc ?? 0,
    vat: it.vatPct ?? it.vat ?? (shop.vatRate ?? 5),
    jobIssuedQty: it.lineType === "labour" ? 0 : num(it.issuedQty),
    lineType: it.lineType === "labour" ? "labour" : "part"
  })).filter(x=> x.name);
}

function warehouseFromJob(job){
  const hits = (getPartsIssues() || []).filter(p=> p.jobCardId === job.id);
  if(hits.length){
    hits.sort((a, b)=> String(b.issueDate || "").localeCompare(String(a.issueDate || "")));
    return hits[0].warehouseId || "Main";
  }
  return job.warehouseId || "Main";
}

/** §15 Workshop Sale: Job ? Invoice. Issued parts do not stock-out again. */
function openInvoiceFromJob(jobId){
  if(!requireModule("invoices")) return;
  const job = (getJobCards() || []).find(j=> j.id === jobId);
  if(!job) return toast("Job card not found");
  if(String(job.status) === "Cancelled") return toast("Cannot invoice a cancelled job");
  const existing = invoices.find(i=> i.id === job.invoiceId)
    || invoices.find(i=> i.jobCardId === job.id);
  if(existing){
    closeModal("jobCardModal");
    editInvoice(existing.id);
    return;
  }
  const lines = jobItemsToInvoiceLines(job);
  if(!lines.length && num(job.grandTotal) <= 0) return toast("Add parts or labour on the job first");
  closeModal("jobCardModal");
  clearInvoiceWip();
  _editingExistingInvoice = false;
  resetInvoice();
  setInvoiceEntryMode("detailed", { formOnly: true });
  applyInvoiceEntryMode();
  const invJobCardId = document.getElementById("invJobCardId");
  const invJobNoEl = document.getElementById("invJobNo");
  if(invJobCardId) invJobCardId.value = job.id;
  if(invJobNoEl) invJobNoEl.value = job.jobNo || "";
  if(invRef) invRef.value = job.jobNo || "";
  customerOptions(invCustomer, job.customer || "");
  const invCustomerInput = document.getElementById("invCustomerInput");
  if(invCustomerInput) invCustomerInput.value = job.customer || "";
  syncInvoiceCustomerFromMaster({ recalcDue: true });
  if(invVehicle) invVehicle.value = job.vehicle || "";
  syncInvStockLocation(warehouseFromJob(job));
  setInvoiceLineItems(lines);
  calcInvoice();
  const unissued = lines.some(it=> it.lineType !== "labour" && num(it.qty) > num(it.jobIssuedQty) + 0.0001);
  setInvoiceModalSub(unissued ? `${job.jobNo} ? invoice (unissued parts will stock-out on Post)` : `${job.jobNo} ? invoice`);
  openFormModal("invoiceModal", { skipPrepare: true });
}

async function saveInvoice(status){
  if(!requireModule("invoices")) return;
  if(_invoiceSaving) return toast("Save already in progress-");
  if(flushInvDraftLine() === false) return;
  const calc = calcInvoice();
  const customer = invCustomer.value;
  if(!customer) return toast("Select customer");
  if(!calc.items.length) return toast(getInvoiceEntryMode() === "simple" ? "Enter total amount" : "Add at least one product line");
  const jobLinkId = (document.getElementById("invJobCardId")?.value || "").trim();
  if(!invId.value && jobLinkId){
    const dupJobInv = invoices.find(i=> i.jobCardId === jobLinkId);
    if(dupJobInv) return toast("This job already has invoice " + dupJobInv.invNo);
  }
  const c = customers.find(x=> x.name === customer);
  if(c && c.status === "Blocked") return toast("Customer is blocked");
  if(c && c.status === "Hold" && status === "Posted") return toast("Customer is on hold");
  const existing = invId.value ? invoices.find(x=>x.id===invId.value) : null;
  const existingPaid = num(existing?.paid);
  const oldTotal = existing && existing.status !== "Draft" ? num(existing.total) : 0;
  if(!invId.value){
    const hadNo = !!String(invNo.value || "").trim();
    const serial = await allocateDocSerial("invoice", shop.invPrefix || "INV-", {
      list: invoices, field: "invNo", draftValue: invNo.value, preferCounter: true
    });
    if(invNo) invNo.value = serial.value;
    if(serial.bumped && hadNo) toast("Invoice No. assigned - posting as " + serial.value);
  }
  // Preserve linked debit-note charges when re-saving line items
  const dnLinked = linkedDebitTotalForInvoice(invNo.value, customer);
  const grandWithDn = roundMoney(calc.grand + dnLinked);
  const existingCredited = num(existing?.credited);
  const floorPaidCred = roundMoney(existingPaid + existingCredited);
  if(existing && status !== "Draft" && grandWithDn + 0.009 < floorPaidCred){
    return toast(
      `Cannot save - total ${money(grandWithDn)} is below paid+credited ${money(floorPaidCred)}. ` +
      `Reverse receipts / credit notes first, or raise the invoice total.`
    );
  }
  const after = customerOutstanding(customer) - oldTotal + grandWithDn;
  if(status === "Posted" && c && num(c.creditLimit) > 0 && after > num(c.creditLimit)){
    if(!confirm("After this invoice, outstanding exceeds credit limit. Post anyway?")) return;
  }
  const manualNo = (invManual?.value||"").trim();
  const computerNo = (document.getElementById("invComputer")?.value || "").trim();
  if(getShopInvoiceBillingStyle() === "monthly") syncInvDateFromBillingPeriod({ recalcDue: false });
  const invDateStr = String(invDate?.value || "").slice(0, 10);
  const invSub = (document.getElementById("invSubAccount")?.value || "").trim();
  const billingStyle = getShopInvoiceBillingStyle();
  const dupDoc = findInvoiceDuplicate({ customer, invDateStr, manualNo, computerNo, excludeId: invId.value });
  if(dupDoc){
    showDupAlert(formatInvoiceDupMessage(dupDoc, { customer, invDateStr, manualNo, computerNo }));
    refreshInvoiceDuplicateUi({ showPopup: false });
    return;
  }
  const data = {
    invNo: invNo.value.trim(),
    computerNo,
    manualNo,
    invDate: invDate.value, dueDate: invDue.value,
    billingStyle,
    billingMonth: billingStyle === "monthly" ? num(document.getElementById("invBillMonth")?.value) : null,
    billingYear: billingStyle === "monthly" ? num(document.getElementById("invBillYear")?.value) : null,
    customer, subAccount: invSub,
    vehicle: invVehicle.value, driver: invDriver.value.trim(),
    receivedBy: invReceived.value.trim(), lpo: invLpo.value.trim(), notes: invNotes.value.trim(),
    deliveryNote: (invDn?.value||"").trim(), reference: (invRef?.value||"").trim(), paymentTerms: (invTerms?.value||"").trim(),
    stockLocation: document.getElementById("invStockLoc")?.value?.trim() || "Main",
    jobCardId: (document.getElementById("invJobCardId")?.value || existing?.jobCardId || "").trim(),
    jobNo: (document.getElementById("invJobNo")?.value || existing?.jobNo || "").trim(),
    items: calc.items, subtotal: calc.sub, discount: calc.disc, vat: calc.vat, total: grandWithDn,
    paid: existingPaid,
    credited: existingCredited,
    status, updatedAt: Date.now(), updatedBy: who()
  };
  try{
    let write;
    _invoiceSaving = true;
    const invNoStr = data.invNo;
    const stockWh = document.getElementById("invStockLoc")?.value?.trim() || existing?.stockLocation || "Main";
    const needsStock = status === "Posted" || existing?.status === "Posted";
    if(invId.value){
      write = (async ()=>{
        if(needsStock) await applyInvoiceStockMoves(existing, status, calc.items, invNoStr, stockWh);
        try{
          await updateDoc(doc(db,"invoices", invId.value), data);
        }catch(docErr){
          if(needsStock) await rollbackInvoiceStockMoves(existing, status, calc.items, invNoStr, stockWh);
          throw docErr;
        }
      })();
    }else {
      write = (async ()=>{
        if(status === "Posted"){
          await applyInvoiceStockMoves(null, status, calc.items, invNoStr, stockWh);
        }
        try{
          data.createdAt = Date.now();
          data.createdBy = who();
          data.paid = 0;
          data.stockLocation = stockWh;
          const ref = await addDoc(col("invoices"), data);
          invId.value = ref.id;
        }catch(docErr){
          if(status === "Posted"){
            await rollbackInvoiceStockMoves(null, status, calc.items, invNoStr, stockWh);
          }
          throw docErr;
        }
      })();
    }
    const stockMoved = status === "Posted" && catalogStockInvoiceItems(calc.items).length > 0;
    const stockNote = stockMoved ? " - stock updated" : "";
    commitWrite(
      Promise.resolve(write).then(async ()=>{
        const savedInvId = invId.value;
        if(data.jobCardId && savedInvId){
          try{
            await linkJobCardToInvoice({
              jobCardId: data.jobCardId,
              invoiceId: savedInvId,
              invoiceNo: data.invNo,
              posted: status === "Posted"
            });
          }catch(linkErr){
            console.warn("[S4 job invoice link]", linkErr);
          }
        }
        await logActivity({ action: status==="Draft"?"draft":"add", staffName: who(), module:"Invoice", record: data.invNo, customer, summary: (status==="Draft"?"Draft ":"Posted ") + data.invNo, newValue: money(data.total) });
        leaveFormAfterSave("invoiceModal");
      }),
      { okMsg: status === "Draft" ? "Draft saved" : "Invoice posted" + stockNote }
    ).catch(()=>{
      /* keep entered data for retry */
    }).finally(()=>{ _invoiceSaving = false; });
  }catch(e){
    _invoiceSaving = false;
    toast(friendlyFirestoreError(e));
  }
}

function renderRvFindRows(q = ""){
  const tbody = document.getElementById("rvFindRows");
  if(!tbody) return;
  const ql = String(q || "").toLowerCase().trim();
  const rows = receipts.filter(r=>{
    if(!ql) return true;
    return `${r.rvNo} ${r.customer} ${r.chequeNo} ${r.ref} ${r.method}`.toLowerCase().includes(ql);
  }).sort((a,b)=> String(b.date).localeCompare(String(a.date))).slice(0, 80);
  tbody.innerHTML = rows.length ? rows.map(r=> `<tr data-rv-find-id="${esc(r.id)}" class="rv-find-hit">
    <td><b>${esc(r.rvNo)}</b></td>
    <td>${esc(r.date)}</td>
    <td>${esc(r.customer)}</td>
    <td class="num">${money(r.amount)}</td>
    <td>${badge(r.status || "Posted")}</td>
  </tr>`).join("") : `<tr><td colspan="5" class="empty">${ql ? "No matching receipts" : "No receipts yet"}</td></tr>`;
}

function openRvFindModal(){
  if(!requireModule("receipts")) return;
  const q = document.getElementById("rvFindQuery");
  if(q) q.value = "";
  renderRvFindRows("");
  openModal("rvFindModal", { keepOpen: ["receiptModal"] });
  setTimeout(()=> q?.focus(), 50);
}

function receiptBillRowsForPrint(r){
  const fromReceipt = (r?.allocations || []).map(a=>{
    const inv = invoices.find(x=> x.id === a.invoiceId);
    const row = {
      invNo: inv?.invNo || "",
      manualNo: inv?.manualNo || "",
      computerNo: inv?.computerNo || "",
      invDate: inv?.invDate || "",
      billAmount: inv ? roundMoney(inv.total) : 0,
      received: roundMoney(num(a.amount))
    };
    row.invNoLabel = rvBillNoPlainLabel(row);
    return row;
  }).filter(x=> x.received > 0.009);
  if(fromReceipt.length) return fromReceipt;
  return _rvBillLines.map(l=> ({
    invNo: l.invNo,
    manualNo: l.manualNo || "",
    computerNo: l.computerNo || "",
    invNoLabel: rvBillNoPlainLabel(l),
    invDate: l.invDate,
    billAmount: l.billAmount,
    received: l.received
  }));
}

function receiptBalanceSnapshot(r){
  const name = String(r?.customer || "").trim();
  const outstandingNow = name ? roundMoney(customerOutstanding(name)) : 0;
  const applied = !!(r?.applied || receiptAffectsBalance(r));
  // Full receipt effect on customer balance = cash/cheque received + discount
  // (advance/unallocated also credits the customer when cleared/posted).
  const settle = roundMoney(num(r?.amount) + num(r?.discount));
  const balanceAfter = applied
    ? outstandingNow
    : Math.max(0, roundMoney(outstandingNow - settle));
  const balanceBefore = applied
    ? roundMoney(outstandingNow + settle)
    : outstandingNow;
  return { balanceBefore, balanceAfter, settle, applied, outstandingNow };
}

function receiptPrintCss(){
  return `
  body.doc-receipt{padding:16px;background:#eef2f7;color:#172033;font-family:Segoe UI,Arial,sans-serif}
  body.doc-receipt .foot{max-width:760px;margin:12px auto 0;text-align:center;font-size:11px;color:#667085}
  .rv-print{max-width:760px;margin:0 auto}
  .rv-print-sheet{border:1px solid #c5d0e0;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 8px 28px rgba(22,48,82,.12)}
  .rv-print-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 22px;background:linear-gradient(135deg,#0f2744 0%,#1e4976 55%,#2563eb 100%);color:#fff}
  .rv-print-co{font-size:18px;font-weight:800;line-height:1.25;letter-spacing:.02em}
  .rv-print-sub{font-size:11px;opacity:.9;margin-top:5px}
  .rv-print-badge{background:rgba(255,255,255,.95);color:#0f2744;font-weight:800;font-size:11px;padding:10px 14px;border-radius:8px;letter-spacing:.12em;white-space:nowrap}
  .rv-print-boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px 16px;background:#f4f7fb}
  .rv-box{border-radius:10px;padding:12px 14px;min-height:64px;box-shadow:inset 0 0 0 1px rgba(15,39,68,.06)}
  .rv-box .lbl{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;opacity:.8;margin-bottom:5px}
  .rv-box .val{display:block;font-size:14px;font-weight:800;line-height:1.3;word-break:break-word}
  .rv-box--no{background:#dbeafe;color:#1e3a8a}
  .rv-box--date{background:#e0e7ff;color:#312e81}
  .rv-box--status{background:#dcfce7;color:#14532d}
  .rv-box--status.is-pending{background:#ffedd5;color:#9a3412}
  .rv-box--status.is-dead{background:#fee2e2;color:#991b1b}
  .rv-box--cust{background:#ede9fe;color:#5b21b6;grid-column:1/-1}
  .rv-box--by{background:#ccfbf1;color:#115e59}
  .rv-box--mode{background:#fce7f3;color:#9d174d}
  .rv-print-amount{display:grid;grid-template-columns:1.3fr .9fr .9fr;gap:10px;padding:0 16px 14px;background:#f4f7fb}
  .rv-amt{border-radius:12px;padding:14px 16px;min-height:78px}
  .rv-amt .lbl{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;opacity:.85;margin-bottom:6px}
  .rv-amt .val{display:block;font-size:22px;font-weight:800;letter-spacing:.01em}
  .rv-amt--recv{background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#eff6ff}
  .rv-amt--before{background:#fef3c7;color:#92400e}
  .rv-amt--after{background:#bbf7d0;color:#14532d}
  .rv-amt--after.is-clear{background:#86efac;color:#14532d}
  .rv-amt-note{font-size:10px;font-weight:600;opacity:.85;margin-top:4px}
  .rv-print-side{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 16px 14px;background:#f4f7fb}
  .rv-side{border-radius:10px;padding:10px 12px;background:#fff;border:1px solid #e2e8f0}
  .rv-side .lbl{display:block;font-size:10px;color:#667085;font-weight:700;text-transform:uppercase;margin-bottom:3px}
  .rv-side .val{font-size:13px;font-weight:800;color:#172033}
  .rv-print-narr{margin:0 16px 14px;padding:12px 14px;border-radius:10px;background:#fffbeb;border:1px solid #fde68a;font-size:12px;line-height:1.45;color:#78350f}
  .rv-print-narr .lbl{font-weight:800;margin-right:6px}
  .rv-print-bills{padding:0 16px 16px}
  .rv-print-bills-title{padding:9px 12px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb);border-radius:8px 8px 0 0}
  .rv-print-table{width:100%;border-collapse:collapse;margin:0;border:1px solid #d5dde8;border-top:0}
  .rv-print-table th,.rv-print-table td{border:1px solid #d5dde8;padding:9px 12px;font-size:12px;text-align:left}
  .rv-print-table th{background:#e8f0fa;color:#1a3d66;font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:800}
  .rv-print-table td.num{text-align:right;font-variant-numeric:tabular-nums}
  .rv-print-table tbody tr:nth-child(even){background:#fafbfc}
  .rv-print-table tfoot td{font-weight:800;background:#eef4fb;border-top:2px solid #1a3d66}
  .rv-print-table tfoot td.num{text-align:right}
  .rv-print-sign{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding:22px 24px 26px}
  .rv-print-sign-box{border-top:1px solid #94a3b8;padding-top:8px;font-size:11px;color:#667085;text-align:center;font-weight:600}
  @media print{
    body.doc-receipt{padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .rv-print-sheet{box-shadow:none;border-radius:0}
    .rv-print-boxes,.rv-print-amount,.rv-print-side{background:#fff}
  }
  @media(max-width:640px){
    .rv-print-head{flex-direction:column;align-items:flex-start}
    .rv-print-boxes,.rv-print-amount,.rv-print-side{grid-template-columns:1fr 1fr}
    .rv-box--cust,.rv-amt--recv{grid-column:1/-1}
  }`;
}

function receiptStatusClass(status){
  const st = String(status || "Posted");
  if(/^(Cancelled|Voided|Bounced)$/i.test(st)) return "is-dead";
  if(/^Pending$/i.test(st)) return "is-pending";
  return "";
}

function buildReceiptBillTableHtml(r){
  const billRows = receiptBillRowsForPrint(r);
  if(!billRows.length) return "";
  const tr = billRows.map(b=> `<tr>
    <td>${rvBillNoCellHtml(b)}</td>
    <td>${esc(b.invDate)}</td>
    <td class="num">${money(b.billAmount)}</td>
    <td class="num">${money(b.received)}</td>
  </tr>`).join("");
  const totalBill = roundMoney(billRows.reduce((s,b)=> s + num(b.billAmount), 0));
  const totalRecv = roundMoney(billRows.reduce((s,b)=> s + num(b.received), 0));
  return `<div class="rv-print-bills">
    <div class="rv-print-bills-title">Bills Received Against</div>
    <table class="rv-print-table">
      <thead><tr>
        <th>Bill No</th><th>Bill Date</th><th>Bill Amount</th><th>Received Amt</th>
      </tr></thead>
      <tbody>${tr}</tbody>
      <tfoot><tr>
        <td colspan="2">Total</td>
        <td class="num">${money(totalBill)}</td>
        <td class="num">${money(totalRecv)}</td>
      </tr></tfoot>
    </table>
  </div>`;
}

function buildReceiptPrintBody(r, includeBills = false){
  const status = r.status || "Posted";
  const collectedBy = r.collectedBy || r.createdBy || r.updatedBy || who();
  const disc = num(r.discount || 0);
  const allocated = Array.isArray(r.allocations) && r.allocations.length
    ? roundMoney(r.allocations.reduce((s,a)=> s + num(a.amount), 0))
    : num(r.allocated);
  const unalloc = Math.max(0, roundMoney(num(r.amount) - allocated));
  const bal = receiptBalanceSnapshot(r);
  const shopLines = [shop.phone, shop.trn ? `TRN: ${shop.trn}` : ""].filter(Boolean);
  const narrParts = [];
  if(r.ref) narrParts.push(`<span class="lbl">Narration:</span>${esc(r.ref)}`);
  if(r.chequeNo){
    let chq = `<span class="lbl">Cheque:</span>${esc(r.chequeNo)}`;
    if(r.bank) chq += ` &nbsp;·&nbsp; <span class="lbl">Bank:</span>${esc(r.bank)}`;
    if(r.chequeDate) chq += ` &nbsp;·&nbsp; <span class="lbl">Chq Date:</span>${esc(r.chequeDate)}`;
    if(r.pdcDate) chq += ` &nbsp;·&nbsp; <span class="lbl">PDC:</span>${esc(r.pdcDate)}`;
    narrParts.push(chq);
  }
  const narrHtml = narrParts.length
    ? `<div class="rv-print-narr">${narrParts.join("<br>")}</div>`
    : "";
  const billsHtml = includeBills ? buildReceiptBillTableHtml(r) : "";
  const afterNote = bal.applied
    ? "Outstanding after this receipt"
    : "After cheque/PDC Clear (projected)";
  return `<div class="rv-print">
    <div class="rv-print-sheet">
      <header class="rv-print-head">
        <div>
          <div class="rv-print-co">${esc(shop.name || "S4 Workshop")}</div>
          ${shopLines.length ? `<div class="rv-print-sub">${esc(shopLines.join(" · "))}</div>` : ""}
        </div>
        <div class="rv-print-badge">RECEIPT VOUCHER</div>
      </header>
      <div class="rv-print-boxes">
        <div class="rv-box rv-box--no"><span class="lbl">Receipt No</span><span class="val">${esc(r.rvNo)}</span></div>
        <div class="rv-box rv-box--date"><span class="lbl">Date</span><span class="val">${esc(r.date)}</span></div>
        <div class="rv-box rv-box--status ${receiptStatusClass(status)}"><span class="lbl">Status</span><span class="val">${esc(status)}</span></div>
        <div class="rv-box rv-box--cust"><span class="lbl">Customer</span><span class="val">${esc(r.customer)}</span></div>
        <div class="rv-box rv-box--by"><span class="lbl">Collected By</span><span class="val">${esc(collectedBy)}</span></div>
        <div class="rv-box rv-box--mode"><span class="lbl">Mode</span><span class="val">${esc(r.method || "Cash")}</span></div>
      </div>
      <div class="rv-print-amount">
        <div class="rv-amt rv-amt--recv"><span class="lbl">Amount Received</span><span class="val">${money(r.amount)}</span></div>
        <div class="rv-amt rv-amt--before"><span class="lbl">Balance Before</span><span class="val">${money(bal.balanceBefore)}</span></div>
        <div class="rv-amt rv-amt--after${bal.applied ? " is-clear" : ""}"><span class="lbl">Balance After</span><span class="val">${money(bal.balanceAfter)}</span><div class="rv-amt-note">${esc(afterNote)}</div></div>
      </div>
      <div class="rv-print-side">
        <div class="rv-side"><span class="lbl">Discount</span><span class="val">${money(disc)}</span></div>
        <div class="rv-side"><span class="lbl">Allocated to Bills</span><span class="val">${money(allocated)}</span></div>
        <div class="rv-side"><span class="lbl">Advance / Unallocated</span><span class="val">${money(unalloc)}</span></div>
      </div>
      ${narrHtml}
      ${billsHtml}
      <div class="rv-print-sign">
        <div class="rv-print-sign-box">Customer Signature</div>
        <div class="rv-print-sign-box">Authorized Signatory</div>
      </div>
    </div>
  </div>`;
}

async function printReceiptVoucher(r, { includeBills = false } = {}){
  if(!r) return;
  const title = `Receipt ${r.rvNo || ""}`;
  const body = buildReceiptPrintBody(r, includeBills);
  const printed = await printHtmlDocument(title, body, {
    hideTitle: true,
    bodyClass: "doc-receipt",
    extraCss: receiptPrintCss()
  });
  if(!printed) toast("Receipt ready to print / share");
}

function maybePrintReceiptAfterSave(saved){
  const preview = document.getElementById("rvPrintPreview")?.checked;
  const billDetails = document.getElementById("rvPrintBillDetails")?.checked;
  if(!preview && !billDetails) return;
  printReceiptVoucher(saved, { includeBills: !!billDetails }).catch(err=> toast(String(err?.message || err)));
}

function afterReceiptSaved(saved, wasEdit){
  maybePrintReceiptAfterSave(saved);
  const isCheque = String(saved?.method || "").includes("Cheque");
  if(isCheque && !saved?.applied){
    toast("Cheque saved as Pending - open Cheque / PDC page and Clear to update invoice paid.");
  }
  if(!wasEdit && !document.getElementById("rvPrintPreview")?.checked){
    setTimeout(()=>{
      if(confirm(`Receipt ${saved.rvNo} saved.\n\nDownload / share PDF now?`)){
        exportReceiptPdfById(saved.id).catch(err=> toast(String(err?.message || err)));
      }
    }, 350);
  }
}

function bindTableDblOpen(tbodyId, onOpen){
  const tbody = document.getElementById(tbodyId);
  if(!tbody || tbody.dataset.dblOpenBound) return;
  tbody.dataset.dblOpenBound = "1";
  tbody.addEventListener("dblclick", e=>{
    const cell = e.target.closest("[data-dbl-open]");
    if(!cell) return;
    onOpen(cell.dataset.dblOpen);
  });
}

function wireMasterListDblOpen(){
  bindTableDblOpen("customerRows", editCustomer);
  bindTableDblOpen("invoiceRows", editInvoice);
  bindTableDblOpen("receiptRows", id=>{
    const r = receipts.find(x=> x.id === id);
    if(!r) return;
    const st = r.status || "Posted";
    if(st === "Voided" || st === "Cancelled" || st === "Bounced"){
      return toast("Cannot edit a voided / cancelled receipt");
    }
    editReceipt(id);
  });
}

function wireRvFindUi(){
  if(document.body._rvFindUiBound) return;
  document.body._rvFindUiBound = true;
  document.getElementById("rvFindBtn")?.addEventListener("click", openRvFindModal);
  document.getElementById("rvFindQuery")?.addEventListener("input", e=> renderRvFindRows(e.target.value));
  document.getElementById("rvFindRows")?.addEventListener("click", e=>{
    const tr = e.target.closest("[data-rv-find-id]");
    if(!tr) return;
    closeModal("rvFindModal");
    editReceipt(tr.dataset.rvFindId);
  });
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
    const canEdit = canVoid;
    const dbl = canEdit ? `class="cell-dbl-open" data-dbl-open="${esc(r.id)}" title="Double-click to open"` : "";
    const actions = [
      canEdit ? `<button class="btn small" type="button" data-edit-rv="${r.id}">Edit</button>` : "",
      `<button class="btn small" type="button" data-receipt-print="${r.id}">Print</button>`,
      `<button class="btn small" type="button" data-receipt-pdf="${r.id}">PDF</button>`,
      canVoid ? `<button class="btn small danger" type="button" data-void-rv="${r.id}">Void</button>` : ""
    ].filter(Boolean).join(" ");
    return `<tr><td ${dbl}>${esc(r.rvNo)}</td><td>${esc(r.date)}</td><td ${dbl}>${esc(r.customer)}</td><td>${esc(r.method)}</td>
      <td>${esc(r.ref || r.chequeNo)}</td><td>${money(r.amount)}</td><td>${money(alloc)}</td>
      <td class="${un?"orange":""}">${money(un)}</td><td>${badge(st)}</td>
      <td>${actions || "-"}</td></tr>`;
  }).join("") : `<tr><td colspan="10" class="empty">No receipts</td></tr>`;
  document.querySelectorAll("[data-edit-rv]").forEach(b=> b.onclick = ()=> editReceipt(b.dataset.editRv));
  document.querySelectorAll("[data-void-rv]").forEach(b=> b.onclick = ()=> voidReceipt(b.dataset.voidRv));
  document.querySelectorAll("[data-receipt-pdf]").forEach(b=> b.onclick = ()=> exportReceiptPdfById(b.dataset.receiptPdf));
  document.querySelectorAll("[data-receipt-print]").forEach(b=> b.onclick = ()=>{
    const rec = receipts.find(x=> x.id === b.dataset.receiptPrint);
    if(rec) printReceiptVoucher(rec, { includeBills: true });
  });
}

function rvBillNoCellHtml(l){
  const manual = l.manualNo ? `<br><span class="inv-meta">Manual ${esc(l.manualNo)}</span>` : "";
  const comp = l.computerNo ? `<br><span class="inv-meta">Comp ${esc(l.computerNo)}</span>` : "";
  return `<b>${esc(l.invNo || "")}</b>${manual}${comp}`;
}

function rvBillNoPlainLabel(l){
  const bits = [l.invNo || ""];
  if(l.manualNo) bits.push(`Manual ${l.manualNo}`);
  if(l.computerNo) bits.push(`Comp ${l.computerNo}`);
  return bits.filter(Boolean).join("\n");
}

function rvBillLineFromInv(inv, balance, received){
  return {
    invoiceId: inv.id,
    invNo: inv.invNo,
    manualNo: inv.manualNo || "",
    computerNo: inv.computerNo || "",
    invDate: inv.invDate || "",
    billAmount: roundMoney(inv.total),
    balance,
    received: roundMoney(received)
  };
}

const RV_STATUS_CASH = new Set(["Posted", "Cancelled"]);
const RV_STATUS_CHEQUE = new Set(["Pending", "Deposited", "Cleared", "Bounced", "Cancelled"]);

function syncRvStatusUi({ isCheque, setDefaultStatus = false, forceValue = null } = {}){
  const rvStatus = document.getElementById("rvStatus");
  const note = document.getElementById("rvStatusNote");
  const allowed = isCheque ? RV_STATUS_CHEQUE : RV_STATUS_CASH;
  if(rvStatus){
    [...rvStatus.options].forEach(opt=>{
      const ok = allowed.has(opt.value);
      opt.hidden = !ok;
      opt.disabled = !ok;
    });
    if(forceValue && allowed.has(forceValue)) rvStatus.value = forceValue;
    else if(setDefaultStatus || !allowed.has(rvStatus.value)){
      rvStatus.value = isCheque ? "Pending" : "Posted";
    }
    rvStatus.disabled = true;
  }
  if(note){
    note.style.display = isCheque ? "none" : "";
    if(!isCheque) note.textContent = "Cash / transfer posts immediately to bill(s) in the grid.";
  }
}

function syncRvMethodUi({ setDefaultStatus = false, statusValue = null } = {}){
  const modal = document.getElementById("receiptModal");
  const rvMethod = document.getElementById("rvMethod");
  const m = rvMethod?.value || "Cash";
  const isCheque = m.includes("Cheque");
  const isPdc = m === "PDC Cheque";
  if(modal){
    modal.classList.toggle("is-pdc", isPdc);
    modal.querySelectorAll(".cheque-only").forEach(el=>{
      if(el.id === "rvChequeHint") return;
      el.style.display = isCheque ? "" : "none";
    });
    // Must set a real display value — CSS keeps .pdc-only { display:none } as default.
    modal.querySelectorAll(".pdc-only").forEach(el=>{
      el.style.display = isPdc ? "block" : "none";
    });
  }
  const hint = document.getElementById("rvChequeHint");
  if(hint){
    hint.style.display = isCheque ? "" : "none";
    hint.innerHTML = isPdc
      ? `PDC saves as <b>Pending</b> — fill <b>PDC Date</b> (or Dated). Invoice paid updates only after you <b>Clear</b> on Cheque / PDC page.`
      : `Cheque saves as <b>Pending</b> — invoice paid updates only after you <b>Clear</b> on Cheque / PDC page.`;
  }
  // Convenience: copy Dated → PDC Date when switching to PDC and PDC empty
  if(isPdc){
    const chqDate = document.getElementById("rvChqDate")?.value || "";
    const pdcEl = document.getElementById("rvPdcDate");
    if(pdcEl && !pdcEl.value && chqDate) pdcEl.value = chqDate;
  }
  syncRvStatusUi({ isCheque, setDefaultStatus, forceValue: statusValue });
}

function updateRvCustomerSummary(){
  const customer = document.getElementById("rvCustomer")?.value || "";
  const balEl = document.getElementById("rvBalancePending");
  const ledEl = document.getElementById("rvLedgerBalance");
  const editing = getRvEditingReceipt();
  const prevAllocMap = {};
  (editing?.allocations || []).forEach(a=> { prevAllocMap[a.invoiceId] = num(a.amount); });
  if(!customer){
    if(balEl) balEl.textContent = "Balance : -";
    if(ledEl) ledEl.textContent = "Current Ledger Balance: -";
    return;
  }
  const open = openInvoicesForReceipt(customer, prevAllocMap);
  const pendingBal = roundMoney(open.reduce((s, inv)=> s + rvBillBalance(inv, editing), 0));
  const ledgerBal = roundMoney(customerOutstanding(customer));
  if(balEl) balEl.textContent = `Balance : ${money(pendingBal)} (${open.length} Bills Pending)`;
  if(ledEl) ledEl.textContent = `Current Ledger Balance: ${money(ledgerBal)} Dr`;
}

function setReceiptModalSub(text){
  const el = document.getElementById("rvModalSub");
  if(el) el.textContent = text || "Customer payment and allocation";
}

function setReceiptCustomerLocked(locked){
  const rvCustomer = document.getElementById("rvCustomer");
  const inp = rvCustomer?.closest(".cust-combo")?.querySelector(".cust-combo-input");
  if(rvCustomer) rvCustomer.disabled = !!locked;
  if(inp) inp.readOnly = !!locked;
}

function openInvoicesForReceipt(customer, prevAllocMap = {}){
  return invoices
    .filter(i=>{
      if(i.customer !== customer || i.status === "Draft") return false;
      return invBalance(i) > 0.009 || num(prevAllocMap[i.id]) > 0.009;
    })
    .sort((a,b)=> String(a.dueDate||a.invDate).localeCompare(String(b.dueDate||b.invDate)));
}

/** Split receipt discount across allocations (stored discShare, else legacy cash weights). */
function receiptAllocDiscShares(r, allocs){
  const discTotal = num(r.discount);
  if(discTotal <= 0.009 || !allocs.length) return allocs.map(()=> 0);
  const stored = allocs.map(a=> roundMoney(num(a.discShare)));
  const storedSum = roundMoney(stored.reduce((s,x)=> s + x, 0));
  if(storedSum > 0.009 && Math.abs(storedSum - discTotal) <= 0.02) return stored;
  return distributeProportionally(discTotal, allocs.map(a=> num(a.amount)));
}

/** Proportional discount by each invoice outstanding (selected invoices). */
function computeRvDiscShares(allocs, discTotal, prevAllocMap = {}){
  if(discTotal <= 0.009 || !allocs.length) return allocs.map(()=> 0);
  const weights = allocs.map(a=>{
    const inv = invoices.find(x=> x.id === a.invoiceId);
    if(!inv) return Math.max(0, num(a.amount));
    const prevCash = roundMoney(prevAllocMap[inv.id] || 0);
    return roundMoney(invBalance(inv) + prevCash);
  });
  return distributeProportionally(discTotal, weights);
}

function getRvEditingReceipt(){
  const rvId = document.getElementById("rvId")?.value;
  return rvId ? receipts.find(x=> x.id === rvId) : null;
}

function rvBillBalance(inv, editing = null){
  const prevCash = editing ? num((editing.allocations || []).find(a=> a.invoiceId === inv.id)?.amount) : 0;
  return roundMoney(invBalance(inv) + prevCash);
}

function rvBillPrevPaid(inv, editing = null){
  const prevCash = editing ? num((editing.allocations || []).find(a=> a.invoiceId === inv.id)?.amount) : 0;
  return roundMoney(Math.max(0, num(inv.paid) - prevCash));
}

function rvBillOptionLabel(inv, editing){
  const bal = rvBillBalance(inv, editing);
  let label = inv.invNo || "";
  if(inv.manualNo) label += ` | M:${inv.manualNo}`;
  if(inv.computerNo) label += ` | PC:${inv.computerNo}`;
  return `${label} (${money(bal)})`;
}

function rvBillSearchBlob(inv){
  return `${inv.invNo||""} ${inv.manualNo||""} ${inv.computerNo||""}`.toLowerCase();
}

function rvOpenBillsForPick(customer, excludeInGrid = true){
  const editing = getRvEditingReceipt();
  const prevAllocMap = {};
  (editing?.allocations || []).forEach(a=> { prevAllocMap[a.invoiceId] = num(a.amount); });
  const inGrid = new Set(_rvBillLines.map(l=> l.invoiceId));
  const sub = (document.getElementById("rvSubAccount")?.value || "").trim();
  return openInvoicesForReceipt(customer, prevAllocMap)
    .filter(inv=> !sub || String(inv.subAccount || "").trim() === sub)
    .filter(inv=> !excludeInGrid || !inGrid.has(inv.id));
}

function findRvBillBySearch(q){
  const customer = document.getElementById("rvCustomer")?.value || "";
  const ql = String(q || "").trim();
  if(!customer || !ql) return { inv: null, matches: [] };
  const open = rvOpenBillsForPick(customer, true);
  const qLower = ql.toLowerCase();
  const exact = open.filter(inv=>
    String(inv.invNo || "").toLowerCase() === qLower
    || String(inv.manualNo || "").toLowerCase() === qLower
    || String(inv.computerNo || "").toLowerCase() === qLower
  );
  if(exact.length === 1) return { inv: exact[0], matches: exact };
  if(exact.length > 1) return { inv: exact[0], matches: exact };
  const partial = open.filter(inv=> rvBillSearchBlob(inv).includes(qLower));
  if(partial.length === 1) return { inv: partial[0], matches: partial };
  return { inv: null, matches: partial };
}

function syncRvBillSearchFromPick(){
  const invId = document.getElementById("rvBillPick")?.value || "";
  const search = document.getElementById("rvBillSearch");
  if(!search) return;
  const inv = invoices.find(x=> x.id === invId);
  if(!inv){ search.value = ""; return; }
  const parts = [];
  if(inv.manualNo) parts.push(inv.manualNo);
  if(inv.computerNo) parts.push(inv.computerNo);
  search.value = parts.length ? parts.join(" / ") : (inv.invNo || "");
}

function selectRvBillInvoice(inv){
  if(!inv) return false;
  const pick = document.getElementById("rvBillPick");
  if(!pick) return false;
  const editing = getRvEditingReceipt();
  if(![...pick.options].some(o=> o.value === inv.id)){
    pick.insertAdjacentHTML("beforeend", `<option value="${esc(inv.id)}">${esc(rvBillOptionLabel(inv, editing))}</option>`);
  }
  pick.value = inv.id;
  onRvBillPickChange();
  syncRvBillSearchFromPick();
  return true;
}

function onRvBillSearchCommit(){
  const search = document.getElementById("rvBillSearch");
  const q = search?.value || "";
  if(!q.trim()) return false;
  const customer = document.getElementById("rvCustomer")?.value || "";
  if(!customer){ toast("Select customer first"); return false; }
  const { inv, matches } = findRvBillBySearch(q);
  if(!inv){
    if(matches.length > 1) toast(`${matches.length} bills match - pick Bill No from list`);
    else toast("No open bill matches that number");
    return false;
  }
  selectRvBillInvoice(inv);
  document.getElementById("rvBillReceive")?.focus();
  return true;
}

function clearRvBillEntryFields(){
  ["rvBillDate","rvBillAmount","rvBillPrev","rvBillBalance","rvBillReceive","rvBillSearch"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
}

function fillRvBillPick(){
  const customer = document.getElementById("rvCustomer")?.value || "";
  const pick = document.getElementById("rvBillPick");
  if(!pick) return;
  const editing = getRvEditingReceipt();
  if(!customer){
    pick.innerHTML = `<option value="">Select customer first</option>`;
    clearRvBillEntryFields();
    return;
  }
  const open = rvOpenBillsForPick(customer, true);
  pick.innerHTML = `<option value="">-- Select bill --</option>` + open.map(inv=>
    `<option value="${esc(inv.id)}">${esc(rvBillOptionLabel(inv, editing))}</option>`
  ).join("");
  clearRvBillEntryFields();
  updateRvCustomerSummary();
}

function onRvBillPickChange(){
  const invId = document.getElementById("rvBillPick")?.value || "";
  const inv = invoices.find(x=> x.id === invId);
  const editing = getRvEditingReceipt();
  if(!inv){
    ["rvBillDate","rvBillAmount","rvBillPrev","rvBillBalance","rvBillReceive"].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.value = "";
    });
    return;
  }
  const balance = rvBillBalance(inv, editing);
  const rvBillDate = document.getElementById("rvBillDate");
  const rvBillAmount = document.getElementById("rvBillAmount");
  const rvBillPrev = document.getElementById("rvBillPrev");
  const rvBillBalanceEl = document.getElementById("rvBillBalance");
  const rvBillReceive = document.getElementById("rvBillReceive");
  if(rvBillDate) rvBillDate.value = inv.invDate || "";
  if(rvBillAmount) rvBillAmount.value = String(roundMoney(inv.total));
  if(rvBillPrev) rvBillPrev.value = String(rvBillPrevPaid(inv, editing));
  if(rvBillBalanceEl) rvBillBalanceEl.value = String(balance);
  if(rvBillReceive) rvBillReceive.value = balance > 0.009 ? String(balance) : "";
  syncRvBillSearchFromPick();
}

function syncRvAmountFromGrid(){
  const total = roundMoney(_rvBillLines.reduce((s,l)=> s + num(l.received), 0));
  const rvAmount = document.getElementById("rvAmount");
  const rvBillTotal = document.getElementById("rvBillTotal");
  if(rvAmount) rvAmount.value = total > 0.009 ? String(total) : "";
  if(rvBillTotal) rvBillTotal.textContent = money(total);
}

function renderRvBillGrid(){
  const tbody = document.getElementById("rvAllocRows");
  if(!tbody) return;
  if(!_rvBillLines.length){
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Select bill -> enter amount (partial OK) -> Add bill -> then Save</td></tr>`;
  }else{
    tbody.innerHTML = _rvBillLines.map((l, i)=> `<tr data-rv-line="${i}" title="Double-click row to remove">
      <td>${rvBillNoCellHtml(l)}</td>
      <td>${esc(l.invDate)}</td>
      <td class="num">${money(l.billAmount)}</td>
      <td><input type="number" min="0" step="0.01" data-rv-received="${i}" data-max="${l.balance}" value="${l.received}"></td>
    </tr>`).join("");
  }
  syncRvAmountFromGrid();
  fillRvBillPick();
  updateRvDiscHint();
  updateRvCustomerSummary();
}

/** If user typed bill + amount but did not tap Add / Enter, commit before Save (common on mobile PWA). */
function flushPendingRvBillLine(){
  const customer = document.getElementById("rvCustomer")?.value || "";
  if(!customer) return;
  let invId = document.getElementById("rvBillPick")?.value || "";
  if(!invId && document.getElementById("rvBillSearch")?.value?.trim()){
    onRvBillSearchCommit();
    invId = document.getElementById("rvBillPick")?.value || "";
  }
  const received = num(document.getElementById("rvBillReceive")?.value);
  if(!invId || received <= 0.009) return;
  if(_rvBillLines.some(l=> l.invoiceId === invId)) return;
  addRvBillLine();
}

function addRvBillLine(){
  const customer = document.getElementById("rvCustomer")?.value || "";
  if(!customer) return toast("Select customer first");
  const invId = document.getElementById("rvBillPick")?.value || "";
  if(!invId && document.getElementById("rvBillSearch")?.value?.trim()){
    onRvBillSearchCommit();
  }
  const invIdFinal = document.getElementById("rvBillPick")?.value || "";
  if(!invIdFinal) return toast("Select a bill or type Manual / Comp / Bill no");
  const received = num(document.getElementById("rvBillReceive")?.value);
  if(received <= 0) return toast("Enter current receipt amount");
  const inv = invoices.find(x=> x.id === invIdFinal);
  if(!inv) return toast("Invoice not found");
  const editing = getRvEditingReceipt();
  const balance = rvBillBalance(inv, editing);
  if(received > balance + 0.01) return toast(`Received ${money(received)} exceeds balance ${money(balance)}`);
  if(_rvBillLines.some(l=> l.invoiceId === invIdFinal)) return toast("Bill already in list");
  _rvBillLines.push(rvBillLineFromInv(inv, balance, Math.min(received, balance)));
  renderRvBillGrid();
  const rvBillReceive = document.getElementById("rvBillReceive");
  if(rvBillReceive){ rvBillReceive.value = ""; rvBillReceive.focus(); }
  onRvBillPickChange();
}

function removeRvBillLine(idx){
  if(idx < 0 || idx >= _rvBillLines.length) return;
  _rvBillLines.splice(idx, 1);
  renderRvBillGrid();
}

function loadRvBillLinesFromReceipt(r){
  _rvBillLines = [];
  if(!r) return;
  (r.allocations || []).forEach(a=>{
    const inv = invoices.find(x=> x.id === a.invoiceId);
    if(!inv) return;
    const received = roundMoney(num(a.amount));
    if(received <= 0.009) return;
    _rvBillLines.push(rvBillLineFromInv(inv, rvBillBalance(inv, r), received));
  });
}

function applyRvDiscountToGrid({ silent = false } = {}){
  const discTotal = num(document.getElementById("rvDisc")?.value);
  if(!_rvBillLines.length){
    if(!silent) toast("Add bill(s) first");
    return false;
  }
  // Keep user-entered Received amounts. Discount only writes off leftover (balance - cash).
  const cash = roundMoney(_rvBillLines.reduce((s,l)=> s + num(l.received), 0));
  const totalBal = roundMoney(_rvBillLines.reduce((s,l)=> s + l.balance, 0));
  const leftover = roundMoney(_rvBillLines.reduce((s,l)=> s + Math.max(0, l.balance - num(l.received)), 0));
  if(discTotal <= 0.009){
    updateRvDiscHint();
    if(!silent) toast("No discount - cash amounts kept as entered");
    return true;
  }
  if(cash + discTotal > totalBal + 0.02){
    if(!silent) toast(`Cash ${money(cash)} + discount ${money(discTotal)} exceeds bill total ${money(totalBal)}`);
    return false;
  }
  if(discTotal > leftover + 0.02){
    if(!silent) toast(
      `Discount ${money(discTotal)} exceeds unpaid remainder ${money(leftover)} after cash ${money(cash)}. ` +
      `Lower cash or discount.`
    );
    return false;
  }
  updateRvDiscHint();
  if(!silent){
    toast(`OK: ${money(cash)} cash + ${money(discTotal)} discount = ${money(roundMoney(cash + discTotal))} of ${money(totalBal)}`);
  }
  return true;
}

/** Validate discount vs cash before save - never rewrite Received amounts. */
function syncRvDiscountBeforeSave(){
  const discTotal = num(document.getElementById("rvDisc")?.value);
  if(discTotal <= 0.009 || !_rvBillLines.length) return true;
  return applyRvDiscountToGrid({ silent: true });
}

function updateRvDiscHint(){
  const hint = document.getElementById("rvDiscHint");
  if(!hint) return;
  const discTotal = num(document.getElementById("rvDisc")?.value);
  const cash = roundMoney(_rvBillLines.reduce((s,l)=> s + l.received, 0));
  const bal = roundMoney(_rvBillLines.reduce((s,l)=> s + l.balance, 0));
  const leftover = roundMoney(Math.max(0, bal - cash));
  if(!_rvBillLines.length){
    hint.textContent = "Add bill(s) first. Enter partial cash if needed. Optional discount writes off leftover only.";
    return;
  }
  if(discTotal > 0.009){
    hint.textContent =
      `Cash ${money(cash)} + discount ${money(discTotal)} = ${money(roundMoney(cash + discTotal))} ` +
      `(bill ${money(bal)}, leftover after cash ${money(leftover)}). Received amounts stay as typed.`;
  }else{
    hint.textContent = `Bill ${money(bal)} - enter partial Received (e.g. 700). Optional discount only on leftover.`;
  }
}

function wireRvBillUi(){
  if(document.body._rvBillUiBound) return;
  document.body._rvBillUiBound = true;
  document.getElementById("rvAddBillBtn")?.addEventListener("click", addRvBillLine);
  document.getElementById("rvApplyDiscBtn")?.addEventListener("click", applyRvDiscountToGrid);
  document.getElementById("rvNewBtn")?.addEventListener("click", ()=> resetReceipt());
  document.getElementById("rvDisc")?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){ e.preventDefault(); applyRvDiscountToGrid(); }
  });
  document.getElementById("rvMethod")?.addEventListener("change", ()=>{
    syncRvMethodUi({ setDefaultStatus: true });
  });
  document.getElementById("rvBillPick")?.addEventListener("change", onRvBillPickChange);
  document.getElementById("rvBillSearch")?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){
      e.preventDefault();
      if(onRvBillSearchCommit()) return;
    }
  });
  document.getElementById("rvBillSearch")?.addEventListener("blur", ()=>{
    const q = document.getElementById("rvBillSearch")?.value?.trim();
    if(q) onRvBillSearchCommit();
  });
  document.getElementById("rvBillReceive")?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){ e.preventDefault(); addRvBillLine(); }
  });
  const tbody = document.getElementById("rvAllocRows");
  tbody?.addEventListener("input", e=>{
    if(!e.target.matches("input[data-rv-received]")) return;
    const i = num(e.target.dataset.rvReceived);
    const max = num(e.target.dataset.max);
    const val = roundMoney(Math.min(Math.max(0, num(e.target.value)), max));
    e.target.value = String(val);
    if(_rvBillLines[i]) _rvBillLines[i].received = val;
    syncRvAmountFromGrid();
    updateRvDiscHint();
  });
  tbody?.addEventListener("dblclick", e=>{
    const tr = e.target.closest("tr[data-rv-line]");
    if(!tr) return;
    removeRvBillLine(num(tr.dataset.rvLine));
    toast("Bill removed from list");
  });
}

function readRvAllocationsFromGrid(existing = null){
  syncRvAmountFromGrid();
  const discTotal = num(document.getElementById("rvDisc")?.value);
  const lines = _rvBillLines.map(l=> ({
    invoiceId: l.invoiceId,
    amount: roundMoney(l.received),
    balance: l.balance
  }));
  // Discount shares by unpaid leftover after cash (supports partial + small discount).
  const leftovers = lines.map(a=> Math.max(0, roundMoney(a.balance - a.amount)));
  const leftoverSum = roundMoney(leftovers.reduce((s,x)=> s + x, 0));
  const discWeights = leftoverSum > 0.009
    ? leftovers
    : lines.map(a=> Math.max(0, a.amount) || Math.max(0, a.balance));
  const discShares = discTotal > 0.009
    ? distributeProportionally(discTotal, discWeights)
    : lines.map(()=> 0);
  let allocs = lines.map((a, i)=> ({ ...a, discShare: discShares[i] || 0 }));
  if(discTotal > 0.009){
    allocs = allocs.filter(a=> a.amount > 0.009 || a.discShare > 0.009);
  }else{
    allocs = allocs.filter(a=> a.amount > 0.009);
  }
  return { allocs, discTotal, allocated: roundMoney(allocs.reduce((s,a)=> s + a.amount, 0)) };
}

function resetReceipt(){
  _editingExistingReceipt = false;
  const rvId = document.getElementById("rvId");
  if(rvId) rvId.value = "";
  setReceiptCustomerLocked(false);
  setReceiptModalSub("");
  const saveBtn = document.getElementById("saveReceiptBtn");
  if(saveBtn) saveBtn.textContent = "Save";
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
  const rvChqDate = document.getElementById("rvChqDate");
  if(rvPdcDate) rvPdcDate.value = "";
  if(rvChqDate) rvChqDate.value = "";
  if(rvDisc) rvDisc.value = 0;
  if(rvCustomer) customerOptions(rvCustomer, "");
  if(rvMethod) rvMethod.value = "Cash";
  syncRvMethodUi({ setDefaultStatus: true });
  const rvCollectedBy = document.getElementById("rvCollectedBy");
  if(rvCollectedBy) rvCollectedBy.value = who();
  syncReceiptSubAccountField("");
  _rvBillLines = [];
  renderRvBillGrid();
  fillRvBillPick();
  updateRvCustomerSummary();
}

function editReceipt(id){
  if(!requireModule("receipts")) return;
  const r = receipts.find(x=> x.id === id);
  if(!r) return toast("Receipt not found");
  const st = r.status || "Posted";
  if(st === "Voided" || st === "Cancelled" || st === "Bounced") return toast("Cannot edit voided / bounced receipt");
  _editingExistingReceipt = true;
  const rvId = document.getElementById("rvId");
  const rvNo = document.getElementById("rvNo");
  const rvDate = document.getElementById("rvDate");
  const rvAmount = document.getElementById("rvAmount");
  const rvRef = document.getElementById("rvRef");
  const rvChq = document.getElementById("rvChq");
  const rvBank = document.getElementById("rvBank");
  const rvCustomer = document.getElementById("rvCustomer");
  const rvMethod = document.getElementById("rvMethod");
  const rvPdcDate = document.getElementById("rvPdcDate");
  const rvDisc = document.getElementById("rvDisc");
  const rvChqDate = document.getElementById("rvChqDate");
  if(rvId) rvId.value = r.id;
  if(rvNo) rvNo.value = r.rvNo || "";
  if(rvDate) rvDate.value = r.date || today();
  if(rvAmount) rvAmount.value = r.amount ?? "";
  if(rvRef) rvRef.value = r.ref || "";
  if(rvChq) rvChq.value = r.chequeNo || "";
  if(rvBank) rvBank.value = r.bank || "";
  if(rvChqDate) rvChqDate.value = r.chequeDate || "";
  if(rvPdcDate) rvPdcDate.value = r.pdcDate || "";
  if(rvDisc) rvDisc.value = r.discount || 0;
  if(rvMethod) rvMethod.value = r.method || "Cash";
  if(rvCustomer) customerOptions(rvCustomer, r.customer || "");
  syncReceiptSubAccountField(r.subAccount || "");
  const rvCollectedBy = document.getElementById("rvCollectedBy");
  if(rvCollectedBy) rvCollectedBy.value = r.collectedBy || r.createdBy || who();
  setReceiptCustomerLocked(true);
  syncRvMethodUi({ statusValue: st });
  loadRvBillLinesFromReceipt(r);
  renderRvBillGrid();
  fillRvBillPick();
  updateRvCustomerSummary();
  setReceiptModalSub(`${r.rvNo} - ${st}`);
  const saveBtn = document.getElementById("saveReceiptBtn");
  if(saveBtn) saveBtn.textContent = "Save";
  openFormModal("receiptModal", { skipPrepare: true });
}

async function saveReceipt(){
  if(!requireModule("receipts")) return;
  if(_receiptSaving) return toast("Save already in progress-");
  const rvCustomer = document.getElementById("rvCustomer");
  const rvAmount = document.getElementById("rvAmount");
  const rvMethod = document.getElementById("rvMethod");
  const rvNo = document.getElementById("rvNo");
  const rvDate = document.getElementById("rvDate");
  const rvRef = document.getElementById("rvRef");
  const rvChq = document.getElementById("rvChq");
  const rvBank = document.getElementById("rvBank");
  const rvChqDate = document.getElementById("rvChqDate");
  const rvPdcDate = document.getElementById("rvPdcDate");
  const rvDisc = document.getElementById("rvDisc");
  const customer = rvCustomer.value;
  const method = rvMethod.value;
  if(!customer) return toast("Select customer first");
  flushPendingRvBillLine();
  if(!syncRvDiscountBeforeSave()) return;
  const rvIdEl = document.getElementById("rvId");
  const existing = rvIdEl?.value ? receipts.find(x=> x.id === rvIdEl.value) : null;
  const { allocs, discTotal, allocated } = readRvAllocationsFromGrid(existing);
  let amount = roundMoney(allocated);
  if(amount <= 0 && discTotal <= 0.009) return toast("Add at least one bill with received amount or discount");
  if(rvAmount) rvAmount.value = amount > 0.009 ? String(amount) : "";
  if(existing && customer !== existing.customer){
    return toast("Cannot change customer - void this receipt and create a new one.");
  }
  if(existing && method !== (existing.method || "Cash")){
    return toast("Cannot change payment method - void and create a new receipt.");
  }
  let rvNoTrim = existing ? String(existing.rvNo || "").trim() : rvNo.value.trim();
  if(!existing){
    const rvHadNo = !!rvNoTrim;
    const rvSerial = await allocateDocSerial("receipt", shop.rvPrefix || "RV-", {
      list: receipts, field: "rvNo", draftValue: rvNoTrim, preferCounter: true
    });
    rvNoTrim = rvSerial.value;
    if(rvNo) rvNo.value = rvNoTrim;
    if(rvSerial.bumped && rvHadNo) toast("Receipt No. assigned - posting as " + rvNoTrim);
  }else if(rvNo) rvNo.value = rvNoTrim;
  let discSharesPreview = allocs.map(a=> roundMoney(num(a.discShare)));
  // Amount = sum of Received Amt in grid (cash only). Discount is separate write-off.
  // Guard: taking more cash than customer currently owes ? advance (must confirm)
  let dueNow = roundMoney(customerOutstanding(customer));
  if(existing) dueNow = roundMoney(Math.max(0, dueNow - num(existing.amount)));
  const dueSafe = Math.max(0, dueNow);
  if(amount > dueSafe + 0.01){
    const extra = roundMoney(amount - dueSafe);
    const okAdvance = confirm(
      `Receipt amount is MORE than this customer's outstanding.\n\n` +
      `Customer outstanding (due): ${money(dueSafe)}\n` +
      `Receipt amount: ${money(amount)}\n` +
      `Extra: ${money(extra)}\n\n` +
      `Are you sure?\n` +
      `- OK (Yes) = post anyway - extra will be CUSTOMER ADVANCE\n` +
      `- Cancel (No) = do not save - fix the amount first`
    );
    if(!okAdvance) return;
  }
  const isCheque = method.includes("Cheque");
  if(isCheque && !(rvChq?.value || "").trim()) return toast(`Enter cheque number for ${method}`);
  if(method === "PDC Cheque"){
    // If PDC Date still empty, use Dated (cheque date) — field was often invisible due to CSS
    if(!(rvPdcDate?.value || "").trim() && (rvChqDate?.value || "").trim()){
      if(rvPdcDate) rvPdcDate.value = rvChqDate.value;
    }
    if(!(rvPdcDate?.value || "").trim()){
      return toast("Enter PDC Date (post-dated deposit date) — shown next to Collection Bank when Mode = PDC Cheque");
    }
  }
  if(isCheque && (rvChq?.value || "").trim() && !memberCan(member, "cheques")){
    return toast("Cheque module permission is required to post a cheque receipt.");
  }
  const prevStatus = existing?.status || "";
  const status = existing
    ? (prevStatus === "Cleared" ? "Cleared" : (isCheque ? "Pending" : "Posted"))
    : (isCheque ? "Pending" : "Posted");
  // Cash/bank: apply only when Posted. Cheque/PDC: apply only when Cleared (via Cheque / PDC page).
  const applyNow = isCheque ? (status === "Cleared") : (status === "Posted");
  if(applyNow && !allocs.length && (amount > 0.009 || discTotal > 0.009)){
    return toast("Add bill(s) with received amount in the grid.");
  }
  if(discTotal > 0.009 && !allocs.length){
    return toast("Add bill(s) before applying discount.");
  }
  for(let i = 0; i < allocs.length; i++){
    const inv = invoices.find(x=> x.id === allocs[i].invoiceId);
    if(!inv) continue;
    const prevCash = (existing?.allocations || []).find(a=> a.invoiceId === inv.id)?.amount || 0;
    const owed = roundMoney(invBalance(inv) + num(prevCash));
    const clearing = roundMoney(allocs[i].amount + (discSharesPreview[i] || 0));
    if(clearing > owed + 0.02){
      return toast(`Invoice ${inv.invNo}: cash ${money(allocs[i].amount)} + discount ${money(discSharesPreview[i] || 0)} exceeds outstanding ${money(owed)}. Reduce Allocate or Discount.`);
    }
  }
  if(applyNow && allocated < amount - 0.01){
    const left = roundMoney(amount - allocated);
    if(!confirm(`Unallocated ${money(left)} will stay as customer advance on the ledger (not on invoice paid). Continue?`)) return;
  }
  const collectedByVal = existing?.collectedBy || document.getElementById("rvCollectedBy")?.value?.trim() || who();
  let subAccount = (document.getElementById("rvSubAccount")?.value || "").trim();
  if(!subAccount){
    subAccount = inferSubAccountFromAllocs(allocs, customer);
    const rvSubEl = document.getElementById("rvSubAccount");
    if(subAccount && rvSubEl){
      syncReceiptSubAccountField(subAccount);
      rvSubEl.value = subAccount;
    }
  }
  const data = {
    rvNo: rvNoTrim, date: rvDate.value, customer, method,
    amount, allocated: applyNow ? allocated : 0, unallocated: applyNow ? roundMoney(amount - allocated) : amount,
    ref: ucText(rvRef?.value),
    chequeNo: isCheque ? ucText(rvChq?.value) : "",
    bank: isCheque ? ucText(rvBank?.value) : "",
    chequeDate: isCheque ? rvChqDate.value : "",
    pdcDate: method === "PDC Cheque" ? (rvPdcDate?.value || "") : "",
    discount: discTotal,
    collectedBy: collectedByVal,
    subAccount,
    allocations: allocs, status, applied: applyNow,
    updatedAt: Date.now(), updatedBy: who()
  };
  try{
    _receiptSaving = true;
    const write = (async ()=>{
      if(existing){
        const batch = writeBatch(db);
        const wasApplied = !!(existing.applied || receiptAffectsBalance(existing));
        if(wasApplied){
          await reverseReceiptFromInvoices(existing, existing.status || "Posted", batch);
        }
        const pendingData = {
          ...data,
          applied: false,
          allocated: 0,
          unallocated: amount,
          allocations: allocs
        };
        batch.update(doc(db, "receipts", existing.id), pendingData);
        Object.assign(existing, pendingData, { amount, discount: discTotal, method });
        if(applyNow){
          await applyReceiptToInvoices(existing, batch);
        }
        const linkedChq = cheques.find(c=>
          (c.receiptId && c.receiptId === existing.id) || (c.receiptNo && c.receiptNo === existing.rvNo)
        );
        if(linkedChq){
          batch.update(doc(db, "cheques", linkedChq.id), {
            chequeNo: data.chequeNo, customer, bank: data.bank,
            chequeDate: data.chequeDate || rvDate.value,
            pdcDate: data.pdcDate || linkedChq.pdcDate || "",
            amount, subAccount: data.subAccount || "",
            updatedAt: Date.now()
          });
        }
        await batch.commit();
        invalidateInvMoneyCache();
        await logActivity({
          action:"edit", staffName: who(), module:"Receipt", record: data.rvNo, customer,
          summary: "Updated receipt " + data.rvNo, newValue: money(amount)
        });
        return { id: existing.id, ...existing };
      }
      const recRef = doc(col("receipts"));
      const batch = writeBatch(db);
      const createData = { ...data, createdAt: Date.now(), createdBy: who() };
      batch.set(recRef, createData);
      if(applyNow){
        const discShares = receiptAllocDiscShares({ discount: discTotal, allocations: allocs }, allocs);
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
        batch.set(doc(col("cheques")), {
          chequeNo: ucText(rvChq.value), customer, bank: ucText(rvBank.value),
          chequeDate: rvChqDate.value || rvDate.value, pdcDate: rvPdcDate?.value || rvChqDate.value,
          amount, status: "Pending",
          subAccount: data.subAccount || "",
          receiptId: recRef.id, receiptNo: data.rvNo, createdAt: Date.now()
        });
      }
      if(applyNow && discTotal > 0){
        batch.set(doc(col("discounts")), {
          date: rvDate.value, customer, type:"Payment", ref: data.rvNo, method:"Fixed",
          amount: discTotal, reason: "Receipt discount", approvedBy: who(), createdAt: Date.now(),
          subAccount: data.subAccount || ""
        });
      }
      await batch.commit();
      invalidateInvMoneyCache();
      await logActivity({ action:"add", staffName: who(), module:"Receipt", record: createData.rvNo, customer, summary: "Receipt " + createData.rvNo, newValue: money(amount) });
      return { id: recRef.id, ...createData };
    })();
    commitWrite(
      write.then(saved => {
        afterReceiptSaved(saved, !!existing);
        leaveFormAfterSave("receiptModal");
        return saved;
      }),
      { okMsg: existing ? "Receipt saved" : "Receipt posted" }
    ).catch(()=>{
      /* keep entered data for retry */
    }).finally(()=>{ _receiptSaving = false; });
  }catch(e){
    _receiptSaving = false;
    toast(friendlyFirestoreError(e));
  }
}

function fillAllocSelect(){
  const allocReceipt = document.getElementById("allocReceipt");
  if(!allocReceipt) return;
  const list = receipts.filter(r=> num(r.unallocated) > 0.009 && receiptAffectsBalance(r));
  allocReceipt.innerHTML = list.map(r=> `<option value="${esc(r.id)}">${esc(r.rvNo)} - ${money(r.unallocated)}</option>`).join("");
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
  if(_allocSaving) return toast("Save already in progress-");
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
    ? list.map(n=> `<option value="${esc(n.id)}">${esc(n.cnNo)} - ${money(cnOpenCredit(n))} open - ${esc(n.customer)}</option>`).join("")
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
  if(_cnAllocSaving) return toast("Save already in progress-");
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

function ledgerLineAffectsBalance(l){
  return l?.affectsBalance !== false;
}

function ledgerMovement(l){
  if(!ledgerLineAffectsBalance(l)) return 0;
  return num(l.debit) - num(l.credit);
}

function receiptHeldStatus(r){
  const st = String(r?.status || "Posted");
  if(/^(Pending|Deposited)$/i.test(st)) return st;
  return "";
}

function ledgerLines(name, subFilter = ""){
  const lines = [];
  const sub = String(subFilter || "").trim();
  invoices.filter(i=> i.customer===name && i.status !== "Draft" && docMatchesSubAccount(i, sub)).forEach(i=>{
    const man = String(i.manualNo || "").trim();
    const pc = String(i.computerNo || "").trim();
    lines.push({
      kind: "invoice",
      date: i.invDate,
      ref: i.invNo,
      desc: "Credit Invoice",
      debit: num(i.total),
      credit: 0,
      subAccount: String(i.subAccount || "").trim(),
      manualNo: man,
      computerNo: pc,
      dueDate: i.dueDate || "",
      invoiceId: i.id,
      openBal: invBalance(i)
    });
  });
  receipts.filter(r=> r.customer===name && receiptMatchesSubFilter(r, sub)).forEach(r=>{
    const st = String(r.status || "Posted");
    if(/^(Cancelled|Bounced|Voided)$/i.test(st)) return;
    const method = String(r.method || "").trim() || "Cash";
    const amt = num(r.amount);
    if(receiptAffectsBalance(r)){
      lines.push({
        kind: "receipt",
        date: r.date,
        ref: r.rvNo,
        desc: `Receipt ${method}${st && st !== "Posted" ? ` (${st})` : ""}`,
        debit: 0,
        credit: amt,
        subAccount: String(r.subAccount || "").trim()
      });
      return;
    }
    const held = receiptHeldStatus(r);
    if(!held) return;
    // Show Pending/Deposited on statement & ledger as memo — does NOT change AR balance
    // until Clear/Posted (same rule as receiptAffectsBalance / invoice paid).
    const chqBits = [];
    if(r.chequeNo) chqBits.push(`Chq ${r.chequeNo}`);
    if(r.bank) chqBits.push(r.bank);
    if(r.pdcDate) chqBits.push(`PDC ${r.pdcDate}`);
    const extra = chqBits.length ? ` · ${chqBits.join(" · ")}` : "";
    lines.push({
      kind: "receipt_held",
      date: r.date,
      ref: r.rvNo,
      desc: `Receipt ${method} (${held}) — not cleared${extra}`,
      debit: 0,
      credit: amt,
      affectsBalance: false,
      memoAmount: amt,
      subAccount: String(r.subAccount || "").trim()
    });
  });
  creditNotes.filter(n=> n.customer===name && noteIsLive(n) && noteMatchesSubFilter(n, sub)).forEach(n=>
    lines.push({
      kind: "cn",
      date: n.date,
      ref: n.cnNo,
      desc: "Credit Note",
      debit: 0,
      credit: num(n.amount),
      subAccount: String(n.subAccount || "").trim()
    })
  );
  unlinkedDebitNotes(name).filter(n=> noteMatchesSubFilter(n, sub)).forEach(n=>
    lines.push({
      kind: "dn",
      date: n.date,
      ref: n.dnNo,
      desc: "Debit Note",
      debit: num(n.amount),
      credit: 0,
      subAccount: String(n.subAccount || "").trim()
    })
  );
  discounts.filter(d=>{
    if(d.customer !== name) return false;
    if(docMatchesSubAccount(d, sub)) return true;
    if(!sub) return true;
    if(d.type === "Payment" && d.ref){
      const r = receipts.find(x=> x.rvNo === d.ref && x.customer === name);
      return !!(r && receiptMatchesSubFilter(r, sub));
    }
    return false;
  }).forEach(d=>{
    let desc = "Discount";
    if(d.type === "Payment" && d.ref) desc = `Payment discount (${d.ref})`;
    else if(d.type === "Invoice" && d.ref) desc = `Invoice discount (${d.ref})`;
    else if(d.reason) desc = String(d.reason);
    lines.push({
      kind: "discount",
      date: d.date,
      ref: d.ref || "",
      desc,
      debit: 0,
      credit: num(d.amount),
      subAccount: String(d.subAccount || "").trim()
    });
  });
  cheques.filter(c=> c.customer===name && !findChequeReceipt(c) && docMatchesSubAccount(c, sub)).forEach(c=>{
    const st = String(c.status || "");
    if(st === "Cleared"){
      lines.push({
        kind: "cheque",
        date: c.pdcDate || c.chequeDate,
        ref: c.chequeNo,
        desc: "Cheque cleared",
        debit: 0,
        credit: num(c.amount),
        subAccount: String(c.subAccount || "").trim()
      });
      return;
    }
    if(st === "Pending" || st === "Deposited"){
      lines.push({
        kind: "cheque_held",
        date: c.pdcDate || c.chequeDate || c.date || "",
        ref: c.chequeNo,
        desc: `Cheque (${st}) — not cleared${c.bank ? ` · ${c.bank}` : ""}`,
        debit: 0,
        credit: num(c.amount),
        affectsBalance: false,
        memoAmount: num(c.amount),
        subAccount: String(c.subAccount || "").trim()
      });
    }
  });
  return lines.sort((a,b)=> String(a.date).localeCompare(String(b.date)));
}

function fillLedger(){
  syncLedgerPeriodUi();
  const name = document.getElementById("ledgerCustomer").value;
  const sub = document.getElementById("ledgerSubAccount")?.value || "";
  const bounds = readLedgerPeriodBounds();
  const from = bounds.from || "";
  const to = bounds.to || "";
  const body = document.getElementById("ledgerRows");
  if(!name){ document.getElementById("ledgerTitle").textContent = "Select a customer"; document.getElementById("ledgerClose").textContent = "-"; body.innerHTML = ""; return; }
  const all = ledgerLines(name, sub);
  let bal = from ? all.filter(l=> l.date < from).reduce((s,l)=> s + ledgerMovement(l), 0) : 0;
  const rows = [];
  if(from){
    rows.push(`<tr><td>${esc(from)}</td><td>OPENING</td><td>Opening Balance</td><td></td><td>${ledgerCell(bal > 0 ? bal : 0)}</td><td>${ledgerCell(bal < 0 ? -bal : 0)}</td><td>${money(bal)}</td></tr>`);
  }
  all.filter(l=> (!from || l.date >= from) && (!to || l.date <= to)).forEach(l=>{
    bal += ledgerMovement(l);
    const heldCls = ledgerLineAffectsBalance(l) ? "" : " ledger-held";
    const subCell = l.subAccount ? esc(l.subAccount) : "";
    rows.push(`<tr class="${heldCls.trim()}"><td>${esc(l.date)}</td><td>${stmtRefHtml(l)}</td><td>${esc(l.desc)}</td><td>${subCell}</td><td>${ledgerCell(l.debit)}</td><td>${ledgerCell(l.credit)}</td><td>${money(bal)}</td></tr>`);
  });
  const title = sub ? `${name} - ${sub}` : name;
  const periodBit = bounds.mode === "monthly" ? ` · ${customerPeriodLabel(bounds)}` : (from || to ? ` · ${customerPeriodLabel(bounds)}` : "");
  document.getElementById("ledgerTitle").textContent = name ? title + periodBit : "Select a customer";
  // Closing must match filtered running balance (last row). Lifetime outstanding only when no date/sub filter.
  document.getElementById("ledgerClose").textContent = (from || to || sub)
    ? ("Closing (filter): " + money(bal))
    : ("Closing: " + money(customerOutstanding(name)));
  body.innerHTML = rows.join("") || `<tr><td colspan="7" class="empty">No movements</td></tr>`;
}

function stmtShowPeriodTxns(){
  return false;
}

function clearStatementPage(){
  const sel = document.getElementById("stmtCustomer");
  if(sel){
    sel.value = "";
    syncCustomerComboInput(sel);
  }
  syncStmtSubAccountField("");
  const titleEl = document.getElementById("stmtTitle");
  if(titleEl) titleEl.textContent = "Select a customer";
  const closeEl = document.getElementById("stmtClose");
  if(closeEl) closeEl.textContent = "-";
  const sumEl = document.getElementById("stmtSummary");
  if(sumEl){ sumEl.hidden = true; sumEl.innerHTML = ""; }
  const body = document.getElementById("stmtRows");
  if(body) body.innerHTML = "";
  const party = document.getElementById("stmtPartyCard");
  if(party){ party.hidden = true; party.innerHTML = ""; }
}

function fillStatement(){
  syncStmtPeriodUi();
  const sel = document.getElementById("stmtCustomer");
  const bounds = readStmtPeriodBounds();
  const asOf = bounds.asOf || today();
  const from = bounds.from || "";
  const sub = document.getElementById("stmtSubAccount")?.value || "";
  const odFrom = num(document.getElementById("stmtOdFrom")?.value);
  const name = sel?.value || "";
  syncStmtSubAccountField(sub);
  const titleBit = sub ? `${name} - ${sub}` : name;
  const periodBit = customerPeriodLabel(bounds, "stmt");
  document.getElementById("stmtTitle").textContent = name ? `${titleBit} - ${periodBit}` : "Select a customer";
  const closeEl = document.getElementById("stmtClose");
  const sumEl = document.getElementById("stmtSummary");
  const body = document.getElementById("stmtRows");
  const party = document.getElementById("stmtPartyCard");
  if(!name){
    if(closeEl) closeEl.textContent = "-";
    if(sumEl){ sumEl.hidden = true; sumEl.innerHTML = ""; }
    body.innerHTML = "";
    if(party){ party.hidden = true; party.innerHTML = ""; }
    return;
  }
  const built = buildStatementRows(name, asOf, from, sub, { odFrom });
  if(closeEl){
    closeEl.textContent = `Closing ${money(built.closing)} · As of ${asOf}`;
  }
  if(sumEl){
    sumEl.hidden = false;
    sumEl.innerHTML = renderStatementSummaryHtml(built, bounds, sub, { showPeriodTxns: stmtShowPeriodTxns() });
  }
  body.innerHTML = built.htmlRows.join("") || `<tr><td colspan="8" class="empty">Empty</td></tr>`;
  if(party){
    party.hidden = false;
    party.innerHTML = statementPartyCardHtml(name, sub);
  }
}

function statementPartyCardHtml(name, subFilter = ""){
  const c = customers.find(x=> x.name === name);
  const bits = [];
  bits.push(`<div class="stmt-party-name">${esc(name)}${subFilter ? ` <span class="muted">· ${esc(subFilter)}</span>` : ""}</div>`);
  if(c?.code) bits.push(`<div class="stmt-party-meta"><b>Code</b> ${esc(c.code)}</div>`);
  if(c?.contact) bits.push(`<div class="stmt-party-meta"><b>Contact</b> ${esc(c.contact)}</div>`);
  if(c?.mobile) bits.push(`<div class="stmt-party-meta"><b>Mobile</b> ${esc(c.mobile)}</div>`);
  if(c?.trn) bits.push(`<div class="stmt-party-meta"><b>TRN</b> ${esc(c.trn)}</div>`);
  if(c?.email) bits.push(`<div class="stmt-party-meta"><b>Email</b> ${esc(c.email)}</div>`);
  if(c?.addr) bits.push(`<div class="stmt-party-meta" style="grid-column:1/-1"><b>Address</b> ${esc(c.addr)}</div>`);
  return bits.join("");
}

function stmtRefHtml(l){
  const extras = [];
  if(l.computerNo) extras.push(`PC: ${esc(l.computerNo)}`);
  if(l.manualNo) extras.push(`Manual: ${esc(l.manualNo)}`);
  const extra = extras.length
    ? `<span class="stmt-ref-extra">${extras.join(" · ")}</span>`
    : "";
  return `${esc(l.ref || "")}${extra}`;
}

function stmtRefText(l){
  const extras = [];
  if(l.computerNo) extras.push("PC: " + l.computerNo);
  if(l.manualNo) extras.push("Manual: " + l.manualNo);
  if(!extras.length) return l.ref || "";
  return `${l.ref || ""}\n${extras.join(" · ")}`;
}

function renderStatementPeriodBreakdownHtml(built){
  const lines = built.periodLines || [];
  if(!lines.length) return "";
  const rows = lines.map(l=>{
    const amt = num(l.debit) > 0 ? num(l.debit) : num(l.credit);
    const refBits = [l.ref || "", l.manualNo ? `Manual: ${l.manualNo}` : "", l.computerNo ? `PC: ${l.computerNo}` : ""].filter(Boolean);
    const subBit = l.subAccount ? `<span class="stmt-txn-sub">${esc(l.subAccount)}</span>` : "";
    const heldBit = l.affectsBalance === false ? ` <span class="stmt-txn-held">held</span>` : "";
    return `<div class="stmt-txn-box"><div class="stmt-txn-box-main">${esc(l.date)} · ${esc(refBits.join(" · "))} · ${esc(l.desc)}${subBit ? " · " : ""}${subBit}${heldBit}</div><div class="stmt-txn-box-amt"><b>${money(amt)}</b></div></div>`;
  });
  return `<div class="stmt-summary-box stmt-summary-box--txns"><div class="stmt-summary-box-title">Transactions in this period</div><div class="stmt-txn-list">${rows.join("")}</div></div>`;
}

function renderStatementSubBoxesHtml(built, subFilter){
  if(subFilter || !built.bySub || !Object.keys(built.bySub).length) return "";
  const rows = Object.entries(built.bySub).sort((a,b)=> a[0].localeCompare(b[0])).map(([subName, x])=>
    `<div class="stmt-sub-box"><div class="stmt-sub-box-name">${esc(subName)}</div>` +
    `<div>In ${money(x.debit)} · Out ${money(x.credit)} · <b>Net ${money(x.net)}</b></div></div>`
  );
  return `<div class="stmt-summary-box stmt-summary-box--subs"><div class="stmt-summary-box-title">Sub-account summary</div>${rows.join("")}</div>`;
}

function renderStatementClosingBoxHtml(built, bounds){
  const from = bounds.from || "";
  const openingRow = from
    ? `<div class="stmt-summary-row"><span>Opening balance:</span> <b>${money(built.opening)}</b></div>`
    : `<div class="stmt-summary-row stmt-summary-sub">Set FROM date to show period opening balance.</div>`;
  const held = num(built.heldAmount);
  const heldRow = held > 0.009
    ? `<div class="stmt-summary-row"><span>Held cheques / pending receipts (not in closing):</span> <b>${money(held)}</b></div>`
    : "";
  return `<div class="stmt-summary-box stmt-summary-box--closing">
    <div class="stmt-summary-box-title">Account balance</div>
    ${openingRow}
    <div class="stmt-summary-row"><span>Closing balance (as of ${esc(bounds.asOf)}):</span> <b>${money(built.closing)}</b></div>
    ${heldRow}
  </div>`;
}

function stmtSummaryNetLabel(bounds){
  if(bounds.mode === "monthly") return "Net this period";
  if(!bounds.from) return "Net up to AS OF";
  return "Net this period";
}

function renderStatementSummaryHtml(built, bounds, subFilter, { showPeriodTxns = false } = {}){
  const periodLabel = customerPeriodLabel(bounds, "stmt");
  const netLabel = stmtSummaryNetLabel(bounds);
  const periodBits = [
    `<div class="stmt-summary-row"><span class="stmt-summary-sub">Period</span> <b>${esc(periodLabel)}</b></div>`
  ];
  if(bounds.mode === "custom" && !bounds.from){
    periodBits.push(`<div class="stmt-summary-row stmt-summary-sub">FROM date not set - all transactions up to ${esc(bounds.asOf)} are included.</div>`);
  }
  periodBits.push(
    `<div class="stmt-summary-row"><span>Invoices / charges:</span> <b>${money(built.periodDebit)}</b>` +
    `<span> · Received / credits:</span> <b>${money(built.periodCredit)}</b>` +
    `<span> · ${netLabel}:</span> <b>${money(built.periodNet)}</b></div>`
  );
  const parts = [
    `<div class="stmt-summary-box stmt-summary-box--period"><div class="stmt-summary-box-title">Period summary</div>${periodBits.join("")}</div>`
  ];
  if(showPeriodTxns) parts.push(renderStatementPeriodBreakdownHtml(built));
  parts.push(renderStatementSubBoxesHtml(built, subFilter));
  parts.push(renderStatementClosingBoxHtml(built, bounds));
  return parts.join("");
}

function buildStatementRows(name, asOf, from, subFilter = "", opts = {}){
  const odFrom = opts.odFrom == null ? 30 : num(opts.odFrom);
  const all = ledgerLines(name, subFilter).filter(l=> l.date <= asOf);
  const opening = from ? all.filter(l=> l.date < from).reduce((s,l)=> s + ledgerMovement(l), 0) : 0;
  let bal = opening;
  let periodDebit = 0;
  let periodCredit = 0;
  let heldAmount = 0;
  const bySub = {};
  const periodLines = [];
  const htmlRows = [];
  const dataRows = [];
  const lineMeta = [];
  if(from){
    htmlRows.push(`<tr><td>${esc(from)}</td><td>OPENING</td><td>Opening Balance</td><td></td><td>${ledgerCell(opening > 0 ? opening : 0)}</td><td>${ledgerCell(opening < 0 ? -opening : 0)}</td><td>${money(opening)}</td><td></td></tr>`);
    dataRows.push([from, "OPENING", "Opening Balance", "", opening > 0 ? opening : "", opening < 0 ? -opening : "", opening, ""]);
    lineMeta.push({ odDays: 0, bucket: null, held: false });
  }
  const inRange = all.filter(l=> !from || l.date >= from);
  inRange.forEach(l=>{
    const d = num(l.debit);
    const c = num(l.credit);
    const affects = ledgerLineAffectsBalance(l);
    if(affects){
      periodDebit += d;
      periodCredit += c;
      bal += d - c;
      if(!subFilter){
        const sk = String(l.subAccount || "").trim() || "Main (no sub)";
        if(!bySub[sk]) bySub[sk] = { debit: 0, credit: 0, net: 0 };
        bySub[sk].debit += d;
        bySub[sk].credit += c;
        bySub[sk].net += d - c;
      }
    }else{
      heldAmount = roundMoney(heldAmount + Math.max(d, c));
    }
    periodLines.push({
      kind: l.kind,
      date: l.date,
      ref: l.ref || "",
      desc: l.desc || "",
      debit: d,
      credit: c,
      net: affects ? (d - c) : 0,
      affectsBalance: affects,
      subAccount: String(l.subAccount || "").trim(),
      manualNo: l.manualNo || "",
      computerNo: l.computerNo || ""
    });
    let odDays = 0;
    let bucket = null;
    if(l.kind === "invoice" && num(l.openBal) > 0.009 && l.dueDate){
      odDays = daysPastDueAsOf(l.dueDate, asOf);
      if(odFrom > 0 && odDays >= odFrom){
        bucket = overdueBucketFromDays(odDays);
      }else if(odFrom > 0 && odDays > 0 && odDays < odFrom){
        bucket = null;
      }
    }
    const odClass = overdueRowClass(bucket, "stmt");
    const heldCls = affects ? "" : " stmt-held";
    const odCell = odDays > 0
      ? `<span class="stmt-od-days">${odDays}d</span>`
      : "";
    const subCell = l.subAccount ? esc(l.subAccount) : "";
    htmlRows.push(
      `<tr class="${(odClass + heldCls).trim()}">` +
      `<td>${esc(l.date)}</td><td>${stmtRefHtml(l)}</td><td>${esc(l.desc)}</td><td>${subCell}</td>` +
      `<td>${ledgerCell(l.debit)}</td><td>${ledgerCell(l.credit)}</td><td>${money(bal)}</td><td>${odCell}</td></tr>`
    );
    dataRows.push([
      l.date,
      stmtRefText(l),
      l.desc,
      l.subAccount || "",
      l.debit || "",
      l.credit || "",
      bal,
      odDays > 0 ? `${odDays}d` : (affects ? "" : "Held")
    ]);
    lineMeta.push({ odDays, bucket, held: !affects });
  });
  return {
    closing: bal,
    opening,
    heldAmount,
    periodDebit,
    periodCredit,
    periodNet: periodDebit - periodCredit,
    bySub,
    periodLines,
    inRangeCount: inRange.length,
    htmlRows,
    dataRows,
    lineMeta
  };
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
    let actions = "-";
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
  sel.innerHTML = `<option value="">-</option>` + list.map(i=>
    `<option value="${esc(i.invNo)}">${esc(i.invNo)} (${money(invBalance(i))} due)</option>`
  ).join("");
  if(keep && [...sel.options].some(o=> o.value === keep)) sel.value = keep;
  else sel.value = "";
  syncInvoiceComboInput(sel);
}

function fillCnReturnWarehouses(){
  const sel = document.getElementById("cnReturnWarehouse");
  if(!sel) return;
  const rows = getWarehouses().filter(w=> w.status !== "inactive");
  if(!rows.length){
    sel.innerHTML = `<option value="Main">Main</option>`;
    return;
  }
  sel.innerHTML = rows.map(w=> `<option value="${esc(w.id)}">${esc(w.code)} - ${esc(w.name)}</option>`).join("");
}

function renderCnReturnRows(inv){
  const section = document.getElementById("cnReturnSection");
  const tbody = document.getElementById("cnReturnRows");
  if(!section || !tbody) return;
  const lines = stockableInvoiceItems(inv?.items || []).filter(line=> catalogMatchedLines([line]).length);
  if(!inv || !lines.length){
    section.hidden = true;
    tbody.innerHTML = "";
    return;
  }
  section.hidden = false;
  fillCnReturnWarehouses();
  tbody.innerHTML = lines.map((line, idx)=> `<tr>
    <td>${esc(line.name)}</td>
    <td>${esc(line.code)}</td>
    <td>${esc(line.qty)}</td>
    <td><input type="number" class="cn-return-qty" data-cn-ret-idx="${idx}" min="0" max="${esc(line.qty)}" step="0.01" value="0" style="width:100%;min-height:40px"></td>
  </tr>`).join("");
  tbody._cnReturnLines = lines;
}

function readCnReturnItems(){
  const tbody = document.getElementById("cnReturnRows");
  const lines = tbody?._cnReturnLines || [];
  const items = [];
  lines.forEach((line, idx)=>{
    const inp = tbody?.querySelector(`[data-cn-ret-idx="${idx}"]`);
    const rq = num(inp?.value);
    if(rq > 0) items.push({ ...line, qty: rq });
  });
  return items;
}

async function applyCreditReturnStockLocal(items, direction, warehouseId, docRef){
  if(!items?.length) return;
  try{
    await applyCreditReturnStockDelta(items, warehouseId ?? "Main", direction, docRef);
  }catch(e){
    throw new Error(inventoryErrorText(e?.message || e));
  }
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
  syncNoteSubAccountField("cn", "");
  fillCnReturnWarehouses();
  renderCnReturnRows(null);
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
  syncNoteSubAccountField("dn", "");
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
  const cnSerial = await allocateDocSerial("credit_note", "CN-", {
    list: creditNotes, field: "cnNo", draftValue: cnTrimOrig, preferCounter: true
  });
  const cnTrim = cnSerial.value;
  if(cnNo) cnNo.value = cnTrim;
  if(cnSerial.bumped) toast("Credit Note No. assigned - posting as " + cnTrim);
  try{
    const returnItems = status !== "Draft" ? readCnReturnItems() : [];
    const returnWh = document.getElementById("cnReturnWarehouse")?.value || "Main";
    const stockMoved = returnItems.length > 0 && catalogMatchedLines(returnItems).length > 0;
    if(stockMoved){
      await applyCreditReturnStockLocal(returnItems, 1, returnWh, cnTrim);
    }
    const write = (async ()=>{
      const inv = invNo ? invoices.find(i=> i.invNo === invNo && i.customer === customer) : null;
      const linked = status !== "Draft" && !!inv;
      const allocations = linked
        ? [{ invoiceId: inv.id, invoiceNo: inv.invNo, amount }]
        : [];
      let subAccount = (document.getElementById("cnSubAccount")?.value || "").trim();
      if(!subAccount) subAccount = String(inv?.subAccount || "").trim();
      const batch = writeBatch(db);
      const cnRef = doc(col("creditNotes"));
      batch.set(cnRef, {
        cnNo: cnTrim, date: cnDate?.value || today(), customer, invoice: invNo,
        reason: (cnReason?.value || "").trim(), amount, status,
        subAccount,
        allocations,
        allocated: linked ? amount : 0,
        unallocated: linked ? 0 : (status === "Draft" ? 0 : amount),
        returnItems: stockMoved ? returnItems : [],
        stockLocation: stockMoved ? returnWh : "",
        createdAt: Date.now(), createdBy: who()
      });
      if(linked){
        const patch = invoiceMoneyPatch(inv, { creditedDelta: amount });
        batch.update(doc(db,"invoices", inv.id), patch);
        Object.assign(inv, patch);
      }
      try{
        await batch.commit();
      }catch(docErr){
        if(stockMoved) await applyCreditReturnStockLocal(returnItems, -1, returnWh, cnTrim);
        throw docErr;
      }
      await logActivity({ action:"add", staffName: who(), module:"Credit Note", record: cnTrim, customer, summary: "CN " + cnTrim, newValue: money(amount) });
    })();
    const stockNote = stockMoved ? " - stock returned" : "";
    commitWrite(write.then(()=>{
      leaveFormAfterSave("cnModal");
    }), { okMsg: "Credit note posted" + stockNote }).catch(()=>{});
  }catch(e){ toast(e?.message || friendlyFirestoreError(e)); }
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
  const dnSerial = await allocateDocSerial("debit_note", "DN-", {
    list: debitNotes, field: "dnNo", draftValue: dnTrimOrig, preferCounter: true
  });
  const dnTrim = dnSerial.value;
  if(dnNo) dnNo.value = dnTrim;
  if(dnSerial.bumped) toast("Debit Note No. assigned - posting as " + dnTrim);
  try{
    const write = (async ()=>{
      const inv = invNo ? invoices.find(i=> i.invNo === invNo && i.customer === customer) : null;
      let subAccount = (document.getElementById("dnSubAccount")?.value || "").trim();
      if(!subAccount) subAccount = String(inv?.subAccount || "").trim();
      const batch = writeBatch(db);
      const dnDocRef = doc(col("debitNotes"));
      batch.set(dnDocRef, {
        dnNo: dnTrim, date: dnDate?.value || today(), customer,
        invoice: invNo,
        ref: (dnRef?.value || "").trim(),
        reason: (dnReason?.value || "").trim(), amount, status,
        subAccount,
        createdAt: Date.now(), createdBy: who()
      });
      // Linked + Posted ? raise invoice.total so dashboard/aging/invBalance stay in sync
      if(noteIsLive({ status }) && inv){
          const nextTotal = roundMoney(num(inv.total) + amount);
          const patch = { total: nextTotal, updatedAt: Date.now(), updatedBy: who() };
          batch.update(doc(db, "invoices", inv.id), patch);
          Object.assign(inv, patch);
      }
      await batch.commit();
      await logActivity({ action:"add", staffName: who(), module:"Debit Note", record: dnTrim, customer, summary: "DN " + dnTrim, newValue: money(amount) });
    })();
    commitWrite(write.then(()=>{
      leaveFormAfterSave("dnModal");
    }), { okMsg: "Debit note posted" }).catch(()=>{});
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

async function voidCreditNote(id){
  if(!requireModule("credit-notes")) return;
  const n = creditNotes.find(x=> x.id === id);
  if(!n) return toast("Credit note not found");
  if(!noteIsLive(n)) return toast("Already voided / not active");
  const msg = `Void credit note ${n.cnNo} (${money(n.amount)})?\nCustomer: ${n.customer}\n\nThis reverses invoice credits and removes it from the ledger.`;
  if(!confirm(msg)) return;
  const returnItems = Array.isArray(n.returnItems) ? n.returnItems.filter(r=> num(r.qty) > 0) : [];
  const returnWh = n.stockLocation || "Main";
  let stockReversed = false;
  try{
    const write = (async ()=>{
      if(returnItems.length){
        await validateStockForLines(returnItems, returnWh, -1);
        await applyCreditReturnStockLocal(returnItems, -1, returnWh, n.cnNo);
        stockReversed = true;
      }
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
      try{
        await batch.commit();
      }catch(docErr){
        if(stockReversed) await applyCreditReturnStockLocal(returnItems, 1, returnWh, n.cnNo);
        throw docErr;
      }
      await logActivity({
        action: "void", staffName: who(), module: "Credit Note",
        record: n.cnNo, customer: n.customer, summary: "Voided CN " + n.cnNo, oldValue: money(n.amount)
      });
    })();
    const stockNote = returnItems.length ? " - stock reversed" : "";
    commitWrite(write, { okMsg: "Credit note voided" + stockNote });
  }catch(e){ toast(e?.message || friendlyFirestoreError(e)); }
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
      return toast(`Cannot void - invoice ${inv.invNo} paid/credited (${money(floor)}) exceeds total after void (${money(nextTotal)}). Reverse payments first.`);
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
  const rows = [...cheques].sort((a,b)=>
    String(b.chequeDate || b.pdcDate || "").localeCompare(String(a.chequeDate || a.pdcDate || ""))
  );
  document.getElementById("chequeRows").innerHTML = rows.length ? rows.map(c=> `<tr>
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
  openFormModal("chequeModal", { skipPrepare: true });
}

async function recalculateInvoiceBalances(){
  if(!isOwnerRole()) throw new Error("Only owner");
  const { paidMap, creditedMap } = buildInvoicePaidCreditedMaps();

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
    details.push(`${inv.invNo}: paid ${oldPaid}?${paid}, credited ${oldCredited}?${credited}`);
  }
  invalidateInvMoneyCache();
  return { checked: targets.length, fixed, details };
}

// Money moves across invoices + receipt + discounts, so it must land atomically.
// Pass an existing batch to join a larger transaction (cheque clear/bounce);
// omit it and this commits its own batch.
async function applyReceiptToInvoices(r, externalBatch = null){
  const st = r?.status || "";
  if(st === "Cancelled" || st === "Voided" || st === "Bounced"){
    throw new Error("Receipt " + (r.rvNo || "") + " was voided/cancelled - cannot apply again");
  }
  if(r.applied){
    throw new Error("Receipt " + (r.rvNo || "") + " already applied");
  }
  const batch = externalBatch || writeBatch(db);
  const allocs = r.allocations || [];
  const discTotal = num(r.discount);
  const discShares = receiptAllocDiscShares(r, allocs);
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
  // Keep original non-cheque status as Posted; cheque/PDC clear ? Cleared
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
  const discShares = receiptAllocDiscShares(r, allocs);
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
  const chqDateStr = String(chqDate?.value || "").slice(0, 10);
  const chqCust = chqCustomer.value;
  const dupChq = cheques.find(c=>{
    if(c.id === (chqId?.value || "")) return false;
    if(String(c.chequeNo || "").trim().toLowerCase() !== chqTrim.toLowerCase()) return false;
    if(String(c.customer || "").trim().toLowerCase() !== String(chqCust).trim().toLowerCase()) return false;
    if(chqDateStr && String(c.chequeDate || "").slice(0, 10) !== chqDateStr) return false;
    return true;
  });
  if(dupChq){
    return toast(
      `Duplicate blocked - same Cheque No., customer and date already saved` +
      ` (${dupChq.chequeNo}, ${dupChq.customer}, ${dupChq.chequeDate || "-"}).`
    );
  }
  const prev = cheques.find(x=> x.id === chqId?.value);
  const invForSub = (chqInvoice?.value || "")
    ? invoices.find(i=> i.invNo === chqInvoice.value && i.customer === chqCust)
    : null;
  const data = {
    chequeNo: ucText(chqTrim), customer: chqCustomer.value, invoice: chqInvoice?.value || "",
    bank: ucText(chqBank?.value),
    chequeDate: chqDate?.value || "", pdcDate: chqPdc?.value || "", amount: num(chqAmt?.value),
    status: chqStatus?.value || "Pending",
    subAccount: String(invForSub?.subAccount || prev?.subAccount || "").trim(),
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
      // One batch for the whole transition - invoice paid and cheque status must
      // never disagree if a write fails halfway.
      const batch = writeBatch(db);

      // Entering Cleared
      if(!wasCleared && nowCleared){
        if(r){
          const rst = r.status || "";
          if(rst === "Cancelled" || rst === "Voided" || rst === "Bounced"){
            throw new Error("Linked receipt " + (r.rvNo || "") + " was voided - cannot clear this cheque. Create a new receipt.");
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
    commitWrite(write.then(()=>{
      leaveFormAfterSave("chequeModal");
    }), { okMsg: "Cheque saved" }).catch(()=>{});
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
    if(!inv) return toast("Invoice not found for this customer - check Reference");
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
      let subAccount = "";
      if(type === "Invoice" && ref){
        const inv = invoices.find(i=> i.invNo === ref && i.customer === discCustomer.value);
        subAccount = String(inv?.subAccount || "").trim();
      }else if(type === "Payment" && ref){
        const r = receipts.find(x=> x.rvNo === ref && x.customer === discCustomer.value);
        subAccount = String(r?.subAccount || "").trim();
      }
      const batch = writeBatch(db);
      batch.set(doc(col("discounts")), {
        date: discDate?.value || today(), customer: discCustomer.value, type, ref,
        method: discMethod?.value || "Fixed", amount, reason: (discReason?.value || "").trim(),
        subAccount,
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
    commitWrite(write.then(()=>{
      leaveFormAfterSave("discModal");
    }), { okMsg: "Discount saved" }).catch(()=>{});
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function fillWhatsapp(){
  const name = document.getElementById("waCustomer").value || "";
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
    branches: document.getElementById("settingsBranches"),
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
    syncInvoiceBillingSettingsUi();
  }
  if(view === "backup") renderBackupPage();
  if(view === "branches") renderBranchSettingsRows();
}

function resetBranchForm(){
  const idEl = document.getElementById("branchEditId");
  if(idEl) idEl.value = "";
  const code = document.getElementById("branchCode");
  const name = document.getElementById("branchName");
  const addr = document.getElementById("branchAddr");
  const phone = document.getElementById("branchPhone");
  const status = document.getElementById("branchStatus");
  if(code) code.value = "";
  if(name) name.value = "";
  if(addr) addr.value = "";
  if(phone) phone.value = "";
  if(status) status.value = "active";
}

function renderBranchSettingsRows(){
  const tbody = document.getElementById("branchRows");
  if(!tbody) return;
  const rows = getBranches();
  tbody.innerHTML = rows.length
    ? rows.map(b=> `<tr>
        <td>${esc(b.code)}</td><td>${esc(b.name)}</td><td>${esc(b.phone||"")}</td>
        <td>${badge(b.status === "inactive" ? "Inactive" : "Active")}</td>
        <td>${b.isDefault ? "?" : ""}</td>
        <td>${isOwnerRole() ? `<button type="button" class="btn small" data-edit-branch="${esc(b.id)}">Edit</button>` : ""}</td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="empty">No branches - default will be created on login</td></tr>`;
  tbody.querySelectorAll("[data-edit-branch]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.editBranch;
      const b = rows.find(r=> r.id === id);
      if(!b) return;
      document.getElementById("branchEditId").value = id;
      document.getElementById("branchCode").value = b.code || "";
      document.getElementById("branchName").value = b.name || "";
      document.getElementById("branchAddr").value = b.addr || "";
      document.getElementById("branchPhone").value = b.phone || "";
      document.getElementById("branchStatus").value = b.status === "inactive" ? "inactive" : "active";
      document.getElementById("branchFormGrid")?.removeAttribute("hidden");
    });
  });
}

async function saveBranchForm(){
  if(!isOwnerRole()) return toast("Only owner can manage branches");
  try{
    const id = document.getElementById("branchEditId")?.value || "";
    await saveBranch(db, id, {
      code: document.getElementById("branchCode")?.value,
      name: document.getElementById("branchName")?.value,
      addr: document.getElementById("branchAddr")?.value,
      phone: document.getElementById("branchPhone")?.value,
      status: document.getElementById("branchStatus")?.value
    });
    document.getElementById("branchFormGrid")?.setAttribute("hidden", "");
    resetBranchForm();
    toast("Branch saved");
    await logActivity({
      action: id ? "edit" : "add",
      staffName: who(),
      module: "foundation",
      record: document.getElementById("branchCode")?.value || "",
      summary: id ? "Branch updated" : "Branch added"
    });
  }catch(e){
    toast(e?.message === "BRANCH_REQUIRED" ? "Branch code and name required" : friendlyFirestoreError(e));
  }
}

function fillSettings(){
  showSettingsView(_currentSettingsView);
  setName.value = shop.name||"";
  setPhone.value = shop.phone||"";
  setAddr.value = shop.addr||"";
  if(setTrn) setTrn.value = shop.trn||"";
  const setTradeLicense = document.getElementById("setTradeLicense");
  const setEmirate = document.getElementById("setEmirate");
  const setOperatingMode = document.getElementById("setOperatingMode");
  const setPiPrefix = document.getElementById("setPiPrefix");
  if(setTradeLicense) setTradeLicense.value = shop.tradeLicense || "";
  if(setEmirate) setEmirate.value = shop.emirate || "";
  if(setOperatingMode) setOperatingMode.value = getOperatingMode(shop);
  setCurrency.value = shop.currency || "AED";
  setCreditDays.value = shop.creditDays || 30;
  setInvPrefix.value = shop.invPrefix || "INV-";
  setRvPrefix.value = shop.rvPrefix || "RV-";
  if(setPiPrefix) setPiPrefix.value = shop.piPrefix || "PI-";
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
      box.innerHTML = `<b>Licensed</b> - ${esc(p.customerName||"")}${p.shopName ? " - " + esc(p.shopName) : ""}<br>
        Plan: ${esc(p.plan)} - Status: ACTIVE<br>
        Expires: ${esc(p.expiresAt || "Lifetime")}`;
      return;
    }
    if(access.mode === "trial"){
      box.innerHTML = `<b>Free trial</b> - ${esc(String(access.daysRemaining))} day(s) left<br>
        Trial ends: ${esc((access.trialEndsAt||"").slice(0,10))}<br>
        <span class="muted">Activate a license anytime below (one PC ? one key).</span>`;
      return;
    }
    box.innerHTML = `<b>Trial ended</b> - activate a license to continue.<br>
      <span class="muted">${esc(licenseErrorText(access.reason || "TRIAL_EXPIRED"))}</span>`;
  }catch(e){
    box.textContent = e.message || "License status unavailable";
  }
}

async function saveSettings(){
  if(!isOwnerRole()) return toast("Only owner can change settings");
  const setOperatingMode = document.getElementById("setOperatingMode");
  const setTradeLicense = document.getElementById("setTradeLicense");
  const setEmirate = document.getElementById("setEmirate");
  const setPiPrefix = document.getElementById("setPiPrefix");
  const data = {
    name: setName.value.trim(), phone: setPhone.value.trim(), addr: setAddr.value.trim(),
    trn: (setTrn?.value||"").trim(),
    tradeLicense: (setTradeLicense?.value || "").trim(),
    emirate: (setEmirate?.value || "").trim(),
    operatingMode: setOperatingMode?.value === OPERATING_MODE.TOTAL ? OPERATING_MODE.TOTAL : OPERATING_MODE.FULL,
    currency: sanitizeCurrency(setCurrency.value), creditDays: num(setCreditDays.value),
    invPrefix: setInvPrefix.value.trim() || "INV-", rvPrefix: setRvPrefix.value.trim() || "RV-",
    piPrefix: (setPiPrefix?.value || "").trim() || "PI-",
    vatRate: num(setVat.value)
  };
  try{
    await setDoc(doc(db,"shop","info"), data, { merge: true });
    const snap = await getDoc(doc(db,"shop","info"));
    shop = snap.data() || shop;
    setFoundationShop(shop);
    syncTopShopName();
    applyNavPermissions();
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
          <b class="users-team-name">${esc(m.displayName || "-")}</b>
          <span class="muted users-team-email">${esc(m.email || "")}</span>
          <div class="users-team-meta">${badge(roleLabel(m.role))} ${badge(m.status)}</div>
        </div>
        ${actions}
      </article>`;
    }).join("");
    html += `</div>`;
    if(invites.length){
      html += `<p style="margin-top:12px"><b>Pending invites</b></p>` + invites.map(i=> `<div class="toolbar users-invite-row"><span>${esc(i.displayName)} - ${esc(i.email)}</span>${isOwnerRole()?`<button class="btn small" type="button" data-cancel="${i.id}">Cancel</button>`:""}</div>`).join("");
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
    toast("Invite saved - share the invite code / QR with staff");
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
    ctx.fillText("Loading QR-", canvas.width / 2, canvas.height / 2);
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
              ctx.fillText("QR failed - copy code", canvas.width / 2, canvas.height / 2);
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
      ctx.fillText("QR offline - copy code", canvas.width / 2, canvas.height / 2);
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
  toast(deliveryToast(result, "CSV downloaded - now you can delete"));
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
    ["Date/Time","User","Branch","Module","Action","Record","Old Value","New Value","Reason"],
    rows.map(r=>{
      const f = formatActivityRow(r, "en");
      return [f.when, f.who, r.branchCode || r.branchName || "", r.module||"", r.action||"", r.record||r.invoiceId||"", r.oldValue||"", r.newValue||"", r.reason||f.what];
    })
  );
  toast(deliveryToast(result, "Audit CSV downloaded"));
}

function statementCustomerFooterHtml(built, bounds){
  const asOf = bounds.asOf || "";
  const from = bounds.from || "";
  const bits = [];
  if(from) bits.push(`<span>Opening: <b>${money(built.opening)}</b></span>`);
  bits.push(`<span>Closing balance (as of ${esc(asOf)}): <b>${money(built.closing)}</b></span>`);
  return `<div style="margin-top:16px;padding:12px 14px;border:1px solid #1a3d66;border-radius:8px;background:#eef4fb;font-size:13px;line-height:1.55;display:flex;flex-wrap:wrap;gap:8px 18px">${bits.join("")}</div>`;
}

function statementTableHtml(name, asOf, from, subFilter = "", summaryHtml = "", builtOverride = null){
  const odFrom = num(document.getElementById("stmtOdFrom")?.value);
  const built = builtOverride || buildStatementRows(name, asOf, from || "", subFilter, { odFrom });
  const range = from ? `From ${esc(from)} - ` : "";
  const subBit = subFilter ? ` - ${esc(subFilter)}` : "";
  const c = customers.find(x=> x.name === name);
  const partyBits = [
    c?.code ? `Code: ${esc(c.code)}` : "",
    c?.contact ? `Contact: ${esc(c.contact)}` : "",
    c?.mobile ? `Mobile: ${esc(c.mobile)}` : "",
    c?.trn ? `TRN: ${esc(c.trn)}` : "",
    c?.email ? `Email: ${esc(c.email)}` : "",
    c?.addr ? `Address: ${esc(c.addr)}` : ""
  ].filter(Boolean);
  const partyBlock = `
    <div style="margin:12px 0 16px;padding:14px 16px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc">
      <div style="font-size:16px;font-weight:700;margin-bottom:8px">${esc(name)}${subBit}</div>
      <div style="font-size:12px;color:#475569;line-height:1.55">${partyBits.join(" · ") || "Customer account statement"}</div>
      <div style="margin-top:10px;font-size:12px;font-weight:600">${esc(shop.name||"")} - ${range}As of ${esc(asOf)}</div>
    </div>`;
  const tableHtml = tableFromRows(
    ["Date","Reference","Description","Sub-account","Debit","Credit","Balance","Overdue"],
    built.dataRows
  );
  // Customer print/PDF: only simple closing (not internal period/sub-account boxes)
  const footerSummary = summaryHtml || statementCustomerFooterHtml(built, { asOf, from });
  return partyBlock + tableHtml + footerSummary;
}

async function exportStatementPdf(download){
  const name = document.getElementById("stmtCustomer").value;
  const bounds = readStmtPeriodBounds();
  const asOf = bounds.asOf || today();
  const from = bounds.from || "";
  const sub = document.getElementById("stmtSubAccount")?.value || "";
  const odFrom = num(document.getElementById("stmtOdFrom")?.value);
  if(!name) return toast("Select customer");
  const built = buildStatementRows(name, asOf, from, sub, { odFrom });
  fillStatement();
  const title = sub ? `Statement - ${name} - ${sub}` : `Statement - ${name}`;
  // On-screen keeps full internal summary; Print/PDF gets customer-facing footer only.
  const body = statementTableHtml(name, asOf, from, sub, "", built);
  const customer = customers.find(x=> x.name === name) || { name };
  const periodLabel = customerPeriodLabel(bounds, "stmt");
  const pdfOpts = {
    shop, name, asOf, from, subFilter: sub, customer,
    lines: built.dataRows, lineMeta: built.lineMeta, closing: built.closing, opening: built.opening,
    heldAmount: built.heldAmount, odFrom,
    periodNet: built.periodNet, periodDebit: built.periodDebit, periodCredit: built.periodCredit,
    bySub: built.bySub, periodLines: built.periodLines, periodLabel,
    showPeriodTxns: false,
    customerFacing: true
  };
  if(download){
    try{
      const result = await downloadStatementPdf(pdfOpts);
      toast(deliveryToast(result, "PDF downloaded"));
    }catch(err){
      console.warn("Statement PDF failed", err);
      toast(String(err?.message || err));
    }
    return;
  }
  if(isAndroidNative()){
    try{
      const result = await downloadStatementPdf(pdfOpts);
      toast(deliveryToast(result, "PDF ready - open it to print"));
      return;
    }catch(err){
      console.warn("Statement Android print-PDF failed", err);
    }
  }
  try{
    const printed = await printHtmlDocument(title, body);
    if(!printed) toast("File ready - open it to print or share");
  }catch(err){
    console.warn("Statement print failed", err);
    await downloadHtmlDocument(`statement-${name.replace(/\s+/g,"_")}.html`, title, body);
    toast("Print blocked - file ready instead");
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
    const billRows = receiptBillRowsForPrint(r);
    const balances = receiptBalanceSnapshot(r);
    const result = await downloadReceiptPdf(r, shop, { billRows, balances });
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

function ledgerExportRows(name, sub, from, to){
  const all = ledgerLines(name, sub);
  let bal = from ? all.filter(l=> l.date < from).reduce((s,l)=> s + ledgerMovement(l), 0) : 0;
  const rows = [];
  if(from){
    rows.push([from, "OPENING", "Opening Balance", "", bal > 0 ? bal : "", bal < 0 ? -bal : "", bal]);
  }
  all.filter(l=> (!from || l.date >= from) && (!to || l.date <= to)).forEach(l=>{
    bal += ledgerMovement(l);
    rows.push([
      l.date,
      stmtRefText(l),
      l.desc,
      l.subAccount || "",
      l.debit || "",
      l.credit || "",
      bal
    ]);
  });
  return rows;
}

async function exportLedger(kind){
  const name = document.getElementById("ledgerCustomer").value;
  if(!name) return toast("Select customer");
  const bounds = readLedgerPeriodBounds();
  const from = bounds.from || "";
  const to = bounds.to || "";
  const sub = document.getElementById("ledgerSubAccount")?.value || "";
  const rows = ledgerExportRows(name, sub, from, to);
  const headers = ["Date","Reference","Description","Sub-account","Debit","Credit","Balance"];
  const fileLabel = (sub ? `${name}-${sub}` : name).replace(/\s+/g,"_");
  const periodLabel = customerPeriodLabel(bounds);
  const title = sub ? `Ledger - ${name} - ${sub}` : `Ledger - ${name}`;
  if(kind === "csv"){
    const result = await downloadCsv(`ledger-${fileLabel}.csv`, headers, rows);
    toast(deliveryToast(result, "Ledger CSV downloaded"));
  }else{
    try{
      const range = [periodLabel, sub ? "Sub " + sub : ""].filter(Boolean).join(" - ");
      const result = await downloadTablePdf({
        shop,
        title,
        subtitle: range,
        headers,
        rows: rows.map(r => r.map(c => c === "" || c == null ? "" : String(c))),
        filename: `ledger-${fileLabel}`
      });
      toast(deliveryToast(result, "Ledger PDF downloaded"));
    }catch(err){
      console.warn("Ledger PDF failed", err);
      const body = tableFromRows(headers, rows);
      await downloadHtmlDocument(`ledger-${fileLabel}.html`, title, body);
      toast("PDF failed - HTML file ready instead");
    }
  }
}

async function exportAging(kind){
  const map = {};
  invoices.forEach(i=>{
    const name = i.customer || "-";
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
      toast("PDF failed - HTML file ready instead");
    }
  }
}

function runGlobalSearch(q){
  if(!q) return;
  const ql = q.toLowerCase();
  const hits = [];
  const seenInv = new Set();
  const pushInvoice = (i, detailExtra)=>{
    if(seenInv.has(i.id)) return;
    seenInv.add(i.id);
    hits.push({
      type: "Invoice",
      ref: i.invNo,
      detail: [i.customer, i.subAccount, detailExtra].filter(Boolean).join(" · "),
      page: "invoices",
      go: ()=>{ showPage("invoices"); editInvoice(i.id); }
    });
  };
  invoices.forEach(i=>{
    if(`${i.invNo} ${i.customer} ${i.subAccount||""} ${i.vehicle} ${i.lpo} ${i.manualNo||""} ${i.computerNo||""}`.toLowerCase().includes(ql))
      pushInvoice(i);
  });
  // Sub-account name (e.g. Jamal / Tamim) - all invoices under that sub
  customers.forEach(c=>{
    customerSubAccounts(c.name).forEach(sub=>{
      if(!sub.name.toLowerCase().includes(ql)) return;
      hits.push({
        type: "Sub-account",
        ref: sub.name,
        detail: c.name,
        page: "statements",
        go: ()=>{
          showPage("statements");
          const sel = document.getElementById("stmtCustomer");
          if(sel) sel.value = c.name;
          syncStmtSubAccountField(sub.name);
          fillStatement();
        }
      });
      invoices.filter(i=>
        i.customer === c.name && String(i.subAccount || "").trim().toLowerCase() === sub.name.toLowerCase()
      ).forEach(i=> pushInvoice(i, "Sub: " + sub.name));
    });
  });
  customers.forEach(c=>{
    if(`${c.code} ${c.name} ${c.mobile} ${c.trn} ${c.contact}`.toLowerCase().includes(ql))
      hits.push({ type:"Customer", ref:c.code||c.name, detail:c.name, page:"customers", go:()=>{ showPage("customers"); customerSearch.value=q; renderCustomers(); }});
  });
  vehicles.forEach(v=>{
    if(`${v.plate} ${v.vin} ${v.make} ${v.model} ${v.customer} ${v.engine}`.toLowerCase().includes(ql))
      hits.push({ type:"Vehicle", ref:v.plate, detail:`${v.make} ${v.model} - ${v.vin||""}`, page:"vehicles", go:()=>{ showPage("vehicles"); const s=document.getElementById("vehicleSearch"); if(s){ s.value=v.plate||q; renderVehicles(); } }});
  });
  products.forEach(p=>{
    if(`${p.name} ${p.code} ${p.category}`.toLowerCase().includes(ql))
      hits.push({ type:"Product", ref:p.code||p.name, detail:p.name, page:"product-catalog", go:()=>{ showPage("product-catalog"); }});
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
    if(`${r.rvNo} ${r.customer} ${r.subAccount||""} ${r.chequeNo} ${r.ref}`.toLowerCase().includes(ql))
      hits.push({ type:"Receipt", ref:r.rvNo, detail:[r.customer, r.subAccount].filter(Boolean).join(" · "), page:"receipts", go:()=>{ showPage("receipts"); if(receiptSearch){ receiptSearch.value=q; renderReceipts(); }}});
  });
  const box = document.getElementById("searchResults");
  const overlay = document.getElementById("searchOverlay");
  if(!hits.length){
    box.innerHTML = `<p class="empty">No matches for -${esc(q)}-</p>`;
  }else{
    box.innerHTML = `<table class="table"><thead><tr><th>Type</th><th>Reference</th><th>Detail</th></tr></thead><tbody>` +
      hits.slice(0,60).map((h,i)=> `<tr data-hit="${i}" style="cursor:pointer"><td>${esc(h.type)}</td><td>${esc(h.ref)}</td><td>${esc(h.detail)}</td></tr>`).join("") +
      `</tbody></table>`;
    box.querySelectorAll("[data-hit]").forEach(tr=>{
      tr.onclick = ()=>{ overlay.hidden = true; hits[Number(tr.dataset.hit)].go(); };
    });
  }
  overlay.hidden = false;
}

function refreshNotifications(){
  const items = buildNotificationItems();
  const unread = unreadNotificationCount(items);
  setNotifBadge(unread);
  const list = document.getElementById("notifList");
  if(list){
    list.innerHTML = items.length
      ? items.map(it=> `<div class="notif-item" data-page="${it.page}"><b>${esc(it.title)}</b><span class="muted">${esc(it.detail)}</span></div>`).join("")
      : `<div class="notif-item muted">No alerts</div>`;
    list.querySelectorAll("[data-page]").forEach(el=>{
      el.onclick = ()=>{
        acknowledgeNotifications(items);
        setNotifBadge(0);
        document.getElementById("notifPanel").hidden = true;
        if(el.dataset.page === "settings"){
          showPage("settings");
          showSettingsView("help");
        }else{
          showPage(el.dataset.page);
        }
        refreshNotifications();
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
      ["LAST BACKUP", last ? new Date(last.at).toLocaleString() : "-", last ? last.status : "None yet"],
      ["BACKUP SIZE", last ? formatBytes(last.size) : "-", last?.name || ""],
      ["RETENTION", "40 local entries", "Drive folder keeps files"]
    ].map(([a,b,c])=> `<div class="card"><div class="metric-label">${a}</div><div class="metric" style="font-size:17px">${esc(b)}</div><div class="metric-note">${esc(c)}</div></div>`).join("");
  }
  const rows = document.getElementById("backupHistoryRows");
  if(rows){
    rows.innerHTML = hist.length ? hist.map(h=> `<tr>
      <td>${esc(new Date(h.at).toLocaleString())}</td><td>${esc(h.type)}</td><td>${esc(formatBytes(h.size))}</td>
      <td>${badge(h.status||"Successful")}</td>
      <td>${h.driveId?`<button class="btn small" type="button" data-dl="${h.driveId}">Open list</button>`:"-"}</td>
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
        list.map(f=> `<tr><td>${esc(f.name)}</td><td>${esc(f.createdTime?new Date(f.createdTime).toLocaleString():"-")}</td><td>${esc(formatBytes(f.size))}</td></tr>`).join("") +
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
