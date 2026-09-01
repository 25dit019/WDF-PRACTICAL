// contact.js - Contact Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact page loaded');
    
    setupContactForm();
    highlightActiveNav('contact');
});

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    if (e.type === 'submit') {
        e.preventDefault();
        
        const name = document.querySelector('input[name="name"]')?.value || '';
        const email = document.querySelector('input[name="email"]')?.value || '';
        const message = document.querySelector('textarea[name="message"]')?.value || '';
        
        if (name && validateEmail(email) && message.length > 10) {
            alert('Thank you! Your message has been sent successfully.');
            console.log('Contact message from:', name);
            contactForm.reset();
        } else {
            alert('Please fill all fields correctly. Message must be at least 10 characters.');
        }
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
