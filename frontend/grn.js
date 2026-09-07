// ============================================================
// GOODS RECEIPT (GRN) — Build Order §4 Purchase
// Physical receipt → stock IN (no payable). PI can follow separately.
// ============================================================

import { getCurrentBranchId } from "./foundation.js?v=131";
import { masterCreateMeta, masterMeta } from "./masters.js?v=131";
import { applyGrnStockDelta, inventoryErrorText } from "./inventory.js?v=131";
import { findProductForLine, formatStockLocation, getSuppliers } from "./purchase.js?v=131";
import { applyGrnPoReceipt, refreshGrnPoSelect, getPoLinesForGrn, getPurchaseOrders } from "./po.js?v=131";
import { addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let goodsReceipts = [];
let _grnLineItems = [];
let _grnSaving = false;

export function initGrn(c){ ctx = c; }
export function getGoodsReceipts(){ return goodsReceipts; }

function num(v){ return ctx.num(v); }
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

function normalizeGrnLine(raw){
  const name = String(raw?.name || "").trim();
  const code = String(raw?.code || "").trim();
  const qty = Math.max(0, num(raw?.qty));
  const damagedQty = Math.max(0, num(raw?.damagedQty));
  const rate = num(raw?.rate ?? raw?.price);
  const unit = String(raw?.unit || "Pcs").trim() || "Pcs";
  const product = findProductForLine({ name, code });
  return {
    name: product?.name || name,
    code: product?.code || code,
    productId: product?.id || "",
    qty,
    damagedQty,
    rate,
    price: rate,
    unit
  };
}

function readGrnEntryDraft(){
  return {
    name: document.getElementById("grnEntryName")?.value.trim() || "",
    code: document.getElementById("grnEntryCode")?.value.trim() || "",
    qty: num(document.getElementById("grnEntryQty")?.value),
    damagedQty: num(document.getElementById("grnEntryDamaged")?.value),
    rate: num(document.getElementById("grnEntryRate")?.value),
    unit: document.getElementById("grnEntryUnit")?.value || "Pcs"
  };
}

function clearGrnEntryFields(){
  ["grnEntryName","grnEntryCode","grnEntryDamaged"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("grnEntryQty");
  const rate = document.getElementById("grnEntryRate");
  if(qty) qty.value = "1";
  if(rate) rate.value = "0";
}

function flushGrnDraftLine(){
  const draft = readGrnEntryDraft();
  if(!String(draft.name || draft.code || "").trim()) return;
  commitGrnEntryLine();
}

function commitGrnEntryLine(){
  const draft = normalizeGrnLine(readGrnEntryDraft());
  if(!draft.name && !draft.code) return toast("Enter product name or code");
  if(draft.qty <= 0 && draft.damagedQty <= 0) return toast("Enter received or damaged qty");
  _grnLineItems.push({ ...draft });
  clearGrnEntryFields();
  renderGrnItemList();
}

function renderGrnItemList(){
  const tbody = document.getElementById("grnItemRows");
  if(!tbody) return;
  if(!_grnLineItems.length){
    tbody.innerHTML = `<tr><td colspan="7" class="empty">Add product lines below</td></tr>`;
    updateGrnTotals();
    return;
  }
  tbody.innerHTML = _grnLineItems.map((it, idx)=>{
    const x = normalizeGrnLine(it);
    return `<tr>
      <td>${esc(x.name)}</td><td>${esc(x.code)}</td>
      <td>${esc(x.qty)}</td><td>${esc(x.damagedQty)}</td>
      <td>${esc(x.unit)}</td><td>${money(x.rate)}</td>
      <td><button class="btn small danger" type="button" data-rm-grn-item="${idx}">×</button></td>
    </tr>`;
  }).join("");
  tbody.querySelectorAll("[data-rm-grn-item]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      _grnLineItems.splice(Number(btn.dataset.rmGrnItem), 1);
      renderGrnItemList();
    });
  });
  updateGrnTotals();
}

function updateGrnTotals(){
  const items = _grnLineItems.map(normalizeGrnLine);
  const good = items.reduce((s,i)=> s + i.qty, 0);
  const dmg = items.reduce((s,i)=> s + i.damagedQty, 0);
  const set = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = String(v); };
  set("grnTotGood", good);
  set("grnTotDamaged", dmg);
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

export function refreshGrnSupplierSelect(){
  supplierOptions(document.getElementById("grnSupplier"), document.getElementById("grnSupplier")?.value || "");
}

export function syncGrnStockLocations(preserveValue){
  const sel = document.getElementById("grnStockLoc");
  if(!sel || !ctx.fillWarehouseSelect) return;
  ctx.fillWarehouseSelect(sel, preserveValue ?? sel.value);
  const lbl = document.getElementById("grnStockLabel");
  if(lbl) lbl.textContent = formatStockLocation(sel.value || "Main");
}

function grnStockDocRef(data){
  return data.grnNo || data.id || "";
}

async function applyGrnStockDeltaLocal(items, direction, warehouseId, docRef){
  const wh = warehouseId || "Main";
  const ref = docRef || "";
  const stockItems = (items || []).filter(l=> num(l.qty) > 0);
  if(!stockItems.length) return;
  try{
    await applyGrnStockDelta(stockItems, wh, direction, ref);
  }catch(e){
    throw new Error(inventoryErrorText(e?.message || e));
  }
}

async function applyGrnStockMoves(existing, calcItems, stockLocation, docRef){
  const nextWh = stockLocation || "Main";
  const ref = docRef || grnStockDocRef(existing || {});
  if(!existing){
    await applyGrnStockDeltaLocal(calcItems, 1, nextWh, ref);
    return;
  }
  const prevWh = existing.stockLocation || "Main";
  const prevStock = (existing.items || []).filter(l=> num(l.qty) > 0);
  await applyGrnStockDeltaLocal(prevStock, -1, prevWh, ref);
  await applyGrnStockDeltaLocal(calcItems, 1, nextWh, ref);
}

async function rollbackGrnStockMoves(existing, calcItems, stockLocation, docRef){
  const nextWh = stockLocation || "Main";
  const ref = docRef || grnStockDocRef(existing || {});
  if(!existing){
    await applyGrnStockDeltaLocal(calcItems, -1, nextWh, ref);
    return;
  }
  await applyGrnStockDeltaLocal(calcItems, -1, nextWh, ref);
  const prevStock = (existing.items || []).filter(l=> num(l.qty) > 0);
  await applyGrnStockDeltaLocal(prevStock, 1, existing.stockLocation || "Main", ref);
}

function loadGrnFromPoSelect(){
  const poId = document.getElementById("grnPoSelect")?.value || "";
  if(!poId) return toast("Select a purchase order");
  const lines = getPoLinesForGrn(poId);
  if(!lines.length) return toast("No remaining qty on this PO");
  const po = getPurchaseOrders().find(p=> p.id === poId);
  if(po?.supplier) supplierOptions(document.getElementById("grnSupplier"), po.supplier);
  _grnLineItems = lines.map(l=>({ ...l }));
  renderGrnItemList();
  toast(`Loaded ${lines.length} line(s) from PO`);
}

function openNewGrn(){
  document.getElementById("grnId").value = "";
  document.getElementById("grnNo").value = nextNo("GRN-", goodsReceipts, "grnNo");
  document.getElementById("grnDate").value = new Date().toISOString().slice(0, 10);
  refreshGrnSupplierSelect();
  refreshGrnPoSelect("");
  syncGrnStockLocations("Main");
  document.getElementById("grnNarration").value = "";
  _grnLineItems = [];
  clearGrnEntryFields();
  renderGrnItemList();
}

function editGrn(id){
  const grn = goodsReceipts.find(g=> g.id === id);
  if(!grn) return toast("GRN not found");
  document.getElementById("grnId").value = grn.id;
  document.getElementById("grnNo").value = grn.grnNo || "";
  document.getElementById("grnDate").value = grn.date || "";
  refreshGrnSupplierSelect();
  supplierOptions(document.getElementById("grnSupplier"), grn.supplier || "");
  refreshGrnPoSelect(grn.supplier || "", grn.poId || "");
  document.getElementById("grnNarration").value = grn.narration || "";
  syncGrnStockLocations(grn.stockLocation || "Main");
  _grnLineItems = Array.isArray(grn.items) ? grn.items.map(it=> ({ ...it })) : [];
  clearGrnEntryFields();
  renderGrnItemList();
  ctx.openFormModal?.("grnModal", { skipPrepare: true });
}

export function renderGoodsReceipts(){
  const tbody = document.getElementById("grnRows");
  if(!tbody) return;
  const q = (document.getElementById("grnSearch")?.value || "").toLowerCase();
  const rows = goodsReceipts.filter(g=>{
    const blob = `${g.grnNo} ${g.supplier} ${g.poRef} ${g.narration}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  tbody.innerHTML = rows.length ? rows.map(g=> `<tr>
    <td>${esc(g.grnNo)}</td><td>${esc(g.date)}</td><td>${esc(g.supplier)}</td>
    <td>${esc(g.poRef || "—")}</td><td>${esc(formatStockLocation(g.stockLocation))}</td>
    <td>${esc(g.totalQty ?? 0)}</td><td>${badge(g.status || "Posted")}</td>
    <td>${g.piNo ? esc(g.piNo) : "—"}</td>
    <td><button class="btn small" type="button" data-edit-grn="${g.id}">Open</button></td>
  </tr>`).join("") : `<tr><td colspan="9" class="empty">No goods receipts yet — post a GRN to receive stock</td></tr>`;
  tbody.querySelectorAll("[data-edit-grn]").forEach(b=> b.onclick = ()=> editGrn(b.dataset.editGrn));
}

async function saveGoodsReceipt(){
  if(!requireModule("purchase-invoices")) return;
  if(_grnSaving) return toast("Save already in progress…");
  flushGrnDraftLine();
  const items = _grnLineItems.map(normalizeGrnLine).filter(l=> l.qty > 0 || l.damagedQty > 0);
  if(!items.length) return toast("Add at least one product line");
  if(!items.some(l=> l.qty > 0)) return toast("At least one line needs received (good) qty for stock IN");
  const supplier = document.getElementById("grnSupplier")?.value || "";
  if(!supplier) return toast("Select vendor");
  const grnId = document.getElementById("grnId")?.value || "";
  const existing = grnId ? goodsReceipts.find(g=> g.id === grnId) : null;
  const stockLoc = document.getElementById("grnStockLoc")?.value || "Main";
  const stockItems = items.filter(l=> l.qty > 0);
  const poId = document.getElementById("grnPoSelect")?.value || "";
  const po = getPurchaseOrders().find(p=> p.id === poId);
  if(!grnId){
    const serial = await allocateDocSerial("grn", "GRN-", {
      list: goodsReceipts, field: "grnNo", draftValue: document.getElementById("grnNo")?.value, preferCounter: true
    });
    document.getElementById("grnNo").value = serial.value;
  }
  const data = {
    grnNo: document.getElementById("grnNo").value.trim(),
    date: document.getElementById("grnDate").value,
    supplier,
    stockLocation: stockLoc,
    poId: poId || "",
    poRef: po?.poNo || existing?.poRef || "",
    poNo: po?.poNo || "",
    narration: document.getElementById("grnNarration").value.trim(),
    items,
    totalQty: stockItems.reduce((s,l)=> s + l.qty, 0),
    totalDamaged: items.reduce((s,l)=> s + l.damagedQty, 0),
    status: "Posted",
    branchId: getCurrentBranchId() || "",
    updatedAt: Date.now(),
    updatedBy: who()
  };
  try{
    _grnSaving = true;
    const docRef = data.grnNo;
    if(grnId){
      await applyGrnStockMoves(existing, stockItems, stockLoc, docRef);
      try{
        await updateDoc(doc(db(), "goodsReceipts", grnId), { ...data, ...masterMeta() });
      }catch(docErr){
        await rollbackGrnStockMoves(existing, stockItems, stockLoc, docRef);
        throw docErr;
      }
    }else{
      await applyGrnStockMoves(null, stockItems, stockLoc, docRef);
      try{
        const ref = await addDoc(col("goodsReceipts"), { ...data, ...masterCreateMeta() });
        document.getElementById("grnId").value = ref.id;
      }catch(docErr){
        await rollbackGrnStockMoves(null, stockItems, stockLoc, docRef);
        throw docErr;
      }
    }
    if(poId && !existing) await applyGrnPoReceipt(poId, stockItems, data.grnNo);
    await logActivity({
      action: grnId ? "update" : "add",
      staffName: who(),
      module: "Goods Receipt",
      record: data.grnNo,
      summary: `${data.grnNo} · ${supplier} · ${data.totalQty} pcs IN`,
      newValue: String(data.totalQty)
    });
    leaveFormAfterSave("grnModal");
    toast("Goods receipt posted — stock updated");
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _grnSaving = false;
  }
}

function tryGrnBarcodeAdd(){
  const code = document.getElementById("grnEntryCode")?.value.trim() || "";
  if(!code) return;
  const p = products().find(x=>{
    const vals = [x.code, x.barcode, x.ean, x.shopPartNumber].map(v=> String(v||"").trim().toLowerCase());
    return vals.includes(code.toLowerCase());
  });
  if(!p) return;
  const nameEl = document.getElementById("grnEntryName");
  const rateEl = document.getElementById("grnEntryRate");
  if(nameEl) nameEl.value = p.name || "";
  if(rateEl && !num(rateEl.value)) rateEl.value = String(num(p.landingCost) || num(p.price) || 0);
}

export function onGoodsReceiptsLoaded(rows){
  goodsReceipts = rows || [];
  renderGoodsReceipts();
}

export function wireGrnUi(){
  document.getElementById("grnSearch")?.addEventListener("input", renderGoodsReceipts);
  document.getElementById("saveGrnBtn")?.addEventListener("click", saveGoodsReceipt);
  document.getElementById("addGrnItemBtn")?.addEventListener("click", commitGrnEntryLine);
  document.getElementById("grnStartFreshBtn")?.addEventListener("click", openNewGrn);
  document.getElementById("grnStockLoc")?.addEventListener("change", ()=>{
    const lbl = document.getElementById("grnStockLabel");
    const sel = document.getElementById("grnStockLoc");
    if(lbl && sel) lbl.textContent = formatStockLocation(sel.value || "Main");
  });
  document.getElementById("grnEntryCode")?.addEventListener("change", tryGrnBarcodeAdd);
  document.getElementById("grnEntryCode")?.addEventListener("blur", tryGrnBarcodeAdd);
  document.getElementById("grnSupplier")?.addEventListener("change", ()=>{
    refreshGrnPoSelect(document.getElementById("grnSupplier")?.value || "");
  });
  document.getElementById("grnLoadPoBtn")?.addEventListener("click", loadGrnFromPoSelect);
  document.getElementById("grnPoSelect")?.addEventListener("change", ()=>{
    const poId = document.getElementById("grnPoSelect")?.value || "";
    if(poId && !_grnLineItems.length) loadGrnFromPoSelect();
  });
}

export function prepareGrnModal(){
  openNewGrn();
}

/** Link posted GRN to purchase invoice (financial follow-up — no duplicate stock). */
export async function linkGrnToPurchase(grnId, piId, piNo){
  if(!grnId || !ctx.db) return;
  await updateDoc(doc(ctx.db, "goodsReceipts", grnId), {
    piId: piId || "",
    piNo: piNo || "",
    invoicedAt: Date.now(),
    ...masterMeta()
  });
}

/** Clear PI link when invoice changes GRN or is voided. */
export async function unlinkGrnFromPurchase(grnId){
  if(!grnId || !ctx.db) return;
  await updateDoc(doc(ctx.db, "goodsReceipts", grnId), {
    piId: "",
    piNo: "",
    invoicedAt: null,
    ...masterMeta()
  });
}
