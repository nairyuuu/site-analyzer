// Object to store detected technologies
const detectedTech = {};

// 1️⃣ Detect JavaScript Frameworks (React, Vue, Angular)
if (window.React) detectedTech["React"] = "Detected";
if (window.angular) detectedTech["Angular"] = "Detected";
if (window.Vue) detectedTech["Vue.js"] = "Detected";

// 2️⃣ Detect jQuery
if (window.jQuery) detectedTech["jQuery"] = "Detected";

// 3️⃣ Check Meta Tags for CMS Detection
const metaTags = document.getElementsByTagName("meta");
for (let meta of metaTags) {
    if (meta.name === "generator") {
        detectedTech["CMS"] = meta.content;  // WordPress, Joomla, etc.
    }
}

// 4️⃣ Scan Loaded Scripts for Common Libraries
const scripts = document.getElementsByTagName("script");
for (let script of scripts) {
    if (script.src.includes("jquery.min.js")) detectedTech["jQuery"] = "Detected";
    if (script.src.includes("bootstrap.min.js")) detectedTech["Bootstrap"] = "Detected";
}

// 5️⃣ Send Results to Popup
chrome.runtime.sendMessage({ type: "scanResult", data: detectedTech });
