// Shared backup snapshot + local file save/restore
import { writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export function buildBackupSnapshot(parts){
  return {
    version: 1,
    at: Date.now(),
    shop: parts.shop || {},
    invoices: parts.invoices || [],
    customers: parts.customers || [],
    vehicles: parts.vehicles || [],
    products: parts.products || [],
    services: parts.services || [],
    receipts: parts.receipts || [],
    creditNotes: parts.creditNotes || [],
    debitNotes: parts.debitNotes || [],
    cheques: parts.cheques || [],
    discounts: parts.discounts || []
  };
}

function backupFilename(shopName){
  const safe = String(shopName || "shop").replace(/[^\w\-]+/g, "_").slice(0, 40);
  const d = new Date().toISOString().slice(0, 10);
  return `backup-${safe}-${d}.json`;
}

function downloadBlob(filename, text){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function saveLocalBackup(parts){
  const snap = buildBackupSnapshot(parts);
  const text = JSON.stringify(snap, null, 2);
  const name = backupFilename(snap.shop?.name);
  if(typeof window !== "undefined" && window.s4Desktop?.saveLocalBackup){
    const res = await window.s4Desktop.saveLocalBackup({ filename: name, jsonText: text });
    return { mode: "desktop", path: res?.path || "", filename: name, size: text.length };
  }
  downloadBlob(name, text);
  return { mode: "download", path: "", filename: name, size: text.length };
}

export function validateBackupSnapshot(data){
  if(!data || typeof data !== "object") throw new Error("Invalid backup file");
  if(!Array.isArray(data.invoices) && !Array.isArray(data.customers)){
    throw new Error("Backup missing invoices/customers arrays");
  }
  return data;
}

async function batchSetCollection(db, colName, rows){
  const list = (rows || []).filter(r=> r && r.id);
  for(let i = 0; i < list.length; i += 400){
    const chunk = list.slice(i, i + 400);
    const batch = writeBatch(db);
    chunk.forEach(row=>{
      const { id, ...rest } = row;
      batch.set(doc(db, colName, id), rest, { merge: true });
    });
    await batch.commit();
  }
}

export async function restoreLocalBackup(db, fileOrText){
  let text = fileOrText;
  if(fileOrText && typeof fileOrText === "object" && typeof fileOrText.text === "function"){
    text = await fileOrText.text();
  }
  const data = validateBackupSnapshot(JSON.parse(String(text || "")));
  if(data.shop && typeof data.shop === "object"){
    const { id: _ignore, ...shopData } = data.shop;
    const batch = writeBatch(db);
    batch.set(doc(db, "shop", "info"), shopData, { merge: true });
    await batch.commit();
  }
  await batchSetCollection(db, "customers", data.customers);
  await batchSetCollection(db, "vehicles", data.vehicles);
  await batchSetCollection(db, "productCatalog", data.products);
  await batchSetCollection(db, "serviceCatalog", data.services);
  await batchSetCollection(db, "invoices", data.invoices);
  await batchSetCollection(db, "receipts", data.receipts);
  await batchSetCollection(db, "creditNotes", data.creditNotes);
  await batchSetCollection(db, "debitNotes", data.debitNotes);
  await batchSetCollection(db, "cheques", data.cheques);
  await batchSetCollection(db, "discounts", data.discounts);
  return data;
}
