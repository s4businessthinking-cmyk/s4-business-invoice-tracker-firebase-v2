// Real client-side PDF generation (jsPDF + autotable), offline-vendored.
// Print (printHtmlDocument) stays HTML → browser print dialog / Android share.
// This module is only for download/share flows that must produce .pdf files.

import { deliverBlob, isAndroidNative } from "./file-delivery.js";

let jspdfReady = null;

function loadScript(src){
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-s4-pdf="${src}"]`);
    if(existing){
      if(existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load " + src)));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.s4Pdf = src;
    s.onload = () => { s.dataset.loaded = "1"; resolve(); };
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export async function ensureJsPdf(){
  if(window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  if(!jspdfReady){
    jspdfReady = (async () => {
      await loadScript("./vendor/jspdf.umd.min.js");
      await loadScript("./vendor/jspdf.plugin.autotable.min.js");
      if(!window.jspdf?.jsPDF) throw new Error("jsPDF failed to initialize");
      return window.jspdf.jsPDF;
    })();
  }
  return jspdfReady;
}

function moneyFmt(currency, n){
  const cur = currency || "AED";
  return cur + " " + (Number(n) || 0).toLocaleString("en-AE", { maximumFractionDigits: 2 });
}

export async function shareOrDownloadPdf(filename, blob, title){
  const name = filename.toLowerCase().endsWith(".pdf") ? filename : filename + ".pdf";
  return deliverBlob(name, blob, title || name);
}

function addHeader(doc, shopName, title, subtitle){
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(shopName || "S4 Invoice Tracker"), 14, 16);
  doc.setFontSize(12);
  doc.text(String(title || ""), 14, 24);
  if(subtitle){
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(String(subtitle), 14, 30);
    doc.setTextColor(0);
  }
}

export async function buildInvoicePdfBlob(inv, shop = {}){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = shop.currency || "AED";
  const sub = [
    inv.customer || "",
    inv.invDate || "",
    inv.dueDate ? "Due " + inv.dueDate : "",
    inv.vehicle ? "Vehicle " + inv.vehicle : ""
  ].filter(Boolean).join(" · ");
  addHeader(doc, shop.name, inv.invNo || "Invoice", sub);
  let y = 36;
  const meta = [];
  if(inv.computerNo) meta.push("Computer " + inv.computerNo);
  if(inv.manualNo) meta.push("Manual " + inv.manualNo);
  if(meta.length){
    doc.setFontSize(9);
    doc.text(meta.join(" · "), 14, y);
    y += 6;
  }
  const rows = (inv.items || []).map(it => [
    it.name || "",
    String(it.qty ?? ""),
    String(it.price ?? ""),
    String(it.disc ?? ""),
    String(it.vat ?? ""),
    moneyFmt(cur, it.line)
  ]);
  doc.autoTable({
    startY: y,
    head: [["Item", "Qty", "Price", "Disc", "VAT%", "Line"]],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 52, 74] }
  });
  y = (doc.lastAutoTable?.finalY || y) + 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total ${moneyFmt(cur, inv.total)} · Paid ${moneyFmt(cur, inv.paid)} · Balance ${moneyFmt(cur, Math.max(0, Number(inv.total) - Number(inv.paid || 0) - Number(inv.credited || 0)))}`,
    14,
    y
  );
  return doc.output("blob");
}

export async function buildStatementPdfBlob({ shop = {}, name, asOf, from, lines, closing }){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = shop.currency || "AED";
  const parts = [];
  if(from) parts.push("From " + from);
  parts.push("As of " + (asOf || ""));
  parts.push("Closing " + moneyFmt(cur, closing));
  addHeader(doc, shop.name, `Statement — ${name || ""}`, parts.join(" · "));
  const rows = (lines || []).map(r => [
    r[0], r[1], r[2],
    r[3] === "" || r[3] == null ? "" : moneyFmt(cur, r[3]),
    r[4] === "" || r[4] == null ? "" : moneyFmt(cur, r[4]),
    moneyFmt(cur, r[5])
  ]);
  doc.autoTable({
    startY: 36,
    head: [["Date", "Reference", "Description", "Debit", "Credit", "Balance"]],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 52, 74] }
  });
  return doc.output("blob");
}

export async function buildReceiptPdfBlob(r, shop = {}){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = shop.currency || "AED";
  const status = String(r.status || "Posted");
  const isDead = /^(Cancelled|Voided|Bounced)$/i.test(status);
  addHeader(
    doc,
    shop.name,
    r.rvNo || "Receipt",
    [r.customer, r.date, r.method].filter(Boolean).join(" · ")
  );
  let y = 36;
  if(isDead){
    doc.setFillColor(254, 226, 226);
    doc.rect(14, y, 182, 12, "F");
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(status.toUpperCase(), 105, y + 8, { align: "center" });
    doc.setTextColor(0);
    y += 18;
  }else{
    y = 40;
  }
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const lines = [
    `Amount: ${moneyFmt(cur, r.amount)}`,
    `Allocated: ${moneyFmt(cur, r.allocated)}`,
    `Unallocated: ${moneyFmt(cur, r.unallocated)}`,
    `Status: ${status}`,
    `Ref: ${r.ref || r.chequeNo || "—"}`
  ];
  if(r.chequeNo) lines.push(`Cheque: ${r.chequeNo}${r.bank ? " · " + r.bank : ""}`);
  if(r.discount) lines.push(`Discount: ${moneyFmt(cur, r.discount)}`);
  if(isDead){
    lines.push("");
    lines.push("This receipt is not valid for payment / allocation.");
  }
  lines.forEach(line => {
    if(line === ""){ y += 3; return; }
    doc.text(line, 14, y);
    y += 7;
  });
  return doc.output("blob");
}

export async function buildReminderPdfBlob(shop = {}, name, message){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, shop.name, "Payment Reminder", name || "");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const text = String(message || "");
  const wrapped = doc.splitTextToSize(text, 180);
  doc.text(wrapped, 14, 40);
  return doc.output("blob");
}

export async function buildTablePdfBlob({ shop = {}, title, subtitle, headers, rows }){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addHeader(doc, shop.name, title || "Report", subtitle || "");
  doc.autoTable({
    startY: 36,
    head: [headers || []],
    body: rows || [],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 52, 74] }
  });
  return doc.output("blob");
}

export async function downloadInvoicePdf(inv, shop){
  const blob = await buildInvoicePdfBlob(inv, shop);
  return shareOrDownloadPdf(`${inv.invNo || "invoice"}.pdf`, blob, inv.invNo);
}

export async function downloadStatementPdf(opts){
  const blob = await buildStatementPdfBlob(opts);
  const safe = String(opts.name || "customer").replace(/\s+/g, "_");
  return shareOrDownloadPdf(`statement-${safe}.pdf`, blob, `Statement — ${opts.name}`);
}

export async function downloadReceiptPdf(r, shop){
  const blob = await buildReceiptPdfBlob(r, shop);
  return shareOrDownloadPdf(`${r.rvNo || "receipt"}.pdf`, blob, r.rvNo);
}

export async function downloadReminderPdf(shop, name, message){
  const blob = await buildReminderPdfBlob(shop, name, message);
  const safe = String(name || "customer").replace(/\s+/g, "_");
  return shareOrDownloadPdf(`reminder-${safe}.pdf`, blob, "Payment Reminder");
}

export async function downloadTablePdf({ shop, title, subtitle, headers, rows, filename }){
  const blob = await buildTablePdfBlob({ shop, title, subtitle, headers, rows });
  const name = (filename || title || "report").replace(/\s+/g, "_") + ".pdf";
  return shareOrDownloadPdf(name, blob, title);
}

export { isAndroidNative };
