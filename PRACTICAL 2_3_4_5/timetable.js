// timetable.js - Timetable Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Timetable page loaded');
    
    loadTimetable();
    displayWeeklySchedule();
    highlightActiveNav('timetable');
});

function loadTimetable() {
    const timetable = {
        Monday: ['Data Structures 9:00 AM', 'Web Dev 11:00 AM'],
        Tuesday: ['Database Management 10:00 AM', 'Networks 2:00 PM'],
        Wednesday: ['Software Engineering 9:30 AM'],
        Thursday: ['Data Structures Lab 10:00 AM', 'Web Dev 3:00 PM'],
        Friday: ['Networks Lab 9:00 AM', 'Seminar 2:00 PM'],
        Saturday: [],
        Sunday: []
    };
    
    console.log('Timetable loaded:', timetable);
    return timetable;
}

function displayWeeklySchedule() {
    const timetable = loadTimetable();
    const daysWithClasses = Object.keys(timetable).filter(day => timetable[day].length > 0);
    console.log('Classes scheduled on: ' + daysWithClasses.join(', '));
}

function getTodayClasses() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const timetable = loadTimetable();
    return timetable[today] || [];
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
