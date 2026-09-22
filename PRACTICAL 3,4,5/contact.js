document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact page loaded');
    
    setupContactForm();
    highlightActiveNav('contact');
});

function setupContactForm() {
    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const nameInput = document.getElementById('name') || document.querySelector('input[name="name"]');
    const emailInput = document.getElementById('email') || document.querySelector('input[name="email"]');
    const messageInput = document.getElementById('message') || document.querySelector('textarea[name="message"]');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    
    if (name && validateEmail(email) && message.length >= 5) {
        alert('Thank you ' + name + '! Your message has been sent successfully.');
        console.log('Contact message from:', name);
        const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form');
        if (contactForm) contactForm.reset();
        return false;
    } else {
        alert('Please fill all fields correctly. Message must be at least 5 characters.');
        return false;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('nav a, .nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.style.fontWeight = 'bold';
            link.style.color = '#007bff';
        }
    });
}

window.handleContactSubmit = handleContactSubmit;
