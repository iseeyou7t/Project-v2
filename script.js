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

// Weather API Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // REPLACE THIS
const GEO_API_KEY = 'YOUR_MAPBOX_API_KEY'; // Get from Mapbox (free tier available)
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Initialize map
let map;
let marker;

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

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
        autocompleteResults.style.display = 'none';
    }
});
