// initialize constants for convenience - apikey and DateTime handler
const apiKey = '24b36e9826e829e8c4cfc81fb3088c3d';
const DateTime = luxon.DateTime;

// initialize variables that will track user input
var searchFormEl = document.querySelector('#city-search-form');
var cityInputEl = document.querySelector('#city-input');

// initialize variables that will hold dynamic content
var activeLocationEl = document.querySelector('.activeLocation');
var currentWeatherEl = document.querySelector('.current-weather');
var currentConditions = document.createElement('ul');
var forecastHeaderEl = document.querySelector('.forecast-header');
var fiveDayForecastEl = document.querySelector('.five-day-forecast');
var recentSearchesEl = document.querySelector('.recent-searches');

// initialize recent searches array
var recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// function to handle a submitted search city
var searchSubmitHandler = function(event) {
    // prevent page reload
    event.preventDefault();

    // get search term from input element
    var city = cityInputEl.value.trim();

    // if there is a city, getCurrentWeather
    if (city) {
        getCurrentWeather(city);
        updateRecentSearches(city);
        cityInputEl.value = '';
    }
    else {
        alert('please enter a city');
    }
};

// function to handle click on a city in recent searches
var recentCityHandler = function(event) {
    var cityID = event.target.getAttribute('data-id');
    var cityToGet = recentSearches[cityID];
    getCurrentWeather(cityToGet);
};

// function to update recentSearches array/local storage object
var updateRecentSearches = function(city){
    recentSearches.unshift(city);
    localStorage.setItem('recentSearches',JSON.stringify(recentSearches));
    populateRecentSearches(recentSearches);
};

// function to populate recent searches onto the page
var populateRecentSearches = function(recentSearchesArray) {
    // clear out original list
    recentSearchesEl.innerHTML = '';

    // loop over recentSearches and push them into the page
    for(var i = 0; i < recentSearchesArray.length; i++) {
        // truncate new city from storage to 'city, state'
        var newCityElements = recentSearchesArray[i].split(',');

        // initialize container for new city
        var newCity = document.createElement('li');
        newCity.classList.add('list-group-item');
        newCity.setAttribute('data-id',[i]);

        // insert appropriate text content to new city container
        newCity.textContent = newCityElements[0] + ', ' + newCityElements[1];

        // append new city to recent searches list
        recentSearchesEl.appendChild(newCity);
    }
};

var getForecast = function (lat, lon) {
    // build query URL
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=current,minutely,hourly,alerts&appid=' + apiKey + '&units=imperial';

    // send request to apiUrl
    fetch(apiUrl).then(function(response){
        // if successful, format response
        if(response.ok){
            response.json().then(function(data){
                populateForecast(data);
            })
        }
        // if unsuccessful, display an alert
        else {
            alert('Something went wrong!\nError: ' + response.statusText);
        }
    })
    // in the event of connectivity issues, display an alert
    .catch(function(error){
        alert('Unable to connect to OpenWeather.');
    });
};

var populateForecast = function(forecastData) {
    // clear out any prior forecast
    fiveDayForecastEl.innerHTML = '';
    forecastHeaderEl.textContent = '5 Day Forecast';
    var forecastContainer = document.createElement('div');
    forecastContainer.classList.add('card-group');

    for(var i = 1; i < 6; i++){
        var forecastDay = document.createElement('div');
        forecastDay.classList.add('card', 'text-center', 'm-2', 'p-1');

        var cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        var cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        var forecastDate = DateTime.fromSeconds(forecastData.daily[i].dt ,'UTC');
        cardTitle.textContent = forecastDate.toLocaleString();

        cardBody.appendChild(cardTitle);

        var cardIcon = document.createElement('img');
        var iconURL = 'http://openweathermap.org/img/wn/' + forecastData.daily[i].weather[0].icon + '@2x.png';
        cardIcon.setAttribute('src', iconURL);
        cardIcon.classList.add('card-text');

        cardBody.appendChild(cardIcon);

        var cardTemp = document.createElement('p');
        cardTemp.classList.add('card-text');
        cardTemp.setAttribute('style','font-size: 18px;')
        cardTemp.textContent = Math.round(forecastData.daily[i].temp.day) + '° F';

        cardBody.appendChild(cardTemp);

        var cardHigh = document.createElement('p');
        cardHigh.classList.add('card-text');
        cardHigh.textContent = 'High: ' + Math.round(forecastData.daily[i].temp.max) + '° F';

        cardBody.appendChild(cardHigh);

        var cardLow = document.createElement('p');
        cardLow.classList.add('card-text');
        cardLow.textContent = 'Low: ' + Math.round(forecastData.daily[i].temp.min) + '° F';

        cardBody.appendChild(cardLow);

        var cardHumidity = document.createElement('p');
        cardHumidity.classList.add('card-text');
        cardHumidity.textContent = 'Humidity: ' + forecastData.daily[i].humidity + '%';

        cardBody.appendChild(cardHumidity);

        forecastDay.appendChild(cardBody);
        forecastContainer.appendChild(forecastDay);
    }

    fiveDayForecastEl.appendChild(forecastContainer);
};

var getCurrentWeather = function(city, stateCode, countryCode) {
    // build api url
    apiUrl = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + ',' + stateCode + ',' + countryCode + '&appid=' + apiKey + '&units=imperial';

    // send request to get current weather
    fetch(apiUrl).then(function(response){
        // if successful, format response
        if (response.ok){
            response.json().then(function(data){
                populateCurrentWeather(data);
            })
        }
        // if unsuccessful, display an alert
        else {
            alert('Something went wrong!\nError: ' + response.statusText);
        }
    })
    // in the event of connectivity issues, display an alert
    .catch(function(error){
        alert('Unable to connect to OpenWeather.');
    });
};

var populateCurrentWeather = function(weatherData) {
    // clear out any prior weather
    currentWeatherEl.innerHTML = '';
    currentConditions.innerHTML = '';

    // get date and format to human-friendly
    var currentDate = DateTime.fromSeconds(weatherData.dt ,'UTC');
    currentDate = currentDate.toLocaleString();
    // set text content of activeLocation span
    activeLocationEl.textContent = 'Weather in ' + weatherData.name + ' (' + currentDate + ')';
    // add an image of the current weather to the activeLocation span
    var currentWeatherImage = document.createElement('img');
    var iconURL = 'http://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '@2x.png';
    currentWeatherImage.setAttribute('src', iconURL);
    activeLocationEl.appendChild(currentWeatherImage);

    // insert 'feels like' and weather state
    var feelsLikeWeather = document.createElement('h3');
    feelsLikeWeather.textContent = `Feels like ${Math.round(weatherData.main.feels_like)}° F | ${weatherData.weather[0].main}`;

    currentWeatherEl.appendChild(feelsLikeWeather);

    // get and append temperature
    var currentTemp = document.createElement('li');
    currentTemp.textContent = `Temperature: ${Math.round(weatherData.main.temp)}°F`;
    currentConditions.appendChild(currentTemp);

    // get and append humidity
    var currentHumidity = document.createElement('li');
    currentHumidity.textContent = `Humidity: ${weatherData.main.humidity}%`;
    currentConditions.appendChild(currentHumidity);

    // get and append wind speed
    var currentWind = document.createElement('li');
    currentWind.textContent = `Wind: ${Math.round(weatherData.wind.speed)} MPH`
    currentConditions.appendChild(currentWind);

    currentWeatherEl.appendChild(currentConditions);

    // get and append uv index
    getCurrentUVIndex(weatherData.coord.lat, weatherData.coord.lon);
    // get and append 5 day forecast
    getForecast(weatherData.coord.lat, weatherData.coord.lon);
    
};

var getCurrentUVIndex = function(lat, lon) {
    // build api url
    apiUrl = 'http://api.openweathermap.org/data/2.5/uvi?lat='+ lat + '&lon=' + lon + '&appid=' + apiKey;

    // send request to get current UV index
    fetch(apiUrl).then(function(response){
        // if successful, format response
        if(response.ok){
            response.json().then(function(data){
                populateCurrentUVIndex(data);
            })
        }
        // if unsuccessful, display an alert
        else {
            alert('Something went wrong!\nError: ' + response.statusText);
        }
    })
    // in the event of connectivity issues, display an alert
    .catch(function(error){
        alert('Unable to connect to OpenWeather.');
    });
};

var populateCurrentUVIndex = function(uvData) {
    var currentUV = document.createElement('li');
    currentUV.textContent = `UV Index:  `;

    var uvSpan = document.createElement('span');
    uvSpan.textContent = uvData.value;

    if(uvData.value < 3){
        uvSpan.setAttribute('style','background-color: green;');
    }
    else if (uvData.value < 8){
        uvSpan.setAttribute('style','background-color: yellow;');
    }
    else {
        uvSpan.setAttribute('style','background-color: red;');
    }

    currentUV.appendChild(uvSpan);

    currentConditions.appendChild(currentUV);
}

populateRecentSearches(recentSearches);
searchFormEl.addEventListener('submit', searchSubmitHandler);
recentSearchesEl.addEventListener('click', recentCityHandler);
// getCurrentWeather('Honolulu', 'HI', 'US');