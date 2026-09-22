
document.addEventListener('DOMContentLoaded', function() {
    console.log('Announcements page loaded');
    
    loadAnnouncements();
    displayLatestAnnouncements();
    highlightActiveNav('announcements');
});

function loadAnnouncements() {
    const announcements = [
        { id: 1, date: '2026-08-30', title: 'Semester Begins', message: 'New semester starts from September 1st' },
        { id: 2, date: '2026-08-28', title: 'Library Extended Hours', message: 'Library will be open till 10 PM during exams' },
        { id: 3, date: '2026-08-25', title: 'Holiday Notice', message: 'Campus will be closed on Independence Day' }
    ];
    
    console.log('Announcements loaded:', announcements);
    return announcements;
}

function displayLatestAnnouncements() {
    const announcements = loadAnnouncements();
    const latest = announcements.slice(0, 3);
    console.log('Displaying latest ' + latest.length + ' announcements');
}

function searchAnnouncements(searchTerm) {
    const announcements = loadAnnouncements();
    return announcements.filter(ann => 
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
