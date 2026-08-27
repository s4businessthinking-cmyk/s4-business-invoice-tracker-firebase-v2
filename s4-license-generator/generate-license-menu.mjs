import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createPrivateKey, createSign, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LICENSE_PREFIX = "S4-LIC-v1";
const APP_ID = "com.s4.invoice.tracker";
const VERSION = 1;
const MAX_DEVICES = 1;
const PRIVATE_KEY_FILE = "production-private.jwk";
const LICENSE_OUTPUT_FILE = "license-output.txt";
const PAYLOAD_OUTPUT_FILE = "last-license-payload.json";
const RECORDS_JSON_FILE = "license-records.json";
const RECORDS_CSV_FILE = "license-records.csv";

const FEATURES = [
  "firebase-sync",
  "web",
  "desktop",
  "android",
  "invoice-tracker",
  "receivables"
];

// CUSTOM has no fixed length — askCustomDays() supplies the day count.
const PLAN_DAYS = {
  MONTHLY: 30,
  YEARLY: 365,
  LIFETIME: null,
  CUSTOM: null,
};

const scriptDir = dirname(fileURLToPath(import.meta.url));

function base64Url(inputValue) {
  return Buffer.from(inputValue)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function signPayload(payload, privateJwk) {
  const payloadJson = JSON.stringify(payload);
  const payloadBase64Url = base64Url(payloadJson);
  const privateKey = createPrivateKey({ key: privateJwk, format: "jwk" });

  const signer = createSign("SHA256");
  signer.update(payloadBase64Url);
  signer.end();

  return `${LICENSE_PREFIX}.${payloadBase64Url}.${base64Url(signer.sign(privateKey))}`;
}

async function askRequired(rl, prompt) {
  while (true) {
    const value = (await rl.question(prompt)).trim();
    if (value) return value;
    console.log("This field is required.");
  }
}

async function askOptional(rl, prompt) {
  return (await rl.question(prompt)).trim();
}

async function askPlan(rl) {
  const choices = new Set(["MONTHLY", "YEARLY", "LIFETIME", "CUSTOM"]);

  while (true) {
    const value = (await rl.question("Plan (MONTHLY / YEARLY / LIFETIME / CUSTOM): "))
      .trim()
      .toUpperCase();

    if (choices.has(value)) return value;
    console.log("Please enter MONTHLY, YEARLY, LIFETIME, or CUSTOM.");
  }
}

async function askCustomDays(rl) {
  while (true) {
    const value = (await rl.question("Custom days: ")).trim();
    const days = Number.parseInt(value, 10);

    if (Number.isInteger(days) && days > 0) return days;
    console.log("Please enter a positive number of days.");
  }
}

function readExistingRecords() {
  const filePath = resolve(scriptDir, RECORDS_JSON_FILE);
  if (!existsSync(filePath)) return [];

  try {
    const records = JSON.parse(readFileSync(filePath, "utf8"));
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function appendRecord(record) {
  const jsonPath = resolve(scriptDir, RECORDS_JSON_FILE);
  const csvPath = resolve(scriptDir, RECORDS_CSV_FILE);
  const records = readExistingRecords();

  records.push(record);
  writeFileSync(jsonPath, `${JSON.stringify(records, null, 2)}\n`);

  const columns = [
    "licenseId",
    "customerName",
    "shopName",
    "phone",
    "plan",
    "days",
    "issuedAt",
    "expiresAt",
    "deviceFingerprint",
    "note",
    "licenseKey",
  ];

  const row = columns.map((column) => csvEscape(record[column])).join(",");
  const csvContent = existsSync(csvPath)
    ? `${readFileSync(csvPath, "utf8").trimEnd()}\n${row}\n`
    : `${columns.join(",")}\n${row}\n`;

  writeFileSync(csvPath, csvContent);
}

function buildPayload({ customerName, shopName, phone, plan, days, issuedAt, expiresAt, deviceFingerprint, note }) {
  return {
    licenseId: randomUUID(),
    customerName,
    shopName,
    phone,
    plan,
    status: "ACTIVE",
    issuedAt,
    notBefore: issuedAt,
    expiresAt,
    maxDevices: MAX_DEVICES,
    features: FEATURES,
    appId: APP_ID,
    version: VERSION,
    deviceFingerprint,
    note,
    days,
  };
}

async function main() {
  const rl = createInterface({ input, output });

  try {
    console.log("S4 License Generator");
    console.log("--------------------");

    const customerName = await askRequired(rl, "Customer name: ");
    const shopName = await askRequired(rl, "Shop name: ");
    const phone = await askOptional(rl, "Customer phone (optional): ");
    const plan = await askPlan(rl);
    const days = plan === "CUSTOM" ? await askCustomDays(rl) : PLAN_DAYS[plan];
    const deviceFingerprint = await askRequired(rl, "Device fingerprint: ");
    const note = await askOptional(rl, "Note (optional): ");

    const now = new Date();
    const issuedAt = now.toISOString();
    const expiresAt = days == null ? null : addDays(now, days).toISOString();
    const payload = buildPayload({
      customerName,
      shopName,
      phone,
      plan,
      days,
      issuedAt,
      expiresAt,
      deviceFingerprint,
      note,
    });

    const privateJwk = readJson(resolve(scriptDir, PRIVATE_KEY_FILE));
    const licenseKey = signPayload(payload, privateJwk);
    const record = {
      licenseId: payload.licenseId,
      customerName,
      shopName,
      phone,
      plan,
      days,
      issuedAt,
      expiresAt,
      deviceFingerprint,
      note,
      licenseKey,
    };

    writeFileSync(resolve(scriptDir, LICENSE_OUTPUT_FILE), `${licenseKey}\n`);
    writeFileSync(resolve(scriptDir, PAYLOAD_OUTPUT_FILE), `${JSON.stringify(payload, null, 2)}\n`);
    appendRecord(record);

    console.log("");
    console.log("License key:");
    console.log(licenseKey);
    console.log("");
    console.log(`Saved latest license to ${LICENSE_OUTPUT_FILE}`);
    console.log(`Saved latest payload to ${PAYLOAD_OUTPUT_FILE}`);
    console.log(`Appended record to ${RECORDS_JSON_FILE}`);
    console.log(`Appended record to ${RECORDS_CSV_FILE}`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error?.message || String(error));
  process.exit(1);
});

