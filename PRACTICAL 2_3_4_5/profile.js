// profile.js - Profile Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    loadUserProfile();
    setupProfileForm();
    highlightActiveNav('profile');
});

function loadUserProfile() {
    const userProfile = {
        name: 'Student Name',
        email: 'student@example.com',
        enrollmentNumber: 'STU001',
        department: 'Computer Science',
        semester: '4th'
    };
    
    console.log('User Profile:', userProfile);
    return userProfile;
}

function setupProfileForm() {
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

function handleProfileUpdate(e) {
    if (e.type === 'submit') {
        e.preventDefault();
        alert('Profile updated successfully!');
        console.log('Profile information updated');
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
