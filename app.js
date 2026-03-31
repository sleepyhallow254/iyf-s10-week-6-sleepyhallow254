const API_KEY = "36f3510b0ac4684bd292e246a051b057";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// DOM Elements
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");

// Weather elements
const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

// Forecast elements
const forecastContainer = document.getElementById("forecast-container");
const forecastSection = document.getElementById("forecast");

// History
const historyList = document.getElementById("search-history");

// 🌤️ FETCH CURRENT WEATHER
async function getWeather(city) {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        showLoading();
        hideError();

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found");
            }
            throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();

        displayWeather(data);
        getForecast(city); // 🔥 CALL FORECAST HERE
        saveToHistory(city);

    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

// 🌤️ FETCH 5-DAY FORECAST
async function getForecast(city) {
    const url = `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        displayForecast(data);

    } catch (err) {
        console.log("Forecast error:", err);
    }
}

// 📊 DISPLAY CURRENT WEATHER
function displayWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `🌡️ ${data.main.temp}°C`;
    description.textContent = `☁️ ${data.weather[0].description}`;
    feelsLike.textContent = `${data.main.feels_like}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherDisplay.classList.remove("hidden");
}

// 📅 DISPLAY FORECAST
function displayForecast(data) {
    forecastContainer.innerHTML = "";

    // Get one forecast per day (every 8th item)
    const dailyData = data.list.filter((item, index) => index % 8 === 0);

    dailyData.forEach(day => {
        const date = new Date(day.dt_txt).toDateString();
        const temp = day.main.temp;
        const icon = day.weather[0].icon;

        const div = document.createElement("div");
        div.classList.add("forecast-item");

        div.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png">
            <p>${temp}°C</p>
        `;

        forecastContainer.appendChild(div);
    });

    forecastSection.classList.remove("hidden");
}

// ⏳ LOADING
function showLoading() {
    loading.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
    forecastSection.classList.add("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

// ❌ ERROR
function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
}

function hideError() {
    error.classList.add("hidden");
}

// 💾 SAVE HISTORY
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
    history.unshift(city);
    history = history.slice(0, 5);

    localStorage.setItem("weatherHistory", JSON.stringify(history));

    renderHistory();
}

// 📜 LOAD HISTORY
function loadHistory() {
    renderHistory();
}

// 🧾 DISPLAY HISTORY
function renderHistory() {
    const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

    historyList.innerHTML = "";

    history.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;

        li.addEventListener("click", () => {
            getWeather(city);
        });

        historyList.appendChild(li);
    });
}

// 🎯 EVENT LISTENER
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();

    if (city) {
        getWeather(city);
        cityInput.value = "";
    }
});

// 🚀 INIT
loadHistory();