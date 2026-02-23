window.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector(".weather-app");
  const logoContainer = document.querySelector(".floating-logo-container");
  const title = document.querySelector(".weather-title");
  const aboutSection = document.querySelector(".about-section");

  setTimeout(() => {
    logoContainer.classList.add("slide-left");
  }, 500);

  logoContainer.addEventListener("transitionend", (e) => {
    if (e.propertyName === "top" || e.propertyName === "left") {
      title.classList.remove("hidden");
      title.classList.add("show");
      app.classList.remove("hidden");
      app.classList.add("show");

      // Animate About Section after everything else
      setTimeout(() => {
        aboutSection.classList.remove("hidden");
        aboutSection.classList.add("show");
      }, 500);
    }
  });
});



const key = '2476b791ed3242bc84c212040250804';

function fetchData(event) {
  event.preventDefault();
  const input = document.getElementById('input').value;

  if (!input.trim()) {
    alert("Please enter a city.");
    return;
  }

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${input}&days=7&aqi=yes&alerts=yes`;

  fetch(url)
    .then(res => res.json())
    .then(data => updateHTML(data))
    .catch(() => alert("Could not fetch weather data. Please try again."));

  document.getElementById('input').value = '';
}

function updateHTML(data) {
  // Main Weather Info
  document.getElementById('city').innerText = data.location.name;
  document.getElementById('country').innerText = data.location.country;
  document.getElementById('temperature').innerText = data.current.temp_c;
  document.getElementById('wind').innerText = data.current.wind_kph;
  document.getElementById('humidity').innerText = data.current.humidity;
  document.getElementById('icon').src = "https:" + data.current.condition.icon;
  document.getElementById('icon').alt = data.current.condition.text;

  // Extra Info
  document.getElementById('uv-index').innerText = data.current.uv;
  document.getElementById('air-quality').innerText = data.current.air_quality.pm2_5.toFixed(1) + " PM2.5";
  document.getElementById('sunrise').innerText = data.forecast.forecastday[0].astro.sunrise;
  document.getElementById('sunset').innerText = data.forecast.forecastday[0].astro.sunset;
  document.getElementById('moon-phase').innerText = data.forecast.forecastday[0].astro.moon_phase;
  document.getElementById('alerts').innerText = data.alerts?.alert?.length > 0 ? data.alerts.alert[0].headline : "None";

  // Hourly Forecast (Next 6 hours)
  const hourly = data.forecast.forecastday[0].hour.slice(new Date().getHours(), new Date().getHours() + 6);
  document.getElementById('hourly').innerHTML = hourly.map(hour => `
    <div class="forecast-card">
      <p>${hour.time.split(' ')[1]}</p>
      <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" />
      <p>${hour.temp_c}°C</p>
    </div>
  `).join('');

  // Weekly Forecast
  document.getElementById('weekly').innerHTML = data.forecast.forecastday.map(day => `
    <div class="forecast-card">
      <p>${day.date}</p>
      <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <p>${day.day.avgtemp_c}°C</p>
    </div>
  `).join('');

  // Animate Extra Info Panel
  const extraInfoPanel = document.querySelector('.extra-info');
  extraInfoPanel.classList.remove('hidden');
  setTimeout(() => {
    extraInfoPanel.classList.add('show');
  }, 100);

  // Save History
  saveSearchHistory(data.location.name);
}

function saveSearchHistory(city) {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem('weatherHistory', JSON.stringify(history));
  }
}

// Geolocation Support
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${lat},${lon}&days=7&aqi=yes&alerts=yes`;
    fetch(url)
      .then(res => res.json())
      .then(data => updateHTML(data));
  });
}
