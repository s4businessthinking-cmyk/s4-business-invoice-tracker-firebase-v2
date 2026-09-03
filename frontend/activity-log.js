// ============================================================
// ACTIVITY LOG — Firestore audit trail (#6)
// ------------------------------------------------------------
// প্রতিটা invoice add/edit/delete এ staff name + summary
// Firestore activity collection এ append-only log হিসেবে
// জমা হয়। Shop Info থেকে recent activity দেখা যায়।
// ============================================================

import { collection, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { branchAuditContext } from "./foundation.js";

let activityColRef = null;

export function initActivityLog(db){
  activityColRef = collection(db, "activity");
}

export async function logActivity({
  action, staffName, invoiceId = "", customer = "", summary = "",
  module = "", record = "", oldValue = "", newValue = "", reason = ""
}){
  if(!activityColRef || !staffName) return;
  const branch = branchAuditContext();
  try{
    await addDoc(activityColRef, {
      action,
      staffName,
      invoiceId,
      customer,
      summary,
      module,
      record: record || invoiceId,
      oldValue,
      newValue,
      reason: reason || summary,
      branchId: branch.branchId || "",
      branchCode: branch.branchCode || "",
      branchName: branch.branchName || "",
      at: Date.now()
    });
  }catch(e){
    console.warn("[S4 activity]", e);
  }
}

export function subscribeRecentActivity(onRows, onError){
  if(!activityColRef) return () => {};
  const q = query(activityColRef, orderBy("at", "desc"), limit(40));
  return onSnapshot(q, (snap)=>{
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onRows(rows);
  }, onError || (()=>{}));
}

export function formatActivityRow(row, lang = "en"){
  const when = row.at ? new Date(row.at).toLocaleString("en-US") : "—";
  const who = row.staffName || "—";
  const what = row.summary || row.action || "—";
  return { when, who, what };
}
