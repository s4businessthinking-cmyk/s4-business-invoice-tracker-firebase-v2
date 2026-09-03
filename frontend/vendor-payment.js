// ============================================================
// VENDOR PAYMENT — Build Order §4 Purchase (AP)
// Tradeasy-style: pick PI lines · allocate per bill · vendor advance
// ============================================================

import { getCurrentBranchId } from "./foundation.js?v=143";
import { masterCreateMeta, masterMeta } from "./masters.js?v=143";
import { getPurchaseInvoices, getSuppliers } from "./purchase.js?v=143";
import {
  updateDoc, doc, writeBatch
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let vendorPayments = [];
let _vpSaving = false;
let _vpBillLines = [];

export function initVendorPayment(c){ ctx = c; }
export function getVendorPayments(){ return vendorPayments; }

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
function openModal(id, opts){ return ctx.openModal?.(id, opts); }
function nextNo(prefix, list, field){ return ctx.nextNo(prefix, list, field); }
async function allocateDocSerial(docKey, prefix, opts){ return ctx.allocateDocSerial(docKey, prefix, opts); }
function today(){ return new Date().toISOString().slice(0, 10); }

export function piPayableBalance(pi){
  return Math.max(0, roundMoney(num(pi?.total) - num(pi?.paid) - num(pi?.credited)));
}

export function piCreditedPatch(pi, creditedDelta){
  const credited = roundMoney(Math.max(0, num(pi?.credited) + creditedDelta));
  return { credited, updatedAt: Date.now(), updatedBy: who() };
}

function piPaidPatch(pi, paidDelta){
  const paid = roundMoney(Math.max(0, num(pi?.paid) + paidDelta));
  const bal = Math.max(0, roundMoney(num(pi?.total) - paid - num(pi?.credited)));
  const patch = { paid, updatedAt: Date.now(), updatedBy: who() };
  if(bal <= 0.009) patch.paidDate = pi?.paidDate || today();
  else if(paidDelta < 0) patch.paidDate = "";
  return patch;
}

function supplierOutstanding(supplier){
  const sup = String(supplier || "").trim().toLowerCase();
  return getPurchaseInvoices()
    .filter(pi=>{
      const st = String(pi.status || "Posted").toLowerCase();
      if(st === "draft" || st === "cancelled") return false;
      return String(pi.supplier || "").trim().toLowerCase() === sup;
    })
    .reduce((s, pi)=> s + piPayableBalance(pi), 0);
}

function supplierOptions(selectEl, selected){
  if(!selectEl) return;
  const sel = selected || "";
  const suppliers = getSuppliers();
  selectEl.innerHTML = `<option value="">Select vendor…</option>` + suppliers.map(s=>
    `<option value="${esc(s.name)}"${s.name === sel ? " selected" : ""}>${esc(s.name)}</option>`
  ).join("");
  if(sel) selectEl.value = sel;
}

export function refreshVpSupplierSelect(){
  supplierOptions(document.getElementById("vpSupplier"), document.getElementById("vpSupplier")?.value || "");
}

function getVpEditingPayment(){
  const vpId = document.getElementById("vpId")?.value || "";
  return vpId ? vendorPayments.find(v=> v.id === vpId) : null;
}

function vpPiBalance(pi, editing = null){
  const prevPaid = editing
    ? num((editing.allocations || []).find(a=> a.purchaseInvoiceId === pi.id)?.amount)
    : 0;
  return roundMoney(piPayableBalance(pi) + prevPaid);
}

function vpPiPrevPaid(pi, editing = null){
  const prevPaid = editing
    ? num((editing.allocations || []).find(a=> a.purchaseInvoiceId === pi.id)?.amount)
    : 0;
  return roundMoney(Math.max(0, num(pi.paid) - prevPaid));
}

function openPurchaseInvoicesForVendor(supplier, prevAllocMap = {}){
  const sup = String(supplier || "").trim().toLowerCase();
  return getPurchaseInvoices()
    .filter(pi=>{
      const st = String(pi.status || "Posted").toLowerCase();
      if(st === "draft" || st === "cancelled") return false;
      if(String(pi.supplier || "").trim().toLowerCase() !== sup) return false;
      return piPayableBalance(pi) > 0.009 || num(prevAllocMap[pi.id]) > 0.009;
    })
    .sort((a,b)=> String(a.dueDate || a.invDate || a.docDate || "").localeCompare(String(b.dueDate || b.invDate || b.docDate || "")));
}

function vpOpenPisForPick(supplier, excludeInGrid = true){
  const editing = getVpEditingPayment();
  const prevAllocMap = {};
  (editing?.allocations || []).forEach(a=> { prevAllocMap[a.purchaseInvoiceId] = num(a.amount); });
  const inGrid = new Set(_vpBillLines.map(l=> l.purchaseInvoiceId));
  return openPurchaseInvoicesForVendor(supplier, prevAllocMap).filter(pi=> !excludeInGrid || !inGrid.has(pi.id));
}

function vpPiSearchBlob(pi){
  return `${pi.piNo||""} ${pi.supplierInvNo||""} ${pi.refNo||""}`.toLowerCase();
}

function vpPiOptionLabel(pi, editing){
  const bal = vpPiBalance(pi, editing);
  let label = pi.piNo || "";
  if(pi.supplierInvNo) label += ` | S:${pi.supplierInvNo}`;
  if(pi.refNo) label += ` | R:${pi.refNo}`;
  return `${label} (${money(bal)})`;
}

function findVpPiBySearch(q){
  const supplier = document.getElementById("vpSupplier")?.value || "";
  const ql = String(q || "").trim();
  if(!supplier || !ql) return { pi: null, matches: [] };
  const open = vpOpenPisForPick(supplier, true);
  const qLower = ql.toLowerCase();
  const exact = open.filter(pi=>
    String(pi.piNo || "").toLowerCase() === qLower
    || String(pi.supplierInvNo || "").toLowerCase() === qLower
    || String(pi.refNo || "").toLowerCase() === qLower
  );
  if(exact.length >= 1) return { pi: exact[0], matches: exact };
  const partial = open.filter(pi=> vpPiSearchBlob(pi).includes(qLower));
  if(partial.length === 1) return { pi: partial[0], matches: partial };
  return { pi: null, matches: partial };
}

function syncVpPiSearchFromPick(){
  const piId = document.getElementById("vpPiPick")?.value || "";
  const search = document.getElementById("vpPiSearch");
  if(!search) return;
  const pi = getPurchaseInvoices().find(x=> x.id === piId);
  if(!pi){ search.value = ""; return; }
  const parts = [];
  if(pi.supplierInvNo) parts.push(pi.supplierInvNo);
  if(pi.refNo) parts.push(pi.refNo);
  search.value = parts.length ? parts.join(" / ") : (pi.piNo || "");
}

function selectVpPi(pi){
  if(!pi) return false;
  const pick = document.getElementById("vpPiPick");
  if(!pick) return false;
  const editing = getVpEditingPayment();
  if(![...pick.options].some(o=> o.value === pi.id)){
    pick.insertAdjacentHTML("beforeend", `<option value="${esc(pi.id)}">${esc(vpPiOptionLabel(pi, editing))}</option>`);
  }
  pick.value = pi.id;
  onVpPiPickChange();
  syncVpPiSearchFromPick();
  return true;
}

function onVpPiSearchCommit(){
  const q = document.getElementById("vpPiSearch")?.value || "";
  if(!q.trim()) return false;
  const supplier = document.getElementById("vpSupplier")?.value || "";
  if(!supplier){ toast("Select vendor first"); return false; }
  const { pi, matches } = findVpPiBySearch(q);
  if(!pi){
    if(matches.length > 1) toast(`${matches.length} PI(s) match — pick from PI No list`);
    else toast("No open PI matches that number");
    return false;
  }
  selectVpPi(pi);
  document.getElementById("vpPiPay")?.focus();
  return true;
}

function clearVpPiEntryFields(){
  ["vpPiDate","vpPiAmount","vpPiPrev","vpPiBalance","vpPiPay","vpPiSearch"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
}

function fillVpPiPick(){
  const supplier = document.getElementById("vpSupplier")?.value || "";
  const pick = document.getElementById("vpPiPick");
  if(!pick) return;
  const editing = getVpEditingPayment();
  if(!supplier){
    pick.innerHTML = `<option value="">Select vendor first</option>`;
    clearVpPiEntryFields();
    return;
  }
  const open = vpOpenPisForPick(supplier, true);
  pick.innerHTML = `<option value="">-- Select PI --</option>` + open.map(pi=>
    `<option value="${esc(pi.id)}">${esc(vpPiOptionLabel(pi, editing))}</option>`
  ).join("");
  clearVpPiEntryFields();
  updateVpVendorSummary();
}

function onVpPiPickChange(){
  const piId = document.getElementById("vpPiPick")?.value || "";
  const pi = getPurchaseInvoices().find(x=> x.id === piId);
  const editing = getVpEditingPayment();
  if(!pi){
    ["vpPiDate","vpPiAmount","vpPiPrev","vpPiBalance","vpPiPay"].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.value = "";
    });
    return;
  }
  const balance = vpPiBalance(pi, editing);
  const set = (id, val)=> { const el = document.getElementById(id); if(el) el.value = val; };
  set("vpPiDate", pi.invDate || pi.docDate || "");
  set("vpPiAmount", String(roundMoney(pi.total)));
  set("vpPiPrev", String(vpPiPrevPaid(pi, editing)));
  set("vpPiBalance", String(balance));
  set("vpPiPay", balance > 0.009 ? String(balance) : "");
  syncVpPiSearchFromPick();
}

function syncVpAmountFromGrid(){
  const total = roundMoney(_vpBillLines.reduce((s,l)=> s + num(l.paid), 0));
  const vpAmount = document.getElementById("vpAmount");
  const vpBillTotal = document.getElementById("vpBillTotal");
  if(vpAmount) vpAmount.value = total > 0.009 ? String(total) : "";
  if(vpBillTotal) vpBillTotal.textContent = money(total);
}

function renderVpBillGrid(){
  const tbody = document.getElementById("vpAllocRows");
  if(!tbody) return;
  if(!_vpBillLines.length){
    tbody.innerHTML = `<tr><td colspan="4" class="empty">Select PI, enter Current Payment, press Enter</td></tr>`;
  }else{
    tbody.innerHTML = _vpBillLines.map((l, i)=> `<tr data-vp-line="${i}" title="Double-click row to remove">
      <td><b>${esc(l.piNo)}</b></td>
      <td>${esc(l.piDate)}</td>
      <td class="num">${money(l.piAmount)}</td>
      <td><input type="number" min="0" step="0.01" data-vp-paid="${i}" data-max="${l.balance}" value="${l.paid}"></td>
    </tr>`).join("");
  }
  syncVpAmountFromGrid();
  fillVpPiPick();
  updateVpVendorSummary();
}

function addVpBillLine(){
  const supplier = document.getElementById("vpSupplier")?.value || "";
  if(!supplier) return toast("Select vendor first");
  let piId = document.getElementById("vpPiPick")?.value || "";
  if(!piId && document.getElementById("vpPiSearch")?.value?.trim()){
    onVpPiSearchCommit();
    piId = document.getElementById("vpPiPick")?.value || "";
  }
  if(!piId) return toast("Select a PI or type Supplier Inv / Ref / PI no");
  const paid = num(document.getElementById("vpPiPay")?.value);
  if(paid <= 0) return toast("Enter current payment amount");
  const pi = getPurchaseInvoices().find(x=> x.id === piId);
  if(!pi) return toast("Purchase invoice not found");
  const editing = getVpEditingPayment();
  const balance = vpPiBalance(pi, editing);
  if(paid > balance + 0.01) return toast(`Payment ${money(paid)} exceeds balance ${money(balance)}`);
  if(_vpBillLines.some(l=> l.purchaseInvoiceId === piId)) return toast("PI already in list");
  _vpBillLines.push({
    purchaseInvoiceId: pi.id,
    piNo: pi.piNo,
    piDate: pi.invDate || pi.docDate || "",
    piAmount: roundMoney(pi.total),
    balance,
    paid: roundMoney(Math.min(paid, balance))
  });
  renderVpBillGrid();
  const vpPiPay = document.getElementById("vpPiPay");
  if(vpPiPay){ vpPiPay.value = ""; vpPiPay.focus(); }
  onVpPiPickChange();
}

function removeVpBillLine(idx){
  if(idx < 0 || idx >= _vpBillLines.length) return;
  _vpBillLines.splice(idx, 1);
  renderVpBillGrid();
}

function loadVpBillLinesFromPayment(vp){
  _vpBillLines = [];
  if(!vp) return;
  (vp.allocations || []).forEach(a=>{
    const pi = getPurchaseInvoices().find(x=> x.id === a.purchaseInvoiceId);
    if(!pi) return;
    const paid = roundMoney(num(a.amount));
    if(paid <= 0.009) return;
    _vpBillLines.push({
      purchaseInvoiceId: pi.id,
      piNo: pi.piNo,
      piDate: pi.invDate || pi.docDate || "",
      piAmount: roundMoney(pi.total),
      balance: vpPiBalance(pi, vp),
      paid
    });
  });
}

function readVpAllocationsFromGrid(){
  syncVpAmountFromGrid();
  return _vpBillLines.map(l=> ({
    purchaseInvoiceId: l.purchaseInvoiceId,
    piNo: l.piNo,
    amount: roundMoney(l.paid)
  })).filter(a=> a.amount > 0.009);
}

function updateVpVendorSummary(){
  const supplier = document.getElementById("vpSupplier")?.value || "";
  const balEl = document.getElementById("vpBalancePending");
  const ledEl = document.getElementById("vpLedgerBalance");
  const editing = getVpEditingPayment();
  const prevAllocMap = {};
  (editing?.allocations || []).forEach(a=> { prevAllocMap[a.purchaseInvoiceId] = num(a.amount); });
  if(!supplier){
    if(balEl) balEl.textContent = "Open PI Bills : —";
    if(ledEl) ledEl.textContent = "Vendor Outstanding: —";
    return;
  }
  const open = openPurchaseInvoicesForVendor(supplier, prevAllocMap);
  const pendingBal = roundMoney(open.reduce((s, pi)=> s + vpPiBalance(pi, editing), 0));
  const ledgerBal = roundMoney(supplierOutstanding(supplier));
  if(balEl) balEl.textContent = `Open PI Bills : ${money(pendingBal)} (${open.length} pending)`;
  if(ledEl) ledEl.textContent = `Vendor Outstanding: ${money(ledgerBal)}`;
}

function setVpModalSub(text){
  const el = document.getElementById("vpModalSub");
  if(el) el.textContent = text || "Pay supplier · allocate to purchase invoices";
}

function syncVpMethodUi(){
  const modal = document.getElementById("vendorPaymentModal");
  const method = document.getElementById("vpMethod")?.value || "Cash";
  const isCheque = method.includes("Cheque");
  const isPdc = method === "PDC Cheque";
  if(modal){
    modal.querySelectorAll(".cheque-only").forEach(el=>{
      if(el.id === "vpChequeHint") return;
      el.style.display = isCheque ? "" : "none";
    });
    modal.querySelectorAll(".pdc-only").forEach(el=>{
      el.style.display = isPdc ? "" : "none";
    });
  }
  const hint = document.getElementById("vpChequeHint");
  if(hint) hint.style.display = isCheque ? "" : "none";
}

async function applyVendorPaymentToInvoices(payment, batch){
  for(const a of payment.allocations || []){
    const pi = getPurchaseInvoices().find(p=> p.id === a.purchaseInvoiceId);
    if(!pi) continue;
    const patch = piPaidPatch(pi, num(a.amount));
    batch.update(doc(db(), "purchaseInvoices", pi.id), patch);
    Object.assign(pi, patch);
  }
}

async function reverseVendorPaymentFromInvoices(payment, batch){
  for(const a of payment.allocations || []){
    const pi = getPurchaseInvoices().find(p=> p.id === a.purchaseInvoiceId);
    if(!pi) continue;
    const patch = piPaidPatch(pi, -num(a.amount));
    batch.update(doc(db(), "purchaseInvoices", pi.id), patch);
    Object.assign(pi, patch);
  }
}

function openNewVendorPayment(){
  document.getElementById("vpId").value = "";
  document.getElementById("vpNo").value = nextNo("VP-", vendorPayments, "vpNo");
  document.getElementById("vpDate").value = today();
  document.getElementById("vpAmount").value = "";
  document.getElementById("vpRef").value = "";
  document.getElementById("vpChq").value = "";
  document.getElementById("vpBank").value = "";
  document.getElementById("vpChqDate").value = "";
  document.getElementById("vpPdcDate").value = "";
  document.getElementById("vpMethod").value = "Cash";
  const vpPaidBy = document.getElementById("vpPaidBy");
  if(vpPaidBy) vpPaidBy.value = who();
  refreshVpSupplierSelect();
  syncVpMethodUi();
  _vpBillLines = [];
  renderVpBillGrid();
  fillVpPiPick();
  setVpModalSub("");
}

function editVendorPayment(id){
  const vp = vendorPayments.find(v=> v.id === id);
  if(!vp) return toast("Payment not found");
  if(String(vp.status || "").toLowerCase() === "voided") return toast("Voided payment — cannot edit");
  document.getElementById("vpId").value = vp.id;
  document.getElementById("vpNo").value = vp.vpNo || "";
  document.getElementById("vpDate").value = vp.date || "";
  document.getElementById("vpAmount").value = vp.amount ?? "";
  document.getElementById("vpRef").value = vp.ref || "";
  document.getElementById("vpChq").value = vp.chequeNo || "";
  document.getElementById("vpBank").value = vp.bank || "";
  document.getElementById("vpChqDate").value = vp.chequeDate || "";
  document.getElementById("vpPdcDate").value = vp.pdcDate || "";
  document.getElementById("vpMethod").value = vp.method || "Cash";
  const vpPaidBy = document.getElementById("vpPaidBy");
  if(vpPaidBy) vpPaidBy.value = vp.paidBy || vp.createdBy || who();
  refreshVpSupplierSelect();
  supplierOptions(document.getElementById("vpSupplier"), vp.supplier || "");
  syncVpMethodUi();
  loadVpBillLinesFromPayment(vp);
  renderVpBillGrid();
  fillVpPiPick();
  setVpModalSub(`${vp.vpNo} - ${vp.status || "Posted"}`);
  ctx.openFormModal?.("vendorPaymentModal", { skipPrepare: true });
}

function renderVpFindRows(q = ""){
  const tbody = document.getElementById("vpFindRows");
  if(!tbody) return;
  const ql = String(q || "").toLowerCase().trim();
  const rows = vendorPayments.filter(vp=>{
    if(!ql) return true;
    return `${vp.vpNo} ${vp.supplier} ${vp.chequeNo} ${vp.ref} ${vp.method}`.toLowerCase().includes(ql);
  }).sort((a,b)=> String(b.date).localeCompare(String(a.date))).slice(0, 80);
  tbody.innerHTML = rows.length ? rows.map(vp=> `<tr data-vp-find-id="${esc(vp.id)}" class="vp-find-hit">
    <td><b>${esc(vp.vpNo)}</b></td>
    <td>${esc(vp.date)}</td>
    <td>${esc(vp.supplier)}</td>
    <td class="num">${money(vp.amount)}</td>
    <td>${badge(vp.status || "Posted")}</td>
  </tr>`).join("") : `<tr><td colspan="5" class="empty">${ql ? "No matching payments" : "No vendor payments yet"}</td></tr>`;
}

function openVpFindModal(){
  if(!requireModule("purchase-invoices")) return;
  const q = document.getElementById("vpFindQuery");
  if(q) q.value = "";
  renderVpFindRows("");
  openModal("vpFindModal", { keepOpen: ["vendorPaymentModal"] });
  setTimeout(()=> q?.focus(), 50);
}

export function renderVendorPayments(){
  const tbody = document.getElementById("vpRows");
  if(!tbody) return;
  const q = (document.getElementById("vpSearch")?.value || "").toLowerCase();
  const rows = vendorPayments.filter(vp=>{
    const blob = `${vp.vpNo} ${vp.supplier} ${vp.method} ${vp.ref} ${vp.chequeNo}`.toLowerCase();
    return blob.includes(q);
  }).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  tbody.innerHTML = rows.length ? rows.map(vp=> `<tr>
    <td>${esc(vp.vpNo)}</td><td>${esc(vp.date)}</td><td>${esc(vp.supplier)}</td>
    <td>${esc(vp.method)}</td><td>${money(vp.amount)}</td>
    <td>${money(vp.allocated)}</td><td>${money(vp.unallocated)}</td>
    <td>${badge(vp.status || "Posted")}</td>
    <td>
      <button class="btn small" type="button" data-edit-vp="${vp.id}">Open</button>
      ${String(vp.status||"").toLowerCase() !== "voided" ? `<button class="btn small danger" type="button" data-void-vp="${vp.id}">Void</button>` : ""}
    </td>
  </tr>`).join("") : `<tr><td colspan="9" class="empty">No vendor payments yet</td></tr>`;
  tbody.querySelectorAll("[data-edit-vp]").forEach(b=> b.onclick = ()=> editVendorPayment(b.dataset.editVp));
  tbody.querySelectorAll("[data-void-vp]").forEach(b=> b.onclick = ()=> voidVendorPayment(b.dataset.voidVp));
}

async function saveVendorPayment(){
  if(!requireModule("purchase-invoices")) return;
  if(_vpSaving) return toast("Save already in progress…");
  const supplier = document.getElementById("vpSupplier")?.value || "";
  if(!supplier) return toast("Select vendor");
  const vpId = document.getElementById("vpId")?.value || "";
  const existing = vpId ? vendorPayments.find(v=> v.id === vpId) : null;
  if(existing && supplier !== existing.supplier) return toast("Cannot change vendor — void and create new payment");
  const allocs = readVpAllocationsFromGrid();
  const amount = roundMoney(allocs.reduce((s,a)=> s + a.amount, 0));
  if(amount <= 0) return toast("Add at least one PI with payment amount");
  const allocated = amount;
  const method = document.getElementById("vpMethod")?.value || "Cash";
  const isCheque = method.includes("Cheque");
  if(isCheque && !(document.getElementById("vpChq")?.value || "").trim()){
    return toast(`Enter cheque number for ${method}`);
  }
  if(method === "PDC Cheque" && !(document.getElementById("vpPdcDate")?.value || "").trim()){
    return toast("Enter PDC date");
  }
  for(let i = 0; i < allocs.length; i++){
    const pi = getPurchaseInvoices().find(x=> x.id === allocs[i].purchaseInvoiceId);
    if(!pi) continue;
    const prevPaid = (existing?.allocations || []).find(a=> a.purchaseInvoiceId === pi.id)?.amount || 0;
    const owed = roundMoney(piPayableBalance(pi) + num(prevPaid));
    if(allocs[i].amount > owed + 0.02){
      return toast(`PI ${pi.piNo}: payment ${money(allocs[i].amount)} exceeds outstanding ${money(owed)}`);
    }
  }
  let due = supplierOutstanding(supplier);
  if(existing) due = roundMoney(Math.max(0, due - num(existing.amount)));
  if(amount > due + 0.01){
    const extra = roundMoney(amount - due);
    if(!confirm(
      `Payment exceeds vendor outstanding by ${money(extra)}.\n` +
      `Outstanding: ${money(due)} · Payment: ${money(amount)}\n\n` +
      `Continue? Extra will be vendor advance.`
    )) return;
  }
  const paidBy = existing?.paidBy || document.getElementById("vpPaidBy")?.value?.trim() || who();
  if(!vpId){
    const serial = await allocateDocSerial("vendor_payment", "VP-", {
      list: vendorPayments, field: "vpNo", draftValue: document.getElementById("vpNo")?.value, preferCounter: true
    });
    document.getElementById("vpNo").value = serial.value;
  }
  const data = {
    vpNo: document.getElementById("vpNo").value.trim(),
    date: document.getElementById("vpDate").value || today(),
    supplier,
    method,
    amount,
    allocated,
    unallocated: 0,
    ref: document.getElementById("vpRef")?.value.trim() || "",
    chequeNo: isCheque ? document.getElementById("vpChq")?.value.trim() || "" : "",
    bank: isCheque ? document.getElementById("vpBank")?.value.trim() || "" : "",
    chequeDate: isCheque ? document.getElementById("vpChqDate")?.value || "" : "",
    pdcDate: method === "PDC Cheque" ? document.getElementById("vpPdcDate")?.value || "" : "",
    paidBy,
    allocations: allocs,
    status: "Posted",
    applied: true,
    branchId: getCurrentBranchId() || "",
    updatedAt: Date.now(),
    updatedBy: who()
  };
  try{
    _vpSaving = true;
    if(existing){
      const batch = writeBatch(db());
      await reverseVendorPaymentFromInvoices(existing, batch);
      batch.update(doc(db(), "vendorPayments", existing.id), { ...data, ...masterMeta() });
      await applyVendorPaymentToInvoices({ ...data, allocations: allocs }, batch);
      await batch.commit();
      Object.assign(existing, data);
    }else{
      const ref = doc(col("vendorPayments"));
      const batch = writeBatch(db());
      batch.set(ref, { ...data, ...masterCreateMeta() });
      await applyVendorPaymentToInvoices({ ...data, allocations: allocs }, batch);
      await batch.commit();
      document.getElementById("vpId").value = ref.id;
    }
    await logActivity({
      action: existing ? "update" : "add",
      staffName: who(),
      module: "Vendor Payment",
      record: data.vpNo,
      summary: `${data.vpNo} · ${supplier} · ${money(amount)}`,
      newValue: money(amount)
    });
    leaveFormAfterSave("vendorPaymentModal");
    toast("Vendor payment posted");
    ctx.renderPurchaseInvoices?.();
    renderVendorPayments();
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _vpSaving = false;
  }
}

async function voidVendorPayment(id){
  if(!requireModule("purchase-invoices")) return;
  const vp = vendorPayments.find(v=> v.id === id);
  if(!vp) return toast("Payment not found");
  if(String(vp.status||"").toLowerCase() === "voided") return;
  if(!confirm(`Void payment ${vp.vpNo}? This reverses allocation on purchase invoices.`)) return;
  try{
    const batch = writeBatch(db());
    await reverseVendorPaymentFromInvoices(vp, batch);
    batch.update(doc(db(), "vendorPayments", vp.id), {
      status: "Voided",
      applied: false,
      updatedAt: Date.now(),
      updatedBy: who(),
      ...masterMeta()
    });
    await batch.commit();
    Object.assign(vp, { status: "Voided", applied: false });
    await logActivity({
      action: "void", staffName: who(), module: "Vendor Payment",
      record: vp.vpNo, summary: `Voided · ${vp.supplier}`
    });
    toast("Payment voided");
    renderVendorPayments();
    ctx.renderPurchaseInvoices?.();
  }catch(e){
    toast(friendlyFirestoreError(e));
  }
}

export function onVendorPaymentsLoaded(rows){
  vendorPayments = rows || [];
  renderVendorPayments();
}

export function wireVendorPaymentUi(){
  if(document.body._vpUiBound) return;
  document.body._vpUiBound = true;
  document.getElementById("vpSearch")?.addEventListener("input", renderVendorPayments);
  document.getElementById("saveVendorPaymentBtn")?.addEventListener("click", saveVendorPayment);
  document.getElementById("vpStartFreshBtn")?.addEventListener("click", openNewVendorPayment);
  document.getElementById("vpFindBtn")?.addEventListener("click", openVpFindModal);
  document.getElementById("vpFindQuery")?.addEventListener("input", e=> renderVpFindRows(e.target.value));
  document.getElementById("vpFindRows")?.addEventListener("click", e=>{
    const tr = e.target.closest("[data-vp-find-id]");
    if(!tr) return;
    closeModal("vpFindModal");
    editVendorPayment(tr.dataset.vpFindId);
  });
  document.getElementById("vpSupplier")?.addEventListener("change", ()=>{
    _vpBillLines = [];
    renderVpBillGrid();
    fillVpPiPick();
  });
  document.getElementById("vpMethod")?.addEventListener("change", syncVpMethodUi);
  document.getElementById("vpPiPick")?.addEventListener("change", onVpPiPickChange);
  document.getElementById("vpPiSearch")?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){ e.preventDefault(); onVpPiSearchCommit(); }
  });
  document.getElementById("vpPiSearch")?.addEventListener("blur", ()=>{
    const q = document.getElementById("vpPiSearch")?.value?.trim();
    if(q) onVpPiSearchCommit();
  });
  document.getElementById("vpPiPay")?.addEventListener("keydown", e=>{
    if(e.key === "Enter"){ e.preventDefault(); addVpBillLine(); }
  });
  document.getElementById("vpAddPiBtn")?.addEventListener("click", addVpBillLine);
  const tbody = document.getElementById("vpAllocRows");
  tbody?.addEventListener("input", e=>{
    if(!e.target.matches("input[data-vp-paid]")) return;
    const i = num(e.target.dataset.vpPaid);
    const max = num(e.target.dataset.max);
    const val = roundMoney(Math.min(Math.max(0, num(e.target.value)), max));
    e.target.value = String(val);
    if(_vpBillLines[i]) _vpBillLines[i].paid = val;
    syncVpAmountFromGrid();
  });
  tbody?.addEventListener("dblclick", e=>{
    const tr = e.target.closest("tr[data-vp-line]");
    if(!tr) return;
    removeVpBillLine(num(tr.dataset.vpLine));
    toast("PI removed from list");
  });
}

export function prepareVendorPaymentModal(){
  openNewVendorPayment();
}
