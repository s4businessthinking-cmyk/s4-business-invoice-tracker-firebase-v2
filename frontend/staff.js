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
  return lang === "en"
    ? "Enter staff name (required for add/edit/delete):"
    : "স্টাফের নাম লিখুন (যোগ/এডিট/ডিলিটের জন্য বাধ্যতামূলক):";
}

export function staffMissingMessage(lang){
  return lang === "en"
    ? "Staff name is required."
    : "স্টাফের নাম বাধ্যতামূলক।";
}

/** Returns trimmed name or null if user cancelled / left blank */
export function promptForStaffName(lang = "bn", preset = ""){
  const entered = prompt(staffPromptMessage(lang), preset || getStaffName());
  if(entered == null) return null;
  const name = String(entered).trim();
  if(!name) return null;
  setStaffName(name);
  return name;
}

/** Ensures a staff name exists; prompts if needed. Returns name or null. */
export function requireStaffName(lang = "bn"){
  const existing = getStaffName();
  if(existing) return existing;
  return promptForStaffName(lang);
}

export function renderStaffBadge(el, lang = "bn", role = ""){
  if(!el) return;
  const name = getStaffName();
  const roleLabel = role === "owner"
    ? (lang === "en" ? "Owner" : "মালিক")
    : role === "staff"
      ? (lang === "en" ? "Staff" : "স্টাফ")
      : "";
  if(!name){
    el.textContent = lang === "en" ? "👤 Account" : "👤 Account";
    el.style.opacity = "0.85";
    return;
  }
  const prefix = roleLabel ? `${roleLabel}: ` : (lang === "en" ? "Staff: " : "স্টাফ: ");
  el.textContent = "👤 " + prefix + name;
  el.style.opacity = "1";
}
