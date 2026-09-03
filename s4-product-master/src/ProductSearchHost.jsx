import React from "react";
import { PM_CSS } from "./product-master/pmStyles";
import GlobalSearchModal from "./product-master/modals/GlobalSearchModal.jsx";

export default function ProductSearchHost({ api }){
  return (
    <>
      <style>{PM_CSS}</style>
      <GlobalSearchModal
        products={api.products || []}
        shopPartEnabled={api.shopPartEnabled !== false}
        initialFields={api.initialFields || {}}
        onSelect={(product)=> api.onSelect?.(product)}
        onClose={()=> api.onClose?.()}
      />
    </>
  );
}
