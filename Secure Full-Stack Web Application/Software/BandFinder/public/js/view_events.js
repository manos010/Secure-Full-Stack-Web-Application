
window.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadCities();
  searchEvents(event);
  initEventsMap();
  checkSessionForLocationSort();

});

let userLat = null;
let userLon = null;

function checkSessionForLocationSort() {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);

      const locationSortBtn = document.getElementById("locationSort");

      if (!locationSortBtn) return;

      if (data.loggedIn) {
        locationSortBtn.style.display = "inline-block";
        if(data.user.lat && data.user.lon){
            userLat = data.user.lat;
            userLon = data.user.lon;
        }else {
            alert("No user location found.");
        }
      } else {
        locationSortBtn.style.display = "none";
      }
    }
  };

  xhr.open("GET", "/session");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();
}



function fillSelect(selectId, values) {
  const select = document.getElementById(selectId);

  if (!Array.isArray(values)) {
    console.warn(`No data for ${selectId}:`, values);
    return;
  }


  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function loadGenres() {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);
      fillSelect("genreSelect", genres);
    } else {
      console.warn("Failed to load genres");
    }
  };

  xhr.open("GET", "/publicEvents/genres");
  xhr.send();
}

function loadCities() {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const cities = JSON.parse(xhr.responseText);
      fillSelect("citySelect", cities);
    } else {
      console.warn("Failed to load cities");
    }
  };

  xhr.open("GET", "/publicEvents/cities");
  xhr.send();
}


function searchEvents(event) {
    event.preventDefault();
    const genre = document.getElementById("genreSelect").value;
    const city = document.getElementById("citySelect").value;
    const date = document.getElementById("dateFilter").value;
    
    let url = `/publicEvents/search`;
    

    const params = [];
    if (genre !== "") params.push(`genre=${genre}`);
    if (city !== "") params.push(`city=${city}`);
    if (date !== "") params.push(`date=${date}`);

    if (params.length > 0) {
        url += "?" + params.join("&");
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
        const results = JSON.parse(xhr.responseText);
        console.log(results);
        showEvents(results);

        }
    };
    xhr.open("GET",url);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.send();
}
const eventMarkersMap = new Map();

let currentEvents = [];
function showEvents(events) {
  currentEvents = events; 
  console.log(currentEvents);
  const container = document.getElementById("eventsList");
  container.innerHTML = "<h2>Upcoming Public Events</h2>";

  if (!events || events.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No events found.";
    container.appendChild(empty);
    return;
  }

  events.forEach(ev => {
    const card = document.createElement("div");
    card.className = "event-card";

    const title = document.createElement("h3");
    title.textContent = ev.event_type;
    card.appendChild(title);

    const city = document.createElement("p");
    city.innerHTML = `<strong>City:</strong> ${ev.event_city}`;
    card.appendChild(city);

    const date = document.createElement("p");
    date.innerHTML = `<strong>Date:</strong> ${new Date(ev.event_datetime).toLocaleDateString()}`;
    card.appendChild(date);

    const price = document.createElement("p");
    price.innerHTML = `<strong>Price:</strong> €${ev.participants_price}`;
    card.appendChild(price);

     if (ev.drivingDistance !== undefined) {
        const distanceP = document.createElement("p");
        const km = (ev.drivingDistance / 1000).toFixed(2);
        distanceP.innerHTML = `<strong>Distance by car:</strong> ${km} km`;
        card.appendChild(distanceP);
    }

    container.appendChild(card);

    if(ev.event_lat && ev.event_lon){
            const marker = addEventMarker(ev.event_lat, ev.event_lon, ev.event_description || ev.event_type);
            /*eventMarkersMap.set(card, marker);*/

            card.addEventListener("click", () => {
                showMarker(marker);
            });
        }
  });
  updateMapMarkers(events);
}
let eventsMap;
let markersLayer;

function initEventsMap() {
    eventsMap = new OpenLayers.Map("map");
    const mapnik = new OpenLayers.Layer.OSM();
    eventsMap.addLayer(mapnik);

    markersLayer = new OpenLayers.Layer.Markers("EventMarkers");
    eventsMap.addLayer(markersLayer);

    eventsMap.setCenter(
        new OpenLayers.LonLat(23.7275, 37.9838).transform(
            new OpenLayers.Projection("EPSG:4326"),
            new OpenLayers.Projection("EPSG:900913")
        ), 
        6 
    );
}

function clearMarkers() {
    if (markersLayer) {
        markersLayer.clearMarkers();
    }
}

function addEventMarker(lat, lon, title) {
    const fromProj = new OpenLayers.Projection("EPSG:4326");
    const toProj = new OpenLayers.Projection("EPSG:900913");
    const position = new OpenLayers.LonLat(lon, lat).transform(fromProj, toProj);

    const marker = new OpenLayers.Marker(position);
    marker.events.register("mousedown", marker, function() {
        alert(title); 
    });

    markersLayer.addMarker(marker);

    return marker;
}

function updateMapMarkers(events) {
    clearMarkers();
    events.forEach(ev => {
        if(ev.event_lat && ev.event_lon){
            addEventMarker(ev.event_lat, ev.event_lon, ev.event_description || ev.event_type);
        }
    });

    if(events.length > 0 && events[0].event_lat && events[0].event_lon){
        const first = events[0];
        eventsMap.setCenter(
            new OpenLayers.LonLat(first.event_lon, first.event_lat).transform(
                new OpenLayers.Projection("EPSG:4326"),
                new OpenLayers.Projection("EPSG:900913")
            ), 
            10
        );
    }
}

function showMarker(marker) {
    if (!marker) return;

    const iconSize = new OpenLayers.Size(50, 50); 
    const iconOffset = new OpenLayers.Pixel(-25, -50); 
    const oldIcon = marker.icon;
    const newIcon = new OpenLayers.Icon(oldIcon.url, iconSize, iconOffset);

    marker.icon = newIcon;
    marker.draw();

    eventsMap.setCenter(marker.lonlat, 15);
}



// source: geeksForGeeks 
function distance(lat1, lon1 , lat2, lon2)
{
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;

    let a = Math.pow(Math.sin(dlat / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    let r = 6371;

    return c * r;
}


//apli sinartisi poy ipologizei tin apostasi gia kathe event se eftheia (palia version)
/*
function sortEventsByMyLocationFromDB() {
  if (userLat === null || userLon === null) {
    alert("No user location found.");
    return;
  }

  currentEvents.forEach(ev => {
    if (ev.event_lat && ev.event_lon) {
      ev.distance = distance(
        userLat,
        userLon,
        ev.event_lat,
        ev.event_lon
      );
    } else {
      ev.distance = Infinity;
    }
  });
  //kane sort to array apo to pio kontino sto pio makrino
  currentEvents.sort((a, b) => a.distance - b.distance);
  showEvents(currentEvents);
}*/


//sinartisi poy ipologizei tin apostasi gia kathe event me amaxi (nea version)
function sortEventsByMyLocationFromDB() {
  if (userLat === null || userLon === null) {
    alert("No user location found.");
    return;
  }


  const destinations = currentEvents
    .filter(ev => ev.event_lat && ev.event_lon)
    .map(ev => `${ev.event_lat},${ev.event_lon}`)
    .join(';');

  if (destinations.length === 0) {
    alert("No events with coordinates.");
    return;
  }


  const xhr = new XMLHttpRequest();
  
  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      currentEvents.forEach((ev, idx) => {
        ev.drivingDistance = data.distances[0][idx]; 
      });

      currentEvents.sort((a, b) => a.drivingDistance - b.drivingDistance);
      showEvents(currentEvents);
    } else {
      console.error("Trueway API error:", xhr.status, xhr.responseText);
      alert("Failed to get driving distances. Using a simpler method instead.");
      
      // edo evala kai tin palia version (apla mathimatika,xoris api se periptosi error sto api)
      currentEvents.forEach(ev => {
        if (ev.event_lat && ev.event_lon) {
          ev.distance = distance(
            userLat, 
            userLon,
            ev.event_lat, 
            ev.event_lon);
        } else {
          ev.distance = Infinity;
        }
      });
      currentEvents.sort((a, b) => a.distance - b.distance);
      showEvents(currentEvents);
    }
  };
  xhr.open("GET", `https://trueway-matrix.p.rapidapi.com/CalculateDrivingMatrix?origins=${userLat},${userLon}&destinations=${destinations}`);
  xhr.setRequestHeader("x-rapidapi-host", "trueway-matrix.p.rapidapi.com");
  xhr.setRequestHeader("x-rapidapi-key", "6ae44b8f35msh653c703d82ccc90p1ae04ajsnf99142cffd8e"); 
  xhr.send();
}

document.getElementById("locationSort").addEventListener("click", () => {
    
  sortEventsByMyLocationFromDB();
});