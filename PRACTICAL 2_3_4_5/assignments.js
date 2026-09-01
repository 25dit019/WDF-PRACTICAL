// assignments.js - Assignments Page Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Assignments page loaded');
    
    loadAssignments();
    displayAssignmentStatus();
    highlightActiveNav('assignments');
});

function loadAssignments() {
    const assignments = [
        { id: 1, course: 'Data Structures', title: 'Array Problems', dueDate: '2026-09-10', status: 'Pending' },
        { id: 2, course: 'Web Development', title: 'HTML/CSS Project', dueDate: '2026-09-15', status: 'Submitted' },
        { id: 3, course: 'Database Management', title: 'SQL Queries', dueDate: '2026-09-20', status: 'Pending' }
    ];
    
    console.log('Assignments loaded:', assignments);
    return assignments;
}

function displayAssignmentStatus() {
    const assignments = loadAssignments();
    const pending = assignments.filter(a => a.status === 'Pending').length;
    const submitted = assignments.filter(a => a.status === 'Submitted').length;
    
    console.log('Pending: ' + pending + ', Submitted: ' + submitted);
}

function submitAssignment(assignmentId) {
    console.log('Assignment ' + assignmentId + ' submitted');
    alert('Assignment submitted successfully!');
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
