// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const notification = document.getElementById('notification');
const unitCelsius = document.getElementById('celsius');
const unitFahrenheit = document.getElementById('fahrenheit');
const autocompleteResults = document.getElementById('autocomplete-results');
const mapContainer = document.querySelector('.map-container');
const mapElement = document.getElementById('map');

// Virus mode elements
const virusToggle = document.getElementById('virus-toggle');
const virusOverlay = document.getElementById('virus-overlay');
const virusMessage = document.getElementById('virus-message');

// Weather API Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // REPLACE THIS
const GEO_API_KEY = 'YOUR_MAPBOX_API_KEY'; // REPLACE THIS
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Initialize map
let map;
let marker;
let virusMode = false;
let virusInterval;
let glitchInterval;
let flickerInterval;
let shiftInterval;

// Current date
const currentDate = new Date();
document.getElementById('date').textContent = formatDate(currentDate);
document.getElementById('current-year').textContent = currentDate.getFullYear();

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
locationBtn.addEventListener('click', getLocationWeather);
searchInput.addEventListener('input', handleAutocomplete);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchWeather();
});

unitCelsius.addEventListener('click', () => {
    if (!unitCelsius.classList.contains('active')) {
        toggleTemperatureUnit('celsius');
    }
});

unitFahrenheit.addEventListener('click', () => {
    if (!unitFahrenheit.classList.contains('active')) {
        toggleTemperatureUnit('fahrenheit');
    }
});

virusToggle.addEventListener('click', toggleVirusMode);

// Initialize with default location
initMap([-0.1276, 51.5074]); // London coordinates
getWeatherByCoords(51.5074, -0.1276);

// Functions
function initMap(coords) {
    if (map) map.remove();
    
    map = L.map(mapElement).setView(coords, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    
    marker = L.marker(coords).addTo(map)
        .bindPopup('Loading weather...');
    
    mapContainer.style.display = 'block';
}

function updateMap(coords, locationName) {
    if (!map) return;
    map.setView(coords, 12);
    marker.setLatLng(coords);
    marker.setPopupContent(locationName).openPopup();
}

async function handleAutocomplete() {
    const query = searchInput.value.trim();
    if (query.length < 3) {
        autocompleteResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${GEO_API_URL}/${encodeURIComponent(query)}.json?access_token=${GEO_API_KEY}&autocomplete=true&types=place`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            autocompleteResults.innerHTML = '';
            data.features.forEach(feature => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = feature.place_name;
                item.addEventListener('click', () => {
                    searchInput.value = feature.text;
                    autocompleteResults.style.display = 'none';
                    const coords = feature.center.reverse(); // [lat, lng]
                    initMap(coords);
                    getWeatherByCoords(coords[0], coords[1]);
                });
                autocompleteResults.appendChild(item);
            });
            autocompleteResults.style.display = 'block';
        } else {
            autocompleteResults.style.display = 'none';
        }
    } catch (error) {
        console.error('Autocomplete error:', error);
        autocompleteResults.style.display = 'none';
    }
}

async function searchWeather() {
    const location = searchInput.value.trim();
    if (location) {
        try {
            const response = await fetch(`${GEO_API_URL}/${encodeURIComponent(location)}.json?access_token=${GEO_API_KEY}&limit=1`);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                const coords = data.features[0].center.reverse(); // [lat, lng]
                initMap(coords);
                getWeatherByCoords(coords[0], coords[1]);
            } else {
                showNotification('Location not found');
            }
        } catch (error) {
            showNotification('Failed to find location');
            console.error('Search error:', error);
        }
    } else {
        showNotification('Please enter a location');
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const [currentWeather, forecast] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
        ]);
        
        if (!currentWeather.ok || !forecast.ok) {
            throw new Error('Weather data not available');
        }
        
        const currentData = await currentWeather.json();
        const forecastData = await forecast.json();
        
        if (virusMode) {
            // Corrupt some data for virus effect
            if (Math.random() > 0.5) currentData.name = "SYSTEM BREACH";
            if (Math.random() > 0.5) currentData.main.temp = Math.floor(Math.random() * 100) - 50;
            if (Math.random() > 0.5) currentData.weather[0].description = "MALWARE DETECTED";
            
            // Randomly corrupt forecast data
            forecastData.list.forEach(item => {
                if (Math.random() > 0.7) {
                    item.main.temp = Math.floor(Math.random() * 100) - 50;
                }
                if (Math.random() > 0.8) {
                    item.weather[0].description = "DATA CORRUPTED";
                }
            });
        }
        
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        searchInput.value = currentData.name;
        updateMap([lon, lat], `${currentData.name}, ${currentData.sys.country}`);
        
    } catch (error) {
        showNotification('Failed to fetch weather data');
        console.error('Weather fetch error:', error);
    }
}

function updateCurrentWeather(data) {
    const isCelsius = unitCelsius.classList.contains('active');
    
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('weather-icon').alt = data.weather[0].description;
    
    // Temperature
    const tempC = Math.round(data.main.temp);
    const tempF = Math.round((tempC * 9/5) + 32);
    document.getElementById('temp').textContent = isCelsius ? tempC : tempF;
    
    // Feels like
    const feelsLikeC = Math.round(data.main.feels_like);
    const feelsLikeF = Math.round((feelsLikeC * 9/5) + 32);
    document.getElementById('feels-like').textContent = isCelsius ? `${feelsLikeC}°C` : `${feelsLikeF}°F`;
    
    // Other details
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind').textContent = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    document.getElementById('pressure').textContent = data.main.pressure;
}

function updateForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    
    // Group forecast by day
    const dailyForecast = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                date: date
            };
        } else {
            // Update min/max temps
            if (item.main.temp_min < dailyForecast[day].temp_min) {
                dailyForecast[day].temp_min = item.main.temp_min;
            }
            if (item.main.temp_max > dailyForecast[day].temp_max) {
                dailyForecast[day].temp_max = item.main.temp_max;
            }
        }
    });
    
    // Display next 5 days (skip today)
    const days = Object.keys(dailyForecast).slice(1, 6);
    const isCelsius = unitCelsius.classList.contains('active');
    
    days.forEach(day => {
        const forecast = dailyForecast[day];
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        const minTemp = isCelsius ? Math.round(forecast.temp_min) : Math.round((forecast.temp_min * 9/5) + 32);
        const maxTemp = isCelsius ? Math.round(forecast.temp_max) : Math.round((forecast.temp_max * 9/5) + 32);
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
            </div>
            <div class="forecast-temp">
                <span>${maxTemp}°</span>
                <span>${minTemp}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                initMap([longitude, latitude]);
                getWeatherByCoords(latitude, longitude);
            },
            error => {
                console.error('Geolocation error:', error);
                showNotification('Unable to retrieve your location');
            }
        );
    } else {
        showNotification('Geolocation is not supported by your browser');
    }
}

function toggleTemperatureUnit(unit) {
    if (unit === 'celsius') {
        unitCelsius.classList.add('active');
        unitFahrenheit.classList.remove('active');
    } else {
        unitCelsius.classList.remove('active');
        unitFahrenheit.classList.add('active');
    }
    
    // Refresh displayed temperatures
    const location = document.getElementById('location').textContent;
    if (location !== '--') {
        const coords = marker.getLatLng();
        getWeatherByCoords(coords.lat, coords.lng);
    }
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Virus mode functionality
const virusMessages = [
    "Initializing breach sequence...",
    "Injecting malicious code...",
    "Bypassing security protocols...",
    "Accessing mainframe...",
    "Downloading sensitive data...",
    "Encrypting files...",
    "Establishing backdoor...",
    "Deploying payload...",
    "System compromised...",
    "HACK COMPLETE"
];

function toggleVirusMode() {
    virusMode = !virusMode;
    
    if (virusMode) {
        // Activate virus mode
        virusToggle.textContent = "Deactivate Virus Mode";
        virusToggle.style.background = "#00ff00";
        virusToggle.style.color = "#000";
        
        document.body.classList.add('virus-active');
        virusOverlay.style.display = 'block';
        virusMessage.style.display = 'block';
        
        startVirusEffects();
        virusInterval = setInterval(updateVirusMessage, 2000);
    } else {
        // Deactivate virus mode
        virusToggle.textContent = "Activate Virus Mode";
        virusToggle.style.background = "#ff0000";
        virusToggle.style.color = "#fff";
        
        document.body.classList.remove('virus-active');
        virusOverlay.style.display = 'none';
        virusMessage.style.display = 'none';
        
        clearInterval(virusInterval);
        stopVirusEffects();
        
        // Refresh weather data to return to normal
        const coords = marker.getLatLng();
        getWeatherByCoords(coords.lat, coords.lng);
    }
}

function startVirusEffects() {
    // Add glitch effects to elements
    const elements = document.querySelectorAll('h1, h2, h3, p, span, div, a, button');
    elements.forEach(el => {
        if (el.textContent && el.textContent.trim() !== '') {
            el.classList.add('glitch');
            el.setAttribute('data-text', el.textContent);
        }
    });
    
    // Randomly flicker elements
    flickerInterval = setInterval(() => {
        const randomEl = elements[Math.floor(Math.random() * elements.length)];
        if (randomEl) {
            randomEl.classList.add('error-flicker');
            setTimeout(() => randomEl.classList.remove('error-flicker'), 500);
        }
    }, 300);
    
    // Randomly shift elements
    shiftInterval = setInterval(() => {
        const randomEl = document.querySelectorAll('*:not(script):not(style)')[Math.floor(Math.random() * document.querySelectorAll('*:not(script):not(style)').length)];
        if (randomEl) {
            randomEl.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`;
            setTimeout(() => {
                if (randomEl) randomEl.style.transform = '';
            }, 200);
        }
    }, 500);
}

function stopVirusEffects() {
    // Remove all virus effects
    document.querySelectorAll('.glitch').forEach(el => {
        el.classList.remove('glitch');
        el.removeAttribute('data-text');
    });
    
    document.querySelectorAll('.error-flicker').forEach(el => {
        el.classList.remove('error-flicker');
    });
    
    document.querySelectorAll('*').forEach(el => {
        el.style.transform = '';
        el.style.color = '';
        el.style.fontFamily = '';
    });
    
    clearInterval(flickerInterval);
    clearInterval(shiftInterval);
}

function updateVirusMessage() {
    const randomMessage = virusMessages[Math.floor(Math.random() * virusMessages.length)];
    virusMessage.textContent = `> ${randomMessage}`;
    
    // Random chance to add more effects
    if (Math.random() > 0.7) {
        const elements = document.querySelectorAll('*:not(script):not(style)');
        const randomEl = elements[Math.floor(Math.random() * elements.length)];
        if (randomEl) {
            randomEl.style.color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
            randomEl.style.fontFamily = "'Courier New', monospace";
        }
    }
}

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
        autocompleteResults.style.display = 'none';
    }
});
