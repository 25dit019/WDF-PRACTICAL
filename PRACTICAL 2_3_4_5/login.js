// login.js - Login Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    highlightActiveNav('login');
});

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.querySelector('.input-field[type="email"]').value;
    const password = document.querySelector('.input-field[type="password"]').value;
    
    if (validateEmail(email) && password.length >= 6) {
        alert('Login Successful! Welcome ' + email);
        console.log('User logged in:', email);
    } else {
        alert('Invalid email or password (min 6 characters)');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.style.fontWeight = 'bold';
            link.style.color = '#007bff';
        }
    });
}

function togglePasswordVisibility() {
    const passwordField = document.getElementById('passwordField');
    const eyeIcon = document.getElementById('eyeIcon');
    const checkbox = document.getElementById('showPasswordCheckbox');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeIcon.textContent = '👁️‍🗨️';
        checkbox.checked = true;
    } else {
        passwordField.type = 'password';
        eyeIcon.textContent = '👁️';
        checkbox.checked = false;
    }
}
