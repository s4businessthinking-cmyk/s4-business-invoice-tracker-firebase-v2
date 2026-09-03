// ============================================================
// INVENTORY ENGINE — Build Order §3
// Stock balances (per product + warehouse), weighted-average cost,
// append-only stock ledger, purchase IN integration.
// ============================================================

import {
  collection, doc, getDoc, getDocs, onSnapshot, query, orderBy, limit,
  runTransaction, writeBatch, where, addDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getCurrentBranchId } from "./foundation.js?v=131";
import { masterMeta } from "./masters.js?v=131";

let _ctx = {};
let _balances = [];
let _ledger = [];
let _balUnsub = null;
let _ledUnsub = null;

/** Align empty / legacy labels with purchase invoice stock location ("Main"). */
export function normalizeWarehouseId(loc){
  const id = String(loc || "").trim();
  if(!id || id === "default" || id.toLowerCase() === "main") return "Main";
  return id;
}

export function balanceDocId(productId, warehouseId){
  return `${productId}_${normalizeWarehouseId(warehouseId)}`;
}

function purchaseLineUnitCost(line, product){
  const qty = _ctx.num(line?.qty) || 0;
  const price = _ctx.num(line?.price) || _ctx.num(line?.rate);
  if(price) return price;
  const net = _ctx.num(line?.net) || _ctx.num(line?.netAmt);
  if(net && qty) return _ctx.roundMoney(net / qty);
  return _ctx.num(product?.landingCost) || _ctx.num(product?.price) || 0;
}

export function initInventory(ctx){
  _ctx = ctx || {};
}

export function getStockBalances(){
  return _balances.slice();
}

export function getStockLedger(){
  return _ledger.slice();
}

export function getBalance(productId, warehouseId){
  const wh = normalizeWarehouseId(warehouseId);
  const id = balanceDocId(productId, warehouseId);
  const row = _balances.find(b=> b.id === id || (b.productId === productId && normalizeWarehouseId(b.warehouseId) === wh));
  return {
    qty: _ctx.num(row?.qty),
    avgCost: _ctx.num(row?.avgCost),
    warehouseId: row?.warehouseId || wh
  };
}

export function getProductTotalQty(productId){
  if(!productId) return 0;
  return _balances
    .filter(b=> b.productId === productId)
    .reduce((s, b)=> s + _ctx.num(b.qty), 0);
}

export function productStockFromCatalog(p){
  if(!p) return 0;
  const fromEngine = getProductTotalQty(p.id);
  if(p.id && _balances.some(b=> b.productId === p.id)) return fromEngine;
  return _ctx.num(p?.currentStock ?? p?.openingStock ?? 0);
}

export function subscribeStockBalances(onChange){
  if(_balUnsub){ try{ _balUnsub(); }catch(_){ } _balUnsub = null; }
  if(!_ctx.db || !_ctx.col) return ()=>{};
  _balUnsub = onSnapshot(query(_ctx.col("stockBalances"), orderBy("productName")), snap=>{
    _balances = snap.docs.map(d=> ({ id: d.id, ...d.data() }));
    onChange?.(_balances);
  }, err=> console.warn("[S4 stockBalances]", err));
  return _balUnsub;
}

export function subscribeStockLedger(onChange, max = 200){
  if(_ledUnsub){ try{ _ledUnsub(); }catch(_){ } _ledUnsub = null; }
  if(!_ctx.db || !_ctx.col) return ()=>{};
  _ledUnsub = onSnapshot(
    query(_ctx.col("stockLedger"), orderBy("at", "desc"), limit(max)),
    snap=>{
      _ledger = snap.docs.map(d=> ({ id: d.id, ...d.data() }));
      onChange?.(_ledger);
    },
    err=> console.warn("[S4 stockLedger]", err)
  );
  return _ledUnsub;
}

export function stopInventorySubscriptions(){
  if(_balUnsub){ try{ _balUnsub(); }catch(_){ } _balUnsub = null; }
  if(_ledUnsub){ try{ _ledUnsub(); }catch(_){ } _ledUnsub = null; }
}

async function syncProductCatalogTotals(productIds){
  if(!_ctx.db || !productIds?.length) return;
  const unique = [...new Set(productIds.filter(Boolean))];
  const batch = writeBatch(_ctx.db);
  let pending = 0;
  for(const pid of unique){
    const total = getProductTotalQty(pid);
    const ref = doc(_ctx.db, "productCatalog", pid);
    const snap = await getDoc(ref);
    if(!snap.exists()) continue;
    batch.update(ref, {
      currentStock: total,
      updatedAt: Date.now(),
      updatedBy: _ctx.who()
    });
    pending++;
  }
  if(pending) await batch.commit();
}

/** Fail before document save when outbound stock is insufficient. direction -1 = OUT. */
export async function validateStockForLines(items, warehouseId, direction){
  if(!_ctx.db || !_ctx.findProductForLine || direction >= 0) return;
  const wh = normalizeWarehouseId(warehouseId);
  const needByProduct = new Map();
  const nameByProduct = new Map();
  for(const line of items || []){
    const product = _ctx.findProductForLine(line);
    if(!product?.id) continue;
    const qty = (_ctx.num(line.qty) || 0) * Math.abs(direction);
    if(!qty) continue;
    needByProduct.set(product.id, (needByProduct.get(product.id) || 0) + qty);
    nameByProduct.set(product.id, product.name || product.code || product.id);
  }
  for(const [pid, need] of needByProduct){
    const balId = balanceDocId(pid, wh);
    const cached = _balances.find(b=> b.id === balId);
    let prevQty = _ctx.num(cached?.qty);
    if(!cached){
      const snap = await getDoc(doc(_ctx.db, "stockBalances", balId));
      prevQty = snap.exists() ? _ctx.num(snap.data().qty) : 0;
    }
    if(prevQty - need < -0.0001){
      throw new Error(`INSUFFICIENT_STOCK:${nameByProduct.get(pid)}`);
    }
  }
}

export function catalogMatchedLines(items){
  if(!_ctx.findProductForLine) return [];
  return (items || []).filter(line=> _ctx.findProductForLine(line)?.id);
}

/**
 * Core stock move for catalog-matched lines.
 * direction +1 = qty IN, -1 = qty OUT (reversal of prior IN).
 */
async function applyProductStockDelta(items, warehouseId, direction, docRef, options = {}){
  if(!_ctx.db || !_ctx.findProductForLine) return;
  const wh = normalizeWarehouseId(warehouseId);
  const branchId = getCurrentBranchId() || "";
  const touchedProducts = new Set();
  const today = new Date().toISOString().slice(0, 10);
  const docTypeIn = options.docTypeIn || "STOCK_IN";
  const docTypeOut = options.docTypeOut || "STOCK_OUT";
  const reasonIn = options.reasonIn || "Stock in";
  const reasonOut = options.reasonOut || "Stock out";
  const costMode = options.costMode || "purchase";

  await runTransaction(_ctx.db, async tx=>{
    for(const line of items || []){
      const product = _ctx.findProductForLine(line);
      if(!product?.id) continue;
      const delta = (_ctx.num(line.qty) || 0) * direction;
      if(!delta) continue;

      const balRef = doc(_ctx.db, "stockBalances", balanceDocId(product.id, wh));
      const snap = await tx.get(balRef);
      const prev = snap.exists() ? snap.data() : { qty: 0, avgCost: 0 };
      const prevQty = _ctx.num(prev.qty);
      const prevAvg = _ctx.num(prev.avgCost);
      const unitCost = delta > 0
        ? (costMode === "purchase"
          ? purchaseLineUnitCost(line, product)
          : (prevAvg || _ctx.num(product.landingCost) || _ctx.num(product.price) || 0))
        : prevAvg;

      let nextQty = _ctx.roundMoney(prevQty + delta);
      let nextAvg = prevAvg;
      if(delta > 0){
        const totalVal = prevQty * prevAvg + delta * unitCost;
        nextAvg = nextQty > 0 ? _ctx.roundMoney(totalVal / nextQty) : unitCost;
      }
      if(nextQty < -0.0001) throw new Error(`INSUFFICIENT_STOCK:${product.name || product.code || product.id}`);

      tx.set(balRef, {
        productId: product.id,
        productCode: product.code || line.code || "",
        productName: product.name || line.productName || line.name || "",
        warehouseId: wh,
        branchId,
        qty: nextQty,
        avgCost: nextAvg,
        ...masterMeta()
      }, { merge: true });

      const ledRef = doc(collection(_ctx.db, "stockLedger"));
      tx.set(ledRef, {
        at: Date.now(),
        date: today,
        docType: delta > 0 ? docTypeIn : docTypeOut,
        docRef: String(docRef || ""),
        productId: product.id,
        productCode: product.code || "",
        productName: product.name || "",
        warehouseId: wh,
        branchId,
        qtyIn: delta > 0 ? delta : 0,
        qtyOut: delta < 0 ? -delta : 0,
        balance: nextQty,
        unitCost: delta > 0 ? unitCost : prevAvg,
        totalCost: _ctx.roundMoney(Math.abs(delta) * (delta > 0 ? unitCost : prevAvg)),
        user: _ctx.who(),
        reason: delta > 0 ? reasonIn : reasonOut
      });

      touchedProducts.add(product.id);
    }
  });

  for(const pid of touchedProducts){
    const rows = await getDocs(query(_ctx.col("stockBalances"), where("productId", "==", pid)));
    rows.forEach(d=>{
      const i = _balances.findIndex(b=> b.id === d.id);
      const row = { id: d.id, ...d.data() };
      if(i >= 0) _balances[i] = row; else _balances.push(row);
    });
  }
  await syncProductCatalogTotals([...touchedProducts]);
}

/**
 * Purchase / reversal stock moves. direction +1 = IN, -1 = OUT (reversal).
 */
export async function applyPurchaseStockDelta(items, warehouseId, direction, docRef){
  return applyProductStockDelta(items, warehouseId, direction, docRef, {
    docTypeIn: "PURCHASE_IN",
    docTypeOut: "PURCHASE_REV",
    reasonIn: "Purchase invoice posted",
    reasonOut: "Purchase invoice reversed",
    costMode: "purchase"
  });
}

/** Goods receipt (GRN) — stock IN without payable; reversal on edit/void. */
export async function applyGrnStockDelta(items, warehouseId, direction, docRef){
  return applyProductStockDelta(items, warehouseId, direction, docRef, {
    docTypeIn: "GRN_IN",
    docTypeOut: "GRN_REV",
    reasonIn: "Goods receipt posted",
    reasonOut: "GRN reversed",
    costMode: "purchase"
  });
}

/** Purchase return to vendor — stock OUT (avg cost). direction -1 = OUT, +1 = reversal. */
export async function applyPurchaseReturnStockDelta(items, warehouseId, direction, docRef){
  return applyProductStockDelta(items, warehouseId, direction, docRef, {
    docTypeIn: "PURCHASE_RETURN_REV",
    docTypeOut: "PURCHASE_RETURN_OUT",
    reasonIn: "Purchase return reversed",
    reasonOut: "Purchase return to vendor",
    costMode: "avg"
  });
}

/**
 * Sales invoice stock moves. direction -1 = OUT (post), +1 = IN (reversal).
 * Only catalog-matched product lines move stock; services are skipped.
 */
export async function applySalesStockDelta(items, warehouseId, direction, docRef){
  return applyProductStockDelta(items, warehouseId, direction, docRef, {
    docTypeIn: "SALE_REV",
    docTypeOut: "SALE_OUT",
    reasonIn: "Sales invoice reversed",
    reasonOut: "Sales invoice posted",
    costMode: "avg"
  });
}

/** Job card parts issue — direction -1 = OUT (post), +1 = reverse. */
export async function applyJobIssueStockDelta(items, warehouseId, direction, docRef){
  return applyProductStockDelta(items, warehouseId, direction, docRef, {
    docTypeIn: "JOB_ISSUE_REV",
    docTypeOut: "JOB_ISSUE_OUT",
    reasonIn: "Job parts issue reversed",
    reasonOut: "Job parts issued",
    costMode: "avg"
  });
}

/** Credit note / sales return — direction +1 = stock IN, -1 = reverse on void. */
export async function applyCreditReturnStockDelta(items, warehouseId, direction, docRef){
  return applyProductStockDelta(items, warehouseId, direction, docRef, {
    docTypeIn: "CREDIT_RETURN_IN",
    docTypeOut: "CREDIT_RETURN_REV",
    reasonIn: "Credit note — goods returned",
    reasonOut: "Credit note voided",
    costMode: "avg"
  });
}

/** Opening stock or manual adjustment (+/-). */
export async function postStockAdjustment({
  productId, productCode, productName, warehouseId, qty, unitCost, docType, reason, docRef
}){
  if(!_ctx.db) throw new Error("NO_DB");
  const wh = normalizeWarehouseId(warehouseId);
  const branchId = getCurrentBranchId() || "";
  const delta = _ctx.num(qty);
  if(!productId || !delta) throw new Error("ADJUSTMENT_REQUIRED");
  const today = new Date().toISOString().slice(0, 10);
  const type = docType || (delta > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT");

  await runTransaction(_ctx.db, async tx=>{
    const balRef = doc(_ctx.db, "stockBalances", balanceDocId(productId, wh));
    const snap = await tx.get(balRef);
    const prev = snap.exists() ? snap.data() : { qty: 0, avgCost: 0 };
    const prevQty = _ctx.num(prev.qty);
    const prevAvg = _ctx.num(prev.avgCost);
    const cost = _ctx.num(unitCost) || prevAvg;
    let nextQty = _ctx.roundMoney(prevQty + delta);
    let nextAvg = prevAvg;
    if(delta > 0){
      const totalVal = prevQty * prevAvg + delta * cost;
      nextAvg = nextQty > 0 ? _ctx.roundMoney(totalVal / nextQty) : cost;
    }
    if(nextQty < -0.0001) throw new Error("INSUFFICIENT_STOCK");

    tx.set(balRef, {
      productId, productCode: productCode || "", productName: productName || "",
      warehouseId: wh, branchId, qty: nextQty, avgCost: nextAvg, ...masterMeta()
    }, { merge: true });

    tx.set(doc(collection(_ctx.db, "stockLedger")), {
      at: Date.now(), date: today, docType: type,
      docRef: String(docRef || ""),
      productId, productCode: productCode || "", productName: productName || "",
      warehouseId: wh, branchId,
      qtyIn: delta > 0 ? delta : 0,
      qtyOut: delta < 0 ? -delta : 0,
      balance: nextQty,
      unitCost: delta > 0 ? cost : prevAvg,
      totalCost: _ctx.roundMoney(Math.abs(delta) * (delta > 0 ? cost : prevAvg)),
      user: _ctx.who(),
      reason: String(reason || "").trim() || type
    });
  });

  await syncProductCatalogTotals([productId]);
}

/**
 * Transfer stock between warehouses (atomic OUT + IN at source avg cost).
 */
export async function postStockTransfer({
  productId, productCode, productName, fromWarehouseId, toWarehouseId, qty, reason, transferNo, date
}){
  if(!_ctx.db) throw new Error("NO_DB");
  const fromWh = normalizeWarehouseId(fromWarehouseId);
  const toWh = normalizeWarehouseId(toWarehouseId);
  if(fromWh === toWh) throw new Error("SAME_WAREHOUSE");
  const moveQty = _ctx.num(qty);
  if(!productId || moveQty <= 0) throw new Error("TRANSFER_REQUIRED");

  const branchId = getCurrentBranchId() || "";
  const today = date || new Date().toISOString().slice(0, 10);
  const ref = String(transferNo || "").trim() || `TR-${Date.now()}`;
  const reasonText = String(reason || "").trim() || "Stock transfer";

  await runTransaction(_ctx.db, async tx=>{
    const fromBalRef = doc(_ctx.db, "stockBalances", balanceDocId(productId, fromWh));
    const toBalRef = doc(_ctx.db, "stockBalances", balanceDocId(productId, toWh));
    const fromSnap = await tx.get(fromBalRef);
    const toSnap = await tx.get(toBalRef);
    const fromPrev = fromSnap.exists() ? fromSnap.data() : { qty: 0, avgCost: 0 };
    const toPrev = toSnap.exists() ? toSnap.data() : { qty: 0, avgCost: 0 };
    const prevFromQty = _ctx.num(fromPrev.qty);
    const prevFromAvg = _ctx.num(fromPrev.avgCost);
    const prevToQty = _ctx.num(toPrev.qty);
    const prevToAvg = _ctx.num(toPrev.avgCost);

    if(prevFromQty - moveQty < -0.0001) throw new Error("INSUFFICIENT_STOCK");

    const transferCost = prevFromAvg;
    const nextFromQty = _ctx.roundMoney(prevFromQty - moveQty);
    const nextToQty = _ctx.roundMoney(prevToQty + moveQty);
    const totalVal = prevToQty * prevToAvg + moveQty * transferCost;
    const nextToAvg = nextToQty > 0 ? _ctx.roundMoney(totalVal / nextToQty) : transferCost;

    tx.set(fromBalRef, {
      productId, productCode: productCode || "", productName: productName || "",
      warehouseId: fromWh, branchId, qty: nextFromQty, avgCost: prevFromAvg, ...masterMeta()
    }, { merge: true });

    tx.set(toBalRef, {
      productId, productCode: productCode || "", productName: productName || "",
      warehouseId: toWh, branchId, qty: nextToQty, avgCost: nextToAvg, ...masterMeta()
    }, { merge: true });

    tx.set(doc(collection(_ctx.db, "stockLedger")), {
      at: Date.now(), date: today, docType: "TRANSFER_OUT", docRef: ref,
      productId, productCode: productCode || "", productName: productName || "",
      warehouseId: fromWh, branchId,
      qtyIn: 0, qtyOut: moveQty, balance: nextFromQty,
      unitCost: transferCost, totalCost: _ctx.roundMoney(moveQty * transferCost),
      user: _ctx.who(), reason: `${reasonText} → ${toWh}`
    });

    tx.set(doc(collection(_ctx.db, "stockLedger")), {
      at: Date.now(), date: today, docType: "TRANSFER_IN", docRef: ref,
      productId, productCode: productCode || "", productName: productName || "",
      warehouseId: toWh, branchId,
      qtyIn: moveQty, qtyOut: 0, balance: nextToQty,
      unitCost: transferCost, totalCost: _ctx.roundMoney(moveQty * transferCost),
      user: _ctx.who(), reason: `${reasonText} ← ${fromWh}`
    });

    tx.set(doc(collection(_ctx.db, "stockTransfers")), {
      transferNo: ref, date: today,
      productId, productCode: productCode || "", productName: productName || "",
      fromWarehouseId: fromWh, toWarehouseId: toWh,
      qty: moveQty, unitCost: transferCost,
      branchId, reason: reasonText,
      createdAt: Date.now(), createdBy: _ctx.who()
    });
  });

  for(const wh of [fromWh, toWh]){
    const rows = await getDocs(query(_ctx.col("stockBalances"), where("productId", "==", productId)));
    rows.forEach(d=>{
      const i = _balances.findIndex(b=> b.id === d.id);
      const row = { id: d.id, ...d.data() };
      if(i >= 0) _balances[i] = row; else _balances.push(row);
    });
  }
  await syncProductCatalogTotals([productId]);
}

/**
 * Stock count — physical vs system; posts variance adjustments atomically.
 */
export async function postStockCount({ countNo, date, warehouseId, lines, notes }){
  if(!_ctx.db) throw new Error("NO_DB");
  const wh = normalizeWarehouseId(warehouseId);
  const branchId = getCurrentBranchId() || "";
  const today = date || new Date().toISOString().slice(0, 10);
  const ref = String(countNo || "").trim() || `SC-${Date.now()}`;
  const noteText = String(notes || "").trim();

  const prepared = (lines || []).map(line=>({
    productId: line.productId,
    productCode: line.productCode || "",
    productName: line.productName || "",
    physicalQty: _ctx.roundMoney(_ctx.num(line.physicalQty)),
    reason: String(line.reason || "").trim() || "Stock count variance"
  })).filter(l=> l.productId);

  if(!prepared.length) throw new Error("COUNT_REQUIRED");

  const countLines = [];
  const touchedProducts = new Set();

  await runTransaction(_ctx.db, async tx=>{
    for(const line of prepared){
      const balRef = doc(_ctx.db, "stockBalances", balanceDocId(line.productId, wh));
      const snap = await tx.get(balRef);
      const prev = snap.exists() ? snap.data() : { qty: 0, avgCost: 0 };
      const systemQty = _ctx.roundMoney(_ctx.num(prev.qty));
      const variance = _ctx.roundMoney(line.physicalQty - systemQty);

      countLines.push({
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        systemQty,
        physicalQty: line.physicalQty,
        variance,
        reason: line.reason
      });

      if(Math.abs(variance) < 0.0001) continue;

      const prevAvg = _ctx.num(prev.avgCost);
      const nextQty = _ctx.roundMoney(systemQty + variance);
      if(nextQty < -0.0001){
        throw new Error(`INSUFFICIENT_STOCK:${line.productName || line.productCode || line.productId}`);
      }

      let nextAvg = prevAvg;
      const cost = prevAvg;
      if(variance > 0 && nextQty > 0){
        const totalVal = systemQty * prevAvg + variance * cost;
        nextAvg = _ctx.roundMoney(totalVal / nextQty);
      }

      tx.set(balRef, {
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        warehouseId: wh, branchId,
        qty: nextQty, avgCost: nextAvg,
        ...masterMeta()
      }, { merge: true });

      const docType = variance > 0 ? "STOCK_COUNT_IN" : "STOCK_COUNT_OUT";
      tx.set(doc(collection(_ctx.db, "stockLedger")), {
        at: Date.now(), date: today, docType, docRef: ref,
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        warehouseId: wh, branchId,
        qtyIn: variance > 0 ? variance : 0,
        qtyOut: variance < 0 ? -variance : 0,
        balance: nextQty,
        unitCost: cost,
        totalCost: _ctx.roundMoney(Math.abs(variance) * cost),
        user: _ctx.who(),
        reason: line.reason
      });

      touchedProducts.add(line.productId);
    }

    if(!countLines.some(l=> Math.abs(l.variance) >= 0.0001)){
      throw new Error("COUNT_NO_VARIANCE");
    }

    tx.set(doc(collection(_ctx.db, "stockCounts")), {
      countNo: ref, date: today, warehouseId: wh, branchId,
      notes: noteText, lines: countLines,
      lineCount: countLines.length,
      varianceLines: countLines.filter(l=> Math.abs(l.variance) >= 0.0001).length,
      createdAt: Date.now(), createdBy: _ctx.who()
    });
  });

  for(const pid of touchedProducts){
    const rows = await getDocs(query(_ctx.col("stockBalances"), where("productId", "==", pid)));
    rows.forEach(d=>{
      const i = _balances.findIndex(b=> b.id === d.id);
      const row = { id: d.id, ...d.data() };
      if(i >= 0) _balances[i] = row; else _balances.push(row);
    });
  }
  await syncProductCatalogTotals([...touchedProducts]);
}

/**
 * Inter-branch quick request — pending until approved; posts warehouse transfer on approve.
 */
export async function createBranchStockRequest({
  requestNo, date, requestingBranchId, supplyingBranchId,
  productId, productCode, productName, qty, toWarehouseId, fromWarehouseId, reason
}){
  if(!_ctx.db) throw new Error("NO_DB");
  const reqBranch = String(requestingBranchId || getCurrentBranchId() || "").trim();
  const supBranch = String(supplyingBranchId || "").trim();
  if(!reqBranch || !supBranch) throw new Error("BRANCH_REQUIRED");
  if(reqBranch === supBranch) throw new Error("SAME_BRANCH");
  const moveQty = _ctx.num(qty);
  if(!productId || moveQty <= 0) throw new Error("IBR_REQUIRED");

  const ref = String(requestNo || "").trim() || `IBR-${Date.now()}`;
  const docRef = await addDoc(collection(_ctx.db, "branchStockRequests"), {
    requestNo: ref,
    date: date || new Date().toISOString().slice(0, 10),
    status: "pending",
    requestingBranchId: reqBranch,
    supplyingBranchId: supBranch,
    productId,
    productCode: productCode || "",
    productName: productName || "",
    qty: moveQty,
    fromWarehouseId: normalizeWarehouseId(fromWarehouseId),
    toWarehouseId: normalizeWarehouseId(toWarehouseId),
    reason: String(reason || "").trim(),
    createdAt: Date.now(),
    createdBy: _ctx.who()
  });
  return docRef.id;
}

export async function approveBranchStockRequest(request, transferNo){
  if(!_ctx.db || !request?.id) throw new Error("IBR_NOT_FOUND");
  if(request.status !== "pending") throw new Error("IBR_NOT_PENDING");
  const trNo = String(transferNo || "").trim() || `TR-${Date.now()}`;
  const reasonText = `Inter-branch ${request.requestNo}${request.reason ? `: ${request.reason}` : ""}`.trim();

  await postStockTransfer({
    productId: request.productId,
    productCode: request.productCode,
    productName: request.productName,
    fromWarehouseId: request.fromWarehouseId,
    toWarehouseId: request.toWarehouseId,
    qty: request.qty,
    reason: reasonText,
    transferNo: trNo,
    date: request.date || new Date().toISOString().slice(0, 10)
  });

  await updateDoc(doc(_ctx.db, "branchStockRequests", request.id), {
    status: "posted",
    transferNo: trNo,
    approvedAt: Date.now(),
    approvedBy: _ctx.who()
  });
}

export async function rejectBranchStockRequest(requestId, rejectReason){
  if(!_ctx.db || !requestId) throw new Error("IBR_NOT_FOUND");
  await updateDoc(doc(_ctx.db, "branchStockRequests", requestId), {
    status: "rejected",
    rejectReason: String(rejectReason || "").trim(),
    rejectedAt: Date.now(),
    rejectedBy: _ctx.who()
  });
}

export function inventoryErrorText(code){
  if(String(code).startsWith("INSUFFICIENT_STOCK")){
    const name = String(code).split(":")[1] || "product";
    return `Insufficient stock for ${name}`;
  }
  const map = {
    ADJUSTMENT_REQUIRED: "Select product and quantity.",
    TRANSFER_REQUIRED: "Select product, warehouses, and quantity.",
    SAME_WAREHOUSE: "From and To warehouse must be different.",
    COUNT_REQUIRED: "Add at least one product line.",
    COUNT_NO_VARIANCE: "No variance — physical qty matches system for all lines.",
    BRANCH_REQUIRED: "Select requesting and supplying branches.",
    SAME_BRANCH: "Supplying branch must differ from requesting branch.",
    IBR_REQUIRED: "Select product, branches, and quantity.",
    IBR_NOT_FOUND: "Branch request not found.",
    IBR_NOT_PENDING: "This request is no longer pending.",
    NO_DB: "Database not ready."
  };
  return map[code] || String(code || "Inventory error");
}
