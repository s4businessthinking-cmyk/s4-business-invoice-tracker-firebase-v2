import React, { useCallback, useMemo, useState } from "react";
import ProductMasterScreen from "./product-master/ProductMasterScreen.jsx";
import { DEFAULT_SHOP_PART_FORMAT, formatShopPartNumber, nextLocalShopPartSerial } from "./product-master/shopPartNumbers.js";

export const EMPTY_PRODUCT_FORM = {
  name: "",
  code: "",
  shopPartNumber: "",
  barcode: "",
  weightBarcode: false,
  rateBarcode: false,
  ean: "",
  moreBarcodes: [],
  productGroup: "",
  company: "",
  brand: "",
  category: "",
  subcategory: "",
  commodityCode: "",
  description: "",
  unit: "Pcs",
  productType: "Goods",
  salesVat: "5",
  purchaseVat: "5",
  landingCost: "",
  marginPerc: "",
  marginAmount: "",
  vatExclusive: "",
  vatInclusive: "",
  mrp: "",
  vatOnMrp: false,
  averageCost: "",
  multiCustomerRatesEnabled: false,
  unitPrices: [],
  customUnits: [],
  unitDefinitions: [],
  customerTypes: [],
  defaultDiscount: "",
  reorderMin: "",
  reorderMax: "",
  reorderQty: "",
  rackLocation: "",
  openingStock: "",
  openingRate: "",
  openingWarehouse: "",
  specificationText: "",
  photoUrl: "",
  notes: "",
};

function num(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function productToForm(product){
  if(!product) return { ...EMPTY_PRODUCT_FORM };
  return {
    ...EMPTY_PRODUCT_FORM,
    ...product,
    salesVat: String(product.salesVat ?? product.vat ?? "5"),
    purchaseVat: String(product.purchaseVat ?? product.vat ?? "5"),
    vatInclusive: product.vatInclusive ?? product.price ?? "",
    moreBarcodes: Array.isArray(product.moreBarcodes) ? product.moreBarcodes : [],
    unitPrices: Array.isArray(product.unitPrices) ? product.unitPrices : [],
  };
}

function formToFirestore(form){
  const price = num(form.vatInclusive) || num(form.vatExclusive) || num(form.landingCost) || 0;
  const vat = num(form.salesVat) || num(form.vat) || 5;
  return {
    ...form,
    price,
    vat,
    brand: form.company || form.brand || "",
  };
}

export default function ProductMasterApp({ api }){
  const [form, setForm] = useState({ ...EMPTY_PRODUCT_FORM });
  const [selectedId, setSelectedId] = useState("");
  const [listQuery, setListQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const products = api.products || [];
  const companies = api.companies || [];

  const filteredProducts = useMemo(()=>{
    const q = String(listQuery || "").trim().toLowerCase();
    if(!q) return products;
    return products.filter(p=>{
      const blob = `${p.name||""} ${p.code||""} ${p.barcode||""} ${p.shopPartNumber||""} ${p.category||""} ${p.company||""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [products, listQuery]);

  const upd = useCallback((key, value)=>{
    setForm(prev=> ({ ...prev, [key]: value }));
  }, []);

  const notify = useCallback((message, kind)=>{
    api.notify?.(message, kind);
  }, [api]);

  const onNew = useCallback(()=>{
    setSelectedId("");
    setForm({
      ...EMPTY_PRODUCT_FORM,
      salesVat: String(api.defaultVat ?? "5"),
      purchaseVat: String(api.defaultVat ?? "5"),
    });
  }, [api.defaultVat]);

  React.useEffect(()=>{
    if(api.startNewOnMount) onNew();
  }, [api.startNewOnMount, onNew]);

  const onSelectProduct = useCallback((product)=>{
    if(!product) return;
    setSelectedId(product.id || "");
    setForm(productToForm(product));
  }, []);

  const onSave = useCallback(async ()=>{
    const name = String(form.name || "").trim();
    if(!name){
      notify("Product name required", "err");
      return;
    }
    setSaving(true);
    try{
      let payload = formToFirestore(form);
      if(api.shopPartEnabled && !String(payload.shopPartNumber || "").trim()){
        const serial = nextLocalShopPartSerial(products);
        const fmt = api.shopPartFormat || DEFAULT_SHOP_PART_FORMAT;
        payload.shopPartNumber = formatShopPartNumber(serial, payload.code || payload.name, fmt, payload);
        payload.shopPartSerial = serial;
        setForm(prev=> ({ ...prev, shopPartNumber: payload.shopPartNumber, shopPartSerial: serial }));
      }
      const saved = await api.onSave?.(payload, selectedId);
      if(saved?.id){
        setSelectedId(saved.id);
        setForm(productToForm(saved));
      }
      notify("Product saved", "ok");
    }catch(err){
      notify(String(err?.message || err), "err");
    }finally{
      setSaving(false);
    }
  }, [api, form, products, selectedId, notify]);

  const onDelete = useCallback(async ()=>{
    if(!selectedId) return;
    if(!window.confirm(`Delete product "${form.name}"?`)) return;
    try{
      await api.onDelete?.(selectedId);
      onNew();
      notify("Product deleted", "ok");
    }catch(err){
      notify(String(err?.message || err), "err");
    }
  }, [api, form.name, onNew, selectedId, notify]);

  const onExport = useCallback(()=> api.onExport?.(products), [api, products]);

  const onImportRecords = useCallback(async (records)=>{
    return api.onImportRecords?.(records);
  }, [api]);

  const onClearAll = useCallback(async ()=>{
    setClearing(true);
    try{
      return await api.onClearAll?.();
    }finally{
      setClearing(false);
    }
  }, [api]);

  return (
    <ProductMasterScreen
      shopId={api.shopId || "default"}
      products={products}
      filteredProducts={filteredProducts}
      productsLoading={!!api.loading}
      companies={companies}
      form={form}
      upd={upd}
      selectedId={selectedId}
      canDelete={!!api.canDelete}
      saving={saving}
      onNew={onNew}
      onSave={onSave}
      onDelete={onDelete}
      onClose={()=> api.onClose?.()}
      onSelectProduct={onSelectProduct}
      onExport={onExport}
      onImportRecords={onImportRecords}
      onClearAll={onClearAll}
      clearingProducts={clearing}
      replacementActive={!!api.replacementActive}
      onFinishReplacement={api.onFinishReplacement}
      productMaintenanceActive={!!api.productMaintenanceActive}
      onGenerateWeighingFile={api.onGenerateWeighingFile}
      onPrintBarcodes={api.onPrintBarcodes}
      notify={notify}
      shopPartEnabled={!!api.shopPartEnabled}
      listQuery={listQuery}
      onListQueryChange={setListQuery}
      showOpeningTools={false}
      showWeighingExport={false}
      hideArabicName
    />
  );
}
