// ============================================================
// S4 License + 15-day trial — S4-LIC-v1 (s4-license-generator)
// Fingerprint is hardware/machine based (not random) so reinstall
// on the same PC keeps the same fingerprint.
// ============================================================

export const LICENSE_KEY_PREFIX = "S4-LIC-v1";
export const LICENSE_APP_ID = "com.s4.invoice.tracker";
export const LICENSE_STORAGE_KEY = "s4_invoice_license_v1";
export const TRIAL_STORAGE_KEY = "s4_invoice_trial_v1";
export const TRIAL_DAYS = 15;

const LICENSE_PLANS = new Set(["LIFETIME", "MONTHLY", "YEARLY", "CUSTOM"]);
const DAY_MS = 24 * 60 * 60 * 1000;

const LICENSE_PUBLIC_KEY_JWK = {
  kty: "EC",
  crv: "P-256",
  x: "WiSfAOqBS1xH9jSSkapz39DiY1VZSp79KIGoq1LQ24E",
  y: "85tpm-ntlp8d4-tuekifXYG5pjPtxzKQ_mpGbBvJCHo"
};

export const LICENSE_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  INVALID: "INVALID",
  NOT_FOUND: "NOT_FOUND",
  TRIAL_ACTIVE: "TRIAL_ACTIVE",
  TRIAL_EXPIRED: "TRIAL_EXPIRED"
};

function getCrypto(){
  const c = globalThis.crypto;
  if(!c?.subtle) throw new Error("Web Crypto API required");
  return c;
}

function bytesToHex(bytes){
  return [...bytes].map(b=> b.toString(16).padStart(2,"0")).join("");
}

async function sha256Hex(value){
  const digest = await getCrypto().subtle.digest("SHA-256", new TextEncoder().encode(String(value||"")));
  return bytesToHex(new Uint8Array(digest));
}

/** Show partial fingerprint with stars (full value still used for copy/license) */
export function maskFingerprint(fp){
  const s = String(fp||"");
  if(s.length <= 16) return s ? s.slice(0,2) + "*".repeat(Math.max(0,s.length-4)) + s.slice(-2) : "—";
  return s.slice(0, 8) + "*".repeat(Math.min(24, s.length - 16)) + s.slice(-8);
}

function normalizeBase64Url(value){
  const n = String(value||"").replace(/-/g,"+").replace(/_/g,"/");
  const pad = n.length % 4 === 0 ? "" : "=".repeat(4 - (n.length % 4));
  return n + pad;
}

function base64UrlToBytes(value){
  const binary = atob(normalizeBase64Url(value));
  const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlToText(value){
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function readDerLength(bytes, offset){
  const first = bytes[offset];
  if(first < 0x80) return { length: first, nextOffset: offset + 1 };
  const lengthBytes = first & 0x7f;
  let length = 0;
  for(let i=0;i<lengthBytes;i++) length = (length << 8) | bytes[offset + 1 + i];
  return { length, nextOffset: offset + 1 + lengthBytes };
}

function derIntegerToFixedBytes(bytes, offset, size){
  if(bytes[offset] !== 0x02) throw new Error("Invalid DER signature");
  const { length, nextOffset } = readDerLength(bytes, offset + 1);
  const integerBytes = bytes.slice(nextOffset, nextOffset + length);
  const unsigned = integerBytes[0] === 0 ? integerBytes.slice(1) : integerBytes;
  if(unsigned.length > size) throw new Error("Invalid DER integer size");
  const fixed = new Uint8Array(size);
  fixed.set(unsigned, size - unsigned.length);
  return { bytes: fixed, nextOffset: nextOffset + length };
}

function normalizeEcdsaP256Signature(signatureBytes){
  if(signatureBytes.length === 64) return signatureBytes;
  if(signatureBytes[0] !== 0x30) return signatureBytes;
  const { nextOffset } = readDerLength(signatureBytes, 1);
  const r = derIntegerToFixedBytes(signatureBytes, nextOffset, 32);
  const s = derIntegerToFixedBytes(signatureBytes, r.nextOffset, 32);
  const raw = new Uint8Array(64);
  raw.set(r.bytes, 0);
  raw.set(s.bytes, 32);
  return raw;
}

/** Stable machine seed — same PC after reinstall (Electron MachineGuid / browser hardware profile) */
async function getStableMachineSeed(){
  try{
    if(typeof window !== "undefined" && window.s4Desktop?.getMachineId){
      const id = await window.s4Desktop.getMachineId();
      if(id && String(id).trim()) return "win:" + String(id).trim().toLowerCase();
    }
  }catch(_){}

  // Browser/PWA: stable signals only — exclude screen width/height/colorDepth
  // (orientation / zoom / external monitor can change them and invalidate a device-locked license).
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const parts = [
    nav.userAgentData?.platform || nav.platform || "",
    String(nav.hardwareConcurrency || ""),
    String(nav.deviceMemory || ""),
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    nav.userAgentData?.architecture || "",
    nav.userAgentData?.bitness || ""
  ];
  return "web:" + parts.join("|");
}

export async function createDeviceFingerprint(){
  const seed = await getStableMachineSeed();
  return sha256Hex(`${LICENSE_APP_ID}:${seed}`);
}

export function normalizeLicenseKey(licenseKey){
  return String(licenseKey||"").trim().replace(/\s+/g,"");
}

export function parseLicenseKey(licenseKey){
  const normalizedKey = normalizeLicenseKey(licenseKey);
  const parts = normalizedKey.split(".");
  if(parts.length !== 3 || parts[0] !== LICENSE_KEY_PREFIX){
    return { ok:false, reason:"INVALID_LICENSE_KEY_FORMAT", normalizedKey };
  }
  try{
    const payload = JSON.parse(base64UrlToText(parts[1]));
    return {
      ok:true,
      normalizedKey,
      payloadPart: parts[1],
      signaturePart: parts[2],
      payload,
      signingInput: `${parts[0]}.${parts[1]}`
    };
  }catch{
    return { ok:false, reason:"INVALID_LICENSE_PAYLOAD_ENCODING", normalizedKey };
  }
}

async function verifySignature(signingInput, signatureBytes){
  const publicKey = await getCrypto().subtle.importKey(
    "jwk",
    LICENSE_PUBLIC_KEY_JWK,
    { name:"ECDSA", namedCurve:"P-256" },
    false,
    ["verify"]
  );
  const normalized = normalizeEcdsaP256Signature(signatureBytes);
  return getCrypto().subtle.verify(
    { name:"ECDSA", hash:"SHA-256" },
    publicKey,
    normalized,
    new TextEncoder().encode(signingInput)
  );
}

function validatePayload(payload, { deviceFingerprint }){
  if(!payload || typeof payload !== "object") return { ok:false, reason:"INVALID_PAYLOAD" };
  const required = ["licenseId","customerName","shopName","plan","status","issuedAt","notBefore","maxDevices","features","appId","version"];
  const missing = required.filter(k=>{
    if(k === "features") return !Array.isArray(payload.features);
    return payload[k] == null || payload[k] === "";
  });
  if(missing.length) return { ok:false, reason:"MISSING_PAYLOAD_FIELDS", missing };

  const plan = String(payload.plan||"").toUpperCase();
  if(!LICENSE_PLANS.has(plan)) return { ok:false, reason:"INVALID_LICENSE_PLAN" };
  if(payload.status !== "ACTIVE") return { ok:false, reason:"LICENSE_STATUS_NOT_ACTIVE" };
  if(payload.appId !== LICENSE_APP_ID) return { ok:false, reason:"LICENSE_APP_MISMATCH", expected: LICENSE_APP_ID, got: payload.appId };

  const now = Date.now();
  const nbf = new Date(payload.notBefore).getTime();
  if(!Number.isFinite(nbf) || now < nbf - 60000) return { ok:false, reason:"LICENSE_NOT_YET_VALID" };

  if(payload.expiresAt){
    const exp = new Date(payload.expiresAt).getTime();
    if(!Number.isFinite(exp)) return { ok:false, reason:"INVALID_EXPIRES_AT" };
    if(now > exp) return { ok:false, status: LICENSE_STATUS.EXPIRED, reason:"LICENSE_EXPIRED" };
  }

  const boundFp = String(payload.deviceFingerprint||"").trim();
  if(boundFp && boundFp !== deviceFingerprint){
    return { ok:false, reason:"DEVICE_FINGERPRINT_MISMATCH" };
  }

  const maxDevices = Number(payload.maxDevices);
  if(!Number.isInteger(maxDevices) || maxDevices < 1){
    return { ok:false, reason:"INVALID_MAX_DEVICES" };
  }
  // Offline product: one fingerprint bind when set; maxDevices is contractual metadata
  // (no online multi-device registry).

  return { ok:true, plan };
}

export async function verifyLicenseKey(licenseKey){
  try{
    const parsed = parseLicenseKey(licenseKey);
    if(!parsed.ok) return { ok:false, status:LICENSE_STATUS.INVALID, reason: parsed.reason };

    const deviceFingerprint = await createDeviceFingerprint();
    const payloadCheck = validatePayload(parsed.payload, { deviceFingerprint });
    if(!payloadCheck.ok){
      return {
        ok:false,
        status: payloadCheck.status || LICENSE_STATUS.INVALID,
        reason: payloadCheck.reason,
        missing: payloadCheck.missing,
        expected: payloadCheck.expected,
        got: payloadCheck.got,
        payload: parsed.payload,
        deviceFingerprint
      };
    }

    const sigBytes = base64UrlToBytes(parsed.signaturePart);
    const okPayload = await verifySignature(parsed.payloadPart, sigBytes);
    const okFull = okPayload || await verifySignature(parsed.signingInput, sigBytes);
    if(!okFull){
      return { ok:false, status:LICENSE_STATUS.INVALID, reason:"SIGNATURE_INVALID", deviceFingerprint, payload: parsed.payload };
    }

    return {
      ok:true,
      status: LICENSE_STATUS.ACTIVE,
      reason: "LICENSE_VALID",
      payload: parsed.payload,
      deviceFingerprint,
      normalizedKey: parsed.normalizedKey
    };
  }catch(e){
    return { ok:false, status:LICENSE_STATUS.INVALID, reason:"LICENSE_VERIFY_FAILED", error: e.message||String(e) };
  }
}

export async function activateLicense(licenseKey){
  const verification = await verifyLicenseKey(licenseKey);
  if(!verification.ok) return { ...verification, stored:false };

  const record = {
    key: verification.normalizedKey,
    status: verification.status,
    payload: verification.payload,
    deviceFingerprint: verification.deviceFingerprint,
    activatedAt: new Date().toISOString()
  };
  localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(record));
  let desktopStored = null;
  try{
    if(window.s4Desktop?.saveLicenseRecord){
      desktopStored = await window.s4Desktop.saveLicenseRecord(record) === true;
      if(!desktopStored){
        // Both desktop paths failed to write — license survives only in localStorage,
        // so clearing browser data would lose the activation.
        console.warn("Desktop license record was not persisted to disk.");
      }
    }
  }catch(err){
    desktopStored = false;
    console.warn("saveLicenseRecord failed:", err);
  }
  return { ...verification, stored:true, desktopStored, record };
}

export function loadStoredLicense(){
  try{
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(_){}
  return null;
}

async function loadTrialRecord(fingerprint){
  let local = null;
  try{
    local = JSON.parse(localStorage.getItem(TRIAL_STORAGE_KEY) || "null");
  }catch(_){ local = null; }

  let desktop = null;
  try{
    if(window.s4Desktop?.loadTrialRecord) desktop = await window.s4Desktop.loadTrialRecord();
  }catch(_){}

  const candidates = [local, desktop].filter(r=> r && r.fingerprint === fingerprint && r.firstSeenAt);
  if(!candidates.length) return null;
  // earliest firstSeen wins (cannot reset trial by clearing only localStorage)
  candidates.sort((a,b)=> String(a.firstSeenAt).localeCompare(String(b.firstSeenAt)));
  return candidates[0];
}

async function saveTrialRecord(record){
  localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(record));
  try{
    if(window.s4Desktop?.saveTrialRecord){
      const ok = await window.s4Desktop.saveTrialRecord(record);
      // If neither desktop path is writable the trial clock can be reset by
      // clearing localStorage, so make that visible in logs.
      if(ok !== true) console.warn("Desktop trial record was not persisted to disk.");
    }
  }catch(err){
    console.warn("saveTrialRecord failed:", err);
  }
}

export async function ensureTrialStarted(fingerprint){
  const existing = await loadTrialRecord(fingerprint);
  if(existing){
    // keep both stores in sync
    await saveTrialRecord(existing);
    return existing;
  }
  const record = { fingerprint, firstSeenAt: new Date().toISOString(), trialDays: TRIAL_DAYS };
  await saveTrialRecord(record);
  return record;
}

export async function getTrialStatus(fingerprint){
  const fp = fingerprint || await createDeviceFingerprint();
  const trial = await ensureTrialStarted(fp);
  const startMs = new Date(trial.firstSeenAt).getTime();
  const endsAt = startMs + TRIAL_DAYS * DAY_MS;
  const now = Date.now();
  const daysRemaining = Math.max(0, Math.ceil((endsAt - now) / DAY_MS));
  const active = now <= endsAt;
  return {
    fingerprint: fp,
    firstSeenAt: trial.firstSeenAt,
    trialEndsAt: new Date(endsAt).toISOString(),
    daysRemaining,
    active,
    status: active ? LICENSE_STATUS.TRIAL_ACTIVE : LICENSE_STATUS.TRIAL_EXPIRED
  };
}

/**
 * Access gate: license OR active 15-day trial.
 * Does NOT block first-run with license screen — trial starts automatically.
 */
export async function getAccessStatus(){
  const deviceFingerprint = await createDeviceFingerprint();
  const maskedFingerprint = maskFingerprint(deviceFingerprint);

  // Prefer desktop-stored license if localStorage empty (reinstall same PC)
  let stored = loadStoredLicense();
  if(!stored?.key){
    try{
      if(window.s4Desktop?.loadLicenseRecord){
        const desk = await window.s4Desktop.loadLicenseRecord();
        if(desk?.key){
          stored = desk;
          localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(desk));
        }
      }
    }catch(_){}
  }

  let blockedReason = "TRIAL_EXPIRED";
  if(stored?.key){
    const verification = await verifyLicenseKey(stored.key);
    if(verification.ok){
      let daysRemaining = null;
      const expIso = verification.payload?.expiresAt;
      if(expIso){
        const exp = new Date(expIso).getTime();
        if(Number.isFinite(exp)){
          daysRemaining = Math.max(0, Math.ceil((exp - Date.now()) / 86400000));
        }
      }
      return {
        allowed: true,
        mode: "license",
        status: LICENSE_STATUS.ACTIVE,
        payload: verification.payload,
        deviceFingerprint,
        maskedFingerprint,
        daysRemaining,
        expiresAt: expIso || null
      };
    }
    if(verification.reason === "LICENSE_EXPIRED") blockedReason = "LICENSE_EXPIRED";
    // invalid/expired license → fall through to trial check
  }

  const trial = await getTrialStatus(deviceFingerprint);
  if(trial.active){
    return {
      allowed: true,
      mode: "trial",
      status: LICENSE_STATUS.TRIAL_ACTIVE,
      deviceFingerprint,
      maskedFingerprint,
      daysRemaining: trial.daysRemaining,
      trialEndsAt: trial.trialEndsAt,
      firstSeenAt: trial.firstSeenAt
    };
  }

  return {
    allowed: false,
    mode: "blocked",
    status: LICENSE_STATUS.TRIAL_EXPIRED,
    reason: blockedReason,
    deviceFingerprint,
    maskedFingerprint,
    daysRemaining: 0,
    trialEndsAt: trial.trialEndsAt,
    firstSeenAt: trial.firstSeenAt
  };
}

/** @deprecated use getAccessStatus — kept for settings */
export async function getLicenseGateStatus(){
  const access = await getAccessStatus();
  if(access.mode === "license"){
    return { ok:true, status: access.status, payload: access.payload, deviceFingerprint: access.deviceFingerprint };
  }
  if(access.mode === "trial"){
    return {
      ok:true,
      status: access.status,
      deviceFingerprint: access.deviceFingerprint,
      daysRemaining: access.daysRemaining,
      trialEndsAt: access.trialEndsAt,
      reason: "TRIAL_ACTIVE"
    };
  }
  return {
    ok:false,
    status: access.status,
    reason: access.reason || "TRIAL_EXPIRED",
    deviceFingerprint: access.deviceFingerprint,
    daysRemaining: 0
  };
}

export function licenseErrorText(reason){
  const map = {
    INVALID_LICENSE_KEY_FORMAT: "License key format invalid. Must start with S4-LIC-v1.",
    INVALID_LICENSE_PAYLOAD_ENCODING: "License payload is corrupt.",
    MISSING_PAYLOAD_FIELDS: "License payload incomplete.",
    INVALID_LICENSE_PLAN: "Unknown license plan.",
    LICENSE_STATUS_NOT_ACTIVE: "License is not ACTIVE.",
    LICENSE_APP_MISMATCH: "This key is for a different S4 app. Generate a key for Invoice Tracker.",
    LICENSE_NOT_YET_VALID: "License is not valid yet.",
    LICENSE_EXPIRED: "License expired. Contact S4 for renewal.",
    DEVICE_FINGERPRINT_MISMATCH: "This license is locked to another PC. Ask for a key with this PC’s fingerprint.",
    INVALID_MAX_DEVICES: "License maxDevices must be a positive integer.",
    SIGNATURE_INVALID: "License signature invalid (wrong or tampered key).",
    LICENSE_VERIFY_FAILED: "Could not verify license.",
    TRIAL_EXPIRED: "15-day free trial ended. Activate a license in Settings.",
    NO_LICENSE: "Enter your S4 license key to continue."
  };
  return map[reason] || reason || "License error";
}
