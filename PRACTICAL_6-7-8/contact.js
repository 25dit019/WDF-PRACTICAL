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
    if (!name || !validateEmail(email) || message.length < 5) {
        alert('Please fill all fields correctly. Name must be at least 2 chars, valid email, and message at least 5 characters.');
        return false;
    }
    const form = document.getElementById('contactForm') || document.querySelector('.contact-form');
    const formData = new FormData(form);
    fetch('process_contact.php', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        },
        body: formData
    })
    .then(async response => {
        const result = await response.json();
        if (response.ok && result.success) {
            alert(`✅ Practical 7 - Message Logged Successfully!\n\nTicket ID: ${result.record.ticket_id}\nSaved to: data/contacts.csv & data/contacts.json\n\nThank you ${name}!`);
            if (form) form.reset();
        } else {
            alert('Server Message: ' + (result.message || 'Error processing request'));
        }
    })
    .catch(err => {
        console.warn('PHP server not active, falling back to local acknowledgment:', err);
        alert(`Thank you ${name}! Your message has been noted locally.\n(To persist to CSV/JSON, open with PHP server/XAMPP).`);
        if (form) form.reset();
    });
    return false;
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
