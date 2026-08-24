import { generateKeyPairSync } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const force = args.has("--force");

const privateKeyPath = resolve("dev-private.jwk");
const publicKeyPath = resolve("dev-public.jwk");

if (!force && (existsSync(privateKeyPath) || existsSync(publicKeyPath))) {
  console.error("Refusing to overwrite existing key files. Use --force to replace dev keys.");
  process.exit(1);
}

const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "P-256",
});

const privateJwk = privateKey.export({ format: "jwk" });
const publicJwk = publicKey.export({ format: "jwk" });

writeFileSync(privateKeyPath, `${JSON.stringify(privateJwk, null, 2)}\n`, {
  mode: 0o600,
});
writeFileSync(publicKeyPath, `${JSON.stringify(publicJwk, null, 2)}\n`);

console.log(`Development private key written to ${privateKeyPath}`);
console.log(`Development public key written to ${publicKeyPath}`);
console.log("Do not place private keys in the customer app.");
