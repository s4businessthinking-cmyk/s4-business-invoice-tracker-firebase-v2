// Renderer bridge — desktop flag + Firebase config + stable machine / trial / license
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("s4Desktop", {
  platform: "desktop",
  loadFirebaseConfig: () => ipcRenderer.invoke("s4:load-firebase-config"),
  saveFirebaseConfig: (cfg) => ipcRenderer.invoke("s4:save-firebase-config", cfg),
  clearFirebaseConfig: () => ipcRenderer.invoke("s4:clear-firebase-config"),
  getMachineId: () => ipcRenderer.invoke("s4:get-machine-id"),
  loadTrialRecord: () => ipcRenderer.invoke("s4:load-trial-record"),
  saveTrialRecord: (record) => ipcRenderer.invoke("s4:save-trial-record", record),
  loadLicenseRecord: () => ipcRenderer.invoke("s4:load-license-record"),
  saveLicenseRecord: (record) => ipcRenderer.invoke("s4:save-license-record", record),
  saveLocalBackup: (payload) => ipcRenderer.invoke("s4:save-local-backup", payload)
});
