document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    
    loadUserProfile();
    setupProfileActions();
    highlightActiveNav('profile');
});

let originalProfileData = {};

function loadUserProfile() {
    const loggedInEmail = localStorage.getItem('loggedInStudentEmail');
    
    const savedData = localStorage.getItem('studentProfileData');
    let profileData = savedData ? JSON.parse(savedData) : {
        name: 'Parthrajsinh H. Gohil',
        enrollment: '25DIT019',
        department: 'Information Technology',
        email: '25dit019@charusat.edu.in'
    };

    if (loggedInEmail) {
        profileData.email = loggedInEmail;
    }

    const nameEl = document.getElementById('profileName');
    const enrollEl = document.getElementById('profileEnrollment');
    const deptEl = document.getElementById('profileDept');
    const emailEl = document.getElementById('profileEmail');

    if (nameEl) nameEl.textContent = profileData.name;
    if (enrollEl) enrollEl.textContent = profileData.enrollment;
    if (deptEl) deptEl.textContent = profileData.department;
    if (emailEl) emailEl.textContent = profileData.email;

    localStorage.setItem('studentProfileData', JSON.stringify(profileData));
}

function setupProfileActions() {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (editBtn) editBtn.onclick = enableProfileEdit;
    if (saveBtn) saveBtn.onclick = saveProfileChanges;
    if (cancelBtn) cancelBtn.onclick = cancelProfileEdit;
}

function enableProfileEdit() {
    const fields = ['profileName', 'profileEnrollment', 'profileDept', 'profileEmail'];
    originalProfileData = {};

    fields.forEach(id => {
        const td = document.getElementById(id);
        if (td) {
            const currentValue = td.textContent.trim();
            originalProfileData[id] = currentValue;
            td.innerHTML = `<input type="text" class="profile-input" id="input_${id}" value="${currentValue}">`;
        }
    });

    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (editBtn) editBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'inline-block';
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
}

function saveProfileChanges() {
    const nameInput = document.getElementById('input_profileName');
    const enrollInput = document.getElementById('input_profileEnrollment');
    const deptInput = document.getElementById('input_profileDept');
    const emailInput = document.getElementById('input_profileEmail');

    const nameVal = nameInput ? nameInput.value.trim() : originalProfileData['profileName'];
    const enrollVal = enrollInput ? enrollInput.value.trim() : originalProfileData['profileEnrollment'];
    const deptVal = deptInput ? deptInput.value.trim() : originalProfileData['profileDept'];
    const emailVal = emailInput ? emailInput.value.trim() : originalProfileData['profileEmail'];

    if (!nameVal || !emailVal) {
        alert('Name and Email cannot be empty!');
        return;
    }

    const updatedProfile = {
        name: nameVal,
        enrollment: enrollVal,
        department: deptVal,
        email: emailVal
    };

    localStorage.setItem('studentProfileData', JSON.stringify(updatedProfile));
    localStorage.setItem('loggedInStudentEmail', emailVal);

    if (document.getElementById('profileName')) document.getElementById('profileName').textContent = updatedProfile.name;
    if (document.getElementById('profileEnrollment')) document.getElementById('profileEnrollment').textContent = updatedProfile.enrollment;
    if (document.getElementById('profileDept')) document.getElementById('profileDept').textContent = updatedProfile.department;
    if (document.getElementById('profileEmail')) document.getElementById('profileEmail').textContent = updatedProfile.email;

    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (editBtn) editBtn.style.display = 'inline-block';
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';

    alert('Profile updated successfully!');
}

function cancelProfileEdit() {
    Object.keys(originalProfileData).forEach(id => {
        const td = document.getElementById(id);
        if (td) td.textContent = originalProfileData[id];
    });

    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (editBtn) editBtn.style.display = 'inline-block';
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
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

window.enableProfileEdit = enableProfileEdit;
window.saveProfileChanges = saveProfileChanges;
window.cancelProfileEdit = cancelProfileEdit;
