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
  shop = {}, name, asOf, from, lines, closing, opening, heldAmount, customer, subFilter, lineMeta, odFrom,
  periodNet, periodDebit, periodCredit, bySub, periodLines, periodLabel, showPeriodTxns,
  customerFacing = false
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
      }else if(m?.held){
        data.cell.styles.fillColor = [255, 247, 237];
      }
    }
  });

  // Period totals + invoice breakdown (below table)
  // IMPORTANT: draw filled boxes FIRST, then text — drawing FD after text paints over it
  // (that bug caused empty nested boxes / missing closing balance on multi-page PDFs).
  let sumY = (doc.lastAutoTable?.finalY || y + 16) + 8;
  const pDebit = num(periodDebit);
  const pCredit = num(periodCredit);
  const pNet = periodNet != null && periodNet !== "" ? num(periodNet) : (pDebit - pCredit);
  const pLines = periodLines || [];
  const subMap = bySub || {};
  const subKeys = Object.keys(subMap).sort((a,b)=> a.localeCompare(b));
  const netLabel = from ? "Net this period" : "Net up to AS OF";
  const includeTxns = !!showPeriodTxns;
  const forCustomer = !!customerFacing;
  const pageBottom = 285;

  const ensureSpace = (needMm)=>{
    if(sumY + needMm <= pageBottom) return;
    doc.addPage();
    sumY = 16;
  };

  const measureLines = (items, textWidth)=>{
    let h = 0;
    items.forEach(it=>{
      const wrapped = doc.splitTextToSize(String(it.text || ""), textWidth);
      h += wrapped.length * 4.2 + (it.bold ? 1 : 0.5);
    });
    return h;
  };

  const drawSectionCard = (title, items)=>{
    const textW = 170;
    const titleBlock = 7;
    const padY = 5;
    const bodyH = measureLines(items, textW);
    const h = padY + titleBlock + bodyH + padY;
    ensureSpace(h + 3);
    const top = sumY;
    doc.setDrawColor(180, 190, 210);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, top, 182, h, 2, 2, "FD");
    let ty = top + padY + 3.5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(String(title || "").toUpperCase(), 18, ty);
    ty += titleBlock - 1;
    items.forEach(it=>{
      doc.setFont("helvetica", it.bold ? "bold" : "normal");
      doc.setFontSize(it.bold ? 9.5 : 8.5);
      doc.setTextColor(it.bold ? 0 : 55, it.bold ? 0 : 65, it.bold ? 0 : 81);
      const wrapped = doc.splitTextToSize(String(it.text || ""), it.amt != null ? 128 : textW);
      doc.text(wrapped, 18, ty);
      if(it.amt != null){
        doc.text(moneyFmt(cur, it.amt), 188, ty, { align: "right" });
      }
      ty += wrapped.length * 4.2 + (it.bold ? 1 : 0.5);
    });
    sumY = top + h + 4;
    doc.setTextColor(0, 0, 0);
  };

  doc.setDrawColor(180, 190, 210);
  doc.setLineWidth(0.3);
  ensureSpace(6);
  doc.line(14, sumY, 196, sumY);
  sumY += 5;

  // Customer PDF/Print: only opening (if period) + closing — hide internal period/sub/held boxes.
  if(forCustomer){
    const balItems = [];
    if(from) balItems.push({ text: `Opening balance: ${moneyFmt(cur, opening)}` });
    balItems.push({ text: `Closing balance (as of ${asOf || ""}): ${moneyFmt(cur, closing)}`, bold: true });
    drawSectionCard("Account balance", balItems);
    return doc.output("blob");
  }

  const periodItems = [];
  if(periodLabel) periodItems.push({ text: `Period: ${periodLabel}` });
  if(!from) periodItems.push({ text: `Note: FROM date not set — all transactions up to ${asOf || ""} are included.` });
  periodItems.push({ text: `Invoices / charges: ${moneyFmt(cur, pDebit)}` });
  periodItems.push({ text: `Received / credits: ${moneyFmt(cur, pCredit)}` });
  periodItems.push({ text: `${netLabel}: ${moneyFmt(cur, pNet)}`, bold: true });
  drawSectionCard("Period summary", periodItems);

  if(includeTxns && pLines.length){
    // Compact list — no nested per-row boxes (those broke across page breaks)
    const txnItems = pLines.slice(0, 40).map(l=>{
      const amt = num(l.debit) > 0 ? num(l.debit) : num(l.credit);
      const refBits = [l.ref || "", l.manualNo ? `Manual: ${l.manualNo}` : "", l.computerNo ? `PC: ${l.computerNo}` : ""].filter(Boolean);
      const held = l.affectsBalance === false ? " [held]" : "";
      const subBit = l.subAccount ? ` · ${l.subAccount}` : "";
      return {
        text: `${l.date || ""} · ${refBits.join(" · ")} · ${l.desc || ""}${subBit}${held}`,
        amt
      };
    });
    if(pLines.length > 40){
      txnItems.push({ text: `… and ${pLines.length - 40} more transactions (see table above)` });
    }
    drawSectionCard("Transactions in this period", txnItems);
  }

  if(!subFilter && subKeys.length){
    const subItems = subKeys.map(sk=>{
      const x = subMap[sk] || { debit: 0, credit: 0, net: 0 };
      return {
        text: `${sk}: In ${moneyFmt(cur, x.debit)} · Out ${moneyFmt(cur, x.credit)} · Net ${moneyFmt(cur, x.net)}`
      };
    });
    drawSectionCard("Sub-account summary", subItems);
  }

  const balItems = [];
  if(from) balItems.push({ text: `Opening balance: ${moneyFmt(cur, opening)}` });
  else balItems.push({ text: "Set FROM date to show period opening balance." });
  balItems.push({ text: `Closing balance (as of ${asOf || ""}): ${moneyFmt(cur, closing)}`, bold: true });
  if(num(heldAmount) > 0.009){
    balItems.push({ text: `Held cheques / pending receipts (not in closing): ${moneyFmt(cur, heldAmount)}` });
  }
  drawSectionCard("Account balance", balItems);

  if(num(odFrom) > 0){
    ensureSpace(10);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Overdue highlight from ${odFrom}+ days  ·  Yellow 1–30  ·  Orange 31–60  ·  Deep 61–90  ·  Red 90+`, 14, sumY + 2);
    doc.setTextColor(0);
  }
  return doc.output("blob");
}

function num(n){ return Number(n) || 0; }

function rvPdfRoundRect(doc, x, y, w, h, r, style){
  if(typeof doc.roundedRect === "function") doc.roundedRect(x, y, w, h, r, r, style);
  else doc.rect(x, y, w, h, style);
}

function rvPdfBox(doc, x, y, w, h, label, value, bg, fg, opts = {}){
  doc.setFillColor(...bg);
  rvPdfRoundRect(doc, x, y, w, h, opts.radius ?? 2.2, "F");
  doc.setTextColor(...fg);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(opts.labelSize ?? 6.5);
  doc.text(String(label || "").toUpperCase(), x + 3, y + 4.8);
  doc.setFontSize(opts.valueSize ?? 10);
  const maxW = w - 6;
  const lines = doc.splitTextToSize(String(value ?? "—"), maxW);
  const maxLines = opts.maxLines ?? 2;
  const shown = lines.slice(0, maxLines);
  doc.text(shown, x + 3, y + 10.2);
  if(opts.note){
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text(String(opts.note), x + 3, y + h - 3.2);
  }
  doc.setTextColor(0);
}

export async function buildReceiptPdfBlob(r, shop = {}, { billRows = [], balances = null } = {}){
  const jsPDF = await ensureJsPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = shop.currency || "AED";
  const status = String(r.status || "Posted");
  const isDead = /^(Cancelled|Voided|Bounced)$/i.test(status);
  const isPending = /^Pending$/i.test(status);
  const collectedBy = r.collectedBy || r.createdBy || r.updatedBy || "—";
  const amount = num(r.amount);
  const disc = num(r.discount);
  const allocated = Array.isArray(r.allocations) && r.allocations.length
    ? r.allocations.reduce((s, a)=> s + num(a.amount), 0)
    : num(r.allocated);
  const unalloc = Math.max(0, amount - allocated);
  const balBefore = balances && Number.isFinite(Number(balances.balanceBefore))
    ? Number(balances.balanceBefore)
    : null;
  const balAfter = balances && Number.isFinite(Number(balances.balanceAfter))
    ? Number(balances.balanceAfter)
    : null;
  const balApplied = !!(balances?.applied);
  const afterNote = balAfter == null
    ? ""
    : (balApplied ? "Outstanding after this receipt" : "After cheque/PDC Clear (projected)");

  const pageW = 210;
  const margin = 12;
  const contentW = pageW - margin * 2;
  let y = 10;

  // Header band (matches print)
  doc.setFillColor(15, 39, 68);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 24, pageW, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(String(shop.name || "S4 Workshop"), margin, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const shopSub = [shop.phone, shop.trn ? `TRN: ${shop.trn}` : ""].filter(Boolean).join(" · ");
  if(shopSub) doc.text(shopSub, margin, 18);
  doc.setFillColor(255, 255, 255);
  rvPdfRoundRect(doc, pageW - margin - 42, 8, 42, 10, 1.8, "F");
  doc.setTextColor(15, 39, 68);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("RECEIPT VOUCHER", pageW - margin - 21, 14.2, { align: "center" });
  doc.setTextColor(0);
  y = 34;

  if(isDead){
    doc.setFillColor(254, 226, 226);
    rvPdfRoundRect(doc, margin, y, contentW, 10, 2, "F");
    doc.setTextColor(153, 27, 27);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${status.toUpperCase()} — not valid for payment`, pageW / 2, y + 6.5, { align: "center" });
    doc.setTextColor(0);
    y += 13;
  }

  const gap = 3;
  const col3 = (contentW - gap * 2) / 3;
  const row1Y = y;
  const boxH = 16;
  rvPdfBox(doc, margin, row1Y, col3, boxH, "Receipt No", r.rvNo || "—", [219, 234, 254], [30, 58, 138]);
  rvPdfBox(doc, margin + col3 + gap, row1Y, col3, boxH, "Date", r.date || "—", [224, 231, 255], [49, 46, 129]);
  const statusBg = isDead ? [254, 226, 226] : (isPending ? [255, 237, 213] : [220, 252, 231]);
  const statusFg = isDead ? [153, 27, 27] : (isPending ? [154, 52, 18] : [20, 83, 45]);
  rvPdfBox(doc, margin + (col3 + gap) * 2, row1Y, col3, boxH, "Status", status, statusBg, statusFg);
  y = row1Y + boxH + gap;

  rvPdfBox(doc, margin, y, contentW, 18, "Customer", r.customer || "—", [237, 233, 254], [91, 33, 182], { valueSize: 11, maxLines: 2 });
  y += 18 + gap;

  const half = (contentW - gap) / 2;
  rvPdfBox(doc, margin, y, half, boxH, "Collected By", collectedBy, [204, 251, 241], [17, 94, 89]);
  rvPdfBox(doc, margin + half + gap, y, half, boxH, "Mode", r.method || "Cash", [252, 231, 243], [157, 23, 77]);
  y += boxH + gap + 1;

  // Amount + balance row
  const amtW = contentW * 0.38;
  const balW = (contentW - amtW - gap * 2) / 2;
  const amtH = 22;
  rvPdfBox(doc, margin, y, amtW, amtH, "Amount Received", moneyFmt(cur, amount), [29, 78, 216], [239, 246, 255], { valueSize: 14 });
  rvPdfBox(
    doc,
    margin + amtW + gap,
    y,
    balW,
    amtH,
    "Balance Before",
    balBefore == null ? "—" : moneyFmt(cur, balBefore),
    [254, 243, 199],
    [146, 64, 14],
    { valueSize: 12 }
  );
  rvPdfBox(
    doc,
    margin + amtW + gap + balW + gap,
    y,
    balW,
    amtH,
    "Balance After",
    balAfter == null ? "—" : moneyFmt(cur, balAfter),
    balApplied ? [134, 239, 172] : [187, 247, 208],
    [20, 83, 45],
    { valueSize: 12, note: afterNote }
  );
  y += amtH + gap + 1;

  // Side totals
  const sideH = 14;
  rvPdfBox(doc, margin, y, col3, sideH, "Discount", moneyFmt(cur, disc), [255, 255, 255], [23, 32, 51], { valueSize: 9 });
  doc.setDrawColor(226, 232, 240);
  rvPdfRoundRect(doc, margin, y, col3, sideH, 2.2, "S");
  rvPdfBox(doc, margin + col3 + gap, y, col3, sideH, "Allocated to Bills", moneyFmt(cur, allocated), [255, 255, 255], [23, 32, 51], { valueSize: 9 });
  rvPdfRoundRect(doc, margin + col3 + gap, y, col3, sideH, 2.2, "S");
  rvPdfBox(doc, margin + (col3 + gap) * 2, y, col3, sideH, "Advance / Unallocated", moneyFmt(cur, unalloc), [255, 255, 255], [23, 32, 51], { valueSize: 9 });
  rvPdfRoundRect(doc, margin + (col3 + gap) * 2, y, col3, sideH, 2.2, "S");
  y += sideH + gap + 2;

  // Narration / cheque
  const narrBits = [];
  if(r.ref) narrBits.push(`Narration: ${r.ref}`);
  if(r.chequeNo){
    let chq = `Cheque: ${r.chequeNo}`;
    if(r.bank) chq += ` · Bank: ${r.bank}`;
    if(r.chequeDate) chq += ` · Chq Date: ${r.chequeDate}`;
    if(r.pdcDate) chq += ` · PDC: ${r.pdcDate}`;
    narrBits.push(chq);
  }
  if(isDead) narrBits.push("This receipt is not valid for payment / allocation.");
  if(narrBits.length){
    const narrText = narrBits.join("\n");
    const narrLines = doc.splitTextToSize(narrText, contentW - 8);
    const narrH = Math.max(12, 6 + narrLines.length * 4.2);
    doc.setFillColor(255, 251, 235);
    rvPdfRoundRect(doc, margin, y, contentW, narrH, 2.2, "F");
    doc.setDrawColor(253, 230, 138);
    rvPdfRoundRect(doc, margin, y, contentW, narrH, 2.2, "S");
    doc.setTextColor(120, 53, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(narrLines, margin + 4, y + 5);
    doc.setTextColor(0);
    y += narrH + 4;
  }

  const rows = (billRows || []).map(b=> [
    b.invNoLabel || b.invNo || "",
    b.invDate || "",
    moneyFmt(cur, b.billAmount),
    moneyFmt(cur, b.received)
  ]);
  const totalBill = (billRows || []).reduce((s, b)=> s + (Number(b.billAmount) || 0), 0);
  const totalRecv = (billRows || []).reduce((s, b)=> s + (Number(b.received) || 0), 0);
  if(rows.length){
    doc.setFillColor(30, 58, 138);
    rvPdfRoundRect(doc, margin, y, contentW, 8, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("BILLS RECEIVED AGAINST", margin + 3, y + 5.4);
    doc.setTextColor(0);
    doc.autoTable({
      startY: y + 8,
      margin: { left: margin, right: margin },
      head: [["Bill No", "Bill Date", "Bill Amount", "Received Amt"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2.2 },
      headStyles: { fillColor: [232, 240, 250], textColor: [26, 61, 102], fontStyle: "bold" },
      foot: [["Total", "", moneyFmt(cur, totalBill), moneyFmt(cur, totalRecv)]],
      footStyles: { fillColor: [238, 244, 251], textColor: [23, 32, 51], fontStyle: "bold" },
      columnStyles: {
        2: { halign: "right" },
        3: { halign: "right" }
      }
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;
  }else{
    y += 8;
  }

  // Signature lines
  const sigY = Math.min(Math.max(y + 8, 250), 275);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(margin + 4, sigY, margin + 70, sigY);
  doc.line(pageW - margin - 70, sigY, pageW - margin - 4, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(102, 112, 133);
  doc.text("Customer Signature", margin + 37, sigY + 5, { align: "center" });
  doc.text("Authorized Signatory", pageW - margin - 37, sigY + 5, { align: "center" });
  doc.setTextColor(0);

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
