var mymap = L.map('mapid').setView([37, -95], 3.5);
updateMap();
getData();

async function getData() {

    const response = await fetch('/api');
    const data = await response.json();

    for (item of data) {
        const dateString = new Date(item.timestamp).toLocaleString();
        let popupText = `Location: ${item.location} Date: ${dateString} Note: ${item.notes}`
        var marker = L.marker([item.latitude, item.longitude]).addTo(mymap).bindPopup(popupText);
    }
}

getList();
async function getList() {

    const response = await fetch('/api');
    const data = await response.json();
    let bodyHTML = '';
    let gridCard;

    for (item of data) {

        let date = new Date(item.timestamp).toLocaleString();
        let temperature = item.temperature.toFixed(0);

        gridCard = `<div class="card-column col-lg-3 col-md-4 col-sm-6 ">
        <div class="card">
        <h5 class="card-header">${date}</h5>
          <div class="card-body">
            <h5 class="card-title">${item.location}</h5>
            <p >Conditions: ${item.conditions}</p>
            <p >Temperature: ${temperature}&degF</p>
            <p >Humidity: ${item.humidity}%</p>
            <p >Notes: ${item.notes}</p>
           </div>
        </div>
        </div>`;
        bodyHTML = bodyHTML + gridCard;
    }
    
    document.getElementById('main-content').innerHTML = bodyHTML;
}

function updateMap() {

    //Code to setup map tiles useing mapbox
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/light-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiY2hhcmxpZWJyZW5uYW41MCIsImEiOiJja2VnejBjMWswbGoyMzBxcTFhYW00ZmkwIn0.UN50EPaU0pu2JV131L422g'
    }).addTo(mymap);

}