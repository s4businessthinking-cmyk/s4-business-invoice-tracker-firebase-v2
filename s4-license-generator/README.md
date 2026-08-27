# S4 License Generator — Invoice Tracker

Generates `S4-LIC-v1` keys for **S4-BUSINESS-INVOICE TRACKER**.

App ID baked into keys:

```text
com.s4.invoice.tracker
```

Keep this folder and `*-private.jwk` off customer builds. Only the public key is in `frontend/license.js`.

## Interactive (recommended)

```bat
generate-license-menu.bat
```

Ask the customer for the **device fingerprint** shown on the app’s license screen, then paste it when generating.

## CLI

```bat
generate-license.bat --customerName "ABC Motors" --shopName "ABC Main" --plan YEARLY --deviceFingerprint "CUSTOMER_FP"
```

Plans: `MONTHLY` (30d) · `YEARLY` (365d) · `LIFETIME` · `CUSTOM` (requires `--days N`)

## Customer app flow

1. App opens → license screen → shows device fingerprint  
2. Customer sends fingerprint to you  
3. You generate key here  
4. Customer pastes `S4-LIC-v1...` → Activate → Firebase → Login  


## License Format

Generated licenses use this format:

```text
S4-LIC-v1.<payloadBase64Url>.<signatureBase64Url>
```

The payload is JSON encoded as Base64URL. The signature is an ECDSA P-256 SHA-256 signature over the Base64URL payload string.

## Generate Development Keys Later

From this folder:

```bash
node generate-keypair.mjs
```

This creates:

```text
dev-private.jwk
dev-public.jwk
```

These keys are for development testing only. Do not use them as production keys.

If development key files already exist, the script refuses to overwrite them. To intentionally replace development keys:

```bash
node generate-keypair.mjs --force
```

## Generate A Test License Later

After creating a development keypair, run:

```bash
node generate-license.mjs sample-payload.json dev-private.jwk
```

The command prints one license key to stdout:

```text
S4-LIC-v1.<payloadBase64Url>.<signatureBase64Url>
```

## Generate A Customer-Style Development License

Use this command to create a unique license payload and signed license key with the existing development private key:

```bash
node .\generate-customer-license.mjs --customerName "ABC Motors" --shopName "ABC Main Branch" --plan YEARLY --deviceFingerprint "CUSTOMER_DEVICE_FINGERPRINT"
```

Windows shortcut:

```bat
generate-license.bat --customerName "ABC Motors" --shopName "ABC Main Branch" --plan YEARLY --deviceFingerprint "CUSTOMER_DEVICE_FINGERPRINT"
```

The customer generator:

- creates a unique `licenseId` using `crypto.randomUUID()`
- sets `issuedAt` and `notBefore` to the current time
- supports `MONTHLY`, `YEARLY`, `LIFETIME`, and `CUSTOM`
- defaults `maxDevices` to `1`
- optionally includes `deviceFingerprint`
- writes the license key to `license-output.txt`
- writes the signed payload to `last-license-payload.json`

Plan expiry rules:

```text
MONTHLY   expires 30 days from now
YEARLY    expires 365 days from now
LIFETIME  expiresAt is null
CUSTOM    expires --days N days from now (N required)
```

Optional max device count:

```bash
node .\generate-customer-license.mjs --customerName "ABC Motors" --shopName "ABC Main Branch" --plan MONTHLY --maxDevices 3
```

## Easy Interactive Generator

For normal Windows use, run:

```bat
generate-license-menu.bat
```

It asks step by step for:

- customer name
- shop name
- customer phone, optional
- plan: `MONTHLY`, `YEARLY`, `LIFETIME`, or `CUSTOM`
- custom day count when `CUSTOM` is selected
- device fingerprint
- note, optional

The interactive generator always binds the license to the device fingerprint and automatically creates a unique `licenseId`.

It saves:

```text
license-output.txt          latest license key
last-license-payload.json   latest signed payload
license-records.json        all issued license records
license-records.csv         all issued license records
```

The records include the license key, so keep them private.

## Important Security Rules

- Keep private keys local and secret.
- Never put private keys inside the customer app.
- Never bundle this generator into Web, Electron, or Android builds.
- Generate production private keys separately when the production license process is defined.
- Commit only safe source files. Do not commit generated private keys, generated license outputs, license records, `.env` files, or secret files.
