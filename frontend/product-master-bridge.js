/** Wires the React Product Master bundle to Firestore + S4 tracker UI. */
import { addDoc, updateDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { downloadTextFile } from "./reports.js";

let pmMod = null;
let ctx = null;
let mounted = false;
let drawerMounted = false;
let replacementActive = false;
let searchDrawerMounted = false;
let searchSession = null;
let pmSession = null;
let mountEl = null;

const EXPORT_FIELDS = [
  "name", "code", "shopPartNumber", "barcode", "ean", "productGroup", "company",
  "category", "subcategory", "commodityCode", "description", "unit", "productType",
  "salesVat", "purchaseVat", "landingCost", "marginPerc", "marginAmount",
  "vatExclusive", "vatInclusive", "mrp", "defaultDiscount", "reorderMin", "reorderMax",
  "reorderQty", "rackLocation", "specificationText", "photoUrl"
];

function num(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function escCsv(v){
  const s = String(v ?? "");
  if(/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseBool(v){
  if(typeof v === "boolean") return v;
  return /^(1|true|yes|y)$/i.test(String(v ?? "").trim());
}

function normalizeImportRecord(record){
  const out = { ...record };
  ["unitPrices", "customUnits", "unitDefinitions", "customerTypes"].forEach((field)=>{
    if(!out[field]) return;
    if(typeof out[field] === "string"){
      try{ out[field] = JSON.parse(out[field]); }
      catch{ delete out[field]; }
    }
  });
  ["weightBarcode", "rateBarcode", "vatOnMrp", "multiCustomerRatesEnabled"].forEach((field)=>{
    if(out[field] != null && out[field] !== "") out[field] = parseBool(out[field]);
  });
  if(out.moreBarcodes && typeof out.moreBarcodes === "string"){
    out.moreBarcodes = out.moreBarcodes.split(/[;,|]/).map(s=> s.trim()).filter(Boolean);
  }
  const price = num(out.vatInclusive) || num(out.vatExclusive) || num(out.landingCost) || num(out.price);
  const vat = num(out.salesVat) || num(out.vat) || ctx.shopDefaultVat();
  return {
    ...out,
    price,
    vat,
    salesVat: String(out.salesVat ?? vat),
    purchaseVat: String(out.purchaseVat ?? vat),
    brand: out.company || out.brand || "",
    notes: out.description || out.notes || "",
    createdAt: Date.now(),
    createdBy: ctx.who(),
    updatedAt: Date.now(),
    updatedBy: ctx.who(),
  };
}

function productCompanies(products){
  const seen = new Set();
  const out = [];
  (products || []).forEach((p)=>{
    const name = String(p.company || p.brand || "").trim();
    if(!name) return;
    const key = name.toLowerCase();
    if(seen.has(key)) return;
    seen.add(key);
    out.push({ id: key, name });
  });
  return out.sort((a,b)=> a.name.localeCompare(b.name));
}

function buildApi(){
  const products = ctx.getProducts();
  const inDrawer = !!pmSession;
  return {
    shopId: ctx.shopId,
    products,
    companies: productCompanies(products),
    loading: false,
    defaultVat: ctx.shopDefaultVat(),
    shopPartEnabled: ctx.shopPartEnabled !== false,
    canDelete: ctx.isOwnerRole(),
    replacementActive,
    productMaintenanceActive: replacementActive,
    startNewOnMount: inDrawer,
    notify(message, kind){
      ctx.toast(message, kind === "err" ? "err" : "ok");
    },
    onClose(){
      if(pmSession){
        closeProductMasterDrawer();
        return;
      }
      const home = ctx.firstAllowedPage?.();
      if(home) ctx.showPage(home);
    },
    async onSave(form, selectedId){
      if(!ctx.requireModule("product-catalog")) throw new Error("No permission");
      const payload = normalizeImportRecord(form);
      delete payload.id;
      let ref;
      if(selectedId){
        await updateDoc(doc(ctx.db, "productCatalog", selectedId), payload);
        ref = { id: selectedId, ...payload };
      }else{
        const added = await addDoc(ctx.col("productCatalog"), payload);
        ref = { id: added.id, ...payload };
      }
      await ctx.logActivity?.({
        action: "edit",
        staffName: ctx.who(),
        module: "Product Catalog",
        summary: `Product saved ${payload.name}`,
      });
      if(pmSession){
        const saved = ref;
        const session = pmSession;
        closeProductMasterDrawer();
        if(session.onProductSaved) session.onProductSaved(saved);
      }
      return ref;
    },
    async onDelete(id){
      if(!ctx.requireModule("product-catalog")) throw new Error("No permission");
      if(!ctx.isOwnerRole()) throw new Error("Only owner can delete products");
      await ctx.deleteCatalogDocs("productCatalog", [id]);
      await ctx.logActivity?.({
        action: "delete",
        staffName: ctx.who(),
        module: "Product Catalog",
        summary: `Product deleted ${id}`,
      });
    },
    onExport(rows){
      const list = rows || products;
      const header = EXPORT_FIELDS.join(",");
      const body = list.map((p)=> EXPORT_FIELDS.map((f)=> escCsv(p[f])).join(",")).join("\n");
      const stamp = new Date().toISOString().slice(0, 10);
      downloadTextFile(`product-master-${stamp}.csv`, `${header}\n${body}`, "text/csv");
      ctx.toast(`Exported ${list.length} product(s)`);
    },
    async onImportRecords(records){
      if(!ctx.requireModule("product-catalog")) throw new Error("No permission");
      const rows = (records || []).map(normalizeImportRecord).filter(r=> String(r.name || "").trim());
      if(!rows.length) return { imported: 0, skipped: 0 };
      let imported = 0;
      const CHUNK = 400;
      for(let i = 0; i < rows.length; i += CHUNK){
        const batch = writeBatch(ctx.db);
        const slice = rows.slice(i, i + CHUNK);
        slice.forEach((row)=>{
          const ref = doc(ctx.col("productCatalog"));
          batch.set(ref, row);
        });
        await batch.commit();
        imported += slice.length;
      }
      await ctx.logActivity?.({
        action: "import",
        staffName: ctx.who(),
        module: "Product Catalog",
        summary: `Imported ${imported} products`,
      });
      replacementActive = false;
      return { imported, skipped: (records?.length || 0) - imported };
    },
    async onClearAll(){
      if(!ctx.isOwnerRole()) throw new Error("Only owner can clear products");
      const list = ctx.getProducts();
      if(list.length){
        const header = EXPORT_FIELDS.join(",");
        const body = list.map((p)=> EXPORT_FIELDS.map((f)=> escCsv(p[f])).join(",")).join("\n");
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        downloadTextFile(`product-master-backup-${stamp}.csv`, `${header}\n${body}`, "text/csv");
      }
      await ctx.deleteCatalogDocs("productCatalog", list.map(p=> p.id));
      replacementActive = true;
      await ctx.logActivity?.({
        action: "delete",
        staffName: ctx.who(),
        module: "Product Catalog",
        summary: `Cleared all ${list.length} products for replacement import`,
      });
      return { ok: true, deleted: list.length };
    },
    async onFinishReplacement(){
      replacementActive = false;
    },
    onPrintBarcodes(rows){
      const items = (rows || []).filter(r=> String(r.barcode || "").trim());
      if(!items.length) return ctx.toast("No barcodes to print", "err");
      const safe = (v)=> String(v ?? "").replace(/[<>&]/g, "");
      const labels = items.map((r)=> `<div class="label"><div class="pname">${safe(r.name)}</div><div class="code">${safe(r.barcode)}</div><div class="mrp">MRP: ${safe(r.mrp)}</div></div>`).join("");
      const win = window.open("", "_blank", "width=520,height=640");
      if(!win) return ctx.toast("Allow popups to print barcodes", "err");
      win.document.write(`<html><head><title>Print Barcodes</title><style>
        body{font-family:Arial,sans-serif;margin:10px}
        .label{text-align:center;border:1px dashed #999;padding:8px;margin:6px;display:inline-block;min-width:160px}
        .pname{font-size:11px;font-weight:600;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .code{font-family:monospace;font-size:14px;margin:6px 0}
        .mrp{font-size:11px}
      </style></head><body onload="window.print()">${labels}</body></html>`);
      win.document.close();
    },
    onGenerateWeighingFile(){},
  };
}

export function setProductMasterContext(next){
  ctx = next;
  if(mounted) refreshProductMasterPage();
  if(drawerMounted) refreshProductMasterDrawer();
  if(searchDrawerMounted) refreshProductSearchDrawer();
}

async function ensurePmMod(){
  if(!pmMod) pmMod = await import("./vendor/product-master/product-master.js");
  return pmMod;
}

function teardownMount(el){
  if(pmMod?.unmountProductMaster) pmMod.unmountProductMaster();
  if(el) el.innerHTML = "";
  mountEl = null;
}

export async function mountProductMasterPage(){
  const root = document.getElementById("productMasterRoot");
  if(!root || !ctx) return;
  try{
    if(mountEl && mountEl !== root) teardownMount(mountEl);
    const mod = await ensurePmMod();
    mod.mountProductMaster(root, buildApi());
    mountEl = root;
    mounted = true;
    drawerMounted = false;
  }catch(err){
    console.error("Product Master failed to load", err);
    root.innerHTML = `<div class="panel" style="margin:16px"><div class="panel-body"><p class="empty">Product Master module failed to load. Run <code>npm run build</code> in <code>s4-product-master</code>, then refresh.</p><p class="muted">${String(err?.message || err)}</p></div></div>`;
  }
}

export function refreshProductMasterPage(){
  if(!mounted || !pmMod || !ctx) return;
  const root = document.getElementById("productMasterRoot");
  if(root && pmMod.refreshProductMaster) pmMod.refreshProductMaster(buildApi());
}

export function unmountProductMasterPage(){
  const root = document.getElementById("productMasterRoot");
  teardownMount(root);
  mounted = false;
}

async function mountProductMasterDrawer(){
  const root = document.getElementById("productMasterDrawerRoot");
  if(!root || !ctx) return false;
  try{
    if(mountEl && mountEl !== root) teardownMount(mountEl);
    const mod = await ensurePmMod();
    mod.mountProductMaster(root, buildApi());
    mountEl = root;
    drawerMounted = true;
    mounted = false;
    return true;
  }catch(err){
    console.error("Product Master drawer failed to load", err);
    root.innerHTML = `<div class="panel" style="margin:16px"><div class="panel-body"><p class="empty">Product Master failed to load.</p><p class="muted">${String(err?.message || err)}</p></div></div>`;
    return false;
  }
}

function refreshProductMasterDrawer(){
  if(!drawerMounted || !pmMod || !ctx) return;
  const root = document.getElementById("productMasterDrawerRoot");
  if(root && pmMod.refreshProductMaster) pmMod.refreshProductMaster(buildApi());
}

export function closeProductMasterDrawer(){
  pmSession = null;
  const root = document.getElementById("productMasterDrawerRoot");
  if(drawerMounted){
    teardownMount(root);
    drawerMounted = false;
  }
  const el = document.getElementById("productMasterModal");
  if(el?.classList.contains("open")){
    el.classList.remove("open");
    el.style.display = "";
    el.style.zIndex = "";
  }
}

function teardownSearchMount(el){
  if(pmMod?.unmountProductSearch) pmMod.unmountProductSearch();
  if(el) el.innerHTML = "";
}

function buildSearchApi(){
  return {
    products: ctx.getProducts(),
    shopPartEnabled: ctx.shopPartEnabled !== false,
    initialFields: searchSession?.initialFields || {},
    onSelect(product){
      const session = searchSession;
      closeProductSearchDrawer();
      if(session?.onProductSelected) session.onProductSelected(product);
    },
    onClose(){
      closeProductSearchDrawer();
    },
  };
}

async function mountProductSearchDrawer(){
  const root = document.getElementById("piProductSearchRoot");
  if(!root || !ctx) return false;
  try{
    teardownSearchMount(root);
    const mod = await ensurePmMod();
    mod.mountProductSearch(root, buildSearchApi());
    searchDrawerMounted = true;
    return true;
  }catch(err){
    console.error("Product search failed to load", err);
    root.innerHTML = `<div class="panel" style="margin:16px"><div class="panel-body"><p class="empty">Product search failed to load.</p><p class="muted">${String(err?.message || err)}</p></div></div>`;
    return false;
  }
}

function refreshProductSearchDrawer(){
  if(!searchDrawerMounted || !pmMod || !ctx) return;
  const root = document.getElementById("piProductSearchRoot");
  if(root && pmMod.refreshProductSearch) pmMod.refreshProductSearch(buildSearchApi());
}

export function closeProductSearchDrawer(){
  searchSession = null;
  const root = document.getElementById("piProductSearchRoot");
  if(searchDrawerMounted){
    teardownSearchMount(root);
    searchDrawerMounted = false;
  }
  const el = document.getElementById("piProductSearchModal");
  if(el?.classList.contains("open")){
    el.classList.remove("open");
    el.style.display = "";
    el.style.zIndex = "";
  }
}

export async function openProductSearchDrawer(opts = {}){
  if(!ctx) return false;
  if(!ctx.requireModule("product-catalog")) return false;
  searchSession = {
    returnModalId: opts.returnModalId || "purchaseModal",
    onProductSelected: typeof opts.onProductSelected === "function" ? opts.onProductSelected : null,
    initialFields: opts.initialFields || {},
  };
  const ok = await mountProductSearchDrawer();
  if(!ok){
    searchSession = null;
    return false;
  }
  const keep = [searchSession.returnModalId].filter(Boolean);
  if(ctx.openFormModal){
    ctx.openFormModal("piProductSearchModal", { keepOpen: keep, skipPrepare: true });
  }
  return true;
}

export async function openProductMasterDrawer(opts = {}){
  if(!ctx) return false;
  if(!ctx.requireModule("product-catalog")){
    return false;
  }
  pmSession = {
    returnModalId: opts.returnModalId || "purchaseModal",
    onProductSaved: typeof opts.onProductSaved === "function" ? opts.onProductSaved : null,
  };
  const ok = await mountProductMasterDrawer();
  if(!ok){
    pmSession = null;
    return false;
  }
  const keep = [pmSession.returnModalId].filter(Boolean);
  if(ctx.openFormModal){
    ctx.openFormModal("productMasterModal", { keepOpen: keep, skipPrepare: true });
  }
  return true;
}
