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
        chrome.runtime.sendMessage({action: "rescan"});
        window.close();
    });

    // Load technology data
    const noTechDetected = document.getElementById("noTechDetected");
    const techList = document.getElementById("techList");

    chrome.storage.local.get("scanData", (data) => {
        if (data.scanData && Object.keys(data.scanData).length > 0) {
            noTechDetected.style.display = "none";
            techList.style.display = "block";
            
            // Add your technology list rendering logic here
        } else {
            techList.style.display = "none";
        }
    });
});