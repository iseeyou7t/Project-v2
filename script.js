// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const notification = document.getElementById('notification');
const unitCelsius = document.getElementById('celsius');
const unitFahrenheit = document.getElementById('fahrenheit');

// Weather API Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Current date
const currentDate = new Date();
document.getElementById('date').textContent = formatDate(currentDate);
document.getElementById('current-year').textContent = currentDate.getFullYear();

// Event Listeners
searchBtn.addEventListener('click', () => {
    const location = searchInput.value.trim();
    if (location) {
        getWeatherData(location);
    } else {
        showNotification('Please enter a location');
    }
});

locationBtn.addEventListener('click', getLocationWeather);

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
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
getWeatherData('London');

// Functions
async function getWeatherData(location) {
    try {
        // Get coordinates first for more accurate results
        const geoResponse = await fetch(`${BASE_URL}/weather?q=${location}&appid=${API_KEY}`);
        
        if (!geoResponse.ok) {
            throw new Error('Location not found');
        }
        
        const geoData = await geoResponse.json();
        const { lat, lon } = geoData.coord;
        
        // Fetch current weather and forecast using coordinates
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
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showNotification(error.message || 'Failed to fetch weather data');
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
                fetchWeatherByCoords(latitude, longitude);
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

async function fetchWeatherByCoords(lat, lon) {
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
        searchInput.value = '';
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showNotification('Failed to fetch weather data');
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
        getWeatherData(location.split(',')[0].trim());
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
