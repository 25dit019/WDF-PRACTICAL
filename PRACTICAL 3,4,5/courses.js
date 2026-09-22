let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const itemsPerPage = 4;

const fallbackCourses = [
  { id: 1, code: "IT201", title: "Web Development & Frameworks", category: "Information Technology", instructor: "Dr. Parth Patel", credits: 4, duration: "12 Weeks", level: "Intermediate", rating: 4.9, description: "Learn HTML5, CSS3, JavaScript, Fetch API, and modern frontend design." },
  { id: 2, code: "CE202", title: "Data Structures & Algorithms", category: "Computer Engineering", instructor: "Prof. Rajesh Sharma", credits: 4, duration: "14 Weeks", level: "Advanced", rating: 4.8, description: "Master stacks, queues, trees, graphs, sorting, searching, and complexity." },
  { id: 3, code: "CS203", title: "Database Management Systems", category: "Computer Science", instructor: "Dr. Ananya Roy", credits: 3, duration: "10 Weeks", level: "Intermediate", rating: 4.7, description: "Relational databases, SQL queries, normalization, transactions, and indexing." },
  { id: 4, code: "AI204", title: "Artificial Intelligence & ML", category: "AI & ML", instructor: "Dr. Vikram Joshi", credits: 4, duration: "12 Weeks", level: "Advanced", rating: 4.9, description: "Supervised learning, neural networks, computer vision, and NLP principles." },
  { id: 5, code: "DS205", title: "Data Analytics with Python", category: "Data Science", instructor: "Prof. Sneha Shah", credits: 3, duration: "8 Weeks", level: "Beginner", rating: 4.6, description: "Exploratory data analysis using Pandas, NumPy, Matplotlib, and Seaborn." },
  { id: 6, code: "IT206", title: "Computer Networks & Security", category: "Information Technology", instructor: "Dr. Hardik Dave", credits: 3, duration: "10 Weeks", level: "Intermediate", rating: 4.5, description: "TCP/IP protocol suite, network routing, cryptography, and firewalls." },
  { id: 7, code: "CE207", title: "Java Programming & OOP", category: "Computer Engineering", instructor: "Prof. Milan Mehta", credits: 4, duration: "12 Weeks", level: "Intermediate", rating: 4.8, description: "Object-oriented programming concepts, inheritance, polymorphism, and collections." },
  { id: 8, code: "CS208", title: "Operating Systems Architecture", category: "Computer Science", instructor: "Dr. Krunal Bhatt", credits: 4, duration: "12 Weeks", level: "Advanced", rating: 4.7, description: "Process synchronization, memory management, file systems, and virtual memory." }
];

document.addEventListener('DOMContentLoaded', function() {
    fetchCourses();
    setupEventListeners();
    highlightActiveNav('courses');
});

function fetchCourses() {
    const container = document.getElementById('coursesContainer');
    if (container) {
        container.innerHTML = '<div class="loading-spinner">Fetching courses from external JSON...</div>';
    }

    fetch('courses.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allCourses = data;
            applyFilters();
        })
        .catch(error => {
            allCourses = fallbackCourses;
            applyFilters();
        });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            applyFilters();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentPage = 1;
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applyFilters();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderCourses();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderCourses();
            }
        });
    }
}

function applyFilters() {
    const searchVal = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase().trim() : '';
    const categoryVal = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : 'all';
    const sortVal = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'name-asc';

    filteredCourses = allCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchVal) ||
                              course.code.toLowerCase().includes(searchVal) ||
                              course.instructor.toLowerCase().includes(searchVal) ||
                              course.description.toLowerCase().includes(searchVal);

        const matchesCategory = categoryVal === 'all' || course.category === categoryVal;

        return matchesSearch && matchesCategory;
    });

    if (sortVal === 'name-asc') {
        filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortVal === 'name-desc') {
        filteredCourses.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortVal === 'credits-desc') {
        filteredCourses.sort((a, b) => b.credits - a.credits);
    } else if (sortVal === 'rating-desc') {
        filteredCourses.sort((a, b) => b.rating - a.rating);
    }

    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    renderCourses();
}

function renderCourses() {
    const container = document.getElementById('coursesContainer');
    const totalCountEl = document.getElementById('totalCount');
    const pageInfoEl = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumbersEl = document.getElementById('pageNumbers');

    if (!container) return;

    const totalItems = filteredCourses.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    if (totalCountEl) {
        totalCountEl.textContent = `Found ${totalItems} Course${totalItems === 1 ? '' : 's'}`;
    }

    if (totalItems === 0) {
        container.innerHTML = '<div class="no-results">No courses found matching your criteria. Try adjusting your search or filter.</div>';
        if (pageInfoEl) pageInfoEl.textContent = 'Page 0 of 0';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        if (pageNumbersEl) pageNumbersEl.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    let html = '';
    paginatedCourses.forEach(course => {
        html += `
            <div class="course-card">
                <div class="card-header">
                    <span class="course-code">${escapeHtml(course.code)}</span>
                    <span class="course-category">${escapeHtml(course.category)}</span>
                </div>
                <h3 class="course-title">${escapeHtml(course.title)}</h3>
                <p class="course-instructor">Instructor: ${escapeHtml(course.instructor)}</p>
                <p class="course-desc">${escapeHtml(course.description)}</p>
                <div class="card-footer">
                    <span class="meta-tag">Duration: ${escapeHtml(course.duration)}</span>
                    <span class="meta-tag">${course.credits} Credits</span>
                    <span class="rating-badge">Rating: ${course.rating}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    if (pageInfoEl) {
        pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    renderPageNumbers(totalPages);
}

function renderPageNumbers(totalPages) {
    const pageNumbersEl = document.getElementById('pageNumbers');
    if (!pageNumbersEl) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn-num ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    pageNumbersEl.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderCourses();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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

window.goToPage = goToPage;
