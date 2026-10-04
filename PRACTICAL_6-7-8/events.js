let allEvents = [];
let filteredEvents = [];
let currentPage = 1;
const itemsPerPage = 6;
const CACHE_KEY = 'studenthub_events_cache';
const CACHE_TIME_KEY = 'studenthub_events_cache_time';
document.addEventListener('DOMContentLoaded', () => {
    initEventsModule();
    setupEventListeners();
    highlightActiveNav('events');
});
async function initEventsModule() {
    const cachedData = loadFromLocalStorage();
    if (cachedData && cachedData.length > 0) {
        allEvents = cachedData;
        const cacheTime = localStorage.getItem(CACHE_TIME_KEY) || 'Previously saved';
        updateCacheBanner(true, `Displaying cached data (Saved: ${cacheTime})`);
        applyFilters();
    }
    await fetchEventsData();
}
async function fetchEventsData() {
    const container = document.getElementById('eventsContainer');
    if (allEvents.length === 0 && container) {
        container.innerHTML = `
            <div class="loading-box">
                <div class="spinner"></div>
                <h3>Fetching Events via Fetch API...</h3>
                <p>Loading events.json data from external file...</p>
            </div>
        `;
    }
    try {
        const response = await fetch('events.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Received empty or malformed events data.');
        }
        allEvents = data;
        saveToLocalStorage(data);
        const currentTime = new Date().toLocaleTimeString();
        updateCacheBanner(false, `Live Data Synchronized at ${currentTime}`);
        applyFilters();
    } catch (error) {
        console.warn('Fetch failed or offline mode triggered:', error);
        const cached = loadFromLocalStorage();
        if (cached && cached.length > 0) {
            allEvents = cached;
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
    const sortVal = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'date-asc';
    filteredEvents = allEvents.filter(event => {
        const matchesSearch = 
            (event.title && event.title.toLowerCase().includes(searchVal)) ||
            (event.description && event.description.toLowerCase().includes(searchVal)) ||
            (event.venue && event.venue.toLowerCase().includes(searchVal)) ||
            (event.organizer && event.organizer.toLowerCase().includes(searchVal)) ||
            (event.category && event.category.toLowerCase().includes(searchVal));
        const matchesCategory = categoryVal === 'all' || event.category === categoryVal;
        return matchesSearch && matchesCategory;
    });
    filteredEvents.sort((a, b) => {
        switch (sortVal) {
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'seats-desc':
                return (b.seats || 0) - (a.seats || 0);
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1;
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    renderEvents();
}
function renderEvents() {
    const container = document.getElementById('eventsContainer');
    const totalCountEl = document.getElementById('totalCount');
    const pageInfoEl = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!container) return;
    const totalItems = filteredEvents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (totalCountEl) {
        totalCountEl.textContent = `Showing ${totalItems} Event${totalItems === 1 ? '' : 's'}`;
    }
    if (totalItems === 0) {
        container.innerHTML = `
            <div class="empty-box">
                <h3>No Matching Events Found</h3>
                <p>Try modifying your search query or department filter.</p>
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
    const paginatedItems = filteredEvents.slice(startIndex, endIndex);
    const htmlCards = paginatedItems.map(event => {
        const feeText = event.fee === 0 ? 'Free Event' : `Fee: ₹${event.fee}`;
        const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        return `
            <article class="event-card" data-id="${event.id}">
                <div class="event-card-header">
                    <span class="event-badge">${escapeHtml(event.category)}</span>
                    <span class="event-fee">${feeText}</span>
                </div>
                <div class="event-card-body">
                    <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
                    <div class="event-info-row">
                        <span>📅 ${formattedDate}</span>
                        <span>⏰ ${escapeHtml(event.time)}</span>
                    </div>
                    <div class="event-info-row">
                        <span>📍 ${escapeHtml(event.venue)}</span>
                    </div>
                    <div class="event-info-row">
                        <span>🏛️ ${escapeHtml(event.organizer)}</span>
                    </div>
                    <p class="event-desc">${escapeHtml(event.description)}</p>
                </div>
                <div class="event-card-footer">
                    <span class="event-seats">🪑 ${event.seats} Seats Available</span>
                    <span class="event-rating">★ ${event.rating || '4.8'} / 5.0</span>
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
            <button class="btn-num ${i === currentPage ? 'active' : ''}" onclick="goToEventPage(${i})">
                ${i}
            </button>
        `;
    }
    pageNumbersEl.innerHTML = buttonsHtml;
}
function goToEventPage(page) {
    currentPage = page;
    renderEvents();
    window.scrollTo({ top: 180, behavior: 'smooth' });
}
function renderErrorState(errorMessage) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="error-box">
            <h3>⚠️ Unable to Load Events Data</h3>
            <p>${escapeHtml(errorMessage)}</p>
            <p>Ensure you are serving the files via an HTTP server or check network connection.</p>
            <button class="btn-refresh" style="margin-top: 12px; padding: 8px 16px;" onclick="fetchEventsData()">
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
                renderEvents();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderEvents();
            }
        });
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchEventsData();
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
window.goToEventPage = goToEventPage;
window.fetchEventsData = fetchEventsData;
