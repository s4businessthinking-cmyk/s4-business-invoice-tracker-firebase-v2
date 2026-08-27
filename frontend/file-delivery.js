// Deliver files on Web/PWA/Desktop AND Capacitor Android.
// Android WebView ignores <a download> and iframe.print() — use Filesystem + Share.
// PC browser + Electron exe → always direct <a download> (no Windows Share sheet).
// Phone browser/PWA only → optional Web Share before download.

export function isAndroidNative(){
  try{
    return !!(window.Capacitor?.isNativePlatform?.() &&
      String(window.Capacitor.getPlatform?.() || "").toLowerCase() === "android");
  }catch(_){ return false; }
}

export function isNativeShell(){
  try{
    return !!(window.Capacitor?.isNativePlatform?.() || window.s4Desktop);
  }catch(_){ return !!window.s4Desktop; }
}

/** PC browser or Electron — never use OS Share sheet for PDF/CSV. */
export function isDesktopClient(){
  if(typeof window !== "undefined" && window.s4Desktop) return true;
  if(isAndroidNative()) return false;
  try{
    if(window.Capacitor?.isNativePlatform?.()) return false;
  }catch(_){}
  const ua = navigator.userAgent || "";
  if(/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return false;
  if(/Windows NT|Macintosh|Mac OS X|Linux x86_64|CrOS/i.test(ua)) return true;
  try{
    if(window.matchMedia?.("(pointer: fine) and (hover: hover)").matches) return true;
  }catch(_){}
  return false;
}

function blobToBase64(blob){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || "");
      resolve(s.includes(",") ? s.split(",")[1] : s);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function webDownloadBlob(filename, blob){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try{ URL.revokeObjectURL(a.href); }catch(_){}
    try{ a.remove(); }catch(_){}
  }, 4000);
}

async function tryWebShareFile(filename, blob, title){
  try{
    if(typeof File === "undefined" || !navigator.canShare) return null;
    const file = new File([blob], filename, {
      type: blob.type || "application/octet-stream"
    });
    if(!navigator.canShare({ files: [file] })) return null;
    await navigator.share({
      files: [file],
      title: title || filename,
      text: title || filename
    });
    return { mode: "share", filename };
  }catch(err){
    if(err?.name === "AbortError") return { mode: "cancelled", filename };
    return null;
  }
}

/**
 * Save/share a Blob.
 * Android APK → Filesystem Cache + Share sheet.
 * Phone browser → Web Share when available.
 * PC / Electron → <a download> only (classic behavior).
 * Returns { mode: "share"|"download"|"cancelled" }
 */
export async function deliverBlob(filename, blob, title){
  const name = String(filename || "download.bin").replace(/[<>:"/\\|?*]/g, "_");
  if(isAndroidNative()){
    try{
      const Filesystem = window.Capacitor?.Plugins?.Filesystem;
      const Share = window.Capacitor?.Plugins?.Share;
      if(Filesystem?.writeFile && Share?.share){
        const base64 = await blobToBase64(blob);
        const written = await Filesystem.writeFile({
          path: name,
          data: base64,
          directory: "CACHE"
        });
        let uri = written?.uri || "";
        if(!uri && Filesystem.getUri){
          const got = await Filesystem.getUri({ path: name, directory: "CACHE" });
          uri = got?.uri || "";
        }
        if(uri){
          await Share.share({
            title: title || name,
            text: title || name,
            url: uri,
            dialogTitle: title || "Share file"
          });
          return { mode: "share", filename: name };
        }
      }
    }catch(err){
      console.warn("Native file share failed, trying download", err);
    }
  }

  // Never open Windows/macOS Share sheet on desktop — user expects Save/download
  if(!isDesktopClient()){
    const shared = await tryWebShareFile(name, blob, title);
    if(shared) return shared;
  }

  webDownloadBlob(name, blob);
  return { mode: "download", filename: name };
}

export async function deliverText(filename, text, mimeType, title){
  const blob = new Blob([text], { type: mimeType || "text/plain;charset=utf-8" });
  return deliverBlob(filename, blob, title);
}

/** Open external URL (WhatsApp etc.) — Custom Tabs on Android APK only. */
export async function openExternalUrl(url){
  const u = String(url || "");
  if(!u) return false;
  if(isAndroidNative()){
    try{
      const Browser = window.Capacitor?.Plugins?.Browser;
      if(Browser?.open){
        await Browser.open({ url: u });
        return true;
      }
    }catch(err){
      console.warn("Browser.open failed", err);
    }
  }
  window.open(u, "_blank", "noopener,noreferrer");
  return true;
}

export function deliveryToast(result, fallback = "Downloaded"){
  if(!result) return fallback;
  if(result.mode === "share") return "Share sheet opened — save or send the file";
  if(result.mode === "cancelled") return "Cancelled";
  return fallback;
}
