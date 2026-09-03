// ============================================================
// WORKSHOP — Build Order §5
// Job Card → Parts Issue → Stock OUT → Invoice (§15 Workshop Sale)
// ============================================================

import { getCurrentBranchId } from "./foundation.js?v=150";
import { masterCreateMeta, masterMeta } from "./masters.js?v=150";
import { findProductForLine } from "./purchase.js?v=150";
import { applyJobIssueStockDelta, validateStockForLines, inventoryErrorText } from "./inventory.js?v=150";
import { addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let ctx = {};
let jobCards = [];
let _jcLineItems = [];
let _jcSaving = false;
let _jcRestoreIssued = 0;
let partsIssues = [];
let _jpiLines = [];
let _jpiSaving = false;
let _jpiPrefillJobId = "";

export function initWorkshop(c){ ctx = c; }
export function getJobCards(){ return jobCards; }
export function getPartsIssues(){ return partsIssues; }

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
function openFormModal(id, opts){ return ctx.openFormModal(id, opts); }
function nextNo(prefix, list, field){ return ctx.nextNo(prefix, list, field); }
async function allocateDocSerial(docKey, prefix, opts){ return ctx.allocateDocSerial(docKey, prefix, opts); }
function shopDefaultVat(){ return ctx.shopDefaultVat(); }
function today(){ return new Date().toISOString().slice(0, 10); }

function customers(){ return ctx.getCustomers() || []; }
function vehicles(){ return ctx.getVehicles() || []; }
function services(){ return ctx.getServices() || []; }

function normalizeJcLine(raw){
  const lineType = raw?.lineType === "labour" ? "labour" : "part";
  const name = String(raw?.name || "").trim();
  const code = String(raw?.code || "").trim();
  const qty = Math.max(0, num(raw?.qty));
  const rate = num(raw?.rate ?? raw?.price);
  const disc = Math.max(0, num(raw?.disc));
  const vatPct = num(raw?.vatPct ?? raw?.vat);
  const net = roundMoney(Math.max(0, qty * rate - disc));
  const vatAmt = roundMoney(net * vatPct / 100);
  const amount = roundMoney(net + vatAmt);
  let productId = raw?.productId || "";
  let serviceId = raw?.serviceId || "";
  if(lineType === "part"){
    const product = findProductForLine({ name, code });
    if(product){
      productId = product.id || productId;
    }
  }else{
    const svc = services().find(s=>
      String(s.name || "").trim().toLowerCase() === name.toLowerCase()
      || (code && String(s.code || "").trim().toLowerCase() === code.toLowerCase())
    );
    if(svc) serviceId = svc.id || serviceId;
  }
  return {
    lineType, name, code, productId, serviceId,
    qty, rate, disc, vatPct, vatAmt, amount,
    issuedQty: Math.max(0, num(raw?.issuedQty))
  };
}

function calcJobCard(){
  const items = _jcLineItems.map(normalizeJcLine);
  const partsTotal = roundMoney(items.filter(x=> x.lineType === "part").reduce((s, x)=> s + x.amount, 0));
  const labourTotal = roundMoney(items.filter(x=> x.lineType === "labour").reduce((s, x)=> s + x.amount, 0));
  const subtotal = roundMoney(partsTotal + labourTotal);
  const vatTotal = roundMoney(items.reduce((s, x)=> s + x.vatAmt, 0));
  const grandTotal = roundMoney(subtotal);
  return { items, partsTotal, labourTotal, subtotal, vatTotal, grandTotal };
}

function setJcModalSub(text){
  const el = document.getElementById("jcModalSub");
  if(el) el.textContent = text || "New job card";
}

function filterVehiclesForJobCard(){
  const cust = document.getElementById("jcCustomer")?.value || "";
  const list = document.getElementById("jcVehicleList");
  if(!list) return;
  const plates = vehicles()
    .filter(v=> !cust || String(v.customer || "").trim() === String(cust).trim())
    .map(v=> v.plate)
    .filter(Boolean);
  list.innerHTML = plates.map(p=> `<option value="${esc(p)}">`).join("");
}

function readJcEntryDraft(){
  const lineType = document.getElementById("jcEntryType")?.value === "labour" ? "labour" : "part";
  return {
    lineType,
    name: document.getElementById("jcEntryName")?.value.trim() || "",
    code: document.getElementById("jcEntryCode")?.value.trim() || "",
    qty: num(document.getElementById("jcEntryQty")?.value),
    rate: num(document.getElementById("jcEntryRate")?.value),
    disc: num(document.getElementById("jcEntryDisc")?.value),
    vatPct: num(document.getElementById("jcEntryVat")?.value)
  };
}

function clearJcEntryFields(){
  ["jcEntryName","jcEntryCode","jcEntryDisc"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
  const qty = document.getElementById("jcEntryQty");
  const rate = document.getElementById("jcEntryRate");
  const vat = document.getElementById("jcEntryVat");
  if(qty) qty.value = "1";
  if(rate) rate.value = "0";
  if(vat) vat.value = String(shopDefaultVat());
}

function flushJcDraftLine(){
  const draft = readJcEntryDraft();
  if(!String(draft.name || draft.code || "").trim()) return;
  commitJcEntryLine();
}

function commitJcEntryLine(){
  const draft = normalizeJcLine(readJcEntryDraft());
  if(!draft.name && !draft.code) return toast("Enter item name or code");
  if(draft.qty <= 0) return toast("Enter quantity");
  if(_jcRestoreIssued && draft.qty + 0.0001 < _jcRestoreIssued){
    return toast("Qty cannot be below already issued");
  }
  draft.issuedQty = _jcRestoreIssued;
  _jcRestoreIssued = 0;
  _jcLineItems.push({ ...draft });
  clearJcEntryFields();
  renderJcItemList();
}

function setJcLineItems(items){
  _jcLineItems = (items || []).map(normalizeJcLine);
  renderJcItemList();
}

function renderJcItemList(){
  const tbody = document.getElementById("jcItemRows");
  if(!tbody) return;
  const calc = calcJobCard();
  if(!calc.items.length){
    tbody.innerHTML = `<tr><td colspan="9" class="empty">Add parts or labour lines below</td></tr>`;
    updateJcTotals(calc);
    return;
  }
  tbody.innerHTML = calc.items.map((it, idx)=> `<tr data-jc-line="${idx}">
    <td>${esc(it.lineType === "labour" ? "Labour" : "Part")}</td>
    <td>${esc(it.name)}</td>
    <td>${esc(it.code)}</td>
    <td>${esc(it.qty)}</td>
    <td>${money(it.rate)}</td>
    <td>${money(it.disc)}</td>
    <td>${esc(it.vatPct)}%</td>
    <td>${money(it.amount)}</td>
    <td><button class="btn small danger" type="button" data-rm-jc-item="${idx}">×</button></td>
  </tr>`).join("");
  tbody.querySelectorAll("[data-rm-jc-item]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const line = _jcLineItems[Number(btn.dataset.rmJcItem)];
      if(num(line?.issuedQty) > 0) return toast("Cannot remove a part that is already issued");
      _jcLineItems.splice(Number(btn.dataset.rmJcItem), 1);
      renderJcItemList();
    });
  });
  tbody.querySelectorAll("[data-jc-line]").forEach(tr=>{
    tr.addEventListener("dblclick", ()=>{
      const idx = Number(tr.dataset.jcLine);
      const line = _jcLineItems[idx];
      if(!line) return;
      _jcRestoreIssued = num(line.issuedQty);
      _jcLineItems.splice(idx, 1);
      const typeEl = document.getElementById("jcEntryType");
      if(typeEl) typeEl.value = line.lineType === "labour" ? "labour" : "part";
      document.getElementById("jcEntryName").value = line.name || "";
      document.getElementById("jcEntryCode").value = line.code || "";
      document.getElementById("jcEntryQty").value = line.qty;
      document.getElementById("jcEntryRate").value = line.rate;
      document.getElementById("jcEntryDisc").value = line.disc || 0;
      document.getElementById("jcEntryVat").value = line.vatPct ?? shopDefaultVat();
      renderJcItemList();
      document.getElementById("jcEntryName")?.focus();
    });
  });
  updateJcTotals(calc);
}

function updateJcTotals(calc){
  calc = calc || calcJobCard();
  const set = (id, val)=>{ const el = document.getElementById(id); if(el) el.textContent = money(val); };
  set("jcPartsTotal", calc.partsTotal);
  set("jcLabourTotal", calc.labourTotal);
  set("jcVatTotal", calc.vatTotal);
  set("jcGrandTotal", calc.grandTotal);
}

function jcStatusBadge(st){
  return badge(String(st || "Draft"));
}

export function onJobCardsLoaded(rows){
  jobCards = rows || [];
  renderJobCards();
}

export function renderJobCards(){
  const tbody = document.getElementById("jobCardRows");
  if(!tbody) return;
  const q = (document.getElementById("jobCardSearch")?.value || "").trim().toLowerCase();
  const filterBtn = document.querySelector("#jobCardFilters .active");
  const statusFilter = filterBtn?.dataset?.status ?? "";
  let rows = [...jobCards].sort((a, b)=> String(b.jobDate || "").localeCompare(String(a.jobDate || "")));
  if(statusFilter) rows = rows.filter(r=> String(r.status || "Draft") === statusFilter);
  if(q){
    rows = rows.filter(r=>{
      const hay = [r.jobNo, r.customer, r.vehicle, r.technician, r.advisor, r.complaint, r.status]
        .map(x=> String(x || "").toLowerCase()).join(" ");
      return hay.includes(q);
    });
  }
  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="10" class="empty">${jobCards.length ? "No matches" : "No job cards yet — create one"}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(j=> `<tr data-jc-id="${esc(j.id)}">
    <td>${esc(j.jobNo)}</td>
    <td>${esc(j.jobDate || "")}</td>
    <td>${esc(j.customer)}</td>
    <td>${esc(j.vehicle)}</td>
    <td>${jcStatusBadge(j.status)}${j.invoiceNo ? `<div class="muted" style="font-size:11px">${esc(j.invoiceNo)}</div>` : ""}</td>
    <td class="num">${money(j.partsTotal)}</td>
    <td class="num">${money(j.labourTotal)}</td>
    <td class="num"><b>${money(j.grandTotal)}</b></td>
    <td>${esc(j.technician || "—")}</td>
    <td style="white-space:nowrap">
      <button class="btn small" type="button" data-edit-jc="${esc(j.id)}">Open</button>
      <button class="btn small" type="button" data-issue-jc="${esc(j.id)}">Issue</button>
      ${String(j.status) === "Cancelled" ? "" : `<button class="btn small" type="button" data-invoice-jc="${esc(j.id)}">${j.invoiceId ? "Open Inv" : "Invoice"}</button>`}
    </td>
  </tr>`).join("");
  tbody.querySelectorAll("[data-edit-jc]").forEach(btn=>{
    btn.addEventListener("click", ()=> editJobCard(btn.dataset.editJc));
  });
  tbody.querySelectorAll("[data-issue-jc]").forEach(btn=>{
    btn.addEventListener("click", ()=> openPartsIssueForJob(btn.dataset.issueJc));
  });
  tbody.querySelectorAll("[data-invoice-jc]").forEach(btn=>{
    btn.addEventListener("click", ()=> createInvoiceFromJob(btn.dataset.invoiceJc));
  });
}

function resetJobCard(){
  document.getElementById("jcId").value = "";
  document.getElementById("jcNo").value = nextNo("JC-", jobCards, "jobNo");
  document.getElementById("jcDate").value = today();
  const statusEl = document.getElementById("jcStatus");
  if(statusEl) statusEl.value = "Open";
  ctx.customerOptions(document.getElementById("jcCustomer"), "");
  const custInput = document.getElementById("jcCustomerInput");
  if(custInput) custInput.value = "";
  filterVehiclesForJobCard();
  document.getElementById("jcVehicle").value = "";
  document.getElementById("jcMileage").value = "";
  document.getElementById("jcAdvisor").value = who() || "";
  document.getElementById("jcTechnician").value = "";
  document.getElementById("jcComplaint").value = "";
  document.getElementById("jcDiagnosis").value = "";
  document.getElementById("jcNotes").value = "";
  setJcLineItems([]);
  clearJcEntryFields();
  setJcModalSub("New job card");
}

export function prepareJobCardModal(){
  resetJobCard();
}

function editJobCard(id){
  const j = jobCards.find(x=> x.id === id);
  if(!j) return;
  document.getElementById("jcId").value = j.id;
  document.getElementById("jcNo").value = j.jobNo || "";
  document.getElementById("jcDate").value = j.jobDate || today();
  const statusEl = document.getElementById("jcStatus");
  if(statusEl) statusEl.value = j.status || "Open";
  ctx.customerOptions(document.getElementById("jcCustomer"), j.customer || "");
  const custInput = document.getElementById("jcCustomerInput");
  if(custInput) custInput.value = j.customer || "";
  filterVehiclesForJobCard();
  document.getElementById("jcVehicle").value = j.vehicle || "";
  document.getElementById("jcMileage").value = j.mileageIn != null ? j.mileageIn : "";
  document.getElementById("jcAdvisor").value = j.advisor || "";
  document.getElementById("jcTechnician").value = j.technician || "";
  document.getElementById("jcComplaint").value = j.complaint || "";
  document.getElementById("jcDiagnosis").value = j.diagnosis || "";
  document.getElementById("jcNotes").value = j.notes || "";
  setJcLineItems(j.items || []);
  setJcModalSub(j.invoiceNo ? `${j.jobNo} — ${j.status || "Open"} — ${j.invoiceNo}` : `${j.jobNo} — ${j.status || "Open"}`);
  openFormModal("jobCardModal", { skipPrepare: true });
}

function createInvoiceFromJob(jobId){
  if(!ctx.openInvoiceFromJob) return toast("Invoice screen not available");
  ctx.openInvoiceFromJob(jobId);
}

async function saveJobCard(){
  if(!requireModule("workshop")) return;
  if(_jcSaving) return toast("Save already in progress…");
  flushJcDraftLine();
  const customer = document.getElementById("jcCustomer")?.value?.trim() || "";
  const vehicle = document.getElementById("jcVehicle")?.value?.trim() || "";
  const complaint = document.getElementById("jcComplaint")?.value?.trim() || "";
  const calc = calcJobCard();
  if(!customer) return toast("Select customer");
  if(!vehicle) return toast("Enter vehicle plate");
  if(!complaint && !calc.items.length) return toast("Enter complaint or add line items");
  const cust = customers().find(c=> c.name === customer);
  if(cust && cust.status === "Blocked") return toast("Customer is blocked");
  const overIssued = calc.items.find(x=> x.lineType === "part" && x.qty + 0.0001 < num(x.issuedQty));
  if(overIssued) return toast(`Qty cannot be below already issued (${overIssued.name})`);
  const jcId = document.getElementById("jcId")?.value || "";
  let jobNo = document.getElementById("jcNo")?.value?.trim() || "";
  if(!jcId){
    const serial = await allocateDocSerial("job_card", "JC-", {
      list: jobCards, field: "jobNo", draftValue: jobNo, preferCounter: true
    });
    jobNo = serial.value;
    document.getElementById("jcNo").value = jobNo;
  }else if(!jobNo){
    jobNo = jobCards.find(j=> j.id === jcId)?.jobNo || nextNo("JC-", jobCards, "jobNo");
  }
  const status = document.getElementById("jcStatus")?.value || "Open";
  const payload = {
    jobNo,
    jobDate: document.getElementById("jcDate")?.value || today(),
    status,
    customer,
    customerId: cust?.id || "",
    vehicle,
    mileageIn: num(document.getElementById("jcMileage")?.value),
    advisor: document.getElementById("jcAdvisor")?.value?.trim() || "",
    technician: document.getElementById("jcTechnician")?.value?.trim() || "",
    complaint,
    diagnosis: document.getElementById("jcDiagnosis")?.value?.trim() || "",
    notes: document.getElementById("jcNotes")?.value?.trim() || "",
    items: calc.items,
    partsTotal: calc.partsTotal,
    labourTotal: calc.labourTotal,
    vatTotal: calc.vatTotal,
    grandTotal: calc.grandTotal,
    branchId: getCurrentBranchId(),
    ...masterMeta()
  };
  _jcSaving = true;
  try{
    if(jcId){
      await updateDoc(doc(db(), "jobCards", jcId), payload);
      await logActivity({
        module: "workshop",
        action: "update",
        record: jobNo,
        recordId: jcId,
        newValue: { status, grandTotal: calc.grandTotal }
      });
      toast("Job card updated");
    }else{
      const ref = await addDoc(col("jobCards"), { ...payload, ...masterCreateMeta() });
      await logActivity({
        module: "workshop",
        action: "create",
        record: jobNo,
        recordId: ref.id,
        newValue: { customer, vehicle, status }
      });
      toast("Job card saved");
    }
    leaveFormAfterSave("jobCardModal");
  }catch(e){
    toast(friendlyFirestoreError(e));
  }finally{
    _jcSaving = false;
  }
}

function onJcEntryTypeChange(){
  const lineType = document.getElementById("jcEntryType")?.value;
  const nameEl = document.getElementById("jcEntryName");
  if(nameEl){
    nameEl.placeholder = lineType === "labour"
      ? "Service / labour description…"
      : "Type product name…";
  }
}

function tryPickServiceFromEntry(){
  const lineType = document.getElementById("jcEntryType")?.value;
  if(lineType !== "labour") return;
  const name = document.getElementById("jcEntryName")?.value?.trim() || "";
  const code = document.getElementById("jcEntryCode")?.value?.trim() || "";
  const svc = services().find(s=>
    (name && String(s.name || "").trim().toLowerCase() === name.toLowerCase())
    || (code && String(s.code || "").trim().toLowerCase() === code.toLowerCase())
  );
  if(!svc) return;
  const rateEl = document.getElementById("jcEntryRate");
  if(rateEl && !num(rateEl.value)) rateEl.value = num(svc.rate ?? svc.price);
  const vatEl = document.getElementById("jcEntryVat");
  if(vatEl && !num(vatEl.value)) vatEl.value = num(svc.vatPct ?? shopDefaultVat());
}

function tryPickProductFromEntry(){
  const lineType = document.getElementById("jcEntryType")?.value;
  if(lineType !== "part") return;
  const draft = readJcEntryDraft();
  const product = findProductForLine(draft);
  if(!product) return;
  const rateEl = document.getElementById("jcEntryRate");
  if(rateEl && !num(rateEl.value)) rateEl.value = num(product.cost ?? product.price ?? product.rate);
}

function issueableJobs(){
  return jobCards.filter(j=>{
    const st = String(j.status || "Open");
    if(st === "Cancelled" || st === "Completed") return false;
    return (j.items || []).some(it=> it.lineType !== "labour" && num(it.qty) > num(it.issuedQty));
  });
}

function fillJpiJobSelect(selectedId){
  const sel = document.getElementById("jpiJob");
  if(!sel) return;
  const jobs = issueableJobs();
  const keep = selectedId || sel.value || "";
  sel.innerHTML = `<option value="">Select job card…</option>` + jobs.map(j=>
    `<option value="${esc(j.id)}">${esc(j.jobNo)} — ${esc(j.customer)} — ${esc(j.vehicle)}</option>`
  ).join("");
  if(keep && [...sel.options].some(o=> o.value === keep)) sel.value = keep;
}

function loadPartsIssueFromJob(){
  const jobId = document.getElementById("jpiJob")?.value || "";
  const job = jobCards.find(j=> j.id === jobId);
  const custEl = document.getElementById("jpiCustomer");
  const vehEl = document.getElementById("jpiVehicle");
  if(custEl) custEl.value = job?.customer || "";
  if(vehEl) vehEl.value = job?.vehicle || "";
  if(!job){
    _jpiLines = [];
    renderJpiLines();
    return;
  }
  _jpiLines = (job.items || [])
    .map((it, jobLineIndex)=> ({ ...normalizeJcLine(it), jobLineIndex }))
    .filter(it=> it.lineType === "part")
    .map(it=>{
      const remaining = roundMoney(Math.max(0, it.qty - num(it.issuedQty)));
      return { ...it, remaining, issueQty: remaining };
    })
    .filter(it=> it.remaining > 0);
  renderJpiLines();
}

function renderJpiLines(){
  const tbody = document.getElementById("jpiItemRows");
  if(!tbody) return;
  if(!_jpiLines.length){
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Select a job card with unissued parts</td></tr>`;
    return;
  }
  tbody.innerHTML = _jpiLines.map((it, idx)=> `<tr>
    <td>${esc(it.name)}</td>
    <td>${esc(it.code)}</td>
    <td class="num">${esc(it.qty)}</td>
    <td class="num">${esc(it.issuedQty || 0)}</td>
    <td class="num">${esc(it.remaining)}</td>
    <td><input class="jpi-issue-qty" data-jpi-idx="${idx}" type="number" min="0" step="0.01" max="${it.remaining}" value="${it.issueQty}"></td>
  </tr>`).join("");
  tbody.querySelectorAll(".jpi-issue-qty").forEach(inp=>{
    inp.addEventListener("input", ()=>{
      const i = Number(inp.dataset.jpiIdx);
      if(!_jpiLines[i]) return;
      _jpiLines[i].issueQty = Math.max(0, Math.min(num(inp.value), num(_jpiLines[i].remaining)));
    });
  });
}

function resetPartsIssue(){
  const no = document.getElementById("jpiNo");
  if(no) no.value = nextNo("JPI-", partsIssues, "issueNo");
  const dt = document.getElementById("jpiDate");
  if(dt) dt.value = today();
  document.getElementById("jpiNotes") && (document.getElementById("jpiNotes").value = "");
  ctx.fillWarehouseSelect?.(document.getElementById("jpiStockLoc"), "Main");
  fillJpiJobSelect(_jpiPrefillJobId);
  if(_jpiPrefillJobId){
    const sel = document.getElementById("jpiJob");
    if(sel) sel.value = _jpiPrefillJobId;
    _jpiPrefillJobId = "";
  }
  loadPartsIssueFromJob();
}

export function preparePartsIssueModal(){
  resetPartsIssue();
}

export function openPartsIssueForJob(jobId){
  const job = jobCards.find(j=> j.id === jobId);
  const has = (job?.items || []).some(it=> it.lineType !== "labour" && num(it.qty) > num(it.issuedQty));
  if(!has) return toast("No unissued parts on this job");
  _jpiPrefillJobId = jobId || "";
  openFormModal("partsIssueModal");
}

export function onPartsIssuesLoaded(rows){
  partsIssues = rows || [];
  renderPartsIssues();
}

export function renderPartsIssues(){
  const tbody = document.getElementById("partsIssueRows");
  if(!tbody) return;
  const q = (document.getElementById("partsIssueSearch")?.value || "").trim().toLowerCase();
  let rows = [...partsIssues].sort((a, b)=> String(b.issueDate || "").localeCompare(String(a.issueDate || "")));
  if(q){
    rows = rows.filter(r=>{
      const hay = [r.issueNo, r.jobNo, r.customer, r.vehicle, r.status]
        .map(x=> String(x || "").toLowerCase()).join(" ");
      return hay.includes(q);
    });
  }
  if(!rows.length){
    tbody.innerHTML = `<tr><td colspan="8" class="empty">${partsIssues.length ? "No matches" : "No parts issues yet"}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r=> `<tr>
    <td>${esc(r.issueNo)}</td>
    <td>${esc(r.issueDate || "")}</td>
    <td>${esc(r.jobNo)}</td>
    <td>${esc(r.customer)}</td>
    <td>${esc(r.vehicle)}</td>
    <td class="num">${esc(r.totalQty ?? 0)}</td>
    <td>${esc(r.warehouseId || "")}</td>
    <td>${badge(r.status || "Posted")}</td>
  </tr>`).join("");
}

async function savePartsIssue(){
  if(!requireModule("workshop")) return;
  if(_jpiSaving) return toast("Save already in progress…");
  const jobId = document.getElementById("jpiJob")?.value || "";
  const job = jobCards.find(j=> j.id === jobId);
  if(!job) return toast("Select job card");
  const warehouseId = document.getElementById("jpiStockLoc")?.value || "Main";
  const items = _jpiLines
    .map(it=> ({ ...it, qty: num(it.issueQty) }))
    .filter(it=> it.qty > 0);
  if(!items.length) return toast("Enter issue qty on at least one part");
  const over = items.find(it=> it.qty > num(it.remaining) + 0.0001);
  if(over) return toast(`Issue qty exceeds remaining for ${over.name}`);
  const unmatched = items.find(it=> !findProductForLine(it)?.id);
  if(unmatched) return toast(`Not in Product Master: ${unmatched.name || unmatched.code}`);
  const issueSerial = await allocateDocSerial("parts_issue", "JPI-", {
    list: partsIssues, field: "issueNo", draftValue: document.getElementById("jpiNo")?.value, preferCounter: true
  });
  const issueNo = issueSerial.value;
  document.getElementById("jpiNo").value = issueNo;
  const payload = {
    issueNo,
    issueDate: document.getElementById("jpiDate")?.value || today(),
    jobCardId: job.id,
    jobNo: job.jobNo,
    customer: job.customer || "",
    vehicle: job.vehicle || "",
    warehouseId,
    notes: document.getElementById("jpiNotes")?.value?.trim() || "",
    items: items.map(it=> ({
      name: it.name, code: it.code, productId: it.productId || "",
      qty: it.qty, lineType: "part"
    })),
    totalQty: roundMoney(items.reduce((s, it)=> s + it.qty, 0)),
    status: "Posted",
    branchId: getCurrentBranchId() || "",
    ...masterMeta()
  };
  const nextJobItems = (job.items || []).map(normalizeJcLine);
  items.forEach(hit=>{
    const line = nextJobItems[hit.jobLineIndex];
    if(!line || line.lineType !== "part") return;
    line.issuedQty = roundMoney(num(line.issuedQty) + hit.qty);
  });
  _jpiSaving = true;
  try{
    await validateStockForLines(items, warehouseId, -1);
    await applyJobIssueStockDelta(items, warehouseId, -1, issueNo);
    try{
      const ref = await addDoc(col("partsIssues"), { ...payload, ...masterCreateMeta() });
      const jobPatch = {
        items: nextJobItems,
        updatedAt: Date.now(),
        updatedBy: who()
      };
      const st = String(job.status || "Open");
      if(st === "Draft" || st === "Open") jobPatch.status = "In Progress";
      await updateDoc(doc(db(), "jobCards", job.id), jobPatch);
      await logActivity({
        module: "workshop",
        action: "create",
        record: issueNo,
        recordId: ref.id,
        newValue: { jobNo: job.jobNo, totalQty: payload.totalQty, warehouseId }
      });
      toast("Parts issued — stock updated");
      leaveFormAfterSave("partsIssueModal");
    }catch(docErr){
      await applyJobIssueStockDelta(items, warehouseId, 1, issueNo);
      throw docErr;
    }
  }catch(e){
    toast(inventoryErrorText(e?.message || e) || friendlyFirestoreError(e));
  }finally{
    _jpiSaving = false;
  }
}

export function wireWorkshopUi(){
  document.getElementById("saveJobCardBtn")?.addEventListener("click", saveJobCard);
  document.getElementById("jobCardSearch")?.addEventListener("input", renderJobCards);
  document.getElementById("jcCustomer")?.addEventListener("change", filterVehiclesForJobCard);
  document.getElementById("jcEntryType")?.addEventListener("change", onJcEntryTypeChange);
  document.getElementById("jcAddLineBtn")?.addEventListener("click", commitJcEntryLine);
  document.getElementById("jcEntryName")?.addEventListener("blur", ()=>{
    tryPickServiceFromEntry();
    tryPickProductFromEntry();
  });
  document.getElementById("jcEntryCode")?.addEventListener("blur", ()=>{
    tryPickServiceFromEntry();
    tryPickProductFromEntry();
  });
  ["jcEntryName","jcEntryCode","jcEntryQty","jcEntryRate"].forEach(id=>{
    document.getElementById(id)?.addEventListener("keydown", e=>{
      if(e.key === "Enter"){
        e.preventDefault();
        commitJcEntryLine();
      }
    });
  });
  const filters = document.getElementById("jobCardFilters");
  if(filters && !filters._jcBound){
    filters._jcBound = true;
    filters.addEventListener("click", e=>{
      const btn = e.target.closest("button[data-status]");
      if(!btn) return;
      filters.querySelectorAll("button").forEach(b=> b.classList.toggle("active", b === btn));
      renderJobCards();
    });
  }
  document.getElementById("savePartsIssueBtn")?.addEventListener("click", savePartsIssue);
  document.getElementById("partsIssueSearch")?.addEventListener("input", renderPartsIssues);
  document.getElementById("jpiJob")?.addEventListener("change", loadPartsIssueFromJob);
  document.getElementById("jcIssuePartsBtn")?.addEventListener("click", ()=>{
    const id = document.getElementById("jcId")?.value || "";
    if(!id) return toast("Save the job card first");
    closeModal("jobCardModal");
    openPartsIssueForJob(id);
  });
  document.getElementById("jcCreateInvoiceBtn")?.addEventListener("click", ()=>{
    const id = document.getElementById("jcId")?.value || "";
    if(!id) return toast("Save the job card first");
    createInvoiceFromJob(id);
  });
}

/** After invoice save/post: store invoice no on the job; Posted → Completed. */
export async function linkJobCardToInvoice({ jobCardId, invoiceId, invoiceNo, posted }){
  if(!jobCardId || !invoiceId) return;
  const job = jobCards.find(j=> j.id === jobCardId);
  const patch = {
    invoiceId,
    invoiceNo: invoiceNo || "",
    updatedAt: Date.now(),
    updatedBy: who()
  };
  if(posted && String(job?.status || "") !== "Cancelled"){
    patch.status = "Completed";
  }
  await updateDoc(doc(db(), "jobCards", jobCardId), patch);
}

/** If the linked invoice is deleted, clear the job pointer. */
export async function unlinkJobCardInvoice(jobCardId, invoiceId){
  if(!jobCardId) return;
  const job = jobCards.find(j=> j.id === jobCardId);
  if(!job) return;
  if(invoiceId && job.invoiceId && job.invoiceId !== invoiceId) return;
  const patch = {
    invoiceId: "",
    invoiceNo: "",
    updatedAt: Date.now(),
    updatedBy: who()
  };
  if(String(job.status) === "Completed") patch.status = "In Progress";
  await updateDoc(doc(db(), "jobCards", jobCardId), patch);
}
