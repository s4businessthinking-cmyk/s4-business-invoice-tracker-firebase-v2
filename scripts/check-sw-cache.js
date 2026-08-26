#!/usr/bin/env node
/** Fail if any frontend/*.js (except sw.js) is missing from sw.js CORE_ASSETS. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const frontend = path.join(root, "frontend");
const swPath = path.join(frontend, "sw.js");
const sw = fs.readFileSync(swPath, "utf8");
const m = sw.match(/const\s+CORE_ASSETS\s*=\s*\[([\s\S]*?)\];/);
if(!m){
  console.error("Could not find CORE_ASSETS in sw.js");
  process.exit(1);
}
const listed = new Set(
  [...m[1].matchAll(/['"]\.\/([^'"]+)['"]/g)].map(x=> x[1].replace(/^\.\//, ""))
);
const jsFiles = fs.readdirSync(frontend).filter(f=> f.endsWith(".js") && f !== "sw.js");
const missing = jsFiles.filter(f=> !listed.has(f));
if(missing.length){
  console.error("Missing from sw.js CORE_ASSETS:\n" + missing.map(f=> "  - " + f).join("\n"));
  process.exit(1);
}
console.log("OK — all frontend/*.js present in CORE_ASSETS (" + jsFiles.length + " files)");
