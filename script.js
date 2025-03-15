document.addEventListener("DOMContentLoaded", () => {
    let isUnderMaintenance = true;
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
            alert("Excessive clicks detected. You have been kicked.");
            window.location.href = "about:blank"; // Kick the user
        }
    });

    // Right-Click Disabling
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        alert("Right-click disabled. You have been kicked.");
        window.location.href = "about:blank";
    });

    // Keylogging Detection (Limited)
    let keyPressCount = 0;
    document.addEventListener('keydown', () => {
        keyPressCount++;
        if (keyPressCount > 50) {
            alert("High key press count. You have been kicked.");
            window.location.href = "about:blank";
        }
    });

    // Copy/Paste Disabling
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        alert("Copying disabled. You have been kicked.");
        window.location.href = "about:blank";
    });
    document.addEventListener('paste', (e) => {
        e.preventDefault();
        alert("Pasting disabled. You have been kicked.");
        window.location.href = "about:blank";
    });

    // Frame Busting (Partial)
    if (window.top !== window.self) {
        alert("Frame busting detected. You have been kicked.");
        window.top.location = window.self.location;
    }

    // Input Field Monitoring
    const myInput = document.getElementById('myInput');
    if (myInput) {
        myInput.addEventListener('input', (event) => {
            if (event.target.value.length > 500) {
                alert("Long input detected. You have been kicked.");
                window.location.href = "about:blank";
            }
        });
    }

    // Admin Login Button
    const loginButton = document.getElementById('loginButton');
    const loginForm = document.getElementById('loginForm');

    if (loginButton && loginForm) {
        loginButton.addEventListener('click', () => {
            if (loginForm.style.display === 'block') {
                loginForm.style.display = 'none';
            } else {
                loginForm.style.display = 'block';
            }
        });

        document.addEventListener('click', (event) => {
            if (!loginButton.contains(event.target) && !loginForm.contains(event.target)) {
                loginForm.style.display = 'none';
            }
        });
    }

    // Check Admin Status (Example)
    const isAdmin = document.cookie.split('; ').find(row => row.startsWith('isAdmin='));
    if (isAdmin && isAdmin.split('=')[1] === 'true') {
        // Allow admin access
        isUnderMaintenance = false;
        if (maintenanceDiv) {
            maintenanceDiv.style.display = "none";
        }
        if (mainContent) {
            mainContent.style.display = "block";
        }
    }
});
        if (mainContent) {
            mainContent.style.display = "block";
        }
    }
});
