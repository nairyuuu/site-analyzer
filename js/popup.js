document.addEventListener("DOMContentLoaded", () => {
    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    // Tab functionality
    const techBtn = document.getElementById("techBtn");
    const infoBtn = document.getElementById("infoBtn");
    const techContent = document.getElementById("techContent");
    const infoContent = document.getElementById("infoContent");

    techBtn.addEventListener("click", () => {
        techBtn.classList.add("active");
        infoBtn.classList.remove("active");
        techContent.classList.add("active");
        infoContent.classList.remove("active");
    });

    infoBtn.addEventListener("click", () => {
        infoBtn.classList.add("active");
        techBtn.classList.remove("active");
        infoContent.classList.add("active");
        techContent.classList.remove("active");
    });

    // Load technology data for the current domain
    const noTechDetected = document.getElementById("noTechDetected");
    const techList = document.getElementById("techList");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const url = new URL(tabs[0].url);
            const domain = url.hostname;

            chrome.storage.local.get(domain, (data) => {
                if (data[domain]) {
                    noTechDetected.style.display = "none";
                    techList.style.display = "block";

                    // Render the technology list for the current domain
                    const groupedTechnologies = data[domain];
                    const hostnameDiv = document.createElement("div");
                    hostnameDiv.classList.add("hostname");
                    hostnameDiv.innerHTML = `<h3>${domain}</h3>`;

                    groupedTechnologies.forEach((group) => {
                        const categoryDiv = document.createElement("div");
                        categoryDiv.classList.add("category");

                        const categoryTitle = document.createElement("h4");
                        categoryTitle.textContent = group.category;
                        categoryDiv.appendChild(categoryTitle);

                        const techList = document.createElement("ul");
                        group.technologies.forEach((tech) => {
                            const techItem = document.createElement("li");
                            techItem.innerHTML = `
                                <img src="js/technologies/icons/${tech.icon}" style="width: 16px; height: 16px; margin-right: 8px;">
                                ${tech.name}
                            `;
                            techList.appendChild(techItem);
                        });

                        categoryDiv.appendChild(techList);
                        hostnameDiv.appendChild(categoryDiv);
                    });

                    techList.appendChild(hostnameDiv);
                } else {
                    noTechDetected.style.display = "block";
                    techList.style.display = "none";
                }
            });
        } else {
            console.error("No active tab found.");
        }
    });

    // Version check functionality
    const versionCheckUrl = "https://www.notaya.shameimaru.online/version";
    const updateUrl = "https://www.notaya.shameimaru.online/";

    // Get the current version from manifest.json
    const currentVersion = chrome.runtime.getManifest().version;
    console.log("Current version:", currentVersion);

    // Fetch the latest version from the server
    fetch(versionCheckUrl)
        .then((response) => {
            console.log("Response data:", response.text());
            if (response.text() == "Error fetching version") {
                throw new Error(`Failed to fetch version: ${response.statusText}`);
            }
            return response.text();
        })
        .then((latestVersion) => {
            const versionMessage = document.createElement("div");
            versionMessage.classList.add("version-message");

            if (currentVersion !== latestVersion.trim()) {
                // Show update message
                versionMessage.innerHTML = `
                    <p>A new version (${latestVersion.trim()}) is available!</p>
                    <a href="${updateUrl}" target="_blank">Click here to update</a>
                `;
                versionMessage.style.color = "red";
            } else {
                // Show up-to-date message
                versionMessage.innerHTML = `<p>Your extension is up to date (v${currentVersion}).</p>`;
                versionMessage.style.color = "green";
            }

            // Append the version message to the "More Info" tab
            const infoContent = document.getElementById("infoContent");
            infoContent.appendChild(versionMessage);
        })
        .catch((error) => {
            console.error("Error checking version:", error);

            const errorMessage = document.createElement("div");
            errorMessage.classList.add("version-message");
            errorMessage.innerHTML = `<p>Failed to check for updates. Please try again later.</p>`;
            errorMessage.style.color = "orange";

            const infoContent = document.getElementById("infoContent");
            infoContent.appendChild(errorMessage);
        });
});