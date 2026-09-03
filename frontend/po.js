// ============================================================
// PURCHASE ORDER (PO) — Build Order §4 Purchase
// Vendor commitment — no stock until GRN. Flow: PO → GRN → PI
// ============================================================

import { getCurrentBranchId } from "./foundation.js?v=131";
import { masterCreateMeta, masterMeta } from "./masters.js?v=131";
import { findProductForLine, getSuppliers } from "./purchase.js?v=131";
import { applyPrqPoConversion, getPrLinesForPo, refreshPoPrqSelect, getPurchaseRequisitions } from "./purchase-requisition.js?v=131";
import { addDoc, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let purchaseOrders = [];
let _poLineItems = [];
let _poSaving = false;

export function initPo(c){ ctx = c; }
export function getPurchaseOrders(){ return purchaseOrders; }

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
function products(){ return ctx.getProducts() || []; }
function shopDefaultVat(){ return ctx.shopDefaultVat?.() ?? 5; }

function lineKey(line){
  const pid = String(line?.productId || "").trim();
  if(pid) return `id:${pid}`;
  const code = String(line?.code || "").trim().toLowerCase();
  const name = String(line?.name || "").trim().toLowerCase();
  return `c:${code}|n:${name}`;
}

function normalizePoLine(raw){
  const name = String(raw?.name || "").trim();
  const code = String(raw?.code || "").trim();
  const qty = Math.max(0, num(raw?.qty));
  const receivedQty = Math.max(0, num(raw?.receivedQty));
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
    qty,
    receivedQty,
    rate,
    price: rate,
    unit,
    vatPct,
    amount,
    vatAmt,
    lineTotal
  };
}

function readPoEntryDraft(){
  return {
    name: document.getElementById("poEntryName")?.value.trim() || "",
    code: document.getElementById("poEntryCode")?.value.trim() || "",
    qty: num(document.getElementById("poEntryQty")?.value),
    rate: num(document.getElementById("poEntryRate")?.value),
    vatPct: num(document.getElementById("poEntryVat")?.value ?? shopDefaultVat()),
    unit: document.getElementById("poEntryUnit")?.value || "Pcs"
  };
}

function clearPoEntryFields(){
  ["poEntryName","poEntryCode"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("poEntryQty");
  const rate = document.getElementById("poEntryRate");
  if(qty) qty.value = "1";
  if(rate) rate.value = "0";
}

function flushPoDraftLine(){
  const draft = readPoEntryDraft();
  if(!String(draft.name || draft.code || "").trim()) return;
  commitPoEntryLine();
}

function commitPoEntryLine(){
  const draft = normalizePoLine(readPoEntryDraft());
  if(!draft.name && !draft.code) return toast("Enter product name or code");
  if(draft.qty <= 0) return toast("Enter quantity");
  _poLineItems.push({ ...draft });
  clearPoEntryFields();
  renderPoItemList();
}

function calcPoTotals(items){
  const sub = items.reduce((s,i)=> s + i.amount, 0);
  const vat = items.reduce((s,i)=> s + i.vatAmt, 0);
  const total = items.reduce((s,i)=> s + i.lineTotal, 0);
  const qty = items.reduce((s,i)=> s + i.qty, 0);
  return { sub, vat, total, qty };
}

function renderPoItemList(){
  const tbody = document.getElementById("poItemRows");
  if(!tbody) return;
  const items = _poLineItems.map(normalizePoLine);
  const totals = calcPoTotals(items);
  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="8" class="empty">Add product lines below</td></tr>`;
  }else{
    tbody.innerHTML = items.map((x, idx)=> `<tr>
      <td>${esc(x.name)}</td><td>${esc(x.code)}</td>
      <td>${esc(x.qty)}</td><td>${esc(x.receivedQty || 0)}</td>
      <td>${esc(x.unit)}</td><td>${money(x.rate)}</td>
      <td>${money(x.lineTotal)}</td>
      <td><button class="btn small danger" type="button" data-rm-po-item="${idx}">×</button></td>
    </tr>`).join("");
    tbody.querySelectorAll("[data-rm-po-item]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        _poLineItems.splice(Number(btn.dataset.rmPoItem), 1);
        renderPoItemList();
      });
    });
  }
  const set = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = money(v); };
  const setN = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = String(v); };
  setN("poTotQty", totals.qty);
  set("poTotSub", totals.sub);
  set("poTotVat", totals.vat);
  set("poTotGrand", totals.total);
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

export function refreshPoSupplierSelect(){
  supplierOptions(document.getElementById("poSupplier"), document.getElementById("poSupplier")?.value || "");
}

export function refreshGrnPoSelect(supplier, selectedId){
  const sel = document.getElementById("grnPoSelect");
  if(!sel) return;
  const sup = String(supplier ?? document.getElementById("grnSupplier")?.value ?? "").trim().toLowerCase();
  const cur = selectedId ?? sel.value ?? "";
  const rows = purchaseOrders.filter(po=>{
    const st = String(po.status || "").toLowerCase();
    if(st === "draft" || st === "cancelled") return false;
    if(sup && String(po.supplier || "").trim().toLowerCase() !== sup) return false;
    const items = po.items || [];
    const open = items.some(l=> num(l.qty) - num(l.receivedQty) > 0.0001);
    return open || !items.length || st === "approved" || st === "partial";
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  sel.innerHTML = `<option value="">— No PO —</option>` + rows.map(po=>
    `<option value="${esc(po.id)}"${po.id === cur ? " selected" : ""}>${esc(po.poNo)} · ${esc(po.date)} · ${esc(po.status || "Approved")}</option>`
  ).join("");
  if(cur && [...sel.options].some(o=> o.value === cur)) sel.value = cur;
}

function poReceiptStatus(items){
  const lines = (items || []).map(normalizePoLine);
  if(!lines.length) return "Approved";
  const all = lines.every(l=> num(l.receivedQty) >= num(l.qty) - 0.0001);
  const any = lines.some(l=> num(l.receivedQty) > 0.0001);
  if(all) return "Received";
  if(any) return "Partial";
  return "Approved";
}

export async function applyGrnPoReceipt(poId, grnItems, grnNo){
  if(!poId || !db()) return;
  const local = purchaseOrders.find(p=> p.id === poId);
  const snap = local ? null : await getDoc(doc(db(), "purchaseOrders", poId));
  const po = local || (snap?.exists() ? { id: poId, ...snap.data() } : null);
  if(!po) return;

  const items = (po.items || []).map(line=>{
    const key = lineKey(line);
    let add = 0;
    for(const g of grnItems || []){
      if(lineKey(g) === key) add += num(g.qty);
    }
    if(!add) return { ...line };
    return { ...line, receivedQty: roundMoney(num(line.receivedQty) + add) };
  });
  const status = poReceiptStatus(items);
  await updateDoc(doc(db(), "purchaseOrders", poId), {
    items,
    status,
    lastGrnNo: grnNo || "",
    updatedAt: Date.now(),
    updatedBy: who(),
    ...masterMeta()
  });
}

function poPrqNo(prqId){
  const prq = getPurchaseRequisitions().find(p=> p.id === prqId);
  return prq?.prqNo || "";
}

function loadPoLinesFromPrq(){
  const prqId = document.getElementById("poPrqSelect")?.value || "";
  if(!prqId) return toast("Select a purchase requisition");
  const lines = getPrLinesForPo(prqId);
  if(!lines.length) return toast("No open lines on this requisition");
  _poLineItems = lines.map(l=> ({ ...l }));
  renderPoItemList();
  toast(`Loaded ${lines.length} line(s) from requisition`);
}

export function preparePoFromPrq(prqId){
  openNewPo();
  refreshPoPrqSelect(prqId || "");
  const sel = document.getElementById("poPrqSelect");
  if(sel && prqId) sel.value = prqId;
  loadPoLinesFromPrq();
  ctx.openFormModal?.("poModal", { skipPrepare: true });
}

function openNewPo(){
  document.getElementById("poId").value = "";
  document.getElementById("poNo").value = nextNo("PO-", purchaseOrders, "poNo");
  document.getElementById("poDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("poDeliveryDate").value = "";
  document.getElementById("poTerms").value = "";
  document.getElementById("poNarration").value = "";
  refreshPoSupplierSelect();
  refreshPoPrqSelect("");
  _poLineItems = [];
  clearPoEntryFields();
  const vatEl = document.getElementById("poEntryVat");
  if(vatEl) vatEl.value = String(shopDefaultVat());
  renderPoItemList();
}

function editPo(id){
  const po = purchaseOrders.find(p=> p.id === id);
  if(!po) return toast("PO not found");
  document.getElementById("poId").value = po.id;
  document.getElementById("poNo").value = po.poNo || "";
  document.getElementById("poDate").value = po.date || "";
  document.getElementById("poDeliveryDate").value = po.deliveryDate || "";
  document.getElementById("poTerms").value = po.terms || "";
  document.getElementById("poNarration").value = po.narration || "";
  refreshPoSupplierSelect();
  supplierOptions(document.getElementById("poSupplier"), po.supplier || "");
  refreshPoPrqSelect(po.prqId || "");
  const prqSel = document.getElementById("poPrqSelect");
  if(prqSel && po.prqId) prqSel.value = po.prqId;
  _poLineItems = Array.isArray(po.items) ? po.items.map(it=> ({ ...it })) : [];
  clearPoEntryFields();
  renderPoItemList();
  ctx.openFormModal?.("poModal", { skipPrepare: true });
}

export function renderPurchaseOrders(){
  const tbody = document.getElementById("poRows");
  if(!tbody) return;
  const q = (document.getElementById("poSearch")?.value || "").toLowerCase();
  const rows = purchaseOrders.filter(po=>{
    const blob = `${po.poNo} ${po.supplier} ${po.status} ${po.narration}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  tbody.innerHTML = rows.length ? rows.map(po=> `<tr>
    <td>${esc(po.poNo)}</td><td>${esc(po.date)}</td><td>${esc(po.supplier)}</td>
    <td>${esc(po.deliveryDate || "—")}</td><td>${money(po.total)}</td>
    <td>${badge(po.status || "Draft")}</td>
    <td><button class="btn small" type="button" data-edit-po="${po.id}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="7" class="empty">No purchase orders yet</td></tr>`;
  tbody.querySelectorAll("[data-edit-po]").forEach(b=> b.onclick = ()=> editPo(b.dataset.editPo));
}

async function savePurchaseOrder(status){
  if(!requireModule("purchase-invoices")) return;
  if(_poSaving) return toast("Save already in progress…");
  flushPoDraftLine();
  const items = _poLineItems.map(normalizePoLine).filter(l=> l.qty > 0);
  if(!items.length) return toast("Add at least one product line");
  const supplier = document.getElementById("poSupplier")?.value || "";
  if(!supplier) return toast("Select vendor");
  const poId = document.getElementById("poId")?.value || "";
  const existing = poId ? purchaseOrders.find(p=> p.id === poId) : null;
  if(existing && ["partial","received"].includes(String(existing.status||"").toLowerCase()) && status === "Draft"){
    return toast("Cannot revert to draft — GRN already received against this PO");
  }
  const prqId = document.getElementById("poPrqSelect")?.value || "";
  const totals = calcPoTotals(items);
  const mergedItems = items.map(l=>{
    const prev = (existing?.items || []).find(x=> lineKey(x) === lineKey(l));
    return { ...l, receivedQty: num(prev?.receivedQty) };
  });
  let finalStatus = status === "Draft" ? "Draft" : "Approved";
  if(status !== "Draft"){
    const recv = poReceiptStatus(mergedItems);
    if(recv !== "Approved") finalStatus = recv;
  }
  if(!poId){
    const serial = await allocateDocSerial("purchase_order", "PO-", {
      list: purchaseOrders, field: "poNo", draftValue: document.getElementById("poNo")?.value, preferCounter: true
    });
    document.getElementById("poNo").value = serial.value;
  }
  const data = {
    poNo: document.getElementById("poNo").value.trim(),
    date: document.getElementById("poDate").value,
    deliveryDate: document.getElementById("poDeliveryDate").value,
    supplier,
    terms: document.getElementById("poTerms").value.trim(),
    narration: document.getElementById("poNarration").value.trim(),
    items: mergedItems,
    subtotal: totals.sub,
    vat: totals.vat,
    total: totals.total,
    status: finalStatus,
    prqId,
    prqNo: prqId ? poPrqNo(prqId) : "",
    branchId: getCurrentBranchId() || "",
    updatedAt: Date.now(),
    updatedBy: who()
  };

  try{
    _poSaving = true;
    let savedId = poId;
    if(poId){
      await updateDoc(doc(db(), "purchaseOrders", poId), { ...data, ...masterMeta() });
    }else{
      const ref = await addDoc(col("purchaseOrders"), { ...data, ...masterCreateMeta() });
      savedId = ref.id;
      document.getElementById("poId").value = ref.id;
    }
    if(prqId && finalStatus !== "Draft"){
      await applyPrqPoConversion(prqId, savedId, data.poNo);
    }
    await logActivity({
      action: status === "Draft" ? "draft" : "add",
      staffName: who(),
      module: "Purchase Order",
      record: data.poNo,
      summary: `${data.status} · ${supplier} · ${money(data.total)}`,
      newValue: money(data.total)
    });
    leaveFormAfterSave("poModal");
    toast(status === "Draft" ? "PO draft saved" : "Purchase order approved");
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _poSaving = false;
  }
}

function tryPoBarcodeAdd(){
  const code = document.getElementById("poEntryCode")?.value.trim() || "";
  if(!code) return;
  const p = products().find(x=>{
    const vals = [x.code, x.barcode, x.ean, x.shopPartNumber].map(v=> String(v||"").trim().toLowerCase());
    return vals.includes(code.toLowerCase());
  });
  if(!p) return;
  const nameEl = document.getElementById("poEntryName");
  const rateEl = document.getElementById("poEntryRate");
  if(nameEl) nameEl.value = p.name || "";
  if(rateEl && !num(rateEl.value)) rateEl.value = String(num(p.landingCost) || num(p.price) || 0);
}

export function onPurchaseOrdersLoaded(rows){
  purchaseOrders = rows || [];
  renderPurchaseOrders();
  refreshGrnPoSelect(document.getElementById("grnSupplier")?.value || "");
}

export function getPoLinesForGrn(poId){
  const po = purchaseOrders.find(p=> p.id === poId);
  if(!po) return [];
  return (po.items || []).map(line=>{
    const remain = Math.max(0, roundMoney(num(line.qty) - num(line.receivedQty)));
    return {
      name: line.name, code: line.code, productId: line.productId,
      qty: remain, damagedQty: 0, rate: line.rate, price: line.rate, unit: line.unit || "Pcs"
    };
  }).filter(l=> l.qty > 0);
}

export function wirePoUi(){
  document.getElementById("poSearch")?.addEventListener("input", renderPurchaseOrders);
  document.getElementById("savePoDraftBtn")?.addEventListener("click", ()=> savePurchaseOrder("Draft"));
  document.getElementById("savePoApproveBtn")?.addEventListener("click", ()=> savePurchaseOrder("Approved"));
  document.getElementById("addPoItemBtn")?.addEventListener("click", commitPoEntryLine);
  document.getElementById("poStartFreshBtn")?.addEventListener("click", openNewPo);
  document.getElementById("poEntryCode")?.addEventListener("change", tryPoBarcodeAdd);
  document.getElementById("poEntryCode")?.addEventListener("blur", tryPoBarcodeAdd);
  document.getElementById("poLoadPrqBtn")?.addEventListener("click", loadPoLinesFromPrq);
}

export function preparePoModal(){
  openNewPo();
}
