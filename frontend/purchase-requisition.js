// ============================================================
// PURCHASE REQUISITION (PRQ) — Build Order §4 Purchase
// Internal request: requester, branch, product, qty, reason, approval
// Flow: PRQ → (Supplier Quote) → PO → GRN → PI
// No stock effect until GRN.
// ============================================================

import { getCurrentBranchId, getBranches } from "./foundation.js?v=131";
import { masterCreateMeta, masterMeta } from "./masters.js?v=131";
import { findProductForLine } from "./purchase.js?v=131";
import { addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let purchaseRequisitions = [];
let _prqLineItems = [];
let _prqSaving = false;

export function initPurchaseRequisition(c){ ctx = c; }
export function getPurchaseRequisitions(){ return purchaseRequisitions; }

function num(v){ return ctx.num(v); }
function esc(v){ return ctx.esc(v); }
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

function branchLabel(branchId){
  const b = getBranches().find(x=> x.id === branchId);
  return b ? `${b.code} — ${b.name}` : String(branchId || "—");
}

function normalizePrqLine(raw){
  const name = String(raw?.name || "").trim();
  const code = String(raw?.code || "").trim();
  const qty = Math.max(0, num(raw?.qty));
  const unit = String(raw?.unit || "Pcs").trim() || "Pcs";
  const reason = String(raw?.reason || "").trim();
  const product = findProductForLine({ name, code });
  return {
    name: product?.name || name,
    code: product?.code || code,
    productId: product?.id || raw?.productId || "",
    qty,
    unit,
    reason
  };
}

function readPrqEntryDraft(){
  return {
    name: document.getElementById("prqEntryName")?.value.trim() || "",
    code: document.getElementById("prqEntryCode")?.value.trim() || "",
    qty: num(document.getElementById("prqEntryQty")?.value),
    unit: document.getElementById("prqEntryUnit")?.value || "Pcs",
    reason: document.getElementById("prqEntryReason")?.value.trim() || ""
  };
}

function clearPrqEntryFields(){
  ["prqEntryName","prqEntryCode","prqEntryReason"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("prqEntryQty");
  if(qty) qty.value = "1";
}

function flushPrqDraftLine(){
  const draft = readPrqEntryDraft();
  if(!String(draft.name || draft.code || "").trim()) return;
  commitPrqEntryLine();
}

function commitPrqEntryLine(){
  const draft = normalizePrqLine(readPrqEntryDraft());
  if(!draft.name && !draft.code) return toast("Enter product name or code");
  if(draft.qty <= 0) return toast("Enter quantity");
  _prqLineItems.push({ ...draft });
  clearPrqEntryFields();
  renderPrqItemList();
}

function calcPrqTotals(items){
  const qty = items.reduce((s,i)=> s + i.qty, 0);
  return { qty, lines: items.length };
}

function renderPrqItemList(){
  const tbody = document.getElementById("prqItemRows");
  if(!tbody) return;
  const items = _prqLineItems.map(normalizePrqLine);
  const totals = calcPrqTotals(items);
  if(!items.length){
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Add product lines below</td></tr>`;
  }else{
    tbody.innerHTML = items.map((x, idx)=> `<tr>
      <td>${esc(x.name)}</td><td>${esc(x.code)}</td>
      <td>${esc(x.qty)}</td><td>${esc(x.unit)}</td>
      <td>${esc(x.reason || "—")}</td>
      <td><button class="btn small danger" type="button" data-rm-prq-item="${idx}">×</button></td>
    </tr>`).join("");
    tbody.querySelectorAll("[data-rm-prq-item]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        _prqLineItems.splice(Number(btn.dataset.rmPrqItem), 1);
        renderPrqItemList();
      });
    });
  }
  const setN = (id, v)=>{ const el = document.getElementById(id); if(el) el.textContent = String(v); };
  setN("prqTotQty", totals.qty);
  setN("prqTotLines", totals.lines);
}

function fillPrqBranchSelect(selected){
  const sel = document.getElementById("prqBranch");
  if(!sel) return;
  const branches = getBranches().filter(b=> b.status !== "inactive");
  const cur = selected || getCurrentBranchId() || "";
  sel.innerHTML = branches.length
    ? branches.map(b=> `<option value="${esc(b.id)}">${esc(b.code)} — ${esc(b.name)}</option>`).join("")
    : `<option value="">—</option>`;
  if(cur && [...sel.options].some(o=> o.value === cur)) sel.value = cur;
  else if(branches[0]) sel.value = branches[0].id;
}

function setPrqReadOnly(locked){
  const ids = [
    "prqDate","prqBranch","prqRequester","prqReason",
    "prqEntryName","prqEntryCode","prqEntryQty","prqEntryUnit","prqEntryReason","addPrqItemBtn"
  ];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.disabled = !!locked;
  });
  ["savePrqDraftBtn","savePrqApproveBtn","savePrqRejectBtn"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.hidden = !!locked;
  });
}

function openNewPrq(){
  document.getElementById("prqId").value = "";
  document.getElementById("prqNo").value = nextNo("PRQ-", purchaseRequisitions, "prqNo");
  document.getElementById("prqDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("prqRequester").value = who() || "";
  document.getElementById("prqReason").value = "";
  fillPrqBranchSelect(getCurrentBranchId());
  _prqLineItems = [];
  clearPrqEntryFields();
  setPrqReadOnly(false);
  const cancelBtn = document.getElementById("cancelPrqBtn");
  if(cancelBtn) cancelBtn.hidden = true;
  const poBtn = document.getElementById("createPoFromPrqBtn");
  if(poBtn) poBtn.hidden = true;
  renderPrqItemList();
}

function editPrq(id){
  const prq = purchaseRequisitions.find(p=> p.id === id);
  if(!prq) return toast("Requisition not found");
  const st = String(prq.status || "").toLowerCase();
  document.getElementById("prqId").value = prq.id;
  document.getElementById("prqNo").value = prq.prqNo || "";
  document.getElementById("prqDate").value = prq.date || "";
  document.getElementById("prqRequester").value = prq.requester || "";
  document.getElementById("prqReason").value = prq.reason || "";
  fillPrqBranchSelect(prq.branchId || getCurrentBranchId());
  _prqLineItems = Array.isArray(prq.items) ? prq.items.map(it=> ({ ...it })) : [];
  clearPrqEntryFields();
  const locked = st !== "draft" && st !== "rejected";
  setPrqReadOnly(locked);
  const cancelBtn = document.getElementById("cancelPrqBtn");
  if(cancelBtn) cancelBtn.hidden = st !== "approved";
  const poBtn = document.getElementById("createPoFromPrqBtn");
  if(poBtn) poBtn.hidden = st !== "approved";
  renderPrqItemList();
  ctx.openFormModal?.("prqModal", { skipPrepare: true });
}

export function renderPurchaseRequisitions(){
  const tbody = document.getElementById("prqRows");
  if(!tbody) return;
  const q = (document.getElementById("prqSearch")?.value || "").toLowerCase();
  const rows = purchaseRequisitions.filter(prq=>{
    const blob = `${prq.prqNo} ${prq.requester} ${prq.reason} ${prq.status} ${branchLabel(prq.branchId)}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  tbody.innerHTML = rows.length ? rows.map(prq=>{
    const st = String(prq.status || "Draft").toLowerCase();
    const poRef = prq.poNo ? esc(prq.poNo) : "—";
    const createPo = st === "approved"
      ? `<button class="btn small primary" type="button" data-po-from-prq="${prq.id}">→ PO</button>`
      : "";
    return `<tr>
      <td>${esc(prq.prqNo)}</td><td>${esc(prq.date)}</td>
      <td>${esc(branchLabel(prq.branchId))}</td>
      <td>${esc(prq.requester)}</td>
      <td>${esc(calcPrqTotals((prq.items||[]).map(normalizePrqLine)).qty)}</td>
      <td>${badge(prq.status || "Draft")}</td>
      <td>${poRef}</td>
      <td>
        <button class="btn small" type="button" data-edit-prq="${prq.id}">Open</button>
        ${createPo}
      </td>
    </tr>`;
  }).join("") : `<tr><td colspan="8" class="empty">No purchase requisitions yet</td></tr>`;
  tbody.querySelectorAll("[data-edit-prq]").forEach(b=> b.onclick = ()=> editPrq(b.dataset.editPrq));
  tbody.querySelectorAll("[data-po-from-prq]").forEach(b=> b.onclick = ()=> startPoFromPrq(b.dataset.poFromPrq));
}

export function refreshPoPrqSelect(selectedId){
  const sel = document.getElementById("poPrqSelect");
  if(!sel) return;
  const cur = selectedId ?? sel.value ?? "";
  const rows = purchaseRequisitions.filter(prq=>{
    const st = String(prq.status || "").toLowerCase();
    return st === "approved";
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  sel.innerHTML = `<option value="">— No PR —</option>` + rows.map(prq=>
    `<option value="${esc(prq.id)}"${prq.id === cur ? " selected" : ""}>${esc(prq.prqNo)} · ${esc(prq.date)} · ${esc(prq.requester || "")}</option>`
  ).join("");
  if(cur && [...sel.options].some(o=> o.value === cur)) sel.value = cur;
}

export function getPrLinesForPo(prqId){
  const prq = purchaseRequisitions.find(p=> p.id === prqId);
  if(!prq) return [];
  return (prq.items || []).map(line=>{
    const n = normalizePrqLine(line);
    return {
      name: n.name, code: n.code, productId: n.productId,
      qty: n.qty, rate: 0, price: 0, unit: n.unit, vatPct: ctx.shopDefaultVat?.() ?? 5
    };
  }).filter(l=> l.qty > 0);
}

export async function applyPrqPoConversion(prqId, poId, poNo){
  if(!prqId || !db()) return;
  const local = purchaseRequisitions.find(p=> p.id === prqId);
  if(local && String(local.status || "").toLowerCase() === "converted") return;
  await updateDoc(doc(db(), "purchaseRequisitions", prqId), {
    status: "Converted",
    poId: poId || "",
    poNo: poNo || "",
    convertedAt: Date.now(),
    convertedBy: who(),
    updatedAt: Date.now(),
    updatedBy: who(),
    ...masterMeta()
  });
}

function startPoFromPrq(prqId){
  if(!requireModule("purchase-invoices")) return;
  const prq = purchaseRequisitions.find(p=> p.id === prqId);
  if(!prq) return toast("Requisition not found");
  if(String(prq.status || "").toLowerCase() !== "approved") return toast("Requisition must be approved");
  ctx.preparePoFromPrq?.(prqId);
}

async function savePurchaseRequisition(status){
  if(!requireModule("purchase-invoices")) return;
  if(_prqSaving) return toast("Save already in progress…");
  flushPrqDraftLine();
  const items = _prqLineItems.map(normalizePrqLine).filter(l=> l.qty > 0);
  if(!items.length) return toast("Add at least one product line");
  const requester = document.getElementById("prqRequester")?.value.trim() || "";
  if(!requester) return toast("Enter requester name");
  const branchId = document.getElementById("prqBranch")?.value || getCurrentBranchId() || "";
  const prqId = document.getElementById("prqId")?.value || "";
  const existing = prqId ? purchaseRequisitions.find(p=> p.id === prqId) : null;
  if(existing){
    const cur = String(existing.status || "").toLowerCase();
    if(cur === "converted") return toast("Cannot edit — already converted to PO");
    if(cur !== "draft" && cur !== "rejected" && status === "Draft") return toast("Cannot revert to draft");
    if(cur === "approved" && status !== "Cancelled") return toast("Approved requisition is locked — cancel or create PO");
  }
  const totals = calcPrqTotals(items);
  let finalStatus = "Draft";
  if(status === "Approved") finalStatus = "Approved";
  else if(status === "Rejected") finalStatus = "Rejected";
  else if(status === "Cancelled") finalStatus = "Cancelled";
  else if(existing?.status && String(existing.status).toLowerCase() === "rejected") finalStatus = "Draft";

  if(!prqId){
    const serial = await allocateDocSerial("purchase_requisition", "PRQ-", {
      list: purchaseRequisitions, field: "prqNo", draftValue: document.getElementById("prqNo")?.value, preferCounter: true
    });
    document.getElementById("prqNo").value = serial.value;
  }
  const data = {
    prqNo: document.getElementById("prqNo").value.trim(),
    date: document.getElementById("prqDate").value,
    branchId,
    requester,
    reason: document.getElementById("prqReason").value.trim(),
    items,
    totalQty: totals.qty,
    status: finalStatus,
    updatedAt: Date.now(),
    updatedBy: who()
  };
  if(finalStatus === "Approved"){
    data.approvedAt = Date.now();
    data.approvedBy = who();
  }
  if(finalStatus === "Rejected"){
    data.rejectedAt = Date.now();
    data.rejectedBy = who();
  }
  if(finalStatus === "Cancelled"){
    data.cancelledAt = Date.now();
    data.cancelledBy = who();
  }

  try{
    _prqSaving = true;
    if(prqId){
      await updateDoc(doc(db(), "purchaseRequisitions", prqId), { ...data, ...masterMeta() });
    }else{
      const ref = await addDoc(col("purchaseRequisitions"), { ...data, ...masterCreateMeta() });
      document.getElementById("prqId").value = ref.id;
    }
    await logActivity({
      action: finalStatus === "Draft" ? "draft" : "add",
      staffName: who(),
      module: "Purchase Requisition",
      record: data.prqNo,
      summary: `${finalStatus} · ${requester} · ${totals.qty} pcs`,
      newValue: String(totals.qty)
    });
    leaveFormAfterSave("prqModal");
    toast(finalStatus === "Draft" ? "Requisition draft saved" : `Requisition ${finalStatus.toLowerCase()}`);
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _prqSaving = false;
  }
}

function tryPrqBarcodeAdd(){
  const code = document.getElementById("prqEntryCode")?.value.trim() || "";
  if(!code) return;
  const p = products().find(x=>{
    const vals = [x.code, x.barcode, x.ean, x.shopPartNumber].map(v=> String(v||"").trim().toLowerCase());
    return vals.includes(code.toLowerCase());
  });
  if(!p) return;
  const nameEl = document.getElementById("prqEntryName");
  if(nameEl) nameEl.value = p.name || "";
}

export function onPurchaseRequisitionsLoaded(rows){
  purchaseRequisitions = rows || [];
  renderPurchaseRequisitions();
  refreshPoPrqSelect(document.getElementById("poPrqSelect")?.value || "");
}

export function wirePrqUi(){
  document.getElementById("prqSearch")?.addEventListener("input", renderPurchaseRequisitions);
  document.getElementById("savePrqDraftBtn")?.addEventListener("click", ()=> savePurchaseRequisition("Draft"));
  document.getElementById("savePrqApproveBtn")?.addEventListener("click", ()=> savePurchaseRequisition("Approved"));
  document.getElementById("savePrqRejectBtn")?.addEventListener("click", ()=> savePurchaseRequisition("Rejected"));
  document.getElementById("cancelPrqBtn")?.addEventListener("click", ()=> savePurchaseRequisition("Cancelled"));
  document.getElementById("addPrqItemBtn")?.addEventListener("click", commitPrqEntryLine);
  document.getElementById("prqStartFreshBtn")?.addEventListener("click", openNewPrq);
  document.getElementById("createPoFromPrqBtn")?.addEventListener("click", ()=>{
    const id = document.getElementById("prqId")?.value || "";
    if(id) startPoFromPrq(id);
  });
  document.getElementById("prqEntryCode")?.addEventListener("change", tryPrqBarcodeAdd);
  document.getElementById("prqEntryCode")?.addEventListener("blur", tryPrqBarcodeAdd);
}

export function preparePrqModal(){
  openNewPrq();
}
