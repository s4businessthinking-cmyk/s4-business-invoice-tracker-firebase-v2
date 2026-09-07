import { getWarehouses, fillWarehouseSelect, masterMeta, masterCreateMeta } from "./masters.js?v=131";
import { getCurrentBranchId } from "./foundation.js?v=131";
import { applyPurchaseStockDelta, productStockFromCatalog, validateStockForLines, catalogMatchedLines, inventoryErrorText } from "./inventory.js?v=131";
import {
  addDoc, updateDoc, deleteDoc, doc, writeBatch, getDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let suppliers = [];
let purchaseInvoices = [];
let _purchaseLineItems = [];
let _purchaseSaving = false;
let _piDefaultDiscPct = 0;

export function getSuppliers(){ return suppliers; }
export function getPurchaseInvoices(){ return purchaseInvoices; }

export function initPurchase(c){
  ctx = c;
}

function num(v){ return ctx.num(v); }
function roundMoney(n){ return ctx.roundMoney(n); }
function esc(v){ return ctx.esc(v); }
function money(v){ return ctx.money(v); }
function badge(v){ return ctx.badge(v); }
function who(){ return ctx.who(); }
function toast(m){ return ctx.toast(m); }
function shop(){ return ctx.getShop() || {}; }
function products(){ return ctx.getProducts() || []; }
function shopDefaultVat(){ return ctx.shopDefaultVat(); }
function setPiEntryUnit(val){
  const el = document.getElementById("piEntryUnit");
  if(!el) return;
  const unit = String(val || "Pcs").trim() || "Pcs";
  if(![...el.options].some(o => o.value === unit)){
    const opt = document.createElement("option");
    opt.value = unit;
    opt.textContent = unit;
    el.appendChild(opt);
  }
  el.value = unit;
}
function col(name){ return ctx.col(name); }
function db(){ return ctx.db; }
function requireModule(m){ return ctx.requireModule(m); }
function commitWrite(p, o){ return ctx.commitWrite(p, o); }
function logActivity(a){ return ctx.logActivity(a); }
function friendlyFirestoreError(e){ return ctx.friendlyFirestoreError(e); }
function openFormModal(id, o){ return ctx.openFormModal(id, o); }
function closeModal(id){ return ctx.closeModal(id); }
function leaveFormAfterSave(id){ return ctx.leaveFormAfterSave ? ctx.leaveFormAfterSave(id) : closeModal(id); }
function showPage(id){ return ctx.showPage?.(id); }
function nextNo(prefix, list, field){ return ctx.nextNo(prefix, list, field); }
async function allocateDocSerial(docKey, prefix, opts){ return ctx.allocateDocSerial(docKey, prefix, opts); }

function productStock(p){
  return productStockFromCatalog(p);
}

export function findProductForLine(line){
  const code = String(line?.code || "").trim().toLowerCase();
  const name = String(line?.name || "").trim().toLowerCase();
  return products().find(p=>{
    if(code && String(p.code || "").trim().toLowerCase() === code) return true;
    if(code && String(p.barcode || "").trim().toLowerCase() === code) return true;
    if(code && String(p.shopPartNumber || "").trim().toLowerCase() === code) return true;
    return name && String(p.name || "").trim().toLowerCase() === name;
  });
}

function resolvePiEntryProduct(){
  const name = document.getElementById("piEntryName")?.value.trim() || "";
  const code = document.getElementById("piEntryCode")?.value.trim() || "";
  if(!name && !code) return null;
  const catalog = findProductForLine({ name, code });
  const matchName = String(catalog?.name || name).trim().toLowerCase();
  const matchCode = String(catalog?.code || code).trim().toLowerCase();
  const matchBarcode = String(catalog?.barcode || "").trim().toLowerCase();
  const matchShop = String(catalog?.shopPartNumber || "").trim().toLowerCase();
  return {
    title: catalog?.name || name || code,
    matchName,
    matchCode,
    matchBarcode,
    matchShop,
  };
}

function piLineMatchesProduct(line, key){
  if(!key) return false;
  const ln = String(line?.name || "").trim().toLowerCase();
  const lc = String(line?.code || "").trim().toLowerCase();
  if(key.matchCode && lc && lc === key.matchCode) return true;
  if(key.matchBarcode && lc && lc === key.matchBarcode) return true;
  if(key.matchShop && lc && lc === key.matchShop) return true;
  if(key.matchName && ln && ln === key.matchName) return true;
  if(key.matchCode && ln && ln === key.matchCode) return true;
  return false;
}

function fmtPiDisplayDate(d){
  if(!d) return "";
  const s = String(d).slice(0, 10);
  const p = s.split("-");
  if(p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
  return s;
}

function historyRowFromLine(pi, line){
  const n = normalizePiLine(line);
  const qty = n.qty;
  return {
    purchaseId: pi.id,
    purchaseNo: pi.piNo || "",
    invoiceNo: pi.supplierInvNo || "",
    invoiceDate: pi.supplierInvDate || pi.invDate || pi.docDate || "",
    productName: n.name,
    qty,
    unit: n.unit || "Pcs",
    rate: n.price,
    amount: n.amount,
    discount: qty > 0 ? roundMoney(n.disc / qty) : 0,
    netAmt: qty > 0 ? roundMoney(n.net / qty) : n.price,
    supplier: pi.supplier || "",
  };
}

function collectProductPurchaseHistory(key){
  const rows = [];
  purchaseInvoices.forEach(pi=>{
    if(String(pi.status || "Posted").toLowerCase() === "cancelled") return;
    (pi.items || []).forEach(line=>{
      if(!piLineMatchesProduct(line, key)) return;
      rows.push(historyRowFromLine(pi, line));
    });
  });
  return rows.sort((a,b)=> String(b.invoiceDate || "").localeCompare(String(a.invoiceDate || "")));
}

function collectVendorPurchaseHistory(vendorName){
  const vn = String(vendorName || "").trim().toLowerCase();
  if(!vn) return [];
  const rows = [];
  purchaseInvoices.forEach(pi=>{
    if(String(pi.status || "Posted").toLowerCase() === "cancelled") return;
    if(String(pi.supplier || "").trim().toLowerCase() !== vn) return;
    (pi.items || []).forEach(line=> rows.push(historyRowFromLine(pi, line)));
  });
  return rows.sort((a,b)=> String(b.invoiceDate || "").localeCompare(String(a.invoiceDate || "")));
}

let _piHistoryMode = "";
let _piHistoryRows = [];

function renderPiHistoryTable(mode, rows, title){
  _piHistoryMode = mode;
  _piHistoryRows = rows || [];
  const head = document.getElementById("piHistoryHead");
  const body = document.getElementById("piHistoryRows");
  const foot = document.getElementById("piHistoryFoot");
  const titleEl = document.getElementById("piHistoryTitle");
  if(titleEl) titleEl.textContent = title;
  if(!head || !body || !foot) return;
  if(mode === "vendor"){
    head.innerHTML = `<tr>
      <th>PurchaseNo.</th><th>InvoiceNo</th><th>Invoice Date</th><th>Product Name</th>
      <th>Qty Purchased</th><th>Rate</th><th>Amount</th><th>Discount</th><th>Net Amt</th>
    </tr>`;
  }else{
    head.innerHTML = `<tr>
      <th>PurchaseNo.</th><th>InvoiceNo</th><th>Invoice Date</th>
      <th>Qty Purchased</th><th>Rate</th><th>Amount</th><th>Discount</th><th>Net Amt</th><th>Purchased From</th>
    </tr>`;
  }
  if(!rows.length){
    body.innerHTML = `<tr><td colspan="${mode === "vendor" ? 9 : 9}" class="empty">No purchase history found</td></tr>`;
    foot.innerHTML = "";
    return;
  }
  const totalQty = rows.reduce((s,r)=> s + num(r.qty), 0);
  const unit = rows[0]?.unit || "Pcs";
  body.innerHTML = rows.map((r, idx)=> mode === "vendor"
    ? `<tr data-pi-history-row="${idx}" title="Open purchase invoice">
      <td>${esc(r.purchaseNo)}</td><td>${esc(r.invoiceNo)}</td><td>${esc(fmtPiDisplayDate(r.invoiceDate))}</td>
      <td>${esc(r.productName)}</td><td>${esc(r.qty)} ${esc(r.unit)}</td><td>${money(r.rate)}</td>
      <td>${money(r.amount)}</td><td>${money(r.discount)}</td><td>${money(r.netAmt)}</td>
    </tr>`
    : `<tr data-pi-history-row="${idx}" title="Open purchase invoice">
      <td>${esc(r.purchaseNo)}</td><td>${esc(r.invoiceNo)}</td><td>${esc(fmtPiDisplayDate(r.invoiceDate))}</td>
      <td>${esc(r.qty)} ${esc(r.unit)}</td><td>${money(r.rate)}</td><td>${money(r.amount)}</td>
      <td>${money(r.discount)}</td><td>${money(r.netAmt)}</td><td>${esc(r.supplier)}</td>
    </tr>`
  ).join("");
  body.querySelectorAll("[data-pi-history-row]").forEach(tr=>{
    tr.addEventListener("dblclick", ()=> openPiHistoryPurchase(tr.getAttribute("data-pi-history-row")));
    tr.addEventListener("click", ()=> openPiHistoryPurchase(tr.getAttribute("data-pi-history-row")));
  });
  if(mode === "vendor"){
    foot.innerHTML = `<tr><th colspan="4">TOTAL</th><th>${esc(totalQty)} ${esc(unit)}</th><th colspan="4"></th></tr>`;
  }else{
    foot.innerHTML = `<tr><th colspan="3">TOTAL</th><th>${esc(totalQty)} ${esc(unit)}</th><th colspan="5"></th></tr>`;
  }
}

function openPiHistoryPurchase(idx){
  const row = _piHistoryRows[num(idx)];
  if(!row?.purchaseId) return;
  closeModal("piHistoryModal");
  editPurchaseInvoice(row.purchaseId);
}

function openProductPurchaseHistory(){
  const key = resolvePiEntryProduct();
  if(!key) return toast("Enter or select a product first");
  const rows = collectProductPurchaseHistory(key);
  renderPiHistoryTable("product", rows, `PURCHASE HISTORY OF PRODUCT ${String(key.title || "").toUpperCase()}`);
  openFormModal("piHistoryModal", { keepOpen: ["purchaseModal"], skipPrepare: true });
}

function openVendorPurchaseHistory(){
  const vendor = document.getElementById("piSupplier")?.value
    || document.getElementById("piSupplierInput")?.value
    || "";
  if(!String(vendor).trim()) return toast("Select vendor first");
  const rows = collectVendorPurchaseHistory(vendor);
  renderPiHistoryTable("vendor", rows, `PURCHASE HISTORY OF VENDOR ${String(vendor).toUpperCase()}`);
  openFormModal("piHistoryModal", { keepOpen: ["purchaseModal"], skipPrepare: true });
}

function printPiHistory(){
  const title = document.getElementById("piHistoryTitle")?.textContent || "Purchase History";
  const table = document.querySelector("#piHistoryModal .pi-history-table");
  if(!table) return;
  const w = window.open("", "_blank");
  if(!w) return toast("Allow pop-ups to print");
  w.document.write(`<!DOCTYPE html><html><head><title>${esc(title)}</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px}h2{text-align:center;font-size:14px}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:4px;font-size:11px}
  th{background:#1e40af;color:#fff}</style></head><body>
  <h2>${esc(title)}</h2>${table.outerHTML}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

function handlePiF8(e){
  if(e.key !== "F8" || e.ctrlKey || e.altKey || e.metaKey) return;
  const modal = document.getElementById("purchaseModal");
  if(!modal?.classList.contains("open")) return;
  const active = document.activeElement;
  const id = active?.id || "";
  if(id === "piEntryPrice" || id === "piEntryMrp"){
    e.preventDefault();
    openProductPurchaseHistory();
    return;
  }
  if(id === "piSupplierInput" || active?.closest?.("[data-combo='piSupplier']")){
    e.preventDefault();
    openVendorPurchaseHistory();
  }
}

function readPiVatOpts(){
  return {
    vatAfterAdj: !!document.getElementById("piVatAfterAdj")?.checked,
    vatOnMrp: !!document.getElementById("piVatOnMrp")?.checked,
  };
}

function normalizePiLine(raw, opts = {}){
  const qty = num(raw.qty) || 1;
  const price = num(raw.price);
  const disc = num(raw.disc) || 0;
  const vat = num(raw.vat ?? raw.purchaseVat ?? shopDefaultVat());
  const name = String(raw.name || "").trim();
  const code = String(raw.code || "").trim();
  const unit = String(raw.unit || "Pcs").trim();
  const mrp = num(raw.mrp);
  const amount = qty * price;
  const net = Math.max(0, amount - disc);
  const vatOnMrp = !!opts.vatOnMrp;
  const vatAfterAdj = !!opts.vatAfterAdj;
  const vatBase = (vatOnMrp && mrp > 0) ? (qty * mrp) : net;
  // When VAT-after-adjustment is on, lines carry net only; header calc adds VAT later.
  const vatAmt = vatAfterAdj ? 0 : (vatBase * vat / 100);
  return { name, code, qty, unit, price, mrp, disc, vat, amount, net, vatAmt, line: net + vatAmt, vatBase };
}

function readPiEntryDraft(){
  return {
    name: document.getElementById("piEntryName")?.value || "",
    code: document.getElementById("piEntryCode")?.value || "",
    qty: document.getElementById("piEntryQty")?.value ?? 1,
    unit: document.getElementById("piEntryUnit")?.value || "Pcs",
    price: document.getElementById("piEntryPrice")?.value ?? 0,
    mrp: document.getElementById("piEntryMrp")?.value ?? 0,
    discPct: document.getElementById("piEntryDiscPct")?.value ?? 0,
    disc: document.getElementById("piEntryDisc")?.value ?? 0,
    vat: document.getElementById("piEntryVat")?.value ?? shopDefaultVat(),
  };
}

function syncPiEntryDiscFromPct(){
  const discEl = document.getElementById("piEntryDisc");
  const pctEl = document.getElementById("piEntryDiscPct");
  if(!discEl || !pctEl) return;
  const qty = num(document.getElementById("piEntryQty")?.value) || 1;
  const price = num(document.getElementById("piEntryPrice")?.value);
  const pct = _piDefaultDiscPct || num(pctEl.value);
  if(pct) discEl.value = roundMoney(qty * price * pct / 100);
}

function syncPiEntryDiscFromAmt(){
  const discEl = document.getElementById("piEntryDisc");
  const pctEl = document.getElementById("piEntryDiscPct");
  if(!discEl || !pctEl) return;
  const qty = num(document.getElementById("piEntryQty")?.value) || 1;
  const price = num(document.getElementById("piEntryPrice")?.value);
  const base = qty * price;
  if(base > 0) pctEl.value = roundMoney(num(discEl.value) * 100 / base);
  _piDefaultDiscPct = 0;
}

function syncPiEntryDefaultDiscount(){
  syncPiEntryDiscFromPct();
}

function updatePiEntryPreview(){ /* preview shown in grid after Add */ }

function clearPiEntryFields(){
  _piDefaultDiscPct = 0;
  ["piEntryName","piEntryCode","piEntryPrice","piEntryMrp","piEntryDisc","piEntryDiscPct"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("piEntryQty");
  const vat = document.getElementById("piEntryVat");
  if(qty) qty.value = 1;
  setPiEntryUnit("Pcs");
  if(vat) vat.value = shopDefaultVat();
  hidePiCatalogSuggest();
  updatePiEntryPreview();
  document.getElementById("piEntryName")?.focus();
}

function renderPiItemList(){
  const tbody = document.getElementById("piItemRows");
  if(!tbody) return;
  if(!_purchaseLineItems.length){
    tbody.innerHTML = `<tr class="inv-empty-row"><td colspan="11" class="empty">No items — enter product above and press Add</td></tr>`;
    return;
  }
  tbody.innerHTML = _purchaseLineItems.map((it, idx)=>{
    const x = normalizePiLine(it, readPiVatOpts());
    return `<tr class="inv-line-row" data-edit-pi-item="${idx}" title="Double-click to edit">
      <td class="inv-name-cell" data-label="Product">${esc(x.name)}</td>
      <td data-label="Code">${esc(x.code)}</td>
      <td data-label="Qty">${esc(x.qty)}</td>
      <td data-label="M.R.P">${money(x.mrp)}</td>
      <td data-label="Rate">${money(x.price)}</td>
      <td data-label="Amount">${money(x.amount)}</td>
      <td data-label="Dis Amt">${money(x.disc)}</td>
      <td data-label="Net Value">${money(x.net)}</td>
      <td data-label="VAT%">${esc(x.vat)}%</td>
      <td data-label="VAT AMT">${money(x.vatAmt)}</td>
      <td data-label="Net Amount">${money(x.line)} <button class="btn small danger" type="button" data-rm-pi-item="${idx}" style="margin-left:4px">×</button></td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("[data-edit-pi-item]").forEach(row=>{
    row.addEventListener("dblclick", e=>{
      if(e.target.closest("[data-rm-pi-item]")) return;
      loadPiLineForEdit(Number(row.dataset.editPiItem));
    });
  });
  tbody.querySelectorAll("[data-rm-pi-item]").forEach(btn=>{
    btn.onclick = e=>{
      e.stopPropagation();
      _purchaseLineItems.splice(Number(btn.dataset.rmPiItem), 1);
      renderPiItemList();
      calcPurchaseInvoice();
    };
  });
}

function loadPiLineForEdit(idx){
  const it = _purchaseLineItems[idx];
  if(!it) return;
  const x = normalizePiLine(it);
  const set = (id, val)=>{ const el = document.getElementById(id); if(el) el.value = val; };
  set("piEntryName", x.name);
  set("piEntryCode", x.code);
  set("piEntryQty", x.qty);
  setPiEntryUnit(x.unit);
  set("piEntryPrice", x.price);
  set("piEntryMrp", x.mrp);
  set("piEntryDisc", x.disc);
  set("piEntryDiscPct", x.amount > 0 ? roundMoney(x.disc * 100 / x.amount) : 0);
  const vatEl = document.getElementById("piEntryVat");
  if(vatEl) vatEl.value = x.vat;
  _piDefaultDiscPct = 0;
  _purchaseLineItems.splice(idx, 1);
  renderPiItemList();
  calcPurchaseInvoice();
  updatePiEntryPreview();
  document.getElementById("piEntryName")?.focus();
}

function commitPiEntryLine(){
  const draft = normalizePiLine(readPiEntryDraft());
  if(!draft.name) return toast("Product name required");
  _purchaseLineItems.push({
    name: draft.name, code: draft.code, qty: draft.qty, unit: draft.unit,
    price: draft.price, mrp: draft.mrp, disc: draft.disc, vat: draft.vat,
  });
  clearPiEntryFields();
  renderPiItemList();
  calcPurchaseInvoice();
}

function flushPiDraftLine(){
  const draft = readPiEntryDraft();
  if(!String(draft.name || "").trim()) return;
  commitPiEntryLine();
}

function calcPurchaseInvoice(){
  const opts = readPiVatOpts();
  const items = _purchaseLineItems.map(it=> normalizePiLine(it, opts));
  const sub = items.reduce((s,i)=> s + i.amount, 0);
  const lineDisc = items.reduce((s,i)=> s + i.disc, 0);
  const netValue = items.reduce((s,i)=> s + i.net, 0);
  const lineVat = items.reduce((s,i)=> s + i.vatAmt, 0);
  const lineGrand = items.reduce((s,i)=> s + i.line, 0);
  const qty = items.reduce((s,i)=> s + num(i.qty), 0);

  const hdrPct = num(document.getElementById("piHdrDiscPct")?.value);
  let hdrDisc = num(document.getElementById("piHdrDiscAmt")?.value);
  if(!hdrDisc && hdrPct) hdrDisc = roundMoney(netValue * hdrPct / 100);

  const adjustments = num(document.getElementById("piAdjustments")?.value);
  const roundOff = num(document.getElementById("piRoundOff")?.value);

  let vat = lineVat;
  let grand;
  if(opts.vatAfterAdj){
    const taxable = roundMoney(Math.max(0, netValue - hdrDisc + adjustments));
    const vatWeight = items.reduce((s,i)=> s + (i.net * num(i.vat) / 100), 0);
    const avgRate = netValue > 0.009 ? (vatWeight / netValue) : (shopDefaultVat() / 100);
    if(opts.vatOnMrp){
      const mrpVat = items.reduce((s,i)=>{
        const base = num(i.mrp) > 0 ? num(i.qty) * num(i.mrp) : i.net;
        return s + base * num(i.vat) / 100;
      }, 0);
      const mrpBase = items.reduce((s,i)=> s + (num(i.mrp) > 0 ? num(i.qty) * num(i.mrp) : i.net), 0);
      vat = mrpBase > 0.009
        ? roundMoney(taxable * (mrpVat / mrpBase))
        : roundMoney(taxable * avgRate);
    }else{
      vat = roundMoney(taxable * avgRate);
    }
    grand = roundMoney(taxable + vat + roundOff);
  }else{
    grand = roundMoney(lineGrand - hdrDisc + adjustments + roundOff);
  }

  const setTxt = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = money(v); };
  const setNum = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = v; };
  setNum("piTotQty", qty);
  setTxt("piTotAmount", sub);
  setTxt("piTotDisc", lineDisc);
  setTxt("piTotNet", netValue);
  setTxt("piTotVat", vat);
  setTxt("piTotGrand", opts.vatAfterAdj ? roundMoney(netValue + vat) : lineGrand);
  setTxt("piGrand", grand);

  return { items, sub, disc: lineDisc + hdrDisc, vat, grand, roundOff, hdrDisc, adjustments, lineGrand };
}

function supplierOptions(selectEl, selected){
  if(!selectEl) return;
  const sel = selected || "";
  selectEl.innerHTML = `<option value="">Select…</option>` + suppliers.map(s=>
    `<option value="${esc(s.name)}" ${s.name===sel?"selected":""}>${esc(s.name)}</option>`
  ).join("");
  if(sel) selectEl.value = sel;
  const wrap = selectEl.closest(".cust-combo");
  const input = wrap?.querySelector(".cust-combo-input");
  if(input) input.value = selectEl.value || "";
}

export function refreshSupplierSelects(){
  const sup = document.getElementById("piSupplier")?.value || "";
  supplierOptions(document.getElementById("piSupplier"), sup);
  refreshPiGrnSelect(sup);
}

function refreshPiGrnSelect(supplier, selectedId){
  const sel = document.getElementById("piGrnRef");
  if(!sel) return;
  const sup = String(supplier ?? document.getElementById("piSupplier")?.value ?? "").trim().toLowerCase();
  const cur = selectedId ?? sel.value ?? "";
  const currentPiId = document.getElementById("piId")?.value || "";
  const rows = (ctx.getGoodsReceipts?.() || []).filter(g=>{
    const st = String(g.status || "Posted").toLowerCase();
    if(st === "cancelled" || st === "voided") return false;
    if(sup && String(g.supplier || "").trim().toLowerCase() !== sup) return false;
    // Keep unlinked GRNs, or the GRN already linked to THIS purchase invoice
    if(!g.piId) return true;
    if(cur && g.id === cur) return true;
    if(currentPiId && g.piId === currentPiId) return true;
    return false;
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  sel.innerHTML = `<option value="">— No GRN (stock on PI) —</option>` + rows.map(g=>
    `<option value="${esc(g.id)}"${g.id === cur ? " selected" : ""}>${esc(g.grnNo)} · ${esc(g.date)} · ${esc(g.totalQty)} pcs</option>`
  ).join("");
  if(cur && [...sel.options].some(o=> o.value === cur)) sel.value = cur;
}

function loadPiLinesFromGrn(grn, { force = false } = {}){
  if(!grn) return false;
  const lines = (grn.items || []).filter(l=> num(l.qty) > 0 || num(l.damagedQty) > 0);
  if(!lines.length){
    toast("Selected GRN has no product lines");
    return false;
  }
  if(_purchaseLineItems.length && !force){
    if(!confirm("Replace current product lines with lines from this GRN?")) return false;
  }
  _purchaseLineItems = lines.map(l=>({
    name: l.name || "",
    code: l.code || "",
    qty: num(l.qty) || 0,
    unit: l.unit || "Pcs",
    price: num(l.rate ?? l.price),
    mrp: num(l.mrp),
    disc: num(l.disc),
    vat: num(l.vat ?? shopDefaultVat()),
  }));
  if(grn.stockLocation) syncPurchaseStockLocations(grn.stockLocation);
  if(grn.supplier){
    supplierOptions(document.getElementById("piSupplier"), grn.supplier);
  }
  clearPiEntryFields();
  renderPiItemList();
  calcPurchaseInvoice();
  return true;
}

function onPiGrnRefChange(){
  const grnId = document.getElementById("piGrnRef")?.value || "";
  if(!grnId) return;
  const grn = (ctx.getGoodsReceipts?.() || []).find(g=> g.id === grnId);
  if(!grn) return;
  loadPiLinesFromGrn(grn);
}

function productIdentityValues(p){
  if(!p) return [];
  return [
    p.code, p.barcode, p.ean, p.shopPartNumber,
    ...(Array.isArray(p.moreBarcodes) ? p.moreBarcodes : []),
    ...(Array.isArray(p.unitPrices) ? p.unitPrices.map(r=> r.barcode) : []),
  ].map(v=> String(v || "").trim()).filter(Boolean);
}

function productCodeLabel(p){
  return p?.code || p?.barcode || p?.shopPartNumber || p?.ean || "";
}

function productSearchBlob(p){
  return [
    p?.name, p?.code, p?.barcode, p?.ean, p?.shopPartNumber,
    p?.company, p?.brand, p?.category, p?.subcategory,
    ...(Array.isArray(p?.moreBarcodes) ? p.moreBarcodes : []),
  ].map(v=> String(v || "").trim()).filter(Boolean).join(" ").toLowerCase();
}

function findProductByExactCode(query){
  const q = String(query || "").trim().toLowerCase();
  if(!q) return null;
  return products().find(p=> productIdentityValues(p).some(v=> v.toLowerCase() === q)) || null;
}

function piCatalogMatches(q, extended = true){
  const ql = String(q || "").trim().toLowerCase();
  if(!ql) return [];
  return products().filter(p=>{
    const blob = productSearchBlob(p);
    if(extended) return blob.includes(ql);
    return blob.startsWith(ql)
      || productIdentityValues(p).some(v=> v.toLowerCase().startsWith(ql));
  }).slice(0, 80);
}

function piMatchField(value, query, extended){
  const hay = String(value ?? "").trim().toLowerCase();
  const needle = String(query ?? "").trim().toLowerCase();
  if(!needle) return true;
  if(!hay) return false;
  return extended ? hay.includes(needle) : hay.startsWith(needle);
}

function piSelectProductMatches(filters, extended){
  const nameQ = String(filters?.name || "").trim();
  const codeQ = String(filters?.code || "").trim();
  const mrpQ = String(filters?.mrp || "").trim();
  const rateQ = String(filters?.rate || "").trim();
  if(!nameQ && !codeQ && !mrpQ && !rateQ) return [];
  return products().filter(p=>{
    const cost = num(p.landingCost) || num(p.vatExclusive) || num(p.price);
    if(nameQ && !piMatchField(p.name, nameQ, extended)) return false;
    if(codeQ){
      const codeBlob = productIdentityValues(p).concat([p.code, p.barcode, p.ean, p.shopPartNumber]).join(" ");
      if(!piMatchField(codeBlob, codeQ, extended) && !productIdentityValues(p).some(v=> piMatchField(v, codeQ, extended))) return false;
    }
    if(mrpQ && !piMatchField(p.mrp, mrpQ, extended)) return false;
    if(rateQ && !piMatchField(cost, rateQ, extended)) return false;
    return true;
  }).slice(0, 500);
}

let _piSelectRows = [];

function renderPiSelectProductList(){
  const extended = !!document.getElementById("piSelExtended")?.checked;
  const filters = {
    name: document.getElementById("piSelName")?.value || "",
    code: document.getElementById("piSelCode")?.value || "",
    mrp: document.getElementById("piSelMrp")?.value || "",
    rate: document.getElementById("piSelRate")?.value || "",
  };
  _piSelectRows = piSelectProductMatches(filters, extended);
  const tbody = document.getElementById("piSelectRows");
  const countEl = document.getElementById("piSelCount");
  if(countEl) countEl.textContent = `${_piSelectRows.length} Product${_piSelectRows.length === 1 ? "" : "s"} found`;
  if(!tbody) return;
  if(!_piSelectRows.length){
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Enter name, code, barcode, EAN or scan to search</td></tr>`;
    return;
  }
  tbody.innerHTML = _piSelectRows.map((p, idx)=>{
    const cost = num(p.landingCost) || num(p.vatExclusive) || num(p.price);
    return `<tr data-pi-select-row="${idx}" title="Double-click to select">
      <td>${esc(p.name)}</td><td>${esc(productCodeLabel(p))}</td>
      <td>${money(p.mrp)}</td><td>${money(cost)}</td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("[data-pi-select-row]").forEach(tr=>{
    tr.addEventListener("click", ()=>{
      tbody.querySelectorAll("tr.is-selected").forEach(r=> r.classList.remove("is-selected"));
      tr.classList.add("is-selected");
      const row = _piSelectRows[num(tr.getAttribute("data-pi-select-row"))];
      const stockEl = document.getElementById("piSelStock");
      if(stockEl && row) stockEl.value = String(productStock(row));
    });
    tr.addEventListener("dblclick", ()=> pickPiSelectProduct(tr.getAttribute("data-pi-select-row")));
  });
}

function pickPiSelectProduct(idx){
  const p = _piSelectRows[num(idx)];
  if(!p) return;
  closeModal("piSelectProductModal");
  applyPiProductToEntry(p);
}

function openPiSelectProduct(){
  const name = document.getElementById("piEntryName")?.value?.trim() || "";
  const code = document.getElementById("piEntryCode")?.value?.trim() || "";
  const set = (id, val)=>{ const el = document.getElementById(id); if(el) el.value = val; };
  set("piSelName", name);
  set("piSelCode", code);
  set("piSelMrp", "");
  set("piSelRate", "");
  set("piSelStock", "");
  const ext = document.getElementById("piSelExtended");
  if(ext) ext.checked = true;
  renderPiSelectProductList();
  openFormModal("piSelectProductModal", { keepOpen: ["purchaseModal"], skipPrepare: true });
  setTimeout(()=> (code ? document.getElementById("piSelCode") : document.getElementById("piSelName"))?.focus(), 80);
}

function hidePiCatalogSuggest(){
  const list = document.getElementById("piCatalogSuggest");
  if(list){ list.hidden = true; list.innerHTML = ""; }
}

function piComboOptionItems(list){
  if(!list) return [];
  return [...list.querySelectorAll("li[data-pi-cat-id]")];
}

function setPiComboHighlight(list, index){
  const opts = piComboOptionItems(list);
  if(!opts.length) return null;
  const i = Math.max(0, Math.min(opts.length - 1, index));
  opts.forEach((li, n)=> li.setAttribute("aria-selected", n === i ? "true" : "false"));
  try{ opts[i].scrollIntoView({ block: "nearest" }); }catch(_){}
  return opts[i];
}

function movePiComboHighlight(list, delta){
  const opts = piComboOptionItems(list);
  if(!opts.length) return null;
  let idx = opts.findIndex(li=> li.getAttribute("aria-selected") === "true");
  if(idx < 0) idx = delta > 0 ? 0 : opts.length - 1;
  else idx += delta;
  return setPiComboHighlight(list, idx);
}

function activePiComboOption(list){
  return piComboOptionItems(list).find(li=> li.getAttribute("aria-selected") === "true") || null;
}

function handlePiCatalogKeydown(e, sourceId){
  const list = document.getElementById("piCatalogSuggest");
  if(!list) return;
  const open = !list.hidden;
  if(e.key === "Escape"){
    hidePiCatalogSuggest();
    return;
  }
  if(e.key === "ArrowDown"){
    e.preventDefault();
    if(!open) renderPiCatalogSuggest(e.target.value, sourceId);
    movePiComboHighlight(list, 1);
    return;
  }
  if(e.key === "ArrowUp"){
    e.preventDefault();
    if(!open) renderPiCatalogSuggest(e.target.value, sourceId);
    movePiComboHighlight(list, -1);
    return;
  }
  if(e.key === "Enter"){
    const hit = activePiComboOption(list) || (!list.hidden && list.querySelector("li[data-pi-cat-id]"));
    if(hit){
      e.preventDefault();
      applyPiCatalogPick(hit.getAttribute("data-pi-cat-id"));
      return;
    }
    if(sourceId === "piEntryName"){
      e.preventDefault();
      commitPiEntryLine();
    }
  }
}

function applyPiCatalogPick(id){
  const p = products().find(x=> x.id === id);
  if(!p) return;
  applyPiProductToEntry(p);
}

export function applyPiProductToEntry(p){
  if(!p) return;
  document.getElementById("piEntryName").value = p.name || "";
  document.getElementById("piEntryCode").value = p.code || p.barcode || p.shopPartNumber || "";
  setPiEntryUnit(p.unit || "Pcs");
  const cost = num(p.landingCost) || num(p.vatExclusive) || num(p.price);
  document.getElementById("piEntryPrice").value = cost;
  document.getElementById("piEntryMrp").value = num(p.mrp) || "";
  _piDefaultDiscPct = num(String(p.defaultDiscount || "").replace(/%$/, ""));
  const pctEl = document.getElementById("piEntryDiscPct");
  if(pctEl) pctEl.value = _piDefaultDiscPct || 0;
  const vatEl = document.getElementById("piEntryVat");
  if(vatEl) vatEl.value = num(p.purchaseVat ?? p.salesVat ?? p.vat ?? shopDefaultVat());
  syncPiEntryDiscFromPct();
  hidePiCatalogSuggest();
  updatePiEntryPreview();
  document.getElementById("piEntryQty")?.focus();
}

function openPiProductMaster(){
  const open = ctx.openProductMasterDrawer;
  if(!open){
    toast("Product Master is not ready");
    return;
  }
  open({
    returnModalId: "purchaseModal",
    onProductSaved(p){
      applyPiProductToEntry(p);
      toast(`"${p.name || "Product"}" ready — check qty/rate and press Add`);
    },
  });
}

function openPiProductSearch(){
  openPiSelectProduct();
}

function handlePiF10(e){
  if(e.key !== "F10" || e.ctrlKey || e.altKey || e.metaKey) return;
  const modal = document.getElementById("purchaseModal");
  if(!modal?.classList.contains("open")) return;
  const id = document.activeElement?.id || "";
  if(id !== "piEntryName" && id !== "piEntryCode") return;
  e.preventDefault();
  openPiSelectProduct();
}

function renderPiCatalogSuggest(q, sourceId = "piEntryName"){
  const input = document.getElementById(sourceId);
  const list = document.getElementById("piCatalogSuggest");
  if(!input || !list) return;
  const rows = piCatalogMatches(q, true);
  list.innerHTML = rows.length
    ? rows.map(p=>{
        const cost = num(p.landingCost) || num(p.vatExclusive) || num(p.price);
        const code = productCodeLabel(p);
        return `<li role="option" data-pi-cat-id="${esc(p.id)}" title="${esc(p.name)}">${esc(p.name)}<span class="cat-meta">${esc(code)} · ${money(cost)}</span></li>`;
      }).join("")
    : `<li class="cust-combo-empty">${products().length ? "No match" : "Product catalog empty"}</li>`;
  list.hidden = false;
}

function renderPiCodeSuggest(q){
  renderPiCatalogSuggest(q, "piEntryCode");
}

async function applyPurchaseStockDeltaLocal(items, direction, warehouseId){
  const wh = warehouseId ?? document.getElementById("piStockLoc")?.value ?? "Main";
  const docRef = document.getElementById("piNo")?.value?.trim() || "";
  try{
    await applyPurchaseStockDelta(items, wh, direction, docRef);
  }catch(e){
    const msg = inventoryErrorText(e?.message || e);
    throw new Error(msg);
  }
}

function isPiPosted(st){
  return String(st || "").toLowerCase() === "posted";
}

async function applyPurchaseStockMoves(existing, status, calcItems, stockLocation){
  const prevWh = existing?.stockLocation || "Main";
  const nextWh = stockLocation || "Main";
  const prevPosted = isPiPosted(existing?.status);
  const nextPosted = isPiPosted(status);
  if(prevPosted && nextPosted){
    await validateStockForLines(existing.items, prevWh, -1);
    await applyPurchaseStockDeltaLocal(existing.items, -1, prevWh);
    try{
      await applyPurchaseStockDeltaLocal(calcItems, 1, nextWh);
    }catch(e){
      await applyPurchaseStockDeltaLocal(existing.items, 1, prevWh);
      throw e;
    }
  }else if(!prevPosted && nextPosted){
    await applyPurchaseStockDeltaLocal(calcItems, 1, nextWh);
  }else if(prevPosted && !nextPosted){
    await validateStockForLines(existing.items, prevWh, -1);
    await applyPurchaseStockDeltaLocal(existing.items, -1, prevWh);
  }
}

async function rollbackPurchaseStockMoves(existing, status, calcItems, stockLocation){
  const prevWh = existing?.stockLocation || "Main";
  const nextWh = stockLocation || "Main";
  const prevPosted = isPiPosted(existing?.status);
  const nextPosted = isPiPosted(status);
  if(prevPosted && nextPosted){
    await applyPurchaseStockDeltaLocal(calcItems, -1, nextWh);
    await applyPurchaseStockDeltaLocal(existing.items, 1, prevWh);
  }else if(!prevPosted && nextPosted){
    await applyPurchaseStockDeltaLocal(calcItems, -1, nextWh);
  }else if(prevPosted && !nextPosted){
    await applyPurchaseStockDeltaLocal(existing.items, 1, prevWh);
  }
}

function purchaseStockWillMove(existing, status, calcItems, skipStock){
  if(skipStock) return false;
  if(!isPiPosted(status) && !isPiPosted(existing?.status)) return false;
  return catalogMatchedLines(calcItems).length > 0 || catalogMatchedLines(existing?.items).length > 0;
}

/** PI stock only when Posted AND not linked to GRN (GRN already moved stock). */
async function reconcilePiStock({ existing, status, calcItems, stockLocation, prevGrnId, nextGrnId }){
  const prevPosted = isPiPosted(existing?.status);
  const nextPosted = isPiPosted(status);
  const prevPiStock = prevPosted && !prevGrnId;
  const nextPiStock = nextPosted && !nextGrnId;
  if(prevPiStock && nextPiStock){
    await applyPurchaseStockMoves(existing, status, calcItems, stockLocation);
  }else if(prevPiStock && !nextPiStock){
    // Was PI-stocked, now Draft or GRN-linked → reverse previous stock
    await applyPurchaseStockMoves(existing, "Draft", calcItems, stockLocation);
  }else if(!prevPiStock && nextPiStock){
    // New post or was GRN-linked / Draft → apply stock from current lines
    await applyPurchaseStockMoves(prevPosted ? null : existing, "Posted", calcItems, stockLocation);
  }
}

async function rollbackPiStock({ existing, status, calcItems, stockLocation, prevGrnId, nextGrnId }){
  const prevPosted = isPiPosted(existing?.status);
  const nextPosted = isPiPosted(status);
  const prevPiStock = prevPosted && !prevGrnId;
  const nextPiStock = nextPosted && !nextGrnId;
  if(prevPiStock && nextPiStock){
    await rollbackPurchaseStockMoves(existing, status, calcItems, stockLocation);
  }else if(prevPiStock && !nextPiStock){
    await rollbackPurchaseStockMoves(existing, "Draft", calcItems, stockLocation);
  }else if(!prevPiStock && nextPiStock){
    await rollbackPurchaseStockMoves(prevPosted ? null : existing, "Posted", calcItems, stockLocation);
  }
}

export function renderSuppliers(){
  const tbody = document.getElementById("supplierRows");
  if(!tbody) return;
  const q = (document.getElementById("supplierSearch")?.value || "").toLowerCase();
  const rows = suppliers.filter(s=>{
    const blob = `${s.code} ${s.name} ${s.mobile} ${s.trn}`.toLowerCase();
    return blob.includes(q);
  });
  tbody.innerHTML = rows.length ? rows.map(s=> `<tr>
    <td>${esc(s.code)}</td><td class="cell-dbl-open" data-dbl-open="${esc(s.id)}" title="Double-click to open">${esc(s.name)}</td><td>${esc(s.contact)}</td><td>${esc(s.mobile)}</td>
    <td>${money(s.creditLimit)}</td><td>${esc(s.trn)}</td><td>${badge(s.status||"Active")}</td>
    <td><button class="btn small" type="button" data-edit-supp="${s.id}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="8" class="empty">No suppliers — add one</td></tr>`;
  tbody.querySelectorAll("[data-edit-supp]").forEach(b=> b.onclick = ()=> editSupplier(b.dataset.editSupp));
}

export function resetSupplier(){
  document.getElementById("supId").value = "";
  document.getElementById("supCode").value = `SUP-${String(suppliers.length + 1).padStart(4, "0")}`;
  ["supName","supContact","supMobile","supEmail","supTrn","supAddr","supNotes"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  document.getElementById("supDays").value = shop().creditDays || 30;
  document.getElementById("supStatus").value = "Active";
  const terms = document.getElementById("supTerms");
  const limit = document.getElementById("supLimit");
  const opening = document.getElementById("supOpening");
  if(terms) terms.value = "30 Days Credit";
  if(limit) limit.value = 0;
  if(opening) opening.value = 0;
}

function bindSupplierListDblOpen(){
  const tbody = document.getElementById("supplierRows");
  if(!tbody || tbody.dataset.dblOpenBound) return;
  tbody.dataset.dblOpenBound = "1";
  tbody.addEventListener("dblclick", e=>{
    const cell = e.target.closest("[data-dbl-open]");
    if(!cell) return;
    editSupplier(cell.dataset.dblOpen);
  });
}

function editSupplier(id){
  const s = suppliers.find(x=> x.id === id);
  if(!s) return;
  document.getElementById("supId").value = s.id;
  document.getElementById("supCode").value = s.code || "";
  document.getElementById("supName").value = s.name || "";
  document.getElementById("supContact").value = s.contact || "";
  document.getElementById("supMobile").value = s.mobile || "";
  document.getElementById("supEmail").value = s.email || "";
  document.getElementById("supTrn").value = s.trn || "";
  document.getElementById("supDays").value = s.creditDays || 30;
  document.getElementById("supStatus").value = s.status || "Active";
  const terms = document.getElementById("supTerms");
  const limit = document.getElementById("supLimit");
  const opening = document.getElementById("supOpening");
  if(terms) terms.value = s.paymentTerms || "30 Days Credit";
  if(limit) limit.value = s.creditLimit ?? 0;
  if(opening) opening.value = s.openingBalance ?? 0;
  document.getElementById("supAddr").value = s.addr || "";
  document.getElementById("supNotes").value = s.notes || "";
  openFormModal("supplierModal", { skipPrepare: true });
}

async function saveSupplier(){
  if(!requireModule("suppliers")) return;
  const name = document.getElementById("supName").value.trim();
  if(!name) return toast("Supplier name required");
  const id = document.getElementById("supId").value;
  const data = {
    code: document.getElementById("supCode").value.trim(),
    name,
    contact: document.getElementById("supContact").value.trim(),
    mobile: document.getElementById("supMobile").value.trim(),
    email: document.getElementById("supEmail").value.trim(),
    trn: document.getElementById("supTrn").value.trim(),
    paymentTerms: (document.getElementById("supTerms")?.value || "").trim(),
    creditDays: num(document.getElementById("supDays").value),
    creditLimit: num(document.getElementById("supLimit")?.value),
    openingBalance: num(document.getElementById("supOpening")?.value),
    status: document.getElementById("supStatus").value,
    addr: document.getElementById("supAddr").value.trim(),
    notes: document.getElementById("supNotes").value.trim(),
    branchId: getCurrentBranchId() || "",
    ...masterMeta()
  };
  try{
    if(id) await updateDoc(doc(db(), "suppliers", id), data);
    else{
      Object.assign(data, masterCreateMeta());
      await addDoc(col("suppliers"), data);
    }
    leaveFormAfterSave("supplierModal");
    toast("Supplier saved");
    await logActivity({ action:"edit", staffName: who(), module:"Suppliers", summary: "Supplier saved " + name });
  }catch(e){ toast(friendlyFirestoreError(e)); }
}

function updatePiStockLabel(){
  const el = document.getElementById("piStockLabel");
  const sel = document.getElementById("piStockLoc");
  const id = sel?.value || "";
  const w = getWarehouses().find(x=> x.id === id);
  if(el) el.textContent = w ? `${w.code} — ${w.name}` : (sel?.selectedOptions?.[0]?.textContent || "—");
}

export function syncPurchaseStockLocations(preserveValue){
  const sel = document.getElementById("piStockLoc");
  if(!sel) return;
  fillWarehouseSelect(sel, preserveValue ?? sel.value);
  updatePiStockLabel();
}

export function formatStockLocation(loc){
  const id = String(loc || "").trim();
  if(!id) return "Main";
  const w = getWarehouses().find(x=> x.id === id);
  return w ? `${w.code} — ${w.name}` : id;
}

function resetPurchaseInvoice(){
  document.getElementById("piId").value = "";
  document.getElementById("piNo").value = nextNo(shop().piPrefix || "PI-", purchaseInvoices, "piNo");
  document.getElementById("piRef").value = "";
  document.getElementById("piSupInvNo").value = "";
  syncPurchaseStockLocations();
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("piDate").value = today;
  document.getElementById("piSupInvDate").value = today;
  const days = num(shop().creditDays) || 30;
  document.getElementById("piCreditDays").value = days;
  const due = new Date();
  due.setDate(due.getDate() + days);
  document.getElementById("piDue").value = due.toISOString().slice(0, 10);
  document.getElementById("piCurrency").value = shop().currency || "AED";
  document.getElementById("piPayMode").value = "Cash";
  document.getElementById("piHdrDiscPct").value = 0;
  document.getElementById("piHdrDiscAmt").value = 0;
  document.getElementById("piAdjustments").value = 0;
  document.getElementById("piRoundOff").value = 0;
  document.getElementById("piNarration").value = "";
  document.getElementById("piVatAfterAdj").checked = false;
  document.getElementById("piVatOnMrp").checked = false;
  const vatEl = document.getElementById("piEntryVat");
  if(vatEl) vatEl.value = shopDefaultVat();
  supplierOptions(document.getElementById("piSupplier"), "");
  refreshPiGrnSelect("", "");
  updatePiStockLabel();
  _purchaseLineItems = [];
  clearPiEntryFields();
  renderPiItemList();
  calcPurchaseInvoice();
}

function openNewPurchaseInvoice(){
  resetPurchaseInvoice();
}

function editPurchaseInvoice(id){
  const pi = purchaseInvoices.find(x=> x.id === id);
  if(!pi) return;
  const st = String(pi.status || "Posted").toLowerCase();
  if(st === "cancelled" || st === "voided") return toast("Cannot edit a voided purchase invoice");
  document.getElementById("piId").value = pi.id;
  document.getElementById("piNo").value = pi.piNo || "";
  document.getElementById("piRef").value = pi.refNo || "";
  document.getElementById("piSupInvNo").value = pi.supplierInvNo || "";
  syncPurchaseStockLocations(pi.stockLocation || "Main");
  document.getElementById("piDate").value = pi.docDate || pi.invDate || "";
  document.getElementById("piSupInvDate").value = pi.supplierInvDate || pi.invDate || "";
  document.getElementById("piDue").value = pi.dueDate || "";
  document.getElementById("piCurrency").value = pi.currency || shop().currency || "AED";
  document.getElementById("piPayMode").value = pi.payMode || "Cash";
  document.getElementById("piCreditDays").value = pi.creditDays ?? shop().creditDays ?? 30;
  document.getElementById("piHdrDiscPct").value = pi.hdrDiscPct ?? 0;
  document.getElementById("piHdrDiscAmt").value = pi.hdrDiscAmt ?? 0;
  document.getElementById("piAdjustments").value = pi.adjustments ?? 0;
  document.getElementById("piRoundOff").value = pi.roundOff ?? 0;
  document.getElementById("piNarration").value = pi.narration || "";
  document.getElementById("piVatAfterAdj").checked = !!pi.vatAfterAdj;
  document.getElementById("piVatOnMrp").checked = !!pi.vatOnMrp;
  updatePiStockLabel();
  supplierOptions(document.getElementById("piSupplier"), pi.supplier || "");
  refreshPiGrnSelect(pi.supplier || "", pi.grnId || "");
  _purchaseLineItems = Array.isArray(pi.items) ? pi.items.map(it=> ({ ...it })) : [];
  clearPiEntryFields();
  renderPiItemList();
  calcPurchaseInvoice();
  openFormModal("purchaseModal", { skipPrepare: true });
}

export function renderPurchaseInvoices(){
  const tbody = document.getElementById("purchaseRows");
  if(!tbody) return;
  const q = (document.getElementById("purchaseSearch")?.value || "").toLowerCase();
  const rows = purchaseInvoices.filter(pi=>{
    const blob = `${pi.piNo} ${pi.supplier} ${pi.supplierInvNo} ${pi.refNo}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(b.invDate||"").localeCompare(String(a.invDate||"")));
  tbody.innerHTML = rows.length ? rows.map(pi=>{
    const bal = Math.max(0, num(pi.total) - num(pi.paid) - num(pi.credited));
    const st = String(pi.status || "Posted");
    const stLow = st.toLowerCase();
    const paySt = stLow === "cancelled" || stLow === "voided"
      ? "—"
      : (bal <= 0.009 ? "Paid" : (num(pi.paid) > 0 || num(pi.credited) > 0 ? "Partial" : "Open"));
    const canVoid = stLow !== "cancelled" && stLow !== "voided";
    return `<tr>
    <td>${esc(pi.piNo)}</td><td>${esc(pi.invDate)}</td><td>${esc(pi.supplier)}</td>
    <td>${esc(pi.supplierInvNo)}</td><td>${esc(formatStockLocation(pi.stockLocation))}</td>
    <td>${money(pi.total)}</td><td>${money(pi.paid)}</td><td>${money(bal)}</td>
    <td>${badge(st)}</td><td>${esc(paySt)}</td>
    <td>
      <button class="btn small" type="button" data-edit-pi="${pi.id}">Open</button>
      ${canVoid ? `<button class="btn small danger" type="button" data-void-pi="${pi.id}">Void</button>` : ""}
    </td>
  </tr>`;
  }).join("") : `<tr><td colspan="11" class="empty">No purchase invoices</td></tr>`;
  tbody.querySelectorAll("[data-edit-pi]").forEach(b=> b.onclick = ()=> editPurchaseInvoice(b.dataset.editPi));
  tbody.querySelectorAll("[data-void-pi]").forEach(b=> b.onclick = ()=> voidPurchaseInvoice(b.dataset.voidPi));
}

async function voidPurchaseInvoice(id){
  if(!requireModule("purchase-invoices")) return;
  const pi = purchaseInvoices.find(x=> x.id === id);
  if(!pi) return toast("Purchase invoice not found");
  const st = String(pi.status || "Posted").toLowerCase();
  if(st === "cancelled" || st === "voided") return toast("Already voided");
  if(num(pi.paid) > 0.009){
    return toast("Void Vendor Payment(s) first — this PI has payments applied");
  }
  if(num(pi.credited) > 0.009){
    return toast("Void Purchase Return(s) first — this PI has returns credited");
  }
  if(!confirm(`Void purchase ${pi.piNo}? This reverses stock (if stock was on PI) and unlinks GRN.`)) return;
  try{
    _purchaseSaving = true;
    const wasPosted = isPiPosted(st);
    const hadPiStock = wasPosted && !pi.grnId;
    if(hadPiStock){
      await applyPurchaseStockMoves(pi, "Draft", pi.items || [], pi.stockLocation || "Main");
    }
    try{
      await updateDoc(doc(db(), "purchaseInvoices", pi.id), {
        status: "Cancelled",
        updatedAt: Date.now(),
        updatedBy: who(),
      });
      if(pi.grnId) await ctx.unlinkGrnFromPurchase?.(pi.grnId);
    }catch(docErr){
      if(hadPiStock) await rollbackPurchaseStockMoves(pi, "Draft", pi.items || [], pi.stockLocation || "Main");
      throw docErr;
    }
    Object.assign(pi, { status: "Cancelled" });
    await logActivity({
      action: "void", staffName: who(), module: "Purchase Invoice",
      record: pi.piNo, summary: `Voided · ${pi.supplier}`
    });
    toast("Purchase invoice voided");
    renderPurchaseInvoices();
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _purchaseSaving = false;
  }
}

async function savePurchaseInvoice(status){
  if(!requireModule("purchase-invoices")) return;
  if(_purchaseSaving) return toast("Save already in progress…");
  flushPiDraftLine();
  const calc = calcPurchaseInvoice();
  const supplier = document.getElementById("piSupplier")?.value || "";
  if(!supplier) return toast("Select vendor");
  if(!calc.items.length) return toast("Add at least one product line");
  const piId = document.getElementById("piId").value;
  const existing = piId ? purchaseInvoices.find(x=> x.id === piId) : null;
  const paid = num(existing?.paid);
  const credited = num(existing?.credited);
  if(status === "Draft" && (paid > 0.009 || credited > 0.009)){
    return toast("Cannot save as Draft — void Vendor Payment(s) / Purchase Return(s) first");
  }
  if(calc.grand + 0.02 < paid + credited){
    return toast(
      `Net amount ${money(calc.grand)} cannot be less than paid ${money(paid)} + credited ${money(credited)}. ` +
      `Void payments/returns first or increase the total.`
    );
  }
  const unmatched = calc.items.filter(l=> !findProductForLine(l));
  if(status === "Posted" && unmatched.length){
    const names = unmatched.slice(0, 3).map(l=> l.name || l.code || "?").join(", ");
    const more = unmatched.length > 3 ? ` (+${unmatched.length - 3} more)` : "";
    if(!confirm(
      `${unmatched.length} line(s) are not in Product Master (${names}${more}).\n` +
      `Those lines will NOT update stock. Continue?`
    )) return;
  }
  const supplierInvNo = document.getElementById("piSupInvNo").value.trim();
  const supplierInvDate = document.getElementById("piSupInvDate").value;
  const docDate = document.getElementById("piDate").value;
  const dupDate = String(supplierInvDate || docDate || "").slice(0, 10);
  if(supplierInvNo && dupDate){
    const dupPi = purchaseInvoices.find(pi=>{
      if(piId && pi.id === piId) return false;
      const st = String(pi.status || "").toLowerCase();
      if(st === "cancelled" || st === "voided") return false;
      if(String(pi.supplier || "").trim().toLowerCase() !== supplier.trim().toLowerCase()) return false;
      const piDate = String(pi.supplierInvDate || pi.invDate || pi.docDate || "").slice(0, 10);
      if(piDate !== dupDate) return false;
      return String(pi.supplierInvNo || "").trim().toLowerCase() === supplierInvNo.toLowerCase();
    });
    if(dupPi){
      return toast(
        `Duplicate blocked — same Vendor Invoice No., vendor and date already on ${dupPi.piNo}` +
        ` (${dupPi.supplier}, ${dupDate}).`
      );
    }
  }
  const grnId = document.getElementById("piGrnRef")?.value || "";
  const prevGrnId = existing?.grnId || "";
  if(grnId && status === "Posted"){
    const grn = (ctx.getGoodsReceipts?.() || []).find(g=> g.id === grnId);
    if(!grn) return toast("Selected GRN not found");
    const gst = String(grn.status || "Posted").toLowerCase();
    if(gst === "cancelled" || gst === "voided") return toast("Cannot link a voided/cancelled GRN");
    if(grn.piId && grn.piId !== piId){
      return toast(`GRN ${grn.grnNo} is already linked to ${grn.piNo || "another purchase"}`);
    }
  }
  if(!piId){
    const serial = await allocateDocSerial("purchase_invoice", shop().piPrefix || "PI-", {
      list: purchaseInvoices, field: "piNo", draftValue: document.getElementById("piNo")?.value, preferCounter: true
    });
    document.getElementById("piNo").value = serial.value;
  }
  const skipStock = !!grnId && status === "Posted";
  const data = {
    piNo: document.getElementById("piNo").value.trim(),
    refNo: document.getElementById("piRef").value.trim(),
    supplierInvNo,
    stockLocation: document.getElementById("piStockLoc").value.trim() || "Main",
    docDate,
    supplierInvDate,
    invDate: supplierInvDate || docDate,
    dueDate: document.getElementById("piDue").value,
    supplier,
    currency: document.getElementById("piCurrency").value.trim() || shop().currency || "AED",
    payMode: document.getElementById("piPayMode").value,
    creditDays: num(document.getElementById("piCreditDays").value),
    hdrDiscPct: num(document.getElementById("piHdrDiscPct").value),
    hdrDiscAmt: calc.hdrDisc,
    adjustments: calc.adjustments,
    vatAfterAdj: !!document.getElementById("piVatAfterAdj")?.checked,
    vatOnMrp: !!document.getElementById("piVatOnMrp")?.checked,
    roundOff: calc.roundOff,
    narration: document.getElementById("piNarration").value.trim(),
    items: calc.items,
    subtotal: calc.sub,
    discount: calc.disc,
    vat: calc.vat,
    total: calc.grand,
    grnId: grnId || "",
    grnNo: grnId ? ((ctx.getGoodsReceipts?.() || []).find(g=> g.id === grnId)?.grnNo || existing?.grnNo || "") : "",
    paid,
    paidDate: existing?.paidDate || "",
    credited,
    branchId: getCurrentBranchId() || existing?.branchId || "",
    status,
    updatedAt: Date.now(),
    updatedBy: who(),
  };
  try{
    _purchaseSaving = true;
    const stockLoc = data.stockLocation || "Main";
    const stockArgs = { existing, status, calcItems: calc.items, stockLocation: stockLoc, prevGrnId, nextGrnId: grnId };
    if(piId){
      await reconcilePiStock(stockArgs);
      try{
        await updateDoc(doc(db(), "purchaseInvoices", piId), data);
      }catch(docErr){
        await rollbackPiStock(stockArgs);
        throw docErr;
      }
    }else{
      await reconcilePiStock(stockArgs);
      try{
        data.createdAt = Date.now();
        data.createdBy = who();
        data.paid = 0;
        data.paidDate = "";
        data.credited = 0;
        const ref = await addDoc(col("purchaseInvoices"), data);
        document.getElementById("piId").value = ref.id;
      }catch(docErr){
        await rollbackPiStock(stockArgs);
        throw docErr;
      }
    }
    const savedId = document.getElementById("piId").value;
    // Release GRN lock when changed, cleared, or saving Draft (only Posted locks GRN)
    if(prevGrnId && (prevGrnId !== grnId || status !== "Posted")){
      await ctx.unlinkGrnFromPurchase?.(prevGrnId);
    }
    if(grnId && status === "Posted" && savedId){
      await ctx.linkGrnToPurchase?.(grnId, savedId, data.piNo);
    }
    await logActivity({
      action: status === "Draft" ? "draft" : (existing ? "edit" : "add"),
      staffName: who(),
      module: "Purchase Invoice",
      record: data.piNo,
      summary: `${status} ${data.piNo} · ${supplier}`,
      newValue: money(data.total),
    });
    leaveFormAfterSave("purchaseModal");
    const stockNote = skipStock && status === "Posted"
      ? " — linked to GRN (stock already received)"
      : (status === "Posted" && purchaseStockWillMove(existing, status, calc.items, skipStock) ? " — stock updated" : "");
    toast(status === "Draft" ? "Purchase draft saved" : "Purchase invoice posted" + stockNote);
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _purchaseSaving = false;
  }
}

export function onSuppliersLoaded(rows){
  suppliers = rows || [];
  renderSuppliers();
  refreshSupplierSelects();
}

export function onPurchaseInvoicesLoaded(rows){
  purchaseInvoices = rows || [];
  renderPurchaseInvoices();
}

function openPurchaseSearch(){
  const today = new Date().toISOString().slice(0, 10);
  const set = (id, val)=>{ const el = document.getElementById(id); if(el) el.value = val; };
  set("piSearchFrom", today);
  set("piSearchTo", today);
  ["piSearchBillNo","piSearchVendor","piSearchEmployee","piSearchPayMode","piSearchNetAmt","piSearchRefNo"].forEach(id=> set(id, ""));
  const ext = document.getElementById("piSearchExtended");
  const auto = document.getElementById("piSearchAuto");
  if(ext) ext.checked = false;
  if(auto) auto.checked = true;
  renderPiInvoiceSearchList();
  openFormModal("piInvoiceSearchModal", { keepOpen: ["purchaseModal"], skipPrepare: true });
  setTimeout(()=> document.getElementById("piSearchBillNo")?.focus(), 80);
}

function readPiInvoiceSearchFilters(){
  return {
    from: document.getElementById("piSearchFrom")?.value || "",
    to: document.getElementById("piSearchTo")?.value || "",
    billNo: document.getElementById("piSearchBillNo")?.value || "",
    vendor: document.getElementById("piSearchVendor")?.value || "",
    employee: document.getElementById("piSearchEmployee")?.value || "",
    payMode: document.getElementById("piSearchPayMode")?.value || "",
    netAmt: document.getElementById("piSearchNetAmt")?.value || "",
    refNo: document.getElementById("piSearchRefNo")?.value || "",
    extended: !!document.getElementById("piSearchExtended")?.checked,
  };
}

let _piInvoiceSearchRows = [];

function piInvoiceSearchMatches(filters){
  const extended = !!filters.extended;
  const hasCriteria = filters.billNo || filters.vendor || filters.employee || filters.payMode || filters.netAmt || filters.refNo;
  return purchaseInvoices.filter(pi=>{
    const d = String(pi.invDate || pi.supplierInvDate || pi.docDate || "").slice(0, 10);
    if(filters.from && d && d < filters.from) return false;
    if(filters.to && d && d > filters.to) return false;
    if(!hasCriteria && !filters.from && !filters.to) return true;
    if(!piMatchField(pi.piNo, filters.billNo, extended)) return false;
    if(!piMatchField(pi.supplier, filters.vendor, extended)) return false;
    if(!piMatchField(pi.updatedBy || pi.createdBy, filters.employee, extended)) return false;
    if(!piMatchField(pi.payMode, filters.payMode, extended)) return false;
    const refBlob = `${pi.refNo || ""} ${pi.supplierInvNo || ""}`;
    if(filters.refNo && !piMatchField(refBlob, filters.refNo, extended)) return false;
    if(filters.netAmt && !piMatchField(String(num(pi.total)), filters.netAmt, extended)) return false;
    return true;
  }).sort((a,b)=> String(b.invDate || b.supplierInvDate || "").localeCompare(String(a.invDate || a.supplierInvDate || "")));
}

function renderPiInvoiceSearchList(){
  const filters = readPiInvoiceSearchFilters();
  _piInvoiceSearchRows = piInvoiceSearchMatches(filters);
  const tbody = document.getElementById("piInvoiceSearchRows");
  if(!tbody) return;
  if(!_piInvoiceSearchRows.length){
    tbody.innerHTML = `<tr><td colspan="6" class="empty">No matching purchase invoices — change filters and press Display</td></tr>`;
    return;
  }
  tbody.innerHTML = _piInvoiceSearchRows.map((pi, idx)=> `<tr data-pi-inv-search="${idx}" title="Click to open purchase invoice">
    <td>${esc(pi.piNo)}</td>
    <td>${esc(fmtPiDisplayDate(pi.invDate || pi.supplierInvDate || pi.docDate))}</td>
    <td>${esc(pi.supplier)}</td>
    <td>${esc(pi.updatedBy || pi.createdBy || "")}</td>
    <td>${esc(pi.payMode || "")}</td>
    <td>${money(pi.total)}</td>
  </tr>`).join("");
  tbody.querySelectorAll("[data-pi-inv-search]").forEach(tr=>{
    tr.addEventListener("click", ()=>{
      tbody.querySelectorAll("tr.is-selected").forEach(r=> r.classList.remove("is-selected"));
      tr.classList.add("is-selected");
    });
    tr.addEventListener("dblclick", ()=> openPiInvoiceFromSearch(tr.getAttribute("data-pi-inv-search")));
  });
}

function openPiInvoiceFromSearch(idx){
  const pi = _piInvoiceSearchRows[num(idx)];
  if(!pi?.id) return;
  closeModal("piInvoiceSearchModal");
  editPurchaseInvoice(pi.id);
}

function sortedPurchaseList(){
  return purchaseInvoices.slice().sort((a,b)=> String(a.piNo||"").localeCompare(String(b.piNo||"")));
}

function navigatePurchase(dir){
  const list = sortedPurchaseList();
  if(!list.length) return toast("No saved purchases");
  const id = document.getElementById("piId")?.value || "";
  let idx = list.findIndex(x=> x.id === id);
  if(idx < 0) idx = dir > 0 ? -1 : list.length;
  idx += dir;
  if(idx < 0) return toast("First purchase");
  if(idx >= list.length) return toast("Last purchase");
  editPurchaseInvoice(list[idx].id);
}

function printPurchaseInvoice(){
  flushPiDraftLine();
  const calc = calcPurchaseInvoice();
  const rows = calc.items.map(x=> `<tr>
    <td>${esc(x.name)}</td><td>${esc(x.code)}</td><td>${esc(x.qty)}</td>
    <td>${money(x.mrp)}</td><td>${money(x.price)}</td><td>${money(x.amount)}</td>
    <td>${money(x.disc)}</td><td>${money(x.net)}</td><td>${esc(x.vat)}%</td>
    <td>${money(x.vatAmt)}</td><td>${money(x.line)}</td>
  </tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Purchase ${esc(document.getElementById("piNo")?.value)}</title>
  <style>body{font-family:Arial,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:4px}</style></head><body>
  <h2>PURCHASE INVOICE</h2>
  <p><b>P.No:</b> ${esc(document.getElementById("piNo")?.value)} &nbsp; <b>Vendor:</b> ${esc(document.getElementById("piSupplier")?.value)} &nbsp; <b>Date:</b> ${esc(document.getElementById("piDate")?.value)}</p>
  <table><thead><tr><th>Product</th><th>Code</th><th>Qty</th><th>MRP</th><th>Rate</th><th>Amount</th><th>Dis</th><th>Net</th><th>VAT%</th><th>VAT</th><th>Total</th></tr></thead>
  <tbody>${rows || "<tr><td colspan='11'>No items</td></tr>"}</tbody></table>
  <p style="text-align:right"><b>NET AMOUNT: ${money(calc.grand)}</b></p>
  </body></html>`;
  const w = window.open("", "_blank");
  if(!w) return toast("Allow pop-ups to print");
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export function wirePurchaseUi(){
  bindSupplierListDblOpen();
  document.getElementById("saveSupplierBtn")?.addEventListener("click", saveSupplier);
  document.getElementById("supplierSearch")?.addEventListener("input", renderSuppliers);
  document.getElementById("purchaseSearch")?.addEventListener("input", renderPurchaseInvoices);
  document.getElementById("addPiItemBtn")?.addEventListener("click", commitPiEntryLine);
  document.getElementById("addPiItemBtnMobile")?.addEventListener("click", commitPiEntryLine);
  document.getElementById("savePurchaseBtn")?.addEventListener("click", ()=> savePurchaseInvoice("Posted"));
  document.getElementById("draftPurchaseBtn")?.addEventListener("click", ()=> savePurchaseInvoice("Draft"));
  document.getElementById("piSupplier")?.addEventListener("change", ()=>{
    const sup = document.getElementById("piSupplier")?.value || "";
    const curGrn = document.getElementById("piGrnRef")?.value || "";
    refreshPiGrnSelect(sup, curGrn);
  });
  document.getElementById("piGrnRef")?.addEventListener("change", onPiGrnRefChange);
  ["piVatAfterAdj","piVatOnMrp"].forEach(id=>{
    document.getElementById(id)?.addEventListener("change", ()=>{
      renderPiItemList();
      calcPurchaseInvoice();
    });
  });
  document.getElementById("piStartFreshBtn")?.addEventListener("click", ()=>{
    if(confirm("Clear this purchase and start fresh?")) openNewPurchaseInvoice();
  });
  document.getElementById("piInvSearchDisplayBtn")?.addEventListener("click", renderPiInvoiceSearchList);
  ["piSearchFrom","piSearchTo","piSearchBillNo","piSearchVendor","piSearchEmployee","piSearchPayMode","piSearchNetAmt","piSearchRefNo"].forEach(id=>{
    document.getElementById(id)?.addEventListener("input", ()=>{
      if(document.getElementById("piSearchAuto")?.checked) renderPiInvoiceSearchList();
    });
  });
  document.getElementById("piSearchExtended")?.addEventListener("change", ()=>{
    if(document.getElementById("piSearchAuto")?.checked) renderPiInvoiceSearchList();
  });
  document.getElementById("piSearchBtn")?.addEventListener("click", openPurchaseSearch);
  document.getElementById("piPrintBtn")?.addEventListener("click", printPurchaseInvoice);
  document.getElementById("piPrevBtn")?.addEventListener("click", ()=> navigatePurchase(-1));
  document.getElementById("piNextBtn")?.addEventListener("click", ()=> navigatePurchase(1));
  document.getElementById("piNewProductBtn")?.addEventListener("click", openPiProductMaster);
  document.addEventListener("keydown", e=>{
    if(e.key !== "F9" || e.ctrlKey || e.altKey || e.metaKey) return;
    const modal = document.getElementById("purchaseModal");
    if(!modal?.classList.contains("open")) return;
    e.preventDefault();
    openPiProductMaster();
  });
  document.addEventListener("keydown", handlePiF8);
  document.addEventListener("keydown", handlePiF10);
  document.addEventListener("keydown", e=>{
    if(!e.altKey || (e.key !== "z" && e.key !== "Z")) return;
    const modal = document.getElementById("purchaseModal");
    if(!modal?.classList.contains("open")) return;
    e.preventDefault();
    const cb = document.getElementById("piVatOnMrp");
    if(!cb) return;
    cb.checked = !cb.checked;
    cb.dispatchEvent(new Event("change"));
  });
  ["piSelName","piSelCode","piSelMrp","piSelRate"].forEach(id=>{
    document.getElementById(id)?.addEventListener("input", renderPiSelectProductList);
  });
  document.getElementById("piSelExtended")?.addEventListener("change", renderPiSelectProductList);
  document.getElementById("piHistoryPrintBtn")?.addEventListener("click", printPiHistory);
  document.getElementById("piEntryPrice")?.addEventListener("keydown", e=>{
    if(e.key === "F8"){ e.preventDefault(); openProductPurchaseHistory(); }
  });
  document.getElementById("piStockLoc")?.addEventListener("change", updatePiStockLabel);
  document.getElementById("piCreditDays")?.addEventListener("input", ()=>{
    const days = num(document.getElementById("piCreditDays").value) || 0;
    const base = document.getElementById("piDate").value;
    if(!base || !days) return;
    const due = new Date(base + "T12:00:00");
    due.setDate(due.getDate() + days);
    document.getElementById("piDue").value = due.toISOString().slice(0, 10);
  });
  document.getElementById("piHdrDiscPct")?.addEventListener("input", ()=>{
    const el = document.getElementById("piHdrDiscAmt");
    if(el && num(document.getElementById("piHdrDiscPct").value)) el.value = 0;
    calcPurchaseInvoice();
  });
  document.getElementById("piHdrDiscAmt")?.addEventListener("input", ()=>{
    const el = document.getElementById("piHdrDiscPct");
    if(el) el.value = 0;
    calcPurchaseInvoice();
  });
  ["piAdjustments","piRoundOff"].forEach(id=>{
    document.getElementById(id)?.addEventListener("input", calcPurchaseInvoice);
  });
  document.getElementById("piEntryVat")?.addEventListener("input", updatePiEntryPreview);
  ["piEntryName","piEntryCode","piEntryQty","piEntryUnit","piEntryPrice","piEntryMrp","piEntryDisc","piEntryDiscPct"].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener("input", ()=>{
      if(id === "piEntryName") _piDefaultDiscPct = 0;
      if(id === "piEntryDiscPct"){ _piDefaultDiscPct = 0; syncPiEntryDiscFromPct(); }
      else if(id === "piEntryDisc") syncPiEntryDiscFromAmt();
      else if(id === "piEntryQty" || id === "piEntryPrice") syncPiEntryDiscFromPct();
      updatePiEntryPreview();
    });
    if(id === "piEntryName"){
      el.addEventListener("input", ()=> renderPiCatalogSuggest(el.value, "piEntryName"));
      el.addEventListener("focus", ()=> renderPiCatalogSuggest(el.value, "piEntryName"));
      el.addEventListener("blur", ()=> setTimeout(hidePiCatalogSuggest, 150));
      el.addEventListener("keydown", e=> handlePiCatalogKeydown(e, "piEntryName"));
    }
    if(id === "piEntryCode"){
      el.addEventListener("input", ()=>{
        renderPiCodeSuggest(el.value);
        const hit = findProductByExactCode(el.value);
        if(hit) applyPiProductToEntry(hit);
      });
      el.addEventListener("focus", ()=> renderPiCodeSuggest(el.value));
      el.addEventListener("blur", ()=> setTimeout(hidePiCatalogSuggest, 150));
      el.addEventListener("keydown", e=>{
        if(e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Escape"){
          handlePiCatalogKeydown(e, "piEntryCode");
          return;
        }
        if(e.key === "Enter"){
          const list = document.getElementById("piCatalogSuggest");
          const hitLi = activePiComboOption(list) || (!list?.hidden && list?.querySelector("li[data-pi-cat-id]"));
          if(hitLi){
            e.preventDefault();
            applyPiCatalogPick(hitLi.getAttribute("data-pi-cat-id"));
            return;
          }
          const hit = findProductByExactCode(el.value);
          if(hit){ e.preventDefault(); applyPiProductToEntry(hit); return; }
          e.preventDefault();
          document.getElementById("piEntryQty")?.focus();
        }
      });
    }
  });
  document.getElementById("piCatalogSuggest")?.addEventListener("mousedown", e=>{
    const li = e.target.closest("li[data-pi-cat-id]");
    if(!li) return;
    e.preventDefault();
    applyPiCatalogPick(li.getAttribute("data-pi-cat-id"));
  });
}

export function filterSuppliersForCombo(q){
  const ql = String(q || "").toLowerCase().trim();
  return suppliers.filter(s=>{
    if(!ql) return true;
    return `${s.name||""} ${s.code||""} ${s.mobile||""}`.toLowerCase().includes(ql);
  });
}

export function pickSupplierCombo(wrap, name){
  const sel = wrap?.querySelector("select");
  const input = wrap?.querySelector(".cust-combo-input");
  if(!sel) return;
  const n = String(name || "").trim();
  supplierOptions(sel, n);
  sel.value = n;
  if(input) input.value = n;
  const owner = wrap.getAttribute("data-combo") || "";
  const list = wrap.querySelector(".cust-combo-list")
    || document.querySelector(`.cust-combo-list[data-combo-owner="${owner}"]`);
  if(list) list.hidden = true;
  if(input) input.setAttribute("aria-expanded", "false");
  sel.dispatchEvent(new Event("change", { bubbles: true }));
}

export function preparePurchaseModal(){
  openNewPurchaseInvoice();
}
