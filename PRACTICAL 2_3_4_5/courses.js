document.addEventListener('DOMContentLoaded', function() {
    console.log('Courses page loaded');
    
    loadCourses();
    displayCourseList();
    highlightActiveNav('courses');
});

function loadCourses() {
    const courses = [
        { id: 1, name: 'Data Structures', instructor: 'Dr. Smith', credits: 4 },
        { id: 2, name: 'Web Development', instructor: 'Prof. Johnson', credits: 3 },
        { id: 3, name: 'Database Management', instructor: 'Dr. Williams', credits: 4 },
        { id: 4, name: 'Computer Networks', instructor: 'Prof. Brown', credits: 3 },
        { id: 5, name: 'Software Engineering', instructor: 'Dr. Davis', credits: 4 }
    ];
    
    console.log('Courses loaded:', courses);
    return courses;
}

function displayCourseList() {
    const coursesList = document.querySelector('.courses-list');
    if (coursesList) {
        const courses = loadCourses();
        console.log('Displaying ' + courses.length + ' courses');
    }
}

function filterCourses(searchTerm) {
    const courses = loadCourses();
    return courses.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
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
