chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['src/content.js']
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanResult") {
        //chrome.runtime.sendMessage({ action: "dataFromBackground", data: request.data });
        chrome.storage.local.set({ scanData: request.data }, () => {
            console.log('Scan data stored in local storage:', request.data);
        });
    }
});