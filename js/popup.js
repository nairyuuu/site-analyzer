document.addEventListener("DOMContentLoaded", () => {
    // Get the active tab's hostname
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const url = new URL(tabs[0].url);
            const hostname = url.hostname;

            // Retrieve cached technologies for the current hostname
            chrome.storage.local.get([hostname], (data) => {
                const technologiesDiv = document.getElementById("technologies");
                if (data[hostname]) {
                    const groupedTechnologies = data[hostname];
                    technologiesDiv.innerHTML = `
                        <h2>Technologies for ${hostname}</h2>
                        <pre>${JSON.stringify(groupedTechnologies, null, 2)}</pre>
                    `;
                } else {
                    technologiesDiv.innerHTML = `<p>No technologies detected for ${hostname}.</p>`;
                }
            });
        } else {
            console.error("No active tab found.");
        }
    });
});