// ============================================================
// MASTERS — Build Order §2 (shared meta + warehouse master)
// ============================================================

import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getCurrentBranchId } from "./foundation.js?v=131";

let _db = null;
let _col = null;
let _who = ()=> "User";
let _warehouses = [];
let _whUnsub = null;

export function initMasters(ctx){
  _db = ctx.db;
  _col = ctx.col;
  _who = ctx.who || _who;
}

export function masterMeta(){
  return {
    branchId: getCurrentBranchId() || "",
    updatedAt: Date.now(),
    updatedBy: _who()
  };
}

export function masterCreateMeta(){
  return {
    ...masterMeta(),
    createdAt: Date.now(),
    createdBy: _who()
  };
}

export function getWarehouses(){
  return _warehouses.slice();
}

export function warehouseOptions(selectEl, selectedId){
  if(!selectEl) return;
  const rows = _warehouses.filter(w=> w.status !== "inactive");
  selectEl.innerHTML = `<option value="">—</option>` + rows.map(w=>
    `<option value="${w.id}"${w.id === selectedId ? " selected" : ""}>${escapeHtml(w.code)} — ${escapeHtml(w.name)}</option>`
  ).join("");
}

/** Shared warehouse dropdown for PI, invoice, stock adj, transfer. */
export function fillWarehouseSelect(selectEl, preserveValue){
  if(!selectEl) return;
  const rows = _warehouses.filter(w=> w.status !== "inactive");
  const cur = String(preserveValue ?? selectEl.value ?? "").trim();
  if(!rows.length){
    selectEl.innerHTML = cur
      ? `<option value="${escapeHtml(cur)}">${escapeHtml(cur)}</option>`
      : `<option value="Main">Main</option>`;
    if(cur) selectEl.value = cur;
    return;
  }
  let html = rows.map(w=>
    `<option value="${escapeHtml(w.id)}">${escapeHtml(w.code)} — ${escapeHtml(w.name)}</option>`
  ).join("");
  if(cur && !rows.some(w=> w.id === cur)){
    html = `<option value="${escapeHtml(cur)}">${escapeHtml(cur)} (legacy)</option>` + html;
  }
  selectEl.innerHTML = html;
  if(cur && [...selectEl.options].some(o=> o.value === cur)) selectEl.value = cur;
  else if(rows[0]) selectEl.value = rows[0].id;
}

export function activeWarehouseCount(){
  const n = _warehouses.filter(w=> w.status !== "inactive").length;
  return n > 0 ? n : 1;
}

/** Warehouses linked to a branch (falls back to all active if none tagged). */
export function getWarehousesForBranch(branchId){
  const bid = String(branchId || "").trim();
  const active = _warehouses.filter(w=> w.status !== "inactive");
  if(!bid) return active.length ? active : [{ id: "Main", code: "MAIN", name: "Main" }];
  const matched = active.filter(w=> String(w.branchId || "") === bid);
  if(matched.length) return matched;
  return active.length ? active : [{ id: "Main", code: "MAIN", name: "Main" }];
}

export function getDefaultWarehouseForBranch(branchId){
  return getWarehousesForBranch(branchId)[0]?.id || "Main";
}

/** Warehouse dropdown filtered by branch. */
export function fillWarehouseSelectForBranch(selectEl, branchId, preserveValue){
  if(!selectEl) return;
  const rows = getWarehousesForBranch(branchId);
  const cur = String(preserveValue ?? selectEl.value ?? "").trim();
  if(!rows.length){
    selectEl.innerHTML = `<option value="Main">Main</option>`;
    selectEl.value = "Main";
    return;
  }
  let html = rows.map(w=>
    `<option value="${escapeHtml(w.id)}">${escapeHtml(w.code)} — ${escapeHtml(w.name)}</option>`
  ).join("");
  if(cur && !rows.some(w=> w.id === cur)){
    html = `<option value="${escapeHtml(cur)}">${escapeHtml(cur)} (legacy)</option>` + html;
  }
  selectEl.innerHTML = html;
  if(cur && [...selectEl.options].some(o=> o.value === cur)) selectEl.value = cur;
  else selectEl.value = rows[0].id;
}

export function warehouseLabel(id){
  const w = _warehouses.find(x=> x.id === id);
  return w ? `${w.code} — ${w.name}` : "";
}

function escapeHtml(s){
  return String(s || "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
}

export function subscribeWarehouses(onChange){
  if(_whUnsub){ try{ _whUnsub(); }catch(_){ } _whUnsub = null; }
  if(!_db || !_col) return ()=>{};
  const q = query(_col("warehouses"), orderBy("code"));
  _whUnsub = onSnapshot(q, snap=>{
    _warehouses = snap.docs.map(d=> ({ id: d.id, ...d.data() }));
    onChange?.(_warehouses);
  }, err=> console.warn("[S4 warehouses]", err));
  return _whUnsub;
}

export function stopWarehouseSubscription(){
  if(_whUnsub){ try{ _whUnsub(); }catch(_){ } _whUnsub = null; }
}

export async function saveWarehouseRecord(id, data){
  if(!_db) throw new Error("NO_DB");
  const base = {
    code: String(data.code || "").trim().toUpperCase(),
    name: String(data.name || "").trim(),
    branchId: String(data.branchId || getCurrentBranchId() || "").trim(),
    addr: String(data.addr || "").trim(),
    status: data.status === "inactive" ? "inactive" : "active"
  };
  if(!base.code || !base.name) throw new Error("WAREHOUSE_REQUIRED");
  if(id){
    await updateDoc(doc(_db, "warehouses", id), { ...base, ...masterMeta() });
    return id;
  }
  const ref = await addDoc(_col("warehouses"), { ...base, ...masterCreateMeta() });
  return ref.id;
}

export async function deleteWarehouseRecord(id){
  if(!_db || !id) return;
  await deleteDoc(doc(_db, "warehouses", id));
}
