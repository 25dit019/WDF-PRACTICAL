let allStudents = [];
let filteredStudents = [];
let currentPage = 1;
const itemsPerPage = 6;
const CACHE_KEY = 'studenthub_students_cache';
const CACHE_TIME_KEY = 'studenthub_students_cache_time';
const locationHierarchy = {
    "India": {
        "Gujarat": ["Bhavnagar", "Ahmedabad", "Surat", "Rajkot", "Vadodara", "Gandhinagar"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Karnataka": ["Bengaluru", "Mysuru"]
    },
    "United States": {
        "California": ["San Jose", "San Francisco"],
        "New York": ["New York City"]
    },
    "United Kingdom": {
        "England": ["London", "Manchester"]
    }
};
document.addEventListener('DOMContentLoaded', () => {
    initStudentsModule();
    setupDependentDropdowns();
    setupEventListeners();
    highlightActiveNav('students');
});
async function initStudentsModule() {
    const cachedData = loadFromLocalStorage();
    if (cachedData && cachedData.length > 0) {
        allStudents = cachedData;
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY) || 'Previously saved';
        updateCacheBanner(true, `Displaying cached data (Saved: ${cacheTime})`);
        applyFilters();
    }
    await fetchStudentsData();
}
async function fetchStudentsData() {
    const container = document.getElementById('studentsContainer');
    if (allStudents.length === 0 && container) {
        container.innerHTML = `
            <div class="loading-box">
                <div class="spinner"></div>
                <h3>Fetching Student Directory via Fetch API...</h3>
                <p>Loading students.json data...</p>
            </div>
        `;
    }
    try {
        const response = await fetch('students.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Received invalid student data.');
        }
        allStudents = data;
        saveToLocalStorage(data);
        const currentTime = new Date().toLocaleTimeString();
        updateCacheBanner(false, `Live Data Synchronized at ${currentTime}`);
        applyFilters();
    } catch (error) {
        console.warn('Fetch failed or offline mode triggered:', error);
        const cached = loadFromLocalStorage();
        if (cached && cached.length > 0) {
            allStudents = cached;
            const cacheTime = localStorage.getItem(CACHE_TIME_KEY) || 'Earlier';
            updateCacheBanner(true, `Offline mode: Network unavailable. Loaded from cache (${cacheTime})`);
            applyFilters();
        } else {
            renderErrorState(error.message);
        }
    }
}
function setupDependentDropdowns() {
    const countrySelect = document.getElementById('countryFilter');
    const stateSelect = document.getElementById('stateFilter');
    const citySelect = document.getElementById('cityFilter');
    if (!countrySelect || !stateSelect || !citySelect) return;
    countrySelect.innerHTML = '<option value="all">All Countries</option>';
    Object.keys(locationHierarchy).forEach(country => {
        countrySelect.innerHTML += `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`;
    });
    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        stateSelect.innerHTML = '<option value="all">All States</option>';
        citySelect.innerHTML = '<option value="all">All Cities</option>';
        if (selectedCountry === 'all' || !locationHierarchy[selectedCountry]) {
            stateSelect.disabled = true;
            citySelect.disabled = true;
        } else {
            stateSelect.disabled = false;
            citySelect.disabled = true;
            const states = Object.keys(locationHierarchy[selectedCountry]);
            states.forEach(state => {
                stateSelect.innerHTML += `<option value="${escapeHtml(state)}">${escapeHtml(state)}</option>`;
            });
        }
        currentPage = 1;
        applyFilters();
    });
    stateSelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        const selectedState = stateSelect.value;
        citySelect.innerHTML = '<option value="all">All Cities</option>';
        if (selectedState === 'all' || !locationHierarchy[selectedCountry] || !locationHierarchy[selectedCountry][selectedState]) {
            citySelect.disabled = true;
        } else {
            citySelect.disabled = false;
            const cities = locationHierarchy[selectedCountry][selectedState];
            cities.forEach(city => {
                citySelect.innerHTML += `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`;
            });
        }
        currentPage = 1;
        applyFilters();
    });
    citySelect.addEventListener('change', () => {
        currentPage = 1;
        applyFilters();
    });
}
function applyFilters() {
    const searchVal = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase().trim() : '';
    const deptVal = document.getElementById('deptFilter') ? document.getElementById('deptFilter').value : 'all';
    const sortVal = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'cgpa-desc';
    const countryVal = document.getElementById('countryFilter') ? document.getElementById('countryFilter').value : 'all';
    const stateVal = document.getElementById('stateFilter') ? document.getElementById('stateFilter').value : 'all';
    const cityVal = document.getElementById('cityFilter') ? document.getElementById('cityFilter').value : 'all';
    filteredStudents = allStudents.filter(student => {
        const matchesSearch = 
            (student.name && student.name.toLowerCase().includes(searchVal)) ||
            (student.enrollment && student.enrollment.toLowerCase().includes(searchVal)) ||
            (student.email && student.email.toLowerCase().includes(searchVal)) ||
            (student.department && student.department.toLowerCase().includes(searchVal)) ||
            (student.city && student.city.toLowerCase().includes(searchVal)) ||
            (student.skills && student.skills.some(skill => skill.toLowerCase().includes(searchVal)));
        const matchesDept = deptVal === 'all' || student.department === deptVal;
        const matchesCountry = countryVal === 'all' || student.country === countryVal;
        const matchesState = stateVal === 'all' || student.state === stateVal;
        const matchesCity = cityVal === 'all' || student.city === cityVal;
        return matchesSearch && matchesDept && matchesCountry && matchesState && matchesCity;
    });
    filteredStudents.sort((a, b) => {
        switch (sortVal) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'cgpa-desc':
                return (b.cgpa || 0) - (a.cgpa || 0);
            case 'cgpa-asc':
                return (a.cgpa || 0) - (b.cgpa || 0);
            case 'semester-desc':
                return (b.semester || 0) - (a.semester || 0);
            default:
                return 0;
        }
    });
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    renderStudents();
}
function renderStudents() {
    const container = document.getElementById('studentsContainer');
    const totalCountEl = document.getElementById('totalCount');
    const pageInfoEl = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!container) return;
    const totalItems = filteredStudents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (totalCountEl) {
        totalCountEl.textContent = `Showing ${totalItems} Student Profile${totalItems === 1 ? '' : 's'}`;
    }
    if (totalItems === 0) {
        container.innerHTML = `
            <div class="empty-box">
                <h3>No Students Found Matching Filters</h3>
                <p>Try resetting the Country/State/City dependent dropdowns or search query.</p>
            </div>
        `;
        if (pageInfoEl) pageInfoEl.textContent = 'Page 0 of 0';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        renderPageNumbers(0);
        return;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = filteredStudents.slice(startIndex, endIndex);
    const htmlCards = paginatedItems.map(student => {
        const skillsHtml = (student.skills || []).map(skill => 
            `<span class="skill-badge">${escapeHtml(skill)}</span>`
        ).join('');
        return `
            <article class="student-card" data-id="${student.id}">
                <div class="student-card-header">
                    <div class="student-avatar">${escapeHtml(student.avatar || student.name.substring(0, 2).toUpperCase())}</div>
                    <div class="student-identity">
                        <h3 class="student-name">${escapeHtml(student.name)}</h3>
                        <span class="student-enrollment">${escapeHtml(student.enrollment)}</span>
                    </div>
                </div>
                <div class="student-card-body">
                    <div class="info-item">
                        <span class="info-label">Department</span>
                        <span class="info-val">${escapeHtml(student.department)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Academic Semester</span>
                        <span class="info-val">Semester ${student.semester}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cumulative CGPA</span>
                        <span class="info-val cgpa-pill">${Number(student.cgpa).toFixed(2)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Location</span>
                        <span class="info-val location-tag">📍 ${escapeHtml(student.city)}, ${escapeHtml(student.state)} (${escapeHtml(student.country)})</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-val" style="font-size: 0.8rem;">${escapeHtml(student.email)}</span>
                    </div>
                    <div class="skills-wrapper">
                        <span class="skills-label">Core Competencies:</span>
                        <div class="skills-tags">
                            ${skillsHtml}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    container.innerHTML = htmlCards;
    if (pageInfoEl) {
        pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    renderPageNumbers(totalPages);
}
function renderPageNumbers(totalPages) {
    const pageNumbersEl = document.getElementById('pageNumbers');
    if (!pageNumbersEl) return;
    if (totalPages <= 1) {
        pageNumbersEl.innerHTML = '';
        return;
    }
    let buttonsHtml = '';
    for (let i = 1; i <= totalPages; i++) {
        buttonsHtml += `
            <button class="btn-num ${i === currentPage ? 'active' : ''}" onclick="goToStudentPage(${i})">
                ${i}
            </button>
        `;
    }
    pageNumbersEl.innerHTML = buttonsHtml;
}
function goToStudentPage(page) {
    currentPage = page;
    renderStudents();
    window.scrollTo({ top: 200, behavior: 'smooth' });
}
function renderErrorState(errorMessage) {
    const container = document.getElementById('studentsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="error-box">
            <h3>⚠️ Unable to Load Student Profiles</h3>
            <p>${escapeHtml(errorMessage)}</p>
            <p>Ensure you are serving students.json through an HTTP server.</p>
            <button class="btn-refresh" style="margin-top: 12px; padding: 8px 16px;" onclick="fetchStudentsData()">
                🔄 Try Again
            </button>
        </div>
    `;
}
function saveToLocalStorage(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, new Date().toLocaleString());
    } catch (e) {
        console.warn('LocalStorage save failed:', e);
    }
}
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('LocalStorage read failed:', e);
        return null;
    }
}
function updateCacheBanner(isOffline, message) {
    const banner = document.getElementById('cacheBanner');
    const msgEl = document.getElementById('cacheStatusText');
    if (banner && msgEl) {
        msgEl.textContent = message;
        if (isOffline) {
            banner.classList.add('offline');
        } else {
            banner.classList.remove('offline');
        }
    }
}
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const deptFilter = document.getElementById('deptFilter');
    const sortSelect = document.getElementById('sortSelect');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            applyFilters();
        });
    }
    if (deptFilter) {
        deptFilter.addEventListener('change', () => {
            currentPage = 1;
            applyFilters();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFilters();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderStudents();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderStudents();
            }
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchStudentsData();
        });
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (deptFilter) deptFilter.value = 'all';
            if (sortSelect) sortSelect.value = 'cgpa-desc';
            const country = document.getElementById('countryFilter');
            const state = document.getElementById('stateFilter');
            const city = document.getElementById('cityFilter');
            if (country) country.value = 'all';
            if (state) {
                state.innerHTML = '<option value="all">All States</option>';
                state.disabled = true;
            }
            if (city) {
                city.innerHTML = '<option value="all">All Cities</option>';
                city.disabled = true;
            }
            currentPage = 1;
            applyFilters();
        });
    }
}
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function highlightActiveNav(page) {
    const navLinks = document.querySelectorAll('nav a, .nav a');
    navLinks.forEach(link => {
        if (link.classList.contains(page)) {
            link.classList.add('active');
            link.style.fontWeight = 'bold';
        }
    });
}
window.goToStudentPage = goToStudentPage;
window.fetchStudentsData = fetchStudentsData;
