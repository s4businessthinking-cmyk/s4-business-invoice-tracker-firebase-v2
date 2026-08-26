// ============================================================
// STAFF NAME — mandatory on every invoice add/edit/delete
// Account display name (Firebase member) is primary source.
// ============================================================

const STAFF_KEY = "s4_staff_name_v1";
let memberDisplayName = "";

export function setMemberDisplayName(name){
  memberDisplayName = String(name || "").trim();
  if(memberDisplayName) setStaffName(memberDisplayName);
}

export function getStaffName(){
  if(memberDisplayName) return memberDisplayName;
  try{ return (localStorage.getItem(STAFF_KEY) || "").trim(); }catch(e){ return ""; }
}

export function setStaffName(name){
  const v = String(name || "").trim();
  try{ localStorage.setItem(STAFF_KEY, v); }catch(e){}
  return v;
}

export function staffPromptMessage(lang){
  return "Enter staff name (required for add/edit/delete):";
}

export function staffMissingMessage(lang){
  return "Staff name is required.";
}

/** Returns trimmed name or null if user cancelled / left blank */
export function promptForStaffName(lang = "en", preset = ""){
  const entered = prompt(staffPromptMessage(lang), preset || getStaffName());
  if(entered == null) return null;
  const v = String(entered).trim();
  if(!v) return null;
  setStaffName(v);
  return v;
}

export function requireStaffName(lang = "en"){
  const existing = getStaffName();
  if(existing) return existing;
  return promptForStaffName(lang);
}

export function renderStaffBadge(el, lang = "en", role = ""){
  if(!el) return;
  const name = getStaffName() || "—";
  const roleLabel = role === "owner"
    ? "Owner"
    : role === "staff"
      ? "Staff"
      : "";
  const prefix = roleLabel ? `${roleLabel}: ` : "Staff: ";
  el.textContent = prefix + name;
}
