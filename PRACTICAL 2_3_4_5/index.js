// index.js - Home Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Home page loaded');

    showWelcomeMessage();

    highlightActiveNav('home');
});

function showWelcomeMessage() {
    const message = 'Welcome to StudentHub Portal! Explore courses, assignments, and more.';
    console.log(message);
}

function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.style.fontWeight = 'bold';
            link.style.color = '#1966b8';
        }
    });
}
