document.addEventListener("DOMContentLoaded", () => {
    const isUnderMaintenance = true;
    const maintenanceDiv = document.getElementById("maintenance-mode");
    const mainContent = document.getElementById("main-content");

    if (isUnderMaintenance) {
        if (maintenanceDiv) {
            maintenanceDiv.style.display = "flex";
            const maintenanceMessage = maintenanceDiv.querySelector("p");
            if (maintenanceMessage) {
                maintenanceMessage.textContent = "Admin only mode. Contact staff.";
            }
        }
        if (mainContent) {
            mainContent.style.display = "none";
        }
    } else {
        if (maintenanceDiv) {
            maintenanceDiv.style.display = "none";
        }
        if (mainContent) {
            mainContent.style.display = "block";
        }
    }

    // Theme Toggle
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    }

    // Scroll Animation
    const scrollAnimations = document.querySelectorAll('.scroll-animation');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    });
    scrollAnimations.forEach(animation => {
        observer.observe(animation);
    });

    // Audio Control
    const audio = document.getElementById("backgroundMusic");
    const muteButton = document.getElementById("muteButton");
    if (audio && muteButton) {
        muteButton.addEventListener("click", () => {
            audio.muted = !audio.muted;
            muteButton.textContent = audio.muted ? "Unmute" : "Mute";
        });
    }

    // Security Features:
    // Excessive Click Detection
    let clickCount = 0;
    let clickTimer;
    document.addEventListener('click', () => {
        clickCount++;
        if (!clickTimer) {
            clickTimer = setTimeout(() => {
                clickCount = 0;
                clearTimeout(clickTimer);
                clickTimer = null;
            }, 1000); // Reset count after 1 second
        }
        if (clickCount > 10) { // Threshold
            console.warn("Excessive clicks detected.");
            // Optionally disable interactive elements
        }
    });

    // Right-Click Disabling
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Keylogging Detection (Limited)
    let keyPressCount = 0;
    document.addEventListener('keydown', () => {
        keyPressCount++;
        if (keyPressCount > 50) {
            console.warn("High key press count");
        }
    });

    // Copy/Paste Disabling
    document.addEventListener('copy', (e) => {
        e.preventDefault();
    });
    document.addEventListener('paste', (e) => {
        e.preventDefault();
    });

    // Frame Busting (Partial)
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    // Input Field Monitoring
    const myInput = document.getElementById('myInput');
    if (myInput) {
        myInput.addEventListener('input', (event) => {
            if (event.target.value.length > 500) {
                console.warn("Long input detected");
            }
        });
    }
});
