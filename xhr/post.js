function createWeatherData(type, time, place, value, unit) {
  return {
    type,
    time,
    place,
    value,
    unit,
  };
}

document.addEventListener('DOMContentLoaded', function () {
  const weatherForm = document.getElementById('weatherForm');

  weatherForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const time = document.getElementById('time').value;
    const place = document.getElementById('place').value;

    const data = [
      createWeatherData(
        'temperature',
        time,
        place,
        parseFloat(document.getElementById('tempValue').value),
        document.getElementById('tempUnit').value
      ),
      {
        ...createWeatherData(
          'precipitation',
          time,
          place,
          parseFloat(document.getElementById('precValue').value),
          document.getElementById('precUnit').value
        ),
        precipitation_type: document.getElementById('precipitationType').value,
      },
      {
        ...createWeatherData(
          'wind speed',
          time,
          place,
          parseFloat(document.getElementById('windValue').value),
          document.getElementById('windUnit').value
        ),
        direction: document.getElementById('direction').value,
      },
      createWeatherData(
        'cloud coverage',
        time,
        place,
        parseFloat(document.getElementById('cloudValue').value),
        document.getElementById('cloudUnit').value
      ),
    ];

    postWeatherData(data);
  });

  function postWeatherData(dataArray) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8080/data', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      if (xhr.status === 201) {
        alert('Data saved successfully!');
      } else {
        alert('Error saving data.');
      }
    };
    xhr.send(JSON.stringify(dataArray));
  }
});
