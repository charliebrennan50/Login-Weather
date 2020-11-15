// initialize map
var mymap = L.map('mapid').setView([0, 0], 8);

//create button listener
document.getElementById('myBtn').addEventListener("click", function () {
  if ('geolocation' in navigator) {
    console.log("available");

    //get current lat/long from navigator
    navigator.geolocation.getCurrentPosition(async position => {
      lat = position.coords.latitude;
      long = position.coords.longitude;

      // use lat/long to update position on main page map
      updateMap(lat, long);

      // get current weather from openweathermap api
      const api = "https://api.openweathermap.org/data/2.5/weather";
      let weatherOptions = "units=imperial";
      let apiKey = "d2e382f0a6d1e0d614cb71aca19f1c25";

      let weatherURL = `${api}?lat=${lat}&lon=${long}&${weatherOptions}&appid=${apiKey}`
      let response = await fetch(weatherURL);
      let weather = await response.json();

      // assign weather data to variables for display and storage
      lat = lat.toFixed(2);
      long = long.toFixed(2);
      let temperature = weather.main.temp.toFixed(0);
      let conditions = weather.weather[0].main;
      let humidity = weather.main.humidity;
      let location = weather.name;

      //Display to page

      const display = `<div>
    <p>
      I'm currently located near ${location}
      at latitude ${lat}
      and longitude ${long}.
    </p>
    <p>
      The temperature is currently ${temperature}&degF with a relative
      humidity of ${humidity}%.
    </p>
    <p>
      The local weather conditions are ${conditions}.
    </p>
  </div>`;

      document.getElementById('display-text').innerHTML = display;


      // Get notes 
      let notes = document.getElementById("notes").value;

      // create json object to post to database
      const data = {
        lat,
        long,
        temperature,
        conditions,
        humidity,
        location,
        notes
      };
      const options = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // use fetch to POST data 
      fetch('/api', options).then(response => {
        console.log(response);
      });

    });
  } else {
    console.log("not available");
  }
});

function updateMap(lat, long) {

  //Code to setup map tiles useing mapbox
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY2hhcmxpZWJyZW5uYW41MCIsImEiOiJja2VnejBjMWswbGoyMzBxcTFhYW00ZmkwIn0.UN50EPaU0pu2JV131L422g'
  }).addTo(mymap);

  // center view on current lat/long with zoom factor of 8
  mymap.setView(new L.LatLng(lat, long), 8);

  // assign popup text to marker to display when clicked
  let popupText = `Latutude: ${lat.toFixed(4)}, Longitude: ${long.toFixed(4)}`
  var marker = L.marker([lat, long]).addTo(mymap).bindPopup(popupText);
}