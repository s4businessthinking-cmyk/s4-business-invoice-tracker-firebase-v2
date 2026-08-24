import { createPrivateKey, createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LICENSE_PREFIX = "S4-LIC-v1";

function usage() {
  console.error("Usage: node generate-license.mjs <payload.json> <private-key.jwk>");
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(resolve(filePath), "utf8"));
}

const [, , payloadPath, privateKeyPath] = process.argv;

if (!payloadPath || !privateKeyPath) {
  usage();
  process.exit(1);
}

const payload = readJson(payloadPath);
const privateJwk = readJson(privateKeyPath);
const privateKey = createPrivateKey({ key: privateJwk, format: "jwk" });

const payloadJson = JSON.stringify(payload);
const payloadBase64Url = base64Url(payloadJson);

const signer = createSign("SHA256");
signer.update(payloadBase64Url);
signer.end();

const signature = signer.sign(privateKey);
const signatureBase64Url = base64Url(signature);

console.log(`${LICENSE_PREFIX}.${payloadBase64Url}.${signatureBase64Url}`);
