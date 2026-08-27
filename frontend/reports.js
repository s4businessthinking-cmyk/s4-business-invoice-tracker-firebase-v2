// ============================================================
// REPORTS — monthly + annual (#5), CSV export (#6), due aging (#7)
// ------------------------------------------------------------
// ৫ ধরনের রিপোর্ট (মাসিক/বার্ষিক):
//   1) সারাংশ (Summary)
//   2) কাস্টমার অনুযায়ী (By Customer)
//   3) স্ট্যাটাস অনুযায়ী (Paid / Pending / Partial)
//   4) সংগ্রহ / Collections (paidDate অনুযায়ী)
//   5) বাকি তালিকা (Outstanding dues)
// Extra: Staff-wise breakdown, Due aging buckets
// ============================================================

import { deliverBlob } from "./file-delivery.js";

function parseYmd(s){
  if(!s) return null;
  const d = new Date(String(s).slice(0, 10) + "T00:00:00");
  return isNaN(d) ? null : d;
}

function inMonth(invDateStr, year, monthIndex0){
  const d = parseYmd(invDateStr);
  if(!d) return false;
  return d.getFullYear() === year && d.getMonth() === monthIndex0;
}

function inYear(invDateStr, year){
  const d = parseYmd(invDateStr);
  if(!d) return false;
  return d.getFullYear() === year;
}

function paidInMonth(inv, year, monthIndex0){
  const d = parseYmd(inv.paidDate);
  if(!d) return false;
  return d.getFullYear() === year && d.getMonth() === monthIndex0;
}

function paidInYear(inv, year){
  const d = parseYmd(inv.paidDate);
  if(!d) return false;
  return d.getFullYear() === year;
}

export function statusOf(inv){
  const due = Math.max(0, (Number(inv.total) || 0) - (Number(inv.paid) || 0) - (Number(inv.credited) || 0));
  if(due <= 0.009) return "Paid";
  if((!inv.paid || Number(inv.paid) === 0) && (!inv.credited || Number(inv.credited) === 0)) return "Pending";
  return "Partial";
}

function sumInvoices(list){
  let total = 0, paid = 0, credited = 0, count = list.length;
  list.forEach(inv=>{
    total += Number(inv.total) || 0;
    paid += Number(inv.paid) || 0;
    credited += Number(inv.credited) || 0;
  });
  return { count, total, paid, credited, due: Math.max(0, total - paid - credited) };
}

function filterByPeriod(invoices, mode, year, monthIndex0){
  if(mode === "monthly"){
    return invoices.filter(inv => inMonth(inv.invDate, year, monthIndex0));
  }
  return invoices.filter(inv => inYear(inv.invDate, year));
}

function groupByCustomer(list){
  const map = {};
  list.forEach(inv=>{
    const k = inv.customer || "—";
    if(!map[k]) map[k] = [];
    map[k].push(inv);
  });
  return Object.keys(map).sort().map(name => ({ name, ...sumInvoices(map[name]), invoices: map[name] }));
}

function groupByStatus(list){
  const buckets = { Paid: [], Pending: [], Partial: [] };
  list.forEach(inv => buckets[statusOf(inv)].push(inv));
  return ["Paid", "Pending", "Partial"].map(st => ({ status: st, ...sumInvoices(buckets[st]) }));
}

function collectionsInPeriod(allInvoices, mode, year, monthIndex0){
  const list = allInvoices.filter(inv => {
    const paid = Number(inv.paid) || 0;
    if(paid <= 0) return false;
    return mode === "monthly" ? paidInMonth(inv, year, monthIndex0) : paidInYear(inv, year);
  });
  return { ...sumInvoices(list.map(inv => ({ ...inv, total: inv.paid, paid: inv.paid }))), invoices: list };
}

function outstandingDues(allInvoices){
  const list = allInvoices.filter(inv => statusOf(inv) !== "Paid");
  return { ...sumInvoices(list), invoices: list };
}

function staffBreakdown(list){
  const map = {};
  list.forEach(inv=>{
    const k = inv.updatedBy || inv.createdBy || "—";
    if(!map[k]) map[k] = { staff: k, count: 0, total: 0, paid: 0 };
    map[k].count++;
    map[k].total += Number(inv.total) || 0;
    map[k].paid += Number(inv.paid) || 0;
  });
  return Object.values(map).sort((a,b)=> b.total - a.total);
}

/** Due aging (#7) — days since invoice date for unpaid/partial */
export function dueAgingReport(allInvoices, asOf = new Date()){
  const buckets = [
    { label: "0–30 days", min: 0, max: 30, count: 0, due: 0 },
    { label: "31–60 days", min: 31, max: 60, count: 0, due: 0 },
    { label: "61–90 days", min: 61, max: 90, count: 0, due: 0 },
    { label: "90+ days", min: 91, max: Infinity, count: 0, due: 0 }
  ];
  allInvoices.forEach(inv=>{
    if(statusOf(inv) === "Paid") return;
    const d = parseYmd(inv.invDate);
    if(!d) return;
    const days = Math.floor((asOf - d) / (24 * 60 * 60 * 1000));
    const dueAmt = Math.max(0, (Number(inv.total) || 0) - (Number(inv.paid) || 0) - (Number(inv.credited) || 0));
    const bucket = buckets.find(b => days >= b.min && days <= b.max);
    if(bucket){ bucket.count++; bucket.due += dueAmt; }
  });
  return buckets;
}

export function buildReportBundle(invoices, mode, year, monthIndex0){
  const periodInvoices = filterByPeriod(invoices, mode, year, monthIndex0);
  const summary = sumInvoices(periodInvoices);
  const byCustomer = groupByCustomer(periodInvoices);
  const byStatus = groupByStatus(periodInvoices);
  const collections = collectionsInPeriod(invoices, mode, year, monthIndex0);
  const outstanding = outstandingDues(invoices);
  const byStaff = staffBreakdown(periodInvoices);
  const aging = dueAgingReport(invoices);

  const monthNamesEn = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const titleEn = mode === "monthly"
    ? `${monthNamesEn[monthIndex0]} ${year} — Monthly Report`
    : `${year} — Annual Report`;
  const titleBn = titleEn;

  return {
    mode, year, monthIndex0,
    titleBn, titleEn,
    summary,
    byCustomer,
    byStatus,
    collections,
    outstanding,
    byStaff,
    aging,
    periodInvoices
  };
}

export function fmtMoney(n, currency = "AED"){
  const cur = String(currency || "AED").replace(/[<>"'&\\/]/g, "").slice(0, 12) || "AED";
  return cur + " " + (Number(n) || 0).toLocaleString("en-AE", { maximumFractionDigits: 2 });
}

function escapeHtml(s){
  return String(s || "").replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

export function renderReportHtml(bundle, lang = "en", currency = "AED"){
  const money = (n)=> fmtMoney(n, currency);
  const title = bundle.titleEn || bundle.titleBn;
  const L = {
    s1: "1) Summary", s2: "2) By Customer", s3: "3) By Status",
    s4: "4) Collections (by paid date)", s5: "5) Outstanding Dues (all time)",
    s6: "Staff-wise (this period)", s7: "Due Aging (unpaid)",
    inv: "Invoices", total: "Total", paid: "Paid", due: "Due",
    customer: "Customer", status: "Status", staff: "Staff", count: "Count",
    bucket: "Age bucket", none: "None"
  };

  const s = bundle.summary;
  let html = `<div class="r-title">${escapeHtml(title)}</div>`;
  html += `<div class="r-section"><h3>${L.s1}</h3><table class="r-table"><tr><th>${L.inv}</th><th>${L.total}</th><th>${L.paid}</th><th>${L.due}</th></tr>`;
  html += `<tr><td>${s.count}</td><td>${money(s.total)}</td><td>${money(s.paid)}</td><td>${money(s.due)}</td></tr></table></div>`;

  html += `<div class="r-section"><h3>${L.s2}</h3><table class="r-table"><tr><th>${L.customer}</th><th>${L.inv}</th><th>${L.total}</th><th>${L.due}</th></tr>`;
  bundle.byCustomer.forEach(row=>{
    html += `<tr><td>${escapeHtml(row.name)}</td><td>${row.count}</td><td>${money(row.total)}</td><td>${money(row.due)}</td></tr>`;
  });
  if(!bundle.byCustomer.length) html += `<tr><td colspan="4">${L.none}</td></tr>`;
  html += `</table></div>`;

  html += `<div class="r-section"><h3>${L.s3}</h3><table class="r-table"><tr><th>${L.status}</th><th>${L.inv}</th><th>${L.total}</th><th>${L.due}</th></tr>`;
  bundle.byStatus.forEach(row=>{
    html += `<tr><td>${escapeHtml(row.status)}</td><td>${row.count}</td><td>${money(row.total)}</td><td>${money(row.due)}</td></tr>`;
  });
  html += `</table></div>`;

  html += `<div class="r-section"><h3>${L.s4}</h3><p>${L.inv}: ${bundle.collections.count} · ${L.paid}: ${money(bundle.collections.paid)}</p></div>`;

  html += `<div class="r-section"><h3>${L.s5}</h3><p>${L.inv}: ${bundle.outstanding.count} · ${L.due}: ${money(bundle.outstanding.due)}</p></div>`;

  html += `<div class="r-section"><h3>${L.s6}</h3><table class="r-table"><tr><th>${L.staff}</th><th>${L.inv}</th><th>${L.total}</th></tr>`;
  bundle.byStaff.forEach(row=>{
    html += `<tr><td>${escapeHtml(row.staff)}</td><td>${row.count}</td><td>${money(row.total)}</td></tr>`;
  });
  if(!bundle.byStaff.length) html += `<tr><td colspan="3">${L.none}</td></tr>`;
  html += `</table></div>`;

  html += `<div class="r-section"><h3>${L.s7}</h3><table class="r-table"><tr><th>${L.bucket}</th><th>${L.inv}</th><th>${L.due}</th></tr>`;
  bundle.aging.forEach(row=>{
    html += `<tr><td>${escapeHtml(row.label)}</td><td>${row.count}</td><td>${money(row.due)}</td></tr>`;
  });
  html += `</table></div>`;

  return html;
}

/** CSV export (#6) — period invoices */
export function invoicesToCsv(invoices, lang = "en"){
  const headers = lang === "en"
    ? ["Customer","Vehicle","Invoice No","Invoice Date","Paid Date","Total","Paid","Credited","Due","Status","Created By","Updated By","Notes"]
    : ["Customer","Vehicle","Invoice No","Invoice Date","Paid Date","Total","Paid","Credited","Due","Status","Created By","Updated By","Notes"];
  const rows = invoices.map(inv=>{
    const due = Math.max(0, (Number(inv.total)||0) - (Number(inv.paid)||0) - (Number(inv.credited)||0));
    return [
      inv.customer, inv.vehicle, inv.invNo, inv.invDate, inv.paidDate,
      inv.total, inv.paid, inv.credited || 0, due, statusOf(inv),
      inv.createdBy || "", inv.updatedBy || "", inv.notes || ""
    ];
  });
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))].join("\r\n");
}

export async function downloadTextFile(filename, text, mime = "text/csv;charset=utf-8"){
  const blob = new Blob(["\uFEFF" + text], { type: mime });
  return deliverBlob(filename, blob, filename);
}
