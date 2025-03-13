// Maintenance Mode
const isUnderMaintenance = true; // Change to false when the site is live
const maintenanceDiv = document.getElementById("maintenance-mode");
const mainContent = document.getElementById("main-content");

if (isUnderMaintenance) {
    maintenanceDiv.style.display = "flex";
    mainContent.style.display = "none";
}
