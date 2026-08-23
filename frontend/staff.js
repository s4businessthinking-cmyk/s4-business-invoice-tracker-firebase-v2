// ============================================================
// STAFF NAME — mandatory on every invoice add/edit/delete
// ------------------------------------------------------------
// দোকানে একাধিক স্টাফ একই shared password দিয়ে login করে।
// কে কোন invoice যোগ/বদল/মুছেছে সেটা track করতে প্রতিটা
// device/session এ স্টাফের নাম localStorage এ রাখা হয় এবং
// প্রতিটা write action এ বাধ্যতামূলকভাবে validate করা হয়।
// ============================================================

const STAFF_KEY = "s4_staff_name_v1";

export function getStaffName(){
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

export function renderStaffBadge(el, lang = "bn"){
  if(!el) return;
  const name = getStaffName();
  if(!name){
    el.textContent = lang === "en" ? "👤 Staff: not set (tap to set)" : "👤 স্টাফ: সেট করা নেই (ট্যাপ করুন)";
    el.style.opacity = "0.85";
    return;
  }
  el.textContent = (lang === "en" ? "👤 Staff: " : "👤 স্টাফ: ") + name;
  el.style.opacity = "1";
}
