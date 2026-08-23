# Copy frontend → mobile/www then sync Capacitor Android
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $PSScriptRoot "package.json"))) {
  $root = $PSScriptRoot
  $mobile = Join-Path $root "mobile"
} else {
  $mobile = $PSScriptRoot
  $root = Split-Path $mobile -Parent
}
$frontend = Join-Path $root "frontend"
$www = Join-Path $mobile "www"

Write-Host "Copying frontend → mobile/www ..."
if (Test-Path $www) { Remove-Item $www -Recurse -Force }
Copy-Item $frontend $www -Recurse
# Capacitor prefers index at root of webDir
Write-Host "npm install + cap sync ..."
Set-Location $mobile
if (-not (Test-Path "node_modules")) { npm install }
if (-not (Test-Path "android")) {
  npx cap add android
} else {
  npx cap sync android
}
Write-Host "Done."
