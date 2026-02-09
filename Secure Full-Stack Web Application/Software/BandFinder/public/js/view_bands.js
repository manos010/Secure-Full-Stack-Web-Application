//determine whether user is visitor or registered and logged in

let loggedUser = null;

function checkSession() {
    let isLoggedIn = false;
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        if (data.loggedIn) {
            isLoggedIn = true;
            loggedUser = data.user;
            console.log("Logged in user:", loggedUser);

        } else {
            isLoggedIn = false;
            console.log("Visitor mode");
        }
        showLoggedInStuff(isLoggedIn);    
    }
    };

    xhr.open("GET", "/session");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
}

function showLoggedInStuff(isLoggedIn){
    if(isLoggedIn){
        document.getElementById("writeReviewBtn").style.display = "block";
        document.getElementById("reviewSender").value = loggedUser.username;
        document.getElementById("bookBand").style.display = "block";
    }
}
let currentDate = new Date();
let unavailableDates = []; 

window.addEventListener("DOMContentLoaded", () => {
  loadGenres();
  loadCities();
  checkSession();
  renderCalendar();
  searchBands(event);

});

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

  xhr.open("GET", "/bands/genres");
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

  xhr.open("GET", "/bands/cities");
  xhr.send();
}

function searchBands(event) {
    event.preventDefault();
    const genre = document.getElementById("genreSelect").value;
    const city = document.getElementById("citySelect").value;
    const year = document.getElementById("founded_year").value;
    
    let url = `/bands/search`;
    

    const params = [];
    if (genre !== "") params.push(`genre=${genre}`);
    if (city !== "") params.push(`city=${city}`);
    if (year !== "") params.push(`founded_year=${year}`);

    if (params.length > 0) {
        url += "?" + params.join("&");
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
        const results = JSON.parse(xhr.responseText);
        console.log(results);
        showBands(results);

        }
    };
    xhr.open("GET",url);
        xhr.setRequestHeader("Accept", "application/json");

    xhr.send();
}
function showBands(bands) {
    const container = document.getElementById("bandsResults");
    container.innerHTML = ""; 

    
    container.style.marginTop = "20px";
    container.style.display = "flex";
    container.style.flexWrap = "wrap"; 
    container.style.gap = "10px";
    container.style.justifyContent = "center";  

    bands.forEach(band => {
        const card = document.createElement("div");
        card.style.border = "1px solid #000";
        card.style.borderRadius = "5px";
        card.style.padding = "10px";
        card.style.width = "200px"; 
        card.style.backgroundColor = "#f0f0f0";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.cursor = "pointer";

        const name = document.createElement("h4");
        name.textContent = band.band_name;
        card.appendChild(name);

        const genre = document.createElement("p");
        genre.textContent = "Genre: " + band.music_genres;
        card.appendChild(genre);

        const city = document.createElement("p");
        city.textContent = "City: " + band.band_city;
        card.appendChild(city);

        //click on specific band profile
        card.onclick = function() {
            //container.style = "none";
            /*document.getElementById("bandsResults").style.display = "none";
            document.getElementById("bandProfile").style.display = "block";*/
            //window.location.href = `band_info.html?band_id=${band.band_id}`;
            openBandProfile(band);
        };

        container.appendChild(card);
    });
}

let currentBand = null;
function openBandProfile(band){
    currentBand = band; 

    document.getElementById("bandsResults").style.display = "none";
    document.getElementById("reviewsContainer").style.display = "block";
    
    const profile = document.getElementById("bandProfile");
    profile.style.display = "block";

  
    document.getElementById("profileName").textContent = band.band_name;
    loadAverageBandRaing(band.band_name);
    
    document.getElementById("profileUsername").textContent = "Username: " + band.username;

    document.getElementById("profileEmail").textContent = "Email: " + band.email;

    document.getElementById("profileGenre").textContent = "Genre: " + band.music_genres;

    document.getElementById("profileDescription").textContent = "Description: " + band.band_description;

    document.getElementById("profileMembers").textContent = "Members: " + band.members_number;

    document.getElementById("profileYear").textContent = "Founded: " + band.foundedYear;

    document.getElementById("profileCity").textContent = "City: " + band.band_city;

    document.getElementById("profilePhone").textContent = "Phone: " + band.telephone;

    document.getElementById("profileWebpage").textContent = "Webpage: " + band.webpage;

    loadBandReviews(band.band_name);
    document.getElementById("band_name_modal").value = band.band_name;
    loadBandAvailability(band);
    loadBandEvents(band.band_id);

        logBandVisit(band.band_id);




}


function loadAverageBandRaing(band_name){
    const xhr = new XMLHttpRequest();

    xhr.onload = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            const data = JSON.parse(xhr.responseText);
            const rating = document.getElementById("profileRating");

            if(data.average === null){
                rating.textContent = "Rating: No reviews yet.";
            }
            else{
                rating.innerHTML = `Rating: ${data.average} / 5.0 (${data.count} reviews</a>)`;
            }

        }
    }

    xhr.open("GET", `/bands/${band_name}/rating`);
    xhr.send();
}

function loadBandReviews(band_name){
    const xhr = new XMLHttpRequest();
    xhr.onload = function(){
        const container = document.getElementById("reviewsList");
        container.innerHTML = ""; 
        if(xhr.readyState === 4 && xhr.status === 200){
            const reviews = JSON.parse(xhr.responseText);
            showReviews(reviews);
        }
    };

    xhr.open("GET", `/ubAPI/reviews/${band_name}`);
    xhr.send();
}


function showReviews(reviews){
    const container = document.getElementById("reviewsList");
    container.innerHTML = ""; 

  reviews.forEach(review => {
    const card = document.createElement("div");
    card.className = "review-card";

    const sender = document.createElement("h4");
    sender.textContent = review.sender;

    const rating = document.createElement("div");
    rating.className = "rating";
    rating.textContent = `Rating: ${review.rating} / 5`;

    const text = document.createElement("p");
    text.textContent = review.review;
  
    card.appendChild(sender);
    card.appendChild(rating);
    card.appendChild(text);

    container.appendChild(card);
  });
}
function openReviewModal() {
  document.getElementById("reviewModal").style.display = "flex";
}
function closeReviewModal() {
  document.getElementById("reviewModal").style.display = "none";
}
/*
function postReview(event) {
    event.preventDefault();
    const form = document.getElementById("reviewForm");

    const data = {
        band_name: document.getElementById("band_name_modal").value,
        sender: document.getElementById("reviewSender").value,
        review: document.getElementById("reviewText").value,
        rating: parseInt(document.getElementById("reviewRating").value)
    };

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.readyState === 4){
            form.reset();
            closeReviewModal();
        }
    };

    xhr.open("POST", "/ubAPI/review");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}*/

/*post review after llm check for hatespeech *version*/
function postReview(event) {
    event.preventDefault();
    const form = document.getElementById("reviewForm");

    const data = {
        band_name: document.getElementById("band_name_modal").value,
        sender: document.getElementById("reviewSender").value,
        review: document.getElementById("reviewText").value,
        rating: parseInt(document.getElementById("reviewRating").value)
    };

    
    const xhrHate = new XMLHttpRequest();
    xhrHate.onload = function () {
        if (xhrHate.readyState === 4 && xhrHate.status === 200) {
            const result = JSON.parse(xhrHate.responseText);

            if (result.isHate) {
                console.log("hate detected");
                alert("Your review contains inappropriate language and was not submitted.");
                return; 
            }

          
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    form.reset();
                    closeReviewModal();
                }
            };

            xhr.open("POST", "/ubAPI/review");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(data));
        }
    };

    xhrHate.open("POST", "/hateCheck");
    xhrHate.setRequestHeader("Content-Type", "application/json");
    xhrHate.send(JSON.stringify({ text: data.review }));
}

function openBookingModal(band, daydate) {
  document.getElementById("bookingModal").style.display = "flex";

  console.log(band.band_id) //pros to paron einai to day
  document.getElementById("eventDate").value = daydate;
  /*<input type="hidden" id="bookingBandId">
      <input type="hidden" id="bookingPrice">
      <input type="hidden" id="bookingUserId">*/
  document.getElementById("bookingBandId").value = band.band_id;


  
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}

document.getElementById("bookBand").onclick = () => {
  /*openBookingModal(
    document.getElementById("profileName").textContent
  );*/
  //me to poy patiso book now, fortose apo tin vasi tin diathesimothta bandas
  document.getElementById("calendar-container").style.display = "block";
  //loadBandAvailability(band_name);
};



function renderCalendar(band) {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("calendarTitle");

  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  title.textContent = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  weekdays.forEach(day => {
    const div = document.createElement("div");
    div.className = "weekday";
    div.textContent = day;
    grid.appendChild(div);
  });

  let firstDay = new Date(year, month, 1).getDay();
   firstDay = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // empty cells gia paradeigma ean o dekembris ksekinaei trith, bazeis ena keno thn deftera
  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    //day blocks
    const cell = document.createElement("div");
    cell.classList.add("day");
    cell.textContent = day;

    const today = new Date();
    today.setHours(0,0,0,0); 

  const cellDate = new Date(year, month, day);
    if (cellDate < today) {
            cell.classList.add("unavailable");
        }
    else if (unavailableDates.includes(dateStr)) {
        cell.classList.add("unavailable");
        console.log("UNAVAILABLE");
        } 
    else {
        cell.classList.add("free");
        cell.onclick = () => openBookingModal(band, dateStr);
   // document.getElementById("profileName").textContent
  
    }

    grid.appendChild(cell);
  }
}
 
//move through months to book a band -> button 
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentBand);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentBand);
});


function loadBandAvailability(band){
    const xhr = new XMLHttpRequest();

    xhr.onload = function (){
        if(xhr.status === 200){
             unavailableDates = JSON.parse(xhr.responseText)
                .map(d => d.split("T")[0]);
            console.log(unavailableDates);
            renderCalendar(band);
        }
    };

    xhr.open("GET", `/bands/${band.band_id}/availability`);
    xhr.send();

}

function submitPrivateEvent(event, currentBand){

    event.preventDefault();
    const form = document.getElementById("privateEventForm");
    const eventType = form.eventType.value;
    let price = 0;
    switch(eventType){
        case "Baptism":
            price = 700;
            break;
        case "Wedding":
            price = 1000;
            break;
        case "Party":
            price = 500
            break;
        default:
            price = 0;
    }

     const data = {
        band_id: document.getElementById("bookingBandId").value,
        user_id: loggedUser.id,
        price: price,
        event_type: eventType,
        event_datetime: form.eventDate.value,
        event_description: form.eventDescription.value,
        event_city: form.eventCity.value,
        event_address: form.eventAddress.value,
        event_lat: form.eventLat.value,
        event_lon: form.eventLon.value,
        status: "pending",
        band_decision: "pending"
    };
        console.log("Private event data:", data);
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("Booking request submitted!");
            form.reset();
            closeBookingModal();
        } else {
            alert("Failed to submit booking: " + xhr.responseText);
        }
    };

    xhr.open("POST", "/band/privateEvents"); 
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));



}


function loadBandEvents(bandId) {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      console.log(data);
      splitAndShowEvents(data.publicEvents, data.privateEvents);
    }
  };

  xhr.open("GET", `/bands/${bandId}/events`);
  xhr.send();
}
function splitAndShowEvents(publicEvents, privateEvents) {
  document.getElementById("events-container").style.display = 'block';
  const upcomingDiv = document.getElementById("upcomingEvents");
  const pastDiv = document.getElementById("pastEvents");

  upcomingDiv.innerHTML = "<h3>Upcoming Events</h3>";
  pastDiv.innerHTML = "<h3>Past Events</h3>";

  const now = new Date();

  // PUBLIC EVENTS
  publicEvents.forEach(ev => {
    const evDate = new Date(ev.event_datetime);
    const card = createEventCard({
      type: ev.event_type,
      city: ev.event_city,
      address: ev.event_address,
      price: ev.participants_price,
      date: evDate,
      isPrivate: false
    });

    if (evDate >= now) {
      upcomingDiv.appendChild(card);
    } else {
      pastDiv.appendChild(card);
    }
  });

  // PRIVATE EVENTS
  privateEvents.forEach(ev => {
    const evDate = new Date(ev.event_datetime);
    const card = createEventCard({
      type: "Private Event",
      city: null,
      address: null,
      price: null,
      date: evDate,
      isPrivate: true
    });



    if (evDate >= now) {
      upcomingDiv.appendChild(card);
    } else {
      pastDiv.appendChild(card);
    }
  });
}
function createEventCard({ type, city, address,price, date, isPrivate }) {
  const div = document.createElement("div");
  div.className = "event-card";

  div.innerHTML = `
    <p><b>Type:</b> ${type}</p>
    ${city ? `<p><b>City:</b> ${city}</p>` : ""}
    ${address ? `<p><b>address:</b> ${address}</p>` : ""}
    ${price ? `<p><b>price:</b> ${price}</p>` : ""}
    <p><b>Date:</b> ${date.toLocaleDateString()}</p>
  `;

  return div;
}

//BONUS visist
function logBandVisit(band_id) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if(xhr.status === 200){
            console.log(`Visit recorded for band ID ${band_id}`);
        } else {
            console.error(`Failed to log visit for band ID ${band_id}`);
        }
    };

    const payload = {
        user_id: loggedUser ? loggedUser.id : null // NULL if visitor
    };

    xhr.open("POST", `/band/${band_id}/visit`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(payload));
}

function goBack() {
    document.getElementById("bandProfile").style.display = "none";
    document.getElementById("bandsResults").style.display = "flex";
    document.querySelector(".filter-wrapper").style.display = "flex";
    document.getElementById("reviewsContainer").style.display = "none";
    document.getElementById("calendar-container").style.display = "none";
    document.getElementById("events-container").style.display = "none";
    
}
