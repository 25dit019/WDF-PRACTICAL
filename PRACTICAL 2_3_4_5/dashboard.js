// dashboard.js - Dashboard Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    displayDashboardStats();
    updateDashboardInfo();
    highlightActiveNav('dashboard');
});

function displayDashboardStats() {
    const stats = {
        totalCourses: 5,
        assignments: 3,
        attendance: 90,
        upcomingExam: 'Computer Networking CIE-1'
    };
    
    console.log('Dashboard Stats:', stats);
    return stats;
}

function updateDashboardInfo() {
    const dashboardList = document.querySelector('.dashboard-list');
    if (dashboardList) {
        console.log('Dashboard information updated');
    }
}

function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.style.fontWeight = 'bold';
            link.style.color = '#007bff';
        }
    });
}
