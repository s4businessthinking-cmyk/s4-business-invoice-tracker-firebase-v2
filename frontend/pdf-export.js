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

export async function buildStatementPdfBlob({
  shop = {}, name, asOf, from, lines, closing, customer, subFilter, lineMeta, odFrom,
  periodNet, periodDebit, periodCredit, bySub, periodLines, periodLabel, showPeriodTxns
}){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = shop.currency || "AED";
  const c = customer || {};

  // Shop brand strip
  doc.setFillColor(34, 52, 74);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(String(shop.name || "S4 Invoice Tracker"), 14, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const shopBits = [shop.phone, shop.email, shop.trn ? "TRN " + shop.trn : ""].filter(Boolean).join("  ·  ");
  if(shopBits) doc.text(shopBits, 14, 17);
  doc.setTextColor(0, 0, 0);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("CUSTOMER ACCOUNT STATEMENT", 14, 32);

  // Customer details card (dynamic height)
  let y = 36;
  const leftMeta = [
    c.code ? `Code: ${c.code}` : "",
    c.contact ? `Contact: ${c.contact}` : "",
    c.mobile ? `Mobile: ${c.mobile}` : "",
    c.whatsapp && c.whatsapp !== c.mobile ? `WhatsApp: ${c.whatsapp}` : ""
  ].filter(Boolean);
  const rightMeta = [
    c.trn ? `TRN: ${c.trn}` : "",
    c.email ? `Email: ${c.email}` : "",
    c.type ? `Type: ${c.type}` : "",
    c.salesman ? `Salesman: ${c.salesman}` : ""
  ].filter(Boolean);
  const addrLines = c.addr ? doc.splitTextToSize("Address: " + c.addr, 174) : [];
  const metaRows = Math.max(leftMeta.length, rightMeta.length, 1);
  const cardH = 12 + metaRows * 4.2 + (addrLines.length ? addrLines.length * 4 + 2 : 0) + 4;
  doc.setDrawColor(180, 190, 210);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, cardH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const partyTitle = subFilter ? `${name || ""}  ·  ${subFilter}` : (name || "");
  doc.text(partyTitle, 18, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  let ly = y + 14;
  leftMeta.forEach(line => { doc.text(line, 18, ly); ly += 4.2; });
  let ry = y + 14;
  rightMeta.forEach(line => { doc.text(line, 110, ry); ry += 4.2; });
  if(addrLines.length){
    doc.text(addrLines, 18, Math.max(ly, ry) + 1);
  }
  doc.setTextColor(0, 0, 0);

  y = 36 + cardH + 4;
  // Period strip (dates only — totals below table)
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, y, 182, 12, 1.5, 1.5, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const period = [
    from ? `From ${from}` : null,
    `As of ${asOf || ""}`
  ].filter(Boolean).join("   ·   ");
  doc.text(period, 18, y + 8);

  const odColors = {
    d30: [254, 249, 195],
    d60: [255, 237, 213],
    d90: [254, 215, 170],
    d90p: [254, 202, 202]
  };
  const meta = lineMeta || [];
  const rows = (lines || []).map(r => [
    r[0],
    String(r[1] || "").replace(/\n/g, " | "),
    r[2],
    r[3] || "",
    r[4] === "" || r[4] == null ? "" : moneyFmt(cur, r[4]),
    r[5] === "" || r[5] == null ? "" : moneyFmt(cur, r[5]),
    moneyFmt(cur, r[6]),
    r[7] || ""
  ]);

  doc.autoTable({
    startY: y + 16,
    head: [["Date", "Reference", "Description", "Sub-account", "Debit", "Credit", "Balance", "Overdue"]],
    body: rows,
    styles: { fontSize: 7.5, cellPadding: 1.6, valign: "middle" },
    headStyles: { fillColor: [34, 52, 74], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      1: { cellWidth: 32 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      7: { halign: "center", fontStyle: "bold" }
    },
    didParseCell(data){
      if(data.section !== "body") return;
      const m = meta[data.row.index];
      const bucket = m?.bucket;
      if(bucket && odColors[bucket]){
        data.cell.styles.fillColor = odColors[bucket];
      }
    }
  });

  // Period totals + invoice breakdown (below table)
  let sumY = (doc.lastAutoTable?.finalY || y + 16) + 10;
  const pDebit = num(periodDebit);
  const pCredit = num(periodCredit);
  const pNet = periodNet != null && periodNet !== "" ? num(periodNet) : (pDebit - pCredit);
  const pLines = periodLines || [];
  const subMap = bySub || {};
  const subKeys = Object.keys(subMap);
  const netLabel = from ? "Net this period" : "Net up to AS OF";
  const includeTxns = !!showPeriodTxns;
  const drawBox = (topY, height)=>{
    doc.setDrawColor(180, 190, 210);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, topY, 182, height, 2, 2, "FD");
  };
  const drawSummaryLine = (text, bold = false, rightAmt = null, indent = 18)=>{
    if(sumY > 272){
      doc.addPage();
      sumY = 20;
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9.5 : 8.5);
    doc.setTextColor(bold ? 0 : 55, bold ? 0 : 65, bold ? 0 : 81);
    const wrapped = doc.splitTextToSize(String(text || ""), rightAmt == null ? 174 : 130);
    doc.text(wrapped, indent, sumY);
    if(rightAmt != null) doc.text(moneyFmt(cur, rightAmt), 188, sumY, { align: "right" });
    sumY += wrapped.length * 4.2 + (bold ? 1.2 : 0.6);
  };
  doc.setDrawColor(180, 190, 210);
  doc.line(14, sumY - 2, 196, sumY - 2);
  sumY += 4;

  // Period summary box
  let boxTop = sumY;
  sumY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("PERIOD SUMMARY", 18, sumY);
  sumY += 5;
  if(periodLabel) drawSummaryLine(`Period: ${periodLabel}`);
  if(!from) drawSummaryLine(`Note: FROM date not set — all transactions up to ${asOf || ""} are included.`);
  drawSummaryLine(`Invoices / charges: ${moneyFmt(cur, pDebit)}`);
  drawSummaryLine(`Received / credits: ${moneyFmt(cur, pCredit)}`);
  drawSummaryLine(`${netLabel}: ${moneyFmt(cur, pNet)}`, true);
  drawBox(boxTop, sumY - boxTop + 3);
  sumY += 8;

  // Transactions box (optional) — one box per line
  if(includeTxns && pLines.length){
    boxTop = sumY;
    sumY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("TRANSACTIONS IN THIS PERIOD", 18, sumY);
    sumY += 5;
    pLines.forEach(l=>{
      const amt = num(l.debit) > 0 ? num(l.debit) : num(l.credit);
      const refBits = [l.ref || "", l.manualNo ? `Manual: ${l.manualNo}` : "", l.computerNo ? `PC: ${l.computerNo}` : ""].filter(Boolean);
      const subBit = l.subAccount ? ` · ${l.subAccount}` : "";
      const txnTop = sumY - 1;
      drawSummaryLine(`${l.date || ""} · ${refBits.join(" · ")} · ${l.desc || ""}${subBit}`, false, amt, 20);
      doc.setDrawColor(200, 208, 220);
      doc.roundedRect(16, txnTop, 178, sumY - txnTop + 1, 1.5, 1.5, "S");
      sumY += 3;
    });
    drawBox(boxTop, sumY - boxTop + 2);
    sumY += 8;
  }

  // Sub-account boxes
  if(!subFilter && subKeys.length){
    boxTop = sumY;
    sumY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("SUB-ACCOUNT SUMMARY", 18, sumY);
    sumY += 5;
    subKeys.sort((a,b)=> a.localeCompare(b)).forEach(sk=>{
      const x = subMap[sk];
      const subTop = sumY - 1;
      drawSummaryLine(sk, true, null, 20);
      drawSummaryLine(`In ${moneyFmt(cur, x.debit)} · Out ${moneyFmt(cur, x.credit)} · Net ${moneyFmt(cur, x.net)}`, false, null, 20);
      doc.setDrawColor(200, 208, 220);
      doc.roundedRect(16, subTop, 178, sumY - subTop + 1, 1.5, 1.5, "S");
      sumY += 3;
    });
    drawBox(boxTop, sumY - boxTop + 2);
    sumY += 8;
  }

  // Closing balance box
  boxTop = sumY;
  sumY += 7;
  drawSummaryLine(`Closing balance (as of ${asOf || ""}): ${moneyFmt(cur, closing)}`, true);
  drawBox(boxTop, sumY - boxTop + 4);
  sumY += 10;
  doc.setTextColor(0, 0, 0);

  // Legend
  let legY = sumY + 4;
  if(num(odFrom) > 0){
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Overdue highlight from ${odFrom}+ days  ·  Yellow 1–30  ·  Orange 31–60  ·  Deep 61–90  ·  Red 90+`, 14, legY);
    doc.setTextColor(0);
  }
  return doc.output("blob");
}

function num(n){ return Number(n) || 0; }

export async function buildReceiptPdfBlob(r, shop = {}, { billRows = [] } = {}){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = shop.currency || "AED";
  const status = String(r.status || "Posted");
  const isDead = /^(Cancelled|Voided|Bounced)$/i.test(status);
  const collectedBy = r.collectedBy || r.createdBy || r.updatedBy || "";
  addHeader(
    doc,
    shop.name,
    "Receipt Voucher " + (r.rvNo || ""),
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
  }
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const lines = [
    `Receipt No: ${r.rvNo || "—"}`,
    `Date: ${r.date || "—"}`,
    `Customer: ${r.customer || "—"}`,
    collectedBy ? `Collected by: ${collectedBy}` : "",
    `Mode: ${r.method || "Cash"}`,
    `Amount received: ${moneyFmt(cur, r.amount)}`,
    `Discount: ${moneyFmt(cur, r.discount || 0)}`,
    `Allocated: ${moneyFmt(cur, r.allocated)}`,
    `Unallocated / advance: ${moneyFmt(cur, r.unallocated)}`,
    `Status: ${status}`
  ].filter(Boolean);
  if(r.ref) lines.push(`Narration: ${r.ref}`);
  if(r.chequeNo){
    let chq = `Cheque: ${r.chequeNo}`;
    if(r.bank) chq += ` · Bank: ${r.bank}`;
    if(r.chequeDate) chq += ` · Dated: ${r.chequeDate}`;
    if(r.pdcDate) chq += ` · PDC: ${r.pdcDate}`;
    lines.push(chq);
  }
  if(isDead) lines.push("This receipt is not valid for payment / allocation.");
  lines.forEach(line => {
    doc.text(line, 14, y);
    y += 6;
  });
  const rows = (billRows || []).map(b=> [
    b.invNo || "",
    b.invDate || "",
    moneyFmt(cur, b.billAmount),
    moneyFmt(cur, b.received)
  ]);
  const totalBill = (billRows || []).reduce((s, b)=> s + (Number(b.billAmount) || 0), 0);
  const totalRecv = (billRows || []).reduce((s, b)=> s + (Number(b.received) || 0), 0);
  if(rows.length){
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Bills Received Against", 14, y);
    y += 2;
    doc.autoTable({
      startY: y + 2,
      head: [["Bill No", "Bill Date", "Bill Amount", "Received Amt"]],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [45, 90, 142] },
      foot: [["Total", "", moneyFmt(cur, totalBill), moneyFmt(cur, totalRecv)]],
      footStyles: { fillColor: [220, 232, 245], textColor: [23, 32, 51], fontStyle: "bold" }
    });
  }
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

export async function downloadReceiptPdf(r, shop, opts = {}){
  const blob = await buildReceiptPdfBlob(r, shop, opts);
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
