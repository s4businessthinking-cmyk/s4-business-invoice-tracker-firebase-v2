import { webcrypto } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const privatePath = path.resolve("production-private.jwk");
const publicPath = path.resolve("production-public.jwk");

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

if (await exists(privatePath) || await exists(publicPath)) {
  console.error("Production key already exists. I will not overwrite it.");
  console.error("Delete production-private.jwk and production-public.jwk manually only if you really want to create new production keys.");
  process.exit(1);
}

const keyPair = await webcrypto.subtle.generateKey(
  {
    name: "ECDSA",
    namedCurve: "P-256",
  },
  true,
  ["sign", "verify"]
);

const privateJwk = await webcrypto.subtle.exportKey("jwk", keyPair.privateKey);
const publicJwk = await webcrypto.subtle.exportKey("jwk", keyPair.publicKey);

await fs.writeFile(privatePath, JSON.stringify(privateJwk, null, 2), "utf8");
await fs.writeFile(publicPath, JSON.stringify(publicJwk, null, 2), "utf8");

console.log("Production keypair created:");
console.log("PRIVATE:", privatePath);
console.log("PUBLIC :", publicPath);
console.log("");
console.log("IMPORTANT:");
console.log("production-private.jwk = SECRET. Never share, never commit.");
console.log("production-public.jwk  = Safe to put inside customer app.");
