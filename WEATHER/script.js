document.getElementById('searchBtn').addEventListener('click', searchWeather);

function searchWeather() {
    const city = document.getElementById('cityInput').value;
    
    // Mock Weather Data (Replace with actual API call later)
    const weatherData = {
        'London': { temperature: '15°C', description: 'Cloudy' },
        'New York': { temperature: '20°C', description: 'Sunny' },
        'Tokyo': { temperature: '25°C', description: 'Rainy' },
        'Patiala': { temperature: '32°C', description: 'Hot' }
    };
    
    if (city in weatherData) {
        document.getElementById('city').innerText = city;
        document.getElementById('temperature').innerText = 'Temperature: ' + weatherData[city].temperature;
        document.getElementById('description').innerText = 'Description: ' + weatherData[city].description;
    } else {
        document.getElementById('city').innerText = 'City not found';
        document.getElementById('temperature').innerText = '';
        document.getElementById('description').innerText = '';
    }
}