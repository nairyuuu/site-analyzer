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

    // Reload functionality
    const reloadLink = document.getElementById("reloadLink");
    reloadLink.addEventListener("click", (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({ action: "rescan" });
        window.close();
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
                                <img src="js/technologies/icons/${tech.icon}" alt="${tech.name}" style="width: 16px; height: 16px; margin-right: 8px;">
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
});