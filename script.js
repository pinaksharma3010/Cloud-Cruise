const form = document.getElementById('weatherForm');
const input = document.getElementById('cityInput');
const card = document.getElementById('weatherCard');
const geoBtn = document.getElementById('geoBtn');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (city) getCoordsFromCity(city);
});

geoBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(latitude, longitude);
    }, () => {
      showError("Geolocation failed.");
    });
  } else {
    showError("Geolocation not supported.");
  }
});

function getCoordsFromCity(city) {
  card.innerHTML = "🔄 Getting location...";
  card.classList.add("active");
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name, country } = data.results[0];
        fetchWeather(latitude, longitude, name + ", " + country);
      } else {
        showError("City not found.");
      }
    })
    .catch(() => showError("Failed to fetch coordinates."));
}

function fetchWeather(lat, lon, locationName = "") {
  card.innerHTML = "🌥 Fetching weather...";
  card.classList.add("active");
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    .then(res => res.json())
    .then(data => {
      const weather = data.current_weather;
      if (weather) {
        card.innerHTML = `
          <h2>${locationName || `Lat: ${lat}, Lon: ${lon}`}</h2>
          <p><strong>🌡 ${weather.temperature}°C</strong></p>
          <p>💨 Wind: ${weather.windspeed} km/h</p>
          <p>🕒 Time: ${weather.time}</p>
        `;
      } else {
        showError("No weather data.");
      }
    })
    .catch(() => showError("Failed to fetch weather."));
}

function showError(msg) {
  card.innerHTML = `<p style="color:red;">❌ ${msg}</p>`;
  card.classList.add("active");
}
