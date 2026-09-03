import React from "react";
import { createRoot } from "react-dom/client";
import ProductMasterApp from "./ProductMasterApp.jsx";
import ProductSearchHost from "./ProductSearchHost.jsx";

let root = null;
let searchRoot = null;
let currentApi = null;
let currentSearchApi = null;

export function mountProductMaster(el, api){
  if(!el) throw new Error("Product Master mount element missing");
  currentApi = api;
  if(!root) root = createRoot(el);
  root.render(<ProductMasterApp api={currentApi} />);
}

export function refreshProductMaster(api){
  currentApi = api || currentApi;
  if(root && currentApi){
    root.render(<ProductMasterApp api={currentApi} />);
  }
}

export function unmountProductMaster(){
  root?.unmount();
  root = null;
  currentApi = null;
}

export function mountProductSearch(el, api){
  if(!el) throw new Error("Product Search mount element missing");
  currentSearchApi = api;
  if(!searchRoot) searchRoot = createRoot(el);
  searchRoot.render(<ProductSearchHost api={currentSearchApi} />);
}

export function refreshProductSearch(api){
  currentSearchApi = api || currentSearchApi;
  if(searchRoot && currentSearchApi){
    searchRoot.render(<ProductSearchHost api={currentSearchApi} />);
  }
}

export function unmountProductSearch(){
  searchRoot?.unmount();
  searchRoot = null;
  currentSearchApi = null;
}
