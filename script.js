const API_KEY = '2cae97e101db245112ef2b9611a9d06d'; 
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
      console.log('✅ Service Worker Registered');
    });
  }

  // Event listeners
  document.getElementById('searchBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) getWeather(city);
  });

  document.getElementById('voiceBtn').addEventListener('click', startVoiceRecognition);

  document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  // Restore dark mode if saved
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  // Load last searched city
  const last = localStorage.getItem('lastWeather');
  if (last) {
    const { city } = JSON.parse(last);
    getWeather(city);
  }

  // Cancel speech if tab/window is closed
  window.addEventListener('beforeunload', () => {
    window.speechSynthesis.cancel();
  });
});

function startVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition not supported on this browser.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Cancel current speech first
  window.speechSynthesis.cancel();

  const prompt = new SpeechSynthesisUtterance("Please say the city name.");
  window.speechSynthesis.speak(prompt);

  recognition.start();

  recognition.onresult = (event) => {
    const city = event.results[0][0].transcript;
    console.log('🎤 Heard:', city);
    document.getElementById('cityInput').value = city;
    getWeather(city);
  };

  recognition.onerror = (event) => {
    alert('Speech recognition error: ' + event.error);
  };
}

function getWeather(city) {
  // Cancel previous speech
  window.speechSynthesis.cancel();

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);

      const { name } = data;
      const { temp, humidity, pressure } = data.main;
      const { speed } = data.wind;
      const description = data.weather[0].description;
      const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

      const weatherText = `Weather in ${name}: ${description}. Temperature: ${temp}°C. Humidity: ${humidity}%. Wind speed: ${speed} meters per second. Pressure: ${pressure} hectopascals.`;

      document.getElementById('weatherInfo').innerHTML = `
        <p><strong>${name}</strong></p>
        <img src="${icon}" alt="Weather icon" />
        <p>🌤️ ${description}</p>
        <p>🌡️ Temp: ${temp}°C</p>
        <p>💧 Humidity: ${humidity}%</p>
        <p>💨 Wind Speed: ${speed} m/s</p>
        <p>🌪️ Pressure: ${pressure} hPa</p>
      `;

      speakWeather(weatherText);
      localStorage.setItem('lastWeather', JSON.stringify({ city, data }));
    })
    .catch(error => {
      alert('Error fetching weather: ' + error.message + '. Try again.');
    });
}

function speakWeather(text) {
  if ('speechSynthesis' in window) {
    // Always cancel existing speech before starting
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
}
