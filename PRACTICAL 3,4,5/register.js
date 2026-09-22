document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const clearBtn = document.getElementById('clearBtn');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);

        const fullnameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('email');
        const mobileInput = document.getElementById('mobile');
        const passwordInput = document.getElementById('passwordField');
        const confirmPasswordInput = document.getElementById('confirmPasswordField');
        const courseSelect = document.getElementById('course');
        const yearSelect = document.getElementById('year');
        const termsCheckbox = document.getElementById('terms');
        const genderRadios = document.querySelectorAll('input[name="gender"]');

        if (fullnameInput) fullnameInput.addEventListener('input', validateFullname);
        if (emailInput) emailInput.addEventListener('input', validateEmailField);
        if (mobileInput) mobileInput.addEventListener('input', validateMobileField);
        if (passwordInput) passwordInput.addEventListener('input', validatePasswordField);
        if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validateConfirmPasswordField);
        if (courseSelect) courseSelect.addEventListener('change', validateCourseSelect);
        if (yearSelect) yearSelect.addEventListener('change', validateYearSelect);
        if (termsCheckbox) termsCheckbox.addEventListener('change', validateTermsCheckbox);
        genderRadios.forEach(radio => radio.addEventListener('change', validateGenderRadios));
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            clearErrors();
        });
    }

    highlightActiveNav('register');
});

const patterns = {
    fullname: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    mobile: /^[6-9]\d{9}$/,
    password: /^(?=.*[a-zA-Z])(?=.*\d).{6,20}$/
};

function showError(elementId, message, inputElement) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    if (inputElement && inputElement.classList) {
        inputElement.classList.add('is-invalid');
        inputElement.classList.remove('is-valid');
    }
}

function clearError(elementId, inputElement) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
    if (inputElement && inputElement.classList) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    }
}

function clearErrors() {
    const errorDivs = document.querySelectorAll('.error-msg');
    errorDivs.forEach(div => {
        div.textContent = '';
        div.style.display = 'none';
    });
    const inputs = document.querySelectorAll('.input-field');
    inputs.forEach(input => {
        input.classList.remove('is-invalid');
        input.classList.remove('is-valid');
    });
}

function validateFullname() {
    const input = document.getElementById('fullname');
    const val = input ? input.value.trim() : '';
    if (!val) {
        showError('fullnameError', 'Full name is required.', input);
        return false;
    }
    if (!patterns.fullname.test(val)) {
        showError('fullnameError', 'Name must contain only letters and spaces (min 2 chars).', input);
        return false;
    }
    clearError('fullnameError', input);
    return true;
}

function validateEmailField() {
    const input = document.getElementById('email');
    const val = input ? input.value.trim() : '';
    if (!val) {
        showError('emailError', 'Email address is required.', input);
        return false;
    }
    if (!patterns.email.test(val)) {
        showError('emailError', 'Please enter a valid email address (e.g. user@domain.com).', input);
        return false;
    }
    clearError('emailError', input);
    return true;
}

function validateMobileField() {
    const input = document.getElementById('mobile');
    const val = input ? input.value.trim() : '';
    if (!val) {
        showError('mobileError', 'Mobile number is required.', input);
        return false;
    }
    if (!patterns.mobile.test(val)) {
        showError('mobileError', 'Enter a valid 10-digit mobile number starting with 6-9.', input);
        return false;
    }
    clearError('mobileError', input);
    return true;
}

function validatePasswordField() {
    const input = document.getElementById('passwordField');
    const val = input ? input.value : '';
    if (!val) {
        showError('passwordError', 'Password is required.', input);
        return false;
    }
    if (!patterns.password.test(val)) {
        showError('passwordError', 'Password must be 6-20 characters long and include letters & numbers.', input);
        return false;
    }
    clearError('passwordError', input);
    validateConfirmPasswordField();
    return true;
}

function validateConfirmPasswordField() {
    const passInput = document.getElementById('passwordField');
    const confirmInput = document.getElementById('confirmPasswordField');
    const passVal = passInput ? passInput.value : '';
    const confirmVal = confirmInput ? confirmInput.value : '';

    if (!confirmVal) {
        showError('confirmPasswordError', 'Please confirm your password.', confirmInput);
        return false;
    }
    if (confirmVal !== passVal) {
        showError('confirmPasswordError', 'Passwords do not match.', confirmInput);
        return false;
    }
    clearError('confirmPasswordError', confirmInput);
    return true;
}

function validateCourseSelect() {
    const select = document.getElementById('course');
    const val = select ? select.value : '';
    if (!val) {
        showError('courseError', 'Please select a course.', select);
        return false;
    }
    clearError('courseError', select);
    return true;
}

function validateYearSelect() {
    const select = document.getElementById('year');
    const val = select ? select.value : '';
    if (!val) {
        showError('yearError', 'Please select your academic year.', select);
        return false;
    }
    clearError('yearError', select);
    return true;
}

function validateGenderRadios() {
    const selected = document.querySelector('input[name="gender"]:checked');
    const errorDiv = document.getElementById('genderError');
    if (!selected) {
        if (errorDiv) {
            errorDiv.textContent = 'Please select your gender.';
            errorDiv.style.display = 'block';
        }
        return false;
    }
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
    return true;
}

function validateTermsCheckbox() {
    const checkbox = document.getElementById('terms');
    const errorDiv = document.getElementById('termsError');
    if (!checkbox || !checkbox.checked) {
        if (errorDiv) {
            errorDiv.textContent = 'You must accept the terms and conditions.';
            errorDiv.style.display = 'block';
        }
        return false;
    }
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
    return true;
}

function handleRegisterSubmit(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const isFullnameValid = validateFullname();
    const isEmailValid = validateEmailField();
    const isMobileValid = validateMobileField();
    const isPasswordValid = validatePasswordField();
    const isConfirmPasswordValid = validateConfirmPasswordField();
    const isCourseValid = validateCourseSelect();
    const isYearValid = validateYearSelect();
    const isGenderValid = validateGenderRadios();
    const isTermsValid = validateTermsCheckbox();

    if (isFullnameValid && isEmailValid && isMobileValid && isPasswordValid && isConfirmPasswordValid && isCourseValid && isYearValid && isGenderValid && isTermsValid) {
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const course = document.getElementById('course').value;
        const year = document.getElementById('year').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;

        const profileData = {
            name: fullname,
            enrollment: '25DIT019',
            department: course,
            email: email,
            mobile: mobile,
            year: year,
            gender: gender
        };

        localStorage.setItem('studentProfileData', JSON.stringify(profileData));
        localStorage.setItem('loggedInStudentEmail', email);

        alert('Registration Successful!\nWelcome, ' + fullname);

        window.location.href = 'profile.html';
        return false;
    } else {
        alert('Registration Failed! Please fix the errors highlighted in red.');
        return false;
    }
}

function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('.nav a, nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.style.fontWeight = 'bold';
            link.style.color = '#007bff';
        }
    });
}

function togglePasswordVisibility(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const isFirst = fieldId === 'passwordField';
    const eyeIcon = document.getElementById(isFirst ? 'eyeIcon' : 'eyeIcon2');
    const checkbox = document.getElementById(isFirst ? 'showPasswordCheckbox' : 'showConfirmPasswordCheckbox');

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

window.handleRegisterSubmit = handleRegisterSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
