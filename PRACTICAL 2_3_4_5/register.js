// register.js - Registration Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration page loaded');
    
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    highlightActiveNav('register');
});

function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const fullName = document.querySelector('input[name="fullname"]')?.value || '';
    const email = document.querySelector('input[name="email"]')?.value || '';
    const password = document.querySelector('input[name="password"]')?.value || '';
    const confirmPassword = document.querySelector('input[name="confirmpassword"]')?.value || '';
    
    if (fullName && validateEmail(email) && password === confirmPassword && password.length >= 6) {
        alert('Registration Successful! Welcome ' + fullName);
        console.log('New user registered:', email);
    } else {
        alert('Please check all fields. Password must be at least 6 characters and match.');
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

function togglePasswordVisibility(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(fieldId === 'passwordField' ? 'eyeIcon' : 'eyeIcon2');
    const checkbox = document.getElementById(fieldId === 'passwordField' ? 'showPasswordCheckbox' : 'showConfirmPasswordCheckbox');
    
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
