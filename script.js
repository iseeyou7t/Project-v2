// Maintenance Mode
const isUnderMaintenance = true; // Change to false when the site is live
const maintenanceDiv = document.getElementById("maintenance-mode");
const mainContent = document.getElementById("main-content");

if (isUnderMaintenance) {
    maintenanceDiv.style.display = "flex";
    mainContent.style.display = "none";
}

// Dark Mode Toggle
const themeToggleBtn = document.getElementById("theme-toggle");

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        themeToggleBtn.setAttribute(
            "aria-label",
            document.body.classList.contains("dark-mode") ? "Switch to Light Mode" : "Switch to Dark Mode"
        );

        themeToggleBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
    });
}

// Scroll-triggered Animations
const scrollAnimations = document.querySelectorAll(".scroll-animation");

const triggerAnimations = () => {
    const windowHeight = window.innerHeight;
    scrollAnimations.forEach(animation => {
        const elementTop = animation.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            animation.classList.add("visible");
        }
    });
};

window.addEventListener("scroll", triggerAnimations);
document.addEventListener("DOMContentLoaded", triggerAnimations);

// Typewriter Effect
const typewriterText = document.getElementById("typewriter");
const text = "Welcome to My Portfolio";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        typewriterText.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    }
}
typeWriter();

});
