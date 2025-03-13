document.addEventListener("DOMContentLoaded", () => {
    const isUnderMaintenance = true;
    const maintenanceDiv = document.getElementById("maintenance-mode");
    const mainContent = document.getElementById("main-content");

    if (isUnderMaintenance) {
        if (maintenanceDiv) {
            maintenanceDiv.style.display = "flex";
            const maintenanceMessage = maintenanceDiv.querySelector("p");
            if(maintenanceMessage){
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

    if(audio && muteButton){
        muteButton.addEventListener("click", () => {
            audio.muted = !audio.muted;
            muteButton.textContent = audio.muted ? "Unmute" : "Mute";
        });
    }

});
