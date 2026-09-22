document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    displayDashboardStats();
    updateDashboardInfo();
    fetchLiveWeather();
    highlightActiveNav('dashboard');
});

function displayDashboardStats() {
    const stats = {
        totalCourses: 5,
        assignments: 3,
        attendance: 90,
        upcomingExam: 'Computer Networking CIE-1'
    };
    
    console.log('Dashboard Stats:', stats);
    return stats;
}

function updateDashboardInfo() {
    const dashboardList = document.querySelector('.dashboard-list');
    if (dashboardList) {
        console.log('Dashboard information updated');
    }
}

function fetchLiveWeather() {
    const tempEl = document.getElementById('weatherTemp');
    const humidityEl = document.getElementById('weatherHumidity');
    const conditionEl = document.getElementById('weatherCondition');

    const apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=22.60&longitude=72.82&current=temperature_2m,relative_humidity_2m,weather_code';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather API fetch failed');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.current) {
                const temp = Math.round(data.current.temperature_2m);
                const humidity = Math.round(data.current.relative_humidity_2m);
                const code = data.current.weather_code;

                if (tempEl) tempEl.textContent = `${temp}°C`;
                if (humidityEl) humidityEl.textContent = `${humidity}%`;
                if (conditionEl) conditionEl.textContent = getWeatherConditionText(code);
            } else {
                useFallbackWeather();
            }
        })
        .catch(err => {
            useFallbackWeather();
        });
}

function useFallbackWeather() {
    const tempEl = document.getElementById('weatherTemp');
    const humidityEl = document.getElementById('weatherHumidity');
    const conditionEl = document.getElementById('weatherCondition');

    if (tempEl) tempEl.textContent = '28°C';
    if (humidityEl) humidityEl.textContent = '65%';
    if (conditionEl) conditionEl.textContent = 'Clear Sky';
}

function getWeatherConditionText(code) {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Clear';
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
