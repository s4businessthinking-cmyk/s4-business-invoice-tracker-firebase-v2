import { createPrivateKey, createSign, randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LICENSE_PREFIX = "S4-LIC-v1";
const APP_ID = "com.s4.invoice.tracker";
const VERSION = 1;
const DEFAULT_MAX_DEVICES = 1;
const PRIVATE_KEY_FILE = "production-private.jwk";
const LICENSE_OUTPUT_FILE = "license-output.txt";
const PAYLOAD_OUTPUT_FILE = "last-license-payload.json";

const FEATURES = [
  "firebase-sync",
  "web",
  "desktop",
  "android",
  "invoice-tracker",
  "receivables"
];

const PLAN_DAYS = {
  MONTHLY: 30,
  YEARLY: 365,
  LIFETIME: null,
  CUSTOM: "CUSTOM",
};

const scriptDir = dirname(fileURLToPath(import.meta.url));

function usage() {
  console.error(`Usage:
node .\\generate-customer-license.mjs --customerName "ABC Motors" --shopName "ABC Main Branch" --plan YEARLY [--deviceFingerprint "..."] [--maxDevices 1]

Plans:
  MONTHLY   expires 30 days from now
  YEARLY    expires 365 days from now
  LIFETIME  never expires
  CUSTOM    requires --days N (positive integer)`);
}

function readArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;

    const key = item.slice(2);
    const value = argv[i + 1];

    if (!value || value.startsWith("--")) {
      args[key] = "";
    } else {
      args[key] = value;
      i += 1;
    }
  }

  return args;
}

function requireText(args, key) {
  const value = String(args[key] || "").trim();
  if (!value) {
    throw new Error(`Missing required --${key}`);
  }
  return value;
}

function readPositiveInteger(value, fallback) {
  if (value == null || value === "") return fallback;

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("--maxDevices must be a positive integer.");
  }

  return parsed;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function signPayload(payload, privateJwk) {
  const payloadJson = JSON.stringify(payload);
  const payloadBase64Url = base64Url(payloadJson);
  const privateKey = createPrivateKey({ key: privateJwk, format: "jwk" });

  const signer = createSign("SHA256");
  signer.update(payloadBase64Url);
  signer.end();

  const signatureBase64Url = base64Url(signer.sign(privateKey));

  return `${LICENSE_PREFIX}.${payloadBase64Url}.${signatureBase64Url}`;
}

function buildPayload(args) {
  const customerName = requireText(args, "customerName");
  const shopName = requireText(args, "shopName");
  const plan = requireText(args, "plan").toUpperCase();

  if (!Object.prototype.hasOwnProperty.call(PLAN_DAYS, plan)) {
    throw new Error("--plan must be MONTHLY, YEARLY, LIFETIME, or CUSTOM.");
  }

  const now = new Date();
  let planDays = PLAN_DAYS[plan];
  if (plan === "CUSTOM") {
    planDays = readPositiveInteger(args.days, 0);
    if (!planDays) {
      throw new Error("CUSTOM plan requires --days N (positive integer).");
    }
  }
  const deviceFingerprint = String(args.deviceFingerprint || "").trim();

  const payload = {
    licenseId: randomUUID(),
    customerName,
    shopName,
    plan,
    status: "ACTIVE",
    issuedAt: now.toISOString(),
    notBefore: now.toISOString(),
    expiresAt: planDays == null ? null : addDays(now, planDays).toISOString(),
    maxDevices: readPositiveInteger(args.maxDevices, DEFAULT_MAX_DEVICES),
    features: FEATURES,
    appId: APP_ID,
    version: VERSION,
  };

  if (deviceFingerprint) {
    payload.deviceFingerprint = deviceFingerprint;
  }

  return payload;
}

try {
  const args = readArgs(process.argv.slice(2));
  const payload = buildPayload(args);
  const privateJwk = readJson(resolve(scriptDir, PRIVATE_KEY_FILE));
  const licenseKey = signPayload(payload, privateJwk);

  writeFileSync(resolve(scriptDir, LICENSE_OUTPUT_FILE), `${licenseKey}\n`);
  writeFileSync(resolve(scriptDir, PAYLOAD_OUTPUT_FILE), `${JSON.stringify(payload, null, 2)}\n`);

  console.log(licenseKey);
  console.log("");
  console.log(`License saved to ${LICENSE_OUTPUT_FILE}`);
  console.log(`Payload saved to ${PAYLOAD_OUTPUT_FILE}`);
} catch (error) {
  console.error(error?.message || String(error));
  usage();
  process.exit(1);
}

