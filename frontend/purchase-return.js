// ============================================================
// PURCHASE RETURN — Build Order §4 Purchase
// Return goods to vendor · stock OUT · reduces PI payable (credited)
// ============================================================

import { getCurrentBranchId } from "./foundation.js?v=131";
import { masterCreateMeta, masterMeta } from "./masters.js?v=131";
import {
  applyPurchaseReturnStockDelta, validateStockForLines, inventoryErrorText
} from "./inventory.js?v=131";
import {
  findProductForLine, formatStockLocation, getSuppliers, getPurchaseInvoices
} from "./purchase.js?v=131";
import { piCreditedPatch, piPayableBalance } from "./vendor-payment.js?v=131";
import { updateDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let purchaseReturns = [];
let _prtLineItems = [];
let _prtSaving = false;

export function initPurchaseReturn(c){ ctx = c; }
export function getPurchaseReturns(){ return purchaseReturns; }

function num(v){ return ctx.num(v); }
function roundMoney(n){ return ctx.roundMoney(n); }
function esc(v){ return ctx.esc(v); }
function money(v){ return ctx.money(v); }
function badge(v){ return ctx.badge(v); }
function who(){ return ctx.who(); }
function toast(m){ return ctx.toast(m); }
function col(name){ return ctx.col(name); }
function db(){ return ctx.db; }
function requireModule(m){ return ctx.requireModule(m); }
function logActivity(a){ return ctx.logActivity(a); }
function friendlyFirestoreError(e){ return ctx.friendlyFirestoreError(e); }
function closeModal(id){ return ctx.closeModal(id); }
function leaveFormAfterSave(id){ return ctx.leaveFormAfterSave ? ctx.leaveFormAfterSave(id) : closeModal(id); }
function nextNo(prefix, list, field){ return ctx.nextNo(prefix, list, field); }
async function allocateDocSerial(docKey, prefix, opts){ return ctx.allocateDocSerial(docKey, prefix, opts); }
function today(){ return new Date().toISOString().slice(0, 10); }
function shopDefaultVat(){ return ctx.shopDefaultVat?.() ?? 5; }

function normalizePrtLine(raw){
  const name = String(raw?.name || "").trim();
  const code = String(raw?.code || "").trim();
  const qty = Math.max(0, num(raw?.qty));
  const rate = num(raw?.rate ?? raw?.price);
  const vatPct = num(raw?.vatPct ?? shopDefaultVat());
  const unit = String(raw?.unit || "Pcs").trim() || "Pcs";
  const product = findProductForLine({ name, code });
  const amount = roundMoney(qty * rate);
  const vatAmt = roundMoney(amount * vatPct / 100);
  const lineTotal = roundMoney(amount + vatAmt);
  return {
    name: product?.name || name,
    code: product?.code || code,
    productId: product?.id || raw?.productId || "",
    qty, rate, price: rate, unit, vatPct, amount, vatAmt, lineTotal
  };
}

function readPrtEntryDraft(){
  return {
    name: document.getElementById("prtEntryName")?.value.trim() || "",
    code: document.getElementById("prtEntryCode")?.value.trim() || "",
    qty: num(document.getElementById("prtEntryQty")?.value),
    rate: num(document.getElementById("prtEntryRate")?.value),
    vatPct: num(document.getElementById("prtEntryVat")?.value ?? shopDefaultVat()),
    unit: document.getElementById("prtEntryUnit")?.value || "Pcs"
  };
}

function clearPrtEntryFields(){
  ["prtEntryName","prtEntryCode"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("prtEntryQty");
  const rate = document.getElementById("prtEntryRate");
  if(qty) qty.value = "1";
  if(rate) rate.value = "0";
}

function flushPrtDraftLine(){
  const draft = readPrtEntryDraft();
  if(!String(draft.name || draft.code || "").trim()) return;
  commitPrtEntryLine();
}

function commitPrtEntryLine(){
  const draft = normalizePrtLine(readPrtEntryDraft());
  if(!draft.name && !draft.code) return toast("Enter product name or code");
  if(draft.qty <= 0) return toast("Enter return quantity");
  _prtLineItems.push({ ...draft });
  clearPrtEntryFields();
  renderPrtItemList();
}

function calcPrtTotals(items){
  const sub = items.reduce((s,i)=> s + i.amount, 0);
  const vat = items.reduce((s,i)=> s + i.vatAmt, 0);
  const total = items.reduce((s,i)=> s + i.lineTotal, 0);
  const qty = items.reduce((s,i)=> s + i.qty, 0);
  return { sub, vat, total, qty };
}

function renderPrtItemList(){
  const tbody = document.getElementById("prtItemRows");
  if(!tbody) return;
  const items = _prtLineItems.map(normalizePrtLine);
  const totals = calcPrtTotals(items);
  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="7" class="empty">Add return lines below</td></tr>`;
  }else{
    tbody.innerHTML = items.map((x, idx)=> `<tr>
      <td>${esc(x.name)}</td><td>${esc(x.code)}</td><td>${esc(x.qty)}</td>
      <td>${esc(x.unit)}</td><td>${money(x.rate)}</td><td>${money(x.lineTotal)}</td>
      <td><button class="btn small danger" type="button" data-rm-prt-item="${idx}">×</button></td>
    </tr>`).join("");
    tbody.querySelectorAll("[data-rm-prt-item]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        _prtLineItems.splice(Number(btn.dataset.rmPrtItem), 1);
        renderPrtItemList();
      });
    });
  }
  const set = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = money(v); };
  const setN = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = String(v); };
  setN("prtTotQty", totals.qty);
  set("prtTotSub", totals.sub);
  set("prtTotVat", totals.vat);
  set("prtTotGrand", totals.total);
}

function supplierOptions(selectEl, selected){
  if(!selectEl) return;
  const sel = selected || "";
  const suppliers = getSuppliers();
  selectEl.innerHTML = `<option value="">Select…</option>` + suppliers.map(s=>
    `<option value="${esc(s.name)}"${s.name === sel ? " selected" : ""}>${esc(s.name)}</option>`
  ).join("");
  if(sel) selectEl.value = sel;
}

export function refreshPrtSupplierSelect(){
  supplierOptions(document.getElementById("prtSupplier"), document.getElementById("prtSupplier")?.value || "");
}

export function syncPrtStockLocations(preserveValue){
  const sel = document.getElementById("prtStockLoc");
  if(!sel || !ctx.fillWarehouseSelect) return;
  ctx.fillWarehouseSelect(sel, preserveValue ?? sel.value);
  const lbl = document.getElementById("prtStockLabel");
  if(lbl) lbl.textContent = formatStockLocation(sel.value || "Main");
}

export function refreshPrtPiSelect(supplier, selectedId){
  const sel = document.getElementById("prtPiSelect");
  if(!sel) return;
  const sup = String(supplier ?? document.getElementById("prtSupplier")?.value ?? "").trim().toLowerCase();
  const cur = selectedId ?? sel.value ?? "";
  const rows = getPurchaseInvoices().filter(pi=>{
    const st = String(pi.status || "Posted").toLowerCase();
    if(st === "draft" || st === "cancelled") return false;
    if(sup && String(pi.supplier || "").trim().toLowerCase() !== sup) return false;
    return true;
  }).sort((a,b)=> String(b.invDate||"").localeCompare(String(a.invDate||"")));
  sel.innerHTML = `<option value="">— No PI link —</option>` + rows.map(pi=>
    `<option value="${esc(pi.id)}"${pi.id === cur ? " selected" : ""}>${esc(pi.piNo)} · ${money(pi.total)} · bal ${money(piPayableBalance(pi))}</option>`
  ).join("");
  if(cur && [...sel.options].some(o=> o.value === cur)) sel.value = cur;
}

function loadPrtFromPi(){
  const piId = document.getElementById("prtPiSelect")?.value || "";
  if(!piId) return toast("Select a purchase invoice");
  const pi = getPurchaseInvoices().find(p=> p.id === piId);
  if(!pi) return toast("PI not found");
  supplierOptions(document.getElementById("prtSupplier"), pi.supplier || "");
  syncPrtStockLocations(pi.stockLocation || "Main");
  _prtLineItems = (pi.items || []).map(line=> normalizePrtLine({
    name: line.name, code: line.code, productId: line.productId,
    qty: line.qty, rate: line.price || line.rate, vatPct: line.vat, unit: line.unit
  })).filter(l=> l.qty > 0);
  renderPrtItemList();
  toast(`Loaded ${ _prtLineItems.length } line(s) from ${pi.piNo}`);
}

async function applyPrtStockLocal(items, direction, warehouseId, docRef){
  const wh = warehouseId || "Main";
  try{
    await validateStockForLines(items, wh, direction);
    await applyPurchaseReturnStockDelta(items, wh, direction, docRef);
  }catch(e){
    throw new Error(inventoryErrorText(e?.message || e));
  }
}

async function applyPrtToPi(piId, creditedDelta, batch){
  if(!piId || !creditedDelta) return;
  const pi = getPurchaseInvoices().find(p=> p.id === piId);
  if(!pi) return;
  const patch = piCreditedPatch(pi, creditedDelta);
  batch.update(doc(db(), "purchaseInvoices", piId), patch);
  Object.assign(pi, patch);
}

function openNewPurchaseReturn(){
  document.getElementById("prtId").value = "";
  document.getElementById("prtNo").value = nextNo("PRT-", purchaseReturns, "prtNo");
  document.getElementById("prtDate").value = today();
  document.getElementById("prtReason").value = "";
  refreshPrtSupplierSelect();
  refreshPrtPiSelect("");
  syncPrtStockLocations("Main");
  _prtLineItems = [];
  clearPrtEntryFields();
  const vatEl = document.getElementById("prtEntryVat");
  if(vatEl) vatEl.value = String(shopDefaultVat());
  renderPrtItemList();
}

function editPurchaseReturn(id){
  const prt = purchaseReturns.find(r=> r.id === id);
  if(!prt) return toast("Return not found");
  if(String(prt.status||"").toLowerCase() === "voided") return toast("Voided return — cannot edit");
  document.getElementById("prtId").value = prt.id;
  document.getElementById("prtNo").value = prt.prtNo || "";
  document.getElementById("prtDate").value = prt.date || "";
  document.getElementById("prtReason").value = prt.reason || "";
  refreshPrtSupplierSelect();
  supplierOptions(document.getElementById("prtSupplier"), prt.supplier || "");
  refreshPrtPiSelect(prt.supplier || "", prt.piId || "");
  syncPrtStockLocations(prt.stockLocation || "Main");
  _prtLineItems = Array.isArray(prt.items) ? prt.items.map(it=> ({ ...it })) : [];
  clearPrtEntryFields();
  renderPrtItemList();
  ctx.openFormModal?.("purchaseReturnModal", { skipPrepare: true });
}

export function renderPurchaseReturns(){
  const tbody = document.getElementById("prtRows");
  if(!tbody) return;
  const q = (document.getElementById("prtSearch")?.value || "").toLowerCase();
  const rows = purchaseReturns.filter(r=>{
    const blob = `${r.prtNo} ${r.supplier} ${r.piNo} ${r.reason}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  tbody.innerHTML = rows.length ? rows.map(r=> `<tr>
    <td>${esc(r.prtNo)}</td><td>${esc(r.date)}</td><td>${esc(r.supplier)}</td>
    <td>${esc(r.piNo || "—")}</td><td>${money(r.total)}</td>
    <td>${badge(r.status || "Posted")}</td>
    <td>
      <button class="btn small" type="button" data-edit-prt="${r.id}">Open</button>
      ${String(r.status||"").toLowerCase() !== "voided" ? `<button class="btn small danger" type="button" data-void-prt="${r.id}">Void</button>` : ""}
    </td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">No purchase returns yet</td></tr>`;
  tbody.querySelectorAll("[data-edit-prt]").forEach(b=> b.onclick = ()=> editPurchaseReturn(b.dataset.editPrt));
  tbody.querySelectorAll("[data-void-prt]").forEach(b=> b.onclick = ()=> voidPurchaseReturn(b.dataset.voidPrt));
}

async function savePurchaseReturn(){
  if(!requireModule("purchase-invoices")) return;
  if(_prtSaving) return toast("Save already in progress…");
  flushPrtDraftLine();
  const items = _prtLineItems.map(normalizePrtLine).filter(l=> l.qty > 0);
  if(!items.length) return toast("Add at least one return line");
  const supplier = document.getElementById("prtSupplier")?.value || "";
  if(!supplier) return toast("Select vendor");
  const prtId = document.getElementById("prtId")?.value || "";
  const existing = prtId ? purchaseReturns.find(r=> r.id === prtId) : null;
  const stockLoc = document.getElementById("prtStockLoc")?.value || "Main";
  const piId = document.getElementById("prtPiSelect")?.value || "";
  const pi = piId ? getPurchaseInvoices().find(p=> p.id === piId) : null;
  const totals = calcPrtTotals(items);
  if(piId && totals.total > piPayableBalance(pi) + (existing?.piId === piId ? num(existing.total) : 0) + 0.01){
    return toast("Return total exceeds PI payable balance");
  }
  if(!prtId){
    const serial = await allocateDocSerial("purchase_return", "PRT-", {
      list: purchaseReturns, field: "prtNo", draftValue: document.getElementById("prtNo")?.value, preferCounter: true
    });
    document.getElementById("prtNo").value = serial.value;
  }
  const data = {
    prtNo: document.getElementById("prtNo").value.trim(),
    date: document.getElementById("prtDate").value || today(),
    supplier,
    stockLocation: stockLoc,
    piId: piId || "",
    piNo: pi?.piNo || existing?.piNo || "",
    reason: document.getElementById("prtReason")?.value.trim() || "",
    items,
    subtotal: totals.sub,
    vat: totals.vat,
    total: totals.total,
    status: "Posted",
    branchId: getCurrentBranchId() || "",
    updatedAt: Date.now(),
    updatedBy: who()
  };
  const docRef = data.prtNo;
  try{
    _prtSaving = true;
    if(existing){
      await applyPrtStockLocal(existing.items, 1, existing.stockLocation || stockLoc, docRef);
      const batch0 = writeBatch(db());
      await applyPrtToPi(existing.piId, -num(existing.total), batch0);
      await batch0.commit();
      await applyPrtStockLocal(items, -1, stockLoc, docRef);
      const batch = writeBatch(db());
      batch.update(doc(db(), "purchaseReturns", existing.id), { ...data, ...masterMeta() });
      await applyPrtToPi(piId, totals.total, batch);
      await batch.commit();
    }else{
      await applyPrtStockLocal(items, -1, stockLoc, docRef);
      const ref = doc(col("purchaseReturns"));
      const batch = writeBatch(db());
      batch.set(ref, { ...data, ...masterCreateMeta() });
      await applyPrtToPi(piId, totals.total, batch);
      await batch.commit();
      document.getElementById("prtId").value = ref.id;
    }
    await logActivity({
      action: existing ? "update" : "add",
      staffName: who(), module: "Purchase Return",
      record: data.prtNo,
      summary: `${data.prtNo} · ${supplier} · ${money(totals.total)}`,
      newValue: money(totals.total)
    });
    leaveFormAfterSave("purchaseReturnModal");
    toast("Purchase return posted — stock OUT");
    ctx.renderPurchaseInvoices?.();
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _prtSaving = false;
  }
}

async function voidPurchaseReturn(id){
  if(!requireModule("purchase-invoices")) return;
  const prt = purchaseReturns.find(r=> r.id === id);
  if(!prt || String(prt.status||"").toLowerCase() === "voided") return;
  if(!confirm(`Void return ${prt.prtNo}? Stock will be restored and PI credit reversed.`)) return;
  try{
    await applyPrtStockLocal(prt.items, 1, prt.stockLocation || "Main", prt.prtNo);
    const batch = writeBatch(db());
    await applyPrtToPi(prt.piId, -num(prt.total), batch);
    batch.update(doc(db(), "purchaseReturns", prt.id), {
      status: "Voided", updatedAt: Date.now(), updatedBy: who(), ...masterMeta()
    });
    await batch.commit();
    Object.assign(prt, { status: "Voided" });
    await logActivity({
      action: "void", staffName: who(), module: "Purchase Return",
      record: prt.prtNo, summary: `Voided · ${prt.supplier}`
    });
    toast("Purchase return voided");
    renderPurchaseReturns();
    ctx.renderPurchaseInvoices?.();
  }catch(e){
    toast(friendlyFirestoreError(e));
  }
}

export function onPurchaseReturnsLoaded(rows){
  purchaseReturns = rows || [];
  renderPurchaseReturns();
  refreshPrtPiSelect(document.getElementById("prtSupplier")?.value || "");
}

export function wirePurchaseReturnUi(){
  document.getElementById("prtSearch")?.addEventListener("input", renderPurchaseReturns);
  document.getElementById("savePurchaseReturnBtn")?.addEventListener("click", savePurchaseReturn);
  document.getElementById("addPrtItemBtn")?.addEventListener("click", commitPrtEntryLine);
  document.getElementById("prtStartFreshBtn")?.addEventListener("click", openNewPurchaseReturn);
  document.getElementById("prtLoadPiBtn")?.addEventListener("click", loadPrtFromPi);
  document.getElementById("prtSupplier")?.addEventListener("change", ()=>{
    refreshPrtPiSelect(document.getElementById("prtSupplier")?.value || "");
  });
  document.getElementById("prtStockLoc")?.addEventListener("change", ()=>{
    const lbl = document.getElementById("prtStockLabel");
    const sel = document.getElementById("prtStockLoc");
    if(lbl && sel) lbl.textContent = formatStockLocation(sel.value || "Main");
  });
}

export function preparePurchaseReturnModal(){
  openNewPurchaseReturn();
}
