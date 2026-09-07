// Light / dark brightness — persisted on this PC
export const THEME_KEY = "s4_theme_v1";

export function getTheme(){
  try{
    const saved = localStorage.getItem(THEME_KEY);
    if(saved === "dark" || saved === "light") return saved;
  }catch(_){}
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function setTheme(theme){
  const t = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);
  try{ localStorage.setItem(THEME_KEY, t); }catch(_){}
  syncThemeUi(t);
}

export function toggleTheme(){
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

function syncThemeUi(theme){
  const isDark = theme === "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content = isDark ? "#0f1419" : "#101828";

  document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.title = isDark ? "Light mode" : "Dark mode";
    const ico = btn.querySelector(".theme-toggle-ico");
    if(ico) ico.textContent = isDark ? "\u2600" : "\uD83C\uDF19";
  });

  document.querySelectorAll("[data-theme-option]").forEach(opt=>{
    opt.classList.toggle("active", opt.dataset.themeOption === theme);
  });
}

function wireThemeControls(){
  document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
    if(btn._themeWired) return;
    btn._themeWired = true;
    btn.addEventListener("click", toggleTheme);
  });
  document.querySelectorAll("[data-theme-option]").forEach(opt=>{
    if(opt._themeWired) return;
    opt._themeWired = true;
    opt.addEventListener("click", ()=> setTheme(opt.dataset.themeOption));
  });
}

export function initTheme(){
  setTheme(getTheme());
  wireThemeControls();
}
