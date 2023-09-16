function createWeatherData(type, time, place, value, unit) {
  return {
    getValue: () => value,
    getType: () => type,
    getUnit: () => unit,
    getTime: () => time,
    getPlace: () => place,
  };
}

function createTemperature(time, place, value, unit = 'C') {
  return {
    ...createWeatherData('temperature', time, place, value, unit),
  };
}

function createWind(time, place, value, unit = 'm/s', direction) {
  return {
    ...createWeatherData('wind speed', time, place, value, unit),
    getDirection: () => direction,
  };
}

function createPrecipitation(
  time,
  place,
  value,
  unit = 'mm',
  precipitation_type
) {
  return {
    ...createWeatherData('precipitation', time, place, value, unit),
    getPrecipitationType: () => precipitation_type,
  };
}

function createCloudCoverage(time, place, value, unit = '%') {
  return {
    ...createWeatherData('cloud coverage', time, place, value, unit),
  };
}

function createWeatherPrediction(type, time, place, unit, from, to) {
  return {
    getType: function () {
      return type;
    },
    getTime: function () {
      return time;
    },
    getPlace: function () {
      return place;
    },
    getMax: function () {
      return to;
    },
    getMin: function () {
      return from;
    },
    getUnit: function () {
      return unit;
    },
  };
}

function createTemperaturePrediction(time, place, from, to, unit = 'C') {
  return createWeatherPrediction('temperature', time, place, unit, from, to);
}

function createPrecipitationPrediction(
  time,
  place,
  from,
  to,
  precipitationTypes,
  unit = 'mm'
) {
  const weatherPrediction = createWeatherPrediction(
    'precipitation',
    time,
    place,
    unit,
    from,
    to
  );

  weatherPrediction.getExpectedTypes = function () {
    return precipitationTypes;
  };

  return weatherPrediction;
}

function createWindPrediction(time, place, from, to, directions, unit = 'm/s') {
  const weatherPrediction = createWeatherPrediction(
    'wind speed',
    time,
    place,
    unit,
    from,
    to
  );

  weatherPrediction.getExpectedDirections = function () {
    return directions;
  };

  return weatherPrediction;
}

function createCloudCoveragePrediction(time, place, from, to, unit = '%') {
  return createWeatherPrediction('cloud coverage', time, place, unit, from, to);
}

let currentCity = 'Horsens';

document.addEventListener('DOMContentLoaded', function () {
  const citySelect = document.getElementById('city-select');
  const summaryDiv = document.getElementById('summary');
  const latestDiv = document.getElementById('latest-measurements');
  const forecastDiv = document.getElementById('forecast');

  citySelect.addEventListener('change', function () {
    loadWeatherData(citySelect.value, displayWeatherData);
  });

  loadWeatherData(citySelect.value, displayWeatherData);
  loadForecastData(citySelect.value, displayForecast);

  function loadWeatherData(city, callback) {
    fetch(`http://localhost:8080/data/${city}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const weatherDataObjects = data.map((item) => {
          switch (item.type) {
            case 'temperature':
              return createTemperature(
                item.time,
                item.place,
                item.value,
                item.unit
              );
            case 'wind speed':
              return createWind(
                item.time,
                item.place,
                item.value,
                item.unit,
                item.direction
              );
            case 'precipitation':
              return createPrecipitation(
                item.time,
                item.place,
                item.value,
                item.unit,
                item.precipitation_type
              );
            case 'cloud coverage':
              return createCloudCoverage(
                item.time,
                item.place,
                item.value,
                item.unit
              );
            default:
              return createWeatherData(
                item.type,
                item.time,
                item.place,
                item.value,
                item.unit
              );
          }
        });
        callback(weatherDataObjects);
      })
      .catch((error) => {
        console.log(
          'There was a problem with the fetch operation:',
          error.message
        );
      });
  }

  function loadForecastData(city, callback) {
    fetch(`http://localhost:8080/forecast/${city}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const forecastDataObjects = data.map((item) => {
          switch (item.type) {
            case 'temperature':
              return createTemperaturePrediction(
                item.time,
                item.place,
                item.from,
                item.to,
                item.unit
              );
            case 'precipitation':
              return createPrecipitationPrediction(
                item.time,
                item.place,
                item.from,
                item.to,
                item.precipitation_types,
                item.unit
              );
            case 'wind speed':
              return createWindPrediction(
                item.time,
                item.place,
                item.from,
                item.to,
                item.directions,
                item.unit
              );
            case 'cloud coverage':
              return createCloudCoveragePrediction(
                item.time,
                item.place,
                item.from,
                item.to,
                item.unit
              );
            default:
              throw new Error(`Unknown forecast type: ${item.type}`);
          }
        });
        callback(forecastDataObjects);
      })
      .catch((error) => {
        console.log(
          'There was a problem with the fetch operation:',
          error.message
        );
      });
  }

  function displayWeatherData(weatherDataObjects) {
    displaySummary(weatherDataObjects);
    displayLatestMeasurements(weatherDataObjects);
  }
  function displaySummary(data) {
    const temperatures = data
      .filter((item) => item.getType() === 'temperature')
      .map((item) => item.getValue());
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);

    const precipitation = data
      .filter((item) => item.getType() === 'precipitation')
      .map((item) => item.getValue());
    const totalPrecipitation = precipitation.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );

    const windSpeed = data
      .filter((item) => item.getType() === 'wind speed')
      .map((item) => item.getValue());
    const avgWindSpeed =
      windSpeed.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) / windSpeed.length;

    const cloudCoverage = data
      .filter((item) => item.getType() === 'cloud coverage')
      .map((item) => item.getValue());
    const avgCloudCoverage =
      cloudCoverage.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) / cloudCoverage.length;

    summaryDiv.innerHTML = `
            Minimum Temperature: ${minTemp}°C <br>
            Maximum Temperature: ${maxTemp}°C <br>
            Precipitation: ${totalPrecipitation} mm <br>
            Wind speed: ${avgWindSpeed.toFixed(2)} m/s <br>
            Cloud coverage: ${avgCloudCoverage.toFixed(2)} %
        `;
  }

  function displayLatestMeasurements(data) {
    const latestTemperature = data
      .filter((item) => item.getType() === 'temperature')
      .pop();
    const latestPrecipitation = data
      .filter((item) => item.getType() === 'precipitation')
      .pop();
    const latestWindSpeed = data
      .filter((item) => item.getType() === 'wind speed')
      .pop();
    const latestCloudCoverage = data
      .filter((item) => item.getType() === 'cloud coverage')
      .pop();

    latestDiv.innerHTML = `
            Temperature: ${latestTemperature.getValue()}°C <br>
            Precipitation: ${latestPrecipitation.getValue()} mm <br>
            Wind Speed: ${latestWindSpeed.getValue()} m/s <br>
            Cloud coverage: ${latestCloudCoverage.getValue()} %
        `;
  }

  function displayForecast(forecast) {
    let forecastHTML = '';
    forecast.forEach((item) => {
      let detailsHTML = '';

      if (item.getExpectedTypes) {
        detailsHTML += `<strong>Expected Types:</strong> ${item
          .getExpectedTypes()
          .join(', ')} <br>`;
      }
      if (item.getExpectedDirections) {
        detailsHTML += `<strong>Expected Directions:</strong> ${item
          .getExpectedDirections()
          .join(', ')} <br>`;
      }

      forecastHTML += `<div>
              <strong>Type:</strong> ${item.getType()} <br>
              <strong>Time:</strong> ${item.getTime()} <br>
              <strong>From:</strong> ${item.getMin()} ${item.getUnit()} <br>
              <strong>To:</strong> ${item.getMax()} ${item.getUnit()} <br>
              ${detailsHTML}
          </div><hr>`;
    });

    forecastDiv.innerHTML = forecastHTML;
  }
});
