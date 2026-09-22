document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    const loginForm = document.getElementById('loginForm') || document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    highlightActiveNav('login');
});

function handleLoginSubmit(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    const emailInput = document.getElementById('emailField') || document.querySelector('.input-field[type="email"]');
    const passwordInput = document.getElementById('passwordField') || document.querySelector('.input-field[type="password"]');
    
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    
    if (email && validateEmail(email) && password.length >= 6) {
        localStorage.setItem('loggedInStudentEmail', email);
        
        console.log('User logged in:', email);
        alert('Login Successful! Welcome ' + email);
        
        window.location.href = 'profile.html';
        return false;
    } else {
        alert('Please enter a valid email address and a password with at least 6 characters.');
        return false;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('.nav a, nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.style.fontWeight = 'bold';
            link.style.color = 'blue';
        }
    });
}

function togglePasswordVisibility() {
    const passwordField = document.getElementById('passwordField');
    const eyeIcon = document.getElementById('eyeIcon');
    const checkbox = document.getElementById('showPasswordCheckbox');
    
    if (!passwordField) return;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        if (eyeIcon) eyeIcon.textContent = '👁️‍🗨️';
        if (checkbox) checkbox.checked = true;
    } else {
        passwordField.type = 'password';
        if (eyeIcon) eyeIcon.textContent = '👁️';
        if (checkbox) checkbox.checked = false;
    }
}

window.handleLoginSubmit = handleLoginSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
