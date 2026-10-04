let allFaqs = [];
let filteredFaqs = [];
let currentPage = 1;
const itemsPerPage = 6;
const CACHE_KEY = 'studenthub_faqs_cache';
const CACHE_TIME_KEY = 'studenthub_faqs_cache_time';
document.addEventListener('DOMContentLoaded', () => {
    initFaqsModule();
    setupEventListeners();
    highlightActiveNav('faqs');
});
async function initFaqsModule() {
    const cachedData = loadFromLocalStorage();
    if (cachedData && cachedData.length > 0) {
        allFaqs = cachedData;
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY) || 'Previously saved';
        updateCacheBanner(true, `Displaying cached data (Saved: ${cacheTime})`);
        applyFilters();
    }
    await fetchFaqsData();
}
async function fetchFaqsData() {
    const container = document.getElementById('faqsContainer');
    if (allFaqs.length === 0 && container) {
        container.innerHTML = `
            <div class="loading-box">
                <div class="spinner"></div>
                <h3>Fetching FAQs Knowledge Base...</h3>
                <p>Loading faqs.json data via Fetch API...</p>
            </div>
        `;
    }
    try {
        const response = await fetch('faqs.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Received invalid FAQs data.');
        }
        allFaqs = data;
        saveToLocalStorage(data);
        const currentTime = new Date().toLocaleTimeString();
        updateCacheBanner(false, `Live Data Synchronized at ${currentTime}`);
        applyFilters();
    } catch (error) {
        console.warn('Fetch failed or offline mode triggered:', error);
        const cached = loadFromLocalStorage();
        if (cached && cached.length > 0) {
            allFaqs = cached;
            const cacheTime = localStorage.getItem(CACHE_TIME_KEY) || 'Earlier';
            updateCacheBanner(true, `Offline mode: Network unavailable. Loaded from cache (${cacheTime})`);
            applyFilters();
        } else {
            renderErrorState(error.message);
        }
    }
}
function applyFilters() {
    const searchVal = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase().trim() : '';
    const categoryVal = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : 'all';
    const sortVal = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'helpful-desc';
    filteredFaqs = allFaqs.filter(faq => {
        const matchesSearch = 
            (faq.question && faq.question.toLowerCase().includes(searchVal)) ||
            (faq.answer && faq.answer.toLowerCase().includes(searchVal)) ||
            (faq.tags && faq.tags.some(tag => tag.toLowerCase().includes(searchVal))) ||
            (faq.category && faq.category.toLowerCase().includes(searchVal));
        const matchesCategory = categoryVal === 'all' || faq.category === categoryVal;
        return matchesSearch && matchesCategory;
    });
    filteredFaqs.sort((a, b) => {
        switch (sortVal) {
            case 'helpful-desc':
                return (b.helpful || 0) - (a.helpful || 0);
            case 'question-asc':
                return a.question.localeCompare(b.question);
            case 'question-desc':
                return b.question.localeCompare(a.question);
            case 'date-desc':
                return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
            default:
                return 0;
        }
    });
    const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    renderFaqs();
}
function renderFaqs() {
    const container = document.getElementById('faqsContainer');
    const totalCountEl = document.getElementById('totalCount');
    const pageInfoEl = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!container) return;
    const totalItems = filteredFaqs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (totalCountEl) {
        totalCountEl.textContent = `Showing ${totalItems} Answered Question${totalItems === 1 ? '' : 's'}`;
    }
    if (totalItems === 0) {
        container.innerHTML = `
            <div class="empty-box">
                <h3>No Matching FAQs Found</h3>
                <p>Try searching for a different keyword or category.</p>
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
    const paginatedItems = filteredFaqs.slice(startIndex, endIndex);
    const htmlCards = paginatedItems.map((faq, index) => {
        const tagsHtml = (faq.tags || []).map(tag => 
            `<span class="faq-tag">#${escapeHtml(tag)}</span>`
        ).join('');
        const isOpen = index === 0; 
        return `
            <div class="faq-item ${isOpen ? 'open' : ''}" id="faq-${faq.id}">
                <div class="faq-header" onclick="toggleFaqAccordion(${faq.id})">
                    <div class="faq-header-left">
                        <span class="faq-category-badge">${escapeHtml(faq.category)}</span>
                        <h3 class="faq-question">${escapeHtml(faq.question)}</h3>
                    </div>
                    <span class="faq-chevron">▼</span>
                </div>
                <div class="faq-body">
                    <p>${escapeHtml(faq.answer)}</p>
                    <div class="faq-footer">
                        <div class="faq-tags">
                            ${tagsHtml}
                        </div>
                        <span class="faq-votes">👍 ${faq.helpful || 0} found this helpful</span>
                    </div>
                </div>
            </div>
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
function toggleFaqAccordion(id) {
    const item = document.getElementById(`faq-${id}`);
    if (item) {
        item.classList.toggle('open');
    }
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
            <button class="btn-num ${i === currentPage ? 'active' : ''}" onclick="goToFaqPage(${i})">
                ${i}
            </button>
        `;
    }
    pageNumbersEl.innerHTML = buttonsHtml;
}
function goToFaqPage(page) {
    currentPage = page;
    renderFaqs();
    window.scrollTo({ top: 180, behavior: 'smooth' });
}
function renderErrorState(errorMessage) {
    const container = document.getElementById('faqsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="error-box">
            <h3>⚠️ Unable to Load FAQs Data</h3>
            <p>${escapeHtml(errorMessage)}</p>
            <p>Ensure faqs.json is available in the current directory and accessible over HTTP.</p>
            <button class="btn-refresh" style="margin-top: 12px; padding: 8px 16px;" onclick="fetchFaqsData()">
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
    const categoryFilter = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            applyFilters();
        });
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
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
                renderFaqs();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderFaqs();
            }
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchFaqsData();
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
window.toggleFaqAccordion = toggleFaqAccordion;
window.goToFaqPage = goToFaqPage;
window.fetchFaqsData = fetchFaqsData;
