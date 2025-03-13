// Maintenance Mode
const isUnderMaintenance = true; // Change to false when the site is live
const maintenanceDiv = document.getElementById("maintenance-mode");
const mainContent = document.getElementById("main-content");

// Simulate fetching the user's IP address (replace this with actual logic if using a backend)
const userIp = "184.145.64.203"; // Example user IP (replace this with dynamic fetching)
const adminIp = "184.145.64.203"; // Example admin IP (this should be the IP of the admin)

// Check if the user is an admin (has the same IP as the admin IP)
if (isUnderMaintenance && userIp !== adminIp) {
    maintenanceDiv.style.display = "flex";
    mainContent.style.display = "none";
} else {
    // Allow admin to see the content
    maintenanceDiv.style.display = "none";
    mainContent.style.display = "block";
}
