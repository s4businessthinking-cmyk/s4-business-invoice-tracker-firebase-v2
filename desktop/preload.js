// Renderer (frontend/index.html)-কে জানানোর জন্য যে এটা desktop shell —
// update-checker.js এই flag দেখে ওয়েব/APK ব্যানার লজিক স্কিপ করে,
// কারণ desktop এর আপডেট main.js এ native dialog দিয়ে হ্যান্ডেল হয়।
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("s4Desktop", {
  platform: "desktop"
});
