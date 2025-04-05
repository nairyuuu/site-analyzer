document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get("scanData", (data) => {
        const techList = document.getElementById("techList");
        for (const [tech, status] of Object.entries(data.scanData || {})) {
            let listItem = document.createElement("li");
            listItem.textContent = `${tech}: ${status}`;
            techList.appendChild(listItem);
        }
    });
});
